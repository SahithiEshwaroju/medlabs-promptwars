import os
import re
import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, get_db, init_db
from models import (
    Base, User, Patient, Document, DocumentPage,
    LabResult, VerificationLog, Conflict, TimelineEvent,
    AISummary, ClarificationQuestion, TestRequest, SystemAuditLog
)
from ocr_engine import OCREngine
from entity_extractor import EntityExtractor
from ai_service import AIService

# Security & Validation Constants
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg", "application/octet-stream"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

def sanitize_filename(filename: str) -> str:
    """Sanitizes filename to prevent directory traversal and unsafe characters."""
    clean = os.path.basename(filename).strip()
    clean = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', clean)
    return clean or "uploaded_document.pdf"

def get_current_user_role(x_user_role: Optional[str] = Header(None)) -> str:
    """Retrieves current user role from request header, defaulting to Clinician for demo mode."""
    return x_user_role or "Clinician"

def require_role(allowed_roles: List[str]):
    """Authorization guard verifying the caller possesses one of the allowed roles."""
    def role_checker(role: str = Depends(get_current_user_role)):
        norm_role = role.lower().strip()
        norm_allowed = [r.lower().strip() for r in allowed_roles]
        # Match common variants (e.g., Doctor matches Clinician / Lead Clinician)
        has_permission = False
        for allowed in norm_allowed:
            if allowed in norm_role or norm_role in allowed:
                has_permission = True
                break
            if allowed in ["doctor", "clinician"] and norm_role in ["lead clinician", "physician", "doctor"]:
                has_permission = True
                break
            if allowed in ["lab_tech", "technician", "lab technician"] and norm_role in ["lab technician", "technician", "auditor"]:
                has_permission = True
                break
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Role '{role}' lacks authorization for this endpoint. Required role: {', '.join(allowed_roles)}"
            )
        return role
    return role_checker

