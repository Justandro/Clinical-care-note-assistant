import React, { useEffect, useRef, useState } from 'react';
import { copyText } from '../utils/clipboard';
import { formatLocalDate } from '../utils/dateUtils';

interface NotepadModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const NotepadModal: React.FC<NotepadModalProps> = ({
  isOpen,
  onClose,
  notes,
  onNotesChange,
  showToast,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSave = () => {
    try {
      localStorage.setItem('care_note_notepad', notes);
      sessionStorage.setItem('care_note_notepad', notes);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(now);
      showToast('Notepad content saved successfully!', 'success');
    } catch (e) {
      showToast('Error saving to local storage', 'error');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S') && isOpen) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, notes]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!notes.trim()) {
      showToast('Notepad is empty!', 'warning');
      return;
    }
    const ok = await copyText(notes);
    if (ok) {
      showToast('Notepad content copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    if (!notes.trim()) {
      showToast('Notepad is empty!', 'warning');
      return;
    }
    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `care_notes_${formatLocalDate(new Date())}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded notepad as .txt file!', 'success');
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all notepad content? This cannot be undone.')) {
      onNotesChange('');
      try {
        localStorage.setItem('care_note_notepad', '');
        sessionStorage.setItem('care_note_notepad', '');
      } catch (e) {}
      setLastSavedTime('');
      showToast('Notepad cleared!', 'info');
    }
  };

  return (
    <div
      id="notepadOverlay"
      className="notepad-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="notepad-modal" id="notepad-modal-dialog">
        <div className="notepad-header">
          <h3>
            <span className="emoji">📝 </span>Shared Notepad
          </h3>
          <button
            type="button"
            id="notepad-close-btn"
            className="notepad-close"
            onClick={onClose}
            title="Close notepad"
          >
            ×
          </button>
        </div>

        <textarea
          id="notepadText"
          ref={textareaRef}
          className="notepad-textarea"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={() => {
            try {
              localStorage.setItem('care_note_notepad', notes);
            } catch (e) {}
          }}
          placeholder={`Your shared notes across all tabs...\n\nThis notepad is persistent and accessible from all tabs.`}
        />

        <div className="notepad-actions flex-wrap gap-2">
          <div className="notepad-info flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{lastSavedTime ? `Saved at ${lastSavedTime}` : 'Auto-saved locally • Shared across all tabs'}</span>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              type="button"
              id="notepad-save-btn"
              className="btn btn-primary font-bold flex items-center gap-1.5"
              onClick={handleSave}
              title="Save notes (Ctrl+S)"
            >
              <span>💾</span> Save
            </button>
            <button
              type="button"
              id="notepad-download-btn"
              className="btn btn-secondary flex items-center gap-1.5"
              onClick={handleDownload}
              title="Download notes as text file"
            >
              <span>📥</span> Export .txt
            </button>
            <button
              type="button"
              id="notepad-copy-btn"
              className="btn btn-success flex items-center gap-1.5"
              onClick={handleCopy}
            >
              Copy Notes
            </button>
            <button
              type="button"
              id="notepad-clear-btn"
              className="btn btn-danger flex items-center gap-1.5"
              onClick={handleClear}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
