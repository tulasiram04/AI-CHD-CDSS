"""
Registration & Approval Service
Manages pending doctor registrations and processes approvals/rejections.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.database.models import PendingRegistration, User, DoctorProfile, Hospital, Department
from backend.security import get_password_hash
from backend.services.audit_service import AuditService
from backend.services.notification_service import NotificationService

class ApprovalService:
    @staticmethod
    def get_pending_approvals(db: Session) -> List[Dict[str, Any]]:
        """Lists pending registrations awaiting admin approval."""
        pending = (
            db.query(PendingRegistration)
            .filter(PendingRegistration.status == "Pending")
            .order_by(PendingRegistration.created_at.desc())
            .all()
        )
        return [
            {
                "id": str(p.id),
                "full_name": p.full_name,
                "email": p.email,
                "requested_role": p.requested_role,
                "specialization": p.specialization or "Cardiology",
                "license_number": p.license_number or "N/A",
                "hospital_name": p.hospital_name or "St. Jude Memorial Hospital",
                "department": p.department or "Cardiology & CCU",
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "status": p.status
            }
            for p in pending
        ]

    @staticmethod
    def process_approval(
        db: Session,
        approval_id: str,
        action: str,
        notes: str,
        admin_email: str
    ) -> Dict[str, Any]:
        """Approves or rejects a pending doctor registration request."""
        req = db.query(PendingRegistration).filter(PendingRegistration.id == approval_id).first()
        if not req:
            raise HTTPException(status_code=404, detail="Pending registration request not found")

        if action.lower() == "approve":
            req.status = "Approved"
            req.admin_notes = notes
            
            # Check or create User account
            user = db.query(User).filter(User.email == req.email).first()
            if not user:
                user = User(
                    email=req.email,
                    password_hash=req.password_hash or get_password_hash("password123"),
                    role=req.requested_role or "doctor",
                    full_name=req.full_name,
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                user.is_active = True
                user.role = req.requested_role or "doctor"
                db.commit()

            # Create Doctor Profile
            if user.role == "doctor":
                profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
                if not profile:
                    profile = DoctorProfile(
                        user_id=user.id,
                        full_name=req.full_name,
                        specialty=req.specialization or "Cardiology",
                        license_number=req.license_number or "MD-TEMP",
                        department=req.department or "Cardiology & CCU"
                    )
                    db.add(profile)
                    db.commit()

            NotificationService.create_notification(
                db=db,
                title="Registration Approved",
                message=f"Doctor account for {req.email} has been approved and activated.",
                notification_type="APPROVAL",
                user_id=str(user.id)
            )

            AuditService.log_action(
                db=db,
                activity_type="Doctor Approved",
                details=f"Approved registration for {req.email} ({req.full_name})",
                user_email=admin_email
            )
            return {"status": "Approved", "user_id": str(user.id)}

        else:
            req.status = "Rejected"
            req.admin_notes = notes
            db.commit()

            AuditService.log_action(
                db=db,
                activity_type="Doctor Rejected",
                details=f"Rejected registration for {req.email}. Reason: {notes}",
                user_email=admin_email
            )
            return {"status": "Rejected"}
