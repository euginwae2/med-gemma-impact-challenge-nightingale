# **Implementation & Coding Work Directive - Workflow Orchestrator (EPS-04)**

**Project:** Nightingale Platform  
**Subsystem:** Workflow Orchestrator (EPS-04)  
**Prepared by:** Lead Implementation Engineer Agent (SE 2.1)  
**Date:** January 20, 2026  
**Baseline Reference:** Product Baseline (EPS-04 Detailed Design Specification)

---

## **Section 1: Readiness Checklist**

### **1.1 Personnel Skills & Training Required**

| Role                         | Required Skills/Certifications                                                 | Training Required (if not already certified)       |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| **Cloud Workflow Developer** | Google Cloud Workflows, YAML, Python 3.11, understanding of state machines     | Google Cloud Workflows Specialist (within 30 days) |
| **Backend Engineer**         | Python/FastAPI, gRPC, Cloud Firestore, Pub/Sub, Spanner                        | HIPAA-compliant cloud development (annual)         |
| **DevOps Engineer**          | Docker, Kubernetes, CI/CD (GitHub Actions), infrastructure as code (Terraform) | Google Cloud Professional DevOps Engineer          |
| **QA/Test Engineer**         | Automated testing (pytest), performance testing (Locust), security scanning    | ISTQB Certified Tester                             |
| **Security Engineer**        | OAuth 2.0, TLS, encryption standards (FIPS 140-2/3)                            | Certified Cloud Security Professional (CCSP)       |

### **1.2 Required Enabling Products & Tools**

| Tool/Environment        | Specification                                      | Purpose                                         |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------- |
| **Development IDE**     | VS Code with extensions: YAML, Python, Docker, Git | Code development and local testing              |
| **Version Control**     | GitHub Enterprise (private repo)                   | Source code and YAML workflow management        |
| **CI/CD Pipeline**      | GitHub Actions with self-hosted runners            | Automated build, test, and deployment           |
| **Container Registry**  | Google Artifact Registry                           | Docker image storage and versioning             |
| **Local Testing Suite** | Docker Desktop, Python 3.11, `workflows-emulator`  | Local workflow simulation and unit testing      |
| **Code Quality Tools**  | `black`, `flake8`, `mypy`, `bandit`, `yamllint`    | Code formatting, linting, and security scanning |
| **Test Framework**      | `pytest`, `pytest-asyncio`, `pytest-mock`          | Unit and integration testing                    |
| **Load Testing Tool**   | Locust.io with custom GCP integration              | Performance and scalability testing             |

### **1.3 Input Design Documentation Verification**

- [ ] **EPS-04 Detailed Design Specification** (v1.0) reviewed and baselined
- [ ] **Interface Control Matrix** (Section 2.1) approved and versioned
- [ ] **UHR JSON Schema v1.0** available in shared schema registry
- [ ] **Model-Inference-API v1 (MIA-1)** specification accessible
- [ ] **Workflow-Definition-YAML v1.2** schema validator deployed
- [ ] All **DTR traceability** verified (DTR-B02, DTR-C01)

---

## **Section 2: Tactical Build/Code Steps**

### **2.1 Step 1: Repository & Environment Setup**

1. **Create GitHub Repository Structure**

   ```bash
   nightingale-workflow-orchestrator/
   ├── .github/workflows/          # CI/CD pipelines
   ├── src/
   │   ├── workflows/              # YAML workflow definitions
   │   ├── custom_steps/           # Python Cloud Functions
   │   ├── lib/                    # Shared utilities
   │   └── tests/                  # Test suite
   ├── infra/                      # Terraform/IaC
   ├── docs/                       # Implementation notes
   └── scripts/                    # Build/deployment scripts
   ```

2. **Initialize Local Development Environment**
   - Install Python 3.11 with virtual environment
   - Install `google-cloud-workflows`, `google-cloud-firestore`, `grpcio`
   - Configure local Google Cloud SDK with service account

3. **Set Up Quality Gates in CI/CD**
   - Configure GitHub Actions to run on all PRs:
     - YAML schema validation
     - Python unit tests (≥90% coverage required)
     - Security scanning (Bandit, Snyk)
     - Docker image build and push

### **2.2 Step 2: Core Workflow Definition Implementation**

**Task 2.2.1: Implement Visit Summarization Workflow (`visit-summarization.yaml`)**  
_Shall comply with DTR-B02 (chained AI calls ≤30s) and BT-WF-003_

