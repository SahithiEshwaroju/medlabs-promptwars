import React, { useState } from 'react';
import {
  FlaskConical,
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  FileText,
  Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, Card, Button, Modal, PageHeader, EmptyState } from '../components/common/UIComponents';
import SafetyBadge from '../components/SafetyBadge';

export const TestRequestsPage = () => {
  const {
    currentRole,
    currentPatient,
    testRequests,
    requestTest,
    updateTestRequestStatus
  } = useApp();

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState('Complete Blood Count (CBC)');
  const [urgency, setUrgency] = useState('ROUTINE');
  const [notes, setNotes] = useState('');

  // Scheduling modal for lab tech
  const [schedulingReq, setSchedulingReq] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-09-06 10:00 AM');

  const isPatient = currentRole === 'patient';
  const isLabTech = currentRole === 'lab_tech';

  // Filter requests: patients only see their own requests (Security/Privacy requirement)
  const displayedRequests = isPatient
    ? testRequests.filter(r => r.patient_id === currentPatient.id)
    : testRequests;

  const handleCreateRequest = (e) => {
    e.preventDefault();
    requestTest(selectedTestType, urgency, notes);
    setIsModalOpen(false);
    setNotes('');
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (schedulingReq) {
      updateTestRequestStatus(schedulingReq.id, 'SCHEDULED', scheduledDateTime);
      setSchedulingReq(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header with single clear primary action (Phase 6) */}
      <PageHeader
        title={isPatient ? "My Test Requests" : isLabTech ? "Laboratory Test Queue" : "Diagnostic Test Orders"}
        subtitle={
          isPatient
            ? "View your test orders, track sample collection, and request new tests."
            : "Review doctor and patient test orders, schedule appointments, and register sample intake."
        }
        primaryAction={
          isPatient ? (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Request a Test
            </Button>
          ) : isLabTech ? (
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/upload')}
            >
              Process Report
            </Button>
          ) : null
        }
      />

      <SafetyBadge />

      {/* Test Requests List */}
      {displayedRequests.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No test requests found"
          description={
            isPatient
              ? "You don't have any diagnostic test orders yet. Click below to request a test."
              : "No diagnostic tests are currently pending in the laboratory queue."
          }
          actionText={isPatient ? "Request a Test" : undefined}
          onAction={isPatient ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3.5">
          {displayedRequests.map((req) => {
            return (
              <Card key={req.id} className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {req.test_type}
                      </span>
                      <StatusBadge status={req.status} size="sm" />
                      {req.urgency === 'URGENT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          URGENT
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Patient: <strong>{req.patient_name || currentPatient.name}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Requested: {new Date(req.requested_at).toLocaleDateString()}
                      </span>
                      {req.scheduled_for && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            Scheduled: {req.scheduled_for}
                          </span>
                        </>
                      )}
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Actions based on role & status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Lab Technician state progression actions (Phase 29 Demo Flow) */}
                    {isLabTech && (
                      <>
                        {req.status === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateTestRequestStatus(req.id, 'ACCEPTED')}
                          >
                            Accept Request
                          </Button>
                        )}

                        {req.status === 'ACCEPTED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSchedulingReq(req)}
                          >
                            Schedule Test
                          </Button>
                        )}

                        {req.status === 'SCHEDULED' && (
                          <Button
                            variant="emerald"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => updateTestRequestStatus(req.id, 'SAMPLE_COLLECTED')}
                          >
                            Mark Sample Collected
                          </Button>
                        )}

                        {req.status === 'SAMPLE_COLLECTED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Upload}
                            onClick={() => {
                              updateTestRequestStatus(req.id, 'COMPLETED');
                              navigate('/upload');
                            }}
                          >
                            Upload CBC Report
                          </Button>
                        )}
                      </>
                    )}

                    {/* If completed, option to view document */}
                    {req.status === 'COMPLETED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FileText}
                        onClick={() => navigate('/evidence')}
                      >
                        View Results
                      </Button>
                    )}
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Patient Request Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request a Diagnostic Test"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Diagnostic Test
            </label>
            <select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
              <option value="Fasting Blood Glucose">Fasting Blood Glucose</option>
              <option value="Comprehensive Metabolic Panel (CMP)">Comprehensive Metabolic Panel (CMP)</option>
              <option value="Lipid Profile">Lipid Profile (Cholesterol, HDL, LDL)</option>
              <option value="Thyroid Function Test (TSH, T3, T4)">Thyroid Function Test (TSH, T3, T4)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Urgency Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                urgency === 'ROUTINE' ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="urgency"
                  checked={urgency === 'ROUTINE'}
                  onChange={() => setUrgency('ROUTINE')}
                />
                <span>Routine Checkup</span>
              </label>
              <label className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                urgency === 'URGENT' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="urgency"
                  checked={urgency === 'URGENT'}
                  onChange={() => setUrgency('URGENT')}
                />
                <span>Urgent Attention</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Symptoms (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monitoring fatigue and mild evening dizziness..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Submit Test Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lab Tech Schedule Modal */}
      <Modal
        isOpen={!!schedulingReq}
        onClose={() => setSchedulingReq(null)}
        title="Schedule Test Appointment"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scheduling sample collection for <strong>{schedulingReq?.test_type}</strong> ({schedulingReq?.patient_name}).
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date and Time
            </label>
            <input
              type="text"
              required
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              placeholder="YYYY-MM-DD HH:MM AM/PM"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSchedulingReq(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default TestRequestsPage;
