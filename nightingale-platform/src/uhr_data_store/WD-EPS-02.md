# **Implementation & Coding Work Directive - Unified Health Record (UHR) Data Store (EPS-02)**

**Artifact Header**

- **Project Title:** Nightingale – Integrated Health Companion & Insurance Navigation Platform
- **Subsystem ID:** EPS‑02 – UHR Data Store Implementation
- **Date:** January 20, 2026
- **Prepared by:** Lead Implementation Engineer Agent (SE 2.1)
- **Target Baseline:** Product Realization (SE 2.0)
- **Review Gate:** Implementation Readiness Review (IRR)
- **Traceability Links:** EPS‑02 (Detailed Design Specification), DTR‑A03, FR‑09, PR‑01, IF‑UHR‑QUERY, IF‑UHR‑INGEST

---

## **Section 1: Readiness Checklist**

### **1.1 Required Personnel & Skills**

| Role                           | Required Skills                                                         | Training/Certification                                      |
| ------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Cloud Database Engineer**    | Google Cloud Spanner administration, SQL optimization, Terraform        | Google Cloud Professional Data Engineer                     |
| **Backend Software Engineer**  | Go/Python, gRPC/REST API development, Pub/Sub integration               | Internal training on UHR‑SCHEMA‑1.0                         |
| **DevOps Engineer**            | Kubernetes, Cloud Build, CI/CD pipelines, monitoring (Cloud Monitoring) | Google Cloud Professional DevOps Engineer                   |
| **Security/Compliance Lead**   | HIPAA/GDPR compliance, IAM policy design, encryption key management     | Certified Information Systems Security Professional (CISSP) |
| **Quality Assurance Engineer** | Performance testing (Locust), data validation, automated testing        | ISTQB Certified Tester                                      |

### **1.2 Required Enabling Products & Tools**

| Tool/Product            | Version   | Purpose                                           | Access/Configuration                        |
| ----------------------- | --------- | ------------------------------------------------- | ------------------------------------------- |
| **Google Cloud SDK**    | ≥ 450.0.0 | CLI for GCP resource management                   | Configured with service account credentials |
| **Terraform**           | ≥ 1.5.0   | Infrastructure as Code (IaC) for Spanner instance | Module: `infra/spanner` (version 2.3+)      |
| **Go**                  | 1.21+     | Primary language for query service                | Environment: `GOPATH` configured            |
| **Python**              | 3.11+     | Data ingestion scripts, validation utilities      | Virtual environment with required packages  |
| **Docker & Kubernetes** | Latest    | Containerization and orchestration                | Access to GKE cluster (`nightingale-prod`)  |
| **Locust**              | 2.15+     | Load testing for performance verification         | Test scripts in `perf-test/locust/`         |
| **Git**                 | 2.40+     | Version control                                   | Repository: `github.com/org/nightingale`    |

### **1.3 Input Documentation Verification**

| Document                                          | Version | Status    | Verified For                                             |
| ------------------------------------------------- | ------- | --------- | -------------------------------------------------------- |
| **Detailed Design Spec (EPS‑02)**                 | 1.0     | Approved  | Sufficient detail for "build‑to"                         |
| **UHR‑SCHEMA‑1.0**                                | 1.0     | Baselined | Complete table definitions, indexes, constraints         |
| **Interface Specs (IF‑UHR‑QUERY, IF‑UHR‑INGEST)** | 1.0     | Approved  | Clear protocol, message format, performance requirements |
| **Security & Compliance Policy**                  | 2.1     | Approved  | Encryption, IAM, audit logging requirements              |

---

## **Section 2: Tactical Build/Code Steps**

### **2.1 Infrastructure Provisioning (Terraform)**

1. **Initialize Terraform Workspace**

   ```bash
   cd infra/spanner
   terraform init -backend-config="bucket=nightingale-tfstate" -backend-config="prefix=prod"
   ```

   - _Shall comply with_: DTR‑E01 (encryption), PR‑06 (availability)

