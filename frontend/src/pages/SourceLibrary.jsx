import React, { useState } from 'react';
import {
  FileText,
  Search,
  Upload,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import SafetyBadge from '../components/SafetyBadge';

export const SourceLibrary = () => {
  const { documents, currentPatient, openEvidence, labResults } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const CATEGORIES = ['ALL', 'Lab Report', 'Prescription', 'Medical History'];

  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (doc.source_org && doc.source_org.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedType === 'ALL') return matchSearch;
    return matchSearch && doc.category?.toLowerCase() === selectedType.toLowerCase();
  });

  const handleOpenSource = (doc) => {
    // Find first lab result linked to this doc or pass doc info
    const linkedLab = labResults.find(l => l.source_document === doc.file_name) || {
      test_name: "Document Ingest",
      value: "Processed",
      unit: "",
      source_document: doc.file_name,
      source_page: 1,
      source_text: `Document: ${doc.file_name} • Ingested into MedLens repository`,
      confidence: 0.98,
      provenance: "DOCUMENT_EXTRACTED",
      verification_status: "VERIFIED"
    };
    openEvidence(linkedLab);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
            Source Document Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete repository of ingested diagnostic reports, scanned prescriptions, and lab data sheets.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload New File</span>
        </button>
      </div>

      <SafetyBadge />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search document name or source organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Filter Type:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedType === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Document File Name</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Document Type</th>
                <th className="py-3.5 px-4">Upload Date</th>
                <th className="py-3.5 px-4">Extracted Fields</th>
                <th className="py-3.5 px-4">Processing Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.map(d => (
                <tr
                  key={d.id}
                  onClick={() => handleOpenSource(d)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition-colors block">
                          {d.file_name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {d.source_org || "Clinical Diagnostics"} • {d.total_pages} Pages
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {currentPatient.name}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {d.category || "Lab Report"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {d.upload_date ? d.upload_date.split('T')[0] : "2026-08-28"}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                    {d.extracted_fields_count} Parameters
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{d.status || "Ready"}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/evidence');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Inspect Evidence</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SourceLibrary;
