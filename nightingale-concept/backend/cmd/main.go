package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Patient struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Name      string `json:"name"`
	Age       int    `json:"age"`
	MedicalID string `json:"medical_id"`
}

type Config struct {
	DatabaseURL string `json:"database_url"`
	RedisURL    string `json:"redis_url"`
	AIServiceURL string `json:"ai_service_url"`
}

func main() {
	// Load configuration
	config := Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		RedisURL:    os.Getenv("REDIS_URL"),
		AIServiceURL: os.Getenv("AI_SERVICE_URL"),
	}

	// Initialize database
	db, err := gorm.Open(postgres.Open(config.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	
	// Auto-migrate schema
	db.AutoMigrate(&Patient{})

	// Initialize Redis
	_ = redis.NewClient(&redis.Options{
		Addr: config.RedisURL,
	})

	// Initialize Gin router
	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"service": "nightingale-backend",
		})
	})

	// Patient endpoints
	r.GET("/patients", func(c *gin.Context) {
		var patients []Patient
		db.Find(&patients)
		c.JSON(http.StatusOK, patients)
	})

	r.POST("/patients", func(c *gin.Context) {
		var patient Patient
		if err := c.ShouldBindJSON(&patient); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		db.Create(&patient)
		c.JSON(http.StatusCreated, patient)
	})

	// AI service proxy
	r.POST("/analyze/text", func(c *gin.Context) {
		// Proxy request to AI service
		resp, err := http.Post(config.AIServiceURL+"/api/v1/text/generate", 
			"application/json", 
			c.Request.Body)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		c.JSON(resp.StatusCode, result)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	
	log.Printf("Starting backend server on port %s", port)
	r.Run(":" + port)
}
