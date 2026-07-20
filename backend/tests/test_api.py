import os

# Force testing to use a temporary SQLite file database to allow multi-connection persistence
db_file = "test_temp.db"
if os.path.exists(db_file):
    try:
        os.remove(db_file)
    except Exception:
        pass
os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# Recreate all tables and seed the database for unit testing
from backend.database.session import engine, SessionLocal
from backend.database.models import (
    Base,
    User,
    DoctorProfile,
    ModelRegistry,
    Patient,
    Admission,
    Diagnosis,
    LabResult,
)
from backend.security import get_password_hash


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Create tables in SQLite in-memory or testing file database
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed doctor user
        existing_doctor = db.query(User).filter_by(email="doctor@hospital.org").first()
        if not existing_doctor:
            pwd_hash = get_password_hash("password123")
            doctor_user = User(
                email="doctor@hospital.org",
                password_hash=pwd_hash,
                role="doctor",
                is_active=True,
            )
            db.add(doctor_user)
            db.commit()
            db.refresh(doctor_user)

            doctor_profile = DoctorProfile(
                user_id=doctor_user.id,
                license_number="MD-TEST9999",
                specialty="Cardiology",
                department="CCU",
            )
            db.add(doctor_profile)
            db.commit()

        # Seed admin user
        existing_admin = db.query(User).filter_by(email="admin@hospital.org").first()
        if not existing_admin:
            pwd_hash = get_password_hash("password123")
            admin_user = User(
                email="admin@hospital.org",
                password_hash=pwd_hash,
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()

        # Seed model registry artifact
        existing_model = db.query(ModelRegistry).first()
        if not existing_model:
            model = ModelRegistry(
                model_uuid="test-model-uuid-12345",
                version="1",
                run_id="test-run-id-12345",
                performance_metrics_json={"validation_auc": 0.85},
                status="Staging",
            )
            db.add(model)
            db.commit()
    finally:
        db.close()


# Helper function to get auth headers for a role
def get_auth_headers(email: str) -> dict:
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": "password123"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check():
    """Verify health endpoint is responsive."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_login_incorrect_password():
    """Verify login fails with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "doctor@hospital.org", "password": "wrong_password"},
    )
    assert response.status_code == 400
    assert "Incorrect email or password" in response.json()["detail"]


def test_prediction_without_auth():
    """Verify prediction endpoint enforces authentication."""
    response = client.post("/api/v1/predict", json={})
    assert response.status_code in [401, 403]


