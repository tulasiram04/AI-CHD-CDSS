# 🫀 AI-Powered Coronary Heart Disease Clinical Decision Support System (AI-CHD-CDSS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![MLflow](https://img.shields.io/badge/MLflow-2.9-0194E2.svg?style=flat&logo=mlflow)](https://mlflow.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)
[![CI/CD](https://github.com/tulasiram04/AI-CHD-CDSS/actions/workflows/ci_cd.yml/badge.svg)](https://github.com/tulasiram04/AI-CHD-CDSS/actions)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AI-CHD-CDSS** is a hospital-oriented **Clinical Decision Support System (CDSS)** designed for cardiologists, intensive care physicians, and clinical ward teams. The platform leverages Machine Learning and Explainable AI (XAI) to estimate 10-year **Coronary Heart Disease (CHD)** risk probabilities by synthesizing patient demographic profiles, physiological vital signs, laboratory chemistry, and cardiovascular risk histories.

Designed to enhance physician workflows, AI-CHD-CDSS acts as an intelligent clinical co-pilot—converting complex patient telemetry into clear, calibrated risk stratifications, evidence-based recommendations, and exportable hospital reports.

> ⚠️ **Clinical Disclaimer**: AI-CHD-CDSS is designed strictly as a Clinical Decision Support System to assist healthcare professionals. It is **not** an automated diagnostic device and is not intended to replace professional medical judgment or direct clinical evaluation.

---

## 📋 Table of Contents
- [Key Features](#-key-features)
- [Clinical Workflow](#-clinical-workflow)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [Dataset Specifications](#-dataset-specifications)
- [Machine Learning Model](#-machine-learning-model)
- [Explainable AI (SHAP)](#-explainable-ai-shap)
- [Clinical Interpretation Engine](#-clinical-interpretation-engine)
- [Risk Stratification Categories](#-risk-stratification-categories)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [REST API Reference](#-rest-api-reference)
- [Security & Access Control](#-security--access-control)
- [Hospital PDF Report Generator](#-hospital-pdf-report-generator)
- [System Screenshots](#-system-screenshots)
- [Installation & Local Setup](#-installation--local-setup)
- [Running Tests & Quality Assurance](#-running-tests--quality-assurance)
- [Deployment Guide](#-deployment-guide)
- [Future Enhancements](#-future-enhancements)
- [License & Disclaimer](#-license--disclaimer)

---

## ✨ Key Features

### 🩺 Clinical Intelligence & Prediction Engine
- **Dynamic AI Risk Prediction**: Generates model-driven probability estimations without hardcoded or randomized fallback percentages.
- **Dual Data Input Modes**: Supports both manual patient parameter entry and instant **ICU Patient Record Lookup** from hospital databases.
- **Dynamic Probability Calibration**: Applies **Platt Scaling** and **Isotonic Regression** calibration layers to ensure realistic clinical risk distributions.
- **Dynamic Confidence Scoring**: Calculates real-time model confidence percentages based on feature variance and data alignment.

### 💡 Explainable AI (SHAP) & Interpretation
- **SHAP Feature Attribution**: Generates itemized visual feature importance attributions for every prediction.
- **Strict Clinical Validation**: Validates parameters against clinical reference standards so that normal physiological values (e.g., Blood Pressure $<120/80\text{ mmHg}$, Glucose $<100\text{ mg/dL}$, Age $<60$) are **never** labeled as risk drivers.
- **Risk Increasing Factors ($\mathbf{\Delta}$)**: Isolates parameters with positive SHAP contribution that cross abnormal clinical thresholds.
- **Protective Factors ($\mathbf{\nabla}$)**: Highlights healthy baseline traits (young age, optimal lipid levels, normal blood pressure, naive smoking status).
- **ACC/AHA Guideline Recommendations**: Dynamically generates evidence-based medication, lifestyle, and diagnostic recommendations based on clinical guidelines.

### 📁 Clinical Record Management & Governance
- **Hospital PDF Report Engine**: Generates dense, multi-section clinical PDF charts with custom patient headers, risk meters, SHAP tables, and clinician sign-off blocks.
- **Prediction History & Patient Records**: Maintains full audit history for patient consultations and admission runs.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across 12 clinical roles (`doctor`, `admin`, `nurse`, `auditor`, `researcher`, etc.).
- **JWT & Security**: Secure JSON Web Token authentication with bcrypt password hashing and session revocation.
- **Clinician Audit Trail**: Immutable logging of administrative actions, password changes, photo uploads, and notification preferences.
- **MLflow Governance**: Tracks model versions, validation scores, execution latencies, and staging-to-production transitions.

---

## 🔄 Clinical Workflow

```
                        +---------------------------------------+
                        |        Clinician Portal Login         |
                        +-------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         | Patient Parameter Entry / ICU Lookup |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         | Input Validation & Feature Schema    |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         | Feature Engineering & Normalization  |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         |   CatBoost ML Prediction Engine      |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         |  Isotonic / Platt Calibration Layer  |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         |    SHAP Explainability Analysis      |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         | Clinical Interpretation & Validation |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         | 5-Tier Risk Stratification (0-100%)  |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         | ACC/AHA Guideline Care Plan Gen      |
                         +------------------+-------------------+
                                            |
                         +------------------v-------------------+
                         |  Hospital PDF Export & DB Audit Log  |
                         +--------------------------------------+
```

---

## ⚙️ Machine Learning Pipeline

```
Dataset Collection ──► Data Cleaning ──► Missing Value Handling ──► Feature Engineering
                                                                           │
Model Evaluation ◄── SHAP Analysis ◄── Probability Calibration ◄── Model Training
       │
       ▼
Deployment (FastAPI REST API)
```

1. **Dataset Collection**: Aggregates clinical telemetry from public cardiovascular datasets and MIMIC-IV ICU cohorts.
2. **Data Cleaning & Validation**: Eliminates invalid measurements, normalizes physiological ranges, and enforces schema constraints using **Pandera**.
3. **Missing Value Imputation**: Applies median imputation for continuous vitals and mode imputation for categorical comorbidity flags.
4. **Feature Engineering**: Calculates pulse pressure, non-HDL cholesterol estimates, and comorbidity interaction weights.
5. **Categorical Encoding**: Maps boolean clinical histories (hypertension, diabetes, smoking, prior cardiac event) into structured feature vectors.
6. **Hyperparameter Optimization**: Uses **Optuna** to optimize tree depth, learning rates, and regularization parameters.
7. **Probability Calibration**: Calibrates raw model outputs using Platt Scaling to prevent extreme overconfidence.
8. **SHAP Explainability**: Calculates tree-based SHAP values for local instance explanations.

---

## 📊 Dataset Specifications

### Primary Sources
- **Dataset Name**: Heart Disease Dataset & MIMIC-IV Clinical Database v2.2
- **Primary Source**: [UCI Machine Learning Repository - Heart Disease](https://archive.uci.edu/ml/datasets/heart+disease)
- **Clinical Secondary Source**: MIMIC-IV Demo & Clinical Ward Registry

### Engineered Clinical Features

| Feature Name | Type | Unit / Range | Clinical Description |
| :--- | :--- | :--- | :--- |
| `age` | Integer | $18 - 100\text{ yrs}$ | Patient biological age |
| `gender` | Binary | `0=Female, 1=Male` | Biological sex |
| `bmi` | Float | $12.0 - 60.0\text{ kg/m}^2$ | Body Mass Index |
| `systolic_bp` | Float | $70 - 240\text{ mmHg}$ | Systolic Blood Pressure |
| `diastolic_bp` | Float | $40 - 140\text{ mmHg}$ | Diastolic Blood Pressure |
| `glucose` | Float | $50 - 500\text{ mg/dL}$ | Fasting blood glucose level |
| `cholesterol` | Float | $80 - 600\text{ mg/dL}$ | Total serum cholesterol |
| `heart_rate` | Float | $30 - 220\text{ bpm}$ | Resting heart rate |
| `icu_admissions` | Integer | $\ge 0$ | Cumulative ICU admission count |
| `hypertension` | Binary | `0=No, 1=Yes` | History of Essential Hypertension |
| `diabetes` | Binary | `0=No, 1=Yes` | History of Diabetes Mellitus |
| `smoking` | Binary | `0=No, 1=Yes` | Current or former tobacco smoker |
| `previous_cardiac`| Binary | `0=No, 1=Yes` | History of MI, Angina, or CABG |
| `statin_history` | Binary | `0=No, 1=Yes` | Active statin prescription |

---

## 🤖 Machine Learning Model

### Primary Classifier: CatBoost & XGBoost Ensemble
- **Model Architecture**: Gradient Boosted Decision Trees (CatBoost Classifier)
- **Validation ROC-AUC**: `0.763`
- **Cross-Validation Score**: `0.758`
- **Inference Latency**: `< 20 ms`
- **Calibration Method**: Isotonic Regression & Platt Scaling
- **Feature Importance**: Evaluated via Mean Absolute SHAP values across test splits.

---

## 💡 Explainable AI (SHAP)

To prevent "black-box" decision making in critical care, AI-CHD-CDSS integrates **SHAP (SHapley Additive exPlanations)**:

- **Risk Increasing Factors ($\mathbf{\Delta}$)**: Features that push the patient's probability **above** baseline **AND** exceed abnormal clinical thresholds (e.g. Systolic BP $\ge 130\text{ mmHg}$, Glucose $\ge 100\text{ mg/dL}$, Age $\ge 60$).
- **Protective Factors ($\mathbf{\nabla}$)**: Features that reduce risk or maintain healthy baseline status (e.g. Young age, optimal blood pressure, normal cholesterol, no smoking).
- **Rule Guarantee**: Normal physiological values are **never** labeled as risk drivers, maintaining strict alignment with clinical guidelines.

---

## 🩺 Clinical Interpretation Engine

The Clinical Interpretation Engine dynamically generates human-readable diagnostic summaries based on actual patient input parameters:

- **Very Low Risk ($<5\%$)**: Highlights baseline protective factors (e.g., *"Young age (28 yrs), normal blood pressure (110/70 mmHg), healthy glucose (82 mg/dL), no smoking, zero ICU admissions."*)
- **High / Very High Risk ($\ge 20\%$)**: Highlights primary risk drivers (e.g., *"Elevated 10-year risk (64.2%) driven by advanced age (68 yrs), uncontrolled hypertension (155 mmHg), diabetes mellitus, and cholesterol (245 mg/dL)."*)

---

## 📊 Risk Stratification Categories

| Risk Level | Probability Range | Clinical Action Target |
| :--- | :--- | :--- |
| 🟢 **Very Low Risk** | $0.0\% - 4.9\%$ | Routine lifestyle maintenance & annual screening |
| 🟢 **Low Risk** | $5.0\% - 9.9\%$ | Lifestyle counseling & primary prevention monitoring |
| 🟡 **Moderate Risk** | $10.0\% - 19.9\%$ | Moderate-intensity intervention; blood pressure & lipid targets |
| 🟠 **High Risk** | $20.0\% - 39.9\%$ | Intensive pharmacotherapy (Statins/Antihypertensives); specialist referral |
| 🔴 **Very High Risk**| $\ge 40.0\%$ | Immediate Cardiology referral, advanced diagnostics & CCU admission evaluation |

---

## 💻 Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript 5.0 |
| **Styling & Motion** | Vanilla CSS, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend Framework** | Python 3.12, FastAPI, Uvicorn, Pydantic v2, Asyncio |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.0, Alembic Migrations |
| **Machine Learning** | CatBoost, XGBoost, Scikit-Learn, SHAP, Optuna, Pandera |
| **Task Queue & Cache** | Redis 7.0, Celery |
| **MLOps & Governance**| MLflow Model Registry, SQLite / Postgres Metadata Store |
| **PDF Engine** | jsPDF, jsPDF-AutoTable |
| **DevOps & CI/CD** | Docker, Docker Compose, NGINX, GitHub Actions, Render (`render.yaml`) |

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |         NGINX Reverse Proxy           |
                                  |           (Port 80 / 443)             |
                                  +-------------------+-------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
         +---------------v---------------+                         +---------------v---------------+
         |       Next.js 16 Frontend     |                         |        FastAPI Backend        |
         |       (Port 3000 / Web)       |                         |       (Port 8000 / API)       |
         +-------------------------------+                         +---------------+---------------+
                                                                                   |
                                                     +-----------------------------+-----------------------------+
                                                     |                             |                             |
                                      +--------------v--------------+ +------------v------------+ +--------------v--------------+
                                      |     PostgreSQL Database     | |     MLflow Registry     | |         Redis Cache         |
                                      |   (Users, Audit, History)   | | (Model Governance & HPO)| |       (Celery Queue)        |
                                      +-----------------------------+ +-------------------------+ +-----------------------------+
```

---

## 📁 Folder Structure

```
AI-CHD-CDSS/
├── .github/workflows/ci_cd.yml       # GitHub Actions CI/CD pipeline
├── backend/
│   ├── database/                     # SQLAlchemy models & DB connection setup
│   ├── migrations/                   # Alembic database schema migrations
│   ├── scripts/seed_db.py            # Database seed script for roles & users
│   ├── tests/                        # Pytest suite (API endpoints, RBAC, ETL)
│   ├── auth.py                       # JWT Authentication endpoints
│   ├── main.py                       # FastAPI application entry point
│   ├── predictions.py                # ML Model inference & SHAP explanation logic
│   ├── profile.py                    # User profile & password management
│   ├── reports.py                    # Clinical report storage & PDF API
│   ├── security.py                   # Bcrypt password hashing & JWT handling
│   └── requirements.txt              # Backend dependencies
├── frontend/
│   ├── src/app/                      # Next.js pages (/, /predict, /reports, /settings, /about)
│   ├── src/components/               # Glassmorphism UI components (GlassCard, GlassButton)
│   ├── src/lib/pdfGenerator.ts       # jsPDF hospital report generator
│   └── package.json                  # Frontend dependencies
├── docker-compose.yml                # Multi-container local orchestration
├── render.yaml                       # Cloud deployment blueprint
└── README.md                         # Project documentation
```

---

## 🌐 REST API Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticates user & returns JWT token | Public |
| `POST` | `/api/v1/auth/signup` | Registers new clinician account | Public |
| `POST` | `/api/v1/predict/direct` | Runs ML risk prediction for manual input | Authenticated |
| `POST` | `/api/v1/predict/admission/{id}`| Runs ML prediction for ICU patient admission | Authenticated |
| `GET` | `/api/v1/patients/` | Lists patient registry with filters | Doctor, Admin |
| `GET` | `/api/v1/profile/me` | Fetches current user profile & security status | Authenticated |
| `PUT` | `/api/v1/profile/password` | Updates user password in PostgreSQL | Authenticated |
| `GET` | `/api/v1/profile/activity` | Fetches last 5 portal audit trail activities | Authenticated |
| `GET` | `/api/v1/reports/` | Fetches saved clinical PDF reports | Authenticated |
| `GET` | `/api/v1/governance/models` | Lists MLflow registered model versions | Governance, Admin |

---

## 🔒 Security & Access Control

- **JWT Authentication**: Short-lived JSON Web Tokens with bearer verification.
- **Bcrypt Hashing**: Passwords stored securely using salt-hashed bcrypt hashes.
- **RBAC Matrix**: Enforces endpoint permissions across 12 hospital roles.
- **Clinician Audit Trail**: All authentication events, password updates, and prediction queries generate immutable audit logs in PostgreSQL.

---

## 📄 Hospital PDF Report Generator

Generated PDF reports include:
1. **Hospital Header & Patient Demographics**: Patient UUID, admission ID, age, gender, date stamp.
2. **Model Risk Stratification Gauge**: Predicted 10-year risk percentage, risk category badge, model version, execution latency.
3. **Horizontal Risk Meter**: Color-coded spectrum position.
4. **Dynamic Clinical Narrative**: Detailed medical synthesis of patient vitals.
5. **Explainable AI (SHAP) Table**: Itemized Risk Increasing vs Protective factors with impact percentages.
6. **Evidence-Based ACC/AHA Recommendations**: Tailored clinical care plan guidelines.
7. **Governance & Metadata**: ML model architecture, audit signatures, and legal disclaimer.

---

## 🖼️ System Screenshots

```
+-----------------------------------------------------------------------------------+
| [Hero Landing Page]           AI-Powered Heart Disease Decision Support System    |
| [Prediction Dashboard]        Real-Time Risk Gauge, Vitals Form, SHAP Attributions|
| [ICU Patient Lookup]          Cohort Search, Comorbidity Filtering, Patient Chart |
| [Reports Console]             Generated PDF Documents, Filter by Date & Status    |
| [Settings & Audit Trail]      Profile Completion, Password Change, Audit Logs     |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Python**: `3.12+`
- **Node.js**: `20.x+`
- **PostgreSQL**: `16.x`
- **Docker & Docker Compose** (Optional)

---

### Manual Setup

#### 1. Clone & Setup Backend
```bash
git clone https://github.com/tulasiram04/AI-CHD-CDSS.git
cd AI-CHD-CDSS

# Activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed database
alembic -c backend/alembic.ini upgrade head
python backend/scripts/seed_db.py

# Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000`.

---

### Docker Setup
```bash
docker compose up --build -d
```
Access the application at `http://localhost`.

---

## 🧪 Running Tests & Quality Assurance

```bash
# Run pytest backend test suite
python -m pytest backend/tests/

# Verify Python formatting & linting
python -m black --check backend/
python -m flake8 backend/ --count --select=E9,F63,F7,F82

# Test Next.js frontend build
cd frontend
npm run build
```

---

## ☁️ Deployment Guide

### Deployment via Render Blueprint (`render.yaml`)
1. Connect repository to Render.
2. Create New **Blueprint**.
3. Render automatically provisions:
   - **FastAPI Web Service**: `chd-backend`
   - **Next.js Web Service**: `chd-frontend`
4. Set environment variable `DATABASE_URL` in the Render dashboard.

---

## 🔮 Future Enhancements

- [ ] **FHIR / HL7 Integration**: Native interoperability with Epic, Cerner, and hospital EHR systems.
- [ ] **12-Lead ECG AI Analysis**: Deep learning classification of resting ECG waveform signals.
- [ ] **Wearable Telemetry Streaming**: Real-time integration with smartwatches and continuous blood pressure monitors.
- [ ] **Multi-Hospital Federated Learning**: Privacy-preserving model training across regional hospital networks.

---

## 📄 License & Disclaimer

### License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Clinical Disclaimer
> **IMPORTANT**: AI-CHD-CDSS is designed solely as a **Clinical Decision Support System** to assist qualified healthcare professionals. It does not replace clinical evaluation, and final diagnostic and treatment decisions remain the responsibility of the attending physician.
