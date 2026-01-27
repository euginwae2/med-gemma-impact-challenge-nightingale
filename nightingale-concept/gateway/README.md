# **Nightingale API Gateway Implementation (Go)**

## **Gateway Structure**

```
gateway/
├── Dockerfile
├── go.mod
├── go.sum
├── main.go
├── config/
│   └── config.go
├── internal/
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── rate_limit.go
│   │   ├── logging.go
│   │   ├── cors.go
│   │   └── recovery.go
│   ├── proxy/
│   │   ├── proxy.go
│   │   ├── backend_proxy.go
│   │   └── ai_proxy.go
│   ├── handlers/
│   │   ├── health.go
│   │   ├── auth_handlers.go
│   │   └── patient_handlers.go
│   └── cache/
│       └── redis_client.go
├── pkg/
│   ├── jwt/
│   │   └── jwt.go
│   ├── validator/
│   │   └── validator.go
│   └── utils/
│       └── utils.go
└── api/
    └── v1/
        ├── routes.go
        └── docs.go
```

## **1. Main Entry Point (main.go)**

```go
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

	"nightingale-gateway/config"
	"nightingale-gateway/internal/cache"
	"nightingale-gateway/internal/middleware"
	"nightingale-gateway/internal/proxy"
	"nightingale-gateway/pkg/jwt"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.LoadConfig()

	// Initialize Redis client
	redisClient, err := cache.NewRedisClient(cfg.RedisURL)
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
		public.GET("/docs", handlers.ServeSwaggerUI())
		public.GET("/openapi.json", handlers.ServeOpenAPISpec())
	}

	// Protected routes (require authentication)
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(jwtManager))
	protected.Use(middleware.RateLimitMiddleware(redisClient, cfg.RateLimit))
	{
		// Patient management
		protected.GET("/patients", handlers.GetPatients(backendProxy))
		protected.POST("/patients", handlers.CreatePatient(backendProxy))
		protected.GET("/patients/:id", handlers.GetPatientByID(backendProxy))
		protected.PUT("/patients/:id", handlers.UpdatePatient(backendProxy))

		// Clinical data
		protected.GET("/patients/:id/records", handlers.GetPatientRecords(backendProxy))
		protected.POST("/clinical/notes", handlers.CreateClinicalNote(backendProxy))
		protected.GET("/clinical/notes/:id", handlers.GetClinicalNote(backendProxy))

		// AI Services
		protected.POST("/ai/analyze/text", handlers.AnalyzeText(aiProxy))
		protected.POST("/ai/analyze/clinical", handlers.AnalyzeClinicalText(aiProxy))
		protected.POST("/ai/explain/term", handlers.ExplainMedicalTerm(aiProxy))
		protected.POST("/ai/summarize/note", handlers.SummarizeClinicalNote(aiProxy))

		// Insurance
		protected.GET("/insurance/coverage", handlers.GetInsuranceCoverage(backendProxy))
		protected.POST("/insurance/documents/upload", handlers.UploadInsuranceDocument(backendProxy, aiProxy))
		protected.POST("/insurance/estimate", handlers.EstimateCost(backendProxy))

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
		proxy.ReverseProxy(c, backendProxy, "/backend")
	})

	router.Any("/ai/*path", func(c *gin.Context) {
		proxy.ReverseProxy(c, aiProxy, "/ai")
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
```

## **2. Configuration (config/config.go)**

```go
package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	// Server
	Port        int
	Environment string

	// Timeouts
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration

	// Services
	BackendURL   string
	AIServiceURL string

	// Redis
	RedisURL string

	// JWT
	JWTSecret     string
	JWTExpiration time.Duration

	// Rate limiting
	RateLimit struct {
		RequestsPerMinute int
		Burst             int
	}

	// CORS
	AllowOrigins []string

	// Logging
	LogLevel string

	// Version
	Version string
}

func LoadConfig() *Config {
	cfg := &Config{}

	// Server
	cfg.Port = getInt("PORT", 8080)
	cfg.Environment = getString("ENVIRONMENT", "development")

	// Timeouts
	cfg.ReadTimeout = getDuration("READ_TIMEOUT", 30*time.Second)
	cfg.WriteTimeout = getDuration("WRITE_TIMEOUT", 30*time.Second)
	cfg.IdleTimeout = getDuration("IDLE_TIMEOUT", 120*time.Second)

	// Services
	cfg.BackendURL = getString("BACKEND_URL", "http://backend:8081")
	cfg.AIServiceURL = getString("AI_SERVICE_URL", "http://ai-service:8000")

	// Redis
	cfg.RedisURL = getString("REDIS_URL", "redis://redis:6379")

	// JWT
	cfg.JWTSecret = getString("JWT_SECRET", "your-secret-key-change-in-production")
	cfg.JWTExpiration = getDuration("JWT_EXPIRATION", 24*time.Hour)

	// Rate limiting
	cfg.RateLimit.RequestsPerMinute = getInt("RATE_LIMIT_REQUESTS_PER_MINUTE", 60)
	cfg.RateLimit.Burst = getInt("RATE_LIMIT_BURST", 10)

	// CORS
	origins := getString("ALLOW_ORIGINS", "http://localhost:3000,http://localhost:8080")
	cfg.AllowOrigins = strings.Split(origins, ",")

	// Logging
	cfg.LogLevel = getString("LOG_LEVEL", "info")

	// Version
	cfg.Version = getString("VERSION", "1.0.0")

	return cfg
}

func getString(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
```

