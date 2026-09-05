import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Users,
  ShieldCheck,
  GitCommit,
  AlertTriangle,
  FolderArchive,
  Sparkles,
  FlaskConical,
  Upload,
  User,
  Bell,
  LogOut,
  Settings,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const {
    currentRole,
    user,
    labResults,
    conflicts,
    testRequests,
    logout,
    setIsAuthModalOpen
  } = useApp();

  const pendingVerificationCount = labResults.filter(r => r.verification_status === 'PENDING').length;
  const unresolvedConflictsCount = conflicts.filter(c => !c.resolved).length;
  const pendingRequestsCount = testRequests.filter(r => r.status === 'PENDING').length;

  // Build role-specific navigation matching Phase 5
  let navItems = [];

  if (currentRole === 'patient') {
    navItems = [
      { to: '/', label: 'Home', icon: Home, end: true },
      {
        to: '/test-requests',
        label: 'My Tests',
        icon: FlaskConical,
        badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
        badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
      },
      { to: '/source-library', label: 'My Reports', icon: FolderArchive },
      { to: '/timeline', label: 'Timeline', icon: GitCommit },
      { to: '/patient-profile', label: 'Profile', icon: User },
      {
        to: '/conflicts',
        label: 'Notifications',
        icon: Bell,
        badge: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : null,
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      }
    ];
  } else if (currentRole === 'doctor') {
    navItems = [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/patients', label: 'Patients', icon: Users },
      { to: '/source-library', label: 'Reports', icon: FolderArchive },
      {
        to: '/verification',
        label: 'Verification',
        icon: ShieldCheck,
        badge: pendingVerificationCount > 0 ? pendingVerificationCount : null,
        badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
      },
      {
        to: '/conflicts',
        label: 'Conflicts',
        icon: AlertTriangle,
        badge: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : null,
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      },
      { to: '/timeline', label: 'Timeline', icon: GitCommit }
    ];
  } else if (currentRole === 'lab_tech') {
    navItems = [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      {
        to: '/test-requests',
        label: 'Test Requests',
        icon: FlaskConical,
        badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      },
      { to: '/test-requests', label: 'Appointments', icon: Calendar },
      { to: '/test-requests', label: 'Samples', icon: Layers },
      { to: '/upload', label: 'Reports', icon: Upload }
    ];
  } else {
    // Admin & Guest
    navItems = [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/patients', label: 'Users', icon: Users },
      { to: '/test-requests', label: 'Test Requests', icon: FlaskConical },
      { to: '/source-library', label: 'Reports', icon: FolderArchive },
      { to: '/timeline', label: 'System Activity', icon: Activity },
      { to: '/', label: 'Audit Logs', icon: ShieldCheck }
    ];
  }

  return (
    <aside
      className="w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors z-40"
      aria-label="Primary sidebar navigation"
    >
      
      {/* Brand & Logo */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-50">
                MedLens
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                {currentRole.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Medical Records Intelligence
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Links (Phase 5) */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs border border-sky-200/60 dark:border-sky-800/60 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile, Settings & Role Switcher */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        
        {/* User Card */}
        <div
          onClick={() => setIsAuthModalOpen(true)}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-colors"
          title="Click to switch demo role"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user.name[0] || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-sky-600 dark:text-sky-400 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions: Settings & Logout */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Switch demo roles"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[11px]">Roles</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            aria-label="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Log Out</span>
          </button>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;
