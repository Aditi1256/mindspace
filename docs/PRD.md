# Product Requirements Document (PRD)
## Facial-Expression-Based Stress Check-In Tool for Students

- **Document Owner**: Aditi
- **Version**: 1.0 (Draft)
- **Date**: 22 October 2026
- **Project Type**: Full-stack AI/ML portfolio project (Resume / SDE focus)
- **Status**: Phase 0 & Phase 1 Active
- **Tech Stack**: React + Vite, FastAPI, TensorFlow/Keras, OpenCV, SQLite/PostgreSQL, Recharts

---

### 1. Important Positioning Statement (Responsible AI Principle)
> **Crucial Disclaimer**: This product is a prototype for student self-reflection. It is **not** a validated stress-detection system or medical/mental-health diagnostic tool. Visible facial expressions cannot reliably determine whether a person is stressed. Therefore, the application keeps the machine learning model's expression output and the student's self-reported stress **strictly separate**.

---

### 2. Product Goals & Non-Goals

#### 2.1 Product Goals
- **G1**: Allow a student to complete a self-reflection stress check-in in under 2 minutes.
- **G2**: Provide optional, consent-based webcam expression analysis with clear, plain-language limitations.
- **G3**: Provide practical, non-clinical, actionable wellness suggestions driven primarily by self-reported needs.
- **G4**: Allow students to review check-in history and track weekly self-reported stress trends.
- **G5**: Give students total data control: explicit consent, opt-out, deletion of individual check-ins, and one-click account data wiping.
- **G6**: Deliver a robust, tested, and cleanly documented portfolio project suitable for SDE/AI interviews.

#### 2.2 Non-Goals (Explicitly Out of Scope)
- ❌ No medical, psychiatric, or psychological diagnosis of any kind.
- ❌ No claims that a facial expression equals a stress level or emotional state.
- ❌ No continuous video surveillance or uploading continuous webcam streams.
- ❌ No permanent storage of raw webcam images (transient memory processing only).
- ❌ No sharing of individual student data with institutions, teachers, or third parties.
- ❌ Never replacing professional mental health counseling or emergency crisis services.

---

### 3. Core User Stories
- **US-01 (Guest Mode)**: As a student, I want to try the app as a guest without signing up so I can immediately check in without friction.
- **US-02 (User Accounts)**: As a student, I want to create an account and log in so my check-in history is saved across devices.
- **US-03 (Questionnaire)**: As a student, I want to answer a short 4-question stress questionnaire so I can reflect on my workload, sleep, and pressure.
- **US-04 (Camera Consent & Privacy)**: As a student, I want complete control over my webcam with explicit consent so my privacy is respected.
- **US-05 (Expression Feedback)**: As a student, I want to see the detected facial expression alongside confidence and limitations so I understand it is not a diagnosis.
- **US-06 (Actionable Suggestions)**: As a student, I want small, non-clinical suggestions based on my answers so I know what immediate step to take.
- **US-07 (Trends & History)**: As a student, I want to view my past check-ins and weekly charts to notice exam stress patterns.
- **US-08 (Breathing Tool)**: As a student, I want an interactive guided breathing exercise to calm down immediately.
- **US-09 (Supportive Escalation)**: As a student reporting high stress ($\ge 8$), I want to see campus counseling and helpline contacts without alarmist language.
- **US-10 (Data Control)**: As a student, I want to delete any check-in or wipe all my data anytime.

---

### 4. Specification Summary
- **Questionnaire**: Current stress (0–10), Workload manageability (1–5), Sleep quality (1–5), Academic pressure (1–5), Optional reflection note (max 500 chars).
- **Face Model**: FER-2013 dataset (7 classes: `angry`, `disgust`, `fear`, `happy`, `neutral`, `sad`, `surprise`).
- **Processing**: Single captured frame, face cropped via Haar Cascade, converted to 48x48 grayscale, normalized to [0, 1]. In-memory only.
- **Database Schema**: `users`, `checkins`, `expression_results`, `wellness_activities`, `consent_logs`.