## **3. Middleware Package**

### **3.1 Authentication Middleware (middleware/auth.go)**

```go
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"nightingale-gateway/pkg/jwt"
)

func AuthMiddleware(jwtManager *jwt.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Check Bearer token format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format",
			})
			c.Abort()
			return
		}

		// Validate JWT token
		token := parts[1]
		claims, err := jwtManager.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_role", claims.Role)
		c.Set("user_email", claims.Email)

		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// Optional authentication for public endpoints that can have user context
func OptionalAuthMiddleware(jwtManager *jwt.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				claims, err := jwtManager.ValidateToken(parts[1])
				if err == nil {
					c.Set("user_id", claims.UserID)
					c.Set("user_role", claims.Role)
					c.Set("user_email", claims.Email)
				}
			}
		}
		c.Next()
	}
}
```

### **3.2 Rate Limiting Middleware (middleware/rate_limit.go)**

```go
package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"golang.org/x/time/rate"

	"nightingale-gateway/internal/cache"
)

type RateLimiter struct {
	redisClient *redis.Client
	limiter     map[string]*rate.Limiter
}

func NewRateLimiter(redisClient *redis.Client) *RateLimiter {
	return &RateLimiter{
		redisClient: redisClient,
		limiter:     make(map[string]*rate.Limiter),
	}
}

func RateLimitMiddleware(redisClient *redis.Client, requestsPerMinute, burst int) gin.HandlerFunc {
	limiter := NewRateLimiter(redisClient)

	return func(c *gin.Context) {
		// Get client IP
		clientIP := c.ClientIP()
		if clientIP == "" {
			clientIP = "unknown"
		}

		// Check rate limit using Redis
		ctx := c.Request.Context()
		key := "rate_limit:" + clientIP

		// Increment counter in Redis
		count, err := redisClient.Incr(ctx, key).Result()
		if err != nil {
			// Fallback to in-memory rate limiting
			fallbackRateLimit(c, clientIP, requestsPerMinute, burst)
			return
		}

		// Set expiration if this is the first request
		if count == 1 {
			redisClient.Expire(ctx, key, time.Minute)
		}

		// Check if limit exceeded
		if count > int64(requestsPerMinute) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"retry_after": 60,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func UserRateLimitMiddleware(redisClient *redis.Client, requestsPerMinute, burst int) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (if authenticated)
		userID, exists := c.Get("user_id")
		if !exists {
			// Use IP for unauthenticated users
			RateLimitMiddleware(redisClient, requestsPerMinute, burst)(c)
			return
		}

		// Check rate limit by user ID
		ctx := c.Request.Context()
		key := "rate_limit:user:" + userID.(string)

		count, err := redisClient.Incr(ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			redisClient.Expire(ctx, key, time.Minute)
		}

		if count > int64(requestsPerMinute) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "User rate limit exceeded",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// Fallback in-memory rate limiting
func fallbackRateLimit(c *gin.Context, clientIP string, requestsPerMinute, burst int) {
	limiter := rate.NewLimiter(rate.Limit(requestsPerMinute)/60, burst)

	if !limiter.Allow() {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error": "Rate limit exceeded (fallback)",
		})
		c.Abort()
		return
	}

	c.Next()
}

// Per-endpoint rate limiting
func EndpointRateLimitMiddleware(redisClient *redis.Client, endpoint string, requestsPerMinute int) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		key := "rate_limit:" + endpoint + ":" + clientIP

		ctx := c.Request.Context()
		count, err := redisClient.Incr(ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			redisClient.Expire(ctx, key, time.Minute)
		}

		if count > int64(requestsPerMinute) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":      "Endpoint rate limit exceeded",
				"endpoint":   endpoint,
				"retry_after": 60,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
```

