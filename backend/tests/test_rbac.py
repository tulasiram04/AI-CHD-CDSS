import pytest
import os
from datetime import datetime

# Force testing to use a temporary SQLite file database to prevent database state pollution
db_file = "test_temp_rbac.db"
if os.path.exists(db_file):
    try:
        os.remove(db_file)
    except Exception:
        pass
os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

from backend.database.session import engine, SessionLocal
from backend.database.models import Base, User, Patient, Admission, PatientAssignment, Role, ModelRegistry
from backend.security import get_password_hash

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Set up test environment database
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed roles
        roles = ["admin", "doctor", "nurse", "lab tech", "ecg tech", "radiology tech", "medical researcher", "governance"]
        for role_name in roles:
            if not db.query(Role).filter_by(name=role_name).first():
                db.add(Role(name=role_name, description=f"{role_name} role"))
        db.commit()

        # Seed users for test_rbac
        pwd_hash = get_password_hash("password123")
        user_roles = {
            "rbac_admin@hospital.org": "admin",
            "rbac_doctor@hospital.org": "doctor",
            "rbac_nurse@hospital.org": "nurse",
            "rbac_labtech@hospital.org": "lab tech",
            "rbac_ecgtech@hospital.org": "ecg tech",
            "rbac_radtech@hospital.org": "radiology tech",
            "rbac_researcher@hospital.org": "medical researcher",
            "rbac_gov@hospital.org": "governance"
        }
        
        seeded_users = {}
        for email, role_name in user_roles.items():
            user = db.query(User).filter_by(email=email).first()
            if not user:
                user = User(email=email, password_hash=pwd_hash, role=role_name, is_active=True)
                db.add(user)
                db.commit()
                db.refresh(user)
            seeded_users[role_name] = user

        # Seed 2 patients
        p1 = db.query(Patient).filter_by(patient_uuid="rbac-patient-1111").first()
        if not p1:
            p1 = Patient(patient_uuid="rbac-patient-1111", gender=1, anchor_age=45)
            db.add(p1)
            db.commit()
            db.refresh(p1)
            db.add(Admission(patient_id=p1.id, hadm_id=888001, admittime=datetime.utcnow(), bmi=25.0, systolic_bp=120.0, diastolic_bp=80.0, heart_rate=70.0, cholesterol=180.0))
            db.commit()

        p2 = db.query(Patient).filter_by(patient_uuid="rbac-patient-2222").first()
        if not p2:
            p2 = Patient(patient_uuid="rbac-patient-2222", gender=0, anchor_age=60)
            db.add(p2)
            db.commit()
            db.refresh(p2)
            db.add(Admission(patient_id=p2.id, hadm_id=888002, admittime=datetime.utcnow(), bmi=28.0, systolic_bp=140.0, diastolic_bp=90.0, heart_rate=80.0, cholesterol=210.0))
            db.commit()

        # Assign Patient 1 to Lab Tech
        assigned = db.query(PatientAssignment).filter_by(user_id=seeded_users["lab tech"].id, patient_id=p1.id).first()
        if not assigned:
            db.add(PatientAssignment(user_id=seeded_users["lab tech"].id, patient_id=p1.id))
            db.commit()

        # Seed model registry approval target
        model_art = db.query(ModelRegistry).filter_by(version="rbac-test-99").first()
        if not model_art:
            model_art = ModelRegistry(
                model_uuid="rbac-model-uuid-999",
                version="rbac-test-99",
                run_id="rbac-run-id-999",
                performance_metrics_json={"auc": 0.90},
                status="Staging"
            )
            db.add(model_art)
            db.commit()
            db.refresh(model_art)
            
    finally:
        db.close()

# Helper function to authenticate
def get_headers(email: str) -> dict:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": "password123"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_patient_listing_rbac():
    """Verify listing patients scopes data correctly based on user roles."""
    # 1. Admin/Doctor/Nurse see all patients
    headers = get_headers("rbac_admin@hospital.org")
    res = client.get("/api/v1/patients", headers=headers)
    assert res.status_code == 200
    p_ids = [p["patient_uuid"] for p in res.json()]
    assert "rbac-patient-1111" in p_ids
    assert "rbac-patient-2222" in p_ids

    # 2. Medical Researcher sees de-identified patients
    headers = get_headers("rbac_researcher@hospital.org")
    res = client.get("/api/v1/patients", headers=headers)
    assert res.status_code == 200
    for p in res.json():
        assert p["patient_uuid"] == "[DE-IDENTIFIED]"

    # 3. Lab Tech only sees patient 1 (assigned)
    headers = get_headers("rbac_labtech@hospital.org")
    res = client.get("/api/v1/patients", headers=headers)
    assert res.status_code == 200
    p_ids = [p["patient_uuid"] for p in res.json()]
    assert "rbac-patient-1111" in p_ids
    assert "rbac-patient-2222" not in p_ids

def test_patient_registration_rbac():
    """Verify that only admin, doctor, and nurse can register new patients."""
    payload = {
        "age": 50,
        "gender": 1,
        "bmi": 24.5,
        "systolic_bp": 125,
        "diastolic_bp": 82,
        "heart_rate": 72,
        "glucose": 95,
        "cholesterol": 190
    }
    # Succeeds for Nurse
    res = client.post("/api/v1/patients", json=payload, headers=get_headers("rbac_nurse@hospital.org"))
    assert res.status_code == 201

    # Fails for Lab Tech
    res = client.post("/api/v1/patients", json=payload, headers=get_headers("rbac_labtech@hospital.org"))
    assert res.status_code == 403

