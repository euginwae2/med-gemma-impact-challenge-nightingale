package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/sirupsen/logrus"
)

// RedisClient wraps the Redis client with additional functionality
type RedisClient struct {
	client *redis.Client
	ctx    context.Context
	logger *logrus.Logger
}

// CacheEntry represents a cached item with metadata
type CacheEntry struct {
	Value      interface{} `json:"value"`
	Expiration time.Time   `json:"expiration"`
	CreatedAt  time.Time   `json:"created_at"`
	Key        string      `json:"key"`
}

// Config holds Redis configuration
type Config struct {
	URL          string
	Password     string
	DB           int
	PoolSize     int
	MinIdleConns int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	MaxRetries   int
}

// DefaultConfig returns a default Redis configuration
func DefaultConfig() *Config {
	return &Config{
		URL:          "redis://localhost:6379",
		DB:           0,
		PoolSize:     10,
		MinIdleConns: 5,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		MaxRetries:   3,
	}
}

// NewRedisClient creates a new Redis client with the given configuration
func NewRedisClient(cfg *Config) (*RedisClient, error) {
	// Parse Redis URL
	opts, err := redis.ParseURL(cfg.URL)
	if err != nil {
		// If URL parsing fails, use manual configuration
		opts = &redis.Options{
			Addr:     "localhost:6379", // Default fallback
			Password: cfg.Password,
			DB:       cfg.DB,
		}
	}

	// Override with config if provided
	if cfg.Password != "" {
		opts.Password = cfg.Password
	}
	if cfg.DB != 0 {
		opts.DB = cfg.DB
	}
	opts.PoolSize = cfg.PoolSize
	opts.MinIdleConns = cfg.MinIdleConns
	opts.DialTimeout = cfg.DialTimeout
	opts.ReadTimeout = cfg.ReadTimeout
	opts.WriteTimeout = cfg.WriteTimeout
	opts.MaxRetries = cfg.MaxRetries

	// Create client
	client := redis.NewClient(opts)

	// Create wrapper
	rc := &RedisClient{
		client: client,
		ctx:    context.Background(),
		logger: logrus.New(),
	}

	// Test connection
	if err := rc.Ping(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %v", err)
	}

	rc.logger.Info("Redis client initialized successfully")
	return rc, nil
}

// NewRedisClientFromURL is a convenience function to create a client from URL string
func NewRedisClientFromURL(url string) (*RedisClient, error) {
	cfg := DefaultConfig()
	cfg.URL = url
	return NewRedisClient(cfg)
}

// Ping tests the Redis connection
func (rc *RedisClient) Ping() error {
	ctx, cancel := context.WithTimeout(rc.ctx, 5*time.Second)
	defer cancel()

	if err := rc.client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("Redis ping failed: %v", err)
	}
	return nil
}

// Set stores a value with expiration
func (rc *RedisClient) Set(key string, value interface{}, expiration time.Duration) error {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	// Serialize value to JSON
	jsonValue, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %v", err)
	}

	if err := rc.client.Set(ctx, key, jsonValue, expiration).Err(); err != nil {
		return fmt.Errorf("failed to set key %s: %v", key, err)
	}

	rc.logger.WithFields(logrus.Fields{
		"key":        key,
		"expiration": expiration,
	}).Debug("Key set in Redis")
	return nil
}

// Get retrieves a value and unmarshals it into the provided interface
func (rc *RedisClient) Get(key string, dest interface{}) error {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	jsonValue, err := rc.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("key not found: %s", key)
		}
		return fmt.Errorf("failed to get key %s: %v", key, err)
	}

	if err := json.Unmarshal(jsonValue, dest); err != nil {
		return fmt.Errorf("failed to unmarshal value: %v", err)
	}

	rc.logger.WithField("key", key).Debug("Key retrieved from Redis")
	return nil
}

// GetString retrieves a string value
func (rc *RedisClient) GetString(key string) (string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	value, err := rc.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", fmt.Errorf("key not found: %s", key)
		}
		return "", fmt.Errorf("failed to get key %s: %v", key, err)
	}

	return value, nil
}

