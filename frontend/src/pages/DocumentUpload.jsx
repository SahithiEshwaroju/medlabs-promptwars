import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ocrExtractor, EXTRACTION_STAGES } from '../services/ocrExtractor';
import { conflictDetector } from '../services/conflictDetector';
import SafetyBadge from '../components/SafetyBadge';

export const DocumentUpload = () => {
  const { currentPatient, addDocumentAndResults } = useApp();
  const navigate = useNavigate();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [extractedPreview, setExtractedPreview] = useState(null);

  // Pre-loaded sample reports for 1-click hackathon evaluation
  const SAMPLE_REPORTS = [
    {
      title: "Metropolis Complete Blood Count (CBC)",
      fileName: "Metropolis_Complete_Blood_Count_2026-08-28.pdf",
      desc: "2-page laboratory scan with Hemoglobin, WBC, Glucose, and unreferenced ESR.",
      type: "Lab Report"
    },
    {
      title: "City Health Clinic Prescription",
      fileName: "City_Clinic_Prescription_2026-09-02.pdf",
      desc: "Prescription containing Amoxicillin 500mg, testing conflict intelligence against Penicillin allergy.",
      type: "Prescription"
    }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      startProcessing(e.target.files[0]);
    }
  };

  const handleSampleSelect = (sample) => {
    const fakeFile = new File(["sample content"], sample.fileName, { type: "application/pdf" });
    startProcessing(fakeFile);
  };

  const startProcessing = async (file) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setProgressPercent(0);

    try {
      const result = await ocrExtractor.extractFromFile(file, (stage, pct) => {
        setCurrentStage(stage);
        setProgressPercent(Math.round(pct * 100));
      });

      // Detect any conflicts with current patient
      const detectedConflicts = conflictDetector.detectConflicts(
        currentPatient,
        result.medications || [],
        file.name
      );

      setExtractedPreview({
        result,
        conflicts: detectedConflicts
      });

      // Add to global state so it appears in verification queue & timeline
      addDocumentAndResults(result, result.lab_results || [], detectedConflicts);

    } catch (err) {
      console.error("Extraction error", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
          Document Intake & OCR Extraction Pipeline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Target Patient: <strong className="text-slate-800 dark:text-slate-200">{currentPatient.name} ({currentPatient.patient_id})</strong> • Accepts PDF, PNG, JPG, JPEG
        </p>
      </div>

      <SafetyBadge />

      {/* Main Upload or Processing View */}
      {!extractedPreview ? (
        <div className="space-y-6">
          
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-10 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              className="hidden"
              onChange={handleFileInput}
              disabled={isProcessing}
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="font-bold text-base text-slate-800 dark:text-slate-100">
                  {isProcessing ? "Processing Document..." : "Drag & drop clinical report, or browse"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  PDF, Scanned PNG, JPG up to 25MB • Automated reference-range extraction
                </p>
              </div>
            </label>
          </div>

          {/* Processing Animation & Stepper */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 animate-pulse" />
                  <span>{currentStage ? currentStage.label : "Initializing Pipeline..."}</span>
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-sky-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Multi-stage Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                {EXTRACTION_STAGES.map((st, idx) => {
                  const stageIndex = EXTRACTION_STAGES.findIndex(s => s.key === currentStage?.key);
                  const isDone = stageIndex > idx;
                  const isCurrent = stageIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                          : isCurrent
                          ? 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-200 font-bold animate-pulse'
                          : 'bg-slate-50 border-slate-200/60 text-slate-400 dark:bg-slate-800/40 dark:border-slate-800'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{st.label.replace('...', '')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick 1-Click Evaluation Reports */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1-Click Evaluation Clinical Documents
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_REPORTS.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSampleSelect(sample)}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                        {sample.type}
                      </span>
                      <span className="text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                        Run Pipeline →
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition-colors">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {sample.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Extraction Complete Summary */
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                  Extraction & Reference-Range Structuring Complete
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                  Processed <strong>{selectedFile?.name || "Uploaded_Document.pdf"}</strong>. Results have been incorporated into Rahul Kumar's dossier.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setExtractedPreview(null);
                setSelectedFile(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Upload Another
            </button>
          </div>

          {/* Quick Extracted Parameters Preview */}
          {extractedPreview.result?.lab_results?.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Extracted Structured Parameters ({extractedPreview.result.lab_results.length})
                </h4>
                <button
                  onClick={() => navigate('/verification')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  Open Verification Workspace →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {extractedPreview.result.lab_results.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{r.test_name}</span>
                      <span className="text-[11px] text-slate-400">Ref: {r.reference_range?.raw_text || "None provided"}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-sm block">{r.value} {r.unit}</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        r.status === 'LOW' ? 'text-amber-600' : r.status === 'HIGH' ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts Preview */}
          {extractedPreview.conflicts?.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-rose-600 block">
                Conflict Intelligence Flagged
              </span>
              {extractedPreview.conflicts.map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{c.title}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    Patient allergy: <strong>{c.user_statement}</strong> vs Prescribed: <strong>{c.document_statement}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    {c.disclaimer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => navigate('/evidence')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Side-by-Side Evidence Viewer
            </button>
            <button
              onClick={() => navigate('/verification')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
            >
              Proceed to Clinician Verification Queue
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default DocumentUpload;
