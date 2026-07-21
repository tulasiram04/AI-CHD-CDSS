"""
Patient Registry & Clinical Analytics Service
Handles shared patient data, demographic analysis, and risk statistics.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.models import Patient, ClinicalPrediction
from backend.services.audit_service import AuditService

class PatientService:
    @staticmethod
    def get_patient_analytics(db: Session) -> Dict[str, Any]:
        """Calculates live demographic & clinical statistics directly from PostgreSQL."""
        total_patients = db.query(Patient).filter(Patient.is_deleted == False).count()
        if total_patients == 0:
            return {
                "total_patients": 0,
                "critical_patients": 0,
                "recovered_patients": 0,
                "average_age": 0.0,
                "smoking_ratio_pct": 0.0,
                "diabetes_ratio_pct": 0.0,
                "hypertension_ratio_pct": 0.0,
                "obesity_ratio_pct": 0.0,
                "average_bmi": 0.0,
                "average_cholesterol": 0.0,
                "average_systolic_bp": 0.0
            }

        avg_age = db.query(func.avg(Patient.age)).filter(Patient.is_deleted == False).scalar() or 0.0
        avg_bmi = db.query(func.avg(Patient.bmi)).filter(Patient.is_deleted == False).scalar() or 0.0
        avg_chol = db.query(func.avg(Patient.tot_chol)).filter(Patient.is_deleted == False).scalar() or 0.0
        avg_sys_bp = db.query(func.avg(Patient.sys_bp)).filter(Patient.is_deleted == False).scalar() or 0.0

        smoking_count = db.query(Patient).filter(Patient.current_smoker == 1, Patient.is_deleted == False).count()
        diabetes_count = db.query(Patient).filter(Patient.diabetes == 1, Patient.is_deleted == False).count()
        hypertension_count = db.query(Patient).filter(Patient.bp_meds == 1, Patient.is_deleted == False).count()
        obese_count = db.query(Patient).filter(Patient.bmi >= 30.0, Patient.is_deleted == False).count()

        high_risk_patients = (
            db.query(ClinicalPrediction)
            .filter(ClinicalPrediction.risk_level.ilike("%high%"), ClinicalPrediction.is_deleted == False)
            .count()
        )

        return {
            "total_patients": total_patients,
            "critical_patients": high_risk_patients,
            "recovered_patients": max(0, total_patients - high_risk_patients),
            "average_age": round(float(avg_age), 1),
            "smoking_ratio_pct": round((smoking_count / total_patients) * 100, 1),
            "diabetes_ratio_pct": round((diabetes_count / total_patients) * 100, 1),
            "hypertension_ratio_pct": round((hypertension_count / total_patients) * 100, 1),
            "obesity_ratio_pct": round((obese_count / total_patients) * 100, 1),
            "average_bmi": round(float(avg_bmi), 1),
            "average_cholesterol": round(float(avg_chol), 1),
            "average_systolic_bp": round(float(avg_sys_bp), 1)
        }
