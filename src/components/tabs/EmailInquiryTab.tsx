import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const EmailInquiryTab: React.FC<Props> = ({ showToast }) => {
  const [from, setFrom] = usePersistentState<string>('ei_from', '');
  const [details, setDetails] = usePersistentState<string>('ei_details', '');
  const [actionTaken, setActionTaken] = usePersistentState<string>('ei_actionTaken', '');

  const generateTitle = (): string => 'CC-Email Inquiry Received';

  const generateBody = (): string => {
    return `From: ${from.trim()}

Details:
${details.trim()}

Action Taken:
${actionTaken.trim()}`.trim();
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
    setFrom('');
    setDetails('');
    setActionTaken('');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="email-inquiry" className="tab-content active">
      <div className="form-section">
        <h3>CC-Email Inquiry Received</h3>

        <div className="form-group">
          <label htmlFor="ei_from">From:</label>
          <input
            type="text"
            id="ei_from"
            placeholder="e.g. John Doe, patient@example.com, or clinic name"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ei_details">Details:</label>
          <textarea
            id="ei_details"
            rows={4}
            placeholder="Paste or write the inquiry details..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ei_action">Action Taken:</label>
          <textarea
            id="ei_action"
            rows={3}
            placeholder="Describe the action taken or response provided..."
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
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
