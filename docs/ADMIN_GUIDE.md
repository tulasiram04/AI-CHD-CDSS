# System Administrator & Operations Guide: AI-CHD-CDSS

This manual guides IT personnel, database administrators, and compliance auditors on registry configurations, audit trails, and model governance promotions.

---

## 1. Clinician User Management (RBAC)

FastAPI enforces Role-Based Access Control (RBAC).
- **Default Registration**: New registrations default to the `Doctor` role.
- **Admin Promotion**: To promote a user to `Admin` or `Auditor`, access the PostgreSQL container and run the database update query:
  ```bash
  docker exec -it chd_db psql -U postgres -d chd_cdss
  ```
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'admin@hospital.org';
  ```

---

## 2. Compliance Auditing & Exports

Auditing records are stored securely in the database.
- Access the **Compliance Audits** dashboard in the sidebar (restricted to `Admin` and `Auditor` roles).
- Filter logs by **Action** (Logins, Predictions, Governance reviews).
- To download a complete audit log, click **Export CSV Report**.

---

## 3. Model Governance & Production Promotions

ML models are tracked using the MLflow Model Registry.
- Access the **Model Governance** dashboard (restricted to the `Admin` role).
- Review registered model versions and staging states.
- To promote a version from Staging to Production:
  1. Click **Clinical Approve & Promote**.
  2. In the popup, enter comments certifying that clinical validation metrics (AUC, calibration, and subgroup parity) have been verified.
  3. Click **Promote to Production** to update the model.

---

## 4. Resource Allocation & Logging Logs

- All Docker stdout logs are routed to standard logging channels.
- Check backend API and prediction logs:
  ```bash
  docker compose logs backend
  ```
- Check Celery background training queue logs:
  ```bash
  docker compose logs celery_worker
  ```
