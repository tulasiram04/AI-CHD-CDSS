"""
Doctor Management Service
Encapsulates doctor user operations, activation status, and profiles.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from backend.database.models import User, DoctorProfile, ClinicalPrediction
from backend.security import get_password_hash
from backend.services.audit_service import AuditService

class DoctorService:
    @staticmethod
    def get_all_doctors(db: Session) -> List[Dict[str, Any]]:
        """Returns list of active and deactivated doctors with prediction counts."""
        doctors = (
            db.query(User)
            .filter(func.lower(User.role) == "doctor", User.is_deleted == False)
            .all()
        )
        result = []
        for doc in doctors:
            profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doc.id).first()
            pred_count = db.query(ClinicalPrediction).filter(ClinicalPrediction.clinician_id == doc.id).count()
            result.append({
                "id": str(doc.id),
                "email": doc.email,
                "full_name": profile.full_name if profile else doc.full_name or doc.email.split("@")[0],
                "specialty": profile.specialty if profile else "Cardiology",
                "license_number": profile.license_number if profile else "N/A",
                "department": profile.department if profile else "Cardiology & CCU",
                "is_active": doc.is_active,
                "prediction_count": pred_count,
                "created_at": doc.created_at.isoformat() if doc.created_at else None
            })
        return result

    @staticmethod
    def toggle_doctor_status(db: Session, doctor_id: str, is_active: bool, admin_email: str) -> User:
        """Activates or deactivates a doctor account."""
        doctor = db.query(User).filter(User.id == doctor_id, User.is_deleted == False).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor account not found")
        doctor.is_active = is_active
        db.commit()
        db.refresh(doctor)
        
        status_str = "Activated" if is_active else "Deactivated"
        AuditService.log_action(
            db=db,
            activity_type=f"Doctor Account {status_str}",
            details=f"Doctor {doctor.email} was {status_str.lower()} by {admin_email}",
            user_email=admin_email
        )
        return doctor

    @staticmethod
    def reset_doctor_password(db: Session, doctor_id: str, new_password: str, admin_email: str) -> bool:
        """Resets doctor password."""
        doctor = db.query(User).filter(User.id == doctor_id, User.is_deleted == False).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor account not found")
        doctor.password_hash = get_password_hash(new_password)
        db.commit()
        
        AuditService.log_action(
            db=db,
            activity_type="Doctor Password Reset",
            details=f"Password for {doctor.email} reset by admin {admin_email}",
            user_email=admin_email
        )
        return True
