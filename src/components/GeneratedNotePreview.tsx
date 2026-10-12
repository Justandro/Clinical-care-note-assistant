import React, { useState, useEffect, useRef } from 'react';
import { copyText } from '../utils/clipboard';
import { NotePreviewModal } from './NotePreviewModal';

interface GeneratedNotePreviewProps {
  generatedText: string;
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  title?: string;
  className?: string;
}

type HeightPreset = 'compact' | 'medium' | 'tall' | 'fit';

export const GeneratedNotePreview: React.FC<GeneratedNotePreviewProps> = ({
  generatedText,
  showToast,
  title = 'Generated Note Preview',
  className = '',
}) => {
  const [currentText, setCurrentText] = useState<string>(generatedText);
  const [isCustomized, setIsCustomized] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [heightPreset, setHeightPreset] = useState<HeightPreset>('medium');
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with generated form text if user hasn't made custom manual edits
  useEffect(() => {
    if (!isCustomized) {
      setCurrentText(generatedText);
    }
  }, [generatedText, isCustomized]);

  const applyPreset = (preset: HeightPreset) => {
    setHeightPreset(preset);
    if (textareaRef.current) {
      if (preset === 'compact') {
        textareaRef.current.style.height = '130px';
        setCustomHeight(130);
      } else if (preset === 'medium') {
        textareaRef.current.style.height = '230px';
        setCustomHeight(230);
      } else if (preset === 'tall') {
        textareaRef.current.style.height = '420px';
        setCustomHeight(420);
      } else if (preset === 'fit') {
        textareaRef.current.style.height = 'auto';
        const targetHeight = Math.max(140, Math.min(900, textareaRef.current.scrollHeight + 15));
        textareaRef.current.style.height = `${targetHeight}px`;
        setCustomHeight(targetHeight);
      }
    }
  };

  // Sync initial height on mount or preset change
  useEffect(() => {
    applyPreset(heightPreset);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
    setIsCustomized(true);
  };

  const handleReset = () => {
    setCurrentText(generatedText);
    setIsCustomized(false);
    showToast('Reset to original form output', 'info');
  };

  const handleCopy = async () => {
    const textToCopy = currentText || generatedText;
    const ok = await copyText(textToCopy);
    if (ok) {
      setCopied(true);
      showToast('Note copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Please select text and press Ctrl+C to copy', 'info');
    }
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  };

  return (
    <div className={`mt-5 p-4 rounded-lg border border-[#2f3747] bg-[#16191f] shadow-md transition-all ${className}`}>
      {/* Header Bar */}
      <div className={`flex items-center justify-between flex-wrap gap-2.5 ${isCollapsed ? 'mb-0 pb-0 border-b-0' : 'mb-3 pb-2.5 border-b border-[#28303d]'}`}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 text-left"
            title={isCollapsed ? "Click to expand note preview" : "Click to collapse note preview"}
          >
            <span className="text-sm">{isCollapsed ? '📁' : '📝'}</span>
            <span className="text-xs uppercase font-bold text-neutral-300 tracking-wider">
              {title}
            </span>
            <span className="text-xs text-[#60a5fa] font-mono">
              {isCollapsed ? '▼ [Click to Show]' : '▲'}
            </span>
          </button>

          {isCustomized && (
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
              Custom Edited
            </span>
          )}

          {isCollapsed && (
            <span className="text-xs text-[#94a3b8] font-mono bg-[#0d0f12] px-2.5 py-0.5 rounded border border-[#262c37]">
              {currentText.split('\n').length} lines • {currentText.length} chars
            </span>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Edit in Preview Window Modal */}
          <button
            type="button"
            className="text-xs text-[#38bdf8] hover:text-[#7dd3fc] font-semibold cursor-pointer flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-neutral-900 border border-transparent hover:border-[#38bdf8]/30 transition-colors"
            onClick={() => setIsModalOpen(true)}
            title="Open in a large dedicated window for full focus editing"
          >
            <span>✏️</span>
            <span>Edit in Window</span>
          </button>

          {/* Quick Copy Button */}
          <button
            type="button"
            className={`text-xs ${
              copied ? 'text-emerald-400 font-extrabold bg-emerald-950/40 border-emerald-500/40' : 'text-[#10b981] hover:text-[#34d399] border border-transparent hover:border-[#34d399]/30 hover:bg-neutral-900'
            } font-semibold cursor-pointer flex items-center gap-1.5 py-1.5 px-3 rounded transition-colors`}
            onClick={handleCopy}
            title="Copy current preview text directly to clipboard"
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Copied!' : 'Quick Copy Note'}</span>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Editable Resizable Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              style={customHeight ? { height: `${customHeight}px` } : undefined}
              className="w-full bg-[#0d0f12] text-[#e2e8f0] border border-[#262c37] rounded p-3 font-mono text-xs leading-relaxed focus:outline-none focus:border-[#3b82f6] resize-y min-h-[120px] transition-colors"
              value={currentText}
              onChange={handleTextChange}
              placeholder="Note content will appear here..."
              title="Directly editable! You can click and alter any line. Drag bottom-right corner ↘ to freely resize."
            />
          </div>

          {/* Footer Info & Helpers */}
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mt-2 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span>
                Click to edit directly. Drag corner <strong>↘</strong> to resize height.
              </span>
              <button
                type="button"
                className="text-[#60a5fa] hover:underline cursor-pointer"
                onClick={handleSelectAll}
              >
                Highlight All
              </button>
              {isCustomized && (
                <button
                  type="button"
                  className="text-[#f59e0b] hover:underline cursor-pointer font-medium"
                  onClick={handleReset}
                >
                  ↺ Reset to Form Output
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#64748b]">
                {currentText.length} chars • {currentText.split('\n').length} lines
              </span>
              <button
                type="button"
                className="text-[#60a5fa] hover:underline font-medium cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                Open Full Editable Preview ↗
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dedicated Preview Modal */}
      <NotePreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialText={currentText}
        onSaveAndCopy={(updatedText) => {
          setCurrentText(updatedText);
          setIsCustomized(true);
        }}
        showToast={showToast}
      />
    </div>
  );
};