def test_demographics_editing_rbac():
    """Verify demographics update constraints (Nurses limited, others blocked)."""
    db_session = SessionLocal()
    p1 = db_session.query(Patient).filter_by(patient_uuid="rbac-patient-1111").first()
    patient_id = str(p1.id)
    db_session.close()

    # 1. Admin/Doctor can update age & gender
    res = client.put(f"/api/v1/patients/{patient_id}", json={"age": 46, "gender": 0}, headers=get_headers("rbac_doctor@hospital.org"))
    assert res.status_code == 200

    # 2. Nurse can update age, but changing gender triggers 403
    res = client.put(f"/api/v1/patients/{patient_id}", json={"age": 47}, headers=get_headers("rbac_nurse@hospital.org"))
    assert res.status_code == 200
    res = client.put(f"/api/v1/patients/{patient_id}", json={"gender": 1}, headers=get_headers("rbac_nurse@hospital.org"))
    assert res.status_code == 403

    # 3. Lab Tech cannot update demographics
    res = client.put(f"/api/v1/patients/{patient_id}", json={"age": 48}, headers=get_headers("rbac_labtech@hospital.org"))
    assert res.status_code == 403

def test_update_vitals_rbac():
    """Verify vitals editing role permission boundaries."""
    db_session = SessionLocal()
    p1 = db_session.query(Patient).filter_by(patient_uuid="rbac-patient-1111").first()
    patient_id = str(p1.id)
    db_session.close()

    # Nurse succeeds
    res = client.post(f"/api/v1/patients/{patient_id}/vitals", json={"systolic_bp": 130, "diastolic_bp": 85}, headers=get_headers("rbac_nurse@hospital.org"))
    assert res.status_code == 200

    # Lab Tech fails
    res = client.post(f"/api/v1/patients/{patient_id}/vitals", json={"systolic_bp": 130, "diastolic_bp": 85}, headers=get_headers("rbac_labtech@hospital.org"))
    assert res.status_code == 403

def test_upload_results_rbac():
    """Verify upload boundaries for different types of diagnostics (labs/ECG/radiology)."""
    db_session = SessionLocal()
    p1 = db_session.query(Patient).filter_by(patient_uuid="rbac-patient-1111").first()
    patient_id = str(p1.id)
    db_session.close()

    # 1. Lab upload succeeds for Lab Tech, fails for ECG Tech
    res = client.post(f"/api/v1/patients/{patient_id}/labs", json={"lab_name": "Serum Glucose", "result_value": 110.0, "unit": "mg/dL"}, headers=get_headers("rbac_labtech@hospital.org"))
    assert res.status_code == 200
    res = client.post(f"/api/v1/patients/{patient_id}/labs", json={"lab_name": "Serum Glucose", "result_value": 110.0, "unit": "mg/dL"}, headers=get_headers("rbac_ecgtech@hospital.org"))
    assert res.status_code == 403

    # 2. ECG upload succeeds for ECG Tech, fails for Lab Tech
    res = client.post(f"/api/v1/patients/{patient_id}/ecg", json={"heart_rate": 75, "interpretation": "Sinus rhythm"}, headers=get_headers("rbac_ecgtech@hospital.org"))
    assert res.status_code == 200
    res = client.post(f"/api/v1/patients/{patient_id}/ecg", json={"heart_rate": 75, "interpretation": "Sinus rhythm"}, headers=get_headers("rbac_labtech@hospital.org"))
    assert res.status_code == 403

    # 3. Radiology upload succeeds for Rad Tech, fails for Lab Tech
    res = client.post(f"/api/v1/patients/{patient_id}/radiology", json={"modality": "CT", "exam_name": "Chest CT", "findings": "Normal", "impression": "No plaque"}, headers=get_headers("rbac_radtech@hospital.org"))
    assert res.status_code == 200
    res = client.post(f"/api/v1/patients/{patient_id}/radiology", json={"modality": "CT", "exam_name": "Chest CT", "findings": "Normal", "impression": "No plaque"}, headers=get_headers("rbac_labtech@hospital.org"))
    assert res.status_code == 403

def test_predictions_rbac():
    """Verify that predictions can only be executed by doctors and admins."""
    payload = {
        "age": 60,
        "gender": 1,
        "bmi": 26.0,
        "systolic_bp": 130,
        "diastolic_bp": 85,
        "glucose": 95,
        "heart_rate": 72,
        "cholesterol": 200,
        "admission_frequency": 1,
        "medication_count": 0,
        "hypertension": 0,
        "diabetes": 0,
        "previous_cardiac": 0,
        "smoking": 0,
        "statin_history": 0,
        "beta_blocker_history": 0,
        "ace_arb_history": 0,
        "aspirin_history": 0
    }
    # Doctor succeeds
    res = client.post("/api/v1/predict", json=payload, headers=get_headers("rbac_doctor@hospital.org"))
    assert res.status_code == 200

    # Nurse fails
    res = client.post("/api/v1/predict", json=payload, headers=get_headers("rbac_nurse@hospital.org"))
    assert res.status_code == 403

def test_governance_rbac():
    """Verify that only admin and governance roles can approve models."""
    db_session = SessionLocal()
    model = db_session.query(ModelRegistry).filter_by(version="rbac-test-99").first()
    model_id = str(model.id)
    db_session.close()

    # Doctor fails to approve
    res = client.post(f"/api/v1/models/{model_id}/approve", json={"comment": "Approve this"}, headers=get_headers("rbac_doctor@hospital.org"))
    assert res.status_code == 403

    # Governance succeeds
    res = client.post(f"/api/v1/models/{model_id}/approve", json={"comment": "Approve this"}, headers=get_headers("rbac_gov@hospital.org"))
    assert res.status_code == 200
