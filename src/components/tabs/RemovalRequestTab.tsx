import React, { useState, useEffect } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import {
  removalReasonsList,
  removalReasonQuestions,
  getRemovalReasonDept
} from '../../data/removalReasons';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const RemovalRequestTab: React.FC<Props> = ({ showToast }) => {
  const [activeMachine, setActiveMachine] = usePersistentState<string>('rr_activeMachine', '');
  const [loaner, setLoaner] = usePersistentState<string>('rr_loaner', '');
  const [serial, setSerial] = usePersistentState<string>('rr_serial', '');
  const [reason, setReason] = usePersistentState<string>('rr_reason', '');
  const [dept, setDept] = usePersistentState<string>('rr_dept', 'CC');
  const [alwaysCC, setAlwaysCC] = usePersistentState<boolean>('rr_alwaysCC', true);
  const [questionAnswers, setQuestionAnswers] = usePersistentState<Record<number, string>>('rr_questionAnswers', {});
  const [mgr, setMgr] = usePersistentState<string>('rr_mgr', '');
  const [notes, setNotes] = usePersistentState<string>('rr_notes', '');

  const effectiveDept = alwaysCC ? 'CC' : (dept || 'CC');

  const handleReasonChange = (newReason: string) => {
    setReason(newReason);
    setQuestionAnswers({});
    if (!alwaysCC) {
      const reasonDept = getRemovalReasonDept(newReason);
      setDept(reasonDept);
    }
  };

  const handleToggleAlwaysCC = (checked: boolean) => {
    setAlwaysCC(checked);
    if (!checked) {
      const reasonDept = getRemovalReasonDept(reason);
      setDept(reasonDept);
      showToast(`Using reason department: ${reasonDept}`, 'info');
    } else {
      setDept('CC');
      showToast('Subject department locked to CC', 'info');
    }
  };

  const handleAnswerChange = (index: number, val: string) => {
    setQuestionAnswers((prev) => ({
      ...prev,
      [index]: val,
    }));
  };

  const generateTitle = (): string => `Removal Request^${effectiveDept}^`;

  const generateBody = (): string => {
    let body = `Does the patient have an ACTIVE RENTING machine? ${activeMachine}
Did we provide the patient with a loaner machine? ${loaner}
If yes, Serial Number: ${serial}

PLEASE CHOOSE ALL APPLICABLE REASONS:

${reason}`;

    const subQuestions = removalReasonQuestions[reason] || [];
    if (subQuestions.length > 0) {
      subQuestions.forEach((q, idx) => {
        const ans = questionAnswers[idx] || '';
        body += `\n   - ${q} ${ans}`;
      });
    }

    body += `\n\nPT REQUESTS TO SPEAK WITH MANAGER: ${mgr}\nNOTES/OTHER MISC. REASONS:\n${notes}`;
    return body.trim();
  };

  const handleCopyTitle = async () => {
    const ok = await copyText(generateTitle());
    if (ok) showToast('Title copied to clipboard!', 'success');
  };

  const handleCopyBody = async () => {
    const ok = await copyText(generateBody());
    if (ok) showToast('Body copied to clipboard!', 'success');
  };

  const handleClear = () => {
    setActiveMachine('');
    setLoaner('');
    setSerial('');
    setReason('');
    setDept('CC');
    setAlwaysCC(true);
    setQuestionAnswers({});
    setMgr('');
    setNotes('');
    showToast('Form cleared!', 'info');
  };

  const subQuestions = removalReasonQuestions[reason] || [];

  return (
    <div id="removal-request" className="tab-content active">
      <div className="form-section">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-gray-700/60 pb-2.5">
          <h3 className="m-0 flex items-center flex-wrap gap-0 font-semibold text-whitease sm:text-lg">
            <span>Subject: Removal Request^</span>
            <span id="rr_dept" className={`rr-dept-code ${alwaysCC ? 'toggled' : 'untoggled'}`}>
              {effectiveDept}
            </span>
            <span>^</span>
          </h3>

          <div className="flex items-center gap-2 select-none">
            <span className="text-xs font-semibold text-gray-300">Default CC:</span>
            <button
              type="button"
              id="rr_always_cc_toggle"
              role="switch"
              aria-checked={alwaysCC}
              title={
                alwaysCC
                  ? 'Default CC is ON (Subject always CC). Click to toggle OFF to use department keys from reasons (CUS, IOC, etc.)'
                  : 'Default CC is OFF (Using reason department key). Click to toggle ON'
              }
              onClick={() => handleToggleAlwaysCC(!alwaysCC)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                alwaysCC ? 'bg-[#2196F3]' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                  alwaysCC ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-bold transition-colors ${alwaysCC ? 'text-white' : 'text-neutral-400'}`}>
              {alwaysCC ? 'ON (CC)' : `OFF (${effectiveDept})`}
            </span>
          </div>
        </div>

        {!alwaysCC && (
          <div className="rr-dept-bar mb-4 p-3 rounded-lg border flex flex-wrap items-center gap-3">
            <span className="rr-dept-bar-label font-bold text-sm tracking-wide">Department Key:</span>
            <div className="flex flex-wrap items-center gap-2">
              {['CUS', 'IOC', 'CLM', 'PR', 'BLL', 'CC', 'CGM'].map((dKey) => (
                <button
                  key={dKey}
                  type="button"
                  className={`rr-dept-btn px-4 py-2 rounded text-sm font-bold cursor-pointer transition-all ${
                    dept === dKey ? 'active' : ''
                  }`}
                  onClick={() => setDept(dKey)}
                >
                  {dKey}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="rr-dept-bar-label text-sm font-medium">Custom:</span>
              <input
                type="text"
                className="rr-dept-input w-24 px-2.5 py-1 text-sm rounded font-bold uppercase font-mono tracking-wider"
                placeholder="KEY"
                value={dept}
                onChange={(e) => setDept(e.target.value.toUpperCase())}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Does the patient have an ACTIVE RENTING machine?</label>

          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="rr_active_machine"
                value="Yes"
                checked={activeMachine === 'Yes'}
                onChange={(e) => setActiveMachine(e.target.value)}
              />{' '}
              Yes
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="rr_active_machine"
                value="No"
                checked={activeMachine === 'No'}
                onChange={(e) => setActiveMachine(e.target.value)}
              />{' '}
              No
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Did we provide the patient with a loaner machine?</label>
          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="rr_loaner"
                value="Yes"
                checked={loaner === 'Yes'}
                onChange={(e) => setLoaner(e.target.value)}
              />{' '}
              Yes
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="rr_loaner"
                value="No"
                checked={loaner === 'No'}
                onChange={(e) => setLoaner(e.target.value)}
              />{' '}
              No
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rr_serial">If yes, Serial Number:</label>
          <input
            type="text"
            id="rr_serial"
            placeholder="Enter serial number"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rr_reason">
            <strong>PLEASE CHOOSE ALL APPLICABLE REASONS:</strong>
          </label>
          <select
            id="rr_reason"
            value={reason}
            onChange={(e) => handleReasonChange(e.target.value)}
          >
            <option value="">-- Select Reason --</option>
            {removalReasonsList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {subQuestions.length > 0 && (
          <div id="rr_questions_container" className="my-3 space-y-3 p-4 bg-[#262626] border border-[#333333] rounded-md">
            {subQuestions.map((q, idx) => (
              <div key={idx} className="form-group mb-0">
                <label className="text-sm text-neutral-400 mb-1">{q}</label>
                <input
                  type="text"
                  id={`rr_q_${idx}`}
                  className="rr_q_input"
                  placeholder="Enter answer here..."
                  value={questionAnswers[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label>PT REQUESTS TO SPEAK WITH MANAGER:</label>
          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="rr_mgr"
                value="Yes"
                checked={mgr === 'Yes'}
                onChange={(e) => setMgr(e.target.value)}
              />{' '}
              Yes
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="rr_mgr"
                value="No"
                checked={mgr === 'No'}
                onChange={(e) => setMgr(e.target.value)}
              />{' '}
              No
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rr_notes">NOTES / OTHER MISC. REASONS:</label>
          <textarea
            id="rr_notes"
            placeholder="Enter any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="btn-group flex items-center flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={handleCopyTitle}>
          Copy Title
        </button>
        <button type="button" className="btn btn-primary" onClick={handleCopyBody}>
          Copy Body
        </button>
        <button type="button" className="btn btn-danger" onClick={handleClear}>
          Clear
        </button>
      </div>

      <GeneratedNotePreview generatedText={generateBody()} showToast={showToast} />
    </div>
  );
};
