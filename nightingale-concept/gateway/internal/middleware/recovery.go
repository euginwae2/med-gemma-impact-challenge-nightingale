package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Recovery returns a middleware that recovers from any panics and writes a 500 if there was one.
func Recovery() gin.HandlerFunc {
	logger := logrus.New()

	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Check for a broken connection, as it is not really a condition that should be handled with a generic 500 error.
				// This is a simplified check; Gin's default recovery does more extensive checks for broken pipes.
				
				// Get stack trace
				stack := string(debug.Stack())

				// Log the error with context
				// We pull user info and request ID just like in logging.go
				userID, _ := c.Get("user_id")
				requestID := c.GetHeader("X-Request-ID")

				logger.WithFields(logrus.Fields{
					"error":      err,
					"stack":      stack,
					"path":       c.Request.URL.Path,
					"method":     c.Request.Method,
					"user_id":    userID,
					"request_id": requestID,
				}).Error("PANIC RECOVERED")

				// If the connection is already written to, we can't send a JSON response
				if c.Writer.Written() {
					c.AbortWithStatus(http.StatusInternalServerError)
					return
				}

				// Respond with a generic error message to the client
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":      "Internal Server Error",
					"message":    fmt.Sprintf("%v", err), // Optional: hide this in production for security
					"request_id": requestID,
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}