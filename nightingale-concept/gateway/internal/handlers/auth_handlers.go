package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"gateway/pkg/jwt"
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
			"expires_in":    int(jwtManager.Expiration().Seconds()),
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
			"expires_in":   int(jwtManager.Expiration().Seconds()),
		})
	}
}
