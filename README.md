# MedLens — Clinical Information Intelligence Platform

> **"Understand your medical reports. Keep your health information organized."**

MedLens is a secure, role-based clinical web application designed to bridge the communication gap between patients, diagnostic laboratories, healthcare providers, and health administrators. It combines client-assisted OCR extraction, strict reference-range safety checks, non-diagnostic conflict intelligence, and end-to-end test request workflows.

---

## 🌟 Highlights & Architecture

### 1. Four Distinct Role Workspaces
- **Patient Workspace (*Rahul Kumar*)**:
  - Plain-language health record organization and visual document timeline.
  - One-click primary action: **Upload Report** or **Request Diagnostic Test**.
  - Dual-indicator visual status badges for unverified vs verified results.
- **Lead Clinician Workspace (*Dr. Sarah Chen, MD*)**:
  - Structured clinical verification queue with page/line provenance citations.
  - Allergy-to-medication conflict warnings with non-diagnostic professional review flags.
  - Multi-report delta comparisons (pure mathematical change calculations).
- **Lab Technician Workspace (*Alex Rivera, MLS*)**:
  - Diagnostic test request queue with lifecycle state management (`PENDING` ➔ `ACCEPTED` ➔ `SCHEDULED` ➔ `SAMPLE_COLLECTED` ➔ `COMPLETED`).
  - Sample ID tracking and direct report upload linking.
- **System Administrator Workspace (*System Admin*)**:
  - Real-time system health metrics, API response latency, and active session telemetry.
  - Immutable clinical security audit log.

### 2. Clinical Safety Safeguards
- **Zero Guessed Reference Ranges**: If a laboratory report omits a normal reference range, MedLens strictly assigns `NOT_DETERMINED` and clearly informs the user. It *never* invents clinical thresholds.
- **Non-Diagnostic Language**: MedLens flags potential inconsistencies as requiring *professional clinical review*. It strictly avoids prescribing or diagnostic declarations.
- **Source Document Provenance**: Every extracted field links directly to its source document, page number, and original snippet text.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **Python** 3.10+

### Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend runs at: `http://localhost:8000`  
Interactive API Docs: `http://localhost:8000/docs`

### Frontend Setup (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 Automated Testing (100% Pass Rate)

### Backend Automated Test Suite
Includes tests for role authorization, filename sanitization/path-traversal protection, upload limits, reference range safety, and conflict detection:
```bash
python -m unittest discover -s backend/tests -p "test_*.py" -v
```
*Result: 15 passed, 0 failed in 0.001s*

### Frontend Automated Test Suite
Built using Node.js's native test runner covering reference ranges, allergy conflicts, and role configurations:
```bash
cd frontend
npm test
```
*Result: 16 passed, 0 failed in 134ms*

### Code Quality & Static Analysis
```bash
cd frontend
npm run lint    # 0 errors
npm run build   # Production bundle built in < 1 second
```

---

## 🛡️ Security & Privacy Hardening
- **Path Traversal Protection**: Uploaded filenames are strictly sanitized against directory traversal characters (`..`, `/`, `\`).
- **File Validation**: Strict MIME-type inspection (`application/pdf`, `image/png`, `image/jpeg`) and 10MB payload size ceiling.
- **Role-Based Access Control**: Sensitive clinical mutations enforce role validation dependencies.
- **Audit Trails**: All verifications, file uploads, and test state transitions write immutable log entries.

---

## 🌐 Free Plan Deployment on Render (Single Unified Service)

MedLens can be deployed as **one single service** on Render that hosts both the frontend UI and the FastAPI backend together at one URL:

### Method 1: 1-Click Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com) ➔ **Blueprints** ➔ **New Blueprint Instance**.
2. Connect this repository: `https://github.com/SahithiEshwaroju/medlabs-promptwars.git`.
3. Render reads `render.yaml` and deploys a single unified service: `medlens`.
4. Click **Apply**.

### Method 2: Manual Web Service Setup on Render
1. Click **New +** ➔ **Web Service**.
2. Connect repository: `https://github.com/SahithiEshwaroju/medlabs-promptwars`.
3. Configure:
   - **Name**: `medlens`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Click **Create Web Service**. Both frontend and backend will be live on your `.onrender.com` URL!

---

## ⚖️ Medical Disclaimer
MedLens is an informational and document-management platform. MedLens organizes and summarizes clinical documentation; it does not provide diagnosis, prognosis, treatment recommendations, or medical advice. Always consult a qualified healthcare provider for any health concerns.
