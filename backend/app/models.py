import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Index
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    save_expression_results = Column(Boolean, default=True)
    consent_version = Column(String(50), default="1.0")
    consent_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    checkins = relationship("Checkin", back_populates="user", cascade="all, delete-orphan")


class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Self-reported ground truth inputs (PRD FR-Q-1)
    stress_level = Column(Integer, nullable=False)     # 0 - 10
    workload_score = Column(Integer, nullable=False)   # 1 - 5
    sleep_score = Column(Integer, nullable=False)      # 1 - 5
    pressure_score = Column(Integer, nullable=False)   # 1 - 5
    note = Column(Text, nullable=True)                 # Max 500 chars

    # Relationships
    user = relationship("User", back_populates="checkins")
    expression_result = relationship(
        "ExpressionResult",
        back_populates="checkin",
        uselist=False,
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_checkin_user_created", "user_id", "created_at"),
    )


class ExpressionResult(Base):
    __tablename__ = "expression_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    checkin_id = Column(String(36), ForeignKey("checkins.id", ondelete="CASCADE"), unique=True, nullable=False)
    top_expression = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities = Column(JSON, nullable=False)  # 7-class dictionary
    model_version = Column(String(50), default="cnn-v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    checkin = relationship("Checkin", back_populates="expression_result")


class WellnessActivity(Base):
    __tablename__ = "wellness_activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    checkin_id = Column(String(36), ForeignKey("checkins.id", ondelete="SET NULL"), nullable=True)
    activity_type = Column(String(100), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
