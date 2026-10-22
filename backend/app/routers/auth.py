from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database import get_db
from app.models import User, Checkin, ExpressionResult, WellnessActivity
from app.schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    GuestUpgradeRequest
)
from app.services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication & Accounts"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new student account with bcrypt password hashing.
    Returns JWT access token.
    """
    normalized_email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pw = get_password_hash(payload.password)
    user = User(
        email=normalized_email,
        password_hash=hashed_pw,
        save_expression_results=payload.save_expression_results,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates student credentials and returns JWT access token.
    """
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieves the authenticated student's profile and privacy preferences.
    """
    return UserResponse.model_validate(current_user)


@router.post("/upgrade-guest", status_code=status.HTTP_200_OK)
def upgrade_guest_session(
    payload: GuestUpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Associates guest check-ins with the student's newly created account.
    Fulfills PRD FR-AUTH-3 & Phase 5 tasks.
    """
    if not payload.checkin_ids:
        return {"message": "No check-in IDs provided.", "imported_count": 0}

    # Assign user_id to orphaned check-ins
    updated_count = (
        db.query(Checkin)
        .filter(Checkin.id.in_(payload.checkin_ids), Checkin.user_id.is_(None))
        .update({Checkin.user_id: current_user.id}, synchronize_session=False)
    )
    db.commit()

    return {
        "message": f"Successfully imported {updated_count} check-ins into your account.",
        "imported_count": updated_count
    }


# Account Deletion Endpoint (PRD FR-AUTH-4 & Section 13 /api/users/me)
users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.delete("/me", status_code=status.HTTP_200_OK)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes current student's account and all associated check-ins,
    expressions, and activity logs via ON DELETE CASCADE.
    """
    user_id = current_user.id
    db.delete(current_user)
    db.commit()

    return {
        "message": "Your account and all associated wellness data have been permanently deleted.",
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
