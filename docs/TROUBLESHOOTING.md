# Operations Troubleshooting Guide: AI-CHD-CDSS

Resolutions for common errors, database lockups, and network interface isolation bugs in the CDSS cluster.

---

## 1. Database & Migrations Errors

### Error: `Relation does not exist` or SQL error on login/predictions
- **Cause**: Database tables have not been created or migrations have not been applied.
- **Resolution**:
  Run Alembic upgrade head to apply all database tables schemas:
  - *Local Dev*: `alembic upgrade head`
  - *Production Docker*: Database tables are initialized automatically by Alembic, but you can manually force migrations inside the container:
    ```bash
    docker exec -it chd_backend alembic upgrade head
    ```

---

## 2. API Connection & Proxy Refusals

### Error: Next.js Frontend cannot communicate with API
- **Cause**: Next.js public API variable is misconfigured or blocked by CORS.
- **Resolution**:
  1. Confirm `.env.production` defines `ALLOWED_ORIGINS` correctly.
  2. Confirm `NEXT_PUBLIC_API_URL` points to the correct host address (e.g. `http://localhost` or the server IP).
  3. Inspect NGINX configuration using `docker compose logs nginx` to verify proxy passes.

---

## 3. MLflow Registry Stage Discrepancies

### Error: `MlflowException: Invalid Model Version stage`
- **Cause**: Trying to transition model versions using custom stages not recognized by the canonical MLflow registry.
- **Resolution**:
  Ensure transition stages strictly use canonical names: `Staging`, `Production`, `Archived`, or `None`. The governance backend handles this transition automatically.

---

## 4. Celery Task Failures

### Error: Predictions or audits are not showing up or tasks are stuck
- **Cause**: Celery worker cannot connect to Redis or database connection timed out.
- **Resolution**:
  1. Verify Redis is running and reachable: `docker exec -it chd_redis redis-cli ping`.
  2. Restart the worker queue: `docker compose restart celery_worker`.
