# Security Architecture & Hardening Guide
**Student Stress Check-In Tool (MindSpace)**  
*Author: Aditi Gupta*  
*Last Updated: October 2026*  
*Document Version: 1.0 (Phase 5 Hardening)*

---

## 1. Executive Summary & Security Objectives

The Student Stress Check-In Tool is designed specifically for academic self-reflection and well-being tracking. Because wellness data, emotional observations, and webcam access are sensitive, the system adopts a **Privacy-First, Zero-Surveillance Architecture**:

1. **Self-Report Sovereignty**: Self-reported scores are the sole ground truth. Emotion classification is secondary and informational.
2. **Zero Image Retention**: Raw webcam images never touch permanent storage; frames are processed in volatile memory (RAM) and immediately discarded.
3. **Data Isolation**: Guest mode is available without forced registration. When accounts are created, per-user data isolation is strictly enforced.
4. **Defense in Depth**: Robust password hashing, stateless JWT authorization, sliding-window rate limiting, and HTTP security headers protect against common web vulnerabilities.

---

## 2. Threat Model & Mitigation Matrix

| Threat Category | Potential Attack Vector | Applied Safeguard / Mitigation |
| :--- | :--- | :--- |
| **Credential Theft** | Database breach exposing user passwords | Passwords hashed using **Bcrypt** with random salt (`bcrypt.gensalt()`). Plaintext passwords are never logged or stored. |
| **Brute-Force Attack** | Automated credential spraying on `/api/auth/login` | **Rate Limiting Middleware**: Limits authentication attempts to 30 requests per minute per IP address. |
| **Session Hijacking** | Forged or intercepted session tokens | **Stateless JWT (JSON Web Tokens)**: Signed with HS256 and HMAC secret. Tokens expire after 7 days; secret keys are configured via environment variables. |
| **Data Snooping / Cross-User Access** | User B attempting to read or delete User A's check-ins | **Row-Level Ownership Validation**: All check-in modifications verify `checkin.user_id == current_user.id` and reject unauthorized attempts with `403 Forbidden`. |
| **Clickjacking** | Embedding web UI into malicious `<iframe>` | `X-Frame-Options: DENY` header injected on all HTTP responses. |
| **MIME Sniffing** | Browser executing injected scripts disguised as images | `X-Content-Type-Options: nosniff` header enforced across all endpoints. |
| **Camera Exploitation** | Third-party iframes attempting unauthorized webcam access | `Permissions-Policy: camera=(self)` header restricts camera hardware access strictly to the top-level origin. |
| **Denial of Service (Inference)** | Spamming heavy CNN inference requests | Rate-limited to max 45 inference calls per minute per IP. |
| **SQL Injection** | Malicious payloads in notes or filter queries | **SQLAlchemy ORM**: 100% parameterized queries. No raw string interpolation. |
| **Input Tampering** | Negative numbers or out-of-range ratings | **Pydantic v2 Validation**: Enforces strict bounds (`stress_level` $\in [0, 10]$, `workload_score` $\in [1, 5]$). |

---

## 3. Authentication & Credential Architecture

### 3.1 Password Security
- Algorithm: **Bcrypt** (`bcrypt.hashpw` / `bcrypt.checkpw`)
- Salt Generation: Cryptographically secure 12-round salt.
- Storage: `password_hash` column in SQLite / PostgreSQL `users` table.

```python
# Implementation Reference: backend/app/services/auth.py
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
```

### 3.2 Stateless JWT Token Architecture
- Algorithm: `HS256`
- Claims:
  - `sub`: User ID (`UUID4`)
  - `email`: Student institutional email
  - `exp`: Expiration timestamp
- Transport: `Authorization: Bearer <token>` in HTTP headers.
- Guest Support: Endpoints utilize `get_optional_current_user` to provide a seamless transition between anonymous guest sessions and authenticated accounts.

---

## 4. Privacy & Webcam Zero-Retention Architecture

```
[Webcam Hardware]
       │
       ▼ (User explicit consent click)
[Browser Canvas (RAM)]
       │
       ▼ (Base64 JPEG payload over HTTPS/Localhost)
[FastAPI In-Memory Stream (RAM)]
       │
       ├──> OpenCV Haar Face Detection (48x48 Grayscale)
       ├──> ONNX Inference Engine (Emotion Probabilities)
       └──> Discard raw image buffer from RAM (Garbage Collected)
       │
       ▼ (Only numeric percentages returned to client)
[Check-in Record (Optional Emotion Label)]
```

- **No Disk Logging**: Raw webcam buffers are processed through `io.BytesIO` and `cv2.imdecode`. Files are never written to disk (`os.remove` not even needed because no temporary files are touched).
- **Consent Audit**: User consent timestamps and version numbers are recorded in the `privacy_consent_logs` table (PRD FR-PRIV-1).
- **Selective Storage**: Users can toggle off `save_expression_results` in privacy settings so check-ins store only numeric self-ratings.

---

## 5. Defensive HTTP Security Headers

The `SecurityHardeningMiddleware` automatically enriches every incoming response with protective HTTP headers:

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self)
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;
```

---

## 6. Data Ownership & Right to Erasure

1. **Guest Data Migration (`POST /api/auth/upgrade-guest`)**:
   - When a guest student creates an account, previously recorded session check-ins are linked to the newly created `user_id`.
2. **Data Export (`GET /api/privacy/export`)**:
   - Students can download their entire wellness data in portable JSON format at any time.
3. **Data Wipe (`DELETE /api/privacy/wipe-all`)**:
   - Erases anonymous session logs.
4. **Permanent Account Deletion (`DELETE /api/users/me`)**:
   - Cascades and permanently deletes the student user record and all foreign-key associated check-ins, expression records, and activity logs (`ON DELETE CASCADE`).

---

## 7. Compliance Checklist

| Standard / Guideline | Requirement | Project Status |
| :--- | :--- | :--- |
| **FERPA / Academic Privacy** | Student records protected from public access | ✅ Fully isolated per-user; no student data shared. |
| **GDPR / DPDP Right to Erasure** | User ability to wipe all personal data | ✅ `DELETE /api/users/me` cascading purge implemented. |
| **OWASP Top 10** | Protection against Injection, Broken Auth, XSS | ✅ Bcrypt, JWT validation, ORM parameterization, CSP headers. |
| **Responsible AI Guidelines** | Explicit disclaimers, no clinical diagnostic claims | ✅ Disclaimers displayed on every observation card. |
