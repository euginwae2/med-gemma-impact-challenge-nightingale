package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"gateway/internal/cache"
	"gateway/pkg/jwt"
)

// var validate = validator.New()

// Patient represents a patient in the system
type Patient struct {
	ID          string    `json:"id,omitempty"`
	UserID      string    `json:"user_id,omitempty"`
	FirstName   string    `json:"first_name" validate:"required,min=2,max=50"`
	LastName    string    `json:"last_name" validate:"required,min=2,max=50"`
	DateOfBirth string    `json:"date_of_birth" validate:"required,datetime=2006-01-02"`
	Gender      string    `json:"gender" validate:"required,oneof=male female other"`
	Email       string    `json:"email" validate:"required,email"`
	Phone       string    `json:"phone" validate:"required,e164"`
	Address     Address   `json:"address" validate:"required"`
	EmergencyContact *EmergencyContact `json:"emergency_contact,omitempty"`
	Insurance   *InsuranceInfo `json:"insurance,omitempty"`
	MedicalInfo *MedicalInfo   `json:"medical_info,omitempty"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

// Address represents a physical address
type Address struct {
	Street     string `json:"street" validate:"required"`
	City       string `json:"city" validate:"required"`
	State      string `json:"state" validate:"required"`
	PostalCode string `json:"postal_code" validate:"required"`
	Country    string `json:"country" validate:"required"`
}

// EmergencyContact represents emergency contact information
type EmergencyContact struct {
	Name         string `json:"name" validate:"required"`
	Relationship string `json:"relationship" validate:"required"`
	Phone        string `json:"phone" validate:"required,e164"`
	Email        string `json:"email,omitempty" validate:"omitempty,email"`
}

// InsuranceInfo represents insurance information
type InsuranceInfo struct {
	Provider       string `json:"provider" validate:"required"`
	PolicyNumber   string `json:"policy_number" validate:"required"`
	GroupNumber    string `json:"group_number,omitempty"`
	EffectiveDate  string `json:"effective_date" validate:"datetime=2006-01-02"`
	ExpirationDate string `json:"expiration_date" validate:"datetime=2006-01-02"`
}

// MedicalInfo represents basic medical information
type MedicalInfo struct {
	BloodType      string   `json:"blood_type,omitempty" validate:"omitempty,oneof=A+ A- B+ B- AB+ AB- O+ O-"`
	Allergies      []string `json:"allergies,omitempty"`
	CurrentMedications []string `json:"current_medications,omitempty"`
	Conditions     []string `json:"conditions,omitempty"`
}

// PatientListResponse represents a paginated list of patients
type PatientListResponse struct {
	Patients   []Patient `json:"patients"`
	Total      int64     `json:"total"`
	Page       int       `json:"page"`
	PerPage    int       `json:"per_page"`
	TotalPages int       `json:"total_pages"`
}

// PatientCreateRequest represents a patient creation request
type PatientCreateRequest struct {
	Patient
}

// PatientUpdateRequest represents a patient update request
type PatientUpdateRequest struct {
	FirstName   *string            `json:"first_name,omitempty" validate:"omitempty,min=2,max=50"`
	LastName    *string            `json:"last_name,omitempty" validate:"omitempty,min=2,max=50"`
	DateOfBirth *string            `json:"date_of_birth,omitempty" validate:"omitempty,datetime=2006-01-02"`
	Gender      *string            `json:"gender,omitempty" validate:"omitempty,oneof=male female other"`
	Email       *string            `json:"email,omitempty" validate:"omitempty,email"`
	Phone       *string            `json:"phone,omitempty" validate:"omitempty,e164"`
	Address     *Address           `json:"address,omitempty"`
	EmergencyContact *EmergencyContact `json:"emergency_contact,omitempty"`
	Insurance   *InsuranceInfo     `json:"insurance,omitempty"`
	MedicalInfo *MedicalInfo       `json:"medical_info,omitempty"`
}

// PatientSearchRequest represents a patient search request
type PatientSearchRequest struct {
	Query     string `json:"query" form:"query"`
	FirstName string `json:"first_name" form:"first_name"`
	LastName  string `json:"last_name" form:"last_name"`
	Email     string `json:"email" form:"email"`
	Phone     string `json:"phone" form:"phone"`
	Page      int    `json:"page" form:"page,default=1"`
	PerPage   int    `json:"per_page" form:"per_page,default=20"`
	SortBy    string `json:"sort_by" form:"sort_by,default=created_at"`
	SortOrder string `json:"sort_order" form:"sort_order,default=desc"`
}

// PatientHandler handles patient-related HTTP requests
type PatientHandler struct {
	backendURL  string
	httpClient  *http.Client
	cache       *cache.RedisClient
	jwtManager  *jwt.Manager
	logger      *logrus.Logger
}

// NewPatientHandler creates a new PatientHandler
func NewPatientHandler(backendURL string, redisClient *cache.RedisClient, jwtManager *jwt.Manager) *PatientHandler {
	return &PatientHandler{
		backendURL: backendURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 20,
				IdleConnTimeout:     90 * time.Second,
			},
		},
		cache:      redisClient,
		jwtManager: jwtManager,
		logger:     logrus.New(),
	}
}

// GetPatients handles GET /api/v1/patients
func (h *PatientHandler) GetPatients() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		// Extract query parameters
		var searchReq PatientSearchRequest
		if err := c.ShouldBindQuery(&searchReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid query parameters",
				"details": err.Error(),
			})
			return
		}

		// Validate query parameters
		if searchReq.Page < 1 {
			searchReq.Page = 1
		}
		if searchReq.PerPage < 1 || searchReq.PerPage > 100 {
			searchReq.PerPage = 20
		}
		if searchReq.SortOrder != "asc" && searchReq.SortOrder != "desc" {
			searchReq.SortOrder = "desc"
		}

		// Generate cache key
		cacheKey := fmt.Sprintf("patients:list:page:%d:per_page:%d:sort:%s:%s",
			searchReq.Page, searchReq.PerPage, searchReq.SortBy, searchReq.SortOrder)
		
		// Add search terms to cache key if present
		if searchReq.Query != "" {
			cacheKey += ":query:" + searchReq.Query
		}
		if searchReq.FirstName != "" {
			cacheKey += ":first_name:" + searchReq.FirstName
		}
		if searchReq.LastName != "" {
			cacheKey += ":last_name:" + searchReq.LastName
		}

		// Check cache first
		var cachedResponse PatientListResponse
		if err := h.cache.Get(cacheKey, &cachedResponse); err == nil {
			h.logger.WithFields(logrus.Fields{
				"cache_hit": true,
				"key":       cacheKey,
			}).Debug("Cache hit for patient list")
			
			c.JSON(http.StatusOK, cachedResponse)
			return
		}

		// Build backend URL with query parameters
		backendURL := h.backendURL + "/patients"
		req, err := http.NewRequest("GET", backendURL, nil)
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Add query parameters
		q := req.URL.Query()
		if searchReq.Query != "" {
			q.Add("query", searchReq.Query)
		}
		if searchReq.FirstName != "" {
			q.Add("first_name", searchReq.FirstName)
		}
		if searchReq.LastName != "" {
			q.Add("last_name", searchReq.LastName)
		}
		if searchReq.Email != "" {
			q.Add("email", searchReq.Email)
		}
		if searchReq.Phone != "" {
			q.Add("phone", searchReq.Phone)
		}
		q.Add("page", strconv.Itoa(searchReq.Page))
		q.Add("per_page", strconv.Itoa(searchReq.PerPage))
		q.Add("sort_by", searchReq.SortBy)
		q.Add("sort_order", searchReq.SortOrder)
		req.URL.RawQuery = q.Encode()

		// Add authorization header
		h.addAuthorizationHeader(c, req)

		// Forward request to backend
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Parse response
		var patientList PatientListResponse
		if err := json.Unmarshal(body, &patientList); err != nil {
			h.logger.WithError(err).Error("Failed to unmarshal response")
			c.JSON(resp.StatusCode, gin.H{
				"error": "Invalid response format",
				"body":  string(body),
			})
			return
		}

		// Cache the response for 1 minute
		if resp.StatusCode == http.StatusOK {
			h.cache.Set(cacheKey, patientList, 1*time.Minute)
			h.logger.WithField("key", cacheKey).Debug("Cached patient list")
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":     "GET",
			"endpoint":   "/patients",
			"status":     resp.StatusCode,
			"latency":    latency.String(),
			"page":       searchReq.Page,
			"per_page":   searchReq.PerPage,
			"total":      patientList.Total,
			"cache_hit":  false,
		}).Info("Patient list request completed")

		// Return response
		c.JSON(resp.StatusCode, patientList)
	}
}

// GetPatientByID handles GET /api/v1/patients/:id
func (h *PatientHandler) GetPatientByID() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		patientID := c.Param("id")
		if patientID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Patient ID is required",
			})
			return
		}

		// Check cache first
		cacheKey := "patient:" + patientID
		var cachedPatient Patient
		if err := h.cache.Get(cacheKey, &cachedPatient); err == nil {
			h.logger.WithFields(logrus.Fields{
				"cache_hit": true,
				"key":       cacheKey,
			}).Debug("Cache hit for patient")
			
			c.JSON(http.StatusOK, cachedPatient)
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients/" + patientID
		req, err := http.NewRequest("GET", backendURL, nil)
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Add authorization header
		h.addAuthorizationHeader(c, req)

		// Forward request to backend
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Return response
		if resp.StatusCode != http.StatusOK {
			c.JSON(resp.StatusCode, gin.H{
				"error": "Failed to fetch patient",
				"body":  string(body),
			})
			return
		}

		// Parse response
		var patient Patient
		if err := json.Unmarshal(body, &patient); err != nil {
			h.logger.WithError(err).Error("Failed to unmarshal response")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid response format",
				"body":  string(body),
			})
			return
		}

		// Cache the patient for 5 minutes
		h.cache.Set(cacheKey, patient, 5*time.Minute)

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":   "GET",
			"endpoint": "/patients/" + patientID,
			"status":   resp.StatusCode,
			"latency":  latency.String(),
			"cache_hit": false,
		}).Info("Patient fetch request completed")

		c.JSON(http.StatusOK, patient)
	}
}

// CreatePatient handles POST /api/v1/patients
func (h *PatientHandler) CreatePatient() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
			})
			return
		}

		var req PatientCreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid request body",
				"details": err.Error(),
			})
			return
		}

		// Validate request
		if err := validate.Struct(req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Validation failed",
				"details": err.Error(),
			})
			return
		}

		// Set user ID from context
		req.UserID = userID.(string)

		// Marshal request body
		jsonBody, err := json.Marshal(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to marshal request body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to prepare request",
			})
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients"
		reqBackend, err := http.NewRequest("POST", backendURL, bytes.NewBuffer(jsonBody))
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}
		reqBackend.Header.Set("Content-Type", "application/json")

		// Add authorization header
		h.addAuthorizationHeader(c, reqBackend)

		// Forward request to backend
		resp, err := h.httpClient.Do(reqBackend)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// If successful, clear patient list cache
		if resp.StatusCode == http.StatusCreated {
			h.clearPatientListCache()
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":   "POST",
			"endpoint": "/patients",
			"status":   resp.StatusCode,
			"latency":  latency.String(),
			"user_id":  userID,
		}).Info("Patient creation request completed")

		// Return response
		c.Data(resp.StatusCode, "application/json", body)
	}
}

// UpdatePatient handles PUT /api/v1/patients/:id
func (h *PatientHandler) UpdatePatient() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		patientID := c.Param("id")
		if patientID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Patient ID is required",
			})
			return
		}

		var req PatientUpdateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid request body",
				"details": err.Error(),
			})
			return
		}

		// Validate request
		if err := validate.Struct(req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Validation failed",
				"details": err.Error(),
			})
			return
		}

		// Check if at least one field is being updated
		if isEmptyUpdate(req) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No fields provided for update",
			})
			return
		}

		// Marshal request body
		jsonBody, err := json.Marshal(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to marshal request body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to prepare request",
			})
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients/" + patientID
		reqBackend, err := http.NewRequest("PUT", backendURL, bytes.NewBuffer(jsonBody))
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}
		reqBackend.Header.Set("Content-Type", "application/json")

		// Add authorization header
		h.addAuthorizationHeader(c, reqBackend)

		// Forward request to backend
		resp, err := h.httpClient.Do(reqBackend)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Clear cache for this patient
		if resp.StatusCode == http.StatusOK {
			h.cache.Delete("patient:" + patientID)
			h.clearPatientListCache()
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":     "PUT",
			"endpoint":   "/patients/" + patientID,
			"status":     resp.StatusCode,
			"latency":    latency.String(),
			"patient_id": patientID,
		}).Info("Patient update request completed")

		// Return response
		c.Data(resp.StatusCode, "application/json", body)
	}
}

// DeletePatient handles DELETE /api/v1/patients/:id
func (h *PatientHandler) DeletePatient() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		patientID := c.Param("id")
		if patientID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Patient ID is required",
			})
			return
		}

		// Check if user is authorized to delete (admin or owner)
		userRole, exists := c.Get("user_role")
		if !exists || (userRole != "admin" && userRole != "doctor") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions to delete patient",
			})
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients/" + patientID
		req, err := http.NewRequest("DELETE", backendURL, nil)
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Add authorization header
		h.addAuthorizationHeader(c, req)

		// Forward request to backend
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Clear cache for this patient
		if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusNoContent {
			h.cache.Delete("patient:" + patientID)
			h.clearPatientListCache()
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":     "DELETE",
			"endpoint":   "/patients/" + patientID,
			"status":     resp.StatusCode,
			"latency":    latency.String(),
			"patient_id": patientID,
		}).Info("Patient deletion request completed")

		// Return response
		c.Data(resp.StatusCode, "application/json", body)
	}
}

// GetPatientRecords handles GET /api/v1/patients/:id/records
func (h *PatientHandler) GetPatientRecords() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		patientID := c.Param("id")
		if patientID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Patient ID is required",
			})
			return
		}

		// Check if user is authorized to view records
		userID, exists := c.Get("user_id")
		userRole, roleExists := c.Get("user_role")
		
		// Only admin, doctor, or the patient themselves can view records
		if !exists || (!roleExists && userID != patientID && userRole != "admin" && userRole != "doctor") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions to view patient records",
			})
			return
		}

		// Extract query parameters
		recordType := c.Query("type")
		startDate := c.Query("start_date")
		endDate := c.Query("end_date")
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

		// Generate cache key
		cacheKey := fmt.Sprintf("patient:records:%s:type:%s:start:%s:end:%s:page:%d:per_page:%d",
			patientID, recordType, startDate, endDate, page, perPage)

		// Check cache first
		var cachedRecords []map[string]interface{}
		if err := h.cache.Get(cacheKey, &cachedRecords); err == nil {
			h.logger.WithFields(logrus.Fields{
				"cache_hit": true,
				"key":       cacheKey,
			}).Debug("Cache hit for patient records")
			
			c.JSON(http.StatusOK, gin.H{
				"records": cachedRecords,
				"page":    page,
				"per_page": perPage,
				"patient_id": patientID,
			})
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients/" + patientID + "/records"
		req, err := http.NewRequest("GET", backendURL, nil)
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Add query parameters
		q := req.URL.Query()
		if recordType != "" {
			q.Add("type", recordType)
		}
		if startDate != "" {
			q.Add("start_date", startDate)
		}
		if endDate != "" {
			q.Add("end_date", endDate)
		}
		q.Add("page", strconv.Itoa(page))
		q.Add("per_page", strconv.Itoa(perPage))
		req.URL.RawQuery = q.Encode()

		// Add authorization header
		h.addAuthorizationHeader(c, req)

		// Forward request to backend
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Parse response
		var recordsResponse struct {
			Records []map[string]interface{} `json:"records"`
			Total   int64                    `json:"total"`
			Page    int                      `json:"page"`
			PerPage int                      `json:"per_page"`
		}
		
		if err := json.Unmarshal(body, &recordsResponse); err != nil {
			h.logger.WithError(err).Error("Failed to unmarshal response")
			c.JSON(resp.StatusCode, gin.H{
				"error": "Invalid response format",
				"body":  string(body),
			})
			return
		}

		// Cache the response for 2 minutes
		if resp.StatusCode == http.StatusOK {
			h.cache.Set(cacheKey, recordsResponse.Records, 2*time.Minute)
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":     "GET",
			"endpoint":   "/patients/" + patientID + "/records",
			"status":     resp.StatusCode,
			"latency":    latency.String(),
			"patient_id": patientID,
			"record_count": len(recordsResponse.Records),
			"cache_hit":  false,
		}).Info("Patient records request completed")

		c.JSON(resp.StatusCode, recordsResponse)
	}
}

// SearchPatients handles GET /api/v1/patients/search
func (h *PatientHandler) SearchPatients() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		query := c.Query("q")
		if query == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Search query is required",
			})
			return
		}

		// Validate query length
		if len(query) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Search query must be at least 2 characters",
			})
			return
		}

		// Extract pagination parameters
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

		// Generate cache key
		cacheKey := fmt.Sprintf("patients:search:%s:page:%d:per_page:%d",
			strings.ToLower(query), page, perPage)

		// Check cache first
		var cachedResults PatientListResponse
		if err := h.cache.Get(cacheKey, &cachedResults); err == nil {
			h.logger.WithFields(logrus.Fields{
				"cache_hit": true,
				"key":       cacheKey,
			}).Debug("Cache hit for patient search")
			
			c.JSON(http.StatusOK, cachedResults)
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients/search"
		req, err := http.NewRequest("GET", backendURL, nil)
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Add query parameters
		q := req.URL.Query()
		q.Add("q", query)
		q.Add("page", strconv.Itoa(page))
		q.Add("per_page", strconv.Itoa(perPage))
		req.URL.RawQuery = q.Encode()

		// Add authorization header
		h.addAuthorizationHeader(c, req)

		// Forward request to backend
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Parse response
		var searchResults PatientListResponse
		if err := json.Unmarshal(body, &searchResults); err != nil {
			h.logger.WithError(err).Error("Failed to unmarshal response")
			c.JSON(resp.StatusCode, gin.H{
				"error": "Invalid response format",
				"body":  string(body),
			})
			return
		}

		// Cache the response for 1 minute (search results are time-sensitive)
		if resp.StatusCode == http.StatusOK {
			h.cache.Set(cacheKey, searchResults, 1*time.Minute)
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":    "GET",
			"endpoint":  "/patients/search",
			"status":    resp.StatusCode,
			"latency":   latency.String(),
			"query":     query,
			"results":   searchResults.Total,
			"cache_hit": false,
		}).Info("Patient search request completed")

		c.JSON(resp.StatusCode, searchResults)
	}
}

// GetPatientTimeline handles GET /api/v1/patients/:id/timeline
func (h *PatientHandler) GetPatientTimeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		patientID := c.Param("id")
		if patientID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Patient ID is required",
			})
			return
		}

		// Check permissions
		userID, exists := c.Get("user_id")
		userRole, roleExists := c.Get("user_role")
		
		if !exists || (!roleExists && userID != patientID && userRole != "admin" && userRole != "doctor") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions to view patient timeline",
			})
			return
		}

		// Extract query parameters
		startDate := c.Query("start_date")
		endDate := c.Query("end_date")
		category := c.Query("category")
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

		// Generate cache key
		cacheKey := fmt.Sprintf("patient:timeline:%s:start:%s:end:%s:category:%s:limit:%d",
			patientID, startDate, endDate, category, limit)

		// Check cache first
		var cachedTimeline []map[string]interface{}
		if err := h.cache.Get(cacheKey, &cachedTimeline); err == nil {
			h.logger.WithFields(logrus.Fields{
				"cache_hit": true,
				"key":       cacheKey,
			}).Debug("Cache hit for patient timeline")
			
			c.JSON(http.StatusOK, gin.H{
				"timeline": cachedTimeline,
				"patient_id": patientID,
				"count":     len(cachedTimeline),
			})
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients/" + patientID + "/timeline"
		req, err := http.NewRequest("GET", backendURL, nil)
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Add query parameters
		q := req.URL.Query()
		if startDate != "" {
			q.Add("start_date", startDate)
		}
		if endDate != "" {
			q.Add("end_date", endDate)
		}
		if category != "" {
			q.Add("category", category)
		}
		q.Add("limit", strconv.Itoa(limit))
		req.URL.RawQuery = q.Encode()

		// Add authorization header
		h.addAuthorizationHeader(c, req)

		// Forward request to backend
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Parse response
		var timelineResponse struct {
			Timeline []map[string]interface{} `json:"timeline"`
			Count    int                      `json:"count"`
		}
		
		if err := json.Unmarshal(body, &timelineResponse); err != nil {
			h.logger.WithError(err).Error("Failed to unmarshal response")
			c.JSON(resp.StatusCode, gin.H{
				"error": "Invalid response format",
				"body":  string(body),
			})
			return
		}

		// Cache the response for 5 minutes
		if resp.StatusCode == http.StatusOK {
			h.cache.Set(cacheKey, timelineResponse.Timeline, 5*time.Minute)
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":     "GET",
			"endpoint":   "/patients/" + patientID + "/timeline",
			"status":     resp.StatusCode,
			"latency":    latency.String(),
			"patient_id": patientID,
			"item_count": timelineResponse.Count,
			"cache_hit":  false,
		}).Info("Patient timeline request completed")

		c.JSON(resp.StatusCode, timelineResponse)
	}
}

// Helper Methods

// addAuthorizationHeader adds authorization header to the request
func (h *PatientHandler) addAuthorizationHeader(c *gin.Context, req *http.Request) {
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}
	
	// Add user info headers for backend
	if userID, exists := c.Get("user_id"); exists {
		req.Header.Set("X-User-ID", userID.(string))
	}
	if userRole, exists := c.Get("user_role"); exists {
		req.Header.Set("X-User-Role", userRole.(string))
	}
}

// clearPatientListCache clears all patient list cache entries
func (h *PatientHandler) clearPatientListCache() {
	count, err := h.cache.DeleteByPrefix("patients:list:")
	if err != nil {
		h.logger.WithError(err).Error("Failed to clear patient list cache")
	} else {
		h.logger.WithField("count", count).Info("Cleared patient list cache")
	}
	
	// Also clear search cache
	searchCount, _ := h.cache.DeleteByPrefix("patients:search:")
	h.logger.WithField("count", searchCount).Info("Cleared patient search cache")
}

// isEmptyUpdate checks if the update request contains any fields
func isEmptyUpdate(req PatientUpdateRequest) bool {
	return req.FirstName == nil &&
		req.LastName == nil &&
		req.DateOfBirth == nil &&
		req.Gender == nil &&
		req.Email == nil &&
		req.Phone == nil &&
		req.Address == nil &&
		req.EmergencyContact == nil &&
		req.Insurance == nil &&
		req.MedicalInfo == nil
}

// PatientStatsHandler handles GET /api/v1/patients/stats
func (h *PatientHandler) PatientStatsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		// Check admin/doctor permissions
		userRole, exists := c.Get("user_role")
		if !exists || (userRole != "admin" && userRole != "doctor") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions to view patient statistics",
			})
			return
		}

		// Extract date range
		startDate := c.DefaultQuery("start_date", time.Now().AddDate(0, -1, 0).Format("2006-01-02"))
		endDate := c.DefaultQuery("end_date", time.Now().Format("2006-01-02"))

		// Generate cache key
		cacheKey := fmt.Sprintf("patients:stats:start:%s:end:%s", startDate, endDate)

		// Check cache first (cache for 10 minutes)
		var cachedStats map[string]interface{}
		if err := h.cache.Get(cacheKey, &cachedStats); err == nil {
			h.logger.WithFields(logrus.Fields{
				"cache_hit": true,
				"key":       cacheKey,
			}).Debug("Cache hit for patient stats")
			
			c.JSON(http.StatusOK, cachedStats)
			return
		}

		// Build backend URL
		backendURL := h.backendURL + "/patients/stats"
		req, err := http.NewRequest("GET", backendURL, nil)
		if err != nil {
			h.logger.WithError(err).Error("Failed to create request")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Add query parameters
		q := req.URL.Query()
		q.Add("start_date", startDate)
		q.Add("end_date", endDate)
		req.URL.RawQuery = q.Encode()

		// Add authorization header
		h.addAuthorizationHeader(c, req)

		// Forward request to backend
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.WithError(err).Error("Failed to forward request to backend")
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Backend service unavailable",
				"message": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			h.logger.WithError(err).Error("Failed to read response body")
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read response",
			})
			return
		}

		// Parse response
		var stats map[string]interface{}
		if err := json.Unmarshal(body, &stats); err != nil {
			h.logger.WithError(err).Error("Failed to unmarshal response")
			c.JSON(resp.StatusCode, gin.H{
				"error": "Invalid response format",
				"body":  string(body),
			})
			return
		}

		// Cache the response for 10 minutes
		if resp.StatusCode == http.StatusOK {
			h.cache.Set(cacheKey, stats, 10*time.Minute)
		}

		// Log request metrics
		latency := time.Since(startTime)
		h.logger.WithFields(logrus.Fields{
			"method":   "GET",
			"endpoint": "/patients/stats",
			"status":   resp.StatusCode,
			"latency":  latency.String(),
			"cache_hit": false,
		}).Info("Patient statistics request completed")

		c.JSON(resp.StatusCode, stats)
	}
}