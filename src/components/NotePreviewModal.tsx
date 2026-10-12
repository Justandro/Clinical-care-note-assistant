import React, { useState, useEffect } from 'react';
import { copyText } from '../utils/clipboard';

interface NotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSaveAndCopy?: (updatedText: string) => void;
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onSaveAndCopy,
  showToast,
}) => {
  const [editedText, setEditedText] = useState<string>(initialText);
  const [copied, setCopied] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [modalHeight, setModalHeight] = useState<'normal' | 'tall' | 'full'>('normal');

  // Sync with initial text whenever opened
  useEffect(() => {
    if (isOpen) {
      setEditedText(initialText);
      setCopied(false);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await copyText(editedText);
    if (ok) {
      setCopied(true);
      showToast('Note copied to clipboard!', 'success');
      if (onSaveAndCopy) {
        onSaveAndCopy(editedText);
      }
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast('Please press Ctrl+C (Cmd+C) to copy the highlighted text', 'info');
    }
  };

  const handleReset = () => {
    setEditedText(initialText);
    showToast('Reset to original template output', 'info');
  };

  return (
    <div
      className="notepad-backdrop"
      style={{ display: 'flex' }}
      onClick={(e) => {
        // Prevent accidental closing on backdrop click if user is editing
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`notepad-modal w-full transition-all duration-150 ${
          isMaximized
            ? 'max-w-6xl h-[92vh] max-h-[95vh]'
            : modalHeight === 'tall'
            ? 'max-w-4xl max-h-[90vh]'
            : 'max-w-2xl max-h-[85vh]'
        }`}
      >
        <div className="notepad-header flex items-center justify-between pb-3 border-b border-[#28303d]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <div>
              <h3 className="m-0 text-base font-bold text-[#E2E8F0]">
                Note Preview & Editor
              </h3>
              <p className="text-xs text-[#94a3b8] m-0">
                You can alter anything directly below before copying into your EHR. Closing the preview does not close automatically!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Modal Resize Controls */}
            <div className="flex items-center bg-[#0d0f12] p-1.5 rounded-md border border-neutral-800 text-xs shadow-inner mr-2 gap-2">
              <span className="text-[#94a3b8] px-1.5 font-semibold select-none">Window:</span>
              <button
                type="button"
                className={`px-3 py-1.5 rounded cursor-pointer transition-colors text-xs font-semibold ${
                  modalHeight === 'normal' && !isMaximized
                    ? 'bg-[#2563eb] text-white font-bold shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-700'
                }`}
                onClick={() => {
                  setIsMaximized(false);
                  setModalHeight('normal');
                }}
                title="Standard Size"
              >
                Normal
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded cursor-pointer transition-colors text-xs font-semibold ${
                  modalHeight === 'tall' && !isMaximized
                    ? 'bg-[#2563eb] text-white font-bold shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-700'
                }`}
                onClick={() => {
                  setIsMaximized(false);
                  setModalHeight('tall');
                }}
                title="Wide / Tall View"
              >
                Wide
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded cursor-pointer transition-colors text-xs font-semibold ${
                  isMaximized
                    ? 'bg-[#2563eb] text-white font-bold shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-700'
                }`}
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? 'Restore Normal Window' : 'Maximize Window'}
              >
                {isMaximized ? 'Restore' : 'Maximize'}
              </button>
            </div>

            <button
              type="button"
              className="notepad-close"
              onClick={onClose}
              title="Close Preview (will not close automatically)"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="status-info text-xs my-3 flex items-center justify-between gap-2">
          <span>
            ✏️ <strong>Editable:</strong> Modify any lines below. Drag corner <strong>↘</strong> to resize textarea. Click <strong>Copy Note</strong> when ready.
          </span>
          {editedText !== initialText && (
            <button
              type="button"
              className="text-xs text-[#f59e0b] hover:underline font-semibold shrink-0 cursor-pointer"
              onClick={handleReset}
            >
              ↺ Reset Changes
            </button>
          )}
        </div>

        <textarea
          className={`notepad-textarea font-mono text-xs leading-relaxed p-3 focus:outline-none focus:border-[#3b82f6] resize-y w-full ${
            isMaximized ? 'min-h-[60vh]' : modalHeight === 'tall' ? 'min-h-[420px]' : 'min-h-[280px]'
          }`}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder="Note text..."
          autoFocus
        />

        <div className="notepad-footer flex items-center justify-between flex-wrap gap-2 pt-3 mt-3 border-t border-[#28303d]">
          <span className="text-xs text-[#94a3b8]">
            {editedText.length} characters • {editedText.split('\n').length} lines
            {editedText !== initialText && (
              <span className="text-[#f59e0b] ml-1.5 font-medium">(Custom edits applied)</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn ${copied ? 'btn-success' : 'btn-primary'} text-xs font-bold flex items-center gap-1.5`}
              onClick={handleCopy}
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
