package middleware

import (
	"gateway/internal/cache"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type RateLimiter struct {
	redisClient *cache.RedisClient
	limiter     map[string]*rate.Limiter
}

func NewRateLimiter(redisClient *cache.RedisClient) *RateLimiter {
	return &RateLimiter{
		redisClient: redisClient,
		limiter:     make(map[string]*rate.Limiter),
	}
}

func RateLimitMiddleware(redisClient *cache.RedisClient, requestsPerMinute, burst int) gin.HandlerFunc {
	_= NewRateLimiter(redisClient)

	return func(c *gin.Context) {
		// Get client IP
		clientIP := c.ClientIP()
		if clientIP == "" {
			clientIP = "unknown"
		}

		// Check rate limit using Redis
		// ctx := c.Request.Context()
		key := "rate_limit:" + clientIP

		// Increment counter in Redis
		count, err := redisClient.Increment(key)
		if err != nil {
			// Fallback to in-memory rate limiting
			fallbackRateLimit(c, clientIP, requestsPerMinute, burst)
			return
		}

		// Set expiration if this is the first request
		if count == 1 {
			redisClient.Expire(key, time.Minute)
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

func UserRateLimitMiddleware(redisClient *cache.RedisClient, requestsPerMinute, burst int) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (if authenticated)
		userID, exists := c.Get("user_id")
		if !exists {
			// Use IP for unauthenticated users
			RateLimitMiddleware(redisClient, requestsPerMinute, burst)(c)
			return
		}

		// Check rate limit by user ID
		// ctx := c.Request.Context()
		key := "rate_limit:user:" + userID.(string)

		count, err := redisClient.Increment(key)
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			redisClient.Expire(key, time.Minute)
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
func EndpointRateLimitMiddleware(redisClient *cache.RedisClient, endpoint string, requestsPerMinute int) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		key := "rate_limit:" + endpoint + ":" + clientIP

		// ctx := c.Request.Context()
		count, err := redisClient.Increment(key)
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			redisClient.Expire(key, time.Minute)
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
