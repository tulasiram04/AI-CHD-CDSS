# 🫀 AI-Powered Coronary Heart Disease Clinical Decision Support System (AI-CHD-CDSS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![MLflow](https://img.shields.io/badge/MLflow-2.9-0194E2.svg?style=flat&logo=mlflow)](https://mlflow.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AI-CHD-CDSS** is a production-grade, hospital-ready **Clinical Decision Support System (CDSS)** engineered for cardiologists, intensive care physicians, and clinical ward teams. The platform analyzes patient vital signs, laboratory chemistry, physiological observations, and comorbidity history to deliver dynamic, calibrated 10-year **Coronary Heart Disease (CHD)** risk evaluations in real time.

Integrated with **Explainable AI (SHAP)**, evidence-based ACC/AHA clinical guidance, hospital PDF report generation, Role-Based Access Control (RBAC), and immutable audit logging, AI-CHD-CDSS acts as an intelligent co-pilot for healthcare professionals.

---

## 📸 System Overview

```
+-----------------------------------------------------------------------------------+
|                        AI-CHD-CDSS CLINICAL ARCHITECTURE                          |
+-----------------------------------------------------------------------------------+
|  [Clinician Portal (Next.js 16)]  <--->  [REST API Service (FastAPI & Uvicorn)]   |
|                 |                                       |                         |
|                 v                                       v                         |
|  [PDF Generator (jsPDF AutoTable)]        [Machine Learning Engine (CatBoost)]    |
|                 |                                       |                         |
|                 v                                       v                         |
|  [Clinical Audit Logs & Reports]          [PostgreSQL Database & MLflow Registry] |
+-----------------------------------------------------------------------------------+
```

---

## 🌟 Core System Capabilities

### 1. 🎯 Dynamic & Calibrated ML Risk Prediction Engine
- **Model-Driven Inference**: Uses trained CatBoost/XGBoost classifiers calibrated with Platt Scaling / Isotonic Regression to output calibrated probability scores.
- **Zero Fake Values**: Eliminates placeholder percentages; risk estimates are dynamically computed from patient input parameters.
- **5-Tier Risk Stratification**:
  - 🟢 **Very Low Risk**: $< 5.0\%$
  - 🟢 **Low Risk**: $5.0\% - 9.9\%$
  - 🟡 **Moderate Risk**: $10.0\% - 19.9\%$
  - 🟠 **High Risk**: $20.0\% - 39.9\%$
  - 🔴 **Very High Risk**: $\ge 40.0\%$

### 2. 🔍 Explainable AI (SHAP & Clinical Interpretation)
- **Strict Clinical Validation**: Validates physiological values against medical reference standards (e.g., Blood Pressure $\ge 130/85\text{ mmHg}$, Glucose $\ge 100\text{ mg/dL}$, Cholesterol $\ge 200\text{ mg/dL}$, Age $\ge 60$).
- **Clear Categorization**:
  - **Risk Increasing Factors ($\mathbf{\Delta}$)**: Displays parameters with positive SHAP contribution that cross clinical abnormality thresholds. Normal or protective parameters are never labeled as risk drivers.
  - **Protective Factors ($\mathbf{\nabla}$)**: Highlights baseline protective traits (young age, healthy blood pressure, normal cholesterol, zero ICU admissions, naive smoking history).
- **Dynamic Clinical Narratives**: Synthesizes human-readable medical summaries detailing specific physiological parameters.

### 3. 📄 Enterprise Hospital PDF Report Generator
- **Hospital-Grade Documentation**: Built with `jsPDF` and `jspdf-autotable`, creating multi-section clinical charts ready for electronic health record (EHR) archiving.
- **Rich Content Structure**: Includes patient demographics, risk stratification gauge cards, horizontal risk meters, dynamic interpretations, SHAP attribution tables, ACC/AHA guideline care plans, and governance metadata.

### 4. 🔒 Role-Based Access Control (RBAC) & Security
- **JWT Authentication**: Secure token authentication using bcrypt password hashing.
- **Multi-Role Support**: Enforces strict permissions across `admin`, `doctor`, `nurse`, `lab tech`, `ecg tech`, `radiology tech`, `medical researcher`, `pharmacist`, `physiotherapist`, `dietitian`, `auditor`, and `governance`.
- **Clinician Audit Trail**: Immutable logging of portal activities (password changes, profile updates, predictions, report generations).

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, React Query, Recharts |
| **Backend API** | Python 3.12, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy ORM, Alembic |
| **Machine Learning** | CatBoost, XGBoost, Scikit-learn, SHAP, Optuna (Hyperparameter Optimization), Pandera |
| **Database & Cache** | PostgreSQL 16, Redis |
| **MLOps & Governance**| MLflow Model Registry, Automated Model Promotion Workflows |
| **PDF Generation** | jsPDF, jsPDF-AutoTable |
| **CI/CD & DevOps** | GitHub Actions, Docker, Docker Compose, NGINX, Render Blueprint (`render.yaml`) |

---

## 🧬 Clinical Health Indicators Monitored

