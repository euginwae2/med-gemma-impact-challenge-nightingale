I'll help you create a simplified concept study version of Nightingale Platform using open source components, HuggingFace for inference, and a docker-compose setup.

# **Nightingale Platform - Concept Study (Simplified)**

## **Architecture Overview**
```
┌─────────────────────────────────────────────────────┐
│                Docker Compose Stack                  │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │PostgreSQL│  │  Redis   │  │  MinIO   │          │
│  │ (UHR DB) │  │(Cache/Queue)│ (Object Store) │     │
│  └──────────┘  └──────────┘  └──────────┘          │
│          │            │            │               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ API Gateway ││Backend API││AI Service │          │
│  │  (Go)      ││  (Go)     ││ (Python)  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│          │            │            │               │
│  ┌──────────────────────────────────────┐           │
│  │          Frontend (React)            │           │
│  │         (Optional - For Demo)        │           │
│  └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

## **docker-compose.yml**
```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: nightingale
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache & Message Queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Object Storage (for DICOM/audio/images)
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # API Gateway (Go)
  gateway:
    build: ./gateway
    ports:
      - "8080:8080"
    environment:
      - REDIS_URL=redis://redis:6379
      - BACKEND_URL=http://backend:8081
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      redis:
        condition: service_healthy
      backend:
        condition: service_started
      ai-service:
        condition: service_started

  # Backend API Service (Go)
  backend:
    build: ./backend
    ports:
      - "8081:8081"
    environment:
      - DATABASE_URL=postgres://admin:admin123@postgres:5432/nightingale?sslmode=disable
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy

  # AI Service (Python with HuggingFace)
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - HF_HOME=/app/models
      - MODEL_CACHE_DIR=/app/models
      - REDIS_URL=redis://redis:6379
    volumes:
      - huggingface_models:/app/models
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    # Remove GPU section if no GPU available

  # Frontend (Optional - for demo)
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
    depends_on:
      - gateway

volumes:
  postgres_data:
  redis_data:
  minio_data:
  huggingface_models:
```

## **Project Structure**
```
nightingale-concept/
├── docker-compose.yml
├── gateway/
│   ├── Dockerfile
│   ├── go.mod
│   └── main.go
├── backend/
│   ├── Dockerfile
│   ├── go.mod
│   ├── cmd/
│   ├── internal/
│   │   ├── api/
│   │   ├── database/
│   │   ├── services/
│   │   └── models/
│   └── pkg/
├── ai-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   └── utils.py
│   └── models/
│       └── .gitignore
└── frontend/ (optional)
    ├── Dockerfile
    ├── package.json
    └── src/
```

## **Key Component Details**

### **1. Gateway (Go)**
**Dockerfile:**
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o gateway ./main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/gateway .
EXPOSE 8080
CMD ["./gateway"]
```

**Main Features:**
- Rate limiting using Redis
- Authentication (JWT)
- Request routing to backend/ai-service
- Request logging

### **2. Backend (Go)**
**Dockerfile:**
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o backend ./cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/backend .
EXPOSE 8081
CMD ["./backend"]
```

**Core Services:**
- Patient/UHR management (PostgreSQL)
- FHIR data import (simulated)
- Insurance rule engine (simplified)
- Workflow management

### **3. AI Service (Python)**
**Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create models directory
RUN mkdir -p /app/models

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**requirements.txt:**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
transformers==4.35.0
torch==2.1.0
sentencepiece==0.1.99
accelerate==0.24.1
redis==5.0.1
pydantic==2.5.0
```

**AI Models (HuggingFace):**
```python
# Simplified model mapping
MODELS = {
    "clinical_ner": "emilyalsentzer/Bio_ClinicalBERT",
    "symptom_checker": "microsoft/BiomedVLP-CXR-BERT-specialized",
    "explanation": "google/flan-t5-base",  # For medical explanations
    "summarization": "facebook/bart-large-cnn",
    "insurance_parser": "microsoft/layoutlmv3-base",  # Document understanding
}
```

## **Simplified Key Features**

### **Core Functions:**
1. **Data Ingestion** (simplified)
   - CSV/FHIR JSON import
   - Manual patient data entry API
   - File upload to MinIO

2. **AI Services**
   - Symptom analysis via HuggingFace models
   - Medical term explanation
   - Document processing (insurance PDFs)
   - Basic triage recommendations

3. **UHR Management**
   - PostgreSQL with JSONB fields for flexibility
   - Basic timeline view
   - Patient data aggregation

4. **Insurance Navigation** (simulated)
   - Mock coverage rules
   - Cost estimation (simplified formulas)
   - Basic prior-auth workflow

## **Development Commands**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build backend

# Run with GPU support (if available)
docker-compose --profile gpu up -d

# Initialize database
docker-compose exec backend ./migrate init
```

## **Open Source Alternatives**
1. **FHIR Server**: HAPI FHIR (Java) or IBM FHIR Server
2. **ELK Stack**: For logging/analytics
3. **Keycloak**: For authentication/authorization
4. **PostgreSQL + TimescaleDB**: For time-series medical data
5. **Apache Kafka**: For event streaming (if needed)

## **Next Steps for Concept Study**
1. **Week 1-2**: Set up basic infrastructure
2. **Week 3-4**: Implement core APIs and database
3. **Week 5-6**: Integrate HuggingFace models
4. **Week 7-8**: Create demo frontend and test workflows

This simplified architecture maintains the core concepts while being practical for a concept study with open source tools and manageable complexity.