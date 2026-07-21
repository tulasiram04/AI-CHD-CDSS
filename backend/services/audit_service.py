"""
Audit Logging Service
Centralizes audit logging across Doctor and Super Admin portals.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.database.models import AuditLog, User

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        activity_type: str,
        details: str,
        user_email: Optional[str] = None,
        patient_uuid: Optional[str] = None,
        risk_level: Optional[str] = None,
        risk_score: Optional[float] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """Creates a central audit log record in PostgreSQL."""
        log_entry = AuditLog(
            user_email=user_email or "system@hospital.org",
            activity_type=activity_type,
            details=details,
            patient_uuid=patient_uuid,
            risk_level=risk_level,
            risk_score=risk_score,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    @staticmethod
    def get_recent_logs(db: Session, limit: int = 100):
        """Fetches audit logs ordered by timestamp descending."""
        return (
            db.query(AuditLog)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
            .all()
        )
