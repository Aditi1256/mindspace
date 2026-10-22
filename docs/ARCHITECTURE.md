# Architecture Specification
## Facial-Expression-Based Stress Check-In Tool for Students

### 1. High-Level System Architecture

```
               +---------------------------------------+
               |         Student Browser (Client)      |
               |  React 18 + Vite + Recharts + CSS     |
               +-------------------+-------------------+
                                   |
              HTTP / REST (JSON)   |  Transient Frame (Base64/Multipart)
                                   v
               +---------------------------------------+
               |        FastAPI Backend Service        |
               |  - Input Validation (Pydantic)       |
               |  - Auth & JWT Service                 |
               |  - Rule-Based Suggestion Engine       |
               |  - OpenCV Haar Cascade Preprocessing  |
               |  - TensorFlow/Keras Inference Engine  |
               +-------------------+-------------------+
                                   |
                         SQLAlchemy ORM (Async/Sync)
                                   v
               +---------------------------------------+
               |               Database                |
               |  - SQLite (Local Dev / Portable)     |
               |  - PostgreSQL (Production / Cloud)    |
               +---------------------------------------+
```

---

### 2. Components & Responsibilities

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Recharts, Lucide Icons | Responsive UI, state management, webcam stream & canvas frame capture, questionnaire flow, breathing visualizer, privacy settings. |
| **Backend API** | FastAPI, Uvicorn, Pydantic | API routing, request validation, authentication, rate limiting, and persistence. |
| **Vision & ML** | OpenCV (`cv2`), TensorFlow / Keras | Face detection via Haar Cascade, 48x48 grayscale normalization, CNN model inference over 7 classes. |
| **Database** | SQLAlchemy, Alembic, SQLite/PostgreSQL | Relational persistence of accounts, check-ins, expression classifications, and activity logs. |

---

### 3. Key Architectural Decisions

1. **Strict Signal Decoupling (Responsible AI)**:
   - Self-reported stress ($0-10$) is stored in the `checkins` table.
   - Detected facial expressions are stored in a separate table (`expression_results`) linked via foreign key.
   - The expression result is **never** used to override or calculate the stress score. It only generates an optional informational prompt.
2. **Transient Image Processing (Zero-Disk Storage)**:
   - Webcam frames sent from the browser are processed in RAM memory buffers.
   - Once OpenCV detects and crops the face and the CNN outputs probabilities, the raw image buffer is discarded immediately.
   - No raw image files or video clips are ever saved to disk or persistent storage.
3. **Database Portability**:
   - Uses SQLAlchemy 2.0 with a fallback to SQLite (`sqlite:///./stress_checkin.db`) for immediate zero-setup local execution, while fully supporting PostgreSQL via the `DATABASE_URL` environment variable.
4. **Graceful Degradation**:
   - If a student denies camera permissions, has no camera, or face detection fails, the application smoothly allows them to complete their check-in with the self-reported questionnaire.

---

### 4. Data Flow

1. Student opens app $\rightarrow$ Selects **Guest Mode** or logs into their account.
2. Student completes 4-question self-report $\rightarrow$ (Stress, Workload, Sleep, Academic Pressure).
3. Optional webcam step $\rightarrow$ Explicit consent modal $\rightarrow$ Camera preview $\rightarrow$ Snapshot captured to canvas.
4. Snapshot sent to `POST /api/expressions/predict` $\rightarrow$ OpenCV crops face $\rightarrow$ CNN infers 7 class probabilities $\rightarrow$ Returns top expression and confidence score.
5. Client renders results $\rightarrow$ Self-report card, Expression card with limitations notice, and customized wellness suggestions.
6. Check-in saved to `checkins` table $\rightarrow$ Trends updated in Dashboard.