```yaml
# src/workflows/visit-summarization.yaml
main:
  params: [session_id, audio_uri, clinician_id]
  steps:
    - transcribe_audio:
        call: http.post
        args:
          url: ${AI_MEDASR_ENDPOINT}
          auth:
            type: OAuth2
            token: ${sys.get_env("AI_SERVICE_TOKEN")}
          body:
            session_id: ${session_id}
            audio_uri: ${audio_uri}
        result: transcription_result

    - extract_clinical_concepts:
        call: http.post
        args:
          url: ${AI_MEDGEMMA_ENDPOINT}
          body:
            text: ${transcription_result.text}
            task: "extract_clinical_entities"
        result: entities_result

    - generate_summary:
        call: http.post
        args:
          url: ${AI_MEDGEMMA_ENDPOINT}
          body:
            entities: ${entities_result.entities}
            task: "generate_plain_language_summary"
        result: summary_result

    - save_to_uhr:
        call: googleapis.firestore.v1.projects.databases.documents.createDocument
        args:
          parent: ${"projects/nightingale/databases/(default)/documents/visit-summaries"}
          collectionId: ${session_id}
          document:
            fields:
              summary: ${summary_result.summary}
              confidence: ${summary_result.confidence}
              generated_at: ${sys.time()}

    - return_result:
        return: ${summary_result}
```

**QA Checkpoint:** Peer review of YAML against `Workflow-Definition-YAML v1.2` schema

### **2.3 Step 3: Custom Step Functions Implementation**

**Task 2.3.1: Implement Complex Decision Logic (`prior_auth_decision.py`)**  
_Shall comply with BT-WF-002 (confidence-based branching)_

```python
# src/custom_steps/prior_auth_decision.py
import logging
from typing import Dict, Any
from google.cloud import firestore

class PriorAuthDecisionStep:
    """Custom step for prior-auth decision logic with confidence thresholds."""

    def __init__(self, firestore_client=None):
        self.firestore_client = firestore_client or firestore.Client()
        self.high_confidence_threshold = 0.8  # From BT-WF-002

    def execute(self, session_id: str, ai_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determine workflow path based on AI confidence score.

        Args:
            session_id: Unique workflow session identifier
            ai_output: Dictionary with 'confidence' and 'recommendation' keys

        Returns:
            Dictionary with 'next_step' and 'reason' keys
        """
        try:
            confidence = ai_output.get('confidence', 0.0)
            recommendation = ai_output.get('recommendation', '')

            # Log decision for audit trail
            self._log_decision(session_id, confidence, recommendation)

            # Apply confidence threshold (BT-WF-002)
            if confidence >= self.high_confidence_threshold:
                return {
                    'next_step': 'auto_draft_prior_auth',
                    'reason': f'High confidence ({confidence:.2f} ≥ {self.high_confidence_threshold})'
                }
            else:
                return {
                    'next_step': 'clinician_review_required',
                    'reason': f'Low confidence ({confidence:.2f} < {self.high_confidence_threshold})'
                }

        except Exception as e:
            logging.error(f"Prior auth decision failed: {e}")
            raise

    def _log_decision(self, session_id: str, confidence: float, recommendation: str):
        """Log decision to Firestore for audit trail."""
        doc_ref = self.firestore_client.collection('workflow_decisions').document(session_id)
        doc_ref.set({
            'timestamp': firestore.SERVER_TIMESTAMP,
            'confidence': confidence,
            'recommendation': recommendation,
            'threshold': self.high_confidence_threshold
        })
```

**QA Checkpoint:** Unit tests covering confidence threshold boundary cases (0.79, 0.80, 0.81)

### **2.4 Step 4: State Management Implementation**

**Task 2.4.1: Implement State Recovery Mechanism**  
_Shall comply with DTR-C01 and BT-WF-004 (≤2s recovery)_