2. **Review & Apply Spanner Configuration**

   ```bash
   terraform plan -var="instance_nodes=3" -var="enable_autoscaling=true"
   terraform apply -auto-approve
   ```

   - _Shall comply with_: §1.1 of EPS‑02 (instance configuration)

3. **Validate Instance Creation**
   - Verify Spanner instance `nightingale-uhr-instance` exists in `us-central1`
   - Confirm 3 nodes are provisioned and autoscaling is enabled
   - Verify encryption at rest uses CMEK (key: `projects/nightingale/locations/us/keyRings/uhr/cryptoKeys/spanner`)

### **2.2 Database Schema Deployment**

4. **Apply Baseline Schema Migration**

   ```bash
   # Use the migration tool
   go run cmd/migrate/main.go --env=prod --version=1.0
   ```

   - _Shall comply with_: UHR‑SCHEMA‑1.0 (§1.2 of EPS‑02)

5. **Create Secondary Indexes**

   ```sql
   -- Execute in Spanner console or via migration script
   CREATE INDEX idx_temporal_query ON observations(patient_id, observed_at DESC);
   CREATE INDEX idx_modality_lookup ON observations(patient_id, modality, observed_at DESC);
   CREATE INDEX idx_insurance_by_date ON insurance_events(patient_id, event_time DESC);
   ```

   - _Shall comply with_: Index specifications in §1.2 of EPS‑02

### **2.3 Query Service Implementation (Go)**

6. **Implement gRPC Service for IF‑UHR‑QUERY**
   - File: `services/query_service/main.go`
   - Must implement `QueryTimeline` RPC as defined in `proto/uhr_query.proto`
   - _Shall comply with_: p95 response time <2 seconds (DTR‑A03)

7. **Add Structured Logging & Metrics**
   - Integrate OpenTelemetry for latency metrics
   - Emit metrics to Cloud Monitoring via `exporters/googlecloud`

8. **Containerize Service**
   ```dockerfile
   # Dockerfile for query-service
   FROM golang:1.21-alpine
   WORKDIR /app
   COPY go.mod go.sum ./
   RUN go mod download
   COPY . .
   RUN go build -o query-service ./services/query_service
   CMD ["./query-service"]
   ```

### **2.4 Ingestion Pipeline Implementation (Python)**

9. **Implement Pub/Sub Consumer for IF‑UHR‑INGEST**
   - File: `pipelines/ingestion/consumer.py`
   - Must handle messages from `projects/nightingale/topics/uhr-ingest`
   - Validate message against JSON schema before insertion

10. **Implement Idempotent Insertion Logic**
    - Use Spanner’s `INSERT OR UPDATE` with unique `observation_id`
    - _Shall comply with_: idempotency requirement in IF‑UHR‑INGEST

11. **Deploy as Cloud Function**
    ```yaml
    # cloudbuild.yaml for deployment
    steps:
      - name: "gcr.io/cloud-builders/gcloud"
        args:
          [
            "functions",
            "deploy",
            "uhr-ingest-function",
            "--runtime=python311",
            "--trigger-topic=uhr-ingest",
          ]
    ```

### **2.5 Security & Compliance Configuration**

12. **Configure IAM Roles**

    ```bash
    # Assign least‑privilege roles
    gcloud spanner databases add-iam-policy-binding nightingale-uhr \
      --member="serviceAccount:query-service@nightingale.iam.gserviceaccount.com" \
      --role="roles/spanner.databaseUser"
    ```

13. **Enable Audit Logging**
    - Ensure Cloud Audit Logs are enabled for Spanner (Data Access and Admin Activity)
    - _Shall comply with_: §1.4 of EPS‑02

---

## **Section 3: In-Process Quality Gates**

### **3.1 Code-Level Quality Gates**

