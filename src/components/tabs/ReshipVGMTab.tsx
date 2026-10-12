import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { WarningAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateTab?: (tabId: string) => void;
}

export const ReshipVGMTab: React.FC<Props> = ({ showToast, onNavigateTab }) => {
  const [titleType, setTitleType] = usePersistentState<string>('rv_titleType', 'QA-Reship Order');
  const [shipping, setShipping] = usePersistentState<string>('rv_shipping', 'UPS Surepost (Standard Shipping)');
  const [salesOrder, setSalesOrder] = usePersistentState<string>('rv_salesOrder', '');
  const [items, setItems] = usePersistentState<string>('rv_items', '');
  const [errorType, setErrorType] = usePersistentState<string>('rv_errorType', '');
  const [partNum, setPartNum] = usePersistentState<string>('rv_partNum', '');
  const [openStatus, setOpenStatus] = usePersistentState<string>('rv_openStatus', 'Open');
  const [details, setDetails] = usePersistentState<string>('rv_details', '');
  const [balance, setBalance] = usePersistentState<string>('rv_balance', 'no');
  const [texts, setTexts] = usePersistentState<string>('rv_texts', 'no');
  const [survey, setSurvey] = usePersistentState<string>('rv_survey', 'no');

  const generateTitle = (): string => titleType;

  const generateBody = (): string => {
    let errorText = errorType;
    if (errorType === 'Incorrect Items') {
      errorText = `Incorrect Items - PART #: ${partNum}\nAre the incorrect items open or unopened? (CHOOSE ONE): ${openStatus}`;
    }

    return `**IF WE ARE RESENDING DUE TO INCORRECT ADDRESS PLEASE USE QA-SUPPLY REQUEST NOTE**

Shipping Method: ${shipping}

Sales Order Number: (REQUIRED) ${salesOrder}

Items Requested: ${items}

VGM Error: (Choose One)
${errorText}

Explain in Detail: (REQUIRED)
${details}

Does pt have a current balance? ${balance}
Does pt wish to opt-in to texts?: ${texts}
Was the pt offered survey at the end of the call? ${survey}`.trim();
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
    setTitleType('QA-Reship Order');
    setShipping('UPS Surepost (Standard Shipping)');
    setSalesOrder('');
    setItems('');
    setErrorType('');
    setPartNum('');
    setOpenStatus('Open');
    setDetails('');
    setBalance('no');
    setTexts('no');
    setSurvey('no');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="reship-vgm" className="tab-content active">
      <div className="form-section">
        <h3>Subject line</h3>
        <div className="form-group">
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="rv_title"
                id="rv_title_reship"
                value="QA-Reship Order"
                checked={titleType === 'QA-Reship Order'}
                onChange={(e) => setTitleType(e.target.value)}
              />
              <label htmlFor="rv_title_reship">QA-Reship Order</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="rv_title"
                id="rv_title_vgm"
                value="QA-VGM Error"
                checked={titleType === 'QA-VGM Error'}
                onChange={(e) => setTitleType(e.target.value)}
              />
              <label htmlFor="rv_title_vgm">QA-VGM Error</label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Note Fields</h3>
        <WarningAlert className="mb-6 flex items-center justify-between flex-wrap gap-2">
          <p><strong>**IF WE ARE RESENDING DUE TO INCORRECT ADDRESS PLEASE USE QA-SUPPLY REQUEST NOTE**</strong></p>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('supply-request')}
              className="text-xs text-yellow-200 hover:text-white underline font-normal cursor-pointer whitespace-nowrap"
            >
              Go to Supply Request Note →
            </button>
          )}
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
                  name="rv_shipping"
                  id={`rv_ship_${m}`}
                  value={m}
                  checked={shipping === m}
                  onChange={(e) => setShipping(e.target.value)}
                />
                <label htmlFor={`rv_ship_${m}`}>{m}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rv_sales_order">Sales Order Number: (REQUIRED)</label>
          <input
            type="text"
            id="rv_sales_order"
            placeholder="Enter numbers here..."
            value={salesOrder}
            onChange={(e) => setSalesOrder(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rv_items">Items Requested:</label>
          <input
            type="text"
            id="rv_items"
            placeholder="Enter requested items..."
            value={items}
            onChange={(e) => setItems(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rv_error_type">VGM Error: (Choose One)</label>
          <select
            id="rv_error_type"
            value={errorType}
            onChange={(e) => setErrorType(e.target.value)}
          >
            <option value="">-- Select Error --</option>
            <option value="No Movement with Tracking Number - Need to Reship">
              No Movement with Tracking Number - Need to Reship
            </option>
            <option value="Missing Item(s)">Missing Item(s)</option>
            <option value="Broken or Damaged Items">Broken or Damaged Items</option>
            <option value="Incorrect Items">Incorrect Items</option>
          </select>
        </div>

        {errorType === 'Incorrect Items' && (
          <div id="rv_incorrect_group" className="form-section my-3" style={{ background: '#3a3a3a' }}>
            <div className="form-group">
              <label htmlFor="rv_part_num">Incorrect Items - PART #:</label>
              <input
                type="text"
                id="rv_part_num"
                placeholder="Enter Part Number..."
                value={partNum}
                onChange={(e) => setPartNum(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Are the incorrect items open or unopened? (CHOOSE ONE):</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="rv_open_status"
                    id="rv_status_open"
                    value="Open"
                    checked={openStatus === 'Open'}
                    onChange={(e) => setOpenStatus(e.target.value)}
                  />
                  <label htmlFor="rv_status_open">Open</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="rv_open_status"
                    id="rv_status_unopened"
                    value="Unopened"
                    checked={openStatus === 'Unopened'}
                    onChange={(e) => setOpenStatus(e.target.value)}
                  />
                  <label htmlFor="rv_status_unopened">Unopened</label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="rv_details">Explain in Detail: (REQUIRED)</label>
          <textarea
            id="rv_details"
            placeholder="Explain in detail..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        <div className="grid grid-3">
          <div className="form-group">
            <label>Does pt have a current balance?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="rv_balance"
                  id="rv_bal_yes"
                  value="yes"
                  checked={balance === 'yes'}
                  onChange={(e) => setBalance(e.target.value)}
                />
                <label htmlFor="rv_bal_yes">Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="rv_balance"
                  id="rv_bal_no"
                  value="no"
                  checked={balance === 'no'}
                  onChange={(e) => setBalance(e.target.value)}
                />
                <label htmlFor="rv_bal_no">No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Does pt wish to opt-in to texts?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="rv_texts"
                  id="rv_texts_yes"
                  value="yes"
                  checked={texts === 'yes'}
                  onChange={(e) => setTexts(e.target.value)}
                />
                <label htmlFor="rv_texts_yes">Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="rv_texts"
                  id="rv_texts_no"
                  value="no"
                  checked={texts === 'no'}
                  onChange={(e) => setTexts(e.target.value)}
                />
                <label htmlFor="rv_texts_no">No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Was the pt offered survey at the end of the call?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="rv_survey"
                  id="rv_survey_yes"
                  value="yes"
                  checked={survey === 'yes'}
                  onChange={(e) => setSurvey(e.target.value)}
                />
                <label htmlFor="rv_survey_yes">Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="rv_survey"
                  id="rv_survey_no"
                  value="no"
                  checked={survey === 'no'}
                  onChange={(e) => setSurvey(e.target.value)}
                />
                <label htmlFor="rv_survey_no">No</label>
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