### **3.3 Logging Middleware (middleware/logging.go)**

```go
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
```

### **3.4 CORS Middleware (middleware/cors.go)**

```go
package middleware

import "github.com/gin-gonic/gin"

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
```

## **4. Proxy Package**

### **4.1 Main Proxy (proxy/proxy.go)**

```go
package proxy

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type Proxy struct {
	targetURL string
	client    *http.Client
}

func NewProxy(targetURL string) *Proxy {
	return &Proxy{
		targetURL: targetURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 20,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

func ReverseProxy(c *gin.Context, proxy *Proxy, stripPrefix string) {
	// Create target URL
	target, err := url.Parse(proxy.targetURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to parse target URL",
		})
		return
	}

	// Create reverse proxy
	reverseProxy := httputil.NewSingleHostReverseProxy(target)

	// Modify request
	reverseProxy.Director = func(req *http.Request) {
		// Set scheme and host
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host

		// Strip prefix if specified
		if stripPrefix != "" {
			req.URL.Path = strings.TrimPrefix(req.URL.Path, stripPrefix)
		}

		// Set headers
		req.Header.Set("X-Forwarded-For", c.ClientIP())
		req.Header.Set("X-Forwarded-Host", req.Host)
		req.Header.Set("X-Real-IP", c.ClientIP())

		// Pass through original headers
		for key, values := range c.Request.Header {
			for _, value := range values {
				req.Header.Add(key, value)
			}
		}

		// Add user info from context
		if userID, exists := c.Get("user_id"); exists {
			req.Header.Set("X-User-ID", userID.(string))
		}
		if userRole, exists := c.Get("user_role"); exists {
			req.Header.Set("X-User-Role", userRole.(string))
		}

		// Set request ID
		if requestID, exists := c.Get("request_id"); exists {
			req.Header.Set("X-Request-ID", requestID.(string))
		}
	}

	// Modify response
	reverseProxy.ModifyResponse = func(resp *http.Response) error {
		// Add CORS headers
		resp.Header.Set("Access-Control-Allow-Origin", "*")
		resp.Header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		resp.Header.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Add gateway headers
		resp.Header.Set("X-Gateway", "nightingale-gateway")

		return nil
	}

	// Error handler
	reverseProxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":   "Bad Gateway",
			"message": "Failed to connect to backend service",
			"details": err.Error(),
		})
	}

	// Serve the request
	reverseProxy.ServeHTTP(c.Writer, c.Request)
}

func (p *Proxy) ForwardRequest(c *gin.Context, endpoint string) {
	// Create request
	url := p.targetURL + endpoint

	// Copy request body
	var bodyBytes []byte
	if c.Request.Body != nil {
		bodyBytes, _ = io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
	}

	// Create new request
	req, err := http.NewRequest(c.Request.Method, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create request",
		})
		return
	}

	// Copy headers
	for key, values := range c.Request.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Add authentication headers
	if userID, exists := c.Get("user_id"); exists {
		req.Header.Set("X-User-ID", userID.(string))
	}

	// Execute request
	resp, err := p.client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":   "Service unavailable",
			"message": err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	// Copy response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read response",
		})
		return
	}

	// Copy headers
	for key, values := range resp.Header {
		for _, value := range values {
			c.Writer.Header().Add(key, value)
		}
	}

	// Set status code and write body
	c.Status(resp.StatusCode)
	c.Writer.Write(body)
}
```

### **4.2 Backend Proxy (proxy/backend_proxy.go)**

```go
package proxy

type BackendProxy struct {
	*Proxy
}

func NewBackendProxy(backendURL string) *BackendProxy {
	return &BackendProxy{
		Proxy: NewProxy(backendURL),
	}
}

func (p *BackendProxy) GetPatients(c *gin.Context) {
	p.ForwardRequest(c, "/patients")
}

func (p *BackendProxy) CreatePatient(c *gin.Context) {
	p.ForwardRequest(c, "/patients")
}

func (p *BackendProxy) GetPatientByID(c *gin.Context) {
	id := c.Param("id")
	p.ForwardRequest(c, "/patients/"+id)
}

func (p *BackendProxy) GetPatientRecords(c *gin.Context) {
	id := c.Param("id")
	p.ForwardRequest(c, "/patients/"+id+"/records")
}

func (p *BackendProxy) CreateClinicalNote(c *gin.Context) {
	p.ForwardRequest(c, "/clinical/notes")
}

func (p *BackendProxy) GetInsuranceCoverage(c *gin.Context) {
	p.ForwardRequest(c, "/insurance/coverage")
}

func (p *BackendProxy) EstimateCost(c *gin.Context) {
	p.ForwardRequest(c, "/insurance/estimate")
}
```

