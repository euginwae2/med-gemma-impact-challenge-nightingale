# Nightingale – Integrated Health Companion & Insurance Navigation Platform

![Nightingale Logo](https://img.shields.io/badge/Project-Nightingale-blue)  
![HAI-DEF](https://img.shields.io/badge/Models-HAI--DEF-green)  
![Google Cloud](https://img.shields.io/badge/Platform-Google_Cloud-orange)  
![License](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey)  
![Status](https://img.shields.io/badge/Status-Concept_Study-red)

## Important Notice

**This project is an experimental concept study developed for the MedGemma Impact Challenge. It is NOT intended for clinical use, medical diagnosis, treatment, or any healthcare decision-making. The system has not been validated for clinical safety or efficacy, and should not be deployed in production healthcare environments.**

---

## Overview

Nightingale is an AI-powered unified health companion platform that transforms fragmented healthcare and insurance experiences into a cohesive, patient‑centric ecosystem. It integrates multimodal clinical intelligence, affordability guidance, and administrative navigation into a single interface—bridging clinical care, financial clarity, and daily life.

## Key Features

### 1. **Unified Health Record Aggregator**

- Centralizes clinical notes, lab reports, insurance documents, and imaging studies into a queryable timeline.
- AI-highlighted critical events and insurance milestones.

### 2. **Health Literacy & Communication Bridge**

- Real‑time translation of medical and insurance jargon into patient‑friendly explanations.
- Multilingual support and radiology report simplification.

### 3. **Proactive Health Monitoring & Triage**

- Multimodal symptom, audio, and image‑based risk assessments.
- Insurance‑aware next‑step recommendations.

### 4. **Affordability & Insurance Navigator**

- Real‑time cost transparency and coverage analysis.
- Automated prior‑authorization drafting and appeal support.

### 5. **Social Determinants of Health (SDoH) Integrator**

- Personalized community resource recommendations based on clinical and life context.

## Architecture

Nightingale is built on a **hybrid, orchestrated microservices architecture with a centralized data mesh**:

- **Containerized Microservices** (Docker + Kubernetes)
- **Unified Health Record Store** (Google Cloud Spanner)
- **HAI‑DEF Model Serving Layer** (Vertex AI endpoints)
- **Event‑Driven Orchestration** (Google Pub/Sub + Cloud Workflows)
- **API Gateway & Security Proxy** (Google Cloud API Gateway)

## Getting Started

### Prerequisites

- Google Cloud Platform account
- Docker & Kubernetes
- Access to HAI‑DEF models (MedGemma, MedASR, HeAR, etc.)
- FHIR‑compliant EHR access (for integration)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-team/nightingale-platform.git
   cd nightingale-platform
   ```

2. **Set Up Environment Variables**

   ```bash
   cp .env.example .env
   # Edit .env with your GCP credentials and model endpoints
   ```

3. **Deploy with Kubernetes**

   ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

4. **Run Data Ingestion Service**
   ```bash
   python scripts/ingestion_pipeline.py
   ```

## Project Structure

```
nightingale-platform/
├── k8s/                    # Kubernetes deployment files
├── src/
│   ├── data_ingestion/    # FHIR/DICOM ingestion services
│   ├── model_serving/     # HAI-DEF model endpoints
│   ├── workflow_engine/   # Prior-auth & appeal automation
│   └── ui/                # React-based frontend (Material Design 3)
├── scripts/               # Utility scripts
├── docs/                  # Documentation
└── tests/                 # Unit & integration tests
```

## Verification & Testing

Refer to `4_design_solution_definition.md` for detailed verification plans, including:

- **VP‑01:** Document ingestion latency (≤60 seconds)
- **VP‑02:** UHR query performance (p95 <2 seconds)
- **VP‑04:** Triage alignment with clinician consensus (≥80%)

Run test suite:

```bash
pytest tests/ --verbose
```

## HAI‑DEF Model Integration

Nightingale leverages the following HAI‑DEF models:

- **MedGemma (27B):** Clinical reasoning & explanation generation
- **MedASR:** Clinical conversation transcription
- **HeAR:** Respiratory monitoring via audio
- **CXR/Derm/Path Models:** Image‑based triage
- **LangExtract:** NLP for document parsing

## Success Metrics

- **Patient Outcomes:** Reduced readmissions, improved adherence
- **System Efficiency:** Lower administrative burden, higher prior‑auth approval rates
- **Financial Impact:** Lower total cost of care, reduced patient bad debt

## License

This project is licensed under the **CC BY 4.0** license.  
Winning submissions must grant Competition Sponsor (Google Research) an open‑source license for the code and model.

## Acknowledgments

- **Google Research** for hosting the MedGemma Impact Challenge
- **HAI‑DEF Team** for providing the foundational models
- **Kaggle** for the competition platform

## Contact

For questions or contributions, please open an issue in this repository or contact the team via Kaggle.

---

_This project was developed for the **MedGemma Impact Challenge** (January–February 2026)._  
_All use of HAI‑DEF models is subject to the HAI‑DEF Terms of Use._  
_⚠️ **Warning:** This is a conceptual prototype and should not be used in clinical settings._
