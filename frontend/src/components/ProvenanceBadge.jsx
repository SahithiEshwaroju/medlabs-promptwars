import React from 'react';
import { UserCheck, Sparkles, Cpu, CheckCircle } from 'lucide-react';

export const ProvenanceBadge = ({ provenance = 'USER PROVIDED', className = '' }) => {
  const norm = (provenance || '').toUpperCase().replace(/_/g, ' ');

  let config = {
    label: 'USER PROVIDED',
    bg: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    Icon: UserCheck
  };

  if (norm.includes('HUMAN') || norm.includes('VERIFIED')) {
    config = {
      label: 'HUMAN VERIFIED',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      Icon: CheckCircle
    };
  } else if (norm.includes('EXTRACTED') || norm.includes('DOCUMENT')) {
    config = {
      label: 'AI EXTRACTED',
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
      Icon: Cpu
    };
  } else if (norm.includes('GENERATED') || norm.includes('SUMMARY')) {
    config = {
      label: 'AI GENERATED',
      bg: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
      Icon: Sparkles
    };
  }

  const { label, bg, Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase border ${bg} ${className}`}
      title={`Data Provenance: ${label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export default ProvenanceBadge;
