"""
Hospital & Department Service
Manages primary hospital facilities, department mappings, and bed allocations.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from backend.database.models import Hospital, Department, User, Patient, ClinicalPrediction
from backend.services.audit_service import AuditService

class HospitalService:
    @staticmethod
    def get_all_hospitals(db: Session) -> List[Dict[str, Any]]:
        """Returns registered hospital facilities."""
        hospitals = db.query(Hospital).filter(Hospital.is_deleted == False).all()
        if not hospitals:
            primary_hospital = Hospital(
                name="St. Jude Memorial Hospital",
                code="SJH-01",
                city="Boston",
                state="MA",
                status="Active",
                total_beds=450,
                icu_beds=60
            )
            db.add(primary_hospital)
            db.commit()
            db.refresh(primary_hospital)
            hospitals = [primary_hospital]
        
        return [
            {
                "id": str(h.id),
                "name": h.name,
                "code": h.code,
                "city": h.city,
                "state": h.state,
                "status": h.status,
                "total_beds": h.total_beds,
                "icu_beds": h.icu_beds
            }
            for h in hospitals
        ]

    @staticmethod
    def get_hospital_details(db: Session, hospital_id: str) -> Dict[str, Any]:
        """Returns deep telemetry for hospital including departments, doctors, patients, and predictions."""
        hospital = db.query(Hospital).filter(Hospital.id == hospital_id, Hospital.is_deleted == False).first()
        if not hospital:
            hospital = db.query(Hospital).filter(Hospital.is_deleted == False).first()
            if not hospital:
                raise HTTPException(status_code=404, detail="Hospital not found")

        departments = db.query(Department).filter(Department.is_deleted == False).all()
        for d in departments:
            if not d.hospital_id:
                d.hospital_id = hospital.id
                db.commit()

        total_doctors = db.query(User).filter(func.lower(User.role) == "doctor", User.is_deleted == False).count()
        total_patients = db.query(Patient).filter(Patient.is_deleted == False).count()
        total_predictions = db.query(ClinicalPrediction).filter(ClinicalPrediction.is_deleted == False).count()

        first_doctor = db.query(User).filter(func.lower(User.role) == "doctor", User.is_deleted == False).first()
        director_name = f"Dr. {first_doctor.full_name}" if first_doctor and first_doctor.full_name else (first_doctor.email if first_doctor else "Dr. Alexander Vance")

        admin_user = db.query(User).filter(func.lower(User.role).in_(["admin", "super_admin"]), User.is_deleted == False).first()
        governance_name = admin_user.email if admin_user else "admin@hospital.org"

        return {
            "id": str(hospital.id),
            "name": hospital.name,
            "code": hospital.code,
            "city": hospital.city,
            "state": hospital.state,
            "status": hospital.status,
            "total_beds": hospital.total_beds,
            "icu_beds": hospital.icu_beds,
            "facility_type": "Primary Medical Facility",
            "emergency_phone": f"Hospital Operations ({hospital.code})",
            "director": director_name,
            "governance_officer": governance_name,
            "total_doctors": total_doctors,
            "total_patients": total_patients,
            "total_predictions": total_predictions,
            "departments": [
                {
                    "id": str(d.id),
                    "name": d.name,
                    "code": d.code,
                    "head_clinician": d.head_clinician or "Head Clinician",
                    "status": d.status
                }
                for d in departments
            ]
        }

    @staticmethod
    def get_all_departments(db: Session) -> List[Dict[str, Any]]:
        """Returns list of clinical departments."""
        depts = db.query(Department).filter(Department.is_deleted == False).all()
        return [
            {
                "id": str(d.id),
                "name": d.name,
                "code": d.code,
                "head_clinician": d.head_clinician or "Head Clinician",
                "status": d.status
            }
            for d in depts
        ]
