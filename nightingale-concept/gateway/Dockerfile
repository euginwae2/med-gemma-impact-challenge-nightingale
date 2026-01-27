# Build stage
FROM golang:1.24.0-alpine AS builder

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
