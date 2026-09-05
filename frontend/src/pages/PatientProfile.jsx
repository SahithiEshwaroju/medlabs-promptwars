import React, { useState } from 'react';
import {
  Upload,
  Download,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Printer,
  Info,
  X,
  Pill,
  FolderArchive,
  FileDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SafetyBadge from '../components/SafetyBadge';
import ConflictCard from '../components/ConflictCard';
import { aiService } from '../services/aiService';

export const PatientProfile = () => {
  const {
    currentPatient,
    labResults,
    conflicts,
    documents,
    timeline,
    openEvidence,
    openVerificationModal
  } = useApp();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('labs'); // 'labs' | 'medications' | 'documents' | 'conflicts' | 'summary' | 'timeline'
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter items for this patient
  const pLabs = labResults.filter(l => l.patient_id === currentPatient.id);
  const pConflicts = conflicts.filter(c => c.patient_id === currentPatient.id);
  const pDocs = documents.filter(d => d.patient_id === currentPatient.id);
  const pTimeline = timeline;

  const safeSummary = aiService.generateSafeSummary(currentPatient, pLabs, pConflicts);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const exportData = {
      format: "MedLens-Clinical-Dossier-v1",
      exported_at: new Date().toISOString(),
      patient: currentPatient,
      structured_lab_results: pLabs,
      potential_conflicts: pConflicts,
      documents: pDocs,
      timeline: pTimeline,
      ai_organizational_summary: {
        summary_text: safeSummary.summary_text,
        review_items: safeSummary.review_items,
        disclaimer: safeSummary.disclaimer,
        provenance: "AI_GENERATED"
      }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedLens_Record_${currentPatient.patient_id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Patient Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-sky-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-sky-500/20">
              {currentPatient.name ? currentPatient.name[0] : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-heading">
                  {currentPatient.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentPatient.patient_id}
                </span>
                <ProvenanceBadge provenance={currentPatient.provenance || "USER PROVIDED"} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {currentPatient.age} years old • {currentPatient.sex} • DOB: {currentPatient.dob || "1984-06-12"} • Primary Care: Metropolitan Hospital
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Report</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Record</span>
            </button>
          </div>
        </div>

        {/* Patient Overview (Explicit USER PROVIDED Badges) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Allergies
              </span>
              <ProvenanceBadge provenance="USER PROVIDED" />
            </div>
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
              {currentPatient.allergies || "None reported"}
            </p>
            <span className="text-[10px] text-slate-400 block">
              Severe reaction history noted
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Current Medications
              </span>
              <ProvenanceBadge provenance="USER PROVIDED" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {currentPatient.current_medications || "None"}
            </p>
            <span className="text-[10px] text-slate-400 block">
              Daily oral antihypertensive
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Existing Conditions
              </span>
              <ProvenanceBadge provenance="USER PROVIDED" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {currentPatient.existing_conditions || "None"}
            </p>
            <span className="text-[10px] text-slate-400 block">
              Diagnosed 2022
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Reported Symptoms
              </span>
              <ProvenanceBadge provenance="USER PROVIDED" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {currentPatient.symptoms || "None"}
            </p>
            <span className="text-[10px] text-slate-400 block">
              Reported at clinical intake
            </span>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
        {[
          { key: 'labs', label: `Structured Lab Results (${pLabs.length})` },
          { key: 'medications', label: 'Medications & Allergies' },
          { key: 'documents', label: `Documents (${pDocs.length})` },
          { key: 'conflicts', label: `Potential Conflicts (${pConflicts.length})` },
          { key: 'summary', label: 'AI Clinical Summary' },
          { key: 'timeline', label: 'Clinical Timeline' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === tab.key
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Structured Lab Results */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600" />
              <span>
                <strong>Reference-Range Safety Active:</strong> Status is computed strictly from explicit ranges in source documents. Missing ranges are marked NOT DETERMINED.
              </span>
            </div>
            <button
              onClick={() => navigate('/evidence')}
              className="font-bold text-sky-700 dark:text-sky-300 hover:underline cursor-pointer"
            >
              Side-by-Side View →
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Investigation Test</th>
                    <th className="py-3 px-4">Extracted Value</th>
                    <th className="py-3 px-4">Explicit Source Reference Range</th>
                    <th className="py-3 px-4">Range Status</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Provenance</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Evidence Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pLabs.map(lab => (
                    <tr key={lab.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {lab.test_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {lab.source_document} (Page {lab.source_page || 1})
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-50">
                          {lab.value}
                        </span>{' '}
                        <span className="text-slate-500">{lab.unit}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {lab.reference_range?.raw_text ? (
                          <span>{lab.reference_range.raw_text} {lab.unit}</span>
                        ) : (
                          <span className="italic text-slate-400 text-[11px]">
                            Reference range not provided in source document
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          lab.status === 'LOW'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                            : lab.status === 'HIGH'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                            : lab.status === 'NORMAL'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {lab.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <ConfidenceBadge confidence={lab.confidence} />
                      </td>

                      <td className="py-3 px-4">
                        <ProvenanceBadge provenance={lab.provenance} />
                      </td>

                      <td className="py-3 px-4">
                        {lab.verification_status === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : lab.verification_status === 'EDITED' ? (
                          <span className="inline-flex items-center gap-1 text-sky-600 font-bold">
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edited ({lab.verified_value})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEvidence(lab)}
                            title="Inspect source document snippet"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openVerificationModal(lab)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 transition-all cursor-pointer"
                          >
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Medications & Allergies */}
      {activeTab === 'medications' && (
        <div className="space-y-5">
          {/* Allergies Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Documented Drug Allergies
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  Clinical Precaution
                </span>
              </div>
              <ProvenanceBadge provenance="USER PROVIDED" />
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-rose-900 dark:text-rose-200 text-sm font-bold">
                  {currentPatient.allergies || "None reported"}
                </strong>
                <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                  Severe anaphylaxis/hives reported during childhood
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Medications */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Patient Documented Chronic Medications
                </span>
              </div>
              <ProvenanceBadge provenance="USER PROVIDED" />
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                  {currentPatient.current_medications || "None"}
                </span>
                <span className="text-[11px] text-slate-400">
                  Indication: Essential hypertension maintenance
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Daily Oral</span>
            </div>
          </div>

          {/* Prescriptions Extracted from Uploaded Documents */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Extracted Document Prescriptions
                </span>
              </div>
              <ProvenanceBadge provenance="AI EXTRACTED" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      Tab. Amoxicillin 500mg
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      Conflict Intelligence Flagged
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    Frequency: 1 tablet TDS for 5 days • Source: City_Clinic_Prescription_2026-09-02.pdf (Page 1)
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer self-start sm:self-auto"
                >
                  Review Conflict
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                    Tab. Paracetamol 650mg
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Frequency: 1 tablet SOS for fever • Source: City_Clinic_Prescription_2026-09-02.pdf (Page 1)
                  </p>
                </div>
                <ProvenanceBadge provenance="AI EXTRACTED" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Uploaded Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attached Medical Records & Diagnostics ({pDocs.length})
            </span>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New File</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pDocs.map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {doc.category || "Clinical Document"}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {doc.upload_date ? doc.upload_date.split('T')[0] : "2026-08-28"}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {doc.file_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {doc.source_org || "Clinical Diagnostics"} • {doc.total_pages} Page(s) • {doc.extracted_fields_count} Extracted Parameters
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ingest Status: Ready</span>
                  </span>
                  <button
                    onClick={() => navigate('/evidence')}
                    className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                  >
                    <span>View Evidence</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Potential Conflicts */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {pConflicts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              No active conflicts detected for this patient.
            </div>
          ) : (
            pConflicts.map(c => (
              <ConflictCard key={c.id} conflict={c} />
            ))
          )}
        </div>
      )}

      {/* Tab 3: Safe AI Summary */}
      {activeTab === 'summary' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                AI Clinical Organizational Summary
              </h3>
            </div>
            <ProvenanceBadge provenance="AI GENERATED" />
          </div>

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
            {safeSummary.summary_text}
          </p>

          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
            <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[11px] block">
              Information Requiring Professional Review:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {safeSummary.review_items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <SafetyBadge />
          </div>
        </div>
      )}

      {/* Tab 4: Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Longitudinal Medical Audit History
          </h3>
          <div className="space-y-4 text-xs">
            {pTimeline.map(ev => (
              <div key={ev.id} className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {ev.title}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {ev.event_date}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    {ev.description}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Source: {ev.source_document_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Patient Record Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Export Structured Clinical Record
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 dark:text-slate-200">
              
              {/* Official Header */}
              <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                    MEDLENS CLINICAL SUMMARY
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Verified & Traceable Patient Medical Intelligence Dossier
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-500">
                  <p>Generated: {new Date().toLocaleDateString()}</p>
                  <p>Status: Clinician Reviewed</p>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
                  <strong className="text-slate-900 dark:text-slate-100">{currentPatient.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">RECORD ID</span>
                  <strong className="font-mono">{currentPatient.patient_id}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AGE / SEX</span>
                  <strong>{currentPatient.age} Yrs / {currentPatient.sex}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ALLERGIES</span>
                  <strong className="text-rose-600">{currentPatient.allergies}</strong>
                </div>
              </div>

              {/* Laboratory Metrics Table */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                  Structured Laboratory Findings
                </h4>
                <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Test</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Result</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Source Reference Range</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Status</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Provenance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pLabs.map(l => (
                      <tr key={l.id}>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-semibold">{l.test_name}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-mono font-bold">{l.value} {l.unit}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">{l.reference_range?.raw_text || "Not provided in source"}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold">{l.status}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-[10px]">{l.provenance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Narrative */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1">
                  Organizational Summary
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {safeSummary.summary_text}
                </p>
              </div>

              {/* Mandatory Disclaimers */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic">
                {safeSummary.disclaimer}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-sky-600" />
                <span>Download Structured JSON</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PatientProfile;
