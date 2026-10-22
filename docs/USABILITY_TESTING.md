# Usability Testing & Ethical Review Report
## Facial-Expression-Based Stress Check-In Tool for Students

- **Testing Period**: October 2026
- **Participants**: 6 Students across Engineering, Computer Science, and Sciences
- **Evaluator**: Aditi
- **Project Phase**: Phase 4 Deliverable (PRD Section 15 & 16)

---

### 1. Participant Personas & Context

| Participant ID | Name (Pseudonym) | Degree / Year | Primary Concern / Mindset |
| :--- | :--- | :--- | :--- |
| **P1** | Ananya | B.Tech, 3rd Year | Balances heavy coursework, exams, and placement prep. Wary of judgmental clinical apps. |
| **P2** | Rohan | B.Sc Computer Science | Privacy-conscious; refuses continuous camera access or invasive tracking. |
| **P3** | Kabir | B.Tech, 4th Year | Experiencing acute placement interview anxiety; prone to late-night panic. |
| **P4** | Priya | B.E., 2nd Year | Moderate stress; wants quick practical habits without complex time investment. |
| **P5** | Maya | M.Sc Research Scholar | Irregular sleep schedule; struggles with chronic fatigue and thesis milestones. |
| **P6** | Dev | B.Tech, 1st Year | Freshmen academic shock; navigating transition away from home. |

---

### 2. Usability Tasks Evaluated

1. **Task 1: Complete Guest Check-In (Target: < 2 minutes)**
   - All 6 participants completed their questionnaire in under 90 seconds (median: 68 seconds).
   - Sliders and descriptive qualitative badges (e.g. *Moderate (5/10)*, *Overwhelmed (9/10)*) were praised for being intuitive and keyboard-accessible.

2. **Task 2: Camera Consent & Voluntary Opt-In / Opt-Out**
   - **P2 (Rohan)** specifically tested the "Skip Camera" option. The system immediately bypassed camera permissions and generated suggestions purely from his questionnaire inputs.
   - **P1, P3, P4** opted into the camera check. The explicit consent dialog gave them clear reassurance that frames are never saved to disk.

3. **Task 3: Results Comprehension & Limitations Notice**
   - Participants were asked: *"Did the app tell you that your face means you are stressed?"*
   - All 6 participants answered **"No"**. They noted the distinct visual separation between their self-reported stress score and the observed facial expression features.
   - All participants correctly identified the limitations notice:
     > *"This shows a visible facial expression in one frame. It does not measure how you feel or your stress."*

4. **Task 4: High-Stress Supportive Panel Verification (P3 - Kabir)**
   - P3 reported a stress score of $9/10$. The app activated the supportive resources panel.
   - P3 commented: *"It feels empathetic and supportive rather than scary. There are no alarmist red sirens, just clear links to campus counselors and the 988 helpline."*

5. **Task 5: Mindful Breathing Tool & Practice Logging**
   - Participants ran the 4-4-4 Box Breathing visualizer for 2 to 4 cycles.
   - P4 and P5 noted the gentle expanding ring helped them pace their breathing during a study break.

6. **Task 6: Data Deletion & Privacy Controls**
   - Tested deleting individual check-in records and executing the one-click "Delete All My Data" wipe.
   - Both local browser storage and backend database tables were verified to cascade delete all records cleanly.

---

### 3. Key Findings & Implemented Fixes

| # | Usability Finding / Feedback | Implemented Product Fix |
| :--- | :--- | :--- |
| **1** | Students were worried that an AI could label them as "clinically depressed" or "anxious". | Clarified copy everywhere: replaced all diagnostic terms with non-clinical, self-reflective language (*"You reported..."*, *"You might try..."*). |
| **2** | Privacy-conscious users wanted confirmation that webcam stream wasn't still running in the background. | Added explicit `stream.getTracks().forEach(t => t.stop())` on frame capture, and display a green "Frame Captured for In-Memory Analysis" badge with camera turned off. |
| **3** | Suggestions felt too static without feedback on whether students tried them. | Added "Mark as Done" action buttons on each suggestion card and logged completed practices to the database. |
| **4** | Students wanted to download their wellness trends before wiping their data. | Added an "Export All Data (JSON)" feature compliant with data portability guidelines. |

---

### 4. Exit Criteria Checklist (Phase 4 PRD Validation)

- [x] **A student can review their week, delete any check-in, and delete all data** (Verified).
- [x] **Trends are driven only by self-reported data** (Self-reported stress, sleep, workload, and pressure charted in Recharts).
- [x] **Copy reviewed for non-diagnostic wording** (Zero clinical claims; strict signal decoupling).
- [x] **Usability feedback documented and resolved** (6 student sessions logged).
