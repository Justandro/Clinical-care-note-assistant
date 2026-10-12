import React, { useState, useEffect } from 'react';
import { getCurrentDatePST, calculateComplianceDays, ComplianceCalculationResult } from '../../utils/dateUtils';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { WarningAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export type RiskDncReason =
  | '3_days_over_4_hours'
  | 'active_order'
  | 'removal_request'
  | 'returned_device'
  | 'called_recently'
  | 'acknowledgement_note'
  | 'corporate_pt';

export interface RiskDncOption {
  id: RiskDncReason;
  label: string;
  defaultComment: string;
}

export const RISK_DNC_OPTIONS: RiskDncOption[] = [
  {
    id: '3_days_over_4_hours',
    label: '3+ days > 4 hours',
    defaultComment: 'PT has been using the PAP for 3 days in a row with more than 4 hours',
  },
  {
    id: 'active_order',
    label: 'PT has an active order',
    defaultComment: 'PT has an active order',
  },
  {
    id: 'removal_request',
    label: 'PT has a removal request/RL',
    defaultComment: 'PT has a removal request/RL',
  },
  {
    id: 'returned_device',
    label: 'PT has returned the device',
    defaultComment: 'PT has returned the device',
  },
  {
    id: 'called_recently',
    label: 'PT already called in recently',
    defaultComment: 'PT already called in recently',
  },
  {
    id: 'acknowledgement_note',
    label: 'Did not call as per acknowledgement note',
    defaultComment: 'Did not call as per acknowledgement note',
  },
  {
    id: 'corporate_pt',
    label: 'Corporate PT (Call only by CORP)',
    defaultComment: 'PT is a corporate PT - can only be called by CORP',
  },
];

export const CALL_REASONS: string[] = [
  'Low usage',
  'Mask leak / poor seal',
  'Pressure feels too high / difficult to exhale',
  'Pressure feels too low / suffocating',
  'Dry mouth / throat irritation',
  'Nasal congestion / runny nose',
  'Mask discomfort / bridge sores',
  'Claustrophobia / anxiety with mask',
  'Taking mask off unconsciously',
  'Difficulty falling asleep with CPAP',
];

export const LACK_USAGE_REASONS: string[] = [
  'Illness / cold / URI',
  'Hospitalization / surgery',
  'Traveling / forgot equipment',
  'Mask discomfort / irritation',
  'Removed mask involuntarily during night',
  'Work schedule / night shift conflict',
  'Discomfort with air pressure',
  'Forgot to put machine on',
];

export const ComplianceRiskTab: React.FC<Props> = ({ showToast }) => {
  const [day, setDay] = usePersistentState<string>('cr_day', '30');
  const [callResult, setCallResult] = usePersistentState<string>('cr_callResult', 'Connected');
  const [ptMetCompliance, setPtMetCompliance] = usePersistentState<boolean>('cr_ptMetCompliance', false);
  const [dncReason, setDncReason] = usePersistentState<RiskDncReason>('cr_dncReason', '3_days_over_4_hours');
  const [sendEmail, setSendEmail] = usePersistentState<boolean>('cr_sendEmail', false);
  const [patientEmail, setPatientEmail] = usePersistentState<string>('cr_patientEmail', '');

  const [compliancePercent, setCompliancePercent] = usePersistentState<string>('cr_compliancePercent', '');
  const [daysRemaining, setDaysRemaining] = usePersistentState<string>('cr_daysRemaining', '');
  const [setupDate, setSetupDate] = usePersistentState<string>('cr_setupDate', getCurrentDatePST());
  const [calcResult, setCalcResult] = useState<ComplianceCalculationResult | null>(null);

  const [insurance, setInsurance] = usePersistentState<string>('cr_insurance', 'Medicare');
  const [myairApp, setMyairApp] = usePersistentState<boolean>('cr_myairApp', false);
  const [experiencing, setExperiencing] = usePersistentState<string>('cr_experiencing', '');
  const [lackUsage, setLackUsage] = usePersistentState<string>('cr_lackUsage', '');
  const [comments, setComments] = usePersistentState<string>('cr_comments', '');

  const isDnc = callResult === 'DNC';

  // Migrate any previous saved '3+ days > 4 hours' or '3+ days > 4hrs' to DNC with 3_days_over_4_hours
  useEffect(() => {
    if (callResult === '3+ days > 4 hours' || callResult === '3+ days > 4hrs') {
      setCallResult('DNC');
      setDncReason('3_days_over_4_hours');
    }
  }, []);

  useEffect(() => {
    handleCalculateDays(setupDate);
  }, [setupDate]);

  const handleCalculateDays = (dateStr: string) => {
    const res = calculateComplianceDays(dateStr);
    setCalcResult(res);
    if (res) {
      setDaysRemaining(res.daysRemaining.toString());
    }
  };

  const handleSelectDnc = (reason: RiskDncReason = dncReason) => {
    setCallResult('DNC');
    setPtMetCompliance(false);
    setDncReason(reason);

    const defaultComments = RISK_DNC_OPTIONS.map((o) => o.defaultComment);
    const newDefault =
      RISK_DNC_OPTIONS.find((o) => o.id === reason)?.defaultComment ||
      'PT has been using the PAP for 3 days in a row with more than 4 hours';

    if (!comments.trim() || defaultComments.includes(comments.trim())) {
      setComments(newDefault);
    }
  };

  const handleCallResultChange = (result: string) => {
    setCallResult(result);
    setPtMetCompliance(false);
    if (result === 'DNC') {
      handleSelectDnc(dncReason);
    }
  };

  const handleCompliancePercentChange = (val: string) => {
    setCompliancePercent(val);
    const num = parseFloat(val.replace('%', '').trim());
    if (!isNaN(num) && num >= 70 && !isDnc) {
      setPtMetCompliance(true);
    } else if (!isNaN(num) && num < 70 && ptMetCompliance) {
      setPtMetCompliance(false);
    }
  };

  const togglePtMetCompliance = (met: boolean) => {
    setPtMetCompliance(met);
    if (met) {
      if (callResult === 'DNC') {
        setCallResult('Connected');
      }
      if (!compliancePercent || parseFloat(compliancePercent.replace('%', '').trim()) < 70) {
        setCompliancePercent('70');
      }
      if (!comments.trim() || RISK_DNC_OPTIONS.map((o) => o.defaultComment).includes(comments.trim())) {
        setComments('PT met compliance');
      }
    } else {
      setCallResult('Connected');
      if (comments.trim() === 'PT met compliance') {
        setComments('');
      }
    }
  };

  const getDncFormattedComment = (): string => {
    const trimmed = comments.trim();
    if (!trimmed) {
      return (
        RISK_DNC_OPTIONS.find((o) => o.id === dncReason)?.defaultComment ||
        'PT has been using the PAP for 3 days in a row with more than 4 hours'
      );
    }
    if (dncReason === '3_days_over_4_hours') {
      return trimmed.toLowerCase().includes('3 days') ||
        trimmed.toLowerCase().includes('3+ days') ||
        trimmed.toLowerCase().includes('> 4') ||
        trimmed.toLowerCase().includes('4 hours')
        ? trimmed
        : `PT has been using the PAP for 3 days in a row with more than 4 hours - ${trimmed}`;
    }
    if (dncReason === 'active_order') {
      return trimmed.toLowerCase().includes('active order') ? trimmed : `PT has an active order - ${trimmed}`;
    }
    if (dncReason === 'removal_request') {
      return trimmed.toLowerCase().includes('removal request') || trimmed.toLowerCase().includes('rl')
        ? trimmed
        : `PT has a removal request/RL - ${trimmed}`;
    }
    if (dncReason === 'returned_device') {
      return trimmed.toLowerCase().includes('returned the device') || trimmed.toLowerCase().includes('returned device')
        ? trimmed
        : `PT has returned the device - ${trimmed}`;
    }
    if (dncReason === 'called_recently') {
      return trimmed.toLowerCase().includes('called in') || trimmed.toLowerCase().includes('recently')
        ? trimmed
        : `PT already called in recently - ${trimmed}`;
    }
    if (dncReason === 'acknowledgement_note') {
      return trimmed.toLowerCase().includes('acknowledgement') || trimmed.toLowerCase().includes('ack note')
        ? trimmed
        : `Did not call as per acknowledgement note - ${trimmed}`;
    }
    if (dncReason === 'corporate_pt') {
      return trimmed.toLowerCase().includes('corporate') || trimmed.toLowerCase().includes('corp')
        ? trimmed
        : `PT is a corporate PT - can only be called by CORP - ${trimmed}`;
    }
    return trimmed;
  };

  const generateTitle = (): string => {
    if (ptMetCompliance) {
      return `CC- Compliance Risk ${day} ^Met Compliance^`;
    }
    return `CC- Compliance Risk ${day}`;
  };

  const generateBody = (): string => {
    if (ptMetCompliance) {
      const finalComment = comments.trim()
        ? comments.toLowerCase().includes('pt met compliance')
          ? comments.trim()
          : `PT met compliance - ${comments.trim()}`
        : 'PT met compliance';

      return `Patient at risk for not achieving compliance goals.
Call Result: No need to call PT

Compliance % as of today: ${compliancePercent || '70'}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}

Comments: ${finalComment}`;
    }

    if (isDnc) {
      const finalComment = getDncFormattedComment();
      const dncLabel = dncReason === '3_days_over_4_hours' ? 'DNC (3+ days > 4hrs)' : 'DNC';
      const dncCallResult = sendEmail ? `${dncLabel} + Email` : dncLabel;

      return `Patient at risk for not achieving compliance goals.
Call Result: ${dncCallResult}

Compliance % as of today: ${compliancePercent}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}

Comments: ${finalComment}`;
    }

    const finalCallResult = sendEmail && callResult !== 'Email' ? `${callResult} + Email` : callResult;

    if (['LMOM (Voice Mail)', 'Email'].includes(callResult)) {
      let b = `Patient at risk for not achieving compliance goals.
Call Result: ${finalCallResult}

Compliance % as of today: ${compliancePercent}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}`;
      if (comments.trim()) {
        b += `\n\nComments: ${comments.trim()}`;
      }
      return b;
    }

    return `Patient at risk for not achieving compliance goals.
Call Result: ${finalCallResult}

Compliance % as of today: ${compliancePercent}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}

Does the patient have the MyAir/React App installed? ${myairApp ? 'Y' : 'N'}

The patient is experiencing (reason for your call): ${experiencing.trim()}
Patient reason for lack of usage: ${lackUsage.trim()}
Comments: ${comments.trim()}`;
  };

  const handleCopyTitle = async () => {
    const ok = await copyText(generateTitle());
    if (ok) showToast('Title copied to clipboard!', 'success');
  };

  const handleCopyBody = async () => {
    const ok = await copyText(generateBody());
    if (ok) showToast('Body copied to clipboard!', 'success');
  };

  const handleSendEmail = () => {
    if (!sendEmail && callResult !== 'Email') {
      showToast('Please enter an email address or enable Send Email.', 'warning');
      return;
    }
    const cleanEmail = patientEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid patient email address.', 'warning');
      return;
    }
    if (callResult === 'Connected') {
      showToast('Email is only sent for non-connected calls or DNC follow-ups.', 'info');
      return;
    }

    let daysPassed = 'X';
    if (calcResult) {
      daysPassed = calcResult.daysPassed.toString();
    }

    const subject = 'Nationwide Medical Inc : Clinical Support';
    const openingSentence = isDnc
      ? `We are emailing you today regarding your sleep therapy progress. It's been ${daysPassed} days since you started therapy, and we wanted to check in on your usage.`
      : `We attempted to reach you today regarding your sleep therapy progress but were unable to connect. It's been ${daysPassed} days since you started therapy. and we noticed that you have been struggling lately with your usage`;

    const body = `Dear Patient,\n\n${openingSentence}\n\nYour Current Progress:\n• Compliance: ${compliancePercent} % out of 70%\n• Days remaining in compliance period: ${daysRemaining}\n\nPlease call us back at 888-969-3052 If you need any help with your therapy.\n\nBest regards,`;

    const mailto = `mailto:${cleanEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    showToast('Email opened in default client!', 'success');
  };

  const handleClear = () => {
    setDay('30');
    setCallResult('Connected');
    setPtMetCompliance(false);
    setDncReason('3_days_over_4_hours');
    setSendEmail(false);
    setPatientEmail('');
    setCompliancePercent('');
    setSetupDate(getCurrentDatePST());
    handleCalculateDays(getCurrentDatePST());
    setInsurance('Medicare');
    setMyairApp(false);
    setExperiencing('');
    setLackUsage('');
    setComments('');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="compliance-risk" className="tab-content active">
      <div className="form-section">
        <h3 className="mb-3">Title Options</h3>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-text">Day:</span>
            <div className="radio-group mb-0">
              {['30', '45', '60'].map((d) => (
                <div key={d} className="radio-item">
                  <input
                    type="radio"
                    name="cr_day"
                    id={`cr_day_${d}`}
                    value={d}
                    checked={day === d}
                    onChange={(e) => setDay(e.target.value)}
                  />
                  <label htmlFor={`cr_day_${d}`}>{d}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs font-semibold text-text-muted">
              Subject Preview:
            </span>
            <code className="text-xs font-bold text-white font-mono bg-surface-3 px-2.5 py-1 rounded-md border border-border shadow-sm">
              {generateTitle()}
            </code>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Note Fields</h3>
        <WarningAlert title="Important Warning" className="mb-4">
          <p>Patient at risk for not achieving compliance goals.</p>
        </WarningAlert>

        <div className="form-group">
          <label>Call Result:</label>
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Standard Call Results on Left + 3+ days > 4hrs outside dropdown */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="radio-item">
                <input
                  type="radio"
                  name="cr_call_result"
                  id="cr_call_result_connected"
                  value="Connected"
                  checked={callResult === 'Connected' && !ptMetCompliance && !isDnc}
                  onChange={() => handleCallResultChange('Connected')}
                />
                <label htmlFor="cr_call_result_connected">Connected</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="cr_call_result"
                  id="cr_call_result_vm"
                  value="LMOM (Voice Mail)"
                  checked={callResult === 'LMOM (Voice Mail)' && !ptMetCompliance && !isDnc}
                  onChange={() => handleCallResultChange('LMOM (Voice Mail)')}
                />
                <label htmlFor="cr_call_result_vm">LMOM (Voice Mail)</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="cr_call_result"
                  id="cr_call_result_email"
                  value="Email"
                  checked={callResult === 'Email' && !ptMetCompliance && !isDnc}
                  onChange={() => handleCallResultChange('Email')}
                />
                <label htmlFor="cr_call_result_email">Email</label>
              </div>

              {/* Outside the dropdown window: 3+ days > 4hrs (DNC) */}
              <div
                className={`radio-item rounded transition-colors ${
                  isDnc && dncReason === '3_days_over_4_hours' && !ptMetCompliance ? 'bg-blue-500/10' : ''
                }`}
              >
                <input
                  type="radio"
                  name="cr_call_result"
                  id="cr_call_result_3days"
                  value="3_days_over_4_hours"
                  checked={isDnc && dncReason === '3_days_over_4_hours' && !ptMetCompliance}
                  onChange={() => handleSelectDnc('3_days_over_4_hours')}
                  className="accent-blue-500"
                />
                <label
                  htmlFor="cr_call_result_3days"
                  className={`cursor-pointer transition-colors ${
                    isDnc && dncReason === '3_days_over_4_hours' && !ptMetCompliance
                      ? 'text-blue-400 font-bold'
                      : 'text-blue-400 hover:text-blue-300 font-semibold'
                  }`}
                >
                  3+ days &gt; 4hrs (DNC)
                </label>
              </div>
            </div>

            {/* All the way to the right: Other DNC Reasons with Dropdown Menu */}
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <div className="radio-item flex items-center">
                <input
                  type="radio"
                  name="cr_call_result"
                  id="cr_call_result_dnc"
                  value="DNC"
                  checked={isDnc && dncReason !== '3_days_over_4_hours' && !ptMetCompliance}
                  onChange={() => {
                    const fallbackReason = dncReason === '3_days_over_4_hours' ? 'active_order' : dncReason;
                    handleSelectDnc(fallbackReason);
                  }}
                />
                <label htmlFor="cr_call_result_dnc" className="font-bold text-amber-400 cursor-pointer">
                  DNC
                </label>
              </div>

              {/* Dropdown Menu for DNC option */}
              <div className="relative inline-block">
                <select
                  id="cr_dnc_dropdown"
                  value={dncReason}
                  onChange={(e) => handleSelectDnc(e.target.value as RiskDncReason)}
                  className={`text-xs font-semibold py-1.5 px-3 pr-7 rounded-md border cursor-pointer appearance-none transition-all ${
                    isDnc && dncReason === '3_days_over_4_hours'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200 ring-2 ring-blue-500/30 font-bold'
                      : isDnc && dncReason !== '3_days_over_4_hours'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 font-bold'
                      : 'bg-surface-3 hover:bg-surface-4 text-text border-border'
                  }`}
                  title="Select DNC Option"
                >
                  {RISK_DNC_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-surface-1 text-text">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted text-[10px]">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* DNC Option Toggles with Checkmarks / Toggles */}
          {isDnc && (
            <div
              className={`mt-2.5 p-2 rounded-lg bg-surface-2 border flex items-center justify-between flex-wrap gap-2 animate-fadeIn ${
                dncReason === '3_days_over_4_hours' ? 'border-blue-500/40 bg-blue-950/20' : 'border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-semibold ${
                    dncReason === '3_days_over_4_hours' ? 'text-blue-300' : 'text-amber-300'
                  }`}
                >
                  DNC Option:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {RISK_DNC_OPTIONS.map((opt) => {
                    const isSelected = dncReason === opt.id;
                    const is3Days = opt.id === '3_days_over_4_hours';
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectDnc(opt.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border cursor-pointer transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? is3Days
                              ? 'bg-blue-600 border-blue-500 text-white shadow-sm ring-1 ring-blue-400/50'
                              : 'bg-amber-600 border-amber-500 text-white shadow-sm ring-1 ring-amber-400/50'
                            : is3Days
                            ? 'bg-surface-3 hover:bg-surface-4 text-blue-300 border-blue-500/40'
                            : 'bg-surface-3 hover:bg-surface-4 text-text border-border'
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isSelected
                              ? 'font-black text-white'
                              : is3Days
                              ? 'text-blue-400'
                              : 'text-neutral-500'
                          }`}
                        >
                          {isSelected ? '✓' : '○'}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <span
                className={`text-xs font-mono ${
                  dncReason === '3_days_over_4_hours' ? 'text-blue-400' : 'text-amber-400/80'
                }`}
              >
                Call Result: {dncReason === '3_days_over_4_hours' ? 'DNC (3+ days > 4hrs)' : 'DNC'}
              </span>
            </div>
          )}
        </div>

        {!ptMetCompliance && (
          <div className="email-section" id="cr_email_section">
            <h3>
              Email Configuration
              {isDnc && (
                <span
                  className={`text-xs font-normal ml-1.5 ${
                    dncReason === '3_days_over_4_hours' ? 'text-blue-300' : 'text-amber-300'
                  }`}
                >
                  (Optional: Send email if patient prefers email over calls)
                </span>
              )}
            </h3>
            {callResult === 'Email' ? (
              <div className="form-group" id="cr_patient_email_group">
                <label htmlFor="cr_patient_email">Patient Email Address (for follow-up email):</label>
                <input
                  type="email"
                  id="cr_patient_email"
                  placeholder="patient@example.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                />
                <span className="text-xs text-neutral-400 mt-1 block">
                  Patient unreachable via phone — Email selected as primary call result.
                </span>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="cr_send_email"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                    />
                    <label htmlFor="cr_send_email">
                      Send Email to Patient {isDnc && <span className="text-xs text-neutral-400 font-normal">(Patient prefers email over calls)</span>}
                    </label>
                  </div>
                </div>
                {sendEmail && (
                  <div className="form-group" id="cr_patient_email_group">
                    <label htmlFor="cr_patient_email">Patient Email:</label>
                    <input
                      type="email"
                      id="cr_patient_email"
                      placeholder="patient@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="grid grid-2">
          <div className="form-group">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
              <label htmlFor="cr_compliance_percent">Compliance % as of today:</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => togglePtMetCompliance(!ptMetCompliance)}
                  className={`px-2 py-0.5 text-xs font-bold rounded border cursor-pointer transition-all ${
                    ptMetCompliance
                      ? 'bg-[#16a34a] border-[#22c55e] text-white shadow ring-2 ring-[#22c55e]/40'
                      : 'toggle-btn-inactive'
                  }`}
                >
                  {ptMetCompliance ? '✓ Met Compliance (≥70%)' : 'PT Met Compliance (≥70%)'}
                </button>
              </div>
            </div>
            <input
              type="text"
              id="cr_compliance_percent"
              placeholder="e.g., 45%"
              value={compliancePercent}
              onChange={(e) => handleCompliancePercentChange(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cr_days_remaining">Days remaining in compliance period:</label>
            <input
              type="text"
              id="cr_days_remaining"
              placeholder="e.g., 30"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(e.target.value)}
            />
          </div>
        </div>

        <div className="calendar-widget">
          <h4 className="text-whitelue" style={{ marginBottom: '15px' }}>Setup Date Calculator</h4>
          <div className="grid grid-2">
            <div>
              <label htmlFor="cr_setup_date">Therapy Setup Date:</label>
              <input
                type="date"
                id="cr_setup_date"
                value={setupDate}
                onChange={(e) => setSetupDate(e.target.value)}
              />
            </div>
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleCalculateDays(setupDate)}
              >
                Recalculate
              </button>
              {calcResult && (
                <div
                  id="cr_calc_result"
                  className={`status-message status-${calcResult.statusType} mt-2`}
                >
                  {calcResult.statusText}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Insurance:</label>
          <div className="radio-group">
            {[
              'Medicare',
              'Private w/ Auth',
              'Private No Auth',
              'Carecentrix',
              'Aetna',
              'Synapse',
            ].map((ins) => (
              <div key={ins} className="radio-item">
                <input
                  type="radio"
                  name="cr_insurance"
                  id={`cr_ins_${ins}`}
                  value={ins}
                  checked={insurance === ins}
                  onChange={(e) => setInsurance(e.target.value)}
                />
                <label htmlFor={`cr_ins_${ins}`}>{ins}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Visual status banners */}
        {isDnc && (
          <div
            className={`p-3 my-3 rounded-md border text-xs flex items-center justify-between flex-wrap gap-2 ${
              dncReason === '3_days_over_4_hours'
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            <div>
              📦 <strong>DNC: {RISK_DNC_OPTIONS.find((o) => o.id === dncReason)?.label}</strong> — Call Result is logged as{' '}
              <code className={dncReason === '3_days_over_4_hours' ? 'text-blue-200 bg-blue-900/40' : ''}>
                {dncReason === '3_days_over_4_hours' ? 'DNC (3+ days > 4hrs)' : 'DNC'}
              </code>
              . Phone questionnaire is bypassed.
            </div>
            <button
              type="button"
              onClick={() => handleCallResultChange('Connected')}
              className={`px-2 py-1 rounded text-xs cursor-pointer font-medium border ${
                dncReason === '3_days_over_4_hours'
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-500/40'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40'
              }`}
            >
              Switch to standard call form
            </button>
          </div>
        )}

        {ptMetCompliance && (
          <div className="p-3 my-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between flex-wrap gap-2">
            <div>
              ✓ <strong>PT Met Compliance (≥70% usage)</strong> — Call Result is logged as <code>No need to call PT</code> and subject is <code>CC- Compliance Risk {day} ^Met Compliance^</code>. Phone questionnaire is bypassed.
            </div>
            <button
              type="button"
              onClick={() => togglePtMetCompliance(false)}
              className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs cursor-pointer font-medium"
            >
              Switch to standard call form
            </button>
          </div>
        )}

        {!ptMetCompliance && !isDnc && callResult === 'LMOM (Voice Mail)' && (
          <div className="p-3 my-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs">
            📞 <strong>Voicemail / LMOM recorded</strong> — Phone questionnaire is omitted from the note. You can add any extra notes in the Comments box below.
          </div>
        )}

        {!ptMetCompliance && !isDnc && callResult === 'Email' && (
          <div className="p-3 my-3 rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-300 text-xs">
            ✉️ <strong>Email contact selected</strong> (PT unreachable via phone) — Phone questionnaire is omitted from the note. You can add any extra notes in the Comments box below.
          </div>
        )}

        {/* Standard Phone Questionnaire for Connected Call */}
        {!ptMetCompliance && !isDnc && callResult === 'Connected' && (
          <>
            <div className="form-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cr_myair_app"
                  checked={myairApp}
                  onChange={(e) => setMyairApp(e.target.checked)}
                />
                <label htmlFor="cr_myair_app">Does the patient have the MyAir/React App installed?</label>
              </div>
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <label htmlFor="cr_experiencing" className="mb-0">
                  The patient is experiencing (reason for your call):
                </label>
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="relative inline-block">
                    <select
                      id="cr_experiencing_select"
                      value={CALL_REASONS.includes(experiencing.trim()) ? experiencing.trim() : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        if (!experiencing.trim()) {
                          setExperiencing(val);
                        } else if (!experiencing.includes(val)) {
                          setExperiencing((prev) => `${prev.trim()}, ${val}`);
                        } else {
                          setExperiencing(val);
                        }
                      }}
                      className="text-xs font-semibold py-1 px-3 pr-7 rounded-md border border-border bg-surface-3 hover:bg-surface-4 text-text cursor-pointer appearance-none transition-all"
                      title="Select reason for call"
                    >
                      <option value="" disabled>
                        Select reason for call...
                      </option>
                      {CALL_REASONS.map((reason) => (
                        <option key={reason} value={reason} className="bg-surface-1 text-text">
                          {reason}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted text-[10px]">
                      ▼
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExperiencing('')}
                    disabled={!experiencing}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                      experiencing
                        ? 'border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 cursor-pointer'
                        : 'border-border bg-surface-2 text-text-muted opacity-40 cursor-not-allowed'
                    }`}
                    title="Clear reason for call"
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>
              <textarea
                id="cr_experiencing"
                placeholder="Describe what the patient is experiencing (e.g. Low usage)..."
                value={experiencing}
                onChange={(e) => setExperiencing(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <label htmlFor="cr_lack_usage" className="mb-0">
                  Patient reason for lack of usage:
                </label>
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="relative inline-block">
                    <select
                      id="cr_lack_usage_select"
                      value={LACK_USAGE_REASONS.includes(lackUsage.trim()) ? lackUsage.trim() : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        if (!lackUsage.trim()) {
                          setLackUsage(val);
                        } else if (!lackUsage.includes(val)) {
                          setLackUsage((prev) => `${prev.trim()}, ${val}`);
                        } else {
                          setLackUsage(val);
                        }
                      }}
                      className="text-xs font-semibold py-1 px-3 pr-7 rounded-md border border-border bg-surface-3 hover:bg-surface-4 text-text cursor-pointer appearance-none transition-all"
                      title="Select lack of usage reason"
                    >
                      <option value="" disabled>
                        Select lack of usage reason...
                      </option>
                      {LACK_USAGE_REASONS.map((reason) => (
                        <option key={reason} value={reason} className="bg-surface-1 text-text">
                          {reason}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted text-[10px]">
                      ▼
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLackUsage('')}
                    disabled={!lackUsage}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                      lackUsage
                        ? 'border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 cursor-pointer'
                        : 'border-border bg-surface-2 text-text-muted opacity-40 cursor-not-allowed'
                    }`}
                    title="Clear lack of usage reason"
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>
              <textarea
                id="cr_lack_usage"
                placeholder="Patient's reasons for not using therapy..."
                value={lackUsage}
                onChange={(e) => setLackUsage(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Comments Section with Note Assistant Chips */}
        <div className="form-group">
          <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
            <label htmlFor="cr_comments">Comments:</label>
            {isDnc && (
              <span
                className={`text-xs ${
                  dncReason === '3_days_over_4_hours' ? 'text-blue-300' : 'text-amber-300'
                }`}
              >
                Default: &quot;{RISK_DNC_OPTIONS.find((o) => o.id === dncReason)?.defaultComment}&quot;
              </span>
            )}
            {ptMetCompliance && (
              <span className="text-xs text-emerald-300">
                Default: &quot;PT met compliance&quot;
              </span>
            )}
          </div>

          {/* Quick chips when 3+ days > 4 hours is active in DNC */}
          {isDnc && dncReason === '3_days_over_4_hours' && (
            <div className="mb-2 p-2 rounded bg-surface-3 border border-blue-500/30">
              <span className="text-xs font-semibold text-blue-300 block mb-1.5">
                Quick detail options (3+ days &gt; 4 hrs usage):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '3 consecutive days > 4 hours',
                  '4 consecutive days > 4 hours',
                  '5+ consecutive days > 4 hours',
                  'Usage improving - compliant last 3 days',
                  'Patient re-engaged with therapy',
                  'Encouraged continued nightly use',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setComments(`PT has been using the PAP for 3 days in a row with more than 4 hours - ${item}`);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 hover:bg-blue-900/30 text-text hover:text-blue-200 border border-border hover:border-blue-500/40 cursor-pointer transition-colors"
                  >
                    + {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setComments('PT has been using the PAP for 3 days in a row with more than 4 hours')}
                  className="px-2 py-0.5 rounded text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 cursor-pointer font-medium"
                >
                  Reset: 3 days in a row &gt; 4 hrs
                </button>
              </div>
            </div>
          )}

          {/* Quick chips when DNC is active: Active Order */}
          {isDnc && dncReason === 'active_order' && (
            <div className="mb-2 p-2 rounded bg-surface-3 border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1.5">
                Quick item awaiting:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Mask',
                  'Cushions',
                  'Tubing',
                  'Headgear',
                  'Water Chamber',
                  'Machine',
                  'Power Supply',
                  'Filters',
                  'Supplies',
                  'UPS waiting for device or shipment',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setComments(`PT has an active order - waiting for ${item}`);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 hover:bg-surface-4 text-text border border-border cursor-pointer transition-colors"
                  >
                    + {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setComments('PT has an active order')}
                  className="px-2 py-0.5 rounded text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer font-medium"
                >
                  Reset: PT has an active order
                </button>
              </div>
            </div>
          )}

          {/* Quick chips when DNC is active: Removal Request / RL */}
          {isDnc && dncReason === 'removal_request' && (
            <div className="mb-2 p-2 rounded bg-surface-3 border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1.5">
                Quick detail options:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Return label mailed to PT',
                  'Return label emailed to PT',
                  'UPS waiting for device or shipment',
                  'PT requested return',
                  'Physician ordered therapy stop',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setComments(`PT has a removal request/RL - ${item}`);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 hover:bg-surface-4 text-text border border-border cursor-pointer transition-colors"
                  >
                    + {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setComments('PT has a removal request/RL')}
                  className="px-2 py-0.5 rounded text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer font-medium"
                >
                  Reset: PT has a removal request/RL
                </button>
              </div>
            </div>
          )}

          {/* Quick chips when DNC is active: Returned Device */}
          {isDnc && dncReason === 'returned_device' && (
            <div className="mb-2 p-2 rounded bg-surface-3 border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1.5">
                Quick detail options:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Device received in office',
                  'Serial number verified',
                  'Therapy discontinued',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setComments(`PT has returned the device - ${item}`);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 hover:bg-surface-4 text-text border border-border cursor-pointer transition-colors"
                  >
                    + {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setComments('PT has returned the device')}
                  className="px-2 py-0.5 rounded text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer font-medium"
                >
                  Reset: PT has returned the device
                </button>
              </div>
            </div>
          )}

          {/* Quick chips when DNC is active: Called Recently */}
          {isDnc && dncReason === 'called_recently' && (
            <div className="mb-2 p-2 rounded bg-surface-3 border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1.5">
                Quick detail options:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Informed compliance status on call',
                  'Reviewed therapy progress',
                  'Left message with clinical team',
                  'Supplies addressed on call',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setComments(`PT already called in recently - ${item}`);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 hover:bg-surface-4 text-text border border-border cursor-pointer transition-colors"
                  >
                    + {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setComments('PT already called in recently')}
                  className="px-2 py-0.5 rounded text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer font-medium"
                >
                  Reset: PT already called in recently
                </button>
              </div>
            </div>
          )}

          {/* Quick chips when DNC is active: Acknowledgement Note */}
          {isDnc && dncReason === 'acknowledgement_note' && (
            <div className="mb-2 p-2 rounded bg-surface-3 border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1.5">
                Quick detail options:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Out of town / traveling without device',
                  'PT traveling with device',
                  'Hospitalized / medical leave',
                  'Follow-up upon return',
                  'Per patient request',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setComments(`Did not call as per acknowledgement note - ${item}`);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 hover:bg-surface-4 text-text border border-border cursor-pointer transition-colors"
                  >
                    + {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setComments('Did not call as per acknowledgement note')}
                  className="px-2 py-0.5 rounded text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer font-medium"
                >
                  Reset: Did not call as per acknowledgement note
                </button>
              </div>
            </div>
          )}

          {/* Quick chips when DNC is active: Corporate PT */}
          {isDnc && dncReason === 'corporate_pt' && (
            <div className="mb-2 p-2 rounded bg-surface-3 border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1.5">
                Quick detail options:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Referred to Corporate account team',
                  'Executive / VIP protocol',
                  'CORP coordinator notified',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setComments(`PT is a corporate PT - can only be called by CORP - ${item}`);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 hover:bg-surface-4 text-text border border-border cursor-pointer transition-colors"
                  >
                    + {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setComments('PT is a corporate PT - can only be called by CORP')}
                  className="px-2 py-0.5 rounded text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer font-medium"
                >
                  Reset: Corporate PT
                </button>
              </div>
            </div>
          )}

          <textarea
            id="cr_comments"
            placeholder={
              isDnc
                ? dncReason === '3_days_over_4_hours'
                  ? 'PT has been using the PAP for 3 days in a row with more than 4 hours (or specify details...)'
                  : dncReason === 'active_order'
                  ? 'PT has an active order (or specify item waiting for...)'
                  : dncReason === 'removal_request'
                  ? 'PT has a removal request/RL (or specify details...)'
                  : dncReason === 'returned_device'
                  ? 'PT has returned the device (or specify details...)'
                  : dncReason === 'called_recently'
                  ? 'PT already called in recently (or specify call details...)'
                  : dncReason === 'acknowledgement_note'
                  ? 'Did not call as per acknowledgement note (or specify details...)'
                  : 'PT is a corporate PT - can only be called by CORP (or specify details...)'
                : ptMetCompliance
                ? 'PT met compliance (or enter additional comments...)'
                : 'Additional comments...'
            }
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
          {isDnc && (
            <div className="text-xs text-neutral-400 mt-1">
              Note will output: <code>Comments: {getDncFormattedComment()}</code>
            </div>
          )}
          {ptMetCompliance && !comments.trim() && (
            <div className="text-xs text-neutral-400 mt-1">
              Note will output: <code>Comments: PT met compliance</code>
            </div>
          )}
        </div>
      </div>

      <div className="btn-group flex items-center flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={handleCopyTitle}>
          Copy Title
        </button>
        <button type="button" className="btn btn-primary" onClick={handleCopyBody}>
          Copy Body
        </button>
        {(sendEmail || callResult === 'Email') && !ptMetCompliance && (
          <button type="button" className="btn btn-success" onClick={handleSendEmail}>
            Send Email
          </button>
        )}
        <button type="button" className="btn btn-danger" onClick={handleClear}>
          Clear
        </button>
      </div>

      <GeneratedNotePreview generatedText={generateBody()} showToast={showToast} title={generateTitle()} />
    </div>
  );
};
