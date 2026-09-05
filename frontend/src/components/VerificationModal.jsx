import React, { useState } from 'react';
import { X, CheckCircle, Edit3, XCircle, AlertCircle, History, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfidenceBadge from './ConfidenceBadge';
import ProvenanceBadge from './ProvenanceBadge';

export const VerificationModal = () => {
  const {
    isVerificationModalOpen,
    verifyingItem,
    closeVerificationModal,
    verifyLabResult,
    user
  } = useApp();

  const [mode, setMode] = useState('review'); // 'review' | 'edit'
  const [editedValue, setEditedValue] = useState('');
  const [editReason, setEditReason] = useState('Manual transcription correction');

  if (!isVerificationModalOpen || !verifyingItem) return null;

  const originalValue = verifyingItem.value;

  const handleVerify = () => {
    verifyLabResult(verifyingItem.id, 'VERIFIED', null, user.name);
    closeVerificationModal();
  };

  const handleReject = () => {
    verifyLabResult(verifyingItem.id, 'REJECTED', originalValue, user.name);
    closeVerificationModal();
  };

  const handleConfirmEdit = (e) => {
    e.preventDefault();
    if (!editedValue.trim()) return;
    verifyLabResult(verifyingItem.id, 'EDITED', editedValue.trim(), user.name);
    closeVerificationModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Human Clinician Verification Workspace
            </h3>
          </div>
          <button
            onClick={closeVerificationModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Clinical Target
              </p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {verifyingItem.test_name}
              </h4>
              <p className="text-xs text-slate-400">
                Source: {verifyingItem.source_document || "Metropolis CBC Report"} • Page {verifyingItem.source_page || 1}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <ConfidenceBadge confidence={verifyingItem.confidence} />
              <ProvenanceBadge provenance={verifyingItem.provenance} />
            </div>
          </div>

          {/* Raw OCR snippet */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-semibold text-slate-500 block mb-1">
              Source Extraction Context:
            </span>
            <code className="text-sky-700 dark:text-sky-300 font-mono">
              "{verifyingItem.source_text || `${verifyingItem.test_name}: ${verifyingItem.value} ${verifyingItem.unit}`}"
            </code>
          </div>

          {/* Original Value Display */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">
                Original AI Extracted Value:
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                {originalValue} {verifyingItem.unit}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">
                Explicit Source Range:
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {verifyingItem.reference_range?.raw_text || "Not provided in source"}
              </span>
            </div>
          </div>

          {mode === 'edit' ? (
            <form onSubmit={handleConfirmEdit} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Audit Protection: The original AI value ({originalValue}) will be permanently preserved in the clinical audit trail.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corrected Numerical / Text Value ({verifyingItem.unit})
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${originalValue}`}
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Human Edit
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('review')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
                >
                  Save Human Edit & Audit Log
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <History className="w-3.5 h-3.5" />
                <span>Sign-off Clinician: <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Review mode) */}
        {mode === 'review' && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleReject}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Field</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditedValue(String(originalValue));
                  setMode('edit');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Value</span>
              </button>

              <button
                onClick={handleVerify}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify Exactly as Extracted</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerificationModal;
