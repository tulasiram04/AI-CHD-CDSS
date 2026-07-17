import os
import sys
import logging
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

# Add project root to path to ensure proper imports when running via uvicorn
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.session import get_db
from backend.database.models import ClinicalPrediction, InferenceLog, User
from backend.auth import RoleChecker, get_current_user
from backend.schemas import PredictionAuditResponse, InferenceLogResponse

logger = logging.getLogger("AuditsAPI")

router = APIRouter(prefix="/api/v1/audits", tags=["Compliance & Prediction Auditing"])

# Restricted to compliance auditors, doctors, and admins
require_allowed_roles = RoleChecker(["auditor", "admin", "doctor"])

@router.get("", response_model=List[PredictionAuditResponse])
def list_prediction_audits(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    patient_uuid: Optional[str] = None,
    current_user: User = Depends(require_allowed_roles),
    db: Session = Depends(get_db)
):
    """Retrieves standard prediction audit logs for compliance reviews."""
    role = current_user.role.lower()
    query = db.query(ClinicalPrediction)
    
    # Doctor is restricted to Own Activity
    if role == "doctor":
        query = query.filter(ClinicalPrediction.clinician_id == current_user.id)
    elif role not in ["admin", "auditor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted: Audit logs restricted to Admin and Clinicians."
        )
        
    if patient_uuid:
        query = query.filter(ClinicalPrediction.patient_uuid == patient_uuid)
        
    audits = query.order_by(ClinicalPrediction.timestamp.desc()).offset(offset).limit(limit).all()
    return audits

@router.get("/{audit_id}", response_model=PredictionAuditResponse)
def get_prediction_audit_detail(
    audit_id: uuid.UUID,
    current_user: User = Depends(require_allowed_roles),
    db: Session = Depends(get_db)
):
    """Retrieves specific details of a prediction audit."""
    audit = db.query(ClinicalPrediction).filter(ClinicalPrediction.id == audit_id).first()
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction audit log ID {audit_id} not found."
        )
        
    role = current_user.role.lower()
    if role == "doctor" and audit.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view details of predictions you executed."
        )
    elif role not in ["admin", "auditor", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted."
        )
        
    return audit

@router.get("/{audit_id}/performance", response_model=InferenceLogResponse)
def get_inference_performance_log(
    audit_id: uuid.UUID,
    current_user: User = Depends(require_allowed_roles),
    db: Session = Depends(get_db)
):
    """Retrieves the underlying system execution logs (latency, memory, CPU, drift) for an inference."""
    audit = db.query(ClinicalPrediction).filter(ClinicalPrediction.id == audit_id).first()
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction audit log not found."
        )
        
    role = current_user.role.lower()
    if role == "doctor" and audit.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view performance metrics of predictions you executed."
        )
    elif role not in ["admin", "auditor", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted."
        )
        
    log = db.query(InferenceLog).filter(InferenceLog.prediction_audit_id == audit_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inference performance log not found for audit ID {audit_id}."
        )
    return log
