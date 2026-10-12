import React, { useState, useEffect, useRef } from 'react';
import { getCurrentDatePST, calculateComplianceDays, ComplianceCalculationResult } from '../../utils/dateUtils';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { WarningAlert, InstructionAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export type DncReason =
  | 'active_order'
  | 'removal_request'
  | 'returned_device'
  | 'called_recently'
  | 'acknowledgement_note'
  | 'corporate_pt';

export interface DncOption {
  id: DncReason;
  label: string;
  defaultComment: string;
}

export const DNC_OPTIONS: DncOption[] = [
  { id: 'active_order', label: 'PT has an active order', defaultComment: 'PT has an active order' },
  { id: 'removal_request', label: 'PT has a removal request/RL', defaultComment: 'PT has a removal request/RL' },
  { id: 'returned_device', label: 'PT has returned the device', defaultComment: 'PT has returned the device' },
  { id: 'called_recently', label: 'PT already called in recently', defaultComment: 'PT already called in recently' },
  { id: 'acknowledgement_note', label: 'Did not call as per acknowledgement note', defaultComment: 'Did not call as per acknowledgement note' },
  { id: 'corporate_pt', label: 'Corporate PT (Call only by CORP)', defaultComment: 'PT is a corporate PT - can only be called by CORP' },
];

export const isNoUsageOrTherapy = (val: string): boolean => {
  if (!val) return false;
  const s = val.trim().toLowerCase();
  if (!s) return false;

  // Direct phrase matches
  if (
    s.includes('no usage') ||
    s.includes('no therapy') ||
    s.includes('no data') ||
    s.includes('no use') ||
    s.includes('not using') ||
    s.includes('zero usage') ||
    s.includes('0 usage') ||
    s.includes('0% usage') ||
    s.includes('no compliance') ||
    s.includes('non compliant') ||
    s.includes('non-compliant')
  ) {
    return true;
  }

  // Regex pattern matching: "no" followed by anything related to usage/therapy/data
  if (/\bno\s+.*(usage|therapy|data|use|reading|readings|download|info)\b/i.test(s)) {
    return true;
  }

  // Common shorthands
  if (/^(none|n\/a|na|no)$/i.test(s)) {
    return true;
  }

  return false;
};

export const ComplianceCheckInTab: React.FC<Props> = ({ showToast }) => {
  const [day, setDay] = usePersistentState<string>('cci_day', '10');
  const [callType, setCallType] = usePersistentState<'Connected' | 'Voicemail' | 'Email'>('cci_callType', 'Connected');
  const [status, setStatus] = usePersistentState<string>('cci_status', '');
  const [callResult, setCallResult] = usePersistentState<string>('cci_callResult', 'Connected');
  
  const [sendEmail, setSendEmail] = usePersistentState<boolean>('cci_sendEmail', false);
  const [patientEmail, setPatientEmail] = usePersistentState<string>('cci_patientEmail', '');
  
  const [reviewedTherapy, setReviewedTherapy] = usePersistentState<boolean>('cci_reviewedTherapy', true);
  const [compliancePercent, setCompliancePercent] = usePersistentState<string>('cci_compliancePercent', '');
  const [daysRemaining, setDaysRemaining] = usePersistentState<string>('cci_daysRemaining', '');
  const [setupDate, setSetupDate] = usePersistentState<string>('cci_setupDate', getCurrentDatePST());
  const [calcResult, setCalcResult] = useState<ComplianceCalculationResult | null>(null);

  const [insurance, setInsurance] = usePersistentState<string>('cci_insurance', 'Medicare');
  const [therapyDescription, setTherapyDescription] = usePersistentState<string>('cci_therapyDescription', '');
  const [discomfort, setDiscomfort] = usePersistentState<boolean>('cci_discomfort', false);
  const [recommendations, setRecommendations] = usePersistentState<string>('cci_recommendations', '');
  const [fitpackSize, setFitpackSize] = usePersistentState<string>('cci_fitpackSize', '');

  const [myairApp, setMyairApp] = usePersistentState<boolean>('cci_myairApp', false);
  const [cleaningReviewed, setCleaningReviewed] = usePersistentState<boolean>('cci_cleaningReviewed', false);
  const [insuranceGuidelines, setInsuranceGuidelines] = usePersistentState<boolean>('cci_insuranceGuidelines', false);
  const [mdFollowup, setMdFollowup] = usePersistentState<boolean>('cci_mdFollowup', false);
  const [surveyReview, setSurveyReview] = usePersistentState<boolean>('cci_surveyReview', false);
  const [contactInfo, setContactInfo] = usePersistentState<boolean>('cci_contactInfo', false);

  const [informedStatus, setInformedStatus] = usePersistentState<boolean>('cci_informedStatus', true);
  const [discussedRecert, setDiscussedRecert] = usePersistentState<boolean>('cci_discussedRecert', true);
  const [comments, setComments] = usePersistentState<string>('cci_comments', '');

  const [ptMetCompliance, setPtMetCompliance] = usePersistentState<boolean>('cci_ptMetCompliance', false);
  const [ptActiveOrder, setPtActiveOrder] = usePersistentState<boolean>('cci_ptActiveOrder', false);
  const [dncReason, setDncReason] = usePersistentState<DncReason>('cci_dncReason', 'active_order');
  const [nightsNeeded, setNightsNeeded] = usePersistentState<string>('cci_nightsNeeded', '');

  const isDnc = callResult === 'DNC';
  const autoFailedDueToNoUsageRef = useRef<boolean>(false);

  // Backward compatibility: If ptActiveOrder was saved as true previously, treat as DNC
  useEffect(() => {
    if (ptActiveOrder && callResult !== 'DNC') {
      setCallResult('DNC');
      setPtActiveOrder(false);
    }
  }, []);

  // Auto calculate remaining days on mount or setupDate change
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

  // Sync call type and call result
  const handleCallTypeChange = (type: 'Connected' | 'Voicemail' | 'Email') => {
    setCallType(type);
    if (ptMetCompliance) {
      setPtMetCompliance(false);
    }
    if (type === 'Connected') {
      setCallResult('Connected');
    } else if (type === 'Voicemail') {
      setCallResult('LMOM (Voice Mail)');
    } else if (type === 'Email') {
      setCallResult('Email');
    }
  };

  const handleSelectDnc = (reason: DncReason = dncReason) => {
    setCallResult('DNC');
    setPtMetCompliance(false);
    setDncReason(reason);

    // Auto status calculation for 30, 45, 60, 75, 90
    const noUsage = isNoUsageOrTherapy(compliancePercent);
    if (['30', '45', '60'].includes(day) && !status) {
      if (noUsage) {
        setStatus('At Risk');
      } else {
        const cleaned = parseFloat(compliancePercent.replace('%', '').trim());
        const thresholds: Record<string, number> = { '30': 33, '45': 47, '60': 60 };
        const threshold = thresholds[day];
        setStatus(!isNaN(cleaned) && cleaned <= threshold ? 'At Risk' : 'On-Track');
      }
    } else if (day === '75' && !status) {
      if (noUsage) {
        setStatus('Failed');
        autoFailedDueToNoUsageRef.current = true;
      } else {
        setStatus('At Risk');
      }
    } else if (day === '90' && !status) {
      setStatus('Failed');
    }

    // Set default comment if empty or currently another default comment
    const defaultComments = DNC_OPTIONS.map((o) => o.defaultComment);
    const newDefault = DNC_OPTIONS.find((o) => o.id === reason)?.defaultComment || 'PT has an active order';
    if (!comments.trim() || defaultComments.includes(comments.trim())) {
      setComments(newDefault);
    }
  };

  const handleCallResultChange = (result: string) => {
    setCallResult(result);
    setPtMetCompliance(false);
    if (result === 'DNC') {
      handleSelectDnc(dncReason);
    } else {
      if (result === 'Connected') {
        setCallType('Connected');
      } else if (result === 'LMOM (Voice Mail)') {
        setCallType('Voicemail');
      } else if (result === 'Email') {
        setCallType('Email');
      }
    }
  };

  const handleCompliancePercentChange = (val: string) => {
    setCompliancePercent(val);
    const num = parseFloat(val.replace('%', '').trim());
    if (!isNaN(num) && num >= 70 && !isDnc) {
      setPtMetCompliance(true);
      if (day === '90') {
        setStatus('comp-met');
      }
    } else if ((isNaN(num) || num < 70) && ptMetCompliance) {
      setPtMetCompliance(false);
      if (day === '90') {
        setStatus('Failed');
      }
    }
  };

  const togglePtMetCompliance = (met: boolean) => {
    setPtMetCompliance(met);
    if (met) {
      if (day === '90') {
        setStatus('comp-met');
      }
      if (callResult === 'DNC') {
        setCallResult('Connected');
        setCallType('Connected');
      }
      if (!compliancePercent || parseFloat(compliancePercent.replace('%', '').trim()) < 70) {
        setCompliancePercent('70');
      }
    } else {
      if (day === '90') {
        setStatus('Failed');
      }
      setCallResult('Connected');
      setCallType('Connected');
    }
  };

  // Automatic status calculation for Day 30, 45, 60, 75, 90
  useEffect(() => {
    const noUsage = isNoUsageOrTherapy(compliancePercent);

    if (['30', '45', '60'].includes(day)) {
      if (noUsage) {
        setStatus('At Risk');
      } else {
        const cleaned = parseFloat(compliancePercent.replace('%', '').trim());
        const thresholds: Record<string, number> = { '30': 33, '45': 47, '60': 60 };
        const threshold = thresholds[day];
        if (!isNaN(cleaned)) {
          setStatus(cleaned <= threshold ? 'At Risk' : 'On-Track');
        } else {
          setStatus('On-Track');
        }
      }
      autoFailedDueToNoUsageRef.current = false;
    } else if (day === '75') {
      if (noUsage) {
        setStatus('Failed');
        autoFailedDueToNoUsageRef.current = true;
      } else {
        if (autoFailedDueToNoUsageRef.current) {
          setStatus('At Risk');
          autoFailedDueToNoUsageRef.current = false;
        } else if (status !== 'Failed' && status !== 'At Risk') {
          setStatus('At Risk');
        }
      }
    } else if (day === '90') {
      if (noUsage) {
        setStatus('Failed');
        autoFailedDueToNoUsageRef.current = true;
      } else {
        const cleaned = parseFloat(compliancePercent.replace('%', '').trim());
        if (!isNaN(cleaned) && cleaned >= 70) {
          setStatus('comp-met');
          autoFailedDueToNoUsageRef.current = false;
        } else if (autoFailedDueToNoUsageRef.current) {
          setStatus('Failed');
          autoFailedDueToNoUsageRef.current = false;
        } else if (status !== 'Failed' && status !== 'comp-met' && status !== '(comp-met)') {
          setStatus('Failed');
        }
      }
    } else {
      setStatus('');
      autoFailedDueToNoUsageRef.current = false;
    }
  }, [day, compliancePercent]);

  const getDncFormattedComment = (): string => {
    const trimmed = comments.trim();
    if (!trimmed) {
      return DNC_OPTIONS.find((o) => o.id === dncReason)?.defaultComment || 'PT has an active order';
    }
    if (dncReason === 'active_order') {
      return trimmed.toLowerCase().includes('active order') ? trimmed : `PT has an active order - ${trimmed}`;
    }
    if (dncReason === 'removal_request') {
      return (trimmed.toLowerCase().includes('removal request') || trimmed.toLowerCase().includes('rl'))
        ? trimmed
        : `PT has a removal request/RL - ${trimmed}`;
    }
    if (dncReason === 'returned_device') {
      return (trimmed.toLowerCase().includes('returned the device') || trimmed.toLowerCase().includes('returned device'))
        ? trimmed
        : `PT has returned the device - ${trimmed}`;
    }
    if (dncReason === 'called_recently') {
      return (trimmed.toLowerCase().includes('called in') || trimmed.toLowerCase().includes('recently'))
        ? trimmed
        : `PT already called in recently - ${trimmed}`;
    }
    if (dncReason === 'acknowledgement_note') {
      return (trimmed.toLowerCase().includes('acknowledgement') || trimmed.toLowerCase().includes('ack note'))
        ? trimmed
        : `Did not call as per acknowledgement note - ${trimmed}`;
    }
    if (dncReason === 'corporate_pt') {
      return (trimmed.toLowerCase().includes('corporate') || trimmed.toLowerCase().includes('corp'))
        ? trimmed
        : `PT is a corporate PT - can only be called by CORP - ${trimmed}`;
    }
    return trimmed;
  };

  const generateTitle = (): string => {
    if (day === '90') {
      const cleanStatus = status === '(comp-met)' || status === 'comp-met' ? 'comp-met' : (status || 'Failed');
      if (isDnc) {
        return `CC-Compliance Check In Day 90 ^${cleanStatus}^`;
      }
      if (ptMetCompliance) {
        return `CC-Compliance Check In Day 90 ^comp-met^`;
      }
      return `CC-Compliance Check In Day 90 ^${callType} ${cleanStatus}^`;
    }

    if (isDnc) {
      if (day === '10' || day === '21') {
        return `CC-Compliance Check In Day ${day} ^^`;
      }
      const currentStatus = status || 'On-Track';
      return `CC-Compliance Check In Day ${day} ^${currentStatus}^`;
    }

    if (ptMetCompliance) {
      if (day === '10' || day === '21') {
        return `CC-Compliance Check In Day ${day} ^^`;
      }
      return `CC-Compliance Check In Day ${day} ^On-Track^`;
    }
    let t = `CC-Compliance Check In Day ${day} ^${callType}`;
    if (status) {
      t += ` ${status}`;
    }
    t += '^';
    return t;
  };

  const generateBody = (): string => {
    if (day === '90') {
      if (isDnc) {
        const finalComment = getDncFormattedComment();
        const dncCallResult = sendEmail ? 'DNC + Email' : 'DNC';

        return `Call Result: ${dncCallResult}
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent}
Insurance: ${insurance}

Comments: ${finalComment}`;
      }

      if (ptMetCompliance) {
        const finalComment = comments.trim()
          ? (comments.toLowerCase().includes('pt met compliance') ? comments.trim() : `PT met compliance - ${comments.trim()}`)
          : 'PT met compliance';

        return `Call Result: No need to call PT
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent || '70'}
Insurance: ${insurance}

Comments: ${finalComment}`;
      }

      const finalCallResult = (sendEmail && callResult !== 'Email') ? `${callResult} + Email` : callResult;
      const commentsLine = comments.trim() ? `Comments: ${comments.trim()}` : 'Comments:';

      return `Call Result: ${finalCallResult}
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent}
Insurance: ${insurance}

Informed PT of compliance status and next steps: ${informedStatus ? 'Y' : 'N'}
Discussed recertification steps: ${discussedRecert ? 'Y' : 'N'}

${commentsLine}`;
    }

    if (isDnc) {
      const finalComment = getDncFormattedComment();
      const dncCallResult = sendEmail ? 'DNC + Email' : 'DNC';

      return `Call Result: ${dncCallResult}
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}

Comments: ${finalComment}`;
    }

    if (ptMetCompliance) {
      const finalComment = comments.trim()
        ? (comments.toLowerCase().includes('pt met compliance') ? comments.trim() : `PT met compliance - ${comments.trim()}`)
        : 'PT met compliance';

      return `Call Result: No need to call PT
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent || '70'}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}

Comments: ${finalComment}`;
    }

    const finalCallResult = (sendEmail && callResult !== 'Email') ? `${callResult} + Email` : callResult;

    if (callType === 'Voicemail' || callResult === 'Email' || callType === 'Email') {
      let b = `Call Result: ${finalCallResult}
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}`;
      if (comments.trim()) {
        b += `\n\nComments: ${comments.trim()}`;
      }
      return b;
    }

    if (day === '75' && status === 'Failed') {
      let b = `Call Result: ${finalCallResult}
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}

If YES, informed PT of compliance status and next steps: ${informedStatus ? 'Y' : 'N'}
If YES, discussed recertification steps: ${discussedRecert ? 'Y' : 'N'}`;
      if (comments.trim()) {
        b += `\n\nComments: ${comments.trim()}`;
      }
      return b;
    }

    let fitpackLine = '';
    if (day === '10' || day === '21') {
      fitpackLine = `\nIf PT received Fitpack, confirm which size cushion they are using: ${fitpackSize}`;
    }

    return `Call Result: ${finalCallResult}
Reviewed therapy data in Airview/React Health Portal: ${reviewedTherapy ? 'Y' : 'N'}
Compliance % as of today: ${compliancePercent}
Days remaining in compliance period: ${daysRemaining}
Insurance: ${insurance}

Describe how therapy is going for the patient: ${therapyDescription.trim()}
Is the patient experiencing any discomfort: ${discomfort ? 'Y' : 'N'}
Recommendations to Pt: ${recommendations.trim()}${fitpackLine}

Does the patient have the MyAir/React App installed? ${myairApp ? 'Y' : 'N'}
Were cleaning/re-supply guidelines reviewed? ${cleaningReviewed ? 'Y' : 'N'}

Discussed insurance compliance guidelines (4 hours a night)? ${insuranceGuidelines ? 'Y' : 'N'}
Discussed need for MD Follow Up Appt: ${mdFollowup ? 'Y' : 'N'}

Patient notified of possible call survey, as well as asked to leave a Google or Yelp review? ${surveyReview ? 'Y' : 'N'}
If the patient has any additional concerns with therapy, does the patient know how to reach us: ${contactInfo ? 'Y' : 'N'}
Comments: ${comments.trim()}`;
  };

  const handleCopyTitle = async () => {
    const t = generateTitle();
    const ok = await copyText(t);
    if (ok) showToast('Title copied to clipboard!', 'success');
  };

  const handleCopyBody = async () => {
    const b = generateBody();
    const ok = await copyText(b);
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

    const subject = 'Nationwide Medical Inc : Check-In';
    let body = '';

    const openingSentence = isDnc
      ? `We are emailing you today regarding your sleep therapy check-in. It's been ${daysPassed} days since you started therapy.`
      : `We attempted to reach you today for your sleep therapy check-in but were unable to connect. It's been ${daysPassed} days since you started therapy.`;

    if (day === '75' && status === 'Failed' && (insurance === 'Medicare' || insurance === 'Aetna')) {
      body = `Dear Patient,\n\n${openingSentence} Unfortunately, you have failed to meet the usage requirements that were to be met in your initial 90-day period. We will be initiating the return process now, and you will receive an email shortly with a return label that you can use to send the device back to Nationwide Medical. If you are interested in trying therapy again, please give us a call to discuss the recertification process. You can reach us at 888-969-3052 from 6:00 AM to 5:00 PM Pacific Standard Time.\n\nYour Current Progress:\n• Compliance: ${compliancePercent} % out of 70%\n• Days remaining in compliance period: ${daysRemaining}\n• Status: We'd like to help you get back on track\n\nPlease call us back at 888-969-3052 so we can assist you.\n\nBest regards,`;
    } else if (day === '75' && status === 'Failed') {
      body = `Dear Patient,\n\n${openingSentence} Unfortunately, you have not met the 70% usage threshold in your initial 90 Day compliance period. As most major insurance companies mandate compliance, we will be reaching out to your insurance company to discuss the next steps. In the meantime, please continue to use your device and work towards using your therapy every night for 4 hours or more. If you have additional questions, please feel free to call us at 888-969-3052 from 6:00AM to 5:00PM Pacific Standard Time.\n\nYour Current Progress:\n• Compliance: ${compliancePercent} % out of 70%\n• Days remaining in compliance period: ${daysRemaining}\n• Status: We'd like to help you get back on track\n\nPlease call us back at 888-969-3052 so we can assist you.\n\nBest regards,`;
    } else if (day === '75' && status === 'At Risk') {
      const endFormatted = calcResult ? calcResult.endDate : '[End of Compliance Date]';
      let formattedEndDate = endFormatted;
      if (endFormatted !== '[End of Compliance Date]') {
        const parts = endFormatted.split('-');
        if (parts.length === 3) {
          formattedEndDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
        }
      }
      
      body = `Dear Patient,\n\n${openingSentence} You're doing great and are nearing the end of your compliance period. In order to achieve compliance, you need to use the device for ${nightsNeeded || 'XX'} more nights by ${formattedEndDate}. If you need help with anything to ensure you pass your compliance period, feel free to call us at 888-969-3052 from 6:00AM to 5:00PM Pacific Standard Time.\n\nYour Current Progress:\n• Compliance: ${compliancePercent || 'XX'} % out of 70%\n• Days remaining in compliance period: ${daysRemaining}\n• Status: We'd like to help you get back on track\n\nPlease call us back at 888-969-3052 so we can assist you.\n\nBest regards,`;
    } else if (status === 'On-Track') {
      body = `Dear Patient,\n\n${openingSentence}\n\nYour Current Progress:\n• Compliance: ${compliancePercent} % out of 70%\n• Days remaining in compliance period: ${daysRemaining}\n• Status: You're doing great and staying on track!\n\nIf you have any questions, please call us back at 888-969-3052.\n\nBest regards,`;
    } else if (status === 'At Risk') {
      body = `Dear Patient,\n\n${openingSentence}\n\nYour Current Progress:\n• Compliance: ${compliancePercent} % out of 70%\n• Days remaining in compliance period: ${daysRemaining}\n• Status: We'd like to help you get back on track\n\nPlease call us back at 888-969-3052 so we can assist you.\n\nBest regards,`;
    } else {
      body = `Dear Patient,\n\n${openingSentence}\n\nYour Current Progress:\n• Compliance: ${compliancePercent} out of 70%\n• Days remaining in compliance period: ${daysRemaining}\n\nIf you have any questions, please call us back at 888-969-3052.\n\nBest regards,`;
    }

    const mailto = `mailto:${cleanEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    showToast('Email opened in default client!', 'success');
  };

  const handleClear = () => {
    setDay('10');
    setCallType('Connected');
    setStatus('');
    setCallResult('Connected');
    setPtMetCompliance(false);
    setPtActiveOrder(false);
    setDncReason('active_order');
    setSendEmail(false);
    setPatientEmail('');
    setReviewedTherapy(true);
    setCompliancePercent('');
    setSetupDate(getCurrentDatePST());
    handleCalculateDays(getCurrentDatePST());
    setInsurance('Medicare');
    setTherapyDescription('');
    setDiscomfort(false);
    setRecommendations('');
    setFitpackSize('');
    setMyairApp(false);
    setCleaningReviewed(false);
    setInsuranceGuidelines(false);
    setMdFollowup(false);
    setSurveyReview(false);
    setContactInfo(false);
    setInformedStatus(true);
    setDiscussedRecert(true);
    setComments('');
    setNightsNeeded('');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="compliance-checkin" className="tab-content active">
      <div className="form-section">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="m-0">Title Options</h3>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs font-semibold text-text-muted">
              Subject Preview:
            </span>
            <code className="text-xs font-bold text-white font-mono bg-surface-3 px-2.5 py-1 rounded-md border border-border shadow-sm">
              {generateTitle()}
            </code>
          </div>
        </div>
        <div className="grid grid-3">
          <div className="form-group">
            <label>Day:</label>
            <div className="radio-group">
              {['10', '21', '30', '45', '60', '75', '90'].map((d) => (
                <div key={d} className="radio-item">
                  <input
                    type="radio"
                    name="cc_day"
                    id={`cc_day_${d}`}
                    value={d}
                    checked={day === d}
                    onChange={(e) => setDay(e.target.value)}
                  />
                  <label htmlFor={`cc_day_${d}`}>{d}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Call Type:</label>
            {isDnc ? (
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <span className="font-bold">DNC (Do Not Call)</span> — {
                  dncReason === 'active_order'
                    ? 'Patient has an active order awaiting an item.'
                    : dncReason === 'removal_request'
                    ? 'Patient has a removal request / return label.'
                    : dncReason === 'returned_device'
                    ? 'Patient has returned the device.'
                    : dncReason === 'called_recently'
                    ? 'Patient already called in recently / before today.'
                    : dncReason === 'acknowledgement_note'
                    ? 'Did not call as per acknowledgement note on file.'
                    : 'Corporate patient — can only be called by Corporate team.'
                }
              </div>
            ) : ptMetCompliance ? (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <span className="font-bold">No need to call PT</span> — Patient has met compliance goals.
              </div>
            ) : (
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="cc_call_type"
                    id="cc_call_type_connected"
                    value="Connected"
                    checked={callType === 'Connected' && !ptMetCompliance && !isDnc}
                    onChange={() => handleCallTypeChange('Connected')}
                  />
                  <label htmlFor="cc_call_type_connected">Connected</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="cc_call_type"
                    id="cc_call_type_voicemail"
                    value="Voicemail"
                    checked={callType === 'Voicemail' && !ptMetCompliance && !isDnc}
                    onChange={() => handleCallTypeChange('Voicemail')}
                  />
                  <label htmlFor="cc_call_type_voicemail">Voicemail</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="cc_call_type"
                    id="cc_call_type_email"
                    value="Email"
                    checked={callType === 'Email' && !ptMetCompliance && !isDnc}
                    onChange={() => handleCallTypeChange('Email')}
                  />
                  <label htmlFor="cc_call_type_email">Email</label>
                </div>
              </div>
            )}
            {ptMetCompliance && (
              <div className="text-xs text-emerald-400 mt-1 font-semibold">
                ✓ PT Met Compliance: Subject tagged as {day === '10' || day === '21' ? <code>^^</code> : day === '90' ? <code>^comp-met^</code> : <code>^On-Track^</code>} (no call needed)
              </div>
            )}
            {isDnc && (
              <div className="text-xs text-amber-400 mt-1 font-semibold">
                ✓ DNC ({DNC_OPTIONS.find((o) => o.id === dncReason)?.label}): Subject tagged as {day === '10' || day === '21' ? <code>^^</code> : day === '90' ? <code>^{status === '(comp-met)' || status === 'comp-met' ? 'comp-met' : (status || 'Failed')}^</code> : <code>^{status || 'On-Track'}^</code>}
              </div>
            )}
          </div>

          {!ptMetCompliance && ['30', '45', '60', '75', '90'].includes(day) && (
            <div className="form-group" id="cc_status_group">
              <label>Status:</label>
              <div className="radio-group">
                {['30', '45', '60'].includes(day) && (
                  <>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="cc_status"
                        id="cc_status_ontrack"
                        value="On-Track"
                        checked={status === 'On-Track'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      <label htmlFor="cc_status_ontrack">On-Track</label>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="cc_status"
                        id="cc_status_atrisk"
                        value="At Risk"
                        checked={status === 'At Risk'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      <label htmlFor="cc_status_atrisk">At Risk</label>
                    </div>
                  </>
                )}
                {day === '75' && (
                  <>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="cc_status"
                        id="cc_status_atrisk"
                        value="At Risk"
                        checked={status === 'At Risk'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      <label htmlFor="cc_status_atrisk">At Risk</label>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="cc_status"
                        id="cc_status_failed"
                        value="Failed"
                        checked={status === 'Failed'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      <label htmlFor="cc_status_failed">Failed</label>
                    </div>
                  </>
                )}
                {day === '90' && (
                  <>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="cc_status"
                        id="cc_status_failed"
                        value="Failed"
                        checked={status === 'Failed'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      <label htmlFor="cc_status_failed">Failed</label>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="cc_status"
                        id="cc_status_comp_met"
                        value="comp-met"
                        checked={status === 'comp-met' || status === '(comp-met)'}
                        onChange={() => setStatus('comp-met')}
                      />
                      <label htmlFor="cc_status_comp_met">comp-met</label>
                    </div>
                  </>
                )}
              </div>
              {['30', '45', '60'].includes(day) && (
                <div className="text-small mt-10">
                  Status automatically determined (≤{day === '30' ? '33%' : day === '45' ? '47%' : '60%'} = At Risk)
                </div>
              )}
              {day === '90' && (
                <div className="text-small mt-10">
                  Status automatically determined (≥70% = comp-met, &lt;70% / No usage = Failed)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>Note Fields</h3>

        <div className="form-group">
          <label>Call Result:</label>
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Standard Call Results on Left */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="radio-item">
                <input
                  type="radio"
                  name="cc_call_result"
                  id="cc_call_result_connected"
                  value="Connected"
                  checked={callResult === 'Connected' && !ptMetCompliance && !isDnc}
                  onChange={() => handleCallResultChange('Connected')}
                />
                <label htmlFor="cc_call_result_connected">Connected</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="cc_call_result"
                  id="cc_call_result_vm"
                  value="LMOM (Voice Mail)"
                  checked={callResult === 'LMOM (Voice Mail)' && !ptMetCompliance && !isDnc}
                  onChange={() => handleCallResultChange('LMOM (Voice Mail)')}
                />
                <label htmlFor="cc_call_result_vm">LMOM (Voice Mail)</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="cc_call_result"
                  id="cc_call_result_email"
                  value="Email"
                  checked={callResult === 'Email' && !ptMetCompliance && !isDnc}
                  onChange={() => handleCallResultChange('Email')}
                />
                <label htmlFor="cc_call_result_email">Email</label>
              </div>
            </div>

            {/* All the way to the right: DNC Option with Dropdown Menu */}
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <div className="radio-item flex items-center">
                <input
                  type="radio"
                  name="cc_call_result"
                  id="cc_call_result_dnc"
                  value="DNC"
                  checked={isDnc}
                  onChange={() => handleSelectDnc(dncReason)}
                />
                <label htmlFor="cc_call_result_dnc" className="font-bold text-amber-400 cursor-pointer">
                  DNC
                </label>
              </div>

              {/* Dropdown Menu for DNC option */}
              <div className="relative inline-block">
                <select
                  id="cc_dnc_dropdown"
                  value={dncReason}
                  onChange={(e) => handleSelectDnc(e.target.value as DncReason)}
                  className={`text-xs font-semibold py-1.5 px-3 pr-7 rounded-md border cursor-pointer appearance-none transition-all ${
                    isDnc
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 font-bold'
                      : 'bg-surface-3 hover:bg-surface-4 text-text border-border'
                  }`}
                  title="Select DNC Option"
                >
                  {DNC_OPTIONS.map((opt) => (
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
            <div className="mt-2.5 p-2 rounded-lg bg-surface-2 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 animate-fadeIn">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-amber-300">
                  DNC Option:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DNC_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectDnc(opt.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md border cursor-pointer transition-all flex items-center gap-1.5 ${
                        dncReason === opt.id
                          ? 'bg-amber-600 border-amber-500 text-white shadow-sm ring-1 ring-amber-400/50'
                          : 'bg-surface-3 hover:bg-surface-4 text-text border-border'
                      }`}
                    >
                      <span className={`text-xs ${dncReason === opt.id ? 'font-black text-white' : 'text-neutral-500'}`}>
                        {dncReason === opt.id ? '✓' : '○'}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs text-amber-400/80 font-mono">
                Call Result: DNC
              </span>
            </div>
          )}
        </div>

        {!ptMetCompliance && (
          <div className="email-section" id="cc_email_section">
            <h3>
              Email Configuration
              {isDnc && (
                <span className="text-xs font-normal text-amber-300 ml-1.5">
                  (Optional: Send email if patient prefers email over calls)
                </span>
              )}
            </h3>
            {callResult === 'Email' ? (
              <div className="form-group" id="cc_patient_email_group">
                <label htmlFor="cc_patient_email">Patient Email Address (for follow-up email):</label>
                <input
                  type="email"
                  id="cc_patient_email"
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
                      id="cc_send_email"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                    />
                    <label htmlFor="cc_send_email">
                      Send Email to Patient {isDnc && <span className="text-xs text-neutral-400 font-normal">(Patient prefers email over calls)</span>}
                    </label>
                  </div>
                </div>
                {sendEmail && (
                  <div className="form-group" id="cc_patient_email_group">
                    <label htmlFor="cc_patient_email">Patient Email:</label>
                    <input
                      type="email"
                      id="cc_patient_email"
                      placeholder="patient@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {day === '75' && status === 'At Risk' && (sendEmail || callResult === 'Email') && (
              <div className="form-group mt-3" id="cc_nights_needed_group">
                <label htmlFor="cc_nights_needed">Nights needed to achieve compliance (for email template):</label>
                <input
                  type="number"
                  id="cc_nights_needed"
                  placeholder="e.g. 5"
                  value={nightsNeeded}
                  onChange={(e) => setNightsNeeded(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="cc_reviewed_therapy"
              checked={reviewedTherapy}
              onChange={(e) => setReviewedTherapy(e.target.checked)}
            />
            <label htmlFor="cc_reviewed_therapy">Reviewed therapy data in Airview/React Health Portal</label>
          </div>
        </div>

        {day !== '90' ? (
          <>
            <div className="grid grid-2">
              <div className="form-group">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <label htmlFor="cc_compliance_percent">Compliance % as of today:</label>
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
                  id="cc_compliance_percent"
                  placeholder="e.g., 70"
                  value={compliancePercent}
                  onChange={(e) => handleCompliancePercentChange(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cc_days_remaining">Days remaining in compliance period:</label>
                <input
                  type="text"
                  id="cc_days_remaining"
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
                  <label htmlFor="cc_setup_date">Therapy Setup Date:</label>
                  <input
                    type="date"
                    id="cc_setup_date"
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
                      id="cc_calc_result"
                      className={`status-message status-${calcResult.statusType} mt-2`}
                    >
                      {calcResult.statusText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="form-group">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
              <label htmlFor="cc_compliance_percent">Compliance % as of today:</label>
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
              id="cc_compliance_percent"
              placeholder="e.g., 70"
              value={compliancePercent}
              onChange={(e) => handleCompliancePercentChange(e.target.value)}
            />
          </div>
        )}

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
                  name="cc_insurance"
                  id={`cc_ins_${ins}`}
                  value={ins}
                  checked={insurance === ins}
                  onChange={(e) => setInsurance(e.target.value)}
                />
                <label htmlFor={`cc_ins_${ins}`}>{ins}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Day 90 Simplified Next Steps */}
        {day === '90' && !ptMetCompliance && !isDnc && (
          <div className="day90-section my-3 p-3.5 rounded-lg bg-surface-2 border border-border animate-fadeIn">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5">
              Day 90 Compliance Next Steps
            </h4>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_informed_status_90"
                  checked={informedStatus}
                  onChange={(e) => setInformedStatus(e.target.checked)}
                />
                <label htmlFor="cc_informed_status_90">Informed PT of compliance status and next steps</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_discussed_recert_90"
                  checked={discussedRecert}
                  onChange={(e) => setDiscussedRecert(e.target.checked)}
                />
                <label htmlFor="cc_discussed_recert_90">Discussed recertification steps</label>
              </div>
            </div>
          </div>
        )}

        {isDnc && (
          <div className="p-3 my-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between flex-wrap gap-2">
            <div>
              📦 <strong>DNC: {DNC_OPTIONS.find((o) => o.id === dncReason)?.label}</strong> — Call Result is logged as <code>DNC</code> and subject is {day === '10' || day === '21' ? <code>CC-Compliance Check In Day {day} ^^</code> : day === '90' ? <code>CC-Compliance Check In Day 90 ^{status === '(comp-met)' || status === 'comp-met' ? 'comp-met' : (status || 'Failed')}^</code> : <code>CC-Compliance Check In Day {day} ^{status || 'On-Track'}^</code>}. Phone questionnaire is bypassed.
            </div>
            <button
              type="button"
              onClick={() => handleCallResultChange('Connected')}
              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs cursor-pointer font-medium"
            >
              Switch to standard call form
            </button>
          </div>
        )}

        {ptMetCompliance && (
          <div className="p-3 my-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-whitemerald-300 text-xs flex items-center justify-between flex-wrap gap-2">
            <div>
              ✓ <strong>PT Met Compliance (≥70% usage)</strong> — Call Result is logged as <code>No need to call PT</code> and subject is {day === '10' || day === '21' ? <code>^^</code> : day === '90' ? <code>^comp-met^</code> : <code>^On-Track^</code>}. Phone questionnaire is bypassed.
            </div>
            <button
              type="button"
              onClick={() => togglePtMetCompliance(false)}
              className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-whitemerald-200 border border-emerald-500/40 text-xs cursor-pointer font-medium"
            >
              Switch to standard call form
            </button>
          </div>
        )}

        {day !== '90' && !ptMetCompliance && !isDnc && callType === 'Voicemail' && (
          <div className="p-3 my-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs">
            📞 <strong>Voicemail / LMOM recorded</strong> — Phone questionnaire is omitted from the note. You can add any extra notes in the Comments box below.
          </div>
        )}

        {day !== '90' && !ptMetCompliance && !isDnc && callType === 'Email' && (
          <div className="p-3 my-3 rounded-md border border-blue-500/40 bg-blue-500/10 text-whitelue-300 text-xs">
            ✉️ <strong>Email contact selected</strong> (PT unreachable via phone) — Phone questionnaire is omitted from the note. You can add any extra notes in the Comments box below.
          </div>
        )}

        {day !== '90' && !ptMetCompliance && !isDnc && callType === 'Connected' && (
          <>
            <div className="form-group">
              <label htmlFor="cc_therapy_description">Describe how therapy is going:</label>
              <textarea
                id="cc_therapy_description"
                placeholder="Patient's therapy progress..."
                value={therapyDescription}
                onChange={(e) => setTherapyDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_discomfort"
                  checked={discomfort}
                  onChange={(e) => setDiscomfort(e.target.checked)}
                />
                <label htmlFor="cc_discomfort">Is the patient experiencing any discomfort</label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cc_recommendations">Recommendations to Pt:</label>
              <textarea
                id="cc_recommendations"
                placeholder="Recommendations provided..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
              />
            </div>

            {(day === '10' || day === '21') && (
              <div className="form-group" id="cc_fitpack_group">
                <label htmlFor="cc_fitpack_size">
                  If PT received Fitpack, confirm which size cushion they are using:
                </label>
                <input
                  type="text"
                  id="cc_fitpack_size"
                  placeholder="e.g. Small, Medium, Large"
                  value={fitpackSize}
                  onChange={(e) => setFitpackSize(e.target.value)}
                />
              </div>
            )}

            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_myair_app"
                  checked={myairApp}
                  onChange={(e) => setMyairApp(e.target.checked)}
                />
                <label htmlFor="cc_myair_app">Does the patient have the MyAir/React App installed?</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_cleaning_reviewed"
                  checked={cleaningReviewed}
                  onChange={(e) => setCleaningReviewed(e.target.checked)}
                />
                <label htmlFor="cc_cleaning_reviewed">Were cleaning/re-supply guidelines reviewed?</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_insurance_guidelines"
                  checked={insuranceGuidelines}
                  onChange={(e) => setInsuranceGuidelines(e.target.checked)}
                />
                <label htmlFor="cc_insurance_guidelines">Discussed insurance compliance guidelines (4 hours a night)?</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_md_followup"
                  checked={mdFollowup}
                  onChange={(e) => setMdFollowup(e.target.checked)}
                />
                <label htmlFor="cc_md_followup">Discussed need for MD Follow Up Appt?</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_survey_review"
                  checked={surveyReview}
                  onChange={(e) => setSurveyReview(e.target.checked)}
                />
                <label htmlFor="cc_survey_review">Patient notified of possible call survey, asked to leave a Google or Yelp review?</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cc_contact_info"
                  checked={contactInfo}
                  onChange={(e) => setContactInfo(e.target.checked)}
                />
                <label htmlFor="cc_contact_info">If patient has additional concerns, do they know how to reach us?</label>
              </div>
            </div>

            {day === '75' && status === 'Failed' && (
              <div className="day75-section" id="cc_day75_section">
                <h3>Day 75 Failed Status - Simplified Format</h3>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="cc_informed_status"
                      checked={informedStatus}
                      onChange={(e) => setInformedStatus(e.target.checked)}
                    />
                    <label htmlFor="cc_informed_status">If YES, informed PT of compliance status and next steps</label>
                  </div>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="cc_discussed_recert"
                      checked={discussedRecert}
                      onChange={(e) => setDiscussedRecert(e.target.checked)}
                    />
                    <label htmlFor="cc_discussed_recert">If YES, discussed recertification steps</label>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="form-group">
          <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
            <label htmlFor="cc_comments">Comments:</label>
            {isDnc && (
              <span className="text-xs text-amber-300">
                Default: &quot;{DNC_OPTIONS.find((o) => o.id === dncReason)?.defaultComment}&quot;
              </span>
            )}
          </div>

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
            id="cc_comments"
            placeholder={
              isDnc
                ? dncReason === 'active_order'
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
