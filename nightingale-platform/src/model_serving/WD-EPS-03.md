# **Implementation & Coding Work Directive – AI Model Serving Component (EPS-03)**

---

## **Section 1: Readiness Checklist**

### **Personnel Skills & Training**

- **Container & DevOps Engineers:** Proficient in Docker, Kubernetes, GCP (Vertex AI, GCS, Cloud Build), CI/CD pipelines.
- **ML Engineers:** Experience with TensorFlow Serving 2.15 and/or PyTorch Serve 0.9.0, Python 3.11, gRPC/REST API development.
- **Security Engineers:** Knowledge of CIS Docker Benchmark, FIPS 140-2/3 cryptographic validation, HIPAA compliance.
- **SRE / Monitoring Engineers:** Familiar with OpenTelemetry, Cloud Monitoring, structured logging, and performance tuning.

### **Enabling Products**

- **Development Environment:**
  - Docker Desktop / Docker Engine v24+
  - Python 3.11 with `venv` or `conda`
  - Google Cloud SDK (`gcloud`) and `kubectl` configured
  - Vertex AI CLI and Python SDK (`google-cloud-aiplatform>=1.40`)
- **Build & Deployment Tools:**
  - Google Artifact Registry for container images
  - Google Cloud Build (EP-004)
  - Kubernetes 1.27+ (GKE)
- **Testing & Validation:**
  - Model Load Testing Harness (EP-001)
  - Model Validation Dataset (EP-002)
  - Static analysis: `hadolint` (Docker), `bandit` (Python)
  - Vulnerability scanner: Google Container Registry vulnerability scanner
- **Monitoring & Observability:**
  - OpenTelemetry SDK for Python
  - Cloud Monitoring API client

### **Design Documentation Verification**

- ✅ EPS-03 is baselined under Configuration Management (Product Baseline)
- ✅ All “code-to” specs (MS-CODE-001 to MS-CODE-005) are unambiguous and actionable
- ✅ Interface definitions (IF-MS-01 to IF-MS-05) are clear with protocol and schema details
- ✅ Performance tolerances (Section 1.2) are quantified and testable

---

## **Section 2: Tactical Build/Code Steps**

### **Step 2.1: Environment Setup & Repository Initialization**

1. **Clone the model-serving repository** from the configured source control (Git).
2. **Set up Python virtual environment:**
   ```bash
   python3.11 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Authenticate with GCP:**
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   gcloud container clusters get-credentials nightingale-cluster --region us-central1
   ```

### **Step 2.2: Model Container Implementation (MS-001)**

1. **Create Dockerfile with multi-stage build:**

   ```dockerfile
   # Builder stage
   FROM python:3.11-slim AS builder
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --user --no-cache-dir -r requirements.txt

   # Runtime stage
   FROM debian:12-slim
   WORKDIR /app
   COPY --from=builder /root/.local /root/.local
   ENV PATH=/root/.local/bin:$PATH
   COPY serve_model.py health_check.py ./
   EXPOSE 8500 8501 8080
   CMD ["python", "serve_model.py"]
   ```

2. **Implement health check endpoint (MS-CODE-001):**

   ```python
   # health_check.py
   from flask import Flask
   app = Flask(__name__)

   @app.route('/health', methods=['GET'])
   def health():
       return {'status': 'healthy'}, 200, {'Content-Type': 'application/json'}

   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=8080)
   ```

3. **Implement stateless inference logic (MS-CODE-002):**
   - All session data must be stored/retrieved via UHR Data Mesh (IF-MS-02).
   - Use environment variables for model version and artifact location.

4. **Implement structured logging (MS-CODE-003):**

   ```python
   import opentelemetry
   from opentelemetry import trace
   tracer = trace.get_tracer(__name__)

   def log_inference(request_id, model_id, latency_ms):
       structured_log = {
           "request_id": request_id,
           "model_id": model_id,
           "latency_ms": latency_ms,
           "timestamp": datetime.utcnow().isoformat() + "Z"
       }
       # Emit to OpenTelemetry collector
   ```

5. **Implement input validation (MS-CODE-004):**
   - Validate against `Model-Inference-API v1` schema using Pydantic.
   - Return HTTP 400 with JSON error details if invalid.

6. **Implement graceful shutdown (MS-CODE-005):**
   ```python
   import signal
   def handle_sigterm(signum, frame):
       # Finish ongoing inferences
       # Close connections
       sys.exit(0)
   signal.signal(signal.SIGTERM, handle_sigterm)
   ```

### **Step 2.3: Model API Endpoint Implementation (MS-002)**

1. **Expose gRPC (port 8500) and REST (port 8501) endpoints.**
2. **Implement TLS 1.3 with ECDHE-RSA-AES256-GCM-SHA384 cipher suite.**
3. **Conform to `Model-Inference-API v1` spec for request/response schemas.**

### **Step 2.4: Model Artifact Storage Setup (MS-003)**

