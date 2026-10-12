import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

interface ToastConfig {
  badge: string;
  badgeClass: string;
  cardClass: string;
  iconClass: string;
  progressClass: string;
  icon: React.ReactNode;
}

const getToastConfig = (type: ToastType, text: string): ToastConfig => {
  const isCopied = text.toLowerCase().includes('copied');

  switch (type) {
    case 'success':
      return {
        badge: isCopied ? 'Copied' : 'Success',
        badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
        cardClass:
          'border-emerald-500/30 bg-[#14181c]/95 shadow-emerald-950/20 hover:border-emerald-500/50',
        iconClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        progressClass: 'bg-emerald-400/80',
        icon: <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />,
      };
    case 'warning':
      return {
        badge: 'Notice',
        badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
        cardClass:
          'border-amber-500/30 bg-[#1c1814]/95 shadow-amber-950/20 hover:border-amber-500/50',
        iconClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        progressClass: 'bg-amber-400/80',
        icon: <AlertTriangle className="w-4 h-4 stroke-[2.2]" />,
      };
    case 'error':
      return {
        badge: 'Alert',
        badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
        cardClass:
          'border-rose-500/30 bg-[#1c1416]/95 shadow-rose-950/20 hover:border-rose-500/50',
        iconClass: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        progressClass: 'bg-rose-400/80',
        icon: <AlertCircle className="w-4 h-4 stroke-[2.2]" />,
      };
    case 'info':
    default:
      return {
        badge: 'Information',
        badgeClass: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
        cardClass:
          'border-sky-500/30 bg-[#14171c]/95 shadow-sky-950/20 hover:border-sky-500/50',
        iconClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        progressClass: 'bg-sky-400/80',
        icon: <Info className="w-4 h-4 stroke-[2.2]" />,
      };
  }
};

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      aria-live="polite"
      id="toast-notification-region"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type, toast.text);

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.94, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, y: -8, filter: 'blur(2px)', transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              onClick={() => onRemove(toast.id)}
              className={`toast-card pointer-events-auto relative overflow-hidden rounded-xl border p-3.5 shadow-2xl backdrop-blur-md transition-colors cursor-pointer group select-none ${config.cardClass}`}
              id={`toast-${toast.id}`}
              role="alert"
            >
              <div className="flex items-start gap-3">
                {/* Icon Container */}
                <div
                  className={`mt-0.5 p-2 rounded-lg border shadow-inner shrink-0 transition-transform group-hover:scale-105 ${config.iconClass}`}
                >
                  {config.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase font-mono border ${config.badgeClass}`}
                    >
                      {config.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-neutral-100 leading-snug break-words">
                    {toast.text}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(toast.id);
                  }}
                  className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 p-1 rounded-md transition-colors cursor-pointer shrink-0 mt-0.5"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar countdown */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800/40 overflow-hidden">
                <div className={`h-full w-full animate-toast-progress ${config.progressClass}`} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
