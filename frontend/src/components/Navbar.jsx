import React, { useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Activity,
  FileText,
  AlertTriangle,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const {
    theme,
    toggleTheme,
    user,
    backendOnline,
    setIsAuthModalOpen,
    resetDemoData,
    conflicts,
    labResults,
    searchQuery,
    setSearchQuery,
    patients,
    documents,
    selectPatient
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickSearchDropdown, setShowQuickSearchDropdown] = useState(false);
  const navigate = useNavigate();

  const pendingCount = labResults.filter(r => r.verification_status === 'PENDING').length;
  const unresolvedConflicts = conflicts.filter(c => !c.resolved).length;

  // Quick search filtering
  const q = searchQuery.toLowerCase().trim();
  const matchedPatients = q ? patients.filter(p => p.name.toLowerCase().includes(q) || p.patient_id.toLowerCase().includes(q)) : [];
  const matchedDocs = q ? documents.filter(d => d.file_name.toLowerCase().includes(q)) : [];
  const matchedLabs = q ? labResults.filter(l => l.test_name.toLowerCase().includes(q)) : [];

  const handlePatientSelect = (pId) => {
    selectPatient(pId);
    setShowQuickSearchDropdown(false);
    setSearchQuery('');
    navigate('/patient-profile');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients, documents, lab tests, conflicts... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowQuickSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setShowQuickSearchDropdown(true);
              }}
              className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-sky-500 dark:focus:border-sky-500 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              ⌘K
            </kbd>
          </div>

          {/* Quick Search Dropdown */}
          {showQuickSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-80 overflow-y-auto z-50 text-xs">
              {matchedPatients.length === 0 && matchedDocs.length === 0 && matchedLabs.length === 0 ? (
                <div className="p-3 text-center text-slate-400">
                  No matching clinical entities found for "{searchQuery}".
                </div>
              ) : (
                <>
                  {matchedPatients.length > 0 && (
                    <div className="mb-2">
                      <span className="px-2 py-1 font-semibold text-[10px] uppercase tracking-wider text-slate-400 block">
                        Patients
                      </span>
                      {matchedPatients.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handlePatientSelect(p.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{p.patient_id}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedLabs.length > 0 && (
                    <div className="mb-2">
                      <span className="px-2 py-1 font-semibold text-[10px] uppercase tracking-wider text-slate-400 block">
                        Lab Tests
                      </span>
                      {matchedLabs.slice(0, 4).map(l => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setShowQuickSearchDropdown(false);
                            navigate('/evidence');
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-slate-700 dark:text-slate-300">{l.test_name}</span>
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{l.value} {l.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedDocs.length > 0 && (
                    <div>
                      <span className="px-2 py-1 font-semibold text-[10px] uppercase tracking-wider text-slate-400 block">
                        Documents
                      </span>
                      {matchedDocs.map(d => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setShowQuickSearchDropdown(false);
                            navigate('/source-library');
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="truncate">{d.file_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Badge */}
          <div
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
              backendOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title={backendOnline ? "FastAPI Backend is running on port 8000" : "Offline / Local Demo Data Fallback active"}
          >
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{backendOnline ? 'FastAPI Live' : 'Demo Mode'}</span>
          </div>

          {/* Landing Page Quick Access */}
          <button
            onClick={() => navigate('/welcome')}
            title="Open Public Landing Page"
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Landing Page</span>
          </button>

          {/* Demo Reset Button */}
          <button
            onClick={resetDemoData}
            title="Reset to initial Rahul Kumar demo dataset"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {(pendingCount > 0 || unresolvedConflicts > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Clinical Action Items
                  </span>
                  <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold px-1.5 py-0.5 rounded">
                    {pendingCount + unresolvedConflicts} alerts
                  </span>
                </div>

                <div className="space-y-2">
                  {unresolvedConflicts > 0 && (
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/conflicts');
                      }}
                      className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2 cursor-pointer hover:bg-amber-100/70 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-200">
                          {unresolvedConflicts} Record Conflict Detected
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          Penicillin allergy vs Amoxicillin prescription requires clinician review.
                        </p>
                      </div>
                    </div>
                  )}

                  {pendingCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/verification');
                      }}
                      className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 flex items-start gap-2 cursor-pointer hover:bg-sky-100/70 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sky-900 dark:text-sky-200">
                          {pendingCount} Pending Verifications
                        </p>
                        <p className="text-[11px] text-sky-700 dark:text-sky-300">
                          Extracted parameters in queue awaiting clinician sign-off.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* User Role Profile Trigger */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            aria-label={`Current user: ${user.name}, role: ${user.role}. Click to switch roles.`}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] font-medium text-sky-600 dark:text-sky-400 leading-tight">
                {user.role}
              </p>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
