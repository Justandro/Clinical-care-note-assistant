import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { WarningAlert, InstructionAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const MaskExchangeTab: React.FC<Props> = ({ showToast }) => {
  const [shipping, setShipping] = usePersistentState<string>('me_shipping', 'UPS Surepost (Standard Shipping)');
  const [currentMask, setCurrentMask] = usePersistentState<string>('me_currentMask', '');
  const [lastDos, setLastDos] = usePersistentState<string>('me_lastDos', '');
  const [approval, setApproval] = usePersistentState<string>('me_approval', '');
  const [maskExchanged, setMaskExchanged] = usePersistentState<string>('me_maskExchanged', '');
  const [billingAware, setBillingAware] = usePersistentState<string>('me_billingAware', '');
  const [rtVisit, setRtVisit] = usePersistentState<string>('me_rtVisit', '');
  const [pacemaker, setPacemaker] = usePersistentState<boolean>('me_pacemaker', false);
  const [zcoReason, setZcoReason] = usePersistentState<string>('me_zcoReason', '1-Mask Swap');
  const [swapReason, setSwapReason] = usePersistentState<string>('me_swapReason', 'Change Size');
  const [comments, setComments] = usePersistentState<string>('me_comments', '');
  const [maskfitAr, setMaskfitAr] = usePersistentState<boolean>('me_maskfitAr', false);

  const generateTitle = (): string => 'QA-Mask Exchange Request';

  const generateBody = (): string => {
    return `ALL QUESTIONS BELOW MUST BE ANSWERED

Shipping Method: ${shipping}

Current Mask (list item line): ${currentMask}
Last mask DOS?: ${lastDos}
If greater than 30 days, did you receive approval from management (if outside of compliance)?: ${approval}
*Mask Exchanged to (list item line): ${maskExchanged}
*Is PT aware initial mask/cushion billing will remain?: ${billingAware}
*IS PT PENDING RT VISIT? If so, please email RT Support details of mask exchange! ${rtVisit}
*DOES PT HAVE PACEMAKER/METAL IMPLANT? ${pacemaker ? 'Y' : 'N'} (if yes pt shouldn't have a magnet mask)
*ZCO Reason for exchange - choose ONE below:
${zcoReason}

*Choose one of the reasons below for the mask swap:
-${swapReason}

Comments: (IN DETAIL)
${comments.trim()}
Is this a Maskfit AR recommended mask? ${maskfitAr ? 'yes' : 'no'}
Does pt have a current balance? no
Does pt wish to opt-in to texts?: no`;
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
    setCurrentMask('');
    setLastDos('');
    setApproval('');
    setMaskExchanged('');
    setBillingAware('');
    setRtVisit('');
    setPacemaker(false);
    setZcoReason('1-Mask Swap');
    setSwapReason('Change Size');
    setComments('');
    setMaskfitAr(false);
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="mask-exchange" className="tab-content active">
      <div className="form-section">
        <h3>QA-Mask Exchange Request</h3>
        
        <InstructionAlert title="Instructions" className="mb-4">
          <p><strong>ALL QUESTIONS BELOW MUST BE ANSWERED</strong></p>
        </InstructionAlert>
        
        <WarningAlert title="Important Shipping & Mask Guidelines" className="mb-6">
          <p>• PLEASE INFORM PATIENT SHIPPING WILL TAKE ABOUT 5-7 BUSINESS DAYS!</p>
          <p>• EXPEDITED SHIPPING CUTOFF TIME VGM: 10:30AM PST, NMI: 1PM PST</p>
          <p>• ONLY DW & 30I MASK COME IN DIFF SIZE FRAMES. IF NOT CHANGING MASK TYPE, CUSHION SWAP ONLY.</p>
        </WarningAlert>

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
                  name="me_shipping"
                  id={`me_ship_${m}`}
                  value={m}
                  checked={shipping === m}
                  onChange={(e) => setShipping(e.target.value)}
                />
                <label htmlFor={`me_ship_${m}`}>{m}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="me_current_mask">Current Mask (list item line):</label>
            <input
              type="text"
              id="me_current_mask"
              placeholder="Current mask details..."
              value={currentMask}
              onChange={(e) => setCurrentMask(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="me_last_dos">Last mask DOS?:</label>
            <input
              type="text"
              id="me_last_dos"
              placeholder="Date of service..."
              value={lastDos}
              onChange={(e) => setLastDos(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="me_approval">If &gt;30 days, approval from management?:</label>
            <input
              type="text"
              id="me_approval"
              placeholder="Approval details..."
              value={approval}
              onChange={(e) => setApproval(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="me_mask_exchanged">*Mask Exchanged to (list item line):</label>
            <input
              type="text"
              id="me_mask_exchanged"
              placeholder="New mask details..."
              value={maskExchanged}
              onChange={(e) => setMaskExchanged(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="me_billing_aware">*Is PT aware initial mask/cushion billing will remain?:</label>
            <input
              type="text"
              id="me_billing_aware"
              placeholder="Yes/No"
              value={billingAware}
              onChange={(e) => setBillingAware(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="me_rt_visit">*IS PT PENDING RT VISIT?:</label>
            <input
              type="text"
              id="me_rt_visit"
              placeholder="Yes/No"
              value={rtVisit}
              onChange={(e) => setRtVisit(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="me_pacemaker"
              checked={pacemaker}
              onChange={(e) => setPacemaker(e.target.checked)}
            />
            <label htmlFor="me_pacemaker">*DOES PT HAVE PACEMAKER/METAL IMPLANT?</label>
          </div>
        </div>

        <div className="form-group">
          <label>*ZCO Reason for exchange:</label>
          <div className="radio-group">
            {[
              '1-Mask Swap',
              '2-Cushion Swap',
            ].map((r) => (
              <div key={r} className="radio-item">
                <input
                  type="radio"
                  name="me_zco_reason"
                  id={`me_zco_${r}`}
                  value={r}
                  checked={zcoReason === r}
                  onChange={(e) => setZcoReason(e.target.value)}
                />
                <label htmlFor={`me_zco_${r}`}>{r}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>*Choose reason for mask swap:</label>
          <div className="radio-group">
            {[
              'Change Size',
              'MD/Facility/Sales Rep Swapped Mask',
              'RT Swapped Mask',
              'Feeling Claustrophobic',
              'Discomfort/Pain/Nose Sores',
              'Mask Leaks/Poor Seal',
              'Mouth Breather',
              'Mask Swap Error',
              'SNAP Error',
              'Resupply Error',
              'Patient Error',
              'Maskfit AR Recommendation',
              'Maskfit AR Error',
            ].map((r) => (
              <div key={r} className="radio-item">
                <input
                  type="radio"
                  name="me_swap_reason"
                  id={`me_swap_${r}`}
                  value={r}
                  checked={swapReason === r}
                  onChange={(e) => setSwapReason(e.target.value)}
                />
                <label htmlFor={`me_swap_${r}`}>{r}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="me_comments">Comments: (IN DETAIL)</label>
          <textarea
            id="me_comments"
            placeholder="Detailed comments about the mask exchange..."
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="me_maskfit_ar"
              checked={maskfitAr}
              onChange={(e) => setMaskfitAr(e.target.checked)}
            />
            <label htmlFor="me_maskfit_ar">Is this a Maskfit AR recommended mask?</label>
          </div>
        </div>

        <div className="text-small mt-20 text-muted">
          <p>• Does pt have a current balance? no #always set as no</p>
          <p>• Does pt wish to opt-in to texts?: no #always set as no</p>
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
