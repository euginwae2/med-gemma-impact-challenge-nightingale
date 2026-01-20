# **Implementation & Coding Work Directive - EPS-05: API Gateway**

**Artifact Header**

- **Project Title:** Nightingale – Integrated Health Companion & Insurance Navigation Platform
- **Subsystem ID:** EPS-05 (API Gateway)
- **Date:** January 20, 2026
- **Prepared by:** Lead Implementation Engineer Agent (SE 2.1)
- **Target Baseline:** Product Baseline (Post-CDR)
- **For Review:** Implementation Kick-off

---

## **Section 1: Readiness Checklist**

### **1.1 Personnel Skills & Training Required**

| Role                              | Required Skills / Certification                                            | Training Needed                                                   |
| --------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Cloud Infrastructure Engineer** | Google Cloud Certified - Professional Cloud Architect, Terraform Associate | Google Cloud API Gateway deep dive, OpenAPI 3.0 spec validation   |
| **Security Engineer**             | OAuth 2.0 / JWT implementation, IAM policy design                          | HIPAA/GDPR compliance for cloud logging, FIPS 140-2/3 encryption  |
| **DevOps Engineer**               | CI/CD with Cloud Build, Kubernetes, monitoring with Cloud Ops              | API Gateway deployment patterns, blue-green deployment strategies |
| **QA / Test Engineer**            | API testing (Postman, k6), load testing, logging validation                | Cloud Logging querying, latency measurement tools                 |

### **1.2 Required Enabling Products**

| Tool / Environment    | Purpose                                                      | Version / Spec           |
| --------------------- | ------------------------------------------------------------ | ------------------------ |
| **Google Cloud SDK**  | CLI for GCP resource management                              | Latest stable            |
| **Terraform**         | Infrastructure as Code for gateway deployment                | ≥1.5.0                   |
| **Cloud Build**       | CI/CD pipeline for configuration validation and deployment   | Managed service          |
| **OpenAPI Validator** | Validate `gateway-config.yaml` against OpenAPI 3.0.3         | `openapi-spec-validator` |
| **k6 / Locust**       | Load testing for rate limiting and performance validation    | Latest                   |
| **Git Repository**    | Version control for gateway configuration and Terraform code | GitHub / GitLab          |

### **1.3 Design Documentation Verification**

- [x] **EPS-05 Detailed Design Specification** reviewed and baselined.
- [x] **Interface Requirements (IF-EXT-01, IF-INT-01, IF-LOG-01, IF-MON-01)** clearly defined.
- [x] **Build-to Specifications (BT-05-001 through BT-05-007)** are unambiguous and verifiable.
- [x] **DTR-E02** fully allocated to EPS-05.

---

## **Section 2: Tactical Build/Code Steps**

### **2.1 Step 1: Infrastructure as Code (IaC) Setup**

1. **Create Terraform module structure:**
   ```
   modules/api-gateway/
   ├── main.tf
   ├── variables.tf
   ├── outputs.tf
   └── versions.tf
   ```
2. **Define Google Cloud API Gateway resource** in `main.tf`:
   ```hcl
   resource "google_api_gateway_gateway" "nightingale_gateway" {
     provider     = google-beta
     gateway_id   = "nightingale-api-gateway"
     display_name = "Nightingale API Gateway"
     region       = var.primary_region
   }
   ```
3. **Configure multi-region deployment** (BT-05-001):
   - Deploy identical gateway configuration in `us-central1` and `europe-west1`.
   - Use Terraform `count` and `for_each` for DRY configuration.

### **2.2 Step 2: OpenAPI Configuration Development**

1. **Create `gateway-config.yaml`** adhering to OpenAPI 3.0.3.
2. **Define all external endpoints** (BT-05-002):
   ```yaml
   paths:
     /api/v1/triage:
       post:
         x-google-backend:
           address: https://triage-service.namespace.svc.cluster.local
         security:
           - oauth2: []
     /api/v1/timeline:
       get:
         x-google-backend:
           address: https://data-service.namespace.svc.cluster.local
         security:
           - oauth2: []
   ```
3. **Apply rate limiting extensions** (BT-05-004):
   ```yaml
   x-google-ratelimit:
     metrics:
       - name: requests
         unit: "1"
     quotas:
       - name: requests-per-key
         metric: requests
         unit: "1/min"
         values:
           STANDARD: 60
   ```

### **2.3 Step 3: Security Implementation**

1. **Configure OAuth 2.0 JWT validation** (BT-05-003):
   ```yaml
   securityDefinitions:
     oauth2:
       authorizationUrl: ""
       flow: "implicit"
       type: "oauth2"
       x-google-issuer: "https://accounts.google.com"
       x-google-jwks_uri: "https://www.googleapis.com/oauth2/v3/certs"
       x-google-audiences: "nightingale-api-audience"
   ```
2. **Implement header stripping** (BT-05-006):
   - Configure gateway to remove `Authorization`, `X-API-Key` from downstream requests.
3. **Enable TLS 1.3** and HSTS headers via Google Cloud Load Balancer configuration.

### **2.4 Step 4: Logging & Monitoring Integration**

1. **Configure structured JSON logging** (BT-05-005):
   - Enable Cloud Logging integration.
   - Ensure each log includes: `requestId`, `timestamp`, `clientIp`, `endpoint`, `responseCode`, `latency`, `apiKeyId`.
