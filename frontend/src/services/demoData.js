// Comprehensive synthetic medical data for MedLens demo mode

export const DEMO_PATIENTS = [
  {
    id: 1,
    patient_id: "ML-10042",
    name: "Rahul Kumar",
    dob: "1984-06-12",
    age: 42,
    sex: "Male",
    symptoms: "Fatigue, mild dizziness, occasional joint pain in evenings",
    existing_conditions: "Mild essential hypertension",
    allergies: "Penicillin",
    current_medications: "Amlodipine 5mg OD",
    history: "No prior surgical history. Non-smoker. Family history of type 2 diabetes.",
    notes: "Patient reported penicillin anaphylaxis/hives during childhood episode.",
    provenance: "USER_PROVIDED",
    documents_count: 3,
    pending_verifications: 5,
    conflicts_count: 1,
    created_at: "2026-08-20T10:30:00Z"
  },
  {
    id: 2,
    patient_id: "ML-10043",
    name: "Priya Sharma",
    dob: "1990-03-24",
    age: 36,
    sex: "Female",
    symptoms: "Recurrent migraine, mild iron deficiency",
    existing_conditions: "None",
    allergies: "Sulfa drugs",
    current_medications: "Iron supplement 100mg",
    history: "Normal appendectomy 2021.",
    notes: "Follow-up for ferritin profile.",
    provenance: "USER_PROVIDED",
    documents_count: 2,
    pending_verifications: 0,
    conflicts_count: 0,
    created_at: "2026-08-22T14:15:00Z"
  },
  {
    id: 3,
    patient_id: "ML-10044",
    name: "Vikram Patel",
    dob: "1968-11-05",
    age: 58,
    sex: "Male",
    symptoms: "Polydipsia, blurred vision, numbness in toes",
    existing_conditions: "Type 2 Diabetes, Dyslipidemia",
    allergies: "No known drug allergies (NKDA)",
    current_medications: "Metformin 500mg BD, Atorvastatin 20mg OD",
    history: "Hypertension diagnosed 2018.",
    notes: "HbA1c monitoring every 3 months.",
    provenance: "USER_PROVIDED",
    documents_count: 4,
    pending_verifications: 2,
    conflicts_count: 0,
    created_at: "2026-08-25T09:00:00Z"
  },
  {
    id: 4,
    patient_id: "ML-10045",
    name: "Anita Rao",
    dob: "1997-09-18",
    age: 29,
    sex: "Female",
    symptoms: "Routine annual executive health checkup",
    existing_conditions: "None",
    allergies: "No known drug allergies (NKDA)",
    current_medications: "None",
    history: "No significant medical history.",
    notes: "Baseline preventive evaluation.",
    provenance: "USER_PROVIDED",
    documents_count: 1,
    pending_verifications: 0,
    conflicts_count: 0,
    created_at: "2026-09-01T11:45:00Z"
  }
];

export const DEMO_DOCUMENTS = [
  {
    id: 1,
    patient_id: 1,
    file_name: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    file_type: "application/pdf",
    file_size: 245800,
    upload_date: "2026-08-28T10:15:00Z",
    status: "Ready",
    total_pages: 2,
    extracted_fields_count: 7,
    verified_fields_count: 2,
    category: "Lab Report",
    source_org: "Metropolis Clinical Diagnostics Laboratory"
  },
  {
    id: 2,
    patient_id: 1,
    file_name: "Previous_CBC_Report_2026-05-14.pdf",
    file_type: "application/pdf",
    file_size: 198000,
    upload_date: "2026-05-14T11:30:00Z",
    status: "Ready",
    total_pages: 1,
    extracted_fields_count: 4,
    verified_fields_count: 4,
    category: "Lab Report",
    source_org: "Metropolis Diagnostics & Research Centre"
  },
  {
    id: 3,
    patient_id: 1,
    file_name: "City_Clinic_Prescription_2026-09-02.pdf",
    file_type: "application/pdf",
    file_size: 142000,
    upload_date: "2026-09-02T16:40:00Z",
    status: "Ready",
    total_pages: 1,
    extracted_fields_count: 2,
    verified_fields_count: 1,
    category: "Prescription",
    source_org: "City Health Clinic — Dr. Alok Verma, MD"
  }
];

