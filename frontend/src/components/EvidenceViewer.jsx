import React from 'react';
import { X, FileText, CheckCircle, Edit3 } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';
import ProvenanceBadge from './ProvenanceBadge';
import { useApp } from '../context/AppContext';

export const EvidenceViewer = ({ item, onClose, onVerify, onEdit }) => {
  const { openVerificationModal } = useApp();

  if (!item) return null;

  const handleVerifyClick = () => {
    if (onVerify) {
      onVerify(item);
    } else {
      openVerificationModal(item);
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(item);
    } else {
      openVerificationModal(item);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Source Document Evidence Link
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifiable clinical trace linking structured output to original source text
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main Metric Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Extracted Clinical Parameter
              </span>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {item.test_name}
              </h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                  {item.value !== null && item.value !== undefined ? item.value : "—"}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {item.unit}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                item.status === 'LOW'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                  : item.status === 'HIGH'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                  : item.status === 'NORMAL'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}>
                {item.status}
              </span>
              <div className="flex items-center gap-1.5">
                <ConfidenceBadge confidence={item.confidence || 0.95} />
                <ProvenanceBadge provenance={item.provenance} />
              </div>
            </div>
          </div>

          {/* Reference Range Notice */}
          <div className="p-3.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-xs">
            <span className="font-semibold text-sky-950 dark:text-sky-200">
              Source Reference Range:
            </span>{' '}
            <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
              {item.reference_range?.raw_text
                ? `${item.reference_range.raw_text} ${item.unit || ''}`
                : "Reference range not provided in source document."}
            </span>
          </div>

          {/* Exact Evidence Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Source Document Snippet
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-slate-600 dark:text-slate-400">
                Page {item.source_page || 1} • {item.source_document || "Report.pdf"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800 shadow-inner relative overflow-hidden group">
              <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-sans tracking-wide">
                RAW OCR EXTRACT
              </div>
              <p className="bg-amber-400/20 text-amber-200 px-2 py-1 -mx-2 rounded border-l-2 border-amber-400">
                {item.source_text || `Haemoglobin: ${item.value} ${item.unit} | Reference Range: ${item.reference_range?.raw_text || 'None'}`}
              </p>
            </div>
          </div>

          {/* Audit History (if available) */}
          {item.audit_logs && item.audit_logs.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Audit Trail:
              </span>
              {item.audit_logs.map((log, idx) => (
                <div key={idx} className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{log.action}: changed from "{log.original_value}" to "{log.new_value}" by {log.verifier}</span>
                  <span className="text-[11px] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            Clicking Verify marks this field as Clinician Verified
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Value</span>
            </button>

            <button
              onClick={handleVerifyClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verify Field</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EvidenceViewer;
