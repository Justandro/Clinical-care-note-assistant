import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ReturnLabelTab: React.FC<Props> = ({ showToast }) => {
  const [labelType, setLabelType] = usePersistentState<string>(
    'rl_labelType',
    'Email Label (print at home) DEFAULT - if pt cant print offer Direct to Mobile Email QR code'
  );
  const [labelTypeSent, setLabelTypeSent] = usePersistentState<string>('rl_labelTypeSent', 'VGM');
  const [email, setEmail] = usePersistentState<string>('rl_email', '');
  const [tracking, setTracking] = usePersistentState<string>('rl_tracking', '');
  const [confirmed, setConfirmed] = usePersistentState<boolean>('rl_confirmed', false);
  const [returningItems, setReturningItems] = usePersistentState<string[]>('rl_returningItems', []);
  const [serial, setSerial] = usePersistentState<string>('rl_serial', '');
  const [supplies, setSupplies] = usePersistentState<string>('rl_supplies', '');
  const [reason, setReason] = usePersistentState<string>('rl_reason', '');

  const returningOptions = [
    'PAP',
    'UNOPENED MASK',
    'FF CUSHIONS (2+)',
    'NASAL PILLOW/CUSHIONS (4+)',
    'VENT',
    'CONCENTRATOR',
    'FULL SHIPMENT',
  ];

  const handleToggleReturning = (item: string) => {
    setReturningItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const generateTitle = (): string => 'Return Label';

  const generateBody = (): string => {
    const returningJoined = returningItems.join(' / ');
    return `SELECT ONE:
${labelType}

*If patient is requesting RL to be mailed please process as email label and send to inventory@nationwidemedical.com (NMI) or sbrown@dhscompanies.com (DHS) to be mailed out*

What type of label was sent? (VGM=supplies only, NMI=machines(with supplies) only, DHS machines(with supplies) only): ${labelTypeSent}
*IF PT LIVE IN FL SEND RL FOR MACHINE TO DHS REGARDLESS OF BRANCH*

Email address: ${email}
Tracking number: ${tracking}
Did you confirm if patient received it while on the phone?: ${confirmed ? 'Y' : 'N'}

RETURNING: ${returningJoined}

IF EQUIPMENT RETURN LIST SERIAL NUMBER: ${serial}
IF SUPPLIES RETURN LIST ITEMS/QUANTITY: ${supplies}

**IF RETURNING A PAP PLEASE REMIND PT TO REMOVE WATER CHAMBER AND USED SUPPLIES BEFORE RETURNING***

SELECT ONE:
${reason}`.trim();
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
    setLabelType(
      'Email Label (print at home) DEFAULT - if pt cant print offer Direct to Mobile Email QR code'
    );
    setLabelTypeSent('VGM');
    setEmail('');
    setTracking('');
    setConfirmed(false);
    setReturningItems([]);
    setSerial('');
    setSupplies('');
    setReason('');
    showToast('Form cleared!', 'info');
  };

  const reasonList = [
    'Alt. Therapy',
    'Bipap Rescue',
    'Cannot Pay OOP',
    'Cushion Swap',
    'Deceased',
    'Defective Product',
    'DC Order',
    'Duplicate',
    'Failed Compliance',
    'Incorrect Address',
    'Incorrect Machine',
    'Incorrect Supplies',
    'Insurance Issues',
    'Loaner/RUW/Swapout',
    'Mask Swap',
    'Medical Records Not Approved',
    'Need Okay      (this should ONLY be used if patient is ALREADY coded Need Okay)',
    'NMI Error - MISSING FROM PICK UP EXCH OPTIONS',
    'No longer needs therapy',
    'Pt refused therapy',
    'Patient Canceled (when order is already booked/dropped to VGM and pt calls to change/cancel)',
    'RUL',
    'Shipped w/o Approval      (PT should be updated to Need Okay in the event this is chosen)',
    'Switched Providers',
    'Upgrade/Downgrade',
  ];

  return (
    <div id="return-label" className="tab-content active">
      <div className="form-section">
        <h3>Subject: Return Label</h3>

        <div className="form-group">
          <label htmlFor="rl_label_type">
            <strong>SELECT ONE:</strong>
          </label>
          <select
            id="rl_label_type"
            value={labelType}
            onChange={(e) => setLabelType(e.target.value)}
          >
            <option value="Email Label (print at home) DEFAULT - if pt cant print offer Direct to Mobile Email QR code">
              Email Label (print at home) DEFAULT - if pt cant print offer Direct to Mobile Email QR code
            </option>
            <option value="UPS Direct to Mobile Email (QR code go to UPS and they will print and ship)">
              UPS Direct to Mobile Email (QR code go to UPS and they will print and ship)
            </option>
            <option value="MAIL - ONLY to be used if pt cannot physically go to UPS with QR code or no email on file  - NOTE MUST INCLUDE REASON FOR MAILING!">
              MAIL - ONLY to be used if pt cannot physically go to UPS with QR code or no email on file - NOTE MUST INCLUDE REASON FOR MAILING!
            </option>
          </select>
        </div>

        <div className="form-info text-small mt-10 mb-20">
          <p className="text-muted">(If patient has access to a printer, email label must be used!)</p>
          <p className="text-muted">
            (If patient is requesting RL to be mailed please process as email label and send to inventory@nationwidemedical.com to be mailed out) BE SURE TO INCLUDE WHY LABEL HAS TO BE MAILED VS EMAILED IN THIS NOTE
          </p>
        </div>

        <div className="form-group">
          <label>
            What type of label was sent? (VGM=supplies only, NMI=machines(with supplies) only, DHS machines(with supplies) only):
          </label>
          <div className="radio-group">
            {['VGM', 'NMI', 'DHS'].map((item) => (
              <div key={item} className="radio-item">
                <input
                  type="radio"
                  name="rl_label_type_sent"
                  id={`rl_sent_${item.toLowerCase()}`}
                  value={item}
                  checked={labelTypeSent === item}
                  onChange={(e) => setLabelTypeSent(e.target.value)}
                />
                <label htmlFor={`rl_sent_${item.toLowerCase()}`}>{item}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-info text-small text-whiteold mb-20">
          <p className="text-orange">*IF PT LIVE IN FL SEND RL FOR MACHINE TO DHS REGARDLESS OF BRANCH*</p>
        </div>

        <div className="form-info text-small mb-20">
          <p className="text-muted">VGM: 777 S 67th Ave. Suite #150, Phoenix AZ 85043</p>
          <p className="text-muted">NEVER SEND MORE THAN ONE LABEL UNLESS PT IS RETURNING 2 CONCENTRATORS</p>
        </div>

        <div className="form-group">
          <label htmlFor="rl_email">Email address:</label>
          <input
            type="text"
            id="rl_email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rl_tracking">Tracking number:</label>
          <input
            type="text"
            id="rl_tracking"
            placeholder="Enter tracking number"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              id="rl_confirmed"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>Did you confirm if patient received it while on the phone?</span>
          </label>
        </div>

        <div className="form-group">
          <label>
            <strong>RETURNING (select all that apply):</strong>
          </label>
          <div id="rl_returning" className="checkbox-group">
            {returningOptions.map((opt) => (
              <label key={opt} className="checkbox-item">
                <input
                  type="checkbox"
                  value={opt}
                  checked={returningItems.includes(opt)}
                  onChange={() => handleToggleReturning(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rl_serial">IF EQUIPMENT RETURN LIST SERIAL NUMBER:</label>
          <input
            type="text"
            id="rl_serial"
            placeholder="Enter serial number(s)"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rl_supplies">IF SUPPLIES RETURN LIST ITEMS/QUANTITY:</label>
          <input
            type="text"
            id="rl_supplies"
            placeholder="Enter items/quantities"
            value={supplies}
            onChange={(e) => setSupplies(e.target.value)}
          />
        </div>

        <div className="form-info text-small text-whiteold mb-20">
          <p className="text-orange">
            **IF RETURNING A PAP PLEASE REMIND PT TO REMOVE WATER CHAMBER AND USED SUPPLIES BEFORE RETURNING***
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="rl_reason">
            <strong>SELECT ONE:</strong>
          </label>
          <select
            id="rl_reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">-- Select Reason --</option>
            {reasonList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
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
