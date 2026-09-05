import React from 'react';
import { AlertTriangle, FileText, User, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConflictCard = ({ conflict }) => {
  const { resolveConflict } = useApp();

  if (!conflict) return null;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      conflict.resolved
        ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 opacity-75'
        : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60 shadow-sm'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            conflict.resolved
              ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Potential Record Conflict
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discrepancy identified between documented medical history and recent report
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          conflict.resolved
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
        }`}>
          {conflict.resolved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Resolved</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>Needs Professional Review</span>
            </>
          )}
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-2 md:pb-0 md:pr-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>Documented Patient Allergy:</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {conflict.user_statement}
          </p>
          <p className="text-[11px] text-slate-400">
            Source: {conflict.user_source || "Patient Profile (USER_PROVIDED)"}
          </p>
        </div>

        <div className="space-y-1 pt-2 md:pt-0 md:pl-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Medication Mentioned in Report:</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {conflict.document_statement}
          </p>
          <p className="text-[11px] text-slate-400">
            Source: {conflict.document_source || conflict.source_document_name}
          </p>
        </div>
      </div>

      {/* Safety Notice & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-xs">
        <p className="text-slate-500 dark:text-slate-400 italic flex-1">
          {conflict.disclaimer || "Potential record conflict — professional review required. These records contain potentially inconsistent information."}
        </p>

        {!conflict.resolved ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => dismissConflict ? dismissConflict(conflict.id, "Dismissed — Clinician verified no patient harm") : resolveConflict(conflict.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => resolveConflict(conflict.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              Mark Reviewed
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {conflict.status || "Clinically Reviewed"}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConflictCard;
