import axios from 'axios';
import {
  DEMO_PATIENTS,
  DEMO_DOCUMENTS,
  DEMO_LAB_RESULTS,
  DEMO_CONFLICTS,
  DEMO_TIMELINE,
  DEMO_COMPARISONS,
  DEMO_AI_SUMMARY,
  DEMO_CLARIFICATIONS
} from './demoData';

const rawUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');
const BASE_URL = rawUrl ? ((rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) ? rawUrl : `https://${rawUrl}`) : '';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await client.get('/api/health');
      return { online: true, data: res.data };
    } catch {
      return { online: false, data: null };
    }
  },

  // Patients
  async getPatients() {
    try {
      const res = await client.get('/api/patients');
      return res.data;
    } catch {
      return DEMO_PATIENTS;
    }
  },

  async getPatient(id) {
    try {
      const res = await client.get(`/api/patients/${id}`);
      return res.data;
    } catch {
      const p = DEMO_PATIENTS.find(x => x.id === Number(id)) || DEMO_PATIENTS[0];
      return {
        ...p,
        documents: DEMO_DOCUMENTS.filter(d => d.patient_id === p.id),
        lab_results: DEMO_LAB_RESULTS.filter(l => l.patient_id === p.id),
        conflicts: DEMO_CONFLICTS.filter(c => c.patient_id === p.id),
        timeline: DEMO_TIMELINE,
        clarifications: DEMO_CLARIFICATIONS,
        ai_summary: DEMO_AI_SUMMARY
      };
    }
  },

  async createPatient(data) {
    try {
      const res = await client.post('/api/patients', data);
      return res.data;
    } catch {
      const newId = DEMO_PATIENTS.length + 1;
      return {
        id: newId,
        patient_id: `ML-100${newId + 40}`,
        name: data.name,
        status: "Created",
        ...data
      };
    }
  },

  async updatePatient(id, data) {
    try {
      const res = await client.put(`/api/patients/${id}`, data);
      return res.data;
    } catch {
      return { id, message: "Updated locally", ...data };
    }
  },

  // Documents
  async getDocuments(patientId) {
    try {
      const res = await client.get(`/api/patients/${patientId}/documents`);
      return res.data;
    } catch {
      return DEMO_DOCUMENTS.filter(d => d.patient_id === Number(patientId));
    }
  },

  async processDocument(docId) {
    try {
      const res = await client.post(`/api/documents/${docId}/process`);
      return res.data;
    } catch {
      return {
        document_id: docId,
        status: "Ready",
        extracted_parameters_count: DEMO_LAB_RESULTS.length,
        medications_found: 2,
        message: "Demo extraction completed successfully."
      };
    }
  },

  // Verification
  async verifyLabResult(recordId, payload) {
    try {
      const res = await client.post(`/api/medical-records/${recordId}/verify`, payload);
      return res.data;
    } catch {
      return {
        id: recordId,
        status: payload.action,
        provenance: "HUMAN_VERIFIED",
        verified_by: payload.verifier,
        verified_value: payload.verified_value,
        verified_at: new Date().toISOString(),
        audit_recorded: true
      };
    }
  },

  // Conflicts
  async getConflicts(patientId) {
    try {
      const res = await client.get(`/api/patients/${patientId}/conflicts`);
      return res.data;
    } catch {
      return DEMO_CONFLICTS.filter(c => c.patient_id === Number(patientId));
    }
  },

  // Timeline
  async getTimeline(patientId) {
    try {
      const res = await client.get(`/api/patients/${patientId}/timeline`);
      return res.data;
    } catch {
      return DEMO_TIMELINE;
    }
  },

  // Comparison
  async compareReports(patientId) {
    try {
      const res = await client.post(`/api/patients/${patientId}/compare`);
      return res.data;
    } catch {
      return {
        patient_id: patientId,
        previous_document: "Previous_CBC_Report_2026-05-14.pdf",
        current_document: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
        comparisons: DEMO_COMPARISONS
      };
    }
  },

  // AI Summary
  async getAISummary(patientId) {
    try {
      const res = await client.post(`/api/patients/${patientId}/summary`);
      return res.data;
    } catch {
      return DEMO_AI_SUMMARY;
    }
  },

  // Clarifications
  async answerClarification(qId, answer) {
    try {
      const res = await client.post(`/api/clarifications/${qId}/answer`, { answer });
      return res.data;
    } catch {
      return { id: qId, status: "ANSWERED", answer };
    }
  }
};
