from datetime import datetime
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field, ConfigDict

# Expression Schemas
class ExpressionPredictResponse(BaseModel):
    face_detected: bool
    top_expression: str
    confidence: float
    probabilities: Dict[str, float]
    model_version: str
    disclaimer: str

class ExpressionResultCreate(BaseModel):
    top_expression: str
    confidence: float
    probabilities: Dict[str, float]
    model_version: Optional[str] = "cnn-v1.0"

class ExpressionResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    top_expression: str
    confidence: float
    probabilities: Dict[str, float]
    model_version: str
    created_at: datetime

# Check-in Schemas
class CheckinCreate(BaseModel):
    stress_level: int = Field(..., ge=0, le=10, description="Overall stress level (0 to 10)")
    workload_score: int = Field(..., ge=1, le=5, description="Workload manageability (1 to 5)")
    sleep_score: int = Field(..., ge=1, le=5, description="Sleep quality (1 to 5)")
    pressure_score: int = Field(..., ge=1, le=5, description="Academic pressure impact (1 to 5)")
    note: Optional[str] = Field(None, max_length=500, description="Optional reflection note")
    expression_result: Optional[ExpressionResultCreate] = None

class CheckinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    stress_level: int
    workload_score: int
    sleep_score: int
    pressure_score: int
    note: Optional[str] = None
    expression_result: Optional[ExpressionResultResponse] = None
    suggestions: Optional[List[Dict[str, Any]]] = None


# Dashboard Summary Schema
class WeeklyTrendPoint(BaseModel):
    date: str
    stress: float
    sleep: float
    workload: float
    pressure: float

class DashboardSummaryResponse(BaseModel):
    total_checkins: int
    average_stress: float
    average_sleep: float
    average_workload: float
    average_pressure: float
    completed_activities: int
    weekly_trends: List[WeeklyTrendPoint]


# Health Check Schema
class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    model_version: str
    database: str

# Auth & User Schemas (PRD Phase 5)
class UserRegister(BaseModel):
    email: str = Field(..., description="Student email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    save_expression_results: Optional[bool] = True

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    save_expression_results: bool
    consent_version: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class GuestUpgradeRequest(BaseModel):
    checkin_ids: List[str] = Field(default_factory=list, description="IDs of checkins from guest session to import")

