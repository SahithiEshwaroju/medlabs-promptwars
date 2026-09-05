import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  User,
  Stethoscope,
  FlaskConical,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './common/UIComponents';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    isAuthenticated,
    currentRole,
    switchRole,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('rahul.kumar@gmail.com');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  // Registration form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('patient');
  const [signupPassword, setSignupPassword] = useState('••••••••');
  const [showAdminOption, setShowAdminOption] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Default to patient if rahul, doctor if doctor, etc.
    const emailLower = loginEmail.toLowerCase();
    if (emailLower.includes('doctor') || emailLower.includes('chen')) {
      switchRole('doctor');
    } else if (emailLower.includes('lab') || emailLower.includes('rivera')) {
      switchRole('lab_tech');
    } else if (emailLower.includes('admin')) {
      switchRole('admin');
    } else {
      switchRole('patient');
    }
    setIsAuthModalOpen(false);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName.trim()) return;
    switchRole(signupRole);
    setIsAuthModalOpen(false);
  };

  const DEMO_PROFILES = [
    {
      roleKey: 'patient',
      title: 'Patient Demo',
      name: 'Rahul Kumar (Age 42)',
      desc: 'View your reports, request tests and track your records.',
      icon: User,
      color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
    },
    {
      roleKey: 'doctor',
      title: 'Doctor Demo',
      name: 'Dr. Sarah Chen, MD',
      desc: 'Review patient records and verify extracted information.',
      icon: Stethoscope,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    },
    {
      roleKey: 'lab_tech',
      title: 'Lab Technician Demo',
      name: 'Alex Rivera, MLS',
      desc: 'Manage test requests and upload laboratory reports.',
      icon: FlaskConical,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
    },
    {
      roleKey: 'admin',
      title: 'Admin Demo',
      name: 'System Administrator',
      desc: 'Manage users and monitor system activity.',
      icon: ShieldAlert,
      color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div>
            <h3 id="auth-modal-title" className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <span>MedLens Access</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                DEMO MODE
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Synthetic data only • Safe demonstration environment
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            aria-label="Close authentication modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Login or Register */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'login'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'signup'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Tab 1: Simple Sign In */}
        {activeTab === 'login' && (
          <div className="p-6 space-y-5">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                icon={LogIn}
              >
                Sign In
              </Button>
            </form>

            {/* Clearly Separated Demo Access (Visually Secondary) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Demo access (1-click role switcher)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Pre-configured accounts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_PROFILES.map((profile) => {
                  const IconComp = profile.icon;
                  const isActive = currentRole === profile.roleKey && isAuthenticated;

                  return (
                    <button
                      key={profile.roleKey}
                      type="button"
                      onClick={() => {
                        switchRole(profile.roleKey);
                        setIsAuthModalOpen(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isActive
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50 dark:bg-sky-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${profile.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {profile.title}
                          </span>
                          {isActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                          {profile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {profile.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Plain-Language Registration */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Rahul Kumar"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Your Role
              </label>

              <div className="space-y-2">
                {/* Patient Role */}
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  signupRole === 'patient'
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={signupRole === 'patient'}
                    onChange={() => setSignupRole('patient')}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Patient
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      "View your reports, request tests and track your records."
                    </p>
                  </div>
                </label>

                {/* Doctor Role */}
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  signupRole === 'doctor'
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={signupRole === 'doctor'}
                    onChange={() => setSignupRole('doctor')}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Doctor
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      "Review patient records and verify extracted information."
                    </p>
                  </div>
                </label>

                {/* Lab Technician Role */}
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  signupRole === 'lab_tech'
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="lab_tech"
                    checked={signupRole === 'lab_tech'}
                    onChange={() => setSignupRole('lab_tech')}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Lab Technician
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      "Manage test requests and upload laboratory reports."
                    </p>
                  </div>
                </label>

                {/* Admin Role - hidden by default unless requested */}
                {showAdminOption && (
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                    signupRole === 'admin'
                      ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={signupRole === 'admin'}
                      onChange={() => setSignupRole('admin')}
                      className="mt-1 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        Admin
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        "Manage users and monitor system activity."
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {!showAdminOption && (
                <button
                  type="button"
                  onClick={() => setShowAdminOption(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium underline mt-1 cursor-pointer"
                >
                  Show administrative role options
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              icon={UserPlus}
            >
              Register & Open Dashboard
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Active Session: <strong>{user.name}</strong> ({user.role})</span>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                setIsAuthModalOpen(false);
              }}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
