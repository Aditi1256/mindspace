from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Checkin, WellnessActivity, User
from app.schemas import DashboardSummaryResponse, WeeklyTrendPoint
from app.services.auth import get_optional_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes summary averages and chronological trend data for the student dashboard.
    Only self-reported data is used for trends (PRD FR-DASH-5).
    Enforces per-user metrics isolation.
    """
    query = db.query(Checkin)
    if current_user:
        query = query.filter(Checkin.user_id == current_user.id)
        activities_query = db.query(WellnessActivity).filter(WellnessActivity.user_id == current_user.id)
    else:
        query = query.filter(Checkin.user_id.is_(None))
        activities_query = db.query(WellnessActivity).filter(WellnessActivity.user_id.is_(None))

    total = query.count()
    completed_activities = activities_query.count()

    if total == 0:
        return DashboardSummaryResponse(
            total_checkins=0,
            average_stress=0.0,
            average_sleep=0.0,
            average_workload=0.0,
            average_pressure=0.0,
            completed_activities=completed_activities,
            weekly_trends=[]
        )

    avg_stress = query.with_entities(func.avg(Checkin.stress_level)).scalar() or 0.0
    avg_sleep = query.with_entities(func.avg(Checkin.sleep_score)).scalar() or 0.0
    avg_workload = query.with_entities(func.avg(Checkin.workload_score)).scalar() or 0.0
    avg_pressure = query.with_entities(func.avg(Checkin.pressure_score)).scalar() or 0.0

    # Retrieve last 14 check-ins ordered chronologically for trending
    recent_checkins = (
        query
        .order_by(Checkin.created_at.asc())
        .limit(14)
        .all()
    )

    trends = []
    for c in recent_checkins:
        d = c.created_at or datetime.utcnow()
        trends.append(WeeklyTrendPoint(
            date=f"{d.month}/{d.day}",
            stress=float(c.stress_level),
            sleep=float(c.sleep_score),
            workload=float(c.workload_score),
            pressure=float(c.pressure_score)
        ))

    return DashboardSummaryResponse(
        total_checkins=total,
        average_stress=round(float(avg_stress), 1),
        average_sleep=round(float(avg_sleep), 1),
        average_workload=round(float(avg_workload), 1),
        average_pressure=round(float(avg_pressure), 1),
        completed_activities=completed_activities,
        weekly_trends=trends
    )
