from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


from app.database import get_db
from app.models import WellnessActivity

router = APIRouter(prefix="/activities", tags=["Wellness Activities"])

class ActivityCreate(BaseModel):
    activity_type: str = Field(..., max_length=100, description="e.g. 'box_breathing', 'take_5min_break', 'task_chunking'")
    checkin_id: Optional[str] = None

class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    activity_type: str
    checkin_id: Optional[str]
    completed_at: datetime


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def record_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    """
    Records a completed wellness practice (e.g. 4-4-4 box breathing or micro-break).
    """
    activity = WellnessActivity(
        activity_type=payload.activity_type,
        checkin_id=payload.checkin_id,
        completed_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.get("", response_model=List[ActivityResponse])
def get_activities(limit: int = 20, db: Session = Depends(get_db)):
    """
    Retrieves recent completed activities.
    """
    return (
        db.query(WellnessActivity)
        .order_by(WellnessActivity.completed_at.desc())
        .limit(limit)
        .all()
    )
