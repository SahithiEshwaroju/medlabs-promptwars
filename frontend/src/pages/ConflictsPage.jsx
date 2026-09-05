import React from 'react';
import {
  CheckCircle2,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConflictCard from '../components/ConflictCard';
import SafetyBadge from '../components/SafetyBadge';

export const ConflictsPage = () => {
  const { conflicts, currentPatient } = useApp();

  const unresolved = conflicts.filter(c => !c.resolved);
  const resolved = conflicts.filter(c => c.resolved);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              Clinical Conflict Intelligence Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {unresolved.length} Unresolved
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cross-checks patient profile data (intake history, documented allergies) against newly ingested prescriptions and reports.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-400">
          Target: {currentPatient.name}
        </span>
      </div>

      <SafetyBadge />

      {/* Safety Notice specifically explaining Conflict Intelligence */}
      <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-xs text-sky-950 dark:text-sky-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Guardrail Specification:</strong> MedLens only detects and surfaces record discrepancies for clinical review. It does not label medications as hazardous, alter prescription dosages, or advise treatment modifications.
        </div>
      </div>

      {/* Active Unresolved Conflicts */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
          Action Required: Clinical Inconsistencies ({unresolved.length})
        </span>

        {unresolved.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No unresolved record conflicts found for {currentPatient.name}.
          </div>
        ) : (
          unresolved.map(c => (
            <ConflictCard key={c.id} conflict={c} />
          ))
        )}
      </div>

      {/* Resolved Conflicts */}
      {resolved.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Previously Clinically Reviewed ({resolved.length})
          </span>

          {resolved.map(c => (
            <ConflictCard key={c.id} conflict={c} />
          ))}
        </div>
      )}

    </div>
  );
};

export default ConflictsPage;
