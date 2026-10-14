# ConfirmMyCollege — Common Application Platform for Indian MBA/PGDM Admissions

ConfirmMyCollege is a prototype common application and discovery platform built for prospective Indian MBA and PGDM students. It enables students to explore accredited business schools, compare programmes side-by-side, practise entrance test questions, take timed mock tests, and apply to up to 5 business schools with ONE unified application form and ONE application fee.

---

## 🚀 Key Features

1. **B-School Directory & Multi-Filter Exploration (`/explore`)**:
   - Filter by cities, fees, entrance exams (CAT, XAT, SNAP, NMAT, CMAT), cutoffs, and campus hostels.
   - Dynamic URL query parameter persistence for shareable search states.
   - Live compare checkbox (max 5) with a floating comparison trigger.

2. **Side-by-Side College Comparison (`/compare`)**:
   - 5-slot college picker with searchable modal.
   - Best-value highlights in lime (lowest fees, highest packages).
   - Direct CTA to pre-fill Step 7 of the Common Application.

3. **10-Step Common Application Wizard (`/apply`)**:
   - **Step 1: Personal Information** — Age verification (20-35), Indian mobile phone validation (`/^[6-9]\d{9}$/`), Demo OTP verification, 6-digit postal pincode, photo & signature uploads.
   - **Step 2: Academics** — 10th, 12th, graduation percentages with built-in CGPA-to-percentage converter (CGPA × 9.5).
   - **Step 3: Exam Scores** — Multiple exam rows (CAT, XAT, SNAP, NMAT, CMAT, GMAT) with "Awaiting result / Not taken yet" toggle.
   - **Step 4: Work Experience** — "Fresher" toggle or multiple employer entries with automatic tenure calculation in months.
   - **Step 5: Statement of Purpose (SOP)** — 300 to 500 words counter with colour states (red under 300, green in range, amber over 500) and **AI SOP Reviewer (Gemini)**.
   - **Step 6: Document Upload Checklist** — Upload marksheets, ID proof, and scorecards with file metadata tracking.
   - **Step 7: Choose Up to 5 Colleges** — Rank preferences and choose distinct degree programmes with deadline warnings.
   - **Step 8: College-Specific Questions** — Dynamically rendered custom questionnaires with auto-fill tags.
   - **Step 9: Review & Completeness Check** — Read-only summary with step edit shortcuts.
   - **Step 10: Declaration & Mock Payment** — Razorpay-style mock checkout modal (UPI, Cards, Netbanking) with 2-second processing delay, celebration confetti, and printable HTML receipt (`CMC-2026-XXXXX`).

4. **Applicant Dashboard (`/dashboard`)**:
   - Overall application progress ring (% complete).
   - Closest deadline countdown.
   - Real-time admissions pipeline status per chosen college (Submitted → Under Review → Shortlisted).
   - Document checklist and demo notification feed.

5. **Question Corner (`/questions`, `/questions/practice`)**:
   - 60+ original entrance examination questions across Quant, VARC, DILR, GK, and Interview/WAT.
   - Instant step-by-step solutions.
   - **Gemini Tutor**: "Explain in simple words" and "Explain in Hindi (हिंदी)".
   - **Gemini Question Generator**: Creates original custom practice questions on demand.
   - **Timed Practice Mode**: Configurable question count and live timer with speed/accuracy analytics.

6. **CAT Mini Mock Test (`/mock-test`, `/mock-test/result`)**:
   - 20 questions, 3 sections (VARC 7, DILR 5, Quant 8) with a 40-minute timer.
   - Real CAT exam palette (Visited, Not Answered, Answered, Marked for Review).
   - Auto-submits at 00:00 with +3 / -1 scoring rule.
   - Diagnostic result scorecard with percentile estimator, section scores, and question solutions.

7. **Scholarships & Grants (`/scholarships`)**:
   - 8 realistic demo fellowships (up to ₹6 Lakh).
   - Interactive eligibility screener filtering by category, annual family income, and percentile.

8. **AI College Recommender Quiz (`/quiz`)**:
   - 6-step interactive questionnaire feeding student parameters to Gemini Flash to recommend the 5 best-fit colleges with custom rationales.

9. **AI Admissions Chatbot (Floating Widget)**:
   - Grounded admissions assistant capable of answering questions regarding deadlines, eligibility, common forms, and colleges.

10. **Compliance & Trust (DPDP Act 2023)**:
    - User rights to export data (`StorageService.exportUserData()`).
    - "Delete My Data" permanent erasure option.
    - Prominent disclaimers: "No guarantee of admission."

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4.
- **Routing**: `HashRouter` (ensures flawless navigation in iframe environments).
- **State Management & Persistence**: Zustand with `StorageService` abstraction (components never call `localStorage` directly).
- **Backend & AI Proxy**: Express server (`server.ts`) running with Vite middleware in dev and static serving in production.
- **Gemini API**: Connected via server-side `@google/genai` using model `gemini-3.8-flash`.

---

## 📋 What to Replace Before Going Live (Production Checklist)

1. **Storage Layer**:
   - Swap `src/services/storage.ts` implementation with Firebase Firestore or PostgreSQL.
2. **Payment Gateway**:
   - Replace the mock payment simulator in `src/pages/ApplyWizard.tsx` with real Razorpay or Cashfree SDK credentials.
3. **SMS OTP Gateway**:
   - Replace the demo 6-digit OTP verification with an SMS gateway (e.g., MSG91, Twilio).
4. **Official College Data**:
   - Replace demo institution records in `src/data/colleges.ts` with officially verified college agreements, seats, and fees.
5. **Legal & Compliance**:
   - Have a certified corporate lawyer review `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`, and `src/pages/Refund.tsx`.
