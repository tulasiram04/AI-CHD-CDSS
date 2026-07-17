import os
import sys
import logging
from datetime import datetime, timedelta
from celery import Celery
from sqlalchemy.orm import Session

# Add project root to path to ensure proper imports when running via uvicorn
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config import settings
from backend.database.session import SessionLocal
from backend.database.models import ClinicalPrediction, InferenceLog

logger = logging.getLogger("CeleryTasks")

# Initialize Celery app matching uvicorn container entrypoint command
# command: celery -A backend.tasks.celery_app worker --loglevel=info
celery_app = Celery(
    "backend_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configure Celery settings
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Local fallback testing settings
    task_always_eager=True if os.environ.get("ENV") == "development" else False
)

@celery_app.task
def compute_daily_data_drift() -> dict:
    """
    Periodically checks prediction input audits to detect drift against training baseline.
    Returns calculated mean risk and total count of requests in past 24 hours.
    """
    logger.info("Starting background task: compute_daily_data_drift")
    db: Session = SessionLocal()
    try:
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        audits = db.query(ClinicalPrediction).filter(ClinicalPrediction.timestamp >= one_day_ago).all()
        
        if not audits:
            logger.info("No prediction audits found in past 24 hours. Drift score calculations skipped.")
            return {"status": "skipped", "count": 0}
            
        risks = [a.predicted_risk for a in audits]
        mean_risk = sum(risks) / len(risks)
        
        # Log summary drift metric
        logger.info(f"Analyzed {len(audits)} predictions in past 24 hours. Mean predicted risk: {mean_risk:.4f}")
        return {
            "status": "success",
            "count": len(audits),
            "mean_predicted_risk": mean_risk,
            "calculated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in background data drift computation: {e}")
        return {"status": "error", "detail": str(e)}
    finally:
        db.close()

@celery_app.task
def generate_clinical_system_health_report() -> dict:
    """
    Calculates execution metrics: average latency, memory, CPU load in past hour.
    """
    logger.info("Starting background task: generate_clinical_system_health_report")
    db: Session = SessionLocal()
    try:
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        logs = db.query(InferenceLog).filter(InferenceLog.timestamp >= one_hour_ago).all()
        
        if not logs:
            return {"status": "skipped", "count": 0}
            
        latencies = [l.execution_latency_ms for l in logs]
        cpu_loads = [l.cpu_load_pct for l in logs]
        memories = [l.memory_usage_mb for l in logs]
        
        report = {
            "status": "success",
            "log_count": len(logs),
            "avg_latency_ms": sum(latencies) / len(latencies),
            "avg_cpu_pct": sum(cpu_loads) / len(cpu_loads),
            "avg_memory_mb": sum(memories) / len(memories),
            "generated_at": datetime.utcnow().isoformat()
        }
        logger.info(f"System health calculated successfully: {report}")
        return report
    except Exception as e:
        logger.error(f"Error in background system health task: {e}")
        return {"status": "error", "detail": str(e)}
    finally:
        db.close()
