# MindSpace &bull; Student Stress Check-In & Expression Observation Tool

[![CI Pipeline](https://img.shields.io/badge/CI-GitHub%20Actions-brightgreen.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg?logo=python&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg?logo=react&logoColor=black)](#)
[![ONNX Runtime](https://img.shields.io/badge/ONNX%20Runtime-1.20+-005CED.svg?logo=onnx&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> **A Privacy-First, Responsible AI Full-Stack Portfolio Application designed to help university students reflect on stress, track workload and sleep patterns, and practice evidence-based relaxation tools.**

Developed by **Aditi Gupta** as a portfolio project showcasing Full-Stack Engineering, Applied Machine Learning, and Responsible AI practices.

---

## 📑 Table of Contents
1. [Important Responsible AI Statement](#1-important-responsible-ai-statement)
2. [System Architecture](#2-system-architecture)
3. [Key Features](#3-key-features)
4. [Tech Stack](#4-tech-stack)
5. [Repository Structure](#5-repository-structure)
6. [Quick Start (Docker & Local)](#6-quick-start)
7. [API Specification](#7-api-specification)
8. [Machine Learning Pipeline](#8-machine-learning-pipeline)
9. [Security & Privacy Architecture](#9-security--privacy-architecture)
10. [Software Engineering & ML Interview Talking Points](#10-software-engineering--ml-interview-talking-points)

---

## 1. Important Responsible AI Statement

> [!IMPORTANT]
> **Strict Signal Decoupling & Non-Clinical Disclaimer:**  
> This application is a self-reflection prototype. It is **not** a diagnostic device, clinical tool, or mental-health detection system.  
> 
> Visible facial expressions **cannot** reliably measure internal emotional state or psychological stress. Therefore:
> 1. The student's **self-reported rating ($0-10$) is the sole ground truth**.
> 2. The facial expression model provides only a secondary, informational observation (e.g., *"Detected expression: neutral (78% confidence)"*).
> 3. The ML model **never overrides, computes, or modifies** the user's reported stress level.
> 4. If a student reports high stress ($\ge 8$), non-alarmist campus counseling and support contacts are immediately presented.

---

## 2. System Architecture

```
                       +---------------------------------------+
                       |        Student Browser (Client)       |
                       |  React 18/19 + Vite + Recharts + CSS  |
                       +-------------------+-------------------+
                                           |
                   HTTP / REST (JSON)      |  Transient Snapshot Frame (Base64)
                   Authorization: Bearer   |  (Explicit Consent Required)
                                           v
                       +---------------------------------------+
                       |        FastAPI Backend Service        |
                       |  - Pydantic Input Validation          |
                       |  - Bcrypt Hashing & JWT Auth Service  |
                       |  - Rule-Based Suggestion Engine       |
                       |  - Security Hardening & Rate Limiting |
                       +-------------------+-------------------+
                                           |
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
+---------------------------------------+   +---------------------------------------+
|        OpenCV & ONNX Inference        |   |       SQLAlchemy ORM (SQLite/PG)      |
|  - In-Memory RAM Buffer (Zero Disk)   |   |  - users (Bcrypt, JWT)                |
|  - Haar Cascade Face Crop (48x48)     |   |  - checkins (Stress Ground Truth)     |
|  - 4-Block CNN Model (7 Classes)      |   |  - expression_results (Decoupled)     |
|  - <100ms CPU Inference Latency       |   |  - wellness_activities & consent_logs |
+---------------------------------------+   +---------------------------------------+
```

---

## 3. Key Features

- **2-Minute Self-Reflection Flow**:
  - Accessible sliders for current stress ($0-10$), workload manageability ($1-5$), sleep quality ($1-5$), and academic deadline pressure ($1-5$).
  - Dynamic stress band indicators with supportive contextual descriptions.
- **Optional Facial Expression Observation**:
  - Transparent consent modal before any camera stream initialization.
  - Webcam stream releases camera hardware immediately upon snapshot or component unmount.
  - Zero disk storage: Single frame processed in memory and immediately discarded.
- **Actionable Non-Clinical Suggestions**:
  - Rule-based suggestions tailored to workload, sleep deprivation, or deadline pressure.
  - Integrated 4-4-4 Box Breathing visualizer with real-time cycle tracking and activity logging.
- **Longitudinal Trend Analytics**:
  - Interactive multi-metric Recharts visualization (Stress, Sleep, Workload, Pressure over time).
  - Weekly summary metrics and distribution analysis.
- **Flexible Identity & Hardened Security**:
  - **Guest Mode**: Zero-barrier check-ins without forced sign-up.
  - **Account Upgrade**: One-click guest check-in migration to registered accounts.
  - **Bcrypt + JWT**: Passwords hashed with 12-round salt; stateless HS256 tokens.
  - **Data Sovereignty**: Complete JSON data export, single check-in deletion, or permanent cascading account wipe (`DELETE /api/users/me`).

---

## 4. Tech Stack

| Layer | Technologies | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend** | JavaScript (ES6+), React 19, Vite | Recharts, Lucide React, Modern CSS (Design Tokens) |
| **Backend API** | Python 3.11, FastAPI, Uvicorn | Pydantic v2, SQLAlchemy 2.0, Python-Jose (JWT), Bcrypt |
| **Machine Learning** | PyTorch, ONNX, ONNX Runtime | OpenCV (`cv2`), NumPy, Scikit-Learn |
| **Database** | SQLite (Default Dev/Local), PostgreSQL ready | Parameterized SQL via SQLAlchemy ORM |
| **DevOps & CI/CD** | Docker, Docker Compose, Nginx | GitHub Actions, Multi-Stage Builds |

---

## 5. Repository Structure

```
Facial Expression detector/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated CI: pytest, ML checks, npm build
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   │   └── security.py        # Defensive headers & sliding-window rate limits
│   │   ├── routers/
│   │   │   ├── activities.py      # Wellness exercises & breathing logs
│   │   │   ├── auth.py            # Register, login, profile, guest upgrade
│   │   │   ├── checkins.py        # Check-in CRUD with user data isolation
│   │   │   ├── dashboard.py       # Longitudinal trend aggregations
│   │   │   ├── expressions.py     # In-memory webcam prediction
│   │   │   └── privacy.py         # Data export, consent logging, and wipe
│   │   ├── config.py              # Pydantic BaseSettings environment config
│   │   ├── database.py            # SQLAlchemy engine and session factory
│   │   ├── main.py                # FastAPI lifecycle, routes, and startup seeding
│   │   ├── models.py              # Relational models with cascade deletes
│   │   └── schemas.py             # Pydantic request/response schemas
│   ├── tests/
│   │   └── test_api.py            # Comprehensive 13-test integration suite
│   ├── Dockerfile                 # Production backend container
│   └── requirements.txt           # Frozen Python dependencies
├── docs/
│   ├── API.md                     # REST API reference and contracts
│   ├── ARCHITECTURE.md            # Detailed architecture specification
│   ├── MODEL_CARD.md              # Model performance, biases, and limitations
│   ├── PRD.md                     # Product requirements document
│   ├── SECURITY.md                # Threat model and hardening standards
│   └── USABILITY_TESTING.md       # Persona testing and user feedback
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx          # Login / Sign up modal with guest migration
│   │   │   ├── BreathingExercise.jsx  # Interactive 4-4-4 box breathing guide
│   │   │   ├── ConsentModal.jsx       # Camera consent and privacy disclosure
│   │   │   ├── HistoryDashboard.jsx   # Multi-metric charts & check-in timeline
│   │   │   ├── Navbar.jsx             # Status badge, nav items, user profile
│   │   │   ├── PrivacySettings.jsx    # Data export, storage toggles, account wipe
│   │   │   ├── Questionnaire.jsx      # 4 accessible sliders + reflection note
│   │   │   ├── ResultsView.jsx        # Decoupled feedback & wellness actions
│   │   │   └── WebcamCapture.jsx      # Transient in-memory camera snapshot
│   │   ├── services/
│   │   │   ├── api.js                 # REST client with JWT Bearer injection
│   │   │   └── suggestionEngine.js    # Rule-based non-clinical recommendations
│   │   ├── App.jsx                    # Root state coordinator
│   │   └── App.css                    # Unified design system & responsive layout
│   ├── Dockerfile                     # Multi-stage Nginx production container
│   └── nginx.conf                     # Reverse proxy and SPA routing
├── ml/
│   ├── face_preprocessor.py       # OpenCV Haar Cascade cropping & normalization
│   ├── model.py                   # 4-block deep CNN architecture
│   ├── train.py                   # Balanced training loop with early stopping
│   ├── infer.py                   # ONNX Runtime inference service
│   ├── evaluate.py                # Macro-F1 and confusion matrix evaluation
│   └── test_inference.py          # Benchmark test (<100ms verified)
├── saved_models/
│   ├── cnn-v1.0.onnx              # Optimized ONNX model weights
│   ├── cnn-v1.0.pth               # PyTorch training checkpoint
│   └── metadata.json              # Model version and class mapping
├── docker-compose.yml             # Single-command Full-Stack deployment
└── pytest.ini                     # PyTest configuration
```

---

## 6. Quick Start

### Option A: Run via Docker Compose (Recommended)

Start the entire application (Backend + Frontend + ML Model + Nginx) with a single command:

```bash
docker compose up --build
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Local Development Setup

#### 1. Backend & ML Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate Python 3.11 virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Visit [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## 7. API Specification

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health, database connection, and model loaded status |
| `POST` | `/api/auth/register` | Public | Student account registration with Bcrypt hashing |
| `POST` | `/api/auth/login` | Public | Credential authentication returning stateless JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current student profile and preferences |
| `POST` | `/api/auth/upgrade-guest` | Authenticated | Associates anonymous session check-ins with new account |
| `DELETE`| `/api/users/me` | Authenticated | Permanently purges user account and cascades all data |
| `POST` | `/api/expressions/predict` | Public / Rate-Limited | In-memory emotion prediction on uploaded webcam frame |
| `GET` | `/api/checkins/history` | Optional Auth | Retrieves check-in history (isolated per user if logged in) |
| `POST` | `/api/checkins` | Optional Auth | Saves a new check-in record and returns suggestions |
| `DELETE`| `/api/checkins/{id}` | Optional Auth | Deletes a check-in (enforces user ownership verification) |
| `GET` | `/api/dashboard/summary`| Optional Auth | Aggregates 7-day average stress and metric trends |
| `POST` | `/api/activities` | Optional Auth | Logs completion of breathing or wellness exercises |
| `GET` | `/api/privacy/export` | Optional Auth | Exports full student records in portable JSON format |
| `DELETE`| `/api/privacy/wipe-all` | Optional Auth | Wipes local and database session data |

---

## 8. Machine Learning Pipeline

```
Raw Webcam Frame
       │
       ▼
OpenCV Haar Cascade Face Detector ──[No Face Detected]──> Fallback: Center Crop
       │
       ▼ (Face Bounding Box)
Crop & Resize to 48x48 Grayscale
       │
       ▼
Pixel Intensity Normalization: x / 255.0  --> Range [0.0, 1.0]
       │
       ▼
Tensor Reshape: [1, 1, 48, 48]
       │
       ▼
ONNX Runtime CPU Inference Engine (4-Block CNN)
       │
       ▼
Softmax Probabilities over 7 FER-2013 Classes:
  [angry, disgust, fear, happy, neutral, sad, surprise]
       │
       ▼
Confidence Threshold Rule:
  If max(probability) < 0.45 ──> Top Expression: "uncertain"
  Else                       ──> Top Expression: max_class
```

### Model Performance & Latency Benchmark
- **Inference Latency**: ~**99 ms** on standard CPU (Target: $p95 < 500\text{ ms}$).
- **Artifact Size**: `cnn-v1.0.onnx` is only **~4.8 MB**, enabling instant startup and minimal RAM footprint.
- **Model Card**: See [`docs/MODEL_CARD.md`](file:///c:/Users/Aditi%20gupta/Desktop/Facial%20Expression%20detector/docs/MODEL_CARD.md) for full training details, class weights, and bias mitigation documentation.

---

## 9. Security & Privacy Architecture

- **Zero-Storage Webcam Policy**: Captured frames are held only in RAM memory streams (`io.BytesIO`). No camera snapshots or video streams are written to disk.
- **Defensive HTTP Headers**:
  - `X-Frame-Options: DENY` (Anti-Clickjacking)
  - `X-Content-Type-Options: nosniff` (Anti-MIME Sniffing)
  - `Permissions-Policy: camera=(self)` (Isolates camera access)
  - `Strict-Transport-Security: max-age=31536000` (Enforced HTTPS)
  - `Content-Security-Policy: default-src 'self' ...`
- **Sliding-Window Rate Limiting**:
  - Auth endpoints (`/api/auth/*`): max 30 requests/min per IP.
  - Emotion inference (`/api/expressions/predict`): max 45 requests/min per IP.
- **Row-Level Data Isolation**: Users can only access, modify, or delete their own check-ins. Unauthorized deletions return `403 Forbidden`.
- **Right to Erasure**: Complete account and data deletion in 1 click (`DELETE /api/users/me`).

---

## 10. Software Engineering & ML Interview Talking Points

### 1. Why did you choose ONNX Runtime instead of PyTorch in production?
> *"While PyTorch is great for research and training, running a full PyTorch runtime in a web container requires heavy CUDA/C++ dependencies and uses upwards of 1.5GB of RAM. By exporting our trained PyTorch model to ONNX, we reduced the inference engine footprint to a lightweight CPU runtime under 40MB with consistent **sub-100ms latency** on standard hardware without needing a GPU."*

### 2. Why did you decouple facial expression detection from stress score calculation?
> *"From a Responsible AI perspective, facial expressions do not have a 1-to-1 scientific correlation with internal stress. A student might look neutral or smile while experiencing high academic anxiety, or look serious simply while focusing. Conflating the two would create an unreliable, pseudo-scientific diagnosis. By keeping self-reported stress as the ground truth and treating expression classification as an observational reflection, we preserve user agency and avoid algorithmic harm."*

### 3. How did you handle the class imbalance in the FER-2013 dataset?
> *"In FER-2013, expressions like 'disgust' have far fewer training samples compared to 'happy' or 'neutral'. In `ml/train.py`, we implemented inverse-frequency class weighting in the cross-entropy loss function. We also introduced an 'uncertain' classification rule for any prediction with confidence under 45%, preventing the model from hallucinating high-confidence predictions on ambiguous faces."*

### 4. How did you design the Guest Mode to Account migration?
> *"Forcing user registration creates drop-off, especially on mental health and wellness apps where users are hesitant to share personal information upfront. We designed the backend to support anonymous guest check-ins using nullable `user_id` fields. If a student later decides to register, the frontend passes their guest check-in IDs to `POST /api/auth/upgrade-guest`, migrating their history into their new account in an atomic transaction."*

---

## 11. Automated Verification Suite

Run all test suites locally:

```bash
# 1. Backend API, Auth, Isolation & Security Tests (13 tests)
python -m pytest backend/tests/test_api.py -v

# 2. Machine Learning Inference Benchmark
python ml/test_inference.py

# 3. Frontend Suggestion Engine Unit Tests
node frontend/src/services/suggestionEngine.test.js

# 4. Frontend Production Bundle Build
cd frontend && npm run build
```

---

## 12. Author & Credits

- **Author**: Aditi Gupta
- **Documentation**: See [`docs/PRD.md`](file:///c:/Users/Aditi%20gupta/Desktop/Facial%20Expression%20detector/docs/PRD.md) and [`docs/ARCHITECTURE.md`](file:///c:/Users/Aditi%20gupta/Desktop/Facial%20Expression%20detector/docs/ARCHITECTURE.md)
- **License**: MIT License
