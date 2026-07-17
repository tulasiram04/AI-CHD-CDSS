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
from backend.database.models import Report, User
from backend.auth import get_current_user
from backend.schemas import ReportCreate, ReportResponse

logger = logging.getLogger("ReportsAPI")

router = APIRouter(prefix="/api/v1/reports", tags=["Reports & Clinical Documents"])


@router.get("", response_model=List[ReportResponse])
def list_reports(
    category: Optional[str] = Query(None, description="Filter by category: patient | prediction | clinical | audit"),
    report_status: Optional[str] = Query(None, alias="status", description="Filter by status: Ready | Generating | Completed | Archived | Failed"),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all reports belonging to the current user, with optional filters."""
    query = db.query(Report).filter(Report.created_by == current_user.id)

    if category:
        query = query.filter(Report.category == category)
    if report_status:
        query = query.filter(Report.status == report_status)

    reports = (
        query.order_by(Report.pinned.desc(), Report.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return reports


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and persist a new report record to the database."""
    report = Report(
        name=payload.name,
        report_type=payload.report_type,
        category=payload.category,
        status="Ready",
        pinned=False,
        patient_id=payload.patient_id,
        admission_id=payload.admission_id,
        prediction_id=payload.prediction_id,
        report_data=payload.report_data or {},
        created_by=current_user.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    logger.info(f"Report '{report.name}' created by user {current_user.id}")
    return report


@router.patch("/{report_id}/pin", response_model=ReportResponse)
def toggle_pin(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle the pinned status of a report. Only the report creator can pin/unpin."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    if report.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only pin your own reports.")

    report.pinned = not report.pinned
    db.commit()
    db.refresh(report)
    logger.info(f"Report '{report.name}' pinned={report.pinned} by user {current_user.id}")
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete a report record from the database."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    if report.created_by != current_user.id and current_user.role.lower() not in ["admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own reports.")

    db.delete(report)
    db.commit()
    logger.info(f"Report '{report.name}' deleted by user {current_user.id}")
    return None
