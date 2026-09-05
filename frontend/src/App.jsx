import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Loader2 } from 'lucide-react';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Modals
import EvidenceViewer from './components/EvidenceViewer';
import VerificationModal from './components/VerificationModal';
import ClarificationModal from './components/ClarificationModal';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';

// Lazy-Loaded Dynamic Page Chunks (Reduces Initial Bundle & Eliminates Warnings)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PatientsList = lazy(() => import('./pages/PatientsList'));
const PatientProfile = lazy(() => import('./pages/PatientProfile'));
const DocumentUpload = lazy(() => import('./pages/DocumentUpload'));
const EvidenceViewPage = lazy(() => import('./pages/EvidenceViewPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const ConflictsPage = lazy(() => import('./pages/ConflictsPage'));
const SourceLibrary = lazy(() => import('./pages/SourceLibrary'));
const TestRequestsPage = lazy(() => import('./pages/TestRequestsPage'));

function RouteLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
      <p className="text-sm font-medium">Loading clinical workspace...</p>
    </div>
  );
}

export function App() {
  const {
    selectedEvidenceItem,
    closeEvidence
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Landing Page standalone route
  if (location.pathname === '/welcome') {
    return <LandingPage onLaunchDemo={() => navigate('/')} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      
      {/* Persistent Clinical Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <TopBar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/test-requests" element={<TestRequestsPage />} />
              <Route path="/patients" element={<PatientsList />} />
              <Route path="/patient-profile" element={<PatientProfile />} />
              <Route path="/upload" element={<DocumentUpload />} />
              <Route path="/evidence" element={<EvidenceViewPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/conflicts" element={<ConflictsPage />} />
              <Route path="/source-library" element={<SourceLibrary />} />
              {/* Fallback to Dashboard */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Global Clinical Interactive Modals */}
      {selectedEvidenceItem && (
        <EvidenceViewer
          item={selectedEvidenceItem}
          onClose={closeEvidence}
        />
      )}

      <VerificationModal />
      <ClarificationModal />
      <AuthModal />

    </div>
  );
}

export default App;
