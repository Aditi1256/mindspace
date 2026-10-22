import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Checkin, ExpressionResult

from app.schemas import HealthResponse
from app.routers import expressions, checkins, dashboard, activities, privacy, auth
from app.middleware.security import SecurityHardeningMiddleware



@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables and Auto-migrate Schema
    Base.metadata.create_all(bind=engine)

    # Auto-migration for SQLite to add new columns if table already existed
    with engine.connect() as conn:
        from sqlalchemy import text
        existing_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(checkins);"))]
        if "energy_score" not in existing_cols:
            conn.execute(text("ALTER TABLE checkins ADD COLUMN energy_score INTEGER DEFAULT 3;"))
        if "social_score" not in existing_cols:
            conn.execute(text("ALTER TABLE checkins ADD COLUMN social_score INTEGER DEFAULT 3;"))
        if "movement_score" not in existing_cols:
            conn.execute(text("ALTER TABLE checkins ADD COLUMN movement_score INTEGER DEFAULT 3;"))
        if "tags" not in existing_cols:
            conn.execute(text("ALTER TABLE checkins ADD COLUMN tags JSON DEFAULT '[]';"))
        conn.commit()

    # 2. Seed initial check-ins if database is empty
    db = SessionLocal()
    try:
        if db.query(Checkin).count() == 0:
            print("[Startup] Seeding initial check-in records...")
            seed_data = [
                (6, 4, 3, 4, 3, "Started semester review, feeling fairly organized.", "neutral", 0.78),
                (4, 6, 2, 3, 4, "Two assignment deadlines colliding on the same day.", "sad", 0.65),
                (2, 8, 1, 2, 5, "Mid-term exam tomorrow morning, stayed up late studying.", "fear", 0.62),
                (1, 5, 3, 4, 3, "Exam completed. Feeling relieved but catching up on rest.", "happy", 0.74),
            ]
            for days_ago, stress, workload, sleep, pressure, note, emo, conf in seed_data:
                chk = Checkin(
                    stress_level=stress,
                    workload_score=workload,
                    sleep_score=sleep,
                    pressure_score=pressure,
                    note=note,
                    created_at=datetime.utcnow() - timedelta(days=days_ago)
                )
                db.add(chk)
                db.flush()
                expr = ExpressionResult(
                    checkin_id=chk.id,
                    top_expression=emo,
                    confidence=conf,
                    probabilities={emo: conf, "neutral": 0.20},
                    model_version="cnn-v1.0",
                    created_at=chk.created_at
                )
                db.add(expr)
            db.commit()
    finally:
        db.close()

    # 3. Load ONNX Facial Expression Model
    try:
        from ml.infer import EmotionInferenceService
        model_file = os.path.join(PROJECT_ROOT, "saved_models", "cnn-v1.0.onnx")
        meta_file = os.path.join(PROJECT_ROOT, "saved_models", "metadata.json")
        app.state.ml_service = EmotionInferenceService(model_path=model_file, metadata_path=meta_file)
        print(f"[Startup] Facial Expression ML Service loaded successfully (version: {app.state.ml_service.model_version})")
    except Exception as e:
        print(f"[Startup Warning] Could not load ML model: {e}")
        app.state.ml_service = None

    yield
    print("[Shutdown] Cleaning up application resources...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Student Stress Check-In Tool (FastAPI + ONNX + SQLAlchemy)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Hardening Middleware (Headers, Rate Limiting)
app.add_middleware(SecurityHardeningMiddleware)

# Mount Routers
app.include_router(auth.router, prefix="/api")
app.include_router(auth.users_router, prefix="/api")
app.include_router(expressions.router, prefix="/api")
app.include_router(checkins.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(privacy.router, prefix="/api")



@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    model_loaded = hasattr(app.state, "ml_service") and app.state.ml_service is not None
    version_str = app.state.ml_service.model_version if model_loaded else "unknown"
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        model_loaded=model_loaded,
        model_version=version_str,
        database="connected"
    )