1. **Create GCS bucket with CMEK:**

   ```bash
   gsutil mb -l us-central1 gs://nightingale-models-{PROJECT_ID}
   gsutil kms authorize -k projects/{PROJECT_ID}/locations/us/keyRings/{KEYRING}/cryptoKeys/{KEY}
   ```

2. **Upload model artifacts:**
   ```bash
   gsutil cp model.pb gs://nightingale-models-{PROJECT_ID}/medgemma/v1.2/
   ```

### **Step 2.5: Vertex AI Model Registry Integration (MS-004)**

1. **Register model:**
   ```python
   from google.cloud import aiplatform
   aiplatform.init(project=PROJECT_ID, location='us-central1')
   model = aiplatform.Model.upload(
       display_name='medgemma-27b-text',
       artifact_uri='gs://nightingale-models-{PROJECT_ID}/medgemma/v1.2/',
       serving_container_image_uri='us-central1-docker.pkg.dev/.../medgemma:v1.2'
   )
   ```

### **Step 2.6: Orchestration Client Implementation (MS-005)**

1. **Implement retry logic with exponential backoff:**
   ```python
   from google.api_core.retry import Retry
   retry_policy = Retry(
       initial=1.0,
       maximum=10.0,
       multiplier=2.0,
       deadline=30.0,
       predicate=lambda e: isinstance(e, (ServiceUnavailable, InternalServerError))
   )
   ```

### **Step 2.7: Interface Implementation**

- **IF-MS-01:** OAuth2 token validation via `https://auth.nightingale.cloud`.
- **IF-MS-02:** HTTP/2 client for UHR Data Mesh using service account JSON.
- **IF-MS-03:** gRPC client for Vertex AI Model Registry.
- **IF-MS-04:** Cloud Monitoring v3 API client for custom metrics.
- **IF-MS-05:** DICOMweb WADO-RS client with OAuth2 bearer token.

---

## **Section 3: In-Process Quality Gates**

### **Quality Gate 1: Code Review & Static Analysis**

- **Trigger:** Before merging to `main` branch.
- **Activities:**
  - Peer review of Dockerfile and Python code.
  - Run `hadolint` on Dockerfile.
  - Run `bandit` and `pylint` on Python code.
- **Exit Criteria:** Zero critical/high vulnerabilities, 100% compliance with PEP 8 and internal style guide.

### **Quality Gate 2: Unit & Integration Testing**

- **Trigger:** After each commit in CI pipeline.
- **Activities:**
  - Run unit tests for health check, validation, logging.
  - Test model inference with mock data (EP-002).
  - Validate API schemas (OpenAPI/gRPC).
- **Exit Criteria:** ≥90% code coverage, all tests pass.

### **Quality Gate 3: Container Security Scan**

- **Trigger:** After Docker image build.
- **Activities:**
  - Scan with Google Container Registry vulnerability scanner.
  - Verify CIS Docker Benchmark compliance.
- **Exit Criteria:** No CVEs above Medium severity.

### **Quality Gate 4: Performance & Load Testing**

- **Trigger:** Before deployment to staging.
- **Activities:**
  - Use EP-001 to simulate 1,000+ concurrent users.
  - Measure p95 latency, error rates, cold-start times.
- **Exit Criteria:** Meet all tolerances in Section 1.2.

### **Non-Conformance Handling**

- Any deviation from EPS-03 must be documented and submitted to the **Configuration Control Board (CCB)** via a **Change Request (CR)**.
- Work cannot proceed until CR is approved and baseline is updated.

---

## **Section 4: Deliverable Metadata**

### **Acceptance Data Package Contents**

1. **As-Built Documentation:**
   - Final Dockerfile(s) and build scripts
   - Source code repository (tagged with version)
   - Kubernetes manifests (Deployment, Service, ConfigMap)
   - Terraform/GCP Deployment Manager scripts

2. **Test Reports:**
   - Unit test results and coverage report
   - Integration test logs
   - Security scan results
   - Load test performance report

3. **Operational Manuals:**
   - Deployment runbook
   - Monitoring & alerting guide
   - Troubleshooting guide (common errors, rollback steps)

4. **Lessons Learned & Anomalies Log:**
   - Document any assumptions, workarounds, or deviations
   - Record any performance anomalies and resolutions
   - Capture configuration nuances for future reference

### **Configuration Identifiers**

- **Container Image Tag:** `nightingale/medgemma:v1.2.0`
- **Git Commit Hash:** `abc123def`
- **Build ID:** `cloud-build-xyz`
- **Kubernetes Deployment:** `medgemma-deploy-v1.2.0`
- **Vertex AI Endpoint ID:** `projects/{PROJECT_ID}/locations/us-central1/endpoints/{ENDPOINT_ID}`

---

**Approval Signatures:**

- Lead Implementation Engineer: **********\_\_\_\_********** Date: ****\_****
- Quality Assurance Lead: **********\_\_\_\_********** Date: ****\_****
- Configuration Manager: **********\_\_\_\_********** Date: ****\_****

_This directive is now under Configuration Management. All implementation activities must adhere to these steps and report non-conformances to the CCB._
