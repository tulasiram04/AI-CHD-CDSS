# Production Deployment & MLOps Operations Guide

This guide details the instructions to deploy the AI-CHD-CDSS container cluster in a production environment.

---

## 1. Single-Command Deployment

The application runs as a Docker Compose multi-container application. Ensure `.env.production` contains secure production passwords and secrets.

```bash
# 1. Setup production environments
cp .env.production .env

# 2. Build and launch clinical stack
docker compose up --build -d
```

---

## 2. Container Resources & Infrastructure Limits

The cluster enforces resource limits in `docker-compose.yml` to prevent lockups on shared clinical server hosts:

- **`chd_db` (PostgreSQL)**: Max 1.0 CPU, 1024MB Memory. Binds to `postgres_data` persistent volume.
- **`chd_redis` (Redis)**: Max 0.5 CPU, 256MB Memory. Binds to `redis_data` volume.
- **`chd_backend` (FastAPI)**: Max 1.5 CPU, 1536MB Memory.
- **`chd_frontend` (Next.js)**: Max 1.0 CPU, 512MB Memory.
- **`chd_nginx`**: Listens on port 80. Binds read-only `nginx.conf` mappings.

---

## 3. Database Maintenance & Scheduled Backups

### Automated Backups
The database container links a volume to the host filesystem. The backup script (`docker/backup_postgres.sh`) compresses database dumps and retains them for 7 days.

To manually trigger a backup:
```bash
docker exec -it chd_db /backups/backup_postgres.sh
```

---

## 4. Monitoring & Telemetry Integration

Access monitoring telemetry via host ports:
- **Prometheus Scraper**: Exposed on port `9090` (internal and external metrics).
- **Grafana Visualization Dashboard**: Exposed on port `3001` (login defaults to admin/admin on startup). Prometheus is auto-provisioned as the default datasource.

---

## 5. Production Handover Checklist

Before deploying to patient-facing environments, verify the following items:

- [ ] `.env` contains a unique, cryptographically secure `JWT_SECRET_KEY` (do not use development keys).
- [ ] Database credentials (`POSTGRES_PASSWORD`) have been changed from default values.
- [ ] Port `80` (HTTP) is open on host network firewalls, and ports `5432`, `6379`, `9090`, and `3001` are blocked from public ingress (restricted to VPN/local interfaces).
- [ ] ML Model weights have been calibrated using the full, retrained clinical cohort dataset (as specified in clinical warnings).
