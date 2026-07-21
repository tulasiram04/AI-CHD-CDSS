import os
import sys
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

# Ensure root path is configured
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database.session import SessionLocal, engine
from backend.database.models import (
    Base,
    Patient,
    Admission,
    Diagnosis,
    LabResult,
    User,
    DoctorProfile,
    Role,
    PatientAssignment,
    Hospital,
    Department,
    ModelRegistry,
    PendingRegistration,
    AuditLog,
    ActivityLog,
    ClinicalPrediction
)
from backend.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DBSeeder")


def seed_database():
    logger.info("Initializing database session...")
    db: Session = SessionLocal()

    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)

        # 1. Seed Roles
        roles_to_seed = [
            "admin", "super_admin", "doctor", "nurse", "lab tech",
            "ecg tech", "radiology tech", "medical researcher",
            "pharmacist", "physiotherapist", "dietitian", "auditor", "governance"
        ]
        for role_name in roles_to_seed:
            existing_role = db.query(Role).filter_by(name=role_name).first()
            if not existing_role:
                role = Role(name=role_name, description=f"{role_name.capitalize()} role")
                db.add(role)
        db.commit()

        # 2. Seed Hospitals
        hospitals_data = [
            {"name": "St. Jude Memorial Hospital", "code": "SJH-01", "city": "Boston", "state": "MA", "status": "Active", "total_beds": 450, "icu_beds": 60},
            {"name": "General Care Medical Center", "code": "GMC-02", "city": "New York", "state": "NY", "status": "Active", "total_beds": 620, "icu_beds": 85},
            {"name": "University Cardiology Institute", "code": "UCI-03", "city": "Chicago", "state": "IL", "status": "Active", "total_beds": 380, "icu_beds": 50},
            {"name": "Pacific Critical Care Hospital", "code": "PCH-04", "city": "San Francisco", "state": "CA", "status": "Active", "total_beds": 500, "icu_beds": 70},
        ]
        seeded_hospitals = []
        for h_info in hospitals_data:
            existing_h = db.query(Hospital).filter_by(code=h_info["code"]).first()
            if not existing_h:
                h = Hospital(**h_info)
                db.add(h)
                db.commit()
                db.refresh(h)
                seeded_hospitals.append(h)
            else:
                seeded_hospitals.append(existing_h)

        # 3. Seed Departments
        depts_data = [
            {"name": "Cardiology & CCU", "code": "CARD-01", "head_clinician": "Dr. Alexander Vance, MD", "status": "Active"},
            {"name": "Intensive Care Unit (ICU)", "code": "ICU-02", "head_clinician": "Dr. Sarah Jenkins, MD", "status": "Active"},
            {"name": "Emergency Medicine (ER)", "code": "EM-03", "head_clinician": "Dr. Marcus Thorne, MD", "status": "Active"},
            {"name": "Outpatient Cardiology (OPD)", "code": "OPD-04", "head_clinician": "Dr. Elena Rostova, MD", "status": "Active"},
            {"name": "Cardiovascular Surgery", "code": "CVS-05", "head_clinician": "Dr. David Chang, MD", "status": "Active"},
        ]
        for idx, d_info in enumerate(depts_data):
            existing_d = db.query(Department).filter_by(code=d_info["code"]).first()
            if not existing_d:
                d_info["hospital_id"] = seeded_hospitals[idx % len(seeded_hospitals)].id
                d = Department(**d_info)
                db.add(d)
        db.commit()

        # 4. Seed User Accounts & Doctor Profiles
        pwd_hash = get_password_hash("password123")
        user_roles_emails = {
            "admin": "admin@hospital.org",
            "super_admin": "superadmin@hospital.org",
            "doctor": "doctor@hospital.org",
            "nurse": "nurse@hospital.org",
            "lab tech": "labtech@hospital.org",
            "medical researcher": "researcher@hospital.org",
        }

        seeded_users = {}
        for role_name, email in user_roles_emails.items():
            user = db.query(User).filter_by(email=email).first()
            if not user:
                user = User(
                    email=email, password_hash=pwd_hash, role=role_name, is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                if not user.is_active:
                    user.is_active = True
                    db.commit()
            seeded_users[role_name] = user

            # Seed Doctor Profile
            if role_name == "doctor":
                existing_profile = db.query(DoctorProfile).filter_by(user_id=user.id).first()
                if not existing_profile:
                    profile = DoctorProfile(
                        user_id=user.id,
                        full_name="Dr. Alexander Vance",
                        license_number="MD-99887766",
                        specialty="Cardiology",
                        department="Coronary Care Unit (CCU)",
                    )
                    db.add(profile)
                    db.commit()

        # 5. Seed Model Registry
        existing_model = db.query(ModelRegistry).filter_by(model_version="v1.0.0").first()
        if not existing_model:
            model = ModelRegistry(
                model_name="CatBoost-CHD-Classifier",
                model_version="v1.0.0",
                run_id="run_cb_prod_9921",
                val_auc=0.763,
                cv_auc=0.758,
                status="Production",
                comments="Production calibrated CatBoost model with Isotonic scaling."
            )
            db.add(model)
            db.commit()

        # 6. Seed Sample Pending Registrations
        pending_samples = [
            {
                "full_name": "Dr. Jonathan Hayes",
                "email": "jhayes@cardiology.org",
                "requested_role": "doctor",
                "specialization": "Interventional Cardiology",
                "license_number": "MD-88112233",
                "hospital_affiliation": "St. Jude Memorial Hospital",
                "department": "Cardiology & CCU",
                "status": "Pending"
            },
            {
                "full_name": "Nurse Rebecca Stone",
                "email": "rstone@hospital.org",
                "requested_role": "nurse",
                "specialization": "Critical Care Nursing",
                "license_number": "RN-99334455",
                "hospital_affiliation": "General Care Medical Center",
                "department": "Intensive Care Unit (ICU)",
                "status": "Pending"
            }
        ]
        for p_data in pending_samples:
            existing_p = db.query(PendingRegistration).filter_by(email=p_data["email"]).first()
            if not existing_p:
                p = PendingRegistration(**p_data)
                db.add(p)
        db.commit()

        # 7. Seed Sample Patients
        patients_sample = [
            {"patient_uuid": str(uuid.uuid4()), "name": "John Doe", "gender": 1, "anchor_age": 62},
            {"patient_uuid": str(uuid.uuid4()), "name": "Jane Smith", "gender": 0, "anchor_age": 58},
            {"patient_uuid": str(uuid.uuid4()), "name": "Carlos Rodriguez", "gender": 1, "anchor_age": 71},
            {"patient_uuid": str(uuid.uuid4()), "name": "Mei Lin", "gender": 0, "anchor_age": 45},
            {"patient_uuid": str(uuid.uuid4()), "name": "Robert Vance", "gender": 1, "anchor_age": 54},
        ]
        seeded_patients = []
        for pat_data in patients_sample:
            p = Patient(**pat_data)
            db.add(p)
            db.commit()
            db.refresh(p)
            seeded_patients.append(p)

        # 8. Seed Initial ClinicalPrediction Records
        doctor_user = seeded_users.get("doctor")
        if doctor_user and seeded_patients:
            sample_predictions = [
                {
                    "audit_uuid": str(uuid.uuid4()),
                    "patient_uuid": seeded_patients[0].patient_uuid,
                    "clinician_id": doctor_user.id,
                    "model_version": "v1.0.0",
                    "predicted_risk": 0.717,
                    "confidence_interval_low": 0.68,
                    "confidence_interval_high": 0.75,
                    "risk_level": "High",
                    "request_ip": "127.0.0.1",
                    "request_user_agent": "DoctorPortal/1.0",
                    "inputs_json": {"age": 62, "systolic_bp": 145, "cholesterol": 240, "smoking": 1}
                },
                {
                    "audit_uuid": str(uuid.uuid4()),
                    "patient_uuid": seeded_patients[1].patient_uuid,
                    "clinician_id": doctor_user.id,
                    "model_version": "v1.0.0",
                    "predicted_risk": 0.142,
                    "confidence_interval_low": 0.11,
                    "confidence_interval_high": 0.17,
                    "risk_level": "Moderate",
                    "request_ip": "127.0.0.1",
                    "request_user_agent": "DoctorPortal/1.0",
                    "inputs_json": {"age": 58, "systolic_bp": 128, "cholesterol": 195, "smoking": 0}
                },
                {
                    "audit_uuid": str(uuid.uuid4()),
                    "patient_uuid": seeded_patients[2].patient_uuid,
                    "clinician_id": doctor_user.id,
                    "model_version": "v1.0.0",
                    "predicted_risk": 0.884,
                    "confidence_interval_low": 0.84,
                    "confidence_interval_high": 0.92,
                    "risk_level": "Very High",
                    "request_ip": "127.0.0.1",
                    "request_user_agent": "DoctorPortal/1.0",
                    "inputs_json": {"age": 71, "systolic_bp": 160, "cholesterol": 280, "smoking": 1}
                }
            ]
            for pred in sample_predictions:
                existing_pred = db.query(ClinicalPrediction).filter_by(patient_uuid=pred["patient_uuid"]).first()
                if not existing_pred:
                    cp = ClinicalPrediction(**pred)
                    db.add(cp)
            db.commit()

        # 9. Seed Audit Logs & Activity Logs
        if doctor_user:
            audit_events = [
                {"user_id": doctor_user.id, "action": "Doctor Portal Login", "details": "Dr. Alexander Vance logged into Doctor Portal."},
                {"user_id": doctor_user.id, "action": "CHD Prediction Executed", "details": "Ran 10-year CHD risk calculation for patient."},
            ]
            for evt in audit_events:
                a_log = AuditLog(**evt)
                db.add(a_log)
                act_log = ActivityLog(user_id=evt["user_id"], activity_type=evt["action"], details=evt["details"])
                db.add(act_log)
            db.commit()

        logger.info("Successfully seeded PostgreSQL database with interconnected hospitals, departments, users, patients, pending registrations, and predictions.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
