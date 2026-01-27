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
