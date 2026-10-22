import os
import sys
import pytest
import numpy as np
import cv2

# Ensure backend and project root are in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    """Initializes TestClient inside lifespan context so tables and ML model load."""
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    """Verify health endpoint and model loaded status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["model_loaded"] is True
    assert "model_version" in data


def test_create_checkin_valid(client):
    """Verify check-in creation with self-reported ground truth inputs."""
    payload = {
        "stress_level": 7,
        "workload_score": 2,
        "sleep_score": 2,
        "pressure_score": 4,
        "note": "Testing integration check-in API",
        "expression_result": {
            "top_expression": "neutral",
            "confidence": 0.82,
            "probabilities": {
                "neutral": 0.82,
                "happy": 0.08,
                "sad": 0.04,
                "fear": 0.02,
                "angry": 0.02,
                "surprise": 0.01,
                "disgust": 0.01
            },
            "model_version": "cnn-v1.0"
        }
    }
    response = client.post("/api/checkins", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["stress_level"] == 7
    assert data["workload_score"] == 2
    assert "id" in data
    assert "suggestions" in data
    assert len(data["suggestions"]) > 0
    # Verify expression observation is included
    assert any(s["id"] == "expression_reflection" for s in data["suggestions"])


def test_create_checkin_validation_error(client):
    """Verify Pydantic validation rejects out-of-range inputs (422)."""
    # stress_level cannot exceed 10
    invalid_payload = {
        "stress_level": 15,
        "workload_score": 3,
        "sleep_score": 3,
        "pressure_score": 3
    }
    response = client.post("/api/checkins", json=invalid_payload)
    assert response.status_code == 422


def test_predict_expression_in_memory(client):
    """Verify in-memory frame prediction without saving to disk."""
    # Create 200x200 synthetic image
    canvas = np.ones((200, 200, 3), dtype=np.uint8) * 200
    _, img_encoded = cv2.imencode(".jpg", canvas)
    img_bytes = img_encoded.tobytes()

    response = client.post(
        "/api/expressions/predict",
        files={"file": ("test_frame.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "face_detected" in data
    assert "top_expression" in data
    assert "confidence" in data
    assert "probabilities" in data
    assert len(data["probabilities"]) == 7
    assert "disclaimer" in data


def test_get_dashboard_summary(client):
    """Verify dashboard summary metrics computation."""
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_checkins" in data
    assert "average_stress" in data
    assert "weekly_trends" in data
    assert isinstance(data["weekly_trends"], list)


def test_delete_checkin(client):
    """Verify check-in deletion."""
    # Create one first
    create_res = client.post("/api/checkins", json={
        "stress_level": 3,
        "workload_score": 4,
        "sleep_score": 4,
        "pressure_score": 2,
        "note": "To be deleted"
    })
    chk_id = create_res.json()["id"]

    # Delete it
    del_res = client.delete(f"/api/checkins/{chk_id}")
    assert del_res.status_code == 200

    # Verify not found on subsequent delete
    del_res2 = client.delete(f"/api/checkins/{chk_id}")
    assert del_res2.status_code == 404


def test_wellness_activities(client):
    """Verify recording and listing wellness activities."""
    payload = {"activity_type": "box_breathing"}
    res = client.post("/api/activities", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["activity_type"] == "box_breathing"
    assert "id" in data

    list_res = client.get("/api/activities")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_privacy_consent_and_export(client):
    """Verify consent logging and data portability export."""
    consent_res = client.post("/api/privacy/consent", json={
        "consent_type": "webcam_analysis",
        "version": "1.0",
        "granted": True
    })
    assert consent_res.status_code == 200
    assert consent_res.json()["granted"] is True

    export_res = client.get("/api/privacy/export")
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert "checkins" in export_data
    assert "wellness_activities" in export_data


# ==========================================
# PHASE 5: AUTHENTICATION & HARDENING TESTS
# ==========================================

def test_auth_register_and_login(client):
    """Verify student account registration and JWT generation."""
    test_email = f"student_{os.urandom(4).hex()}@university.edu"
    test_password = "SecurePassword123!"

    # 1. Register new user
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": test_password,
        "save_expression_results": True
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email
    token = reg_data["access_token"]

    # 2. Reject duplicate registration with 400
    dup_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": "AnotherPassword456"
    })
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 3. Successful login with correct credentials
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == test_email

    # 4. Reject invalid login credentials
    bad_login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "WrongPassword999"
    })
    assert bad_login_res.status_code == 401

    # 5. Access profile via /api/auth/me using Bearer token
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email


def test_user_data_isolation(client):
    """Verify that User B cannot delete or access User A's check-ins."""
    user_a_email = f"usera_{os.urandom(4).hex()}@uni.edu"
    user_b_email = f"userb_{os.urandom(4).hex()}@uni.edu"

    # Register User A
    res_a = client.post("/api/auth/register", json={"email": user_a_email, "password": "PasswordA123"})
    token_a = res_a.json()["access_token"]

    # Register User B
    res_b = client.post("/api/auth/register", json={"email": user_b_email, "password": "PasswordB123"})
    token_b = res_b.json()["access_token"]

    # User A creates a private check-in
    chk_res = client.post(
        "/api/checkins",
        json={"stress_level": 7, "workload_score": 3, "sleep_score": 3, "pressure_score": 4, "note": "User A secret note"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert chk_res.status_code == 201
    chk_id = chk_res.json()["id"]

    # User B attempts to delete User A's check-in -> Expect 403 Forbidden
    unauth_delete_res = client.delete(
        f"/api/checkins/{chk_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert unauth_delete_res.status_code == 403

    # User A successfully deletes their own check-in
    auth_delete_res = client.delete(
        f"/api/checkins/{chk_id}",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert auth_delete_res.status_code == 200


def test_upgrade_guest_checkins(client):
    """Verify migrating guest check-ins to a newly registered student account."""
    # 1. Create a guest check-in (no Authorization header)
    guest_chk = client.post("/api/checkins", json={
        "stress_level": 6,
        "workload_score": 2,
        "sleep_score": 3,
        "pressure_score": 3,
        "note": "Guest session check-in"
    })
    assert guest_chk.status_code == 201
    guest_id = guest_chk.json()["id"]

    # 2. Register user
    user_email = f"migrator_{os.urandom(4).hex()}@uni.edu"
    reg_res = client.post("/api/auth/register", json={"email": user_email, "password": "PasswordMigrate123"})
    token = reg_res.json()["access_token"]

    # 3. Call guest upgrade endpoint
    upgrade_res = client.post(
        "/api/auth/upgrade-guest",
        json={"checkin_ids": [guest_id]},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert upgrade_res.status_code == 200
    assert upgrade_res.json()["imported_count"] == 1

    # 4. Now the user owns the check-in and can delete it
    del_res = client.delete(
        f"/api/checkins/{guest_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert del_res.status_code == 200


def test_security_headers_present(client):
    """Verify that SecurityHardeningMiddleware injects required defensive HTTP headers."""
    res = client.get("/api/health")
    assert res.status_code == 200
    headers = res.headers
    assert headers.get("x-frame-options") == "DENY"
    assert headers.get("x-content-type-options") == "nosniff"
    assert "strict-transport-security" in headers
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"


def test_account_deletion_cascade(client):
    """Verify DELETE /api/users/me deletes user account and cascades to check-ins."""
    user_email = f"delete_me_{os.urandom(4).hex()}@uni.edu"
    reg_res = client.post("/api/auth/register", json={"email": user_email, "password": "PasswordDelete123"})
    token = reg_res.json()["access_token"]

    # Create a check-in under this account
    chk_res = client.post(
        "/api/checkins",
        json={"stress_level": 5, "workload_score": 2, "sleep_score": 2, "pressure_score": 2},
        headers={"Authorization": f"Bearer {token}"}
    )
    chk_id = chk_res.json()["id"]

    # Delete account
    del_user_res = client.delete("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert del_user_res.status_code == 200
    assert "permanently deleted" in del_user_res.json()["message"]

    # Attempting to fetch profile with old token -> Expect 401
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 401