export const DEMO_LAB_RESULTS = [
  {
    id: 101,
    patient_id: 1,
    document_id: 1,
    test_name: "Hemoglobin",
    value: 11.2,
    raw_value: "11.2",
    unit: "g/dL",
    reference_range: {
      low: 12.0,
      high: 16.0,
      raw_text: "12.0 - 16.0"
    },
    status: "LOW",
    result_date: "2026-08-28",
    source_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    source_page: 1,
    source_text: "Haemoglobin                       11.2       g/dL        12.0 - 16.0",
    confidence: 0.96,
    provenance: "HUMAN_VERIFIED",
    verification_status: "VERIFIED",
    verified_value: "11.2",
    verified_by: "Dr. Sarah Chen, MD",
    verified_at: "2026-08-29T09:40:00Z",
    audit_logs: [
      {
        action: "VERIFIED",
        original_value: "11.2",
        new_value: "11.2",
        verifier: "Dr. Sarah Chen, MD",
        timestamp: "2026-08-29T09:40:00Z"
      }
    ]
  },
  {
    id: 102,
    patient_id: 1,
    document_id: 1,
    test_name: "Total Leucocyte Count (WBC)",
    value: 7800,
    raw_value: "7800",
    unit: "/uL",
    reference_range: {
      low: 4000,
      high: 11000,
      raw_text: "4000 - 11000"
    },
    status: "NORMAL",
    result_date: "2026-08-28",
    source_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    source_page: 1,
    source_text: "Total Leucocyte Count (WBC)       7800       /uL         4000 - 11000",
    confidence: 0.98,
    provenance: "AI_EXTRACTED",
    verification_status: "PENDING",
    verified_value: null,
    verified_by: null,
    verified_at: null,
    audit_logs: []
  },
  {
    id: 103,
    patient_id: 1,
    document_id: 1,
    test_name: "Platelet Count",
    value: 240,
    raw_value: "240",
    unit: "x10^3/uL",
    reference_range: {
      low: 150,
      high: 450,
      raw_text: "150 - 450"
    },
    status: "NORMAL",
    result_date: "2026-08-28",
    source_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    source_page: 1,
    source_text: "Platelet Count                    240        x10^3/uL    150 - 450",
    confidence: 0.97,
    provenance: "AI_EXTRACTED",
    verification_status: "PENDING",
    verified_value: null,
    verified_by: null,
    verified_at: null,
    audit_logs: []
  },
  {
    id: 104,
    patient_id: 1,
    document_id: 1,
    test_name: "Fasting Blood Glucose",
    value: 115.0,
    raw_value: "115",
    unit: "mg/dL",
    reference_range: {
      low: 70.0,
      high: 99.0,
      raw_text: "70 - 99"
    },
    status: "HIGH",
    result_date: "2026-08-28",
    source_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    source_page: 1,
    source_text: "Fasting Blood Glucose             115        mg/dL       70 - 99",
    confidence: 0.95,
    provenance: "HUMAN_VERIFIED",
    verification_status: "VERIFIED",
    verified_value: "115.0",
    verified_by: "Dr. Sarah Chen, MD",
    verified_at: "2026-08-29T09:42:00Z",
    audit_logs: [
      {
        action: "VERIFIED",
        original_value: "115",
        new_value: "115.0",
        verifier: "Dr. Sarah Chen, MD",
        timestamp: "2026-08-29T09:42:00Z"
      }
    ]
  },
  {
    id: 105,
    patient_id: 1,
    document_id: 1,
    test_name: "Serum Creatinine",
    value: 1.05,
    raw_value: "1.05",
    unit: "mg/dL",
    reference_range: {
      low: 0.7,
      high: 1.3,
      raw_text: "0.7 - 1.3"
    },
    status: "NORMAL",
    result_date: "2026-08-28",
    source_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    source_page: 2,
    source_text: "Serum Creatinine                  1.05       mg/dL       0.7 - 1.3",
    confidence: 0.94,
    provenance: "AI_EXTRACTED",
    verification_status: "PENDING",
    verified_value: null,
    verified_by: null,
    verified_at: null,
    audit_logs: []
  },
  {
    id: 106,
    patient_id: 1,
    document_id: 1,
    test_name: "Total Cholesterol",
    value: 215.0,
    raw_value: "215",
    unit: "mg/dL",
    reference_range: {
      low: null,
      high: 200.0,
      raw_text: "< 200"
    },
    status: "HIGH",
    result_date: "2026-08-28",
    source_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    source_page: 2,
    source_text: "Total Cholesterol                 215        mg/dL       < 200",
    confidence: 0.92,
    provenance: "AI_EXTRACTED",
    verification_status: "PENDING",
    verified_value: null,
    verified_by: null,
    verified_at: null,
    audit_logs: []
  },
  {
    id: 107,
    patient_id: 1,
    document_id: 1,
    test_name: "Erythrocyte Sedimentation Rate (ESR)",
    value: 28.0,
    raw_value: "28",
    unit: "mm/hr",
    reference_range: {
      low: null,
      high: null,
      raw_text: null
    },
    status: "NOT_DETERMINED",
    result_date: "2026-08-28",
    source_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    source_page: 1,
    source_text: "Erythrocyte Sedimentation (ESR)   28         mm/hr       [Reference range not provided in source document]",
    confidence: 0.85,
    provenance: "AI_EXTRACTED",
    verification_status: "PENDING",
    verified_value: null,
    verified_by: null,
    verified_at: null,
    audit_logs: []
  }
];