| Parameter | Normal Reference Range | Description & Impact |
| :--- | :--- | :--- |
| **Age** | $< 60\text{ years}$ | Biological age factor in cardiovascular degeneration |
| **Systolic Blood Pressure** | $< 120\text{ mmHg}$ | Measures arterial pressure during heart contraction |
| **Diastolic Blood Pressure** | $< 80\text{ mmHg}$ | Measures arterial pressure between beats |
| **Fasting Blood Glucose** | $70 - 99\text{ mg/dL}$ | Evaluates glycemic control and diabetes risk burden |
| **Serum Cholesterol** | $< 200\text{ mg/dL}$ | Lipid levels influencing atherosclerotic plaque buildup |
| **Resting Heart Rate** | $60 - 100\text{ bpm}$ | Cardiac pulse frequency and stress workload |
| **Body Mass Index (BMI)** | $18.5 - 24.9\text{ kg/m}^2$ | Obesity metric impacting systemic vascular resistance |
| **ICU Admission Count** | $0$ | Prior critical care burden and acute organ stress history |
| **Comorbidity Flags** | `No` | Hypertension, Diabetes, Active Smoking, Prior Cardiac Event |

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

## 📁 Repository Directory Structure

```
AI-CHD-CDSS/
├── .github/
│   └── workflows/
│       └── ci_cd.yml                 # GitHub Actions CI/CD pipeline
├── backend/
│   ├── database/
│   │   ├── models.py                 # SQLAlchemy database models (User, Patient, AuditLog)
│   │   └── session.py                # Database connection & session factory
│   ├── migrations/                   # Alembic database migration scripts
│   ├── scripts/
│   │   └── seed_db.py                # Database seed script for roles & initial setup
│   ├── tests/                        # Pytest unit & integration test suite
│   ├── auth.py                       # JWT Authentication endpoints
│   ├── main.py                       # FastAPI application entrypoint
│   ├── predictions.py                # Prediction engine & SHAP explanation logic
│   ├── profile.py                    # Doctor profile & password management
│   ├── reports.py                    # Report registry & metadata API
│   ├── security.py                   # Password hashing & JWT token handling
│   └── requirements.txt              # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js App Router (pages: /, /predict, /reports, /settings, /about)
│   │   ├── components/               # Reusable UI components (GlassCard, GlassButton, GlassBadge)
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios API client
│   │   │   └── pdfGenerator.ts       # jsPDF hospital report generator
│   │   └── providers/                # Auth & Toast context providers
│   ├── package.json                  # Frontend dependencies
│   └── tailwind.config.ts            # Tailwind CSS configuration
├── docker-compose.yml                # Multi-container local production orchestrator
├── render.yaml                       # Cloud deployment blueprint configuration
└── README.md                         # Project documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python**: `3.12+`
- **Node.js**: `20.x+`
- **npm**: `10.x+`
- **PostgreSQL**: `16.x`
- **Git**

---

### Option A: Local Manual Development

#### 1. Clone the Repository
```bash
git clone https://github.com/tulasiram04/AI-CHD-CDSS.git
cd AI-CHD-CDSS
```

#### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
alembic -c backend/alembic.ini upgrade head

# Seed initial roles and default accounts
python backend/scripts/seed_db.py

# Start FastAPI development server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will run at `http://localhost:8000`.  
Swagger API Documentation: `http://localhost:8000/docs`

#### 3. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
The Next.js frontend will run at `http://localhost:3000`.

---

### Option B: Docker Compose (Full Stack Production)

Run the entire platform including NGINX, FastAPI, PostgreSQL, Redis, and Next.js with a single command:

```bash
docker compose up --build -d
```
Access the application at `http://localhost`.

---

## 🧪 Testing & Code Quality

### Backend Pytest Suite
Run the complete backend test suite covering API endpoints, prediction logic, and Role-Based Access Control:

```bash
python -m pytest backend/tests/
```

### Code Formatting & Linting
```bash
# Format Python code with Black
python -m black backend/

# Verify PEP 8 linting with Flake8
python -m flake8 backend/ --count --select=E9,F63,F7,F82 --show-source --statistics

# Build Next.js frontend
cd frontend
npm run build
```

---

## 🔑 Default Credentials (Development Mode)

> [!NOTE]
> Initial seed accounts created by `seed_db.py` for testing purposes:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Doctor** | `doctor@hospital.org` | `password123` |
| **Admin** | `admin@hospital.org` | `password123` |
| **Nurse** | `nurse@hospital.org` | `password123` |
| **Auditor** | `auditor@hospital.org` | `password123` |

*(Users can update their password at any time via the Settings page. Password updates persist permanently in PostgreSQL across all deployments.)*

---

## 📜 Clinical & Legal Disclaimer

> [!IMPORTANT]
> **AI-CHD-CDSS** is designed as a **Clinical Decision Support System** to assist medical professionals by presenting data-driven cardiovascular risk estimates and evidence-based guideline recommendations.  
> 
> **It is NOT an automated diagnostic device.** Final clinical diagnostic, treatment, and medication decisions remain solely under the professional judgment of the attending physician.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more details.

---

<p align="center">
  <b>Developed for Intensive Care Ward Research, Cardiology Excellence, and Clinical Diagnostic Support.</b>
</p>
