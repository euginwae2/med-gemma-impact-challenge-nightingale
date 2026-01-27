package middleware

import (
	"bytes"
	"io"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func Logger() gin.HandlerFunc {
	logger := logrus.New()

	return func(c *gin.Context) {
		// Start timer
		start := time.Now()

		// Read request body
		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		// Create custom response writer to capture response
		blw := &bodyLogWriter{
			body:           bytes.NewBufferString(""),
			ResponseWriter: c.Writer,
		}
		c.Writer = blw

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)

		// Get status code
		statusCode := c.Writer.Status()

		// Get user info
		userID, _ := c.Get("user_id")
		userRole, _ := c.Get("user_role")

		// Log entry
		entry := logger.WithFields(logrus.Fields{
			"timestamp":   start.Format(time.RFC3339),
			"method":      c.Request.Method,
			"path":        c.Request.URL.Path,
			"query":       c.Request.URL.RawQuery,
			"status":      statusCode,
			"latency":     latency.String(),
			"client_ip":   c.ClientIP(),
			"user_agent":  c.Request.UserAgent(),
			"user_id":     userID,
			"user_role":   userRole,
			"request_id":  c.GetHeader("X-Request-ID"),
		})

		// Log request/response bodies for debugging (except sensitive endpoints)
		sensitiveEndpoints := []string{"/auth/login", "/auth/register"}
		isSensitive := false
		for _, endpoint := range sensitiveEndpoints {
			if c.Request.URL.Path == endpoint {
				isSensitive = true
				break
			}
		}

		if !isSensitive && len(requestBody) > 0 && len(requestBody) < 10000 {
			entry = entry.WithField("request_body", string(requestBody))
		}

		if !isSensitive && blw.body.Len() > 0 && blw.body.Len() < 10000 {
			entry = entry.WithField("response_body", blw.body.String())
		}

		// Log based on status code
		if statusCode >= 500 {
			entry.Error("Server error")
		} else if statusCode >= 400 {
			entry.Warn("Client error")
		} else {
			entry.Info("Request completed")
		}
	}
}

// Request ID middleware
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateUUID()
		}

		c.Set("request_id", requestID)
		c.Writer.Header().Set("X-Request-ID", requestID)
		c.Next()
	}
}

func generateUUID() string {
	// Simple UUID generation for concept study
	// In production, use github.com/google/uuid
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}