// Delete removes a key
func (rc *RedisClient) Delete(key string) error {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	if err := rc.client.Del(ctx, key).Err(); err != nil {
		return fmt.Errorf("failed to delete key %s: %v", key, err)
	}

	rc.logger.WithField("key", key).Debug("Key deleted from Redis")
	return nil
}

// Exists checks if a key exists
func (rc *RedisClient) Exists(key string) (bool, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	result, err := rc.client.Exists(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("failed to check existence of key %s: %v", key, err)
	}

	return result > 0, nil
}

// Expire sets expiration on a key
func (rc *RedisClient) Expire(key string, expiration time.Duration) error {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	if err := rc.client.Expire(ctx, key, expiration).Err(); err != nil {
		return fmt.Errorf("failed to set expiration for key %s: %v", key, err)
	}

	return nil
}

// TTL gets the time to live for a key
func (rc *RedisClient) TTL(key string) (time.Duration, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	duration, err := rc.client.TTL(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to get TTL for key %s: %v", key, err)
	}

	return duration, nil
}

// Increment increments a key's value by 1
func (rc *RedisClient) Increment(key string) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	value, err := rc.client.Incr(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to increment key %s: %v", key, err)
	}

	return value, nil
}

// IncrementBy increments a key's value by specified amount
func (rc *RedisClient) IncrementBy(key string, amount int64) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	value, err := rc.client.IncrBy(ctx, key, amount).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to increment key %s by %d: %v", key, amount, err)
	}

	return value, nil
}

// Decrement decrements a key's value by 1
func (rc *RedisClient) Decrement(key string) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	value, err := rc.client.Decr(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to decrement key %s: %v", key, err)
	}

	return value, nil
}

// SetNX sets a key if it doesn't exist (with expiration)
func (rc *RedisClient) SetNX(key string, value interface{}, expiration time.Duration) (bool, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	jsonValue, err := json.Marshal(value)
	if err != nil {
		return false, fmt.Errorf("failed to marshal value: %v", err)
	}

	result, err := rc.client.SetNX(ctx, key, jsonValue, expiration).Result()
	if err != nil {
		return false, fmt.Errorf("failed to set NX for key %s: %v", key, err)
	}

	return result, nil
}

// LPush pushes values to the beginning of a list
func (rc *RedisClient) LPush(key string, values ...interface{}) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	// Convert values to strings
	stringValues := make([]interface{}, len(values))
	for i, v := range values {
		if str, ok := v.(string); ok {
			stringValues[i] = str
		} else {
			jsonValue, err := json.Marshal(v)
			if err != nil {
				return 0, fmt.Errorf("failed to marshal value: %v", err)
			}
			stringValues[i] = string(jsonValue)
		}
	}

	length, err := rc.client.LPush(ctx, key, stringValues...).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to LPush to key %s: %v", key, err)
	}

	return length, nil
}

// RPush pushes values to the end of a list
func (rc *RedisClient) RPush(key string, values ...interface{}) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	// Convert values to strings
	stringValues := make([]interface{}, len(values))
	for i, v := range values {
		if str, ok := v.(string); ok {
			stringValues[i] = str
		} else {
			jsonValue, err := json.Marshal(v)
			if err != nil {
				return 0, fmt.Errorf("failed to marshal value: %v", err)
			}
			stringValues[i] = string(jsonValue)
		}
	}

	length, err := rc.client.RPush(ctx, key, stringValues...).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to RPush to key %s: %v", key, err)
	}

	return length, nil
}

// LRange gets a range of elements from a list
func (rc *RedisClient) LRange(key string, start, stop int64) ([]string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	values, err := rc.client.LRange(ctx, key, start, stop).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to LRange for key %s: %v", key, err)
	}

	return values, nil
}

// LPop pops a value from the beginning of a list
func (rc *RedisClient) LPop(key string) (string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	value, err := rc.client.LPop(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", fmt.Errorf("list is empty: %s", key)
		}
		return "", fmt.Errorf("failed to LPop from key %s: %v", key, err)
	}

	return value, nil
}

// RPop pops a value from the end of a list
func (rc *RedisClient) RPop(key string) (string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	value, err := rc.client.RPop(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", fmt.Errorf("list is empty: %s", key)
		}
		return "", fmt.Errorf("failed to RPop from key %s: %v", key, err)
	}

	return value, nil
}

