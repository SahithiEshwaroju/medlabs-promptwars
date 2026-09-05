import React from 'react';
import {
  Upload,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Plus,
  Users,
  FlaskConical,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, StatusBadge, PageHeader } from '../components/common/UIComponents';
import SafetyBadge from '../components/SafetyBadge';

export const Dashboard = () => {
  const {
    currentRole,
    user,
    currentPatient,
    patients,
    documents,
    labResults,
    conflicts,
    timeline,
    testRequests,
    samples,
    auditLogs
  } = useApp();

  const navigate = useNavigate();

  // -------------------------------------------------------------
  // 1. PATIENT DASHBOARD (Rahul Kumar) - Phase 5
  // -------------------------------------------------------------
  if (currentRole === 'patient') {
    const upcomingTest = testRequests.find(r => r.status === 'SCHEDULED' || r.status === 'PENDING');
    const latestReport = documents[0];
    const pendingVerifications = labResults.filter(r => r.verification_status === 'PENDING').length;
    const recentActivity = timeline.slice(0, 3);
    const recentReports = documents.slice(0, 3);

    return (
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        
        {/* Top Banner: Plain Language Greeting */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50">
              Good morning, {currentPatient.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here's what's happening with your medical records.
            </p>
          </div>

          {/* Primary: Upload Report, Secondary: Request a Test */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="md"
              icon={Plus}
              onClick={() => navigate('/test-requests')}
            >
              Request a Test
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/upload')}
            >
              Upload Report
            </Button>
          </div>
        </div>

        <SafetyBadge />

        {/* 4 Most Useful Patient Cards (Phase 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Upcoming Test */}
          <Card
            className="hover:border-sky-400 transition-colors cursor-pointer"
            onClick={() => navigate('/test-requests')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                1. Upcoming Test
              </span>
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            {upcomingTest ? (
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                  {upcomingTest.test_type}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {upcomingTest.scheduled_for || "Pending laboratory scheduling"}
                </p>
                <div className="mt-2">
                  <StatusBadge status={upcomingTest.status} size="sm" />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">No tests scheduled</p>
                <button className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-1">
                  Request a checkup →
                </button>
              </div>
            )}
          </Card>

          {/* 2. Latest Report */}
          <Card
            className="hover:border-sky-400 transition-colors cursor-pointer"
            onClick={() => navigate('/source-library')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                2. Latest Report
              </span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            {latestReport ? (
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                  {latestReport.file_name.replace('.pdf', '')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(latestReport.upload_date).toLocaleDateString()} • {latestReport.extracted_fields_count} values
                </p>
                <div className="mt-2">
                  <StatusBadge status="VERIFIED" size="sm" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No reports uploaded yet</p>
            )}
          </Card>

          {/* 3. Pending Action */}
          <Card
            className="hover:border-sky-400 transition-colors cursor-pointer"
            onClick={() => navigate('/verification')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                3. Pending Action
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {pendingVerifications > 0 ? `${pendingVerifications} Doctor Reviews` : "All Records Clear"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pendingVerifications > 0 ? "Awaiting doctor sign-off" : "Up to date"}
              </p>
              <div className="mt-2">
                <StatusBadge status={pendingVerifications > 0 ? "PENDING" : "NORMAL"} size="sm" />
              </div>
            </div>
          </Card>

          {/* 4. Timeline */}
          <Card
            className="hover:border-sky-400 transition-colors cursor-pointer"
            onClick={() => navigate('/timeline')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                4. Timeline
              </span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {timeline.length} Events Recorded
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Last: {timeline[0]?.title || "Initial Intake"}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-sky-600 font-semibold">
                <span>View history</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Card>

        </div>

        {/* Split Section: Recent Reports & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Recent Reports */}
          <Card title="Recent Reports" subtitle="Your uploaded medical files and laboratory results">
            <div className="space-y-2.5">
              {recentReports.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => navigate('/evidence')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-sky-600 border border-slate-200 dark:border-slate-800">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                        {doc.file_name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(doc.upload_date).toLocaleDateString()} • {doc.extracted_fields_count} extracted values
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity" subtitle="Updates and actions taken on your medical records">
            <div className="space-y-3">
              {recentActivity.map(ev => (
                <div key={ev.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ev.title}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">{ev.event_date}</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {ev.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. DOCTOR DASHBOARD (Dr. Sarah Chen, MD) - Phase 5
  // -------------------------------------------------------------
  if (currentRole === 'doctor') {
    const unverifiedResults = labResults.filter(r => r.verification_status === 'PENDING');
    const unresolvedConflicts = conflicts.filter(c => !c.resolved);
    const recentActivity = timeline.slice(0, 4);

    return (
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        
        {/* Doctor Header with Primary Action: Review Reports (Phase 6) */}
        <PageHeader
          title={`Doctor Clinical Workspace: ${user.name}`}
          subtitle="Review patient records, verify automated entity extractions, and investigate clinical record conflicts."
          badge={
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active Clinician Session
            </span>
          }
          primaryAction={
            <Button
              variant="primary"
              size="md"
              icon={ShieldCheck}
              onClick={() => navigate('/verification')}
            >
              Review Reports ({unverifiedResults.length})
            </Button>
          }
        />

        <SafetyBadge />

        {/* 4 Key Doctor Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Patients Needing Attention */}
          <Card
            className="hover:border-sky-400 cursor-pointer"
            onClick={() => navigate('/patients')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Patients Needing Attention</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {patients.filter(p => p.pending_verifications > 0 || p.conflicts_count > 0).length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Active records in cohort</span>
          </Card>

          {/* Reports Awaiting Verification */}
          <Card
            className="hover:border-amber-400 cursor-pointer"
            onClick={() => navigate('/verification')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Verification</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {unverifiedResults.length}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">Parameters in queue</span>
          </Card>

          {/* Potential Record Conflicts */}
          <Card
            className="hover:border-rose-400 cursor-pointer"
            onClick={() => navigate('/conflicts')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Record Conflicts</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {unresolvedConflicts.length}
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">Requires physician review</span>
          </Card>

          {/* Documents Ingested */}
          <Card
            className="hover:border-indigo-400 cursor-pointer"
            onClick={() => navigate('/source-library')}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Documents Ingested</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {documents.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Traceable medical files</span>
          </Card>

        </div>

        {/* Attention Items & Recent Patient Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Pending Verifications Quick Queue */}
          <Card
            title="Verification Queue"
            subtitle="Extracted metrics waiting for clinician sign-off"
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => navigate('/verification')}>
                View All →
              </Button>
            }
          >
            <div className="space-y-2.5">
              {unverifiedResults.slice(0, 3).map(lab => (
                <div
                  key={lab.id}
                  onClick={() => navigate('/verification')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-colors"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {lab.test_name}
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {lab.value} {lab.unit} • Ref: {lab.reference_range?.raw_text || 'None'}
                    </p>
                  </div>
                  <StatusBadge status={lab.status} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Patient Activity */}
          <Card
            title="Recent Patient Activity"
            subtitle="Audit trail across patients"
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => navigate('/timeline')}>
                Timeline →
              </Button>
            }
          >
            <div className="space-y-3">
              {recentActivity.map(item => (
                <div key={item.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">{item.event_date}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. LAB TECHNICIAN DASHBOARD (Alex Rivera, MLS) - Phase 5
  // -------------------------------------------------------------
  if (currentRole === 'lab_tech') {
    const pendingReqs = testRequests.filter(r => r.status === 'PENDING').length;
    const scheduledTests = testRequests.filter(r => r.status === 'SCHEDULED').length;
    const sampleCount = samples.length;
    const completedReqs = testRequests.filter(r => r.status === 'COMPLETED').length;

    return (
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        
        <PageHeader
          title={`Laboratory Operations: ${user.name}`}
          subtitle="Manage diagnostic orders, schedule sample collections, and upload clinical laboratory reports."
          badge={
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Laboratory Technician
            </span>
          }
          primaryAction={
            <Button
              variant="primary"
              size="md"
              icon={FlaskConical}
              onClick={() => navigate('/test-requests')}
            >
              View Test Requests ({pendingReqs})
            </Button>
          }
        />

        <SafetyBadge />

        {/* 5 Lab Technician Overview Cards (Phase 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          <Card className="hover:border-sky-400 cursor-pointer" onClick={() => navigate('/test-requests')}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pending Requests</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingReqs}</div>
            <span className="text-[10px] text-slate-400">Needs Acceptance</span>
          </Card>

          <Card className="hover:border-sky-400 cursor-pointer" onClick={() => navigate('/test-requests')}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Today's Tests</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{scheduledTests}</div>
            <span className="text-[10px] text-slate-400">Scheduled</span>
          </Card>

          <Card className="hover:border-sky-400 cursor-pointer" onClick={() => navigate('/test-requests')}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Samples</span>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{sampleCount}</div>
            <span className="text-[10px] text-slate-400">Tracked Specimens</span>
          </Card>

          <Card className="hover:border-sky-400 cursor-pointer" onClick={() => navigate('/upload')}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Processing</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">1</div>
            <span className="text-[10px] text-slate-400">OCR & Extraction</span>
          </Card>

          <Card className="hover:border-sky-400 cursor-pointer" onClick={() => navigate('/source-library')}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reports Ready</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedReqs}</div>
            <span className="text-[10px] text-slate-400">Validated</span>
          </Card>

        </div>

        {/* Main Lab Action: Pending Requests Queue */}
        <Card
          title="Active Test Order Queue"
          subtitle="Orders placed by patients and clinicians requiring intake"
          headerAction={
            <Button variant="primary" size="sm" icon={Upload} onClick={() => navigate('/upload')}>
              Upload Lab Report
            </Button>
          }
        >
          <div className="space-y-3">
            {testRequests.map(req => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{req.test_type}</span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Patient: {req.patient_name || currentPatient.name} • Order Date: {new Date(req.requested_at).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/test-requests')}
                >
                  Manage Order →
                </Button>
              </div>
            ))}
          </div>
        </Card>

      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. ADMIN DASHBOARD - Phase 5
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      <PageHeader
        title="MedLens System Administration"
        subtitle="System telemetry, user access oversight, diagnostic throughput, and compliance audit logs."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            System Administrator
          </span>
        }
      />

      {/* 5 Non-Medical Administrative Metric Cards (Phase 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Users</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">4 Active</div>
          <span className="text-[10px] text-slate-400">All Roles Configured</span>
        </Card>

        <Card>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Test Requests</span>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{testRequests.length}</div>
          <span className="text-[10px] text-slate-400">Orders Processed</span>
        </Card>

        <Card>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reports</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{documents.length}</div>
          <span className="text-[10px] text-slate-400">Ingested PDFs</span>
        </Card>

        <Card>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">System Activity</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">99.9%</div>
          <span className="text-[10px] text-slate-400">FastAPI & SQLite</span>
        </Card>

        <Card>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Audit Logs</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{auditLogs.length}</div>
          <span className="text-[10px] text-slate-400">Security Events</span>
        </Card>
      </div>

      {/* System Audit Logs Table (Phase 8 & 9) */}
      <Card title="Security & Compliance Audit Logs" subtitle="Non-repudiable audit logs tracking all document ingestion, verifications, and record access">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">User</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Target</th>
                <th className="pb-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{log.user_name}</td>
                  <td className="py-2.5 text-slate-500">{log.user_role}</td>
                  <td className="py-2.5 font-mono font-bold text-sky-600 dark:text-sky-400">{log.action}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-400">{log.resource_id}</td>
                  <td className="py-2.5 text-slate-500 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default Dashboard;
