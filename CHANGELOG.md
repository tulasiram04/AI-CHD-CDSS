# Changelog: AI-CHD-CDSS

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-14

### Added
- **Multi-Stage Containerization**: Built optimized production Dockerfiles for Next.js, FastAPI, Celery, and MLflow.
- **NGINX Reverse Proxy**: Configured secure URL routing, compression, and security headers.
- **Monitoring & Telemetry**: Integrated Prometheus scraping jobs and Grafana dashboards for cluster parameters.
- **Automated Database Backups**: Created scheduled PG dump scripts with a 7-day retention cleanup loop.
- **CI/CD Automation**: Established GitHub Actions workflow for linting, unit testing, and compose syntax validation.
- **Next.js Dashboard UI**: Implemented patient registry list filters, clinical forms, and audit trail tables.
- **Clinical Validation Report**: Completed calibration metrics comparison and SHAP explanations integrations.
- **Security hardening**: Enforced strict RBAC guards, password hashing, and API rate-limiting rules.
- **k6 Load Tests**: Built stress simulation scripts targeting up to 1000 concurrent user requests.

---

## [0.1.0] - 2026-06-15

### Added
- **ETL Data Pipelines**: Configured demographic converters and raw MIMIC-IV demo database ingestion.
- **Model Training Core**: Structured initial XGBoost classification model and database schemas.
- **Basic REST API**: Configured FastAPI base router endpoints.