```python
# src/lib/state_manager.py
import json
import asyncio
from datetime import datetime, timedelta
from google.cloud import firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

class WorkflowStateManager:
    """Manages workflow state persistence and recovery."""

    def __init__(self, collection_name='workflow_states'):
        self.client = firestore.Client()
        self.collection = self.client.collection(collection_name)
        self.checkpoint_interval = timedelta(minutes=5)  # From BT-WF-007

    async def save_checkpoint(self, workflow_id: str, state: dict) -> None:
        """
        Save workflow state checkpoint.

        Args:
            workflow_id: Unique workflow instance identifier
            state: Current workflow state dictionary
        """
        checkpoint_data = {
            'workflow_id': workflow_id,
            'state': json.dumps(state),
            'last_checkpoint': SERVER_TIMESTAMP,
            'version': '1.0'
        }

        # Use transaction for atomic write
        transaction = self.client.transaction()

        @firestore.transactional
        def update_in_transaction(transaction, doc_ref):
            snapshot = doc_ref.get(transaction=transaction)
            if snapshot.exists:
                transaction.update(doc_ref, checkpoint_data)
            else:
                transaction.set(doc_ref, checkpoint_data)

        doc_ref = self.collection.document(workflow_id)
        update_in_transaction(transaction, doc_ref)

    async def recover_state(self, workflow_id: str) -> dict:
        """
        Recover workflow state after interruption.

        Returns:
            Recovered state dictionary or empty dict if not found
        """
        start_time = datetime.utcnow()

        try:
            doc_ref = self.collection.document(workflow_id)
            snapshot = await asyncio.to_thread(doc_ref.get)

            if snapshot.exists:
                data = snapshot.to_dict()
                recovered_state = json.loads(data.get('state', '{}'))

                # Log recovery time for monitoring
                recovery_time = (datetime.utcnow() - start_time).total_seconds()
                if recovery_time > 2.0:
                    logging.warning(f"State recovery took {recovery_time}s > 2s threshold")

                return recovered_state
            return {}

        except Exception as e:
            logging.error(f"State recovery failed: {e}")
            return {}
```

**QA Checkpoint:** Fault injection test simulating service interruption during state save

### **2.5 Step 5: Interface Implementation**

**Task 2.5.1: Implement Circuit Breaker for External APIs**  
_Shall comply with BT-WF-006 (5 failures open, 60s reset)_

```python
# src/lib/circuit_breaker.py
import time
from typing import Callable, Any
from dataclasses import dataclass
from enum import Enum

class CircuitState(Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

@dataclass
class CircuitBreakerConfig:
    failure_threshold: int = 5  # From BT-WF-006
    reset_timeout: int = 60     # From BT-WF-006
    half_open_max_attempts: int = 3

class CircuitBreaker:
    """Implements circuit breaker pattern for external API calls."""

    def __init__(self, name: str, config: CircuitBreakerConfig = None):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0
        self.half_open_attempts = 0

    def execute(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection."""
        if self.state == CircuitState.OPEN:
            # Check if reset timeout has passed
            if time.time() - self.last_failure_time > self.config.reset_timeout:
                self.state = CircuitState.HALF_OPEN
                self.half_open_attempts = 0
            else:
                raise CircuitBreakerError(f"Circuit {self.name} is OPEN")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result

        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        """Handle successful execution."""
        if self.state == CircuitState.HALF_OPEN:
            self.half_open_attempts += 1
            if self.half_open_attempts >= self.config.half_open_max_attempts:
                self.state = CircuitState.CLOSED
                self.failure_count = 0

    def _on_failure(self):
        """Handle failed execution."""
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN

        elif (self.state == CircuitState.CLOSED and
              self.failure_count >= self.config.failure_threshold):
            self.state = CircuitState.OPEN

class CircuitBreakerError(Exception):
    """Raised when circuit breaker is open."""
    pass
```

**QA Checkpoint:** Integration test simulating 5 consecutive API failures

---

## **Section 3: In-Process Quality Gates**

### **3.1 Mandatory Peer Review Triggers**

| Trigger Condition              | Review Type        | Required Approvers                | Exit Criteria                                    |
| ------------------------------ | ------------------ | --------------------------------- | ------------------------------------------------ |
| New YAML workflow definition   | Code Review        | 2 Senior Devs + 1 Architect       | All comments addressed, schema validation passes |
| Custom step function > 100 LOC | Code Review        | 2 Backend Engineers               | 100% unit test coverage, security scan clean     |
| Interface implementation       | Design Review      | Lead Engineer + Security Engineer | Interface compliance test passes                 |
| Performance-critical code      | Performance Review | DevOps + Lead Engineer            | Load test shows ≤10% degradation                 |

### **3.2 Unit Test Requirements**

1. **Test Coverage Minimums:**
   - Custom step functions: ≥90% line coverage
   - State management: ≥95% line coverage
   - Circuit breaker: 100% branch coverage
