import React, { useState } from 'react';
import { copyText } from '../utils/clipboard';

interface CopyFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const CopyFallbackModal: React.FC<CopyFallbackModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectAll = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select();
  };

  const handleCopyClick = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Please press Ctrl+C (Cmd+C) to copy the highlighted text', 'info');
    }
  };

  return (
    <div
      className="notepad-backdrop"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="notepad-modal max-w-xl">
        <div className="notepad-header flex items-center justify-between pb-3 border-b border-[#28303d]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="m-0 text-base font-bold text-[#E2E8F0]">{title}</h3>
          </div>
          <button
            type="button"
            className="notepad-close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="status-info text-xs my-3">
          <strong>Select & Copy:</strong> The text is automatically selected below. You can click <strong>Copy Text</strong> or press <kbd className="bg-black/40 px-1 py-0.5 rounded text-white">Ctrl+C</kbd> (or <kbd className="bg-black/40 px-1 py-0.5 rounded text-white">Cmd+C</kbd>) on your keyboard to copy and paste into your EHR / note.
        </div>

        <textarea
          className="notepad-textarea min-h-[180px] font-mono text-xs select-all"
          value={text}
          readOnly
          autoFocus
          onFocus={handleSelectAll}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />

        <div className="notepad-footer flex items-center justify-between pt-3 mt-3 border-t border-[#28303d]">
          <span className="text-xs text-[#94a3b8]">
            {text.length} characters • {text.split('\n').length} lines
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary text-xs"
              onClick={onClose}
            >
              Done
            </button>
            <button
              type="button"
              className={`btn ${copied ? 'btn-success' : 'btn-primary'} text-xs font-bold`}
              onClick={handleCopyClick}
            >
              {copied ? '✓ Copied!' : 'Copy Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