export const DEMO_CONFLICTS = [
  {
    id: 1,
    patient_id: 1,
    conflict_type: "ALLERGY_MEDICATION",
    severity: "WARNING",
    title: "Documented Allergy vs Prescribed Medication",
    user_statement: "Penicillin",
    user_source: "Patient Profile (USER_PROVIDED)",
    document_statement: "Amoxicillin 500mg TDS for 5 days",
    document_source: "City_Clinic_Prescription_2026-09-02.pdf (Page 1)",
    status: "Needs Professional Review",
    resolved: false,
    disclaimer: "These records contain potentially inconsistent information. Please verify with a qualified healthcare professional."
  }
];

export const DEMO_TIMELINE = [
  {
    id: 1,
    event_date: "2026-09-02",
    event_type: "CONFLICT",
    category: "Conflicts",
    title: "Potential Record Conflict Flagged",
    description: "Inconsistency detected between documented Penicillin allergy and Amoxicillin 500mg in outpatient prescription.",
    source_document_name: "City_Clinic_Prescription_2026-09-02.pdf",
    badge_color: "amber"
  },
  {
    id: 2,
    event_date: "2026-09-02",
    event_type: "PRESCRIPTION",
    category: "Medications",
    title: "Prescription Uploaded & Processed",
    description: "City Health Clinic prescription processed. Extracted 2 medication entities (Amoxicillin, Paracetamol).",
    source_document_name: "City_Clinic_Prescription_2026-09-02.pdf",
    badge_color: "indigo"
  },
  {
    id: 3,
    event_date: "2026-08-29",
    event_type: "VERIFICATION",
    category: "Verification",
    title: "Hemoglobin and Glucose Verified by Clinician",
    description: "Dr. Sarah Chen verified extracted values against page 1 laboratory scan.",
    source_document_name: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    badge_color: "emerald"
  },
  {
    id: 4,
    event_date: "2026-08-28",
    event_type: "LAB_TEST",
    category: "Lab Results",
    title: "7 Clinical Lab Parameters Extracted",
    description: "Metropolis Diagnostics Complete Blood Count extracted. Reference ranges analyzed and verified against source text.",
    source_document_name: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    badge_color: "sky"
  },
  {
    id: 5,
    event_date: "2026-08-28",
    event_type: "DOCUMENT_UPLOAD",
    category: "Reports",
    title: "Complete Blood Count Report Uploaded",
    description: "2-page diagnostic report registered and ingested into MedLens pipeline.",
    source_document_name: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
    badge_color: "blue"
  },
  {
    id: 6,
    event_date: "2026-05-14",
    event_type: "LAB_TEST",
    category: "Lab Results",
    title: "Historical Baseline CBC Extracted",
    description: "Baseline CBC parameters recorded for longitudinal trend comparison.",
    source_document_name: "Previous_CBC_Report_2026-05-14.pdf",
    badge_color: "slate"
  }
];

