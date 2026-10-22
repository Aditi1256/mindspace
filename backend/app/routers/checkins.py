from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Checkin, ExpressionResult, User
from app.schemas import CheckinCreate, CheckinResponse
from app.services.suggestions import generate_suggestions
from app.services.auth import get_optional_current_user

router = APIRouter(prefix="/checkins", tags=["Check-Ins"])

@router.post("", response_model=CheckinResponse, status_code=status.HTTP_201_CREATED)
def create_checkin(
    payload: CheckinCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new check-in record.
    Associates with authenticated student account or guest session.
    """
    user_id = current_user.id if current_user else None

    new_checkin = Checkin(
        user_id=user_id,
        stress_level=payload.stress_level,
        workload_score=payload.workload_score,
        sleep_score=payload.sleep_score,
        pressure_score=payload.pressure_score,
        energy_score=payload.energy_score,
        social_score=payload.social_score,
        movement_score=payload.movement_score,
        tags=payload.tags or [],
        note=payload.note,
        created_at=datetime.utcnow()
    )
    db.add(new_checkin)
    db.flush() # populates new_checkin.id

    if payload.expression_result:
        # Check if authenticated user disabled expression storage
        should_save = True
        if current_user and not current_user.save_expression_results:
            should_save = False

        if should_save:
            expr = ExpressionResult(
                checkin_id=new_checkin.id,
                top_expression=payload.expression_result.top_expression,
                confidence=payload.expression_result.confidence,
                probabilities=payload.expression_result.probabilities,
                model_version=payload.expression_result.model_version or "cnn-v1.0",
                created_at=datetime.utcnow()
            )
            db.add(expr)

    db.commit()
    db.refresh(new_checkin)

    # Generate suggestions
    expr_dict = None
    if new_checkin.expression_result:
        expr_dict = {
            "top_expression": new_checkin.expression_result.top_expression,
            "confidence": new_checkin.expression_result.confidence,
            "probabilities": new_checkin.expression_result.probabilities
        }

    suggestions = generate_suggestions(
        stress_level=new_checkin.stress_level,
        workload_score=new_checkin.workload_score,
        sleep_score=new_checkin.sleep_score,
        pressure_score=new_checkin.pressure_score,
        expression_result=expr_dict
    )

    response_data = CheckinResponse.model_validate(new_checkin)
    response_data.suggestions = suggestions
    return response_data


@router.get("/history", response_model=List[CheckinResponse])
def get_checkin_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves paginated check-in records.
    Enforces per-user data isolation: authenticated users only see their own records.
    """
    query = db.query(Checkin)
    if current_user:
        query = query.filter(Checkin.user_id == current_user.id)
    else:
        # Guest mode returns guest records
        query = query.filter(Checkin.user_id.is_(None))

    records = (
        query
        .order_by(Checkin.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [CheckinResponse.model_validate(r) for r in records]


@router.delete("/{checkin_id}", status_code=status.HTTP_200_OK)
def delete_checkin(
    checkin_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a single check-in record and cascading expression result.
    Prevents unauthorized deletion of another student's data.
    """
    record = db.query(Checkin).filter(Checkin.id == checkin_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Check-in record not found.")

    if current_user and record.user_id and record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this check-in record."
        )

    db.delete(record)
    db.commit()
    return {"message": "Check-in record deleted successfully.", "id": checkin_id}