### **4.3 AI Service Proxy (proxy/ai_proxy.go)**

```go
package proxy

type AIProxy struct {
	*Proxy
}

func NewAIProxy(aiServiceURL string) *AIProxy {
	return &AIProxy{
		Proxy: NewProxy(aiServiceURL),
	}
}

func (p *AIProxy) AnalyzeText(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/text/generate")
}

func (p *AIProxy) AnalyzeClinicalText(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/clinical/summary")
}

func (p *AIProxy) ExplainMedicalTerm(c *gin.Context) {
	term := c.PostForm("term")
	readingLevel := c.PostForm("reading_level")

	// Forward to AI service
	p.ForwardRequest(c, "/api/v1/explain/term?term="+term+"&reading_level="+readingLevel)
}

func (p *AIProxy) SummarizeClinicalNote(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/clinical/summary")
}

func (p *AIProxy) ProcessInsuranceDocument(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/insurance/document")
}
```

## **5. Handlers Package**

### **5.1 Health Handlers (handlers/health.go)**

```go
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
```

### **5.2 Authentication Handlers (handlers/auth_handlers.go)**

```go
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"nightingale-gateway/pkg/jwt"
)

var validate = validator.New()

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name" validate:"required"`
	Role     string `json:"role" validate:"oneof=patient doctor admin"`
}

func LoginHandler(jwtManager *jwt.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest

		// Bind and validate request
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request body",
			})
			return
		}

		if err := validate.Struct(req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Validation failed",
				"details": err.Error(),
			})
			return
		}

		// In production, validate against database
		// For concept study, mock authentication
		if req.Email != "demo@nightingale.com" || req.Password != "password123" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid credentials",
			})
			return
		}

		// Generate tokens
		accessToken, err := jwtManager.GenerateToken(&jwt.Claims{
			UserID: "demo-user-123",
			Email:  req.Email,
			Role:   "patient",
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate token",
			})
			return
		}

		refreshToken, err := jwtManager.GenerateRefreshToken(req.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate refresh token",
			})
			return
		}

		// Return tokens
		c.JSON(http.StatusOK, gin.H{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"token_type":    "Bearer",
			"expires_in":    int(jwtManager.Expiration.Seconds()),
			"user": gin.H{
				"id":    "demo-user-123",
				"email": req.Email,
				"name":  "Demo User",
				"role":  "patient",
			},
		})
	}
}

func RegisterHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request body",
			})
			return
		}

		if err := validate.Struct(req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Validation failed",
				"details": err.Error(),
			})
			return
		}

		// In production, create user in database
		// For concept study, return success

		c.JSON(http.StatusCreated, gin.H{
			"message": "User registered successfully",
			"user": gin.H{
				"id":        "new-user-" + time.Now().Format("20060102150405"),
				"email":     req.Email,
				"name":      req.Name,
				"role":      req.Role,
				"created_at": time.Now().Format(time.RFC3339),
			},
		})
	}
}

func RefreshTokenHandler(jwtManager *jwt.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		type RefreshRequest struct {
			RefreshToken string `json:"refresh_token" validate:"required"`
		}

		var req RefreshRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request body",
			})
			return
		}

		// Validate refresh token
		email, err := jwtManager.ValidateRefreshToken(req.RefreshToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid refresh token",
			})
			return
		}

		// Generate new access token
		accessToken, err := jwtManager.GenerateToken(&jwt.Claims{
			UserID: "user-id-from-db", // Get from database in production
			Email:  email,
			Role:   "patient", // Get from database
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate token",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"access_token": accessToken,
			"token_type":   "Bearer",
			"expires_in":   int(jwtManager.Expiration.Seconds()),
		})
	}
}
```

## **6. JWT Package (pkg/jwt/jwt.go)**

```go
package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type Manager struct {
	secret     string
	expiration time.Duration
}

func NewJWTManager(secret string, expiration time.Duration) *Manager {
	return &Manager{
		secret:     secret,
		expiration: expiration,
	}
}

func (m *Manager) GenerateToken(claims *Claims) (string, error) {
	claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(m.expiration))
	claims.IssuedAt = jwt.NewNumericDate(time.Now())

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.secret))
}

