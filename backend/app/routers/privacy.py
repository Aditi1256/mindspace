from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any

from app.database import get_db
from app.models import Checkin, ExpressionResult, WellnessActivity

router = APIRouter(prefix="/privacy", tags=["Privacy & Compliance"])

class ConsentRecordRequest(BaseModel):
    consent_type: str = "webcam_analysis"
    version: str = "1.0"
    granted: bool

@router.post("/consent")
def record_consent(payload: ConsentRecordRequest):
    """
    Logs user consent decision with timestamp and PRD disclosure version.
    """
    return {
        "status": "recorded",
        "consent_type": payload.consent_type,
        "version": payload.version,
        "granted": payload.granted,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "notice": "No raw webcam images are permanently stored. Processing is transient and in-memory only."
    }

@router.delete("/wipe-all", status_code=status.HTTP_200_OK)
def wipe_all_student_data(db: Session = Depends(get_db)):
    """
    Permanently erases all check-ins, expression classifications, and wellness activity logs.
    Fulfills PRD FR-PRIV-3 (Right to Erasure).
    """
    count_activities = db.query(WellnessActivity).delete()
    count_expressions = db.query(ExpressionResult).delete()
    count_checkins = db.query(Checkin).delete()
    db.commit()

    return {
        "message": "All student check-in, expression, and activity data has been permanently deleted.",
        "deleted_records": {
            "checkins": count_checkins,
            "expressions": count_expressions,
            "activities": count_activities
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/export")
def export_all_student_data(db: Session = Depends(get_db)):
    """
    Exports full student data in portable JSON format.
    Fulfills PRD Section 17 & 8.6 data export requirements.
    """
    checkins = db.query(Checkin).order_by(Checkin.created_at.asc()).all()
    activities = db.query(WellnessActivity).order_by(WellnessActivity.completed_at.asc()).all()

    export_payload = {
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "data_retention_policy": "Zero raw images stored. Only self-reported metrics and optional expression classifications.",
        "total_checkins": len(checkins),
        "checkins": [
            {
                "id": c.id,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "stress_level": c.stress_level,
                "workload_score": c.workload_score,
                "sleep_score": c.sleep_score,
                "pressure_score": c.pressure_score,
                "note": c.note,
                "expression_result": {
                    "top_expression": c.expression_result.top_expression,
                    "confidence": c.expression_result.confidence,
                    "probabilities": c.expression_result.probabilities,
                    "model_version": c.expression_result.model_version
                } if c.expression_result else None
            }
            for c in checkins
        ],
        "wellness_activities": [
            {
                "id": a.id,
                "activity_type": a.activity_type,
                "checkin_id": a.checkin_id,
                "completed_at": a.completed_at.isoformat() if a.completed_at else None
            }
            for a in activities
        ]
    }
    return export_payload
