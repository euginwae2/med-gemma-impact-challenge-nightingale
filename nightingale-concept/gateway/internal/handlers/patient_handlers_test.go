package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"gateway/pkg/jwt"
)

// MockRedisClient is a mock Redis client for testing
type MockRedisClient struct {
	mock.Mock
}

func (m *MockRedisClient) Get(key string, dest interface{}) error {
	args := m.Called(key, dest)
	return args.Error(0)
}

func (m *MockRedisClient) Set(key string, value interface{}, expiration time.Duration) error {
	args := m.Called(key, value, expiration)
	return args.Error(0)
}

func (m *MockRedisClient) Delete(key string) error {
	args := m.Called(key)
	return args.Error(0)
}

func (m *MockRedisClient) DeleteByPrefix(prefix string) (int64, error) {
	args := m.Called(prefix)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockRedisClient) Close() error {
	args := m.Called()
	return args.Error(0)
}

func TestGetPatientByID(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	
	mockRedis := new(MockRedisClient)
	mockJWT := &jwt.Manager{}
	
	handler := NewPatientHandler("http://backend:8081", mockRedis, mockJWT)
	
	// Test case 1: Patient found in cache
	t.Run("Cache hit", func(t *testing.T) {
		expectedPatient := Patient{
			ID:        "123",
			FirstName: "John",
			LastName:  "Doe",
			Email:     "john@example.com",
		}
		
		// Mock cache hit
		mockRedis.On("Get", "patient:123", mock.Anything).Run(func(args mock.Arguments) {
			dest := args.Get(1).(*Patient)
			*dest = expectedPatient
		}).Return(nil)
		
		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/patients/123", nil)
		c.Params = gin.Params{{Key: "id", Value: "123"}}
		
		// Set user in context (simulating auth middleware)
		c.Set("user_id", "test-user")
		c.Set("user_role", "patient")
		
		// Call handler
		handler.GetPatientByID()(c)
		
		// Verify
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response Patient
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, expectedPatient.ID, response.ID)
		assert.Equal(t, expectedPatient.FirstName, response.FirstName)
		
		mockRedis.AssertExpectations(t)
	})
	
	// Test case 2: Patient not in cache (requires backend call)
	t.Run("Cache miss", func(t *testing.T) {
		// Mock cache miss
		mockRedis.On("Get", "patient:456", mock.Anything).Return(
			assert.AnError,
		)
		
		// Mock cache set for future requests
		mockRedis.On("Set", "patient:456", mock.Anything, 5*time.Minute).Return(nil)
		
		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/patients/456", nil)
		c.Params = gin.Params{{Key: "id", Value: "456"}}
		c.Set("user_id", "test-user")
		c.Set("user_role", "doctor")
		
		// Note: In a full test, we'd mock the HTTP client to simulate backend response
		// For now, we'll just test the cache logic
		handler.GetPatientByID()(c)
		
		// Since we don't have a real backend, expect 502 Bad Gateway
		assert.Equal(t, http.StatusBadGateway, w.Code)
		
		mockRedis.AssertExpectations(t)
	})
	
	// Test case 3: Invalid patient ID
	t.Run("Missing patient ID", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/patients/", nil)
		c.Params = gin.Params{}
		c.Set("user_id", "test-user")
		
		handler.GetPatientByID()(c)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestCreatePatient(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	mockRedis := new(MockRedisClient)
	mockJWT := &jwt.Manager{}
	
	handler := NewPatientHandler("http://backend:8081", mockRedis, mockJWT)
	
	// Test case: Valid patient creation
	t.Run("Valid patient creation", func(t *testing.T) {
		patientRequest := PatientCreateRequest{
			Patient: Patient{
				FirstName:   "Jane",
				LastName:    "Smith",
				DateOfBirth: "1990-01-01",
				Gender:      "female",
				Email:       "jane@example.com",
				Phone:       "+1234567890",
				Address: Address{
					Street:     "123 Main St",
					City:       "Anytown",
					State:      "CA",
					PostalCode: "12345",
					Country:    "USA",
				},
			},
		}
		
		// Mock cache clearing
		mockRedis.On("DeleteByPrefix", "patients:list:").Return(int64(1), nil)
		
		requestBody, _ := json.Marshal(patientRequest)
		
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("POST", "/patients", bytes.NewBuffer(requestBody))
		c.Request.Header.Set("Content-Type", "application/json")
		c.Set("user_id", "test-user-123")
		
		handler.CreatePatient()(c)
		
		// Expect Bad Gateway since backend is mocked
		assert.Equal(t, http.StatusBadGateway, w.Code)
		
		mockRedis.AssertExpectations(t)
	})
	
	// Test case: Invalid request body
	t.Run("Invalid request body", func(t *testing.T) {
		invalidBody := `{"first_name": "J"}`
		
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("POST", "/patients", bytes.NewBufferString(invalidBody))
		c.Request.Header.Set("Content-Type", "application/json")
		c.Set("user_id", "test-user")
		
		handler.CreatePatient()(c)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	
	// Test case: Missing authentication
	t.Run("Unauthorized", func(t *testing.T) {
		patientRequest := PatientCreateRequest{
			Patient: Patient{
				FirstName: "Test",
				LastName:  "User",
				DateOfBirth: "2000-01-01",
				Gender:    "male",
				Email:     "test@example.com",
				Phone:     "+1234567890",
				Address: Address{
					Street:     "456 Oak St",
					City:       "Testville",
					State:      "TX",
					PostalCode: "54321",
					Country:    "USA",
				},
			},
		}
		
		requestBody, _ := json.Marshal(patientRequest)
		
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("POST", "/patients", bytes.NewBuffer(requestBody))
		c.Request.Header.Set("Content-Type", "application/json")
		// Note: Not setting user_id in context
		
		handler.CreatePatient()(c)
		
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestSearchPatients(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	mockRedis := new(MockRedisClient)
	mockJWT := &jwt.Manager{}
	
	handler := NewPatientHandler("http://backend:8081", mockRedis, mockJWT)
	
	// Test case: Valid search with cache hit
	t.Run("Valid search with cache", func(t *testing.T) {
		expectedResults := PatientListResponse{
			Patients: []Patient{
				{ID: "1", FirstName: "John", LastName: "Doe"},
				{ID: "2", FirstName: "Jane", LastName: "Doe"},
			},
			Total:      2,
			Page:       1,
			PerPage:    20,
			TotalPages: 1,
		}
		
		// Mock cache hit
		mockRedis.On("Get", "patients:search:doe:page:1:per_page:20", mock.Anything).Run(func(args mock.Arguments) {
			dest := args.Get(1).(*PatientListResponse)
			*dest = expectedResults
		}).Return(nil)
		
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/patients/search?q=doe", nil)
		c.Set("user_id", "test-user")
		
		handler.SearchPatients()(c)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response PatientListResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, 2, len(response.Patients))
		assert.Equal(t, int64(2), response.Total)
		
		mockRedis.AssertExpectations(t)
	})
	
	// Test case: Search query too short
	t.Run("Query too short", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/patients/search?q=a", nil)
		c.Set("user_id", "test-user")
		
		handler.SearchPatients()(c)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	
	// Test case: Missing query parameter
	t.Run("Missing query", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/patients/search", nil)
		c.Set("user_id", "test-user")
		
		handler.SearchPatients()(c)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}