2. **Set up Cloud Monitoring** (IF-MON-01):
   - Create dashboards for:
     - Request count per endpoint
     - Latency percentiles (p50, p95, p99)
     - Error rate (4xx, 5xx)
     - Rate limit hits

### **2.5 Step 5: Custom Error Response Implementation**

1. **Create error response template** (BT-05-007):
   ```json
   {
     "error": {
       "code": "GATEWAY_429",
       "message": "Rate limit exceeded. Please try again later.",
       "details": "Burst: 100 req/sec, Sustained: 50 req/sec"
     }
   }
   ```
2. **Map HTTP status codes to custom errors**:
   - 401 → Invalid or missing token
   - 429 → Rate limit exceeded
   - 5xx → Internal gateway error

---

## **Section 3: In-Process Quality Gates**

### **3.1 Quality Gate 1: Code/Configuration Review**

| Checkpoint                        | Trigger                           | Reviewers                             | Exit Criteria                                                          |
| --------------------------------- | --------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| **Terraform Code Review**         | After `main.tf` completion        | Cloud Engineer, Security Engineer     | No high-risk IaC issues, multi-region support validated                |
| **OpenAPI Spec Review**           | After `gateway-config.yaml` draft | API Architect, DevOps Engineer        | OpenAPI 3.0.3 validation passes, all endpoints mapped correctly        |
| **Security Configuration Review** | After OAuth/JWT setup             | Security Engineer, Compliance Officer | JWT validation logic matches BT-05-003, headers stripped per BT-05-006 |

### **3.2 Quality Gate 2: Unit & Integration Testing**

| Test ID       | Requirement Verified           | Test Procedure                            | Success Criteria                                          |
| ------------- | ------------------------------ | ----------------------------------------- | --------------------------------------------------------- |
| **UT-05-001** | BT-05-003 (JWT Validation)     | Send request with expired/invalid token   | Returns 401 with correct error format                     |
| **UT-05-002** | BT-05-004 (Rate Limiting)      | Send 60 requests in 1 sec with same key   | First 50 succeed, next 10 receive 429                     |
| **UT-05-003** | BT-05-005 (Logging)            | Send sample requests, query Cloud Logging | All requests logged with required fields within 100ms p99 |
| **IT-05-001** | IF-EXT-01 (External Interface) | Test HTTPS/TLS 1.3 enforcement            | Non-HTTPS requests rejected, HSTS header present          |
| **IT-05-002** | IF-INT-01 (Internal Routing)   | Test endpoint routing to backend services | Requests correctly proxied, headers stripped              |

### **3.3 Non-Conformance Handling**

- **Procedure:** If implementation deviates from any build-to requirement (BT-05-001 through BT-05-007), create a **Non-Conformance Report (NCR)**.
- **Routing:** Submit NCR to **Configuration Control Board (CCB)** for review.
- **Disposition:** CCB may approve deviation, require rework, or update baseline specification.

---

## **Section 4: Deliverable Metadata**

### **4.1 Acceptance Data Package Requirements**

| Deliverable                    | Format                        | Required Content                                              | Configuration ID         |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------- | ------------------------ |
| **As-Deployed Terraform Code** | Git repository with tags      | All `.tf` files, variable definitions, state files            | `EPS-05-TF-v1.0.0`       |
| **Gateway Configuration**      | YAML file + validation report | `gateway-config.yaml`, OpenAPI validation output              | `EPS-05-CFG-v1.0.0`      |
| **Deployment Records**         | Cloud Build logs + manual     | Blue-green deployment logs, rollback procedures               | `EPS-05-DEPLOY-20231030` |
| **Security Audit Log**         | JSON / CSV                    | IAM roles, OAuth settings, encryption configuration           | `EPS-05-SEC-AUDIT-v1`    |
| **Operator Manual**            | PDF / Markdown                | Gateway restart procedures, monitoring guide, troubleshooting | `EPS-05-OPS-MANUAL-v1.0` |

### **4.2 Lessons Learned & Anomaly Log**

- **Template for logging:**

  ```markdown
  ## Date: [YYYY-MM-DD]

  ### Issue/Anomaly: [Description]

  ### Assumption Made: [If any]

  ### Resolution: [How it was fixed or documented]

  ### Impact on Baseline: [None / Minor / Major]
  ```

- **Storage:** Maintain in project wiki under `EPS-05/Lessons-Learned`.

### **4.3 Configuration Identifiers**

| Item                       | Identifier                                                                         | Notes                               |
| -------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| **Git Repository**         | `github.com/nightingale-health/api-gateway`                                        | Tag releases with semver            |
| **Terraform State**        | `gs://nightingale-tf-state/api-gateway/`                                           | Backend state location              |
| **Cloud Gateway Instance** | `projects/nightingale-prod/locations/us-central1/gateways/nightingale-api-gateway` | Primary instance ID                 |
| **OpenAPI Spec Version**   | `3.0.3`                                                                            | Must be validated before deployment |

---

**Implementation Approval Chain:**

- Implementation Lead: ****\*\*****\_\_\_\_****\*\***** Date: \***\*\_\*\***
- Quality Assurance: ****\*\*****\_\_\_\_****\*\***** Date: \***\*\_\*\***
- Configuration Manager: ****\*\*****\_\_\_\_****\*\***** Date: \***\*\_\*\***

---

_Document generated in alignment with NASA SE 2.1 Product Implementation Process, ensuring traceability from design to realization._
