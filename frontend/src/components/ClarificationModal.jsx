import React, { useState } from 'react';
import { X, HelpCircle, ArrowRight, SkipForward, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClarificationModal = () => {
  const {
    isClarificationModalOpen,
    setIsClarificationModalOpen,
    clarifications,
    answerClarification
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isClarificationModalOpen) return null;

  const currentQ = clarifications[currentIndex] || clarifications[0];

  const handleSelectOption = (option) => {
    if (currentQ) {
      answerClarification(currentQ.id, option);
      if (currentIndex < clarifications.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsClarificationModalOpen(false);
      }
    }
  };

  const handleSkip = () => {
    if (currentQ) {
      answerClarification(currentQ.id, 'SKIPPED');
    }
    if (currentIndex < clarifications.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsClarificationModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Ambiguity Resolution Clarification
              </h3>
              <p className="text-[11px] text-slate-500">
                Item {currentIndex + 1} of {clarifications.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsClarificationModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {currentQ ? (
          <div className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs flex items-start gap-2 text-amber-900 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Safety Guardrail Active:</span>
                MedLens never guesses unstated clinical facts. We prompt the human clinician to resolve ambiguities.
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Field: {currentQ.field}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {currentQ.question}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                <strong>Context:</strong> {currentQ.context}
              </p>
            </div>

            {/* Options list */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                Select clinician determination:
              </span>
              {currentQ.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between transition-all group cursor-pointer"
                >
                  <span>{opt}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            All clarifications resolved!
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip Question</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            Step {currentIndex + 1} / {clarifications.length}
          </span>
        </div>

      </div>
    </div>
  );
};

export default ClarificationModal;
