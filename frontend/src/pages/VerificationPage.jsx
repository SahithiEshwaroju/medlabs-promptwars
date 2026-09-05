import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Edit3,
  History,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ProvenanceBadge from '../components/ProvenanceBadge';
import SafetyBadge from '../components/SafetyBadge';

export const VerificationPage = () => {
  const {
    labResults,
    verifyLabResult,
    openVerificationModal,
    openEvidence,
    user
  } = useApp();

  const [filterMode, setFilterMode] = useState('PENDING'); // 'PENDING' | 'VERIFIED' | 'LOW_CONFIDENCE' | 'ALL'

  const filteredItems = labResults.filter(item => {
    if (filterMode === 'PENDING') return item.verification_status === 'PENDING';
    if (filterMode === 'VERIFIED') return item.verification_status === 'VERIFIED' || item.verification_status === 'EDITED';
    if (filterMode === 'LOW_CONFIDENCE') return item.confidence < 0.90;
    return true;
  });

  const pendingCount = labResults.filter(r => r.verification_status === 'PENDING').length;
  const verifiedCount = labResults.filter(r => r.verification_status === 'VERIFIED' || r.verification_status === 'EDITED').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              Clinician Verification Queue
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Human clinician oversight workspace. Sign off, edit, or reject AI-extracted parameters while permanently logging audit trails.
          </p>
        </div>

        {/* Quick batch verify action */}
        {pendingCount > 0 && (
          <button
            onClick={() => {
              filteredItems.forEach(item => {
                if (item.verification_status === 'PENDING') {
                  verifyLabResult(item.id, 'VERIFIED', null, user.name);
                }
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Verify All Filtered Items</span>
          </button>
        )}
      </div>

      <SafetyBadge />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { key: 'PENDING', label: `Pending Verification (${pendingCount})` },
          { key: 'VERIFIED', label: `Verified / Edited (${verifiedCount})` },
          { key: 'LOW_CONFIDENCE', label: 'Low Confidence (<90%)' },
          { key: 'ALL', label: `All Items (${labResults.length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterMode(tab.key)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              filterMode === tab.key
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Verification Cards Feed */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            No items in this queue
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All clinical extractions in this category have been processed or no items matched your filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.verification_status === 'VERIFIED'
                  ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-950/60'
                  : item.verification_status === 'EDITED'
                  ? 'bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-950/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {item.test_name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                    <ConfidenceBadge confidence={item.confidence} />
                    <ProvenanceBadge provenance={item.provenance} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>Source: <strong>{item.source_document}</strong> (Page {item.source_page || 1})</span>
                    <span>•</span>
                    <span>Explicit Source Range: <strong className="font-mono text-slate-800 dark:text-slate-200">{item.reference_range?.raw_text || "Not Provided in Document"}</strong></span>
                  </div>

                  {/* Evidence snippet */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold mb-0.5">
                      Source Document Extraction Evidence:
                    </span>
                    "{item.source_text || `${item.test_name}: ${item.value} ${item.unit}`}"
                  </div>

                  {/* Audit Logs (if edited or verified) */}
                  {item.audit_logs && item.audit_logs.length > 0 && (
                    <div className="p-2.5 bg-sky-50/50 dark:bg-sky-950/30 rounded-lg border border-sky-100 dark:border-sky-900/40 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-sky-900 dark:text-sky-300">
                        <History className="w-3.5 h-3.5" />
                        <span>Audit Log:</span>
                      </div>
                      {item.audit_logs.map((log, i) => (
                        <p key={i} className="text-slate-600 dark:text-slate-400">
                          {log.action}: original AI value <strong>"{log.original_value}"</strong> → verified value <strong>"{log.new_value}"</strong> by {log.verifier} at {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Value & Actions */}
                <div className="flex flex-col items-end justify-between gap-4 shrink-0 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Active Clinical Value
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-50 font-mono">
                      {item.value} <span className="text-sm font-semibold text-slate-500">{item.unit}</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                      Status: {item.verification_status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEvidence(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      View Source
                    </button>

                    <button
                      onClick={() => openVerificationModal(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => verifyLabResult(item.id, 'VERIFIED', null, user.name)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default VerificationPage;
