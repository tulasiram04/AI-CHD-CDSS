# AI-Powered Coronary Heart Disease Clinical Decision Support System (AI-CHD-CDSS)

An advanced clinical analytics platform designed to predict the 10-year risk of Coronary Heart Disease (CHD) for ICU admissions. The system integrates machine learning classifiers, model calibration layers, SHAP explainability, and auditing consoles into a single, secure environment.

---

## 1. Technical Stack

- **Machine Learning**: Python, XGBoost, Scikit-learn, SHAP, Optuna (HPO), Pandera (Data Validation)
- **MLOps & Governance**: MLflow Model Registry, SQLite Metadata Storage
- **Backend API**: FastAPI, Celery, Redis (Task Queue), PostgreSQL (User & Audit Database)
- **Clinical Frontend**: Next.js 15 (App Router), TypeScript, React, Tailwind CSS, Recharts
- **Deployment**: Docker, Docker Compose, NGINX Reverse Proxy, Prometheus, Grafana

---

## 2. System Architecture & Component Mapping

```
                                +---------------------------+
                                |  NGINX Reverse Proxy (80) |
                                +-------------+-------------+
                                              |
                       +----------------------+----------------------+
                       |                                             |
        +--------------v-------------+                +--------------v-------------+
        |   Next.js UI Portal (3000) |                |   FastAPI REST API (8000)  |
        +----------------------------+                +--------------+-------------+
                                                                     |
                                                +--------------------+--------------------+
                                                |                    |                    |
                                         +------v-----+       +------v-----+       +------v-----+
                                         | PostgreSQL |       | Redis Queue|       | MLflow (500)
                                         +------------+       +------+-----+       +------------+
                                                                     |
                                                              +------v-----+
                                                              |   Celery   |
                                                              +------------+
```

---

## 3. Core Features

1. **Clinical Prediction Engine**: Calibrated risk forecasting with Isotonic Regression and Platt scaling overlays.
2. **SHAP Explanations**: Itemized feature contribution values highlighting positive and negative risk factors.
3. **ICU Patient Registry**: Cohort grids supporting comorbidity filter states, search parameters, and records.
4. **Audit Logging & Compliance**: Immutable records logging user actions (login, predictions, model approvals) with direct CSV export.
5. **Model Governance Panel**: Reviewing staging models and promoting them to Production via comments.
6. **System Telemetry**: Scraped latency metrics, CPU/memory use, and database connection pools in Grafana.

---

## 4. Quick Start Command

To start the clinical environment in production mode:
```bash
docker compose up --build -d
```
Access the clinical terminal via browser at `http://localhost`.

---

## 5. Development Warning

> [!WARNING]
> The current model was trained using the MIMIC-IV Demo dataset for development and smoke testing. Production clinical deployment requires retraining and external validation using the full MIMIC-IV dataset or another sufficiently large clinical dataset.
