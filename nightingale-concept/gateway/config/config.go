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