2. **Required Test Scenarios:**
   - Workflow state recovery within 2s (BT-WF-004)
   - Confidence threshold branching (BT-WF-002)
   - Circuit breaker state transitions (BT-WF-006)
   - Concurrent workflow execution (BT-WF-005)

3. **Test Data Management:**
   - Use synthetic test data only (no PHI/PII)
   - Mock all external dependencies (AI endpoints, databases)
   - Include edge cases and error scenarios

### **3.3 Non-Conformance Handling Procedure**

If implementation deviates from specification:

1. **Immediate Action:** Stop work on affected component
2. **Document Deviation:** Create Deviation Report in GitHub Issues with:
   - Specification reference (DTR/BT ID)
   - Actual implementation
   - Justification for deviation
   - Impact assessment
3. **Escalation Path:**
   - Technical deviation → Technical Lead + Systems Engineer
   - Schedule/cost impact → Project Manager
   - Requirements impact → Configuration Control Board (CCB)
4. **Resolution:**
   - Update specification (if approved by CCB)
   - Re-implement to specification
   - Request waiver (last resort, requires sponsor approval)

---

## **Section 4: Deliverable Metadata**

### **4.1 Acceptance Data Package Requirements**

| Deliverable                   | Format                                    | Storage Location                                   | Retention Period |
| ----------------------------- | ----------------------------------------- | -------------------------------------------------- | ---------------- |
| **Source Code**               | GitHub repository with version tags       | GitHub Enterprise                                  | Permanent        |
| **YAML Workflow Definitions** | Versioned YAML files in `/src/workflows/` | GitHub + Artifact Registry                         | Permanent        |
| **Docker Images**             | Tagged images in Google Artifact Registry | GCR: `us.gcr.io/nightingale/workflow-orchestrator` | 5 years          |
| **Unit Test Results**         | JUnit XML format                          | GitHub Actions artifacts                           | 2 years          |
| **Code Quality Reports**      | SARIF format (security), coverage reports | GitHub Code Scanning                               | 2 years          |
| **Build Documentation**       | README.md, API documentation (OpenAPI)    | GitHub repo `/docs/`                               | Permanent        |
| **Deployment Scripts**        | Terraform modules, Kubernetes manifests   | GitHub repo `/infra/`                              | Permanent        |
| **Operator Manual**           | PDF + Confluence page                     | Confluence: "Nightingale Ops"                      | Permanent        |

### **4.2 Configuration Identifiers**

| Item                    | Identifier Format                  | Example                             | Purpose             |
| ----------------------- | ---------------------------------- | ----------------------------------- | ------------------- |
| **Workflow Definition** | `workflow-{name}-v{major}.{minor}` | `workflow-visit-summarization-v1.0` | Version control     |
| **Docker Image**        | `sha256:{hash}` + `{version}` tag  | `sha256:abc123...`, `:v1.2.3`       | Deployment tracking |
| **Git Commit**          | GitHub SHA + PR number             | `abc123def (#45)`                   | Change traceability |
| **Service Endpoint**    | DNS name + version path            | `workflows.nightingale.cloud/v1`    | Runtime addressing  |
| **Database Schema**     | `schema-{name}-v{major}`           | `schema-workflow-states-v1`         | Data migration      |

### **4.3 Lessons Learned & Assumptions Log**

**Template for Capture (to be completed during implementation):**

```markdown
## Implementation Log - [Date]

### Assumptions Made:

1. [Assumption about external API behavior]
2. [Assumption about performance characteristics]

### Anomalies Encountered:

1. [Unexpected behavior or bug]
2. [Workaround implemented]

### Lessons Learned:

1. [What worked well]
2. [What to improve next time]

### Risk Mitigations Added:

1. [Additional error handling added]
2. [Performance optimizations implemented]
```

**Storage:** GitHub Wiki page "Implementation-Logs" with quarterly review requirement.

---

## **Approval & Handoff**

This Implementation Work Directive authorizes the development team to commence coding of the Workflow Orchestrator subsystem. All work shall comply with the specified quality gates and deliverable requirements.

- **Implementation Lead:** ****\*\*****\_\_\_\_****\*\***** Date: \***\*\_\*\***
- **Quality Assurance:** ****\*\*****\_\_\_\_****\*\***** Date: \***\*\_\*\***
- **Configuration Manager:** ****\*\*****\_\_\_\_****\*\***** Date: \***\*\_\*\***

_Document generated in alignment with NASA SE 2.1 Product Implementation Process for high-assurance system development._
