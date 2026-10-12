import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { formatLocalDate } from '../../utils/dateUtils';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateTab?: (tabId: string) => void;
}

export const O2PickupTab: React.FC<Props> = ({ showToast, onNavigateTab }) => {
  const subjectLine = 'QA-O2 Pickup';

  // Fields
  const [returnReason, setReturnReason] = usePersistentState<string>('o2p_returnReason', '');
  const [needsRl, setNeedsRl] = usePersistentState<string>('o2p_needsRl', 'No');
  const [trackingNumber, setTrackingNumber] = usePersistentState<string>('o2p_trackingNumber', '');
  const [returningItems, setReturningItems] = usePersistentState<string>('o2p_returningItems', '');
  const [hasBox, setHasBox] = usePersistentState<string>('o2p_hasBox', 'Yes');
  const [verifiedAddress, setVerifiedAddress] = usePersistentState<string>('o2p_verifiedAddress', 'Yes');

  // Format default pickup date a week from now (YYYY-MM-DD)
  const getOneWeekAhead = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatLocalDate(d);
  };

  const [pickupDate, setPickupDate] = usePersistentState<string>('o2p_pickupDate', getOneWeekAhead);

  const generateBody = (): string => {
    const cleanReason = returnReason.trim();
    const cleanTracking = trackingNumber.trim();
    const cleanItems = returningItems.trim();
    const cleanDate = pickupDate.trim();

    return `Why is patient returning unit(s)?: ${cleanReason}
Does patient need a RL ? yes/no: ${needsRl}
IF YES, request in QA-Return Label note and close this note*
RL Tracking #: ${cleanTracking}
What is the patient returning: ${cleanItems}
Does the patient has a box to put the concentrators in? (yes/no): ${hasBox}
IF NO, pt needs to put equipment in a box*
Did you verify the patient's address? (yes/no): ${verifiedAddress}
Date pt would like UPS to pick up equipment?: ${cleanDate}
Schedule app a week in advance*`;
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
    setReturnReason('');
    setNeedsRl('No');
    setTrackingNumber('');
    setReturningItems('');
    setHasBox('Yes');
    setVerifiedAddress('Yes');
    setPickupDate(getOneWeekAhead());
    showToast('O2 Pickup form cleared!', 'info');
  };

  return (
    <div id="o2-pickup" className="tab-content active">
      <div className="form-section">
        <h3 className="mb-3">QA-O2 Pickup Request</h3>

        {/* Guidance Instructions Card */}
        <div className="p-3.5 mb-4 rounded-md border border-white/40 bg-[#0f172a] text-xs text-neutral-300 space-y-1.5 leading-relaxed">
          <div className="flex items-start gap-2 text-white font-medium">
            <span className="text-sm">📦</span>
            <span>Use this note when a patient&apos;s O2 concentrators is ready to be picked up (machine is boxed and RL is on the box).</span>
          </div>
          <div className="text-neutral-400 pl-5">
            • If the patient is local, an NMI employee will contact the patient and pick up the patient&apos;s equipment, no RL needed.
          </div>
          <div className="text-neutral-400 pl-5">
            • This note should only be input when the equipment is ready for pick up.
          </div>
        </div>

        {/* 1. Why is patient returning unit(s)? */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            Why is patient returning unit(s)?:
          </label>
          <textarea
            rows={2}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Explain why patient is returning unit(s)..."
          />
        </div>

        {/* 2. Does patient need a RL ? yes/no */}
        <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C]">
          <div className="form-group mb-2">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Does patient need a RL ? (yes/no):
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    needsRl === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setNeedsRl(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Warning / Link when YES */}
          {needsRl === 'Yes' && (
            <div className="mt-3 p-2.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs flex items-center justify-between flex-wrap gap-2">
              <span>*IF YES, request in QA-Return Label note and close this note*</span>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('return-label')}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-500/40 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Go to Return Label Tab →
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. RL Tracking #: */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            RL Tracking #:
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            placeholder="Enter tracking number (e.g. 1Z... or Local Pickup)"
          />
        </div>

        {/* 4. What is the patient returning: */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            What is the patient returning:
          </label>
          <input
            type="text"
            value={returningItems}
            onChange={(e) => setReturningItems(e.target.value)}
            placeholder="enter items"
          />
        </div>

        {/* 5. Box Check & Address Verification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Box check */}
          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Does the patient has a box to put the concentrators in? (yes/no):
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs mb-2">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    hasBox === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setHasBox(val)}
                >
                  {val}
                </button>
              ))}
            </div>
            {hasBox === 'No' && (
              <div className="mt-2 text-xs text-amber-300">
                *IF NO, pt needs to put equipment in a box*
              </div>
            )}
          </div>

          {/* Address verification */}
          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Did you verify the patient&apos;s address? (yes/no):
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    verifiedAddress === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setVerifiedAddress(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Date pt would like UPS to pick up equipment? */}
        <div className="form-group mb-4 p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
            <label className="text-sm font-semibold text-neutral-200">
              Date pt would like UPS to pick up equipment?:
            </label>
            <span className="text-xs text-amber-400 font-medium">
              *Schedule app a week in advance*
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="max-w-xs"
            />
            <button
              type="button"
              onClick={() => setPickupDate(getOneWeekAhead())}
              className="px-4 py-2 rounded bg-[#262626] hover:bg-[#1E232C] text-xs text-neutral-300 border border-neutral-700 cursor-pointer"
            >
              Set 1 Week From Today
            </button>
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
        title="O2 Pickup Note Output"
      />
    </div>
  );
};
