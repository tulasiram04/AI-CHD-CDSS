import os
import sys
import pandas as pd
import numpy as np
import hashlib
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

# Ensure root path is configured
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database.session import SessionLocal, engine
from backend.database.models import Base, Patient, Admission, Diagnosis, LabResult, User, DoctorProfile, Role, PatientAssignment
from backend.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DBSeeder")

def seed_database():
    logger.info("Initializing database session...")
    db: Session = SessionLocal()
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Seed roles
        roles_to_seed = [
            "admin", "doctor", "nurse", "lab tech", "ecg tech", 
            "radiology tech", "medical researcher", "pharmacist", 
            "physiotherapist", "dietitian", "auditor", "governance"
        ]
        for role_name in roles_to_seed:
            existing_role = db.query(Role).filter_by(name=role_name).first()
            if not existing_role:
                role = Role(name=role_name, description=f"{role_name.capitalize()} role")
                db.add(role)
        db.commit()
        
        # Seed or update users
        pwd_hash = get_password_hash("password123")
        user_roles_emails = {
            "admin": "admin@hospital.org",
            "doctor": "doctor@hospital.org",
            "nurse": "nurse@hospital.org",
            "lab tech": "labtech@hospital.org",
            "ecg tech": "ecgtech@hospital.org",
            "radiology tech": "radiologytech@hospital.org",
            "medical researcher": "researcher@hospital.org",
            "pharmacist": "pharmacist@hospital.org",
            "physiotherapist": "physiotherapist@hospital.org",
            "dietitian": "dietitian@hospital.org"
        }
        
        seeded_users = {}
        for role_name, email in user_roles_emails.items():
            user = db.query(User).filter_by(email=email).first()
            if not user:
                user = User(
                    email=email,
                    password_hash=pwd_hash,
                    role=role_name,
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                # User already exists; preserve their updated password_hash!
                if not user.is_active:
                    user.is_active = True
                    db.commit()
            seeded_users[role_name] = user
            
            # Seed doctor profile if role is doctor
            if role_name == "doctor":
                existing_profile = db.query(DoctorProfile).filter_by(user_id=user.id).first()
                if not existing_profile:
                    profile = DoctorProfile(
                        user_id=user.id,
                        license_number="MD-99887766",
                        specialty="Cardiology",
                        department="Coronary Care Unit (CCU)"
                    )
                    db.add(profile)
                    db.commit()

        logger.info("Successfully seeded clinical registry roles and staff user accounts.")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
