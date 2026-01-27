package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"gateway/config"
	"gateway/internal/cache"
	"gateway/internal/handlers"
	"gateway/internal/middleware"
	"gateway/internal/proxy"
	"gateway/pkg/jwt"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.LoadConfig()

	// Initialize Redis client
	redisClient, err := cache.NewRedisClientFromURL(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()

	// Initialize JWT manager
	jwtManager := jwt.NewJWTManager(cfg.JWTSecret, cfg.JWTExpiration)

	// Initialize proxies
	backendProxy := proxy.NewBackendProxy(cfg.BackendURL)
	aiProxy := proxy.NewAIProxy(cfg.AIServiceURL)

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Create Gin router
	router := gin.New()

	// Global middlewares
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Public routes (no authentication required)
	public := router.Group("/api")
	{
		// Health checks
		public.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "healthy",
				"service": "nightingale-gateway",
				"version": cfg.Version,
			})
		})

		// Authentication endpoints
		public.POST("/auth/login", handlers.LoginHandler(jwtManager))
		public.POST("/auth/register", handlers.RegisterHandler())
		public.POST("/auth/refresh", handlers.RefreshTokenHandler(jwtManager))

		// Swagger/OpenAPI documentation
		// public.GET("/docs", handlers.ServeSwaggerUI())
		// public.GET("/openapi.json", handlers.ServeOpenAPISpec())
	}

	// Inititate patient handler
	patientHandler := handlers.NewPatientHandler(cfg.BackendURL, redisClient, jwtManager)
	insuranceHandler := handlers.NewInsuranceHandler(cfg.BackendURL, redisClient, jwtManager)

	// Protected routes (require authentication)
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(jwtManager))
	protected.Use(middleware.RateLimitMiddleware(redisClient, cfg.RateLimit.RequestsPerMinute, cfg.RateLimit.Burst))
	{
		// Patient management
		protected.GET("/patients", patientHandler.GetPatients())
		protected.POST("/patients", patientHandler.CreatePatient())
		protected.GET("/patients/:id", patientHandler.GetPatientByID())
		protected.PUT("/patients/:id", patientHandler.UpdatePatient())

		// Clinical data
		protected.GET("/patients/:id/records", patientHandler.GetPatientRecords())
		protected.POST("/clinical/notes", backendProxy.CreateClinicalNote)
		protected.GET("/clinical/notes/:id", backendProxy.GetClinicalNote)

		// AI Services
		protected.POST("/ai/analyze/text", aiProxy.AnalyzeText)
		protected.POST("/ai/analyze/clinical", aiProxy.AnalyzeClinicalText)
		protected.POST("/ai/explain/term", aiProxy.ExplainMedicalTerm)
		protected.POST("/ai/summarize/note", aiProxy.SummarizeClinicalNote)

		// Insurance
		protected.GET("/insurance/coverage", backendProxy.GetInsuranceCoverage)
		protected.POST("/insurance/documents/upload", insuranceHandler.UploadInsuranceDocument(backendProxy, aiProxy))
		protected.POST("/insurance/estimate", backendProxy.EstimateCost)

		// Admin routes (role-based)
		admin := protected.Group("/admin")
		admin.Use(middleware.AdminMiddleware())
		{
			admin.GET("/users", handlers.GetAllUsers(backendProxy))
			admin.GET("/system/stats", handlers.GetSystemStats(backendProxy))
			admin.POST("/system/cache/clear", handlers.ClearCache(redisClient))
		}
	}

	// Proxy specific routes to backend services
	router.Any("/backend/*path", func(c *gin.Context) {
		proxy.ReverseProxy(c, backendProxy.Proxy, "/backend")
	})

	router.Any("/ai/*path", func(c *gin.Context) {
		proxy.ReverseProxy(c, aiProxy.Proxy, "/ai")
	})

	// Create HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// Graceful shutdown
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Printf("Gateway server started on port %d", cfg.Port)
	log.Printf("Environment: %s", cfg.Environment)
	log.Printf("Backend URL: %s", cfg.BackendURL)
	log.Printf("AI Service URL: %s", cfg.AIServiceURL)

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited gracefully")
}
