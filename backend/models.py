import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="Clinician")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, index=True, nullable=False)
    dob = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String, nullable=True)
    symptoms = Column(Text, nullable=True)
    existing_conditions = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    history = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    provenance = Column(String, default="USER_PROVIDED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="patient", cascade="all, delete-orphan")
    lab_results = relationship("LabResult", back_populates="patient", cascade="all, delete-orphan")
    conflicts = relationship("Conflict", back_populates="patient", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="patient", cascade="all, delete-orphan")
    ai_summaries = relationship("AISummary", back_populates="patient", cascade="all, delete-orphan")
    test_requests = relationship("TestRequest", back_populates="patient", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Uploaded") # Uploaded -> Extracting -> Validating -> Ready
    total_pages = Column(Integer, default=1)
    extracted_fields_count = Column(Integer, default=0)
    verified_fields_count = Column(Integer, default=0)

    patient = relationship("Patient", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    lab_results = relationship("LabResult", back_populates="document", cascade="all, delete-orphan")

class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    page_text = Column(Text, nullable=True)

    document = relationship("Document", back_populates="pages")

class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    test_name = Column(String, index=True, nullable=False)
    value = Column(Float, nullable=True)
    raw_value = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    reference_low = Column(Float, nullable=True)
    reference_high = Column(Float, nullable=True)
    raw_reference_text = Column(String, nullable=True)
    status = Column(String, default="NOT_DETERMINED") # LOW, NORMAL, HIGH, NOT_DETERMINED
    result_date = Column(String, nullable=True)
    source_document = Column(String, nullable=True)
    source_page = Column(Integer, default=1)
    source_text = Column(Text, nullable=True)
    confidence = Column(Float, default=0.95)
    provenance = Column(String, default="DOCUMENT_EXTRACTED") # USER_PROVIDED, DOCUMENT_EXTRACTED, AI_GENERATED
    verification_status = Column(String, default="PENDING") # PENDING, VERIFIED, EDITED, REJECTED
    verified_value = Column(String, nullable=True)
    verified_by = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="lab_results")
    document = relationship("Document", back_populates="lab_results")
    verification_logs = relationship("VerificationLog", back_populates="lab_result", cascade="all, delete-orphan")

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    lab_result_id = Column(Integer, ForeignKey("lab_results.id"), nullable=False)
    action = Column(String, nullable=False) # VERIFIED, EDITED, REJECTED
    original_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    verifier = Column(String, default="Dr. User")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    lab_result = relationship("LabResult", back_populates="verification_logs")

class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    conflict_type = Column(String, nullable=False) # ALLERGY_MEDICATION, DEMOGRAPHIC, METRIC_DISCREPANCY
    severity = Column(String, default="WARNING")
    title = Column(String, nullable=False)
    user_statement = Column(Text, nullable=False)
    document_statement = Column(Text, nullable=False)
    source_document_name = Column(String, nullable=True)
    source_page = Column(Integer, default=1)
    status = Column(String, default="UNRESOLVED") # UNRESOLVED, RESOLVED
    disclaimer = Column(String, default="These records contain potentially inconsistent information. Please verify with a qualified healthcare professional.")

    patient = relationship("Patient", back_populates="conflicts")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    event_date = Column(String, nullable=False)
    event_type = Column(String, nullable=False) # LAB_TEST, PRESCRIPTION, INTAKE, CLINICAL_NOTE
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    metric_name = Column(String, nullable=True)
    metric_value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    status = Column(String, nullable=True)
    source_document_name = Column(String, nullable=True)
    source_page = Column(Integer, default=1)

    patient = relationship("Patient", back_populates="timeline_events")

class AISummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    summary_text = Column(Text, nullable=False)
    disclaimer = Column(String, default="MedLens provides information organization and understanding support. It does not provide medical diagnosis or treatment recommendations.")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="ai_summaries")

class ClarificationQuestion(Base):
    __tablename__ = "clarification_questions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    options = Column(JSON, nullable=True)
    answer = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, ANSWERED

class TestRequest(Base):
    __tablename__ = "test_requests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    test_type = Column(String, nullable=False) # e.g. "Complete Blood Count (CBC)"
    status = Column(String, default="PENDING") # PENDING, ACCEPTED, SCHEDULED, SAMPLE_COLLECTED, COMPLETED
    urgency = Column(String, default="ROUTINE") # ROUTINE, URGENT, STAT
    notes = Column(Text, nullable=True)
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    scheduled_for = Column(String, nullable=True)
    sample_collected_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="test_requests")

class SystemAuditLog(Base):
    __tablename__ = "system_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="SUCCESS")