// SAdd adds members to a set
func (rc *RedisClient) SAdd(key string, members ...interface{}) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	count, err := rc.client.SAdd(ctx, key, members...).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to SAdd to key %s: %v", key, err)
	}

	return count, nil
}

// SMembers gets all members of a set
func (rc *RedisClient) SMembers(key string) ([]string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	members, err := rc.client.SMembers(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to SMembers for key %s: %v", key, err)
	}

	return members, nil
}

// SIsMember checks if a member exists in a set
func (rc *RedisClient) SIsMember(key, member string) (bool, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	exists, err := rc.client.SIsMember(ctx, key, member).Result()
	if err != nil {
		return false, fmt.Errorf("failed to SIsMember for key %s: %v", key, err)
	}

	return exists, nil
}

// SRem removes members from a set
func (rc *RedisClient) SRem(key string, members ...interface{}) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	count, err := rc.client.SRem(ctx, key, members...).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to SRem from key %s: %v", key, err)
	}

	return count, nil
}

// HSet sets field in hash
func (rc *RedisClient) HSet(key, field string, value interface{}) error {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	jsonValue, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %v", err)
	}

	if err := rc.client.HSet(ctx, key, field, jsonValue).Err(); err != nil {
		return fmt.Errorf("failed to HSet for key %s, field %s: %v", key, field, err)
	}

	return nil
}

// HGet gets a field from hash
func (rc *RedisClient) HGet(key, field string, dest interface{}) error {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	jsonValue, err := rc.client.HGet(ctx, key, field).Bytes()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("field not found: %s in key %s", field, key)
		}
		return fmt.Errorf("failed to HGet for key %s, field %s: %v", key, field, err)
	}

	if err := json.Unmarshal(jsonValue, dest); err != nil {
		return fmt.Errorf("failed to unmarshal value: %v", err)
	}

	return nil
}

// HGetAll gets all fields from hash
func (rc *RedisClient) HGetAll(key string) (map[string]string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	result, err := rc.client.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to HGetAll for key %s: %v", key, err)
	}

	return result, nil
}

// HDel deletes fields from hash
func (rc *RedisClient) HDel(key string, fields ...string) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	count, err := rc.client.HDel(ctx, key, fields...).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to HDel for key %s: %v", key, err)
	}

	return count, nil
}

// Publish publishes a message to a channel
func (rc *RedisClient) Publish(channel string, message interface{}) error {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %v", err)
	}

	if err := rc.client.Publish(ctx, channel, jsonMessage).Err(); err != nil {
		return fmt.Errorf("failed to publish to channel %s: %v", channel, err)
	}

	return nil
}

// Subscribe subscribes to channels
func (rc *RedisClient) Subscribe(channels ...string) *redis.PubSub {
	return rc.client.Subscribe(rc.ctx, channels...)
}

// KeysWithPrefix returns all keys with the given prefix
func (rc *RedisClient) KeysWithPrefix(prefix string) ([]string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 5*time.Second)
	defer cancel()

	pattern := prefix + "*"
	keys, err := rc.client.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get keys with prefix %s: %v", prefix, err)
	}

	return keys, nil
}

// DeleteByPrefix deletes all keys with the given prefix
func (rc *RedisClient) DeleteByPrefix(prefix string) (int64, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 10*time.Second)
	defer cancel()

	// Get keys with prefix
	keys, err := rc.KeysWithPrefix(prefix)
	if err != nil {
		return 0, err
	}

	if len(keys) == 0 {
		return 0, nil
	}

	// Delete keys
	count, err := rc.client.Del(ctx, keys...).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to delete keys with prefix %s: %v", prefix, err)
	}

	rc.logger.WithFields(logrus.Fields{
		"prefix": prefix,
		"count":  count,
	}).Info("Deleted keys by prefix")
	return count, nil
}

// GetCacheEntry retrieves a cache entry with metadata
func (rc *RedisClient) GetCacheEntry(key string) (*CacheEntry, error) {
	var entry CacheEntry
	if err := rc.Get(key, &entry); err != nil {
		return nil, err
	}
	entry.Key = key
	return &entry, nil
}