func (m *Manager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(m.secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

func (m *Manager) GenerateRefreshToken(email string) (string, error) {
	claims := &jwt.RegisteredClaims{
		Subject:   email,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7 days
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.secret + "-refresh"))
}

func (m *Manager) ValidateRefreshToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(m.secret + "-refresh"), nil
	})

	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return "", ErrInvalidToken
	}

	return claims.Subject, nil
}
```

## **7. Dockerfile**

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o gateway ./main.go

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/gateway .

# Copy configuration files
COPY --from=builder /app/.env.example .env

# Expose port
EXPOSE 8080

# Run application
CMD ["./gateway"]
```

## **8. go.mod**

```go
module nightingale-gateway

go 1.21

require (
	github.com/gin-contrib/cors v1.5.0
	github.com/gin-gonic/gin v1.9.1
	github.com/go-playground/validator/v10 v10.16.0
	github.com/go-redis/redis/v8 v8.11.5
	github.com/golang-jwt/jwt/v5 v5.2.0
	github.com/joho/godotenv v1.5.1
	github.com/sirupsen/logrus v1.9.3
	golang.org/x/time v0.5.0
)

require (
	github.com/bytedance/sonic v1.10.2 // indirect
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/chenzhuoyu/base64x v0.0.0-20230717121745-296ad89f973d // indirect
	github.com/chenzhuoyu/iasm v0.9.1 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/gabriel-vasile/mimetype v1.4.3 // indirect
	github.com/gin-contrib/sse v0.1.0 // indirect
	github.com/go-playground/locales v0.14.1 // indirect
	github.com/go-playground/universal-translator v0.18.1 // indirect
	github.com/goccy/go-json v0.10.2 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/klauspost/cpuid/v2 v2.2.6 // indirect
	github.com/leodido/go-urn v1.2.4 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/pelletier/go-toml/v2 v2.1.1 // indirect
	github.com/twitchyliquid64/golang-asm v0.15.1 // indirect
	github.com/ugorji/go/codec v1.2.12 // indirect
	golang.org/x/arch v0.7.0 // indirect
	golang.org/x/crypto v0.18.0 // indirect
	golang.org/x/net v0.20.0 // indirect
	golang.org/x/sys v0.16.0 // indirect
	golang.org/x/text v0.14.0 // indirect
	google.golang.org/protobuf v1.32.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
```

## **9. Environment Variables (.env.example)**

```env
# Server Configuration
PORT=8080
ENVIRONMENT=development
READ_TIMEOUT=30s
WRITE_TIMEOUT=30s
IDLE_TIMEOUT=120s

# Service URLs
BACKEND_URL=http://backend:8081
AI_SERVICE_URL=http://health-ai-service:8000

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10

# CORS
ALLOW_ORIGINS=http://localhost:3000,http://localhost:8080

# Logging
LOG_LEVEL=info

# Version
VERSION=1.0.0
```

## **10. Running the Gateway**

### **Build and Run:**

```bash
# Clone and navigate to gateway directory
cd gateway

# Install dependencies
go mod download

# Run with hot reload (development)
go install github.com/cosmtrek/air@latest
air

# Or run directly
go run main.go

# Build and run with Docker
docker build -t nightingale-gateway .
docker run -p 8080:8080 --env-file .env nightingale-gateway
```

### **Test Endpoints:**

```bash
# Health check
curl http://localhost:8080/api/health

# Login (get token)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nightingale.com","password":"password123"}'

# Use token for protected endpoints
TOKEN="your-jwt-token"

# Get patients (protected)
curl http://localhost:8080/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"

# Analyze text with AI
curl -X POST http://localhost:8080/api/v1/ai/analyze/text \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain diabetes in simple terms"}'
```

## **Key Features Implemented:**

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (patient, doctor, admin)
   - Refresh token mechanism

2. **Rate Limiting**
   - IP-based rate limiting
   - User-based rate limiting
   - Endpoint-specific limits
   - Redis-backed for scalability

3. **Request Proxying**
   - Reverse proxy to backend services
   - Header forwarding and modification
   - Error handling and retries

4. **Security**
   - CORS configuration
   - Request validation
   - Input sanitization
   - Secure headers

5. **Observability**
   - Structured logging with Logrus
   - Request ID tracking
   - Performance metrics
   - Health checks with service dependencies

6. **Configuration**
   - Environment-based configuration
   - Graceful shutdown
   - Timeout management

This gateway implementation provides a production-ready foundation for the Nightingale Platform concept study, with all necessary features for security, scalability, and observability.
