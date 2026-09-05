import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  GitCompare,
  Layers,
  HeartPulse,
  Cpu,
  LogIn,
  UserPlus,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import SafetyBadge from './SafetyBadge';
import { Button } from './common/UIComponents';

export const LandingPage = () => {
  const { switchRole, setIsAuthModalOpen } = useApp();
  const navigate = useNavigate();

  const handleOpenLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setIsAuthModalOpen(true);
  };

  const handleContinueAsGuest = () => {
    switchRole('guest');
    navigate('/');
  };

  const WORKFLOW_STEPS = [
    { title: "Upload", desc: "PDF & Scans", icon: Layers, color: "text-blue-500" },
    { title: "OCR Extract", desc: "Text Recognition", icon: Cpu, color: "text-indigo-500" },
    { title: "Structure", desc: "Standard Units", icon: FileSearch, color: "text-sky-500" },
    { title: "Ref Range", desc: "Strict Source Check", icon: CheckCircle2, color: "text-teal-500" },
    { title: "Evidence", desc: "Exact Source Link", icon: ShieldCheck, color: "text-emerald-500" },
    { title: "Verification", desc: "Doctor Sign-Off", icon: CheckCircle2, color: "text-green-500" },
    { title: "Conflict Check", desc: "Allergy Inconsistency", icon: AlertTriangle, color: "text-amber-500" },
    { title: "Timeline", desc: "Health History", icon: GitCommit, color: "text-purple-500" },
    { title: "Comparison", desc: "Report vs Report", icon: GitCompare, color: "text-rose-500" }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-sky-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Top Navigation */}
      <header className="px-6 sm:px-12 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-50">
              MEDLENS
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
              Medical Records Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleContinueAsGuest}
            icon={User}
          >
            Continue as Guest
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenLogin}
            icon={LogIn}
          >
            Login
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenRegister}
            icon={UserPlus}
          >
            Create Account
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-16 text-center space-y-8">
        
        {/* Simple subtitle tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 shadow-xs">
          <HeartPulse className="w-4 h-4 text-sky-600" />
          <span>Keep your health information organized, traceable, and reviewable</span>
        </div>

        {/* Primary Headline & Value Proposition */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Understand your medical reports. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-teal-600">
              Keep your health information organized.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            MedLens takes complex lab reports and clinical documents, extracts the key test values, links them directly to source evidence, and highlights important records for professional review.
          </p>
        </div>

        {/* The 3 Primary Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
          <button
            onClick={handleOpenLogin}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>

          <button
            onClick={handleOpenRegister}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        <div className="pt-1">
          <button
            onClick={handleContinueAsGuest}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors cursor-pointer py-1"
          >
            <span>Or explore instant demonstration:</span>
            <strong className="underline">Continue as Guest (Synthetic Demo)</strong>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Persistent Safety Disclaimer */}
        <div className="max-w-2xl mx-auto pt-2">
          <SafetyBadge />
        </div>

        {/* Simplified 9-Step Traceability Architecture */}
        <div className="pt-8 text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              How MedLens Works
            </h2>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
              End-to-End Traceable Pipeline
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {WORKFLOW_STEPS.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center group hover:border-sky-500 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 mb-1.5 ${step.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Report Information Extracted
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              MedLens automatically extracts test parameters, units, and values from uploaded reports and structures them in a clean health record.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Strict Reference-Range Safety
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Never guesses or invents reference ranges. Only uses explicit ranges printed on your source document. Missing ranges are strictly marked NOT DETERMINED.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Evidence & Discrepancy Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every value links directly to the original page in your document. Inconsistencies (like recorded allergies vs prescriptions) are flagged for professional review.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>MEDLENS • Clinical Information Organization System • Synthetic Demo Data</p>
      </footer>

    </div>
  );
};

export default LandingPage;
