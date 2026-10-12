import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateTab?: (tabId: string) => void;
}

type ResupplyStatus = 'Approved' | 'Attempt';

export const O2ResupplyTab: React.FC<Props> = ({ showToast, onNavigateTab }) => {
  // Subject status toggle
  const [resupplyStatus, setResupplyStatus] = usePersistentState<ResupplyStatus>('o2res_resupplyStatus', 'Approved');

  // Form State
  const [allInfoSame, setAllInfoSame] = usePersistentState<string>('o2res_allInfoSame', 'Yes');
  const [infoChanges, setInfoChanges] = usePersistentState<string>('o2res_infoChanges', '');
  const [stationaryFilter, setStationaryFilter] = usePersistentState<string>('o2res_stationaryFilter', 'No');
  const [lastFilterChange, setLastFilterChange] = usePersistentState<string>('o2res_lastFilterChange', '');
  const [cannulasCount, setCannulasCount] = usePersistentState<string>('o2res_cannulasCount', '');
  const [papAdapter, setPapAdapter] = usePersistentState<string>('o2res_papAdapter', 'No');
  const [swivelAdapter, setSwivelAdapter] = usePersistentState<string>('o2res_swivelAdapter', 'No');
  const [additionalTubing, setAdditionalTubing] = usePersistentState<string>('o2res_additionalTubing', 'No');
  const [humidification, setHumidification] = usePersistentState<string>('o2res_humidification', 'No');
  const [waterTrap, setWaterTrap] = usePersistentState<string>('o2res_waterTrap', 'No');
  const [additionalSupplies, setAdditionalSupplies] = usePersistentState<string>('o2res_additionalSupplies', '');
  const [requestedItems, setRequestedItems] = usePersistentState<string>('o2res_requestedItems', '');
  const [remindRunPoc, setRemindRunPoc] = usePersistentState<string>('o2res_remindRunPoc', 'Yes');
  const [remindDustFilter, setRemindDustFilter] = usePersistentState<string>('o2res_remindDustFilter', 'Yes');
  const [doNotLeaveOnCharger, setDoNotLeaveOnCharger] = usePersistentState<string>('o2res_doNotLeaveOnCharger', 'Yes');
  const [anyAlarms, setAnyAlarms] = usePersistentState<string>('o2res_anyAlarms', 'No');
  const [comments, setComments] = usePersistentState<string>('o2res_comments', '');

  const subjectLine = `Oxygen Resupply ^${resupplyStatus}^`;

  const generateBody = (): string => {
    let infoText = allInfoSame;
    if (allInfoSame === 'No' && infoChanges.trim()) {
      infoText = `No - ${infoChanges.trim()}`;
    }

    const cleanFilterChange = lastFilterChange.trim();
    const cleanCannulas = cannulasCount.trim();
    const cleanTubing = additionalTubing.trim();
    const cleanAdditional = additionalSupplies.trim();
    const cleanRequested = requestedItems.trim();
    const cleanComments = comments.trim();

    return `QA-Oxygen Resupply Note Template

***Items such as POC Battery Replacements, Carrying Case Bags or Straps should be submitted under a QA - Supply Request note****

All Info the same (Demographics & Insurance): ${infoText}
Stationary Concentrator Filter: yes/no: ${stationaryFilter}
Last time PT changed filter: ${cleanFilterChange}
How many cannulas are you in need of?: ${cleanCannulas}
Does patient need an adapter for PAP?: ${papAdapter}
Does patient need swivel adapter (connects multiple tubes together)?: ${swivelAdapter}
Does patient need additional tubing (15ft, 25ft, 50ft)?: ${cleanTubing}
Is patient using humidification?: ${humidification}
Water Trap: yes/no: ${waterTrap}
Additional Supplies Requested: ${cleanAdditional}

Requested items (list item line):
${cleanRequested}

Remind PT to run POC at least 2 HRS per week: yes/no: ${remindRunPoc}
Remind PT to dust filter 1x a week: yes/no: ${remindDustFilter}
Do not leave POC on charger: yes/no: ${doNotLeaveOnCharger}
Any Alarms: yes/no: ${anyAlarms}

COMMENTS:
${cleanComments}`;
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
    setResupplyStatus('Approved');
    setAllInfoSame('Yes');
    setInfoChanges('');
    setStationaryFilter('No');
    setLastFilterChange('');
    setCannulasCount('');
    setPapAdapter('No');
    setSwivelAdapter('No');
    setAdditionalTubing('No');
    setHumidification('No');
    setWaterTrap('No');
    setAdditionalSupplies('');
    setRequestedItems('');
    setRemindRunPoc('Yes');
    setRemindDustFilter('Yes');
    setDoNotLeaveOnCharger('Yes');
    setAnyAlarms('No');
    setComments('');
    showToast('O2 Resupply form cleared!', 'info');
  };

  return (
    <div id="o2-resupply" className="tab-content active">
      <div className="form-section">
        <h3 className="mb-3">QA-Oxygen Resupply Note</h3>

        {/* Informational Guidance Notice from Template */}
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/15 to-neutral-900/50 p-4 shadow-sm backdrop-blur-sm flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 shrink-0 shadow-inner">
              <AlertTriangle className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <div className="text-xs sm:text-sm text-neutral-200/90 leading-relaxed">
              ***Items such as POC Battery Replacements, Carrying Case Bags or Straps should be submitted under a <strong className="text-amber-300 font-semibold">QA - Supply Request</strong> note****
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('supply-request')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white border border-amber-500/40 text-xs font-semibold cursor-pointer transition-colors shadow-sm ml-auto sm:ml-0"
            >
              Go to Supply Request Tab →
            </button>
          )}
        </div>

        {/* Resupply Subject Status Toggle */}
        <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C]">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
            Subject Line Status:
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {(['Approved', 'Attempt'] as ResupplyStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                className={`py-2 px-3 text-xs font-bold rounded-md border text-center cursor-pointer transition-all ${
                  resupplyStatus === st
                    ? 'toggle-btn-active'
                    : 'toggle-btn-inactive hover:bg-[#1E232C]'
                }`}
                onClick={() => setResupplyStatus(st)}
              >
                ^{st}^
              </button>
            ))}
          </div>
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
                placeholder="e.g., New address, updated phone, new insurance..."
              />
            </div>
          )}
        </div>

        {/* 2. Stationary Concentrator Filter & Last Changed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Stationary Concentrator Filter (yes/no):
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    stationaryFilter === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setStationaryFilter(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Last time PT changed filter:
            </label>
            <input
              type="text"
              value={lastFilterChange}
              onChange={(e) => setLastFilterChange(e.target.value)}
              placeholder="e.g., 3 months ago, 01/2026, never..."
            />
          </div>
        </div>

        {/* 3. Cannulas count */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            How many cannulas are you in need of?:
          </label>
          <input
            type="text"
            value={cannulasCount}
            onChange={(e) => setCannulasCount(e.target.value)}
            className="max-w-[200px]" placeholder="enter number or quantity"
          />
        </div>

        {/* 4. PAP Adapter & Swivel Adapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Does patient need an adapter for PAP?:
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    papAdapter === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setPapAdapter(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Does patient need swivel adapter (connects multiple tubes together)?:
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    swivelAdapter === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setSwivelAdapter(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Additional Tubing (15ft, 25ft, 50ft) */}
        <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C]">
          <label className="text-sm font-semibold text-neutral-200 mb-2 block">
            Does patient need additional tubing (15ft, 25ft, 50ft)?:
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {['No', '15ft', '25ft', '50ft'].map((t) => (
              <button
                key={t}
                type="button"
                className={`py-2.5 px-3 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                  additionalTubing === t
                    ? 'toggle-btn-active'
                    : 'toggle-btn-inactive hover:bg-[#1E232C]'
                }`}
                onClick={() => setAdditionalTubing(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={additionalTubing}
            onChange={(e) => setAdditionalTubing(e.target.value)}
            placeholder="Or type custom tubing length..."
          />
        </div>

        {/* 6. Humidification & Water Trap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Is patient using humidification?:
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    humidification === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setHumidification(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-[#333333] bg-[#1C1C1C]">
            <label className="text-sm font-semibold text-neutral-200 mb-2 block">
              Water Trap (yes/no):
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2.5 px-4 text-sm font-bold rounded-md border text-center cursor-pointer transition-all ${
                    waterTrap === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive hover:bg-[#1E232C]'
                  }`}
                  onClick={() => setWaterTrap(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 7. Additional Supplies Requested */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            Additional Supplies Requested:
          </label>
          <input
            type="text"
            value={additionalSupplies}
            onChange={(e) => setAdditionalSupplies(e.target.value)}
            placeholder="enter additional supplies or leave blank"
          />
        </div>

        {/* 8. Requested items (list item line) */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            Requested items (list item line):
          </label>
          <textarea
            rows={3}
            value={requestedItems}
            onChange={(e) => setRequestedItems(e.target.value)}
            placeholder="enter items line by line..."
          />
        </div>

        {/* 9. POC Reminders & Alarms Checks */}
        <div className="p-3.5 mb-4 rounded-md border border-[#333333] bg-[#1C1C1C] space-y-3.5">
          <div className="text-xs uppercase font-bold text-neutral-300 tracking-wider mb-2">
            Patient Reminders &amp; Equipment Safety Check:
          </div>

          <div className="flex items-center justify-start flex-wrap gap-6 pb-2.5 border-b border-[#333333]">
            <span className="text-sm text-neutral-200">
              Remind PT to run POC at least 2 HRS per week:
            </span>
            <div className="flex gap-2">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2 px-4 text-sm font-bold rounded border cursor-pointer ${
                    remindRunPoc === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive'
                  }`}
                  onClick={() => setRemindRunPoc(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-start flex-wrap gap-6 pb-2.5 border-b border-[#333333]">
            <span className="text-sm text-neutral-200">
              Remind PT to dust filter 1x a week:
            </span>
            <div className="flex gap-2">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2 px-4 text-sm font-bold rounded border cursor-pointer ${
                    remindDustFilter === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive'
                  }`}
                  onClick={() => setRemindDustFilter(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-start flex-wrap gap-6 pb-2.5 border-b border-[#333333]">
            <span className="text-sm text-neutral-200">
              Do not leave POC on charger:
            </span>
            <div className="flex gap-2">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2 px-4 text-sm font-bold rounded border cursor-pointer ${
                    doNotLeaveOnCharger === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive'
                  }`}
                  onClick={() => setDoNotLeaveOnCharger(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-start flex-wrap gap-6">
            <span className="text-sm text-neutral-200">
              Any Alarms:
            </span>
            <div className="flex gap-2">
              {['Yes', 'No'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-2 px-4 text-sm font-bold rounded border cursor-pointer ${
                    anyAlarms === val
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive'
                  }`}
                  onClick={() => setAnyAlarms(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 10. COMMENTS */}
        <div className="form-group mb-4">
          <label className="text-sm font-semibold text-neutral-200">
            COMMENTS:
          </label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter any additional comments..."
          />
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
        title="O2 Resupply Note Output"
      />
    </div>
  );
};
