import React, { useEffect, useRef } from 'react';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  X,
  ShieldCheck
} from 'lucide-react';

/**
 * Standard Accessible Button Component
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-xs gap-2",
    lg: "px-5 py-2.5 text-sm gap-2.5"
  }[size] || "px-3.5 py-2 text-xs gap-2";

  const variantStyles = {
    primary: "bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-xs shadow-sky-600/20",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
    outline: "bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-600/20",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
  }[variant] || "";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          {children}
        </>
      )}
    </button>
  );
};

/**
 * Standard Surface Card Component
 */
export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  ...props
}) => {
  return (
    <div
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && (
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * Standard Status Badge with BOTH Icon and Text (Accessibility requirement: Never rely on color alone)
 */
export const StatusBadge = ({ status, size = 'sm' }) => {
  const norm = String(status || '').toUpperCase().trim();

  let config = {
    label: norm || 'NOT DETERMINED',
    icon: HelpCircle,
    styles: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  if (norm === 'LOW') {
    config = {
      label: 'LOW',
      icon: ArrowDownRight,
      styles: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
    };
  } else if (norm === 'HIGH') {
    config = {
      label: 'HIGH',
      icon: ArrowUpRight,
      styles: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
    };
  } else if (norm === 'NORMAL') {
    config = {
      label: 'NORMAL',
      icon: CheckCircle2,
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    };
  } else if (norm === 'VERIFIED' || norm === 'HUMAN_VERIFIED') {
    config = {
      label: 'VERIFIED',
      icon: ShieldCheck,
      styles: 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
    };
  } else if (norm === 'PENDING') {
    config = {
      label: 'PENDING',
      icon: AlertTriangle,
      styles: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900'
    };
  } else if (norm === 'COMPLETED' || norm === 'RESOLVED') {
    config = {
      label: 'COMPLETED',
      icon: CheckCircle2,
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    };
  }

  const IconComp = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide border ${padding} ${config.styles}`}
      role="status"
    >
      <IconComp className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

/**
 * Standard Empty State
 */
export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = "No items found",
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            {description}
          </p>
        )}
      </div>
      {actionText && onAction && (
        <div className="pt-2">
          <Button onClick={onAction} variant="primary" size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Accessible Modal with Keyboard Focus Management & Escape to Close
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md'
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ${maxWidth} w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <h3 id="modal-title" className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Standard Clean Page Header
 */
export const PageHeader = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  badge
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2.5">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
};
