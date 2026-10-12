import React, { useState } from 'react';
import { Truck, Clock, AlertTriangle } from 'lucide-react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { WarningAlert, InstructionAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SupplyRequestTab: React.FC<Props> = ({ showToast }) => {
  const [shipping, setShipping] = usePersistentState<string>('sr_shipping', 'UPS Surepost (Standard Shipping)');
  const [requestedItem, setRequestedItem] = usePersistentState<string>('sr_requestedItem', '');
  const [reason, setReason] = usePersistentState<string>('sr_reason', 'Miscellaneous Supplies');
  const [defectiveMfg, setDefectiveMfg] = usePersistentState<string>('sr_defectiveMfg', '');
  const [incorrectPart, setIncorrectPart] = usePersistentState<string>('sr_incorrectPart', '');
  
  // Proof of delivery fields
  const [confirmAddress, setConfirmAddress] = usePersistentState<string>('sr_confirmAddress', '');
  const [homeDelivery, setHomeDelivery] = usePersistentState<string>('sr_homeDelivery', '');
  const [askedNeighbors, setAskedNeighbors] = usePersistentState<string>('sr_askedNeighbors', '');

  const [comments, setComments] = usePersistentState<string>('sr_comments', '');
  const [balance, setBalance] = usePersistentState<string>('sr_balance', 'no');
  const [texts, setTexts] = usePersistentState<string>('sr_texts', 'no');
  const [survey, setSurvey] = usePersistentState<string>('sr_survey', 'no');

  const generateTitle = (): string => 'QA-Supply Request';

  const generateBody = (): string => {
    let reasonText = reason;
    if (reason === 'Defective Product') {
      if (defectiveMfg) {
        reasonText = `Defective Product-${defectiveMfg}\n(pt provided picture and upload it to pt account)`;
      } else {
        reasonText = `Defective Product-NO MFG SELECTED\n(pt provided picture and upload it to pt account)`;
      }
    } else if (reason === 'Incorrect Supplies – PART #') {
      reasonText = `Incorrect Supplies – PART ${incorrectPart}`;
    }

    let body = `All requests for zero cost supplies MUST be within 30 days of last resupply, unless patient is in Compliance period.

ANSWER ALL QUESTIONS BELOW:

Shipping Method: ${shipping}
*EXPEDITED SHIPPING CUTOFF TIME VGM: 10:30AM PST, NMI:1PM PST*
*CANNOT SEND TO PO BOX UNLESS NOTED WHY*

Requested item (list item line): ${requestedItem}
Reason for request - CHOOSE ONE BELOW:
${reasonText}`;

    if (reason === 'Proof of Delivery - Pt did not Receive Shipment') {
      body += `\n\nWithin 30 days of the original shipment
1. Can you please confirm your address? ${confirmAddress.trim()}
2. Was anyone home on the date it was delivered? ${homeDelivery.trim()}
3. Did you ask your family or neighbors if they saw the package? ${askedNeighbors.trim()}`;
    }

    body += `\n\nComments (IN DETAIL):
${comments.trim()}
Does pt have a current balance? ${balance}
Does pt wish to opt-in to texts?: ${texts}
Was the pt offered survey at the end of the call? ${survey}`;

    return body;
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
    setShipping('UPS Surepost (Standard Shipping)');
    setRequestedItem('');
    setReason('Miscellaneous Supplies');
    setDefectiveMfg('');
    setIncorrectPart('');
    setConfirmAddress('');
    setHomeDelivery('');
    setAskedNeighbors('');
    setComments('');
    setBalance('no');
    setTexts('no');
    setSurvey('no');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="supply-request" className="tab-content active">
      <div className="form-section">
        <h3>QA-Supply Request</h3>
        <WarningAlert title="Important Policy" className="mb-4">
          <p>All requests for zero cost supplies MUST be within 30 days of last resupply, unless patient is in Compliance period.</p>
        </WarningAlert>
        <InstructionAlert title="Instructions" className="mb-6">
          <p><strong>ANSWER ALL QUESTIONS BELOW:</strong></p>
        </InstructionAlert>

        <div className="form-group">
          <label>Shipping Method:</label>
          <div className="radio-group">
            {[
              'UPS Surepost (Standard Shipping)',
              'UPS Ground Shipping (must be approved)',
              'UPS 2nd Day Air (must be approved)',
              'UPS Overnight (must be approved)',
            ].map((m) => (
              <div key={m} className="radio-item">
                <input
                  type="radio"
                  name="sr_shipping"
                  id={`sr_ship_${m}`}
                  value={m}
                  checked={shipping === m}
                  onChange={(e) => setShipping(e.target.value)}
                />
                <label htmlFor={`sr_ship_${m}`}>{m}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Expedited Shipping Cutoff & PO Box Policy Notice */}
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/30 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5 shrink-0 border border-amber-500/20 shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-2.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-amber-200">
                    *EXPEDITED SHIPPING CUTOFF TIME*
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 font-mono text-xs font-bold text-amber-100 shadow-xs">
                    <span className="text-amber-400">VGM:</span> 10:30AM PST
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 font-mono text-xs font-bold text-amber-100 shadow-xs">
                    <span className="text-amber-400">NMI:</span> 1PM PST
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-200/95 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-amber-300">
                  *CANNOT SEND TO PO BOX UNLESS NOTED WHY*
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sr_requested_item">Requested item (list item line):</label>
          <input
            type="text"
            id="sr_requested_item"
            placeholder="Enter requested item details..."
            value={requestedItem}
            onChange={(e) => setRequestedItem(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Reason for request - CHOOSE ONE BELOW:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {[
              'Miscellaneous Supplies',
              'Change size/Non-Compatible Item',
            ].map((r) => (
              <div key={r} className="radio-item card-radio">
                <input
                  type="radio"
                  name="sr_reason"
                  id={`sr_reason_${r}`}
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-0.5"
                />
                <label htmlFor={`sr_reason_${r}`} className="text-sm cursor-pointer">{r}</label>
              </div>
            ))}

            <div className="radio-item card-radio flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="radio"
                  name="sr_reason"
                  id="sr_reason_incorrect_supplies"
                  value="Incorrect Supplies – PART #"
                  checked={reason === 'Incorrect Supplies – PART #'}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-0.5"
                />
                <label htmlFor="sr_reason_incorrect_supplies" className="text-sm cursor-pointer">Incorrect Supplies – PART #</label>
              </div>

              {reason === 'Incorrect Supplies – PART #' && (
                <div id="sr_incorrect_options" className="w-full pl-6 mt-1">
                  <input
                    type="text"
                    id="sr_incorrect_part"
                    placeholder="Enter Part #..."
                    value={incorrectPart}
                    onChange={(e) => setIncorrectPart(e.target.value)}
                    className="sub-input"
                  />
                </div>
              )}
            </div>

            {[
              'Missing Supplies from Shipment',
            ].map((r) => (
              <div key={r} className="radio-item card-radio">
                <input
                  type="radio"
                  name="sr_reason"
                  id={`sr_reason_${r}`}
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-0.5"
                />
                <label htmlFor={`sr_reason_${r}`} className="text-sm cursor-pointer">{r}</label>
              </div>
            ))}

            {/* Defective Product with MFG selection */}
            <div className="radio-item card-radio flex-col items-start gap-2">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="radio"
                  name="sr_reason"
                  id="sr_reason_defective"
                  value="Defective Product"
                  checked={reason === 'Defective Product'}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-0.5"
                />
                <label htmlFor="sr_reason_defective" className="text-sm cursor-pointer">Defective Product-PICK MFG</label>
              </div>

              {reason === 'Defective Product' && (
                <div id="sr_defective_options" className="w-full pl-6 mt-1">
                  <select
                    id="sr_defective_mfg"
                    value={defectiveMfg}
                    onChange={(e) => setDefectiveMfg(e.target.value)}
                    className="sub-input"
                  >
                    <option value="">-- Pick MFG --</option>
                    <option value="ResMed">ResMed</option>
                    <option value="Philips">Philips</option>
                    <option value="React">React</option>
                    <option value="Sunset">Sunset</option>
                    <option value="F&P">F&P</option>
                  </select>
                  <div className="text-xs text-orange-400 mt-1">
                    (Choose the product's brand)
                  </div>
                </div>
              )}
            </div>

            {[
              'Patient Error',
              'Incorrect Address',
              'SNAP Error',
              'Courtesy',
              'COMP RECERT - Zero Cost',
              'VGM Reship over 30 days',
              'Damaged in transit',
              'Reship',
              'Proof of Delivery - Pt did not Receive Shipment',
            ].map((r) => (
              <div key={r} className="radio-item card-radio">
                <input
                  type="radio"
                  name="sr_reason"
                  id={`sr_reason_${r}`}
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-0.5"
                />
                <label htmlFor={`sr_reason_${r}`} className="text-sm cursor-pointer">{r}</label>
              </div>
            ))}
          </div>
        </div>

        {reason === 'Proof of Delivery - Pt did not Receive Shipment' && (
          <div className="form-section day75-section" id="sr_proof_section">
            <h3>Proof of Delivery Questions</h3>
            <InstructionAlert className="mb-6">
              <p><strong>FILL OUT QUESTIONS BELOW (Within 30 days of the original shipment)</strong></p>
            </InstructionAlert>

            <div className="form-group">
              <label htmlFor="sr_confirm_address">1. Can you please confirm your address?</label>
              <input
                type="text"
                id="sr_confirm_address"
                placeholder="Patient's confirmed address..."
                value={confirmAddress}
                onChange={(e) => setConfirmAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sr_home_delivery">2. Was anyone home on the date it was delivered?</label>
              <input
                type="text"
                id="sr_home_delivery"
                placeholder="Yes/No and details..."
                value={homeDelivery}
                onChange={(e) => setHomeDelivery(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sr_asked_neighbors">3. Did you ask your family or neighbors if they saw the package?</label>
              <input
                type="text"
                id="sr_asked_neighbors"
                placeholder="Yes/No and details..."
                value={askedNeighbors}
                onChange={(e) => setAskedNeighbors(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="sr_comments">Comments (IN DETAIL):</label>
          <textarea
            id="sr_comments"
            placeholder="Detailed comments about the supply request..."
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div className="grid grid-3">
          <div className="form-group">
            <label>Does pt have a current balance?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_balance"
                  id="sr_balance_yes"
                  value="yes"
                  checked={balance === 'yes'}
                  onChange={(e) => setBalance(e.target.value)}
                />
                <label htmlFor="sr_balance_yes">Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_balance"
                  id="sr_balance_no"
                  value="no"
                  checked={balance === 'no'}
                  onChange={(e) => setBalance(e.target.value)}
                />
                <label htmlFor="sr_balance_no">No</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_balance"
                  id="sr_balance_na"
                  value="N/A"
                  checked={balance === 'N/A'}
                  onChange={(e) => setBalance(e.target.value)}
                />
                <label htmlFor="sr_balance_na">N/A</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Does pt wish to opt-in to texts?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_texts"
                  id="sr_texts_yes"
                  value="yes"
                  checked={texts === 'yes'}
                  onChange={(e) => setTexts(e.target.value)}
                />
                <label htmlFor="sr_texts_yes">Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_texts"
                  id="sr_texts_no"
                  value="no"
                  checked={texts === 'no'}
                  onChange={(e) => setTexts(e.target.value)}
                />
                <label htmlFor="sr_texts_no">No</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_texts"
                  id="sr_texts_na"
                  value="N/A"
                  checked={texts === 'N/A'}
                  onChange={(e) => setTexts(e.target.value)}
                />
                <label htmlFor="sr_texts_na">N/A</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Was the pt offered survey at the end of the call?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_survey"
                  id="sr_survey_yes"
                  value="yes"
                  checked={survey === 'yes'}
                  onChange={(e) => setSurvey(e.target.value)}
                />
                <label htmlFor="sr_survey_yes">Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_survey"
                  id="sr_survey_no"
                  value="no"
                  checked={survey === 'no'}
                  onChange={(e) => setSurvey(e.target.value)}
                />
                <label htmlFor="sr_survey_no">No</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="sr_survey"
                  id="sr_survey_na"
                  value="N/A"
                  checked={survey === 'N/A'}
                  onChange={(e) => setSurvey(e.target.value)}
                />
                <label htmlFor="sr_survey_na">N/A</label>
              </div>
            </div>
          </div>
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
