import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const SafetyBadge = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 ${className}`}
        title="MedLens organizes and summarizes medical information. It does not replace professional medical judgment."
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Clinical Safety Verified</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 text-sky-950 dark:bg-sky-950/40 dark:border-sky-800/60 dark:text-sky-200 text-xs leading-relaxed ${className}`}
      role="note"
      aria-label="Clinical safety disclaimer"
    >
      <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold">Medical Disclaimer:</span> MedLens organizes and summarizes information from medical documents. It does not diagnose conditions, prescribe treatment, or replace professional medical advice.
      </div>
    </div>
  );
};

export default SafetyBadge;