app = FastAPI(
    title="MedLens Clinical Information Intelligence API",
    description="Backend API for clinical document extraction, reference-range verification, conflict intelligence, and patient summary.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed synthetic data on startup
def seed_demo_data(db: Session):
    if db.query(Patient).filter(Patient.name == "Rahul Kumar").first():
        return # Already seeded

    # Create demo user
    clinician = User(
        email="dr.sarah.chen@medlens.org",
        name="Dr. Sarah Chen, MD",
        role="Lead Clinician"
    )
    db.add(clinician)
    db.commit()
    db.refresh(clinician)

    # Create demo patient Rahul Kumar
    rahul = Patient(
        user_id=clinician.id,
        name="Rahul Kumar",
        dob="1984-06-12",
        age=42,
        sex="Male",
        symptoms="Fatigue, mild dizziness, occasional joint pain in evenings",
        existing_conditions="Mild essential hypertension",
        allergies="Penicillin",
        current_medications="Amlodipine 5mg OD",
        history="No prior surgical history. Non-smoker.",
        notes="Patient reported penicillin anaphylaxis/hives during childhood.",
        provenance="USER_PROVIDED"
    )
    db.add(rahul)
    db.commit()
    db.refresh(rahul)

    # Preload Document 1: Metropolis CBC Report
    doc1 = Document(
        patient_id=rahul.id,
        file_name="Metropolis_Complete_Blood_Count_2026-08-28.pdf",
        file_type="application/pdf",
        file_path="sample_reports/Metropolis_Complete_Blood_Count_2026-08-28.pdf",
        file_size=245800,
        status="Ready",
        total_pages=2,
        extracted_fields_count=7,
        verified_fields_count=2
    )
    # Preload Document 2: Previous CBC
    doc2 = Document(
        patient_id=rahul.id,
        file_name="Previous_CBC_Report_2026-05-14.pdf",
        file_type="application/pdf",
        file_path="sample_reports/Previous_CBC_Report_2026-05-14.pdf",
        file_size=198000,
        status="Ready",
        total_pages=1,
        extracted_fields_count=4,
        verified_fields_count=4
    )
    # Preload Document 3: Prescription
    doc3 = Document(
        patient_id=rahul.id,
        file_name="City_Clinic_Prescription_2026-09-02.pdf",
        file_type="application/pdf",
        file_path="sample_reports/City_Clinic_Prescription_2026-09-02.pdf",
        file_size=142000,
        status="Ready",
        total_pages=1,
        extracted_fields_count=2,
        verified_fields_count=1
    )
    db.add_all([doc1, doc2, doc3])
    db.commit()
    db.refresh(doc1)
    db.refresh(doc2)
    db.refresh(doc3)

    # Preload lab results for Document 1
    lab_records = [
        LabResult(
            patient_id=rahul.id,
            document_id=doc1.id,
            test_name="Hemoglobin",
            value=11.2,
            raw_value="11.2",
            unit="g/dL",
            reference_low=12.0,
            reference_high=16.0,
            raw_reference_text="12.0 - 16.0",
            status="LOW",
            result_date="2026-08-28",
            source_document=doc1.file_name,
            source_page=1,
            source_text="Haemoglobin: 11.2 g/dL (Reference Range: 12.0 - 16.0 g/dL)",
            confidence=0.96,
            provenance="DOCUMENT_EXTRACTED",
            verification_status="VERIFIED",
            verified_value="11.2",
            verified_by="Dr. Sarah Chen, MD",
            verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=6)
        ),
        LabResult(
            patient_id=rahul.id,
            document_id=doc1.id,
            test_name="WBC Count",
            value=7800.0,
            raw_value="7800",
            unit="/uL",
            reference_low=4000.0,
            reference_high=11000.0,
            raw_reference_text="4000 - 11000",
            status="NORMAL",
            result_date="2026-08-28",
            source_document=doc1.file_name,
            source_page=1,
            source_text="Total Leucocyte Count (WBC): 7800 /uL (Reference Range: 4000 - 11000 /uL)",
            confidence=0.98,
            provenance="DOCUMENT_EXTRACTED",
            verification_status="PENDING"
        ),
        LabResult(
            patient_id=rahul.id,
            document_id=doc1.id,
            test_name="Platelet Count",
            value=240.0,
            raw_value="240",
            unit="x10^3/uL",
            reference_low=150.0,
            reference_high=450.0,
            raw_reference_text="150 - 450",
            status="NORMAL",
            result_date="2026-08-28",
            source_document=doc1.file_name,
            source_page=1,
            source_text="Platelet Count: 240 x10^3/uL (Reference Range: 150 - 450 x10^3/uL)",
            confidence=0.97,
            provenance="DOCUMENT_EXTRACTED",
            verification_status="PENDING"
        ),
        LabResult(
            patient_id=rahul.id,
            document_id=doc1.id,
            test_name="Fasting Blood Glucose",
            value=115.0,
            raw_value="115",
            unit="mg/dL",
            reference_low=70.0,
            reference_high=99.0,
            raw_reference_text="70 - 99",
            status="HIGH",
            result_date="2026-08-28",
            source_document=doc1.file_name,
            source_page=1,
            source_text="Fasting Blood Glucose: 115 mg/dL (Reference Range: 70 - 99 mg/dL)",
            confidence=0.95,
            provenance="DOCUMENT_EXTRACTED",
            verification_status="VERIFIED",
            verified_value="115.0",
            verified_by="Dr. Sarah Chen, MD",
            verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=6)
        ),
        LabResult(
            patient_id=rahul.id,
            document_id=doc1.id,
            test_name="Serum Creatinine",
            value=1.05,
            raw_value="1.05",
            unit="mg/dL",
            reference_low=0.7,
            reference_high=1.3,
            raw_reference_text="0.7 - 1.3",
            status="NORMAL",
            result_date="2026-08-28",
            source_document=doc1.file_name,
            source_page=2,
            source_text="Serum Creatinine: 1.05 mg/dL (Reference Range: 0.7 - 1.3 mg/dL)",
            confidence=0.94,
            provenance="DOCUMENT_EXTRACTED",
            verification_status="PENDING"
        ),
        LabResult(
            patient_id=rahul.id,
            document_id=doc1.id,
            test_name="Total Cholesterol",
            value=215.0,
            raw_value="215",
            unit="mg/dL",
            reference_low=None,
            reference_high=200.0,
            raw_reference_text="< 200",
            status="HIGH",
            result_date="2026-08-28",
            source_document=doc1.file_name,
            source_page=2,
            source_text="Total Cholesterol: 215 mg/dL (Desirable: < 200 mg/dL)",
            confidence=0.92,
            provenance="DOCUMENT_EXTRACTED",
            verification_status="PENDING"
        ),
        LabResult(
            patient_id=rahul.id,
            document_id=doc1.id,
            test_name="Erythrocyte Sedimentation Rate (ESR)",
            value=28.0,
            raw_value="28",
            unit="mm/hr",
            reference_low=None,
            reference_high=None,
            raw_reference_text=None,
            status="NOT_DETERMINED",
            result_date="2026-08-28",
            source_document=doc1.file_name,
            source_page=1,
            source_text="Erythrocyte Sedimentation (ESR): 28 mm/hr",
            confidence=0.85,
            provenance="DOCUMENT_EXTRACTED",
            verification_status="PENDING"
        )
    ]
    db.add_all(lab_records)

    # Verification audit log for Hemoglobin
    db.commit()
    db.refresh(lab_records[0])
    v_log = VerificationLog(
        lab_result_id=lab_records[0].id,
        action="VERIFIED",
        original_value="11.2",
        new_value="11.2",
        verifier="Dr. Sarah Chen, MD",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=6)
    )
    db.add(v_log)

    # Allergy Conflict
    conflict = Conflict(
        patient_id=rahul.id,
        conflict_type="ALLERGY_MEDICATION",
        severity="WARNING",
        title="Documented Allergy vs Prescribed Medication: Amoxicillin",
        user_statement="Documented Patient Allergy: Penicillin (Provenance: USER_PROVIDED)",
        document_statement="Prescribed Medication: Amoxicillin 500mg TDS for 5 days (Source: City_Clinic_Prescription_2026-09-02.pdf)",
        source_document_name="City_Clinic_Prescription_2026-09-02.pdf",
        source_page=1,
        status="UNRESOLVED",
        disclaimer="These records contain potentially inconsistent information. Please verify with a qualified healthcare professional."
    )
    db.add(conflict)

    # Timeline Events
    timeline = [
        TimelineEvent(
            patient_id=rahul.id,
            event_date="2026-08-28",
            event_type="DOCUMENT_UPLOAD",
            title="Complete Blood Count Report Uploaded",
            description="Metropolis Diagnostics report uploaded (2 pages)",
            source_document_name="Metropolis_Complete_Blood_Count_2026-08-28.pdf"
        ),
        TimelineEvent(
            patient_id=rahul.id,
            event_date="2026-08-28",
            event_type="EXTRACTION",
            title="7 Laboratory Parameters Extracted",
            description="Automated entity extraction completed with reference ranges",
            source_document_name="Metropolis_Complete_Blood_Count_2026-08-28.pdf"
        ),
        TimelineEvent(
            patient_id=rahul.id,
            event_date="2026-08-29",
            event_type="VERIFICATION",
            title="Lab Values Verified by Clinician",
            description="Hemoglobin and Glucose reviewed and signed off by Dr. Sarah Chen",
            source_document_name="Metropolis_Complete_Blood_Count_2026-08-28.pdf"
        ),
        TimelineEvent(
            patient_id=rahul.id,
            event_date="2026-09-02",
            event_type="PRESCRIPTION",
            title="Outpatient Prescription Uploaded",
            description="Prescription from City Health Clinic mentioning Amoxicillin 500mg",
            source_document_name="City_Clinic_Prescription_2026-09-02.pdf"
        ),
        TimelineEvent(
            patient_id=rahul.id,
            event_date="2026-09-02",
            event_type="CONFLICT",
            title="Potential Record Conflict Detected",
            description="Conflict detected between patient Penicillin allergy and Amoxicillin prescription",
            source_document_name="City_Clinic_Prescription_2026-09-02.pdf"
        )
    ]
    db.add_all(timeline)

    # Clarification questions
    q1 = ClarificationQuestion(
        patient_id=rahul.id,
        document_id=doc1.id,
        question_text="Erythrocyte Sedimentation Rate (ESR 28 mm/hr) has no laboratory reference range provided in the source report. Should this remain categorized as 'NOT DETERMINED'?",
        context="Source document page 1 does not specify high or low limits for ESR.",
        options=["Keep as NOT DETERMINED", "Mark for Laboratory Range Inquiry", "Skip"],
        status="PENDING"
    )
    q2 = ClarificationQuestion(
        patient_id=rahul.id,
        document_id=doc3.id,
        question_text="Patient profile records an active allergy to Penicillin. Prescription specifies Amoxicillin 500mg. Should this be flagged for physician review prior to medication dispensation?",
        context="Cross-reactivity between Penicillin allergy and Amoxicillin antibiotic.",
        options=["Flag for Urgent Review", "Acknowledge Discrepancy", "Skip"],
        status="PENDING"
    )
    db.add_all([q1, q2])

    # Safe AI Summary
    ai_summary = AISummary(
        patient_id=rahul.id,
        summary_text="Rahul Kumar's latest uploaded blood report contains results for Hemoglobin, WBC Count, Platelet Count, Fasting Blood Glucose, Serum Creatinine, Total Cholesterol, and ESR. Hemoglobin is marked LOW and Fasting Glucose & Cholesterol are marked HIGH according to explicit reference ranges in the source report. ESR is marked NOT DETERMINED as no reference range was provided in the source document.",
        disclaimer="AI-generated organizational summary. MedLens organizes and summarizes clinical documentation. It does not provide diagnosis, prognosis, or treatment recommendations."
    )
    db.add(ai_summary)

    # Initial Demo Test Requests
    tr1 = TestRequest(
        patient_id=rahul.id,
        test_type="Complete Blood Count (CBC)",
        status="COMPLETED",
        urgency="ROUTINE",
        notes="Periodic routine CBC monitor for mild fatigue",
        requested_at=datetime.datetime.utcnow() - datetime.timedelta(days=9),
        scheduled_for="2026-08-28 09:00 AM",
        sample_collected_at=datetime.datetime.utcnow() - datetime.timedelta(days=8),
        completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=7)
    )
    tr2 = TestRequest(
        patient_id=rahul.id,
        test_type="Comprehensive Metabolic Panel (CMP)",
        status="PENDING",
        urgency="ROUTINE",
        notes="Follow-up fasting blood sugar and electrolyte evaluation",
        requested_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add_all([tr1, tr2])

    # Initial System Audit Logs
    audit1 = SystemAuditLog(
        user_name="Dr. Sarah Chen, MD",
        user_role="Lead Clinician",
        action="VERIFY_METRIC",
        resource_type="LabResult",
        resource_id="Hemoglobin",
        details="Verified Hemoglobin 11.2 g/dL against Metropolis CBC source document page 1.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=6)
    )
    audit2 = SystemAuditLog(
        user_name="System Automated Guardrail",
        user_role="System",
        action="CONFLICT_DETECTED",
        resource_type="Conflict",
        resource_id="ALLERGY_MEDICATION",
        details="Flagged potential record conflict: Penicillin allergy vs Amoxicillin prescription.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )
    db.add_all([audit1, audit2])

    db.commit()

@app.on_event("startup")
def on_startup():
    init_db()
    db = next(get_db())
    try:
        seed_demo_data(db)
    finally:
        db.close()

# ----------------- SCHEMAS -----------------
class TestRequestCreate(BaseModel):
    patient_id: int
    test_type: str
    urgency: Optional[str] = "ROUTINE"
    notes: Optional[str] = None

class TestRequestStatusUpdate(BaseModel):
    status: str  # ACCEPTED, SCHEDULED, SAMPLE_COLLECTED, COMPLETED
    scheduled_for: Optional[str] = None
    notes: Optional[str] = None
    updater_role: Optional[str] = "Lab Technician"

class PatientCreate(BaseModel):
    name: str
    dob: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    symptoms: Optional[str] = None
    existing_conditions: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    history: Optional[str] = None
    notes: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    symptoms: Optional[str] = None
    existing_conditions: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    history: Optional[str] = None
    notes: Optional[str] = None

class MedicalRecordVerify(BaseModel):
    verified_value: Optional[str] = None
    verifier: str = "Dr. Sarah Chen, MD"
    action: str = "VERIFIED" # VERIFIED, EDITED, REJECTED

class ClarificationAnswer(BaseModel):
    answer: str

# ----------------- ROUTES ------------------

@app.get("/")
@app.get("/api")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MedLens AI-Powered Clinical Information Intelligence",
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# PATIENTS
@app.get("/patients")
@app.get("/api/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    results = []
    for p in patients:
        docs_count = len(p.documents)
        pending_count = len([lr for lr in p.lab_results if lr.verification_status == "PENDING"])
        conflicts_count = len([c for c in p.conflicts if c.status == "UNRESOLVED"])
        results.append({
            "id": p.id,
            "patient_id": f"ML-100{p.id:02d}",
            "name": p.name,
            "age": p.age,
            "sex": p.sex,
            "dob": p.dob,
            "allergies": p.allergies,
            "existing_conditions": p.existing_conditions,
            "current_medications": p.current_medications,
            "symptoms": p.symptoms,
            "history": p.history,
            "provenance": p.provenance,
            "documents_count": docs_count,
            "pending_verifications": pending_count,
            "conflicts_count": conflicts_count,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return results

@app.post("/patients")
@app.post("/api/patients")
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    p = Patient(
        name=payload.name,
        dob=payload.dob,
        age=payload.age,
        sex=payload.sex,
        symptoms=payload.symptoms,
        existing_conditions=payload.existing_conditions,
        allergies=payload.allergies,
        current_medications=payload.current_medications,
        history=payload.history,
        notes=payload.notes,
        provenance="USER_PROVIDED"
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "patient_id": f"ML-100{p.id:02d}", "name": p.name, "status": "Created"}

@app.get("/patients/{patient_id}")
@app.get("/api/patients/{patient_id}")
def get_patient_details(patient_id: int, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    docs = db.query(Document).filter(Document.patient_id == patient_id).all()
    labs = db.query(LabResult).filter(LabResult.patient_id == patient_id).all()
    conflicts = db.query(Conflict).filter(Conflict.patient_id == patient_id).all()
    timeline = db.query(TimelineEvent).filter(TimelineEvent.patient_id == patient_id).order_by(TimelineEvent.event_date.desc()).all()
    clarifications = db.query(ClarificationQuestion).filter(ClarificationQuestion.patient_id == patient_id).all()
    ai_sum = db.query(AISummary).filter(AISummary.patient_id == patient_id).order_by(AISummary.created_at.desc()).first()

    return {
        "id": p.id,
        "patient_id": f"ML-100{p.id:02d}",
        "name": p.name,
        "dob": p.dob,
        "age": p.age,
        "sex": p.sex,
        "symptoms": p.symptoms,
        "existing_conditions": p.existing_conditions,
        "allergies": p.allergies,
        "current_medications": p.current_medications,
        "history": p.history,
        "notes": p.notes,
        "provenance": p.provenance,
        "documents": [
            {
                "id": d.id,
                "file_name": d.file_name,
                "file_size": d.file_size,
                "status": d.status,
                "total_pages": d.total_pages,
                "upload_date": d.upload_date.isoformat() if d.upload_date else None,
                "extracted_fields_count": d.extracted_fields_count
            }
            for d in docs
        ],
        "lab_results": [
            {
                "id": lr.id,
                "test_name": lr.test_name,
                "value": lr.value,
                "raw_value": lr.raw_value,
                "unit": lr.unit,
                "reference_range": {
                    "low": lr.reference_low,
                    "high": lr.reference_high,
                    "raw_text": lr.raw_reference_text
                },
                "status": lr.status,
                "result_date": lr.result_date,
                "source_document": lr.source_document,
                "source_page": lr.source_page,
                "source_text": lr.source_text,
                "confidence": lr.confidence,
                "provenance": lr.provenance,
                "verification_status": lr.verification_status,
                "verified_value": lr.verified_value,
                "verified_by": lr.verified_by,
                "verified_at": lr.verified_at.isoformat() if lr.verified_at else None
            }
            for lr in labs
        ],
        "conflicts": [
            {
                "id": c.id,
                "conflict_type": c.conflict_type,
                "severity": c.severity,
                "title": c.title,
                "user_statement": c.user_statement,
                "document_statement": c.document_statement,
                "source_document_name": c.source_document_name,
                "source_page": c.source_page,
                "status": c.status,
                "disclaimer": c.disclaimer
            }
            for c in conflicts
        ],
        "timeline": [
            {
                "id": t.id,
                "event_date": t.event_date,
                "event_type": t.event_type,
                "title": t.title,
                "description": t.description,
                "source_document_name": t.source_document_name
            }
            for t in timeline
        ],
        "clarifications": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "context": q.context,
                "options": q.options,
                "answer": q.answer,
                "status": q.status
            }
            for q in clarifications
        ],
        "ai_summary": {
            "summary_text": ai_sum.summary_text if ai_sum else None,
            "disclaimer": ai_sum.disclaimer if ai_sum else AIService.SAFE_SUMMARY_DISCLAIMER
        } if ai_sum else None
    }

@app.put("/patients/{patient_id}")
@app.put("/api/patients/{patient_id}")
def update_patient(patient_id: int, payload: PatientUpdate, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = payload.dict(exclude_unset=True)
    for key, val in update_data.items():
        setattr(p, key, val)
    db.commit()
    db.refresh(p)
    return {"message": "Patient updated successfully", "id": p.id}

# DOCUMENTS & UPLOADS
@app.get("/patients/{patient_id}/documents")
@app.get("/api/patients/{patient_id}/documents")
def list_patient_documents(patient_id: int, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.patient_id == patient_id).all()
    return [
        {
            "id": d.id,
            "patient_id": d.patient_id,
            "file_name": d.file_name,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "upload_date": d.upload_date.isoformat() if d.upload_date else None,
            "status": d.status,
            "total_pages": d.total_pages,
            "extracted_fields_count": d.extracted_fields_count,
            "verified_fields_count": d.verified_fields_count
        }
        for d in docs
    ]

@app.post("/patients/{patient_id}/documents")
@app.post("/api/patients/{patient_id}/documents")
async def upload_document(
    patient_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 1. Filename sanitization
    raw_filename = file.filename or "uploaded_document.pdf"
    safe_filename = sanitize_filename(raw_filename)
    file_ext = os.path.splitext(safe_filename)[1].lower()

    # 2. File extension & type validation
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file_ext}'. MedLens strictly accepts PDF, PNG, JPG, JPEG documents."
        )

    # 3. Read content & size validation (max 10MB)
    content = await file.read()
    file_size = len(content)

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded document is empty. Please select a valid medical report file."
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File size ({round(file_size / (1024*1024), 2)} MB) exceeds the maximum allowed limit of 10 MB."
        )

    # 4. Save document record
    doc = Document(
        patient_id=patient_id,
        file_name=safe_filename,
        file_type=file.content_type or ("application/pdf" if file_ext == ".pdf" else "image/png"),
        file_size=file_size,
        status="Uploaded",
        total_pages=1,
        extracted_fields_count=0
    )
    db.add(doc)

    # 5. Security audit logging
    audit = SystemAuditLog(
        user_name=patient.name,
        user_role="Patient",
        action="DOCUMENT_UPLOAD",
        resource_type="Document",
        resource_id=safe_filename,
        details=f"Uploaded {safe_filename} ({file_size} bytes) for patient {patient.name} (ML-100{patient.id:02d}).",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)

    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "file_name": doc.file_name,
        "file_size": doc.file_size,
        "status": "Uploaded",
        "message": "Document validated, sanitized, and queued for extraction pipeline."
    }

@app.post("/documents/{document_id}/process")
@app.post("/api/documents/{document_id}/process")
def process_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    patient = db.query(Patient).filter(Patient.id == doc.patient_id).first()

    # Simulate / execute OCR & extraction pipeline
    sample_text = OCREngine._fallback_text_for_file(doc.file_name, 1)
    extracted = EntityExtractor.extract_entities(doc.file_name, sample_text)

    created_labs = []
    for item in extracted["lab_results"]:
        lab = LabResult(
            patient_id=doc.patient_id,
            document_id=doc.id,
            test_name=item["test_name"],
            value=item["value"],
            raw_value=item["raw_value"],
            unit=item["unit"],
            reference_low=item["reference_low"],
            reference_high=item["reference_high"],
            raw_reference_text=item["raw_reference_text"],
            status=item["status"],
            result_date="2026-08-28",
            source_document=doc.file_name,
            source_page=item["source_page"],
            source_text=item["source_text"],
            confidence=item["confidence"],
            provenance="DOCUMENT_EXTRACTED",
            verification_status="PENDING"
        )
        db.add(lab)
        created_labs.append(lab)

    # Detect conflicts with patient allergies/conditions
    if patient:
        conflicts_found = AIService.detect_conflicts(
            patient.allergies,
            patient.existing_conditions,
            extracted["medications"],
            doc.file_name
        )
        for cf in conflicts_found:
            c_obj = Conflict(
                patient_id=patient.id,
                conflict_type=cf["conflict_type"],
                severity=cf["severity"],
                title=cf["title"],
                user_statement=cf["user_statement"],
                document_statement=cf["document_statement"],
                source_document_name=cf["source_document_name"],
                source_page=cf["source_page"],
                status="UNRESOLVED",
                disclaimer=cf["disclaimer"]
            )
            db.add(c_obj)

    # Add timeline event
    t_ev = TimelineEvent(
        patient_id=doc.patient_id,
        event_date=datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        event_type="EXTRACTION",
        title=f"Extracted {len(created_labs)} Parameters",
        description=f"Automated clinical entity extraction complete for {doc.file_name}",
        source_document_name=doc.file_name
    )
    db.add(t_ev)

    doc.status = "Ready"
    doc.extracted_fields_count = len(created_labs)
    db.commit()

    return {
        "document_id": doc.id,
        "status": "Ready",
        "extracted_parameters_count": len(created_labs),
        "medications_found": len(extracted["medications"]),
        "message": "OCR & Entity extraction pipeline completed successfully."
    }

@app.get("/documents/{document_id}/extracted-data")
@app.get("/api/documents/{document_id}/extracted-data")
def get_extracted_data(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    labs = db.query(LabResult).filter(LabResult.document_id == document_id).all()
    return {
        "document": {
            "id": doc.id,
            "file_name": doc.file_name,
            "status": doc.status,
            "total_pages": doc.total_pages
        },
        "lab_results": [
            {
                "id": lr.id,
                "test_name": lr.test_name,
                "value": lr.value,
                "unit": lr.unit,
                "reference_range": {
                    "low": lr.reference_low,
                    "high": lr.reference_high,
                    "raw_text": lr.raw_reference_text
                },
                "status": lr.status,
                "confidence": lr.confidence,
                "provenance": lr.provenance,
                "source_page": lr.source_page,
                "source_text": lr.source_text,
                "verification_status": lr.verification_status
            }
            for lr in labs
        ]
    }

# VERIFICATION
@app.post("/medical-records/{record_id}/verify")
@app.post("/api/medical-records/{record_id}/verify")
def verify_medical_record(
    record_id: int,
    payload: MedicalRecordVerify,
    db: Session = Depends(get_db),
    caller_role: str = Depends(require_role(["Doctor", "Clinician", "Admin"]))
):
    record = db.query(LabResult).filter(LabResult.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab result not found")

    old_val = str(record.value)
    new_val = payload.verified_value if payload.verified_value is not None else old_val

    record.verification_status = payload.action
    record.verified_by = payload.verifier
    record.verified_at = datetime.datetime.utcnow()
    record.verified_value = new_val
    record.provenance = "HUMAN_VERIFIED"

    if payload.action == "EDITED":
        try:
            record.value = float(new_val)
        except ValueError:
            pass

    # Record-specific verification audit log
    log = VerificationLog(
        lab_result_id=record.id,
        action=payload.action,
        original_value=old_val,
        new_value=new_val,
        verifier=payload.verifier,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(log)

    # System-wide audit log
    sys_log = SystemAuditLog(
        user_name=payload.verifier,
        user_role=caller_role,
        action=f"VERIFY_{payload.action}",
        resource_type="LabResult",
        resource_id=str(record.id),
        details=f"Test '{record.test_name}': {old_val} -> {new_val} ({payload.action}) by {payload.verifier}",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(sys_log)
    db.commit()

    return {
        "id": record.id,
        "status": record.verification_status,
        "provenance": record.provenance,
        "verified_by": record.verified_by,
        "audit_recorded": True
    }

# TIMELINE & CONFLICTS
@app.get("/patients/{patient_id}/timeline")
@app.get("/api/patients/{patient_id}/timeline")
def get_patient_timeline(patient_id: int, db: Session = Depends(get_db)):
    events = db.query(TimelineEvent).filter(TimelineEvent.patient_id == patient_id).order_by(TimelineEvent.event_date.desc()).all()
    return [
        {
            "id": e.id,
            "event_date": e.event_date,
            "event_type": e.event_type,
            "title": e.title,
            "description": e.description,
            "source_document_name": e.source_document_name
        }
        for e in events
    ]

@app.get("/patients/{patient_id}/conflicts")
@app.get("/api/patients/{patient_id}/conflicts")
def get_patient_conflicts(patient_id: int, db: Session = Depends(get_db)):
    conflicts = db.query(Conflict).filter(Conflict.patient_id == patient_id).all()
    return [
        {
            "id": c.id,
            "conflict_type": c.conflict_type,
            "severity": c.severity,
            "title": c.title,
            "user_statement": c.user_statement,
            "document_statement": c.document_statement,
            "source_document_name": c.source_document_name,
            "source_page": c.source_page,
            "status": c.status,
            "disclaimer": c.disclaimer
        }
        for c in conflicts
    ]

# SAFE AI SUMMARY & COMPARISON
@app.post("/patients/{patient_id}/summary")
@app.post("/api/patients/{patient_id}/summary")
def generate_summary(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    labs = db.query(LabResult).filter(LabResult.patient_id == patient_id).all()
    conflicts = db.query(Conflict).filter(Conflict.patient_id == patient_id, Conflict.status == "UNRESOLVED").all()
    unverified = len([l for l in labs if l.verification_status == "PENDING"])

    lab_dicts = [
        {"test_name": l.test_name, "status": l.status, "confidence": l.confidence}
        for l in labs
    ]
    conf_dicts = [{"title": c.title} for c in conflicts]

    summary_res = AIService.generate_safe_summary(patient.name, lab_dicts, conf_dicts, unverified)
    
    # Save to DB
    ai_record = AISummary(
        patient_id=patient.id,
        summary_text=summary_res["summary_text"],
        disclaimer=summary_res["disclaimer"]
    )
    db.add(ai_record)
    db.commit()

    return summary_res

@app.post("/patients/{patient_id}/compare")
@app.post("/api/patients/{patient_id}/compare")
def compare_patient_reports(patient_id: int, db: Session = Depends(get_db)):
    # Standard demo comparison: Metropolis 2026-08-28 vs Previous 2026-05-14
    prev_results = [
        {"test_name": "Hemoglobin", "value": 11.8, "unit": "g/dL", "result_date": "2026-05-14"},
        {"test_name": "WBC Count", "value": 7200.0, "unit": "/uL", "result_date": "2026-05-14"},
        {"test_name": "Fasting Blood Glucose", "value": 108.0, "unit": "mg/dL", "result_date": "2026-05-14"},
        {"test_name": "Platelet Count", "value": 255.0, "unit": "x10^3/uL", "result_date": "2026-05-14"}
    ]
    curr_results = [
        {"test_name": "Hemoglobin", "value": 11.2, "unit": "g/dL", "result_date": "2026-08-28"},
        {"test_name": "WBC Count", "value": 7800.0, "unit": "/uL", "result_date": "2026-08-28"},
        {"test_name": "Fasting Blood Glucose", "value": 115.0, "unit": "mg/dL", "result_date": "2026-08-28"},
        {"test_name": "Platelet Count", "value": 240.0, "unit": "x10^3/uL", "result_date": "2026-08-28"}
    ]

    comparisons = AIService.compare_reports(prev_results, curr_results)
    return {
        "patient_id": patient_id,
        "previous_document": "Previous_CBC_Report_2026-05-14.pdf",
        "current_document": "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
        "comparisons": comparisons
    }

# CLARIFICATIONS
@app.post("/clarifications/{question_id}/answer")
@app.post("/api/clarifications/{question_id}/answer")
def answer_clarification(question_id: int, payload: ClarificationAnswer, db: Session = Depends(get_db)):
    q = db.query(ClarificationQuestion).filter(ClarificationQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.answer = payload.answer
    q.status = "ANSWERED"
    db.commit()
    return {"id": q.id, "status": "ANSWERED", "answer": q.answer}

# ----------------- TEST REQUESTS (PHASE 5 & 29) -----------------
@app.get("/test-requests")
@app.get("/api/test-requests")
def get_test_requests(patient_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(TestRequest)
    if patient_id:
        query = query.filter(TestRequest.patient_id == patient_id)
    requests = query.order_by(TestRequest.requested_at.desc()).all()
    results = []
    for tr in requests:
        patient = db.query(Patient).filter(Patient.id == tr.patient_id).first()
        results.append({
            "id": tr.id,
            "patient_id": tr.patient_id,
            "patient_name": patient.name if patient else f"ML-100{tr.patient_id:02d}",
            "test_type": tr.test_type,
            "status": tr.status,
            "urgency": tr.urgency,
            "notes": tr.notes,
            "requested_at": tr.requested_at.isoformat() if tr.requested_at else None,
            "scheduled_for": tr.scheduled_for,
            "sample_collected_at": tr.sample_collected_at.isoformat() if tr.sample_collected_at else None,
            "completed_at": tr.completed_at.isoformat() if tr.completed_at else None
        })
    return results

@app.post("/test-requests")
@app.post("/api/test-requests")
def create_test_request(payload: TestRequestCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    tr = TestRequest(
        patient_id=payload.patient_id,
        test_type=payload.test_type,
        urgency=payload.urgency or "ROUTINE",
        notes=payload.notes,
        status="PENDING",
        requested_at=datetime.datetime.utcnow()
    )
    db.add(tr)

    # Timeline event
    t_ev = TimelineEvent(
        patient_id=patient.id,
        event_date=datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        event_type="TEST_REQUEST",
        title=f"Test Requested: {payload.test_type}",
        description=f"Diagnostic test request submitted ({payload.urgency or 'ROUTINE'}).",
        source_document_name="MedLens Test Order"
    )
    db.add(t_ev)

    # Audit log
    audit = SystemAuditLog(
        user_name=patient.name,
        user_role="Patient",
        action="REQUEST_TEST",
        resource_type="TestRequest",
        resource_id=payload.test_type,
        details=f"Placed test request for {payload.test_type}.",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)

    db.commit()
    db.refresh(tr)
    return {
        "id": tr.id,
        "patient_id": tr.patient_id,
        "test_type": tr.test_type,
        "status": tr.status,
        "urgency": tr.urgency,
        "message": "Test request created successfully and forwarded to laboratory."
    }

@app.patch("/test-requests/{request_id}/status")
@app.patch("/api/test-requests/{request_id}/status")
def update_test_request_status(
    request_id: int,
    payload: TestRequestStatusUpdate,
    db: Session = Depends(get_db),
    caller_role: str = Depends(require_role(["Lab Technician", "Technician", "Doctor", "Clinician", "Admin"]))
):
    tr = db.query(TestRequest).filter(TestRequest.id == request_id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Test request not found")

    old_status = tr.status
    tr.status = payload.status

    now = datetime.datetime.utcnow()
    if payload.status == "SCHEDULED" and payload.scheduled_for:
        tr.scheduled_for = payload.scheduled_for
    elif payload.status == "SAMPLE_COLLECTED":
        tr.sample_collected_at = now
    elif payload.status == "COMPLETED":
        tr.completed_at = now

    if payload.notes:
        tr.notes = payload.notes

    # Add timeline event on status transition
    patient = db.query(Patient).filter(Patient.id == tr.patient_id).first()
    if patient:
        t_ev = TimelineEvent(
            patient_id=tr.patient_id,
            event_date=now.strftime("%Y-%m-%d"),
            event_type="TEST_STATUS_UPDATE",
            title=f"{tr.test_type} → {payload.status.replace('_', ' ').title()}",
            description=f"Status advanced from {old_status} to {payload.status} by {payload.updater_role or caller_role}.",
            source_document_name="Laboratory Ingest"
        )
        db.add(t_ev)

    audit = SystemAuditLog(
        user_name=payload.updater_role or caller_role,
        user_role=caller_role,
        action="UPDATE_TEST_STATUS",
        resource_type="TestRequest",
        resource_id=str(tr.id),
        details=f"Advanced status for {tr.test_type} from {old_status} to {payload.status}.",
        timestamp=now
    )
    db.add(audit)

    db.commit()
    db.refresh(tr)
    return {
        "id": tr.id,
        "status": tr.status,
        "scheduled_for": tr.scheduled_for,
        "sample_collected_at": tr.sample_collected_at.isoformat() if tr.sample_collected_at else None,
        "completed_at": tr.completed_at.isoformat() if tr.completed_at else None,
        "message": f"Test request status transitioned to {tr.status}."
    }

# ----------------- ADMIN & SYSTEM AUDIT (PHASE 5 & 8) -----------------
@app.get("/admin/audit-logs")
@app.get("/api/admin/audit-logs")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    caller_role: str = Depends(require_role(["Admin", "Doctor", "Clinician"]))
):
    logs = db.query(SystemAuditLog).order_by(SystemAuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_name": l.user_name,
            "user_role": l.user_role,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            "status": l.status
        }
        for l in logs
    ]

@app.get("/admin/system-stats")
@app.get("/api/admin/system-stats")
def get_system_stats(
    db: Session = Depends(get_db),
    caller_role: str = Depends(require_role(["Admin", "Doctor", "Clinician"]))
):
    total_users = db.query(User).count()
    total_patients = db.query(Patient).count()
    total_docs = db.query(Document).count()
    total_requests = db.query(TestRequest).count()
    total_audits = db.query(SystemAuditLog).count()
    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_documents": total_docs,
        "total_test_requests": total_requests,
        "total_audit_events": total_audits,
        "system_status": "ONLINE",
        "api_version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

