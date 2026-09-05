import React from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import SafetyBadge from '../components/SafetyBadge';

export const ComparisonPage = () => {
  const { comparisons, currentPatient } = useApp();

  // Format data for Recharts
  const chartData = comparisons.map(c => ({
    name: c.test_name.replace('Total Leucocyte Count (WBC)', 'WBC').replace('Fasting Blood Glucose', 'Glucose'),
    previous: c.previous_value,
    current: c.current_value,
    unit: c.unit
  }));

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
            Longitudinal Report Comparison
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparing <strong>Previous Report (14-May-2026)</strong> vs <strong>Current Report (28-Aug-2026)</strong> for {currentPatient.name}.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
          <GitCompare className="w-3.5 h-3.5 text-sky-600" />
          <span>Factual Numerical Deltas Only</span>
        </div>
      </div>

      <SafetyBadge />

      {/* Safety Notice for Comparison */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/60 text-xs flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Clinical Principle Notice:</strong> Changes are reported strictly as mathematical deltas between explicit document records. MedLens strictly avoids medical speculation, prognosticating clinical deterioration, or synthesizing diagnoses.
        </div>
      </div>

      {/* Recharts Visual Comparison Bar Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Parameter Values Comparison Chart
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Numerical representation (Recharts)
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '0.75rem',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="previous" name="Previous (14 May 2026)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name="Current (28 Aug 2026)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Numerical Delta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {comparisons.map((c, idx) => {
          const isUp = c.delta > 0;
          const isDown = c.delta < 0;

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {c.test_name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ref Range: {c.reference_range}
                  </span>
                </div>

                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isUp
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : isDown
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {isUp ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{c.delta} {c.unit}</span>
                    </>
                  ) : isDown ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{c.delta} {c.unit}</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3.5 h-3.5" />
                      <span>No Change</span>
                    </>
                  )}
                </span>
              </div>

              {/* Numerical Transition */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Previous (14 May)</span>
                  <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                    {c.previous_value} {c.unit}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400" />

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Current (28 Aug)</span>
                  <span className="font-mono text-base font-bold text-sky-600 dark:text-sky-400">
                    {c.current_value} {c.unit}
                  </span>
                </div>
              </div>

              {/* Factual Statement Only */}
              <div className="p-2.5 rounded-lg bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-xs text-sky-950 dark:text-sky-200">
                <span className="font-semibold">Factual Statement:</span> "{c.factual_statement}"
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ComparisonPage;
