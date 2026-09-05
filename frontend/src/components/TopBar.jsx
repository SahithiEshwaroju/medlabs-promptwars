import React, { useState } from 'react';
import {
  ChevronDown,
  Upload,
  Download,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ProvenanceBadge from './ProvenanceBadge';

export const TopBar = () => {
  const {
    currentRole,
    currentPatient,
    patients,
    selectPatient,
    clarifications,
    setIsClarificationModalOpen
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const isDoctorOrAdmin = currentRole === 'doctor' || currentRole === 'admin';
  const pendingClarifications = clarifications.filter(q => q.status === 'PENDING').length;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      
      {/* Current Active Patient Selector */}
      <div className="relative">
        <button
          onClick={() => isDoctorOrAdmin && setIsDropdownOpen(prev => !prev)}
          disabled={!isDoctorOrAdmin}
          aria-label={isDoctorOrAdmin ? "Select active patient record" : "Current patient profile"}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors ${
            isDoctorOrAdmin
              ? 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 cursor-default'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px]">
            {currentPatient?.name ? currentPatient.name[0] : 'P'}
          </div>
          <div className="text-left">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
              {currentPatient?.name || "Rahul Kumar"}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
              ({currentPatient?.age}y, {currentPatient?.sex}) • <span className="font-mono">{currentPatient?.patient_id}</span>
            </span>
          </div>
          {isDoctorOrAdmin && <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />}
        </button>

        {isDoctorOrAdmin && isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-72 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 block">
              Switch Demo Patient Record
            </span>
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  selectPatient(p.id);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  p.id === currentPatient?.id
                    ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{p.patient_id} • {p.age}y, {p.sex}</p>
                </div>
                {p.id === currentPatient?.id && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center Patient Tags (e.g. Penicillin Allergy) */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-slate-400 text-xs">Allergy:</span>
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
          {currentPatient?.allergies || "Penicillin"}
        </span>
        <span className="text-slate-400 text-xs ml-2">Intake:</span>
        <ProvenanceBadge provenance="USER PROVIDED" />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {pendingClarifications > 0 && (
          <button
            onClick={() => setIsClarificationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clarifications ({pendingClarifications})</span>
          </button>
        )}

        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Report</span>
        </button>

        <button
          onClick={() => navigate('/patient-profile')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Record</span>
        </button>
      </div>

    </div>
  );
};

export default TopBar;
