# API Reference Documentation: AI-CHD-CDSS

All backend endpoints are prefixed with `/api/v1` (with `/health` and `/metrics` exposed directly at the root).

---

## 1. Authentication Endpoints

### User Registration
- **URL**: `/api/v1/auth/signup`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "username": "Dr. John Doe",
    "email": "doctor@hospital.org",
    "password": "secure_password"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "email": "doctor@hospital.org",
    "role": "doctor",
    "is_active": true
  }
  ```

### User Login (OAuth2 Token Exchange)
- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/x-www-form-urlencoded`
- **Payload**: `username=doctor@hospital.org&password=secure_password`
- **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "doctor@hospital.org",
      "role": "doctor"
    }
  }
  ```

---

## 2. Prediction Endpoints

### Direct Input Risk Prediction
- **URL**: `/api/v1/predict`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Payload**:
  ```json
  {
    "age": 62,
    "gender": 1,
    "bmi": 28.5,
    "systolic_bp": 135,
    "diastolic_bp": 85,
    "glucose": 95,
    "heart_rate": 72,
    "cholesterol": 180,
    "admission_frequency": 1,
    "medication_count": 2,
    "hypertension": 1,
    "diabetes": 0,
    "smoking": 1,
    "previous_cardiac": 0,
    "statin_history": 0,
    "beta_blocker_history": 1,
    "ace_arb_history": 0,
    "aspirin_history": 1
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "predicted_risk": 0.284,
    "risk_level": "High",
    "confidence_interval_low": 0.221,
    "confidence_interval_high": 0.347,
    "model_version": "v1.0",
    "timestamp": "2026-07-14T10:00:00Z",
    "recommendations": [
      "Initiate high-intensity statin therapy.",
      "Schedule cardiovascular specialist follow-up."
    ],
    "shap_contributions": {
      "age": 0.082,
      "systolic_bp": 0.045
    }
  }
  ```

---

## 3. Patient Registry Endpoints

### Get Patient Records
- **URL**: `/api/v1/patients`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response** (`200 OK`): Array of patient records containing clinical vitals, BMI, and historical risk scores.

---

## 4. Governance & Auditing Endpoints

### Model Approvals
- **URL**: `/api/v1/models/{model_id}/approve`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Payload**:
  ```json
  {
    "comment": "Validated ROC-AUC targets met."
  }
  ```
- **Response** (`200 OK`): Status confirm message.

### Get Audit Logs
- **URL**: `/api/v1/audits`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response** (`200 OK`): Array of login and prediction audit records.
