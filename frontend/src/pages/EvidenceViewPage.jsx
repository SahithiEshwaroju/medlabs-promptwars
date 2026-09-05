import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ProvenanceBadge from '../components/ProvenanceBadge';
import SafetyBadge from '../components/SafetyBadge';

export const EvidenceViewPage = () => {
  const {
    labResults,
    documents,
    openVerificationModal
  } = useApp();

  const [activeDocId, setActiveDocId] = useState(1);
  const [activePageNum, setActivePageNum] = useState(1);
  const [selectedLabId, setSelectedLabId] = useState(101); // Defaults to Hemoglobin

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
  const activeLab = labResults.find(l => l.id === selectedLabId) || labResults[0];

  // Document Text Simulation for Left Viewer
  const SAMPLE_PAGE_TEXTS = {
    "1-1": [
      "METROPOLIS CLINICAL DIAGNOSTICS LABORATORY",
      "NABH & NABL ACCREDITED LAB • ISO 15189:2022",
      "Patient ID: ML-10042   Name: Rahul Kumar   Age: 42 Yrs   Sex: Male",
      "Ref Clinician: Dr. Sarah Chen, MD",
      "Collection Date: 28-Aug-2026 08:30 AM    Reporting Date: 28-Aug-2026 02:45 PM",
      "Specimen: Whole Blood (EDTA) / Serum",
      "---------------------------------------------------------------------------------",
      "TEST NAME                        RESULT    UNITS       REFERENCE RANGE",
      "---------------------------------------------------------------------------------",
      "Haemoglobin                       11.2      g/dL        12.0 - 16.0",
      "Total Leucocyte Count (WBC)       7800      /uL         4000 - 11000",
      "Platelet Count                    240       x10^3/uL    150 - 450",
      "Fasting Blood Glucose             115       mg/dL       70 - 99",
      "Erythrocyte Sedimentation (ESR)   28        mm/hr       [Reference range not provided in source document]",
      "---------------------------------------------------------------------------------",
      "Remarks: Specimen processed on automated hematology analyzer Sysmex XN-1000.",
      "Page 1 of 2"
    ],
    "1-2": [
      "METROPOLIS CLINICAL DIAGNOSTICS LABORATORY",
      "Patient ID: ML-10042   Name: Rahul Kumar   Age: 42 Yrs",
      "Specimen: Serum Chemistry",
      "---------------------------------------------------------------------------------",
      "TEST NAME                        RESULT    UNITS       REFERENCE RANGE",
      "---------------------------------------------------------------------------------",
      "Serum Creatinine                  1.05      mg/dL       0.7 - 1.3",
      "Total Cholesterol                 215       mg/dL       < 200",
      "Serum Bilirubin Total             0.9       mg/dL       0.2 - 1.2",
      "---------------------------------------------------------------------------------",
      "Verified By: Dr. Sarah Chen, MD (Pathologist)",
      "Page 2 of 2"
    ],
    "3-1": [
      "CITY HEALTH CLINIC",
      "Dr. Alok Verma, MD (Internal Medicine) • Reg: MCI-49102",
      "Date: 02-Sep-2026",
      "Patient: Rahul Kumar (Age: 42, Male) • Patient ID: ML-10042",
      "Diagnosis: Acute Pharyngitis with upper respiratory symptoms",
      "---------------------------------------------------------------------------------",
      "Rx:",
      "1. Tab. Amoxicillin 500mg - 1 tab TDS for 5 days after food",
      "2. Tab. Paracetamol 650mg - 1 tab SOS for fever",
      "---------------------------------------------------------------------------------",
      "Advise: Adequate rest, warm hydration, review after 5 days if fever persists.",
      "Signature: Dr. A. Verma"
    ]
  };

  const pageKey = `${activeDocId}-${activePageNum}`;
  const currentLines = SAMPLE_PAGE_TEXTS[pageKey] || SAMPLE_PAGE_TEXTS["1-1"];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
            Side-by-Side Source & Structured Evidence Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Independently verify AI extractions directly against original source document text scans.
          </p>
        </div>

        {/* Document Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">Document:</span>
          <select
            value={activeDocId}
            onChange={(e) => {
              setActiveDocId(Number(e.target.value));
              setActivePageNum(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
          >
            {documents.map(d => (
              <option key={d.id} value={d.id}>{d.file_name}</option>
            ))}
          </select>
        </div>
      </div>

      <SafetyBadge />

      {/* Side-by-Side Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* LEFT PANEL: Original Document / Source Text Scan Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden">
          
          {/* Viewer Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-xs">
                {activeDoc.file_name}
              </span>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setActivePageNum(prev => Math.max(1, prev - 1))}
                disabled={activePageNum <= 1}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-medium text-slate-600 dark:text-slate-300 text-[11px]">
                Page {activePageNum} of {activeDoc.total_pages || 2}
              </span>
              <button
                onClick={() => setActivePageNum(prev => Math.min(activeDoc.total_pages || 2, prev + 1))}
                disabled={activePageNum >= (activeDoc.total_pages || 2)}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Content View (Simulated High-Fidelity OCR Scan) */}
          <div className="p-6 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[520px] space-y-1 bg-slate-950 text-slate-100 border-inner shadow-inner">
            <div className="text-[10px] text-slate-500 pb-2 border-b border-slate-800 flex justify-between">
              <span>SCAN ARTIFACT RENDER • OCR CONFIDENCE 96.4%</span>
              <span>PATIENT: RAHUL KUMAR</span>
            </div>

            {currentLines.map((line, idx) => {
              // Highlight line if it matches the selected lab test
              const isHighlighted = activeLab && (
                line.toLowerCase().includes(activeLab.test_name.toLowerCase()) ||
                (activeLab.test_name.includes("Hemoglobin") && line.toLowerCase().includes("haemoglobin")) ||
                (activeLab.test_name.includes("WBC") && line.toLowerCase().includes("leucocyte"))
              );

              return (
                <div
                  key={idx}
                  className={`py-0.5 px-2 rounded transition-all ${
                    isHighlighted
                      ? 'bg-amber-500/30 text-amber-200 border-l-4 border-amber-400 font-bold'
                      : 'hover:bg-slate-900'
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </div>

          {/* Viewer Footer */}
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Yellow highlighted row represents the currently selected clinical parameter.</span>
            </span>
            <span className="font-mono">NABL Accredited</span>
          </div>

        </div>

        {/* RIGHT PANEL: Structured Extracted Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden">
          
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Structured Laboratory Parameters
            </h3>
            <span className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full">
              {labResults.length} Metrics
            </span>
          </div>

          {/* Parameters List */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[520px]">
            {labResults.map(item => {
              const isSelected = activeLab && activeLab.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedLabId(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 dark:bg-sky-950/40 dark:border-sky-700 shadow-sm ring-2 ring-sky-500/20'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {item.test_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Page {item.source_page || 1} • {item.source_document}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'LOW'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : item.status === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : item.status === 'NORMAL'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Value & Reference Range */}
                  <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-base font-extrabold text-slate-900 dark:text-slate-50">
                        {item.value}
                      </span>
                      <span className="text-xs text-slate-500">{item.unit}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Explicit Source Range</span>
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.reference_range?.raw_text || "Not Provided"}
                      </span>
                    </div>
                  </div>

                  {/* Badges & Action */}
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <ConfidenceBadge confidence={item.confidence} />
                      <ProvenanceBadge provenance={item.provenance} />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openVerificationModal(item);
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 transition-all cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs flex items-center justify-between">
            <span className="text-slate-500">
              Selected parameter highlighted in real time
            </span>
            <button
              onClick={() => openVerificationModal(activeLab)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
            >
              Verify Selected Parameter
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default EvidenceViewPage;
