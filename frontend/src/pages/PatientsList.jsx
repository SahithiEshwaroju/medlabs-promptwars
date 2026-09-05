import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ProvenanceBadge from '../components/ProvenanceBadge';

export const PatientsList = () => {
  const { patients, selectPatient, addPatient } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL' | 'CONFLICT' | 'CLEAR'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Patient Form
  const [formData, setFormData] = useState({
    name: '',
    dob: '1984-06-12',
    age: '42',
    sex: 'Male',
    allergies: '',
    existing_conditions: '',
    current_medications: '',
    symptoms: '',
    history: '',
    notes: ''
  });

  const filteredPatients = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.allergies && p.allergies.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterRisk === 'CONFLICT') return matchSearch && p.conflicts_count > 0;
    if (filterRisk === 'CLEAR') return matchSearch && p.conflicts_count === 0;
    return matchSearch;
  });

  const handlePatientClick = (pId) => {
    selectPatient(pId);
    navigate('/patient-profile');
  };

  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addPatient({
      name: formData.name.trim(),
      dob: formData.dob || "1984-06-12",
      age: parseInt(formData.age) || 40,
      sex: formData.sex,
      allergies: formData.allergies.trim() || "None reported",
      existing_conditions: formData.existing_conditions.trim() || "None reported",
      current_medications: formData.current_medications.trim() || "None",
      symptoms: formData.symptoms.trim() || "Routine clinical evaluation",
      history: formData.history.trim() || "Non-contributory",
      notes: formData.notes.trim() || "Intake record registered via MedLens clinician portal.",
      provenance: "USER_PROVIDED"
    });

    setIsAddModalOpen(false);
    navigate('/patient-profile');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
            Patient Roster & Intake Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centrally manage clinical dossiers, explicit provenance records, and linked document histories.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Patient Intake</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or allergy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Filter:</span>
          {['ALL', 'CONFLICT', 'CLEAR'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterRisk(mode)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterRisk === mode
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {mode === 'ALL' ? 'All Patients' : mode === 'CONFLICT' ? 'Needs Review' : 'Verified Clear'}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Patient Profile</th>
                <th className="py-3.5 px-4">Demographics</th>
                <th className="py-3.5 px-4">Documented Allergies</th>
                <th className="py-3.5 px-4">Data Provenance</th>
                <th className="py-3.5 px-4">Reports</th>
                <th className="py-3.5 px-4">Clinical Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPatients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handlePatientClick(p.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center">
                        {p.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {p.patient_id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {p.age} yrs • {p.sex}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-md font-semibold text-[11px] ${
                      p.allergies && p.allergies.toLowerCase() !== 'none' && !p.allergies.includes('NKDA')
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : 'text-slate-400'
                    }`}>
                      {p.allergies || "None reported"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <ProvenanceBadge provenance={p.provenance || "USER PROVIDED"} />
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {p.documents_count} Files
                  </td>

                  <td className="py-3.5 px-4">
                    {p.conflicts_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{p.conflicts_count} Conflict</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Consistent</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Open Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  New Patient Clinical Intake
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-6 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between text-[11px] text-sky-800 dark:text-sky-300">
                <span>Provenance Classification: All fields recorded below are tagged strictly as <strong>USER PROVIDED</strong>.</span>
                <ProvenanceBadge provenance="USER PROVIDED" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="42"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Biological Sex
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Documented Drug Allergies (Tagged as USER PROVIDED)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Existing Medical Conditions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild essential hypertension, Type 2 diabetes"
                  value={formData.existing_conditions}
                  onChange={(e) => setFormData({ ...formData, existing_conditions: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Medications
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amlodipine 5mg OD"
                  value={formData.current_medications}
                  onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reported Symptoms / Chief Complaints
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fatigue, mild evening dizziness"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Relevant Medical History
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Appendectomy 2018, non-smoker, family history of hypertension"
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinician Intake Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or patient observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Register Patient & Open
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default PatientsList;
