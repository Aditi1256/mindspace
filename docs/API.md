# REST API Specification
## Facial-Expression-Based Stress Check-In Tool for Students

**Base URL**: `http://localhost:8000/api`

---

### 1. System Health
#### `GET /health`
- **Description**: Returns service health, database status, and ML model loaded status.
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "model_loaded": true,
  "model_version": "cnn-v1.0"
}
```

---

### 2. Facial Expression Prediction
#### `POST /expressions/predict`
- **Description**: Accepts an in-memory image frame (multipart file or JSON base64), detects the primary face, resizes to 48x48 grayscale, and returns 7-class emotion probabilities.
- **Auth**: Optional / Rate-limited (e.g. 30 requests/min)
- **Request Body (Multipart)**:
  - `file`: Image file (JPEG/PNG, max 2MB)
- **Response `200 OK`**:
```json
{
  "face_detected": true,
  "top_expression": "neutral",
  "confidence": 0.82,
  "probabilities": {
    "angry": 0.02,
    "disgust": 0.00,
    "fear": 0.03,
    "happy": 0.07,
    "neutral": 0.82,
    "sad": 0.04,
    "surprise": 0.02
  },
  "model_version": "cnn-v1.0",
  "disclaimer": "This prediction shows visible facial expression features only. It does not measure your emotional feelings or stress level."
}
```
- **Error `400 Bad Request`**: No face detected or invalid image format.
- **Error `413 Payload Too Large`**: Image exceeds 2MB limit.

---

### 3. Check-Ins
#### `POST /checkins`
- **Description**: Creates a new check-in record. In guest mode, can be simulated client-side or saved anonymously.
- **Request Body**:
```json
{
  "stress_level": 7,
  "workload_score": 4,
  "sleep_score": 2,
  "pressure_score": 4,
  "note": "Final exam week approaching, feeling tired.",
  "expression_result": {
    "top_expression": "neutral",
    "confidence": 0.82,
    "probabilities": { ... },
    "model_version": "cnn-v1.0"
  }
}
```
- **Response `201 Created`**: Returns saved check-in object with generated ID and computed suggestion recommendations.

#### `GET /checkins/history`
- **Description**: Retrieves paginated list of user's past check-ins.
- **Query Params**: `limit=20&offset=0`

#### `DELETE /checkins/{id}`
- **Description**: Deletes a single check-in record and cascading expression result.

---

### 4. Dashboard & Aggregates
#### `GET /dashboard/summary`
- **Description**: Computes weekly averages for stress, sleep, workload, and pressure for the user's dashboard charts.
- **Response `200 OK`**:
```json
{
  "total_checkins": 12,
  "weekly_trends": [
    {
      "date": "2026-10-16",
      "avg_stress": 6.5,
      "avg_sleep": 3.0,
      "avg_workload": 3.8,
      "avg_pressure": 4.0
    }
  ],
  "recent_suggestions": [ ... ]
}
```

---

### 5. Authentication (Phase 5)
- `POST /auth/register`: Create account with email & password (bcrypt).
- `POST /auth/login`: Return JWT token.
- `DELETE /users/me`: Permanently delete account and all cascading records.
