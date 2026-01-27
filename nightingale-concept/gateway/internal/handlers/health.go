package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HealthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "healthy",
			"service":  "gateway",
			"version":  "1.0.0",
		})
	}
}

func DeepHealthHandler(backendProxy, aiProxy interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check gateway itself
		gatewayHealth := gin.H{
			"service": "gateway",
			"status":  "healthy",
		}

		// Check backend service
		backendHealth := checkServiceHealth("backend")

		// Check AI service
		aiHealth := checkServiceHealth("ai-service")

		// Overall status
		overallStatus := "healthy"
		if backendHealth["status"] != "healthy" || aiHealth["status"] != "healthy" {
			overallStatus = "degraded"
		}

		c.JSON(http.StatusOK, gin.H{
			"status":   overallStatus,
			"services": []gin.H{gatewayHealth, backendHealth, aiHealth},
		})
	}
}

func checkServiceHealth(service string) gin.H {
	// In production, make actual HTTP requests to services
	// For concept study, return mock responses
	return gin.H{
		"service": service,
		"status":  "healthy",
		"latency": "10ms",
	}
}