export const DEMO_COMPARISONS = [
  {
    test_name: "Hemoglobin",
    unit: "g/dL",
    previous_value: 11.8,
    previous_date: "14 May 2026",
    previous_status: "LOW",
    current_value: 11.2,
    current_date: "28 Aug 2026",
    current_status: "LOW",
    delta: -0.6,
    direction: "DECREASED",
    factual_statement: "Hemoglobin decreased from 11.8 g/dL to 11.2 g/dL.",
    reference_range: "12.0 - 16.0 g/dL"
  },
  {
    test_name: "WBC Count",
    unit: "/uL",
    previous_value: 7200,
    previous_date: "14 May 2026",
    previous_status: "NORMAL",
    current_value: 7800,
    current_date: "28 Aug 2026",
    current_status: "NORMAL",
    delta: 600,
    direction: "INCREASED",
    factual_statement: "Total WBC count increased from 7200 /uL to 7800 /uL.",
    reference_range: "4000 - 11000 /uL"
  },
  {
    test_name: "Fasting Blood Glucose",
    unit: "mg/dL",
    previous_value: 108.0,
    previous_date: "14 May 2026",
    previous_status: "HIGH",
    current_value: 115.0,
    current_date: "28 Aug 2026",
    current_status: "HIGH",
    delta: 7.0,
    direction: "INCREASED",
    factual_statement: "Fasting Blood Glucose increased from 108 mg/dL to 115 mg/dL.",
    reference_range: "70 - 99 mg/dL"
  },
  {
    test_name: "Platelet Count",
    unit: "x10^3/uL",
    previous_value: 255,
    previous_date: "14 May 2026",
    previous_status: "NORMAL",
    current_value: 240,
    current_date: "28 Aug 2026",
    current_status: "NORMAL",
    delta: -15,
    direction: "DECREASED",
    factual_statement: "Platelet count decreased from 255 x10^3/uL to 240 x10^3/uL.",
    reference_range: "150 - 450 x10^3/uL"
  }
];

export const DEMO_CLARIFICATIONS = [
  {
    id: 1,
    field: "Erythrocyte Sedimentation Rate (ESR)",
    question: "Test ESR (28 mm/hr) does not contain a laboratory reference range in the uploaded report. Should this remain categorized as 'Not Determined'?",
    context: "Metropolis CBC Report (Page 1) omits explicit high/low thresholds for this specimen.",
    options: ["Keep as NOT DETERMINED", "Mark for Lab Inquiry", "Skip"],
    status: "PENDING"
  },
  {
    id: 2,
    field: "Penicillin / Amoxicillin Cross-Reactivity",
    question: "Patient profile records an active allergy to Penicillin. Prescription specifies Amoxicillin 500mg. Should this be flagged as an active conflict for physician review before dispensing?",
    context: "Potential allergy cross-reactivity between Penicillin and Amoxicillin antibiotic class.",
    options: ["Flag for Physician Review", "Acknowledge as Verified Exception", "Skip"],
    status: "PENDING"
  }
];

export const DEMO_AI_SUMMARY = {
  summary_text: "Rahul Kumar's latest uploaded blood report contains results for hemoglobin, WBC, glucose, platelet count, serum creatinine, and cholesterol. Hemoglobin is marked LOW according to the reference range provided in the report. Fasting Blood Glucose and Total Cholesterol are marked HIGH. Erythrocyte Sedimentation Rate (ESR) is marked NOT DETERMINED as no reference range was provided in the source document. Other displayed results are shown according to the explicit ranges available in the source document.",
  review_items: [
    "1 low-confidence extraction (ESR at 85% confidence)",
    "5 pending unverified laboratory fields",
    "1 potential record conflict (Penicillin allergy vs Amoxicillin prescription)"
  ],
  disclaimer: "AI-generated organizational summary. MedLens organizes and summarizes clinical documentation. It does not provide diagnosis, prognosis, or treatment recommendations."
};

