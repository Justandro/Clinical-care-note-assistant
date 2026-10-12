import React from 'react';
import { AlertTriangle, Info, BookOpen } from 'lucide-react';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const WarningAlert: React.FC<AlertProps> = ({ title, children, className = '' }) => (
  <div
    className={`rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/15 to-neutral-900/50 p-4 shadow-sm backdrop-blur-sm mb-4 transition-all ${className}`}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 shrink-0 shadow-inner mt-0.5">
        <AlertTriangle className="h-4.5 w-4.5 stroke-[2.2]" />
      </div>
      <div className="w-full">
        {title && (
          <h4 className="text-sm font-semibold tracking-wide text-amber-300 mb-1.5 flex items-center gap-1.5">
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm text-neutral-200/90 space-y-1.5 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const InfoAlert: React.FC<AlertProps> = ({ title, children, className = '' }) => (
  <div
    className={`rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-sky-900/15 to-neutral-900/50 p-4 shadow-sm backdrop-blur-sm mb-4 transition-all ${className}`}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/25 text-sky-400 shrink-0 shadow-inner mt-0.5">
        <Info className="h-4.5 w-4.5 stroke-[2.2]" />
      </div>
      <div className="w-full">
        {title && (
          <h4 className="text-sm font-semibold tracking-wide text-sky-300 mb-1.5 flex items-center gap-1.5">
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm text-neutral-200/90 space-y-1.5 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const InstructionAlert: React.FC<AlertProps> = ({ title, children, className = '' }) => (
  <div
    className={`rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-rose-900/15 to-neutral-900/50 p-4 shadow-sm backdrop-blur-sm mb-4 transition-all ${className}`}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 shrink-0 shadow-inner mt-0.5">
        <BookOpen className="h-4.5 w-4.5 stroke-[2.2]" />
      </div>
      <div className="w-full">
        {title && (
          <h4 className="text-sm font-semibold tracking-wide text-rose-300 mb-1.5 flex items-center gap-1.5">
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm text-neutral-200/90 space-y-1.5 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </div>
);
