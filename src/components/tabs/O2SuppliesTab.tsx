import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const REASON_OPTIONS = [
  'Worn',
  'Dirty',
  'Cracked',
  'Discolored',
  'Stretched',
  'Uncomfortable',
];

export const O2SuppliesTab: React.FC<Props> = ({ showToast }) => {
  const subjectLine = 'Oxygen Requesting Supplies';

  // Form State
  const [allInfoSame, setAllInfoSame] = usePersistentState<string>('o2s_allInfoSame', 'Yes');
  const [infoChanges, setInfoChanges] = usePersistentState<string>('o2s_infoChanges', '');
  const [itemsRequested, setItemsRequested] = usePersistentState<string>('o2s_itemsRequested', '');
  const [selectedReasons, setSelectedReasons] = usePersistentState<string[]>('o2s_selectedReasons', ['Worn']);
  const [isCustomReasonActive, setIsCustomReasonActive] = usePersistentState<boolean>('o2s_isCustomReasonActive', false);
  const [customReason, setCustomReason] = usePersistentState<string>('o2s_customReason', '');
  const [comments, setComments] = usePersistentState<string>('o2s_comments', '');
  const [hubSignup, setHubSignup] = usePersistentState<string>('o2s_hubSignup', 'Yes');

  const toggleReason = (r: string) => {
    setSelectedReasons((prev) =>
      prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]
    );
  };

  const generateBody = (): string => {
    const cleanItems = itemsRequested.trim();
    
    // Combine multi-selected reasons + custom reason if toggle active
    const reasonsList = [...selectedReasons];
    if (isCustomReasonActive && customReason.trim() && !reasonsList.includes(customReason.trim())) {
      reasonsList.push(customReason.trim());
    }
    const cleanReason = reasonsList.join(', ') || 'Worn';
    const cleanComments = comments.trim();

    let infoText = allInfoSame;
    if (allInfoSame === 'No' && infoChanges.trim()) {
      infoText = `No - ${infoChanges.trim()}`;
    }

    return `Supply Type: O2
All Info the same (Demographics & Insurance): ${infoText}
Items Requested: ${cleanItems}
Reason for replacement: ${cleanReason}
Additional Comments or Changes: ${cleanComments}
Did you ask the patient if they want to sign up for E-Statements and smartphone app (Pt HUB)? Yes/No: ${hubSignup}`;
  };

  const handleCopySubject = async () => {
    const ok = await copyText(subjectLine);
    if (ok) showToast(`Subject "${subjectLine}" copied!`, 'success');
  };

  const handleCopyBody = async () => {
    const ok = await copyText(generateBody());
    if (ok) showToast('Note body copied to clipboard!', 'success');
  };

  const handleClear = () => {
    setAllInfoSame('Yes');
    setInfoChanges('');
    setItemsRequested('');
    setSelectedReasons(['Worn']);
    setIsCustomReasonActive(false);
    setCustomReason('');
    setComments('');
    setHubSignup('Yes');
    showToast('O2 Supplies form cleared!', 'info');
  };

  return (
    <div id="o2-supplies" className="tab-content active">
      <div className="form-section">
        <h3 className="mb-3">Oxygen Requesting Supplies</h3>

        {/* Fixed Supply Type Banner */}
        <div className="p-3 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C] flex items-center justify-between">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Supply Type:
          </div>
          <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-bold text-xs">
            O2
          </span>
        </div>

        {/* 1. All Info the same (Demographics & Insurance) */}
        <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C]">
          <label className="text-sm font-semibold text-neutral-200 mb-2 block">
            All Info the same (Demographics &amp; Insurance):
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs mb-2">
            {['Yes', 'No'].map((val) => (
              <button
                key={val}
                type="button"
                className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                  allInfoSame === val
                    ? 'toggle-btn-active'
                    : 'toggle-btn-inactive hover:bg-[#1E232C]'
                }`}
                onClick={() => setAllInfoSame(val)}
              >
                {val}
              </button>
            ))}
          </div>

          {allInfoSame === 'No' && (
            <div className="mt-3">
              <label className="text-xs font-medium text-amber-300 mb-1 block">
                Specify demographic or insurance changes:
              </label>
              <input
                type="text"
                value={infoChanges}
                onChange={(e) => setInfoChanges(e.target.value)}
                placeholder="e.g., New address, updated primary insurance..."
              />
            </div>
          )}
        </div>

        {/* 2. Items Requested (No quick-add chips, clean input) */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            Items Requested:
          </label>
          <input
            type="text"
            value={itemsRequested}
            onChange={(e) => setItemsRequested(e.target.value)}
            placeholder="enter items"
          />
        </div>

        {/* 3. Reason for replacement (Multi-select allowed) */}
        <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <label className="text-sm font-semibold text-neutral-200">
              Reason for replacement:
            </label>
            <span className="text-xs text-neutral-400">
              (Select one or more reasons)
            </span>
          </div>

          {/* Multi-select Reason Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
            {REASON_OPTIONS.map((r) => {
              const isSelected = selectedReasons.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  className={`py-2.5 px-3 text-sm font-bold rounded-md border text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => toggleReason(r)}
                >
                  <span>{isSelected ? '✓' : '+'}</span>
                  <span>{r}</span>
                </button>
              );
            })}

            {/* Custom Reason Toggle Button */}
            <button
              type="button"
              className={`py-2.5 px-3 text-sm font-bold rounded-md border text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                isCustomReasonActive
                  ? 'toggle-btn-active'
                  : 'toggle-btn-inactive hover:bg-[#1E232C]'
              }`}
              onClick={() => setIsCustomReasonActive((prev) => !prev)}
            >
              <span>{isCustomReasonActive ? '✓' : '+'}</span>
              <span>Other / Custom</span>
            </button>
          </div>

          {/* Custom reason input shown ONLY when active */}
          {isCustomReasonActive && (
            <div className="mt-2.5">
              <label className="text-xs font-semibold text-white mb-1.5 block">
                Type custom replacement reason:
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason..."
                autoFocus
              />
            </div>
          )}
        </div>

        {/* 4. Additional Comments or Changes */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            Additional Comments or Changes:
          </label>
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter any additional comments, special delivery notes, or changes..."
          />
        </div>

        {/* 5. Did you ask the patient if they want to sign up for E-Statements and smartphone app (Pt HUB)? Yes/No */}
        <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C]">
          <label className="text-sm font-semibold text-neutral-200 mb-2 block">
            Did you ask the patient if they want to sign up for E-Statements and smartphone app (Pt HUB)? (Yes/No):
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {['Yes', 'No'].map((val) => (
              <button
                key={val}
                type="button"
                className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                  hubSignup === val
                    ? 'toggle-btn-active'
                    : 'toggle-btn-inactive hover:bg-[#1E232C]'
                }`}
                onClick={() => setHubSignup(val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-group mt-4 flex items-center flex-wrap gap-2 pt-3 border-t border-[#333333]">
          <button type="button" className="btn btn-primary" onClick={handleCopySubject}>
            Copy Subject ({subjectLine})
          </button>
          <button type="button" className="btn btn-success" onClick={handleCopyBody}>
            Copy Note Body
          </button>
          <button type="button" className="btn btn-danger" onClick={handleClear}>
            Clear Form
          </button>
        </div>
      </div>

      {/* Generated Note Preview */}
      <GeneratedNotePreview
        generatedText={generateBody()}
        showToast={showToast}
        title="O2 Supplies Note Output"
      />
    </div>
  );
};