| Gate                        | Trigger                        | Verification Activity                     | Exit Criteria                  |
| --------------------------- | ------------------------------ | ----------------------------------------- | ------------------------------ |
| **Unit Test Coverage**      | Before commit to `main` branch | Run `go test ./... -cover`                | ≥85% coverage for new code     |
| **Static Analysis**         | Pre‑commit hook                | Run `golangci‑lint` and `bandit` (Python) | Zero high‑severity issues      |
| **Schema Migration Review** | Before applying to production  | Peer review of migration script           | Approved by Database Architect |

### **3.2 Integration Quality Gates**

| Gate                     | Trigger                         | Verification Activity                                               | Exit Criteria                           |
| ------------------------ | ------------------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| **Interface Compliance** | After service deployment        | Execute `integration_tests/if-uhr-query.test.go`                    | All interface tests pass                |
| **Performance Baseline** | Before load testing             | Run baseline query with 1000 records                                | p95 < 2 seconds                         |
| **Security Scan**        | After infrastructure deployment | Run `gcloud spanner databases list --filter="name:nightingale-uhr"` | Encryption and IAM configured correctly |

### **3.3 Non‑Conformance Handling**

- **Deviation from Specification:** If any build step cannot comply with a "shall" statement:
  1. Document deviation in `logs/non-conformance.md`
  2. Escalate to Configuration Control Board (CCB) via Jira ticket (`NIGHT‑CCB‑XXX`)
  3. Do not proceed until CCB approves waiver or design change

---

## **Section 4: Deliverable Metadata**

### **4.1 Acceptance Data Package Requirements**

| Deliverable                 | Format                  | Storage Location                                    | CM Identifier            |
| --------------------------- | ----------------------- | --------------------------------------------------- | ------------------------ |
| **As‑Built Schema**         | SQL DDL file            | `artifacts/uhr-schema-as-built.sql`                 | `UHR‑SCHEMA‑1.0‑ASBUILT` |
| **Source Code**             | Git repository snapshot | `github.com/org/nightingale/tree/prod‑release‑v1.0` | `CODE‑UHR‑V1.0`          |
| **Container Images**        | Docker images in GCR    | `gcr.io/nightingale/query-service:v1.0`             | `IMG‑QUERY‑V1.0`         |
| **Terraform State**         | `.tfstate` file         | `gs://nightingale-tfstate/prod/spanner.tfstate`     | `TF‑UHR‑V1.0`            |
| **Performance Test Report** | PDF/JSON                | `artifacts/perf-test-report-uhr.json`               | `PERF‑UHR‑V1.0`          |

### **4.2 Lessons Learned & Anomaly Log**

- **Log File:** `implementation/logs/lessons-learned-uhr.md`
- **Required Entries:**
  - Assumptions made during coding
  - Workarounds for tooling limitations
  - Performance bottlenecks identified
  - Security configuration challenges

### **4.3 Configuration Identifiers**

| Item                 | Identifier                                                                          | Description            |
| -------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| **Spanner Instance** | `projects/nightingale/instances/nightingale-uhr-instance`                           | Production instance    |
| **Database**         | `projects/nightingale/instances/nightingale-uhr-instance/databases/nightingale-uhr` | UHR database           |
| **Service Account**  | `query-service@nightingale.iam.gserviceaccount.com`                                 | Query service identity |
| **Encryption Key**   | `projects/nightingale/locations/us/keyRings/uhr/cryptoKeys/spanner`                 | CMEK for encryption    |

---

## **Approval & Handoff**

This **Implementation & Coding Work Directive** is approved for execution. Upon completion, the implemented UHR Data Store will be handed off to the **Verification & Validation (SE 4.0)** team for formal acceptance testing against VP‑UHR‑01 through VP‑UHR‑05.

- **Implementation Lead:** \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\*** Date: \***\*\_\*\***
- **Quality Assurance Lead:** \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\*** Date: \***\*\_\*\***
- **Configuration Manager:** \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\*** Date: \***\*\_\*\***

---

_Document generated in alignment with NASA SE 2.1 Product Implementation Process, ensuring traceability to the Product Baseline and preparation for V&V._