def test_direct_prediction_success():
    """Verify prediction succeeds with valid inputs and auth."""
    headers = get_auth_headers("doctor@hospital.org")
    payload = {
        "age": 62.5,
        "gender": 1,
        "bmi": 28.4,
        "systolic_bp": 130.0,
        "diastolic_bp": 82.0,
        "glucose": 95.0,
        "heart_rate": 72.0,
        "cholesterol": 180.0,
        "admission_frequency": 3,
        "medication_count": 3,
        "hypertension": 1,
        "diabetes": 0,
        "smoking": 1,
        "previous_cardiac": 0,
        "statin_history": 0,
        "beta_blocker_history": 0,
        "ace_arb_history": 1,
        "aspirin_history": 1,
    }
    response = client.post("/api/v1/predict", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "prediction_uuid" in data
    assert "raw_probability" in data
    assert "calibrated_probability" in data
    assert data["risk_level"] in [
        "Very Low",
        "Low",
        "Moderate",
        "High",
        "Very High",
        "Low Risk",
        "Borderline Risk",
        "Moderate Risk",
        "High Risk",
    ]
    assert len(data["recommendations"]) > 0


def test_admission_prediction_success():
    """Verify patient-level prediction using seeded DB admission records."""
    headers = get_auth_headers("doctor@hospital.org")
    from backend.database.session import SessionLocal
    from datetime import datetime

    db = SessionLocal()
    adm = db.query(Admission).first()
    if not adm:
        # Check if patient already exists to avoid unique constraint error
        patient = (
            db.query(Patient).filter_by(patient_uuid="test-patient-uuid-12345").first()
        )
        if not patient:
            patient = Patient(
                patient_uuid="test-patient-uuid-12345", gender=1, anchor_age=60
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)

        # Check if admission already exists
        adm = db.query(Admission).filter_by(hadm_id=200001).first()
        if not adm:
            adm = Admission(
                patient_id=patient.id,
                hadm_id=200001,
                admittime=datetime.now(),
                bmi=25.0,
                systolic_bp=120.0,
                diastolic_bp=80.0,
                heart_rate=70.0,
                cholesterol=180.0,
            )
            db.add(adm)
            db.commit()
            db.refresh(adm)

        # Check if glucose lab already exists
        lab = db.query(LabResult).filter_by(admission_id=adm.id, itemid=50931).first()
        if not lab:
            lab = LabResult(
                admission_id=adm.id,
                itemid=50931,
                charttime=datetime.now(),
                valuenum=90.0,
                valueuom="mg/dL",
            )
            db.add(lab)

        # Check if diagnosis already exists
        diag = (
            db.query(Diagnosis).filter_by(admission_id=adm.id, icd_code="401.9").first()
        )
        if not diag:
            diag = Diagnosis(
                admission_id=adm.id,
                icd_code="401.9",
                icd_version=9,
                long_title="Unspecified essential hypertension",
            )
            db.add(diag)

        db.commit()
        db.refresh(adm)

    hadm_id = adm.hadm_id
    db.close()

    response = client.post(f"/api/v1/predict/admission/{hadm_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "prediction_uuid" in data
    assert "raw_probability" in data
    assert "calibrated_probability" in data
    assert data["patient_uuid"] is not None


def test_auditing_permissions_enforced():
    """Verify that compliance logs are scoped to roles (doctors view own, admin views all, nurse forbidden)."""
    doc_headers = get_auth_headers("doctor@hospital.org")
    admin_headers = get_auth_headers("admin@hospital.org")

    # 1. Doctor should succeed under new RBAC matrix
    response = client.get("/api/v1/audits", headers=doc_headers)
    assert response.status_code == 200

    # 2. Admin should succeed
    response = client.get("/api/v1/audits", headers=admin_headers)
    assert response.status_code == 200

    # 3. Nurse should be forbidden
    from backend.database.session import SessionLocal
    from backend.database.models import User
    from backend.security import get_password_hash

    db = SessionLocal()
    try:
        nurse = db.query(User).filter_by(email="temp_nurse_test@hospital.org").first()
        if not nurse:
            nurse = User(
                email="temp_nurse_test@hospital.org",
                password_hash=get_password_hash("password123"),
                role="nurse",
                is_active=True,
            )
            db.add(nurse)
            db.commit()
    finally:
        db.close()

    nurse_headers = get_auth_headers("temp_nurse_test@hospital.org")
    response = client.get("/api/v1/audits", headers=nurse_headers)
    assert response.status_code == 403
    assert "Operation not permitted" in response.json()["detail"]


def test_model_governance_flow():
    """Verify model listing and admin governance approval workflow."""
    from backend.database.session import SessionLocal

    # Ensure database has all models in Staging to prevent isolation errors across runs
    db = SessionLocal()
    try:
        models = db.query(ModelRegistry).all()
        if not models:
            # Seed a dummy model artifact for testing
            model = ModelRegistry(
                model_uuid="test-model-uuid-12345",
                version="1",
                run_id="test-run-id-12345",
                performance_metrics_json={"validation_auc": 0.85},
                status="Staging",
            )
            db.add(model)
            db.commit()
            models = [model]
        for m in models:
            m.status = "Staging"
        db.commit()
    finally:
        db.close()

    doc_headers = get_auth_headers("doctor@hospital.org")
    admin_headers = get_auth_headers("admin@hospital.org")

    # 1. Doctor can list model artifacts
    response = client.get("/api/v1/models", headers=doc_headers)
    assert response.status_code == 200
    models_list = response.json()
    assert len(models_list) > 0

    model_id = models_list[0]["id"]

    # 2. Doctor cannot approve model
    response = client.post(
        f"/api/v1/models/{model_id}/approve",
        json={"comment": "clinical OK"},
        headers=doc_headers,
    )
    assert response.status_code == 403

    # 3. Admin can approve model
    response = client.post(
        f"/api/v1/models/{model_id}/approve",
        json={"comment": "clinically validated"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Approved"
    assert data["step"] == "Admin Deployment"