// SetCacheEntry stores a cache entry with metadata
func (rc *RedisClient) SetCacheEntry(key string, value interface{}, expiration time.Duration) error {
	entry := CacheEntry{
		Value:      value,
		Expiration: time.Now().Add(expiration),
		CreatedAt:  time.Now(),
		Key:        key,
	}
	return rc.Set(key, entry, expiration)
}

// IsCacheValid checks if a cache entry is still valid
func (rc *RedisClient) IsCacheValid(key string) (bool, error) {
	entry, err := rc.GetCacheEntry(key)
	if err != nil {
		return false, err
	}
	return time.Now().Before(entry.Expiration), nil
}

// ClearCache clears the entire cache (use with caution!)
func (rc *RedisClient) ClearCache() error {
	ctx, cancel := context.WithTimeout(rc.ctx, 30*time.Second)
	defer cancel()

	// Flush all databases
	if err := rc.client.FlushAll(ctx).Err(); err != nil {
		return fmt.Errorf("failed to clear cache: %v", err)
	}

	rc.logger.Info("Cache cleared successfully")
	return nil
}

// GetStats returns Redis server statistics
func (rc *RedisClient) GetStats() (map[string]string, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 2*time.Second)
	defer cancel()

	info, err := rc.client.Info(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get Redis info: %v", err)
	}

	stats := make(map[string]string)
	lines := parseRedisInfo(info)
	for key, value := range lines {
		stats[key] = value
	}

	return stats, nil
}

// parseRedisInfo parses Redis INFO command output
func parseRedisInfo(info string) map[string]string {
	result := make(map[string]string)
	var currentSection string

	for _, line := range splitLines(info) {
		if line == "" {
			continue
		}
		if line[0] == '#' {
			currentSection = line[2:]
			continue
		}
		if idx := indexOf(line, ':'); idx != -1 {
			key := line[:idx]
			value := line[idx+1:]
			result[currentSection+"."+key] = value
		}
	}

	return result
}

// Helper functions
func splitLines(s string) []string {
	var lines []string
	start := 0
	for i, c := range s {
		if c == '\n' {
			lines = append(lines, s[start:i])
			start = i + 1
		}
	}
	if start < len(s) {
		lines = append(lines, s[start:])
	}
	return lines
}

func indexOf(s string, c byte) int {
	for i := 0; i < len(s); i++ {
		if s[i] == c {
			return i
		}
	}
	return -1
}

// Close closes the Redis client connection
func (rc *RedisClient) Close() error {
	if rc.client != nil {
		err := rc.client.Close()
		if err != nil {
			rc.logger.WithError(err).Error("Failed to close Redis client")
			return err
		}
		rc.logger.Info("Redis client closed")
	}
	return nil
}

// HealthCheck performs a health check on Redis
func (rc *RedisClient) HealthCheck() (bool, error) {
	ctx, cancel := context.WithTimeout(rc.ctx, 5*time.Second)
	defer cancel()

	// Check if we can ping Redis
	if err := rc.client.Ping(ctx).Err(); err != nil {
		return false, fmt.Errorf("Redis ping failed: %v", err)
	}

	// Check memory usage
	info, err := rc.client.Info(ctx, "memory").Result()
	if err != nil {
		return false, fmt.Errorf("failed to get Redis memory info: %v", err)
	}

	// Parse maxmemory and used_memory
	lines := parseRedisInfo(info)
	maxMemory := lines["memory.maxmemory"]
	usedMemory := lines["memory.used_memory"]

	if maxMemory != "0" && usedMemory != "" {
		rc.logger.WithFields(logrus.Fields{
			"max_memory":  maxMemory,
			"used_memory": usedMemory,
		}).Debug("Redis memory stats")
	}

	return true, nil
}

// WithLogger sets a custom logger for the Redis client
func (rc *RedisClient) WithLogger(logger *logrus.Logger) *RedisClient {
	rc.logger = logger
	return rc
}

// WithContext sets a custom context for the Redis client
func (rc *RedisClient) WithContext(ctx context.Context) *RedisClient {
	rc.ctx = ctx
	return rc
}

// GetClient returns the underlying Redis client
func (rc *RedisClient) GetClient() *redis.Client {
	return rc.client
}

// GetContext returns the current context
func (rc *RedisClient) GetContext() context.Context {
	return rc.ctx
}