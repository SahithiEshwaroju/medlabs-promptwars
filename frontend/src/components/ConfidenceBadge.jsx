import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export const ConfidenceBadge = ({ confidence = 0.95, showPercentage = true, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const percent = Math.round(confidence * 100);

  let level = 'High';
  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  let Icon = CheckCircle2;

  if (confidence < 0.70) {
    level = 'Low';
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    Icon = AlertCircle;
  } else if (confidence < 0.90) {
    level = 'Medium';
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    Icon = AlertTriangle;
  }

  const tooltipText = "Confidence reflects the reliability of information extraction from the source document. It does not represent medical certainty.";

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      tabIndex={0}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-help transition-colors ${colorClasses} ${className}`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{showPercentage ? `${percent}%` : level} Confidence</span>
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-800 z-50 pointer-events-none transition-all leading-normal text-center">
          <div className="flex items-center justify-center gap-1 font-semibold text-slate-300 mb-1">
            <HelpCircle className="w-3 h-3 text-sky-400" />
            <span>Extraction Metric</span>
          </div>
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export default ConfidenceBadge;
