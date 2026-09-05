import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SafetyBadge from '../components/SafetyBadge';

export const TimelinePage = () => {
  const { timeline, currentPatient } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const CATEGORIES = ['ALL', 'Reports', 'Lab Results', 'Medications', 'Verification', 'Conflicts'];

  const filteredEvents = timeline.filter(ev => {
    if (selectedCategory === 'ALL') return true;
    return ev.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Conflicts':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Verification':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Medications':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Lab Results':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
            Longitudinal Clinical Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological audit trail for <strong>{currentPatient.name} ({currentPatient.patient_id})</strong>.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-400">
          {filteredEvents.length} Events Tracked
        </span>
      </div>

      <SafetyBadge />

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold mr-1">Filter Stream:</span>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="relative group">
            
            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-sky-500 group-hover:scale-125 transition-transform" />

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(event.category)}`}>
                    {event.category || "Event"}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {event.event_date}
                  </span>
                </div>

                <span className="font-mono text-[10px] text-slate-400">
                  {event.source_document_name}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {event.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {event.description}
              </p>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default TimelinePage;