export const DEMO_ROLES = {
  patient: {
    id: "patient",
    name: "Rahul Kumar",
    role: "Patient",
    email: "rahul.kumar@gmail.com",
    patientId: "ML-10042",
    age: 42,
    sex: "Male",
    desc: "View your reports, request tests and track your records.",
    avatar: "RK"
  },
  doctor: {
    id: "doctor",
    name: "Dr. Sarah Chen, MD",
    role: "Lead Clinician",
    email: "dr.sarah.chen@medlens.org",
    hospital: "Metropolitan Academic Medical Center",
    desc: "Review patient records and verify extracted information.",
    avatar: "SC"
  },
  lab_tech: {
    id: "lab_tech",
    name: "Alex Rivera, MLS",
    role: "Lab Technician",
    email: "a.rivera@metropolisdiagnostics.com",
    hospital: "Metropolis Clinical Diagnostic Laboratory",
    desc: "Manage test requests and upload laboratory reports.",
    avatar: "AR"
  },
  admin: {
    id: "admin",
    name: "System Administrator",
    role: "Admin",
    email: "admin@medlens.org",
    hospital: "MedLens Health Network System",
    desc: "Manage users and monitor system activity.",
    avatar: "AD"
  }
};

export const DEMO_TEST_REQUESTS = [
  {
    id: 1,
    patient_id: 1,
    patient_name: "Rahul Kumar",
    test_type: "Complete Blood Count (CBC)",
    urgency: "ROUTINE",
    status: "COMPLETED",
    notes: "Follow-up for mild fatigue and general wellness check.",
    requested_at: "2026-08-25T08:30:00Z",
    scheduled_for: "2026-08-28 09:00 AM",
    sample_collected_at: "2026-08-28T09:15:00Z",
    completed_at: "2026-08-28T14:30:00Z",
    report_file: "Metropolis_Complete_Blood_Count_2026-08-28.pdf"
  },
  {
    id: 2,
    patient_id: 1,
    patient_name: "Rahul Kumar",
    test_type: "Comprehensive Metabolic Panel (CMP)",
    urgency: "ROUTINE",
    status: "PENDING",
    notes: "Evaluate fasting blood glucose and electrolyte profile.",
    requested_at: "2026-09-04T11:00:00Z",
    scheduled_for: null,
    sample_collected_at: null,
    completed_at: null,
    report_file: null
  }
];

export const DEMO_SAMPLES = [
  {
    id: "SMP-0941",
    patient_id: 1,
    patient_name: "Rahul Kumar",
    sample_type: "Whole Blood (EDTA)",
    collected_at: "2026-08-28 09:15 AM",
    status: "PROCESSED",
    associated_test: "Complete Blood Count (CBC)",
    collector: "Alex Rivera, MLS"
  },
  {
    id: "SMP-0950",
    patient_id: 1,
    patient_name: "Rahul Kumar",
    sample_type: "Serum / Plain Tube",
    collected_at: "Pending appointment",
    status: "AWAITING_COLLECTION",
    associated_test: "Comprehensive Metabolic Panel (CMP)",
    collector: "Pending"
  }
];

export const DEMO_AUDIT_LOGS = [
  {
    id: "AUD-101",
    user_name: "Dr. Sarah Chen, MD",
    user_role: "Lead Clinician",
    action: "VERIFY_METRIC",
    resource_type: "LabResult",
    resource_id: "Hemoglobin",
    details: "Clinician verified Hemoglobin 11.2 g/dL against Metropolis CBC source document page 1.",
    timestamp: "2026-08-29T11:20:00Z",
    status: "SUCCESS"
  },
  {
    id: "AUD-102",
    user_name: "System Automated Guardrail",
    user_role: "System",
    action: "CONFLICT_DETECTED",
    resource_type: "Conflict",
    resource_id: "ALLERGY_MEDICATION",
    details: "Flagged record inconsistency: Documented Penicillin allergy vs Prescribed Amoxicillin 500mg.",
    timestamp: "2026-09-02T15:10:00Z",
    status: "SUCCESS"
  },
  {
    id: "AUD-103",
    user_name: "Alex Rivera, MLS",
    user_role: "Lab Technician",
    action: "SAMPLE_COLLECTED",
    resource_type: "Sample",
    resource_id: "SMP-0941",
    details: "Barcoded whole blood specimen collected for CBC processing.",
    timestamp: "2026-08-28T09:15:00Z",
    status: "SUCCESS"
  }
];

