import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateTab?: (tabId: string) => void;
}

type RuwMode = 'ruw' | 'swap';

export const O2RuwSwapTab: React.FC<Props> = ({ showToast, onNavigateTab }) => {
  // Mode: either 'ruw' (Replacement for broken unit <5 yrs) OR 'swap' (Swap out to change models <5 yrs)
  const [activeMode, setActiveMode] = usePersistentState<RuwMode>('o2rs_activeMode', 'ruw');

  // Fields (empty by default)
  const [troubleshoot, setTroubleshoot] = usePersistentState<string>('o2rs_troubleshoot', '');
  const [returnItems, setReturnItems] = usePersistentState<string>('o2rs_returnItems', '');
  const [serialNumber, setSerialNumber] = usePersistentState<string>('o2rs_serialNumber', '');
  const [make, setMake] = usePersistentState<string>('o2rs_make', '');
  const [model, setModel] = usePersistentState<string>('o2rs_model', '');
  const [lpm, setLpm] = usePersistentState<string>('o2rs_lpm', '2');
  const [isAwarePowerCord, setIsAwarePowerCord] = usePersistentState<string>('o2rs_isAwarePowerCord', 'Yes');
  const [issueDetails, setIssueDetails] = usePersistentState<string>('o2rs_issueDetails', '');

  // Swap-Out Specific Fields (only needed when switching models)
  const [switchMake, setSwitchMake] = usePersistentState<string>('o2rs_switchMake', '');
  const [switchModel, setSwitchModel] = usePersistentState<string>('o2rs_switchModel', '');
  const [switchLpm, setSwitchLpm] = usePersistentState<string>('o2rs_switchLpm', '2');
  const [reasonForReturn, setReasonForReturn] = usePersistentState<string>('o2rs_reasonForReturn', '');

  // Subject line dynamically determined by mode (Replacement vs Swap Out)
  const subjectLine =
    activeMode === 'ruw' ? 'QA-O2 Replacement Request' : 'QA-O2 Swap Out Request';

  const generateBody = (): string => {
    const cleanTroubleshoot = troubleshoot.trim();
    const cleanReturnItems = returnItems.trim();
    const cleanSerial = serialNumber.trim();
    const cleanMake = make.trim();
    const cleanModel = model.trim();
    const cleanLpm = lpm.trim() || '2';
    const cleanIssue = issueDetails.trim();

    if (activeMode === 'ruw') {
      return `PLEASE EXPLAIN WHAT WAS DONE TO TROUBLESHOOT DEVICE: ${cleanTroubleshoot}

RUW - LESS THAN 5 YEARS / MACHINE BROKEN
Patient will RETURN the following items (REQUIRED): ${cleanReturnItems}
SERIAL NUMBER OF UNIT TO BE SWAPPED: ${cleanSerial}
Make: ${cleanMake}
Model: ${cleanModel}
LPM: ${cleanLpm}
Is patient aware power cord needs to be returned with unit? ${isAwarePowerCord}
WHAT DETAILED ISSUE IS PT EXPERIENCING?: ${cleanIssue}`;
    }

    // activeMode === 'swap'
    const cleanSwitchMake = switchMake.trim();
    const cleanSwitchModel = switchModel.trim();
    const cleanSwitchLpm = switchLpm.trim() || '2';
    const cleanReason = reasonForReturn.trim();

    return `PLEASE EXPLAIN WHAT WAS DONE TO TROUBLESHOOT DEVICE: ${cleanTroubleshoot}

SWAP OUT - WITHIN 5 YRS (USE IF PT IS REQUESTING TO CHANGE MODELS BUT MACHINE WORKS FINE)
Patient will RETURN the following items (REQUIRED): ${cleanReturnItems}
SERIAL NUMBER OF UNIT TO BE SWAPPED: ${cleanSerial}
Make: ${cleanMake}
Model: ${cleanModel}
LPM: ${cleanLpm}
Is patient aware power cord needs to be returned with unit? ${isAwarePowerCord}
Patient will be SWITCHING to the following items (REQUIRED): 
Make: ${cleanSwitchMake}
Model: ${cleanSwitchModel}
LPM: ${cleanSwitchLpm}
REASON FOR RETURN (Must fill out entire template to issue the patient is having.)
${cleanReason}
WHAT DETAILED ISSUE IS PT EXPERIENCING?: ${cleanIssue}`;
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
    setTroubleshoot('');
    setReturnItems('');
    setSerialNumber('');
    setMake('');
    setModel('');
    setLpm('2');
    setIsAwarePowerCord('Yes');
    setIssueDetails('');
    setSwitchMake('');
    setSwitchModel('');
    setSwitchLpm('2');
    setReasonForReturn('');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="o2-ruw-swap" className="tab-content active">
      <div className="form-section">
        {/* Title */}
        <h3 className="mb-3">
          QA-O2 {activeMode === 'ruw' ? 'Replacement (RUW)' : 'Swap Out'} Request
        </h3>

        {/* 5-Year Rule Notice Banner with Link to CC-O2 */}
        <div className="p-3 mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-whitease">⚠️</span>
            <span>
              <strong>GREATER THAN 5 YEARS?</strong> Use the <strong>CC-O2 Replacement Request Note</strong> instead.
            </span>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('o2-replacement')}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-500/40 text-xs font-semibold cursor-pointer transition-colors"
            >
              Go to CC-O2 (&gt;5yr) Tab →
            </button>
          )}
        </div>

        {/* Big, Clear Request Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
            Select Request Type:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                activeMode === 'ruw'
                  ? 'bg-neutral-800 border-white text-white shadow-md ring-2 ring-white/60'
                  : 'toggle-btn-inactive'
              }`}
              onClick={() => setActiveMode('ruw')}
            >
              <div className="font-bold text-sm flex items-center gap-2">
                <span className="text-whitease">🔴</span> RUW (Broken &lt; 5 Yrs)
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Machine broken or malfunctioning — replacement requested
              </div>
            </button>

            <button
              type="button"
              className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                activeMode === 'swap'
                  ? 'bg-neutral-800 border-white text-white shadow-md ring-2 ring-white/60'
                  : 'toggle-btn-inactive'
              }`}
              onClick={() => setActiveMode('swap')}
            >
              <div className="font-bold text-sm flex items-center gap-2">
                <span className="text-whitease">🔄</span> Swap Out (Change Models &lt; 5 Yrs)
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Machine works fine — patient requesting to change models
              </div>
            </button>
          </div>
        </div>


        {/* 1. Troubleshooting Device (Common to both) */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            PLEASE EXPLAIN WHAT WAS DONE TO TROUBLESHOOT DEVICE:
          </label>
          <textarea
            rows={3}
            value={troubleshoot}
            onChange={(e) => setTroubleshoot(e.target.value)}
            placeholder="Explain what was done to troubleshoot device..."
          />
        </div>

        {/* ========================================================= */}
        {/* MODE A: RUW (LESS THAN 5 YEARS / MACHINE BROKEN)          */}
        {/* ========================================================= */}
        {activeMode === 'ruw' && (
          <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <div className="text-xs uppercase font-bold text-red-400 tracking-wider mb-3">
              RUW - LESS THAN 5 YEARS / MACHINE BROKEN
            </div>

            <div className="form-group mb-3">
              <label>Patient will RETURN the following items (REQUIRED):</label>
              <input
                type="text"
                value={returnItems}
                onChange={(e) => setReturnItems(e.target.value)}
                placeholder="enter items"
              />
            </div>

            <div className="form-group mb-3">
              <label>SERIAL NUMBER OF UNIT TO BE SWAPPED:</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                placeholder="Enter serial number..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="form-group">
                <label>Make:</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Make"
                />
              </div>

              <div className="form-group">
                <label>Model:</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 items-end">
              <div className="form-group">
                <label>LPM:</label>
                <input
                  type="text"
                  value={lpm}
                  onChange={(e) => setLpm(e.target.value)}
                  placeholder="2"
                />
              </div>

              <div className="form-group">
                <label className="block mb-1.5 font-medium text-xs text-neutral-300">
                  Is patient aware power cord needs to be returned with unit?:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Yes', 'No'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                        isAwarePowerCord === val
                          ? 'toggle-btn-active'
                          : 'toggle-btn-inactive hover:bg-[#1E232C]'
                      }`}
                      onClick={() => setIsAwarePowerCord(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-semibold text-neutral-200">
                WHAT DETAILED ISSUE IS PT EXPERIENCING?:
              </label>
              <textarea
                rows={3}
                value={issueDetails}
                onChange={(e) => setIssueDetails(e.target.value)}
                placeholder="Explain the detailed issue the patient is experiencing with the broken unit..."
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE B: SWAP OUT (WITHIN 5 YRS - MODEL CHANGE)            */}
        {/* ========================================================= */}
        {activeMode === 'swap' && (
          <div className="p-3.5 mb-4 rounded-md border border-white/40 bg-[#1C1C1C]">
            <div className="text-xs uppercase font-bold text-white tracking-wider mb-3">
              SWAP OUT - WITHIN 5 YRS (USE IF PT IS REQUESTING TO CHANGE MODELS BUT MACHINE WORKS FINE)
            </div>

            {/* Return items section */}
            <div className="form-group mb-3">
              <label>Patient will RETURN the following items (REQUIRED):</label>
              <input
                type="text"
                value={returnItems}
                onChange={(e) => setReturnItems(e.target.value)}
                placeholder="enter items"
              />
            </div>

            <div className="form-group mb-3">
              <label>SERIAL NUMBER OF UNIT TO BE SWAPPED:</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                placeholder="Enter serial number..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="form-group">
                <label>Make:</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Make"
                />
              </div>

              <div className="form-group">
                <label>Model:</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 items-end">
              <div className="form-group">
                <label>LPM:</label>
                <input
                  type="text"
                  value={lpm}
                  onChange={(e) => setLpm(e.target.value)}
                  placeholder="2"
                />
              </div>

              <div className="form-group">
                <label className="block mb-1.5 font-medium text-xs text-neutral-300">
                  Is patient aware power cord needs to be returned with unit?:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Yes', 'No'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                        isAwarePowerCord === val
                          ? 'toggle-btn-active'
                          : 'toggle-btn-inactive hover:bg-[#1E232C]'
                      }`}
                      onClick={() => setIsAwarePowerCord(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Switching to items */}
            <div className="p-3 mb-3 rounded border border-[#333333] bg-[#1C1C1C]">
              <div className="text-xs uppercase font-bold text-neutral-300 tracking-wide mb-2.5">
                Patient will be SWITCHING to the following items (REQUIRED):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="form-group">
                  <label>Make:</label>
                  <input
                    type="text"
                    value={switchMake}
                    onChange={(e) => setSwitchMake(e.target.value)}
                    placeholder="Switch Make"
                  />
                </div>

                <div className="form-group">
                  <label>Model:</label>
                  <input
                    type="text"
                    value={switchModel}
                    onChange={(e) => setSwitchModel(e.target.value)}
                    placeholder="Switch Model"
                  />
                </div>

                <div className="form-group">
                  <label>LPM (default 2):</label>
                  <input
                    type="text"
                    value={switchLpm}
                    onChange={(e) => setSwitchLpm(e.target.value)}
                    placeholder="2"
                  />
                </div>
              </div>
            </div>

            {/* Reason for return */}
            <div className="form-group mb-3">
              <label className="text-sm font-semibold text-neutral-200">
                REASON FOR RETURN (Must fill out entire template to issue the patient is having.):
              </label>
              <textarea
                rows={2}
                value={reasonForReturn}
                onChange={(e) => setReasonForReturn(e.target.value)}
                placeholder="Explain the full reason the patient is requesting to change models..."
              />
            </div>

            {/* Issue */}
            <div className="form-group">
              <label className="text-sm font-semibold text-neutral-200">
                WHAT DETAILED ISSUE IS PT EXPERIENCING?:
              </label>
              <textarea
                rows={2}
                value={issueDetails}
                onChange={(e) => setIssueDetails(e.target.value)}
                placeholder="Explain what issue the patient is experiencing..."
              />
            </div>
          </div>
        )}

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

      {/* Generated Note Preview with resize, collapse, quick copy */}
      <GeneratedNotePreview
        generatedText={generateBody()}
        showToast={showToast}
        title={activeMode === 'ruw' ? 'RUW Note Output' : 'Swap Out Note Output'}
      />
    </div>
  );
};
