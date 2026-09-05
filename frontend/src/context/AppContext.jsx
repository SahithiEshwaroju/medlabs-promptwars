import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEMO_PATIENTS,
  DEMO_DOCUMENTS,
  DEMO_LAB_RESULTS,
  DEMO_CONFLICTS,
  DEMO_TIMELINE,
  DEMO_COMPARISONS,
  DEMO_CLARIFICATIONS,
  DEMO_ROLES,
  DEMO_TEST_REQUESTS,
  DEMO_SAMPLES,
  DEMO_AUDIT_LOGS
} from '../services/demoData';
import { api } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('medlens_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('medlens_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Backend connectivity tracking with visibility check (Efficiency - Phase 10)
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      // Pause polling if tab is in background to save CPU and network bandwidth
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      try {
        const res = await api.checkHealth();
        if (isMounted) {
          setBackendOnline(res.online);
        }
      } catch {
        if (isMounted) {
          setBackendOnline(false);
        }
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 15000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkApi();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Current active role: 'patient' | 'doctor' | 'lab_tech' | 'admin' | 'guest'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('medlens_current_role') || 'doctor';
  });

  // Auth User & Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('medlens_auth') !== 'false';
  });

  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem('medlens_current_role') || 'doctor';
    const roleConfig = DEMO_ROLES[savedRole] || DEMO_ROLES.doctor;
    return {
      name: roleConfig.name,
      role: roleConfig.role,
      email: roleConfig.email,
      hospital: roleConfig.hospital || "Metropolitan Academic Medical Center",
      patientId: roleConfig.patientId
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Switch role seamlessly (Phase 4 & 5)
  const switchRole = (roleKey) => {
    if (roleKey === 'guest') {
      setUser({
        name: "Guest Explorer",
        role: "Guest",
        email: "guest@medlens.org",
        hospital: "Public Evaluation Mode"
      });
      setCurrentRole('guest');
      setIsAuthenticated(false);
      localStorage.setItem('medlens_auth', 'false');
      localStorage.setItem('medlens_current_role', 'guest');
      return;
    }

    const roleConfig = DEMO_ROLES[roleKey];
    if (roleConfig) {
      setUser({
        name: roleConfig.name,
        role: roleConfig.role,
        email: roleConfig.email,
        hospital: roleConfig.hospital || "Metropolitan Academic Medical Center",
        patientId: roleConfig.patientId
      });
      setCurrentRole(roleKey);
      setIsAuthenticated(true);
      localStorage.setItem('medlens_auth', 'true');
      localStorage.setItem('medlens_current_role', roleKey);

      if (roleKey === 'patient') {
        setCurrentPatientId(1); // Rahul Kumar
      }
    }
  };

  const login = (email, role = "Lead Clinician", _name = "Dr. Sarah Chen, MD") => {
    // Determine closest role key
    let matchedKey = 'doctor';
    const rLower = role.toLowerCase();
    if (rLower.includes('patient') || email.toLowerCase().includes('rahul')) {
      matchedKey = 'patient';
    } else if (rLower.includes('lab') || rLower.includes('technician') || email.toLowerCase().includes('rivera')) {
      matchedKey = 'lab_tech';
    } else if (rLower.includes('admin')) {
      matchedKey = 'admin';
    }

    switchRole(matchedKey);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('medlens_auth', 'false');
    switchRole('guest');
  };

  // Demo Mode indicator
  const [demoMode, setDemoMode] = useState(true);

  // Core Clinical State
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('medlens_patients');
    return saved ? JSON.parse(saved) : DEMO_PATIENTS;
  });

  const [currentPatientId, setCurrentPatientId] = useState(1); // Rahul Kumar

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('medlens_documents');
    return saved ? JSON.parse(saved) : DEMO_DOCUMENTS;
  });

  const [labResults, setLabResults] = useState(() => {
    const saved = localStorage.getItem('medlens_lab_results');
    return saved ? JSON.parse(saved) : DEMO_LAB_RESULTS;
  });

  const [conflicts, setConflicts] = useState(() => {
    const saved = localStorage.getItem('medlens_conflicts');
    return saved ? JSON.parse(saved) : DEMO_CONFLICTS;
  });

  const [timeline, setTimeline] = useState(() => {
    const saved = localStorage.getItem('medlens_timeline');
    return saved ? JSON.parse(saved) : DEMO_TIMELINE;
  });

  const [comparisons, setComparisons] = useState(() => {
    const saved = localStorage.getItem('medlens_comparisons');
    return saved ? JSON.parse(saved) : DEMO_COMPARISONS;
  });

  const [clarifications, setClarifications] = useState(() => {
    const saved = localStorage.getItem('medlens_clarifications');
    return saved ? JSON.parse(saved) : DEMO_CLARIFICATIONS;
  });

  // Test Requests (Phase 5, 6, 29)
  const [testRequests, setTestRequests] = useState(() => {
    const saved = localStorage.getItem('medlens_test_requests');
    return saved ? JSON.parse(saved) : DEMO_TEST_REQUESTS;
  });

  // Samples (Phase 5)
  const [samples, setSamples] = useState(() => {
    const saved = localStorage.getItem('medlens_samples');
    return saved ? JSON.parse(saved) : DEMO_SAMPLES;
  });

  // Audit Logs (Phase 8 & 9)
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('medlens_audit_logs');
    return saved ? JSON.parse(saved) : DEMO_AUDIT_LOGS;
  });

  // UI Modals & Inspections
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifyingItem, setVerifyingItem] = useState(null);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Save to localStorage when modified
  useEffect(() => {
    localStorage.setItem('medlens_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('medlens_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('medlens_lab_results', JSON.stringify(labResults));
  }, [labResults]);

  useEffect(() => {
    localStorage.setItem('medlens_conflicts', JSON.stringify(conflicts));
  }, [conflicts]);

  useEffect(() => {
    localStorage.setItem('medlens_timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem('medlens_test_requests', JSON.stringify(testRequests));
  }, [testRequests]);

  useEffect(() => {
    localStorage.setItem('medlens_samples', JSON.stringify(samples));
  }, [samples]);

  useEffect(() => {
    localStorage.setItem('medlens_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Current Patient helper
  const currentPatient = patients.find(p => p.id === currentPatientId) || patients[0];

  // Actions
  const selectPatient = (id) => {
    setCurrentPatientId(Number(id));
  };

  const addPatient = (newPatient) => {
    const pId = patients.length + 1;
    const formatted = {
      id: pId,
      patient_id: `ML-100${pId + 41}`,
      documents_count: 0,
      pending_verifications: 0,
      conflicts_count: 0,
      provenance: "USER_PROVIDED",
      created_at: new Date().toISOString(),
      ...newPatient
    };
    setPatients(prev => [formatted, ...prev]);
    setCurrentPatientId(pId);
    return formatted;
  };

  const updatePatient = (id, updatedFields) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const verifyLabResult = (resultId, action = "VERIFIED", editedValue = null, verifierName = user.name) => {
    setLabResults(prev => prev.map(item => {
      if (item.id === resultId) {
        const originalVal = item.value;
        const finalVal = editedValue !== null ? parseFloat(editedValue) || editedValue : item.value;
        const newLog = {
          action,
          original_value: String(originalVal),
          new_value: String(finalVal),
          verifier: verifierName,
          timestamp: new Date().toISOString()
        };

        return {
          ...item,
          value: finalVal,
          verification_status: action,
          provenance: "HUMAN_VERIFIED",
          verified_by: verifierName,
          verified_value: String(finalVal),
          verified_at: new Date().toISOString(),
          audit_logs: [...(item.audit_logs || []), newLog]
        };
      }
      return item;
    }));

    // Add event to timeline
    const targetItem = labResults.find(l => l.id === resultId);
    if (targetItem) {
      const tEvent = {
        id: Date.now(),
        event_date: new Date().toISOString().split('T')[0],
        event_type: "VERIFICATION",
        category: "Verification",
        title: `${targetItem.test_name} ${action.toLowerCase()} by clinician`,
        description: `Verified by ${verifierName}. ${action === 'EDITED' ? `Edited value to ${editedValue}` : 'Confirmed exact value.'}`,
        source_document_name: targetItem.source_document,
        badge_color: action === 'REJECTED' ? 'rose' : 'emerald'
      };
      setTimeline(prev => [tEvent, ...prev]);

      // System audit log
      const auditEntry = {
        id: `AUD-${Date.now()}`,
        user_name: verifierName,
        user_role: user.role,
        action: `VERIFY_${action}`,
        resource_type: "LabResult",
        resource_id: targetItem.test_name,
        details: `${action}: changed from "${targetItem.value}" to "${editedValue || targetItem.value}"`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS"
      };
      setAuditLogs(prev => [auditEntry, ...prev]);
    }
  };

  const addDocumentAndResults = (docData, newLabResults = [], newConflicts = []) => {
    const newDocId = documents.length + 1;
    const docObj = {
      id: newDocId,
      patient_id: currentPatient.id,
      file_name: docData.fileName || "Uploaded_Report.pdf",
      file_type: "application/pdf",
      file_size: 215000,
      upload_date: new Date().toISOString(),
      status: "Ready",
      total_pages: 1,
      extracted_fields_count: newLabResults.length,
      verified_fields_count: 0,
      category: docData.documentType || "Lab Report",
      source_org: "Clinician Ingest Pipeline"
    };

    setDocuments(prev => [docObj, ...prev]);

    if (newLabResults.length > 0) {
      const taggedLabs = newLabResults.map(lab => ({
        ...lab,
        patient_id: currentPatient.id,
        document_id: newDocId,
        source_document: docObj.file_name,
        audit_logs: []
      }));
      setLabResults(prev => [...taggedLabs, ...prev]);
    }

    if (newConflicts.length > 0) {
      setConflicts(prev => [...newConflicts, ...prev]);
    }

    // Timeline event
    const uploadEvent = {
      id: Date.now(),
      event_date: new Date().toISOString().split('T')[0],
      event_type: "DOCUMENT_UPLOAD",
      category: "Reports",
      title: `${docObj.file_name} Uploaded`,
      description: `Ingested ${docObj.file_name} with ${newLabResults.length} extracted parameters.`,
      source_document_name: docObj.file_name,
      badge_color: "blue"
    };
    setTimeline(prev => [uploadEvent, ...prev]);

    // Audit log
    const audit = {
      id: `AUD-${Date.now()}`,
      user_name: user.name,
      user_role: user.role,
      action: "UPLOAD_REPORT",
      resource_type: "Document",
      resource_id: docObj.file_name,
      details: `Uploaded and processed ${docObj.file_name} for patient ${currentPatient.name}.`,
      timestamp: new Date().toISOString(),
      status: "SUCCESS"
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Test Request creation & status management (Phase 5, 29)
  const requestTest = (testType = "Complete Blood Count (CBC)", urgency = "ROUTINE", notes = "") => {
    const newReq = {
      id: Date.now(),
      patient_id: currentPatient.id,
      patient_name: currentPatient.name,
      test_type: testType,
      urgency,
      status: "PENDING",
      notes: notes || "Diagnostic evaluation requested.",
      requested_at: new Date().toISOString(),
      scheduled_for: null,
      sample_collected_at: null,
      completed_at: null,
      report_file: null
    };

    setTestRequests(prev => [newReq, ...prev]);

    // Timeline event
    const tEvent = {
      id: Date.now() + 1,
      event_date: new Date().toISOString().split('T')[0],
      event_type: "TEST_REQUEST",
      category: "Lab Results",
      title: `Test Requested: ${testType}`,
      description: `${currentPatient.name} requested ${testType} (${urgency}). Forwarded to Laboratory.`,
      source_document_name: "Test Order Form",
      badge_color: "sky"
    };
    setTimeline(prev => [tEvent, ...prev]);

    // Audit log
    const audit = {
      id: `AUD-${Date.now()}`,
      user_name: user.name,
      user_role: user.role,
      action: "REQUEST_TEST",
      resource_type: "TestRequest",
      resource_id: testType,
      details: `Placed diagnostic test request for ${testType} (${urgency}).`,
      timestamp: new Date().toISOString(),
      status: "SUCCESS"
    };
    setAuditLogs(prev => [audit, ...prev]);

    return newReq;
  };

  const updateTestRequestStatus = (requestId, newStatus, scheduledFor = null, notes = null) => {
    setTestRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = { ...req, status: newStatus };
        if (newStatus === 'SCHEDULED' && scheduledFor) {
          updated.scheduled_for = scheduledFor;
        } else if (newStatus === 'SAMPLE_COLLECTED') {
          updated.sample_collected_at = new Date().toISOString();
        } else if (newStatus === 'COMPLETED') {
          updated.completed_at = new Date().toISOString();
        }
        if (notes) updated.notes = notes;
        return updated;
      }
      return req;
    }));

    const target = testRequests.find(r => r.id === requestId);
    if (target) {
      const tEvent = {
        id: Date.now(),
        event_date: new Date().toISOString().split('T')[0],
        event_type: "TEST_STATUS_UPDATE",
        category: "Lab Results",
        title: `${target.test_type} → ${newStatus.replace('_', ' ').toLowerCase()}`,
        description: `Laboratory updated status to ${newStatus.replace('_', ' ').toLowerCase()}.`,
        source_document_name: "Laboratory System",
        badge_color: "emerald"
      };
      setTimeline(prev => [tEvent, ...prev]);
    }
  };

  const resolveConflict = (conflictId) => {
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, resolved: true, status: "Resolved by Clinician" } : c));
  };

  const dismissConflict = (conflictId, reason = "Dismissed after clinician review") => {
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, resolved: true, status: reason } : c));
  };

  const answerClarification = (qId, answer) => {
    setClarifications(prev => prev.map(q => q.id === qId ? { ...q, status: "ANSWERED", selectedAnswer: answer } : q));
    if (backendOnline) {
      api.answerClarification(qId, answer).catch(() => {});
    }
  };

  const resetDemoData = () => {
    setPatients(DEMO_PATIENTS);
    setCurrentPatientId(1);
    setDocuments(DEMO_DOCUMENTS);
    setLabResults(DEMO_LAB_RESULTS);
    setConflicts(DEMO_CONFLICTS);
    setTimeline(DEMO_TIMELINE);
    setComparisons(DEMO_COMPARISONS);
    setClarifications(DEMO_CLARIFICATIONS);
    setTestRequests(DEMO_TEST_REQUESTS);
    setSamples(DEMO_SAMPLES);
    setAuditLogs(DEMO_AUDIT_LOGS);

    localStorage.removeItem('medlens_patients');
    localStorage.removeItem('medlens_documents');
    localStorage.removeItem('medlens_lab_results');
    localStorage.removeItem('medlens_conflicts');
    localStorage.removeItem('medlens_timeline');
    localStorage.removeItem('medlens_comparisons');
    localStorage.removeItem('medlens_clarifications');
    localStorage.removeItem('medlens_test_requests');
    localStorage.removeItem('medlens_samples');
    localStorage.removeItem('medlens_audit_logs');
  };

  const openEvidence = (item) => {
    setSelectedEvidenceItem(item);
  };

  const closeEvidence = () => {
    setSelectedEvidenceItem(null);
  };

  const openVerificationModal = (item) => {
    setVerifyingItem(item);
    setIsVerificationModalOpen(true);
  };

  const closeVerificationModal = () => {
    setVerifyingItem(null);
    setIsVerificationModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        setUser,
        currentRole,
        switchRole,
        isAuthenticated,
        login,
        logout,
        backendOnline,
        isAuthModalOpen,
        setIsAuthModalOpen,
        demoMode,
        setDemoMode,
        patients,
        currentPatient,
        currentPatientId,
        selectPatient,
        addPatient,
        updatePatient,
        documents,
        labResults,
        conflicts,
        timeline,
        comparisons,
        clarifications,
        testRequests,
        requestTest,
        updateTestRequestStatus,
        samples,
        auditLogs,
        verifyLabResult,
        addDocumentAndResults,
        resolveConflict,
        dismissConflict,
        answerClarification,
        resetDemoData,
        selectedEvidenceItem,
        openEvidence,
        closeEvidence,
        isVerificationModalOpen,
        verifyingItem,
        openVerificationModal,
        closeVerificationModal,
        isClarificationModalOpen,
        setIsClarificationModalOpen,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
