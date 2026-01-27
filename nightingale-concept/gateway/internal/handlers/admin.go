package handlers

import (
	"gateway/internal/cache"
	"gateway/internal/proxy"

	"github.com/gin-gonic/gin"
)



func GetAllUsers(*proxy.BackendProxy) gin.HandlerFunc {
	return func (c *gin.Context) {}
}

func GetSystemStats(*proxy.BackendProxy) gin.HandlerFunc {
	return  func (c *gin.Context) {}
}

func ClearCache(*cache.RedisClient) gin.HandlerFunc {
	return func (c *gin.Context) {}
}