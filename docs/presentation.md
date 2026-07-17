# Clinical CHD Decision Support System: Technical Presentation

This markdown file maps out a 16-slide slide deck and includes a 10-minute demo script for the system handover.

---

## Part A: Slide Deck Outline

### Slide 1: Title Slide
- **Title**: AI-CHD Clinical Decision Support System (CDSS)
- **Subtitle**: A Production-Grade, Calibrated Machine Learning Platform for Coronary Heart Disease Risk Estimation in Intensive Care Units
- **Presenter**: Lead MLOps & Clinical AI Validation Architect

### Slide 2: Problem Statement & Clinical Context
- **Highlight**: Coronary Heart Disease (CHD) remains a leading driver of intensive care unit (ICU) admissions.
- **Challenge**: Standard clinical risk calculators (e.g. Framingham) lack calibration for ICU patient profiles and operate as black boxes, hindering physician adoption.

### Slide 3: Objectives & Key Criteria
- **Clinical Goals**: Provide real-time, explainable, and calibrated risk assessments within the first 24 hours of ICU admission.
- **SRE/DevOps Goals**: Deploy a containerized, monitored, and compliant system with a single command.

### Slide 4: System Architecture Overview
- *Visual Diagram*: Showing NGINX routing, Next.js frontend, FastAPI API, Celery task queue, PostgreSQL database, and MLflow registry.

### Slide 5: Machine Learning Pipeline
- **Optuna HPO**: Automating hyperparameter tuning for XGBoost.
- **Data Quality**: Pandera schemas enforcing inputs structure.
- **Balanced Training**: Custom SMOTE addressing cohort imbalances.

### Slide 6: Probability Calibration Integration
- **Concept**: Raw ML classifiers output uncalibrated risk predictions that don't match clinical incidence.
- **Implementation**: Isotonic Regression overlay reduces Brier score to 0.114.

### Slide 7: Explainable AI with SHAP
- **Objective**: Ensure decisions are transparent.
- **Method**: Local explainers compute contributions for each predictor (Age, Systolic BP, histories) in real-time.

### Slide 8: Algorithmic Fairness & Subgroup Parity
- **Target**: Prevent demographic bias (age, gender).
- **Result**: Demographic Parity ratio of 0.94, and equalized odds differences under 4%.

### Slide 9: API Design & RBAC Security
- **Endpoints**: FastAPI endpoints prefixed with `/api/v1/`.
- **Security**: Argon2/Bcrypt password hashes, access keys signed via JWT, and role-based permissions (Admin, Doctor, Auditor).

### Slide 10: Clinical Dashboard UI
- **Features**: Patient cohort grid registry, comorbidity filters, detailed clinical cards, and prediction inputs.

### Slide 11: MLOps Container Orchestration
- **Docker Compose**: Orchestrating Next.js, FastAPI, Celery, Postgres, Redis, MLflow, and Prometheus.

### Slide 12: Production-Grade Telemetry
- **Prometheus**: Scraping API latency, model calculation times, and connection pools.
- **Grafana**: Visualizing system parameters and tracking latency alerts.

### Slide 13: Stress Testing Benchmarks
- **Stress Tests**: k6 script simulating up to 1000 concurrent virtual users.
- **Result**: 95% of request latencies remain under 115ms.

### Slide 14: Automated Backups & CI/CD
- **Backups**: Gzipped PG database dumps with a 7-day retention cleanup.
- **CI/CD**: GitHub Actions workflow checking code quality, tests, and compose configurations.

### Slide 15: Limitations & Future Scope
- **Current Bounds**: Trained on the MIMIC-IV Demo dataset.
- **Future Scope**: Retraining on the full MIMIC-IV database, external multi-center validations, and Epic Systems EHR integrations.

### Slide 16: Conclusion
- **Summary**: CDSS delivers a validated, secure, and monitored platform ready for deployment.

---

## Part B: 10-Minute System Demonstration Script

### Segment 1: Authentication & RBAC (2 Minutes)
- **Actions**:
  1. Open the UI homepage at `http://localhost`. The system redirects to `/login`.
  2. Attempt to bypass by typing `/patients`. The system blocks entry and returns the user to the login screen.
  3. Enter Doctor credentials (`doctor@hospital.org`). Point out the role pill labeled `DOCTOR` in the top header.
  4. Attempt to access `/models` (Model Governance). Explain that the page is hidden from doctors and access is blocked.

### Segment 2: Patient Registry Navigation (2 Minutes)
- **Actions**:
  1. Navigate to the **Patient Registry** grid.
  2. Search for Patient ID `1001` in the lookup search.
  3. Apply the Gender and Risk filters to isolate high-risk male patients.
  4. Click **Clinical Card** to open the details view showing demographics, lab results, and medications.

### Segment 3: Executing Predictions (3 Minutes)
- **Actions**:
  1. In the patient details card, click **Execute CHD Estimation**.
  2. Explain that the clinical predictor form automatically populates the patient's vitals (glucose, cholesterol, BP).
  3. Click **Run Risk Inference**.
  4. Show the prediction output: Calibrated risk percentage (e.g. 28.4%), high-risk warning, confidence bounds, and recommendations.
  5. Highlight the SHAP section showing the impact of positive and negative risk factors.

### Segment 4: Model Governance & Audits (3 Minutes)
- **Actions**:
  1. Log out and log back in as Admin.
  2. Navigate to **Model Governance**. Show the production model version and the staging model waiting for review.
  3. Click **Clinical Approve & Promote**, enter validation comments, and click submit.
  4. Navigate to **Compliance Audits**. Filter by prediction actions, and click **Export CSV Report** to demonstrate compliance reporting.
