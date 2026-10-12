import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const OutboundCallTab: React.FC<Props> = ({ showToast }) => {
  const [reasonForCall, setReasonForCall] = usePersistentState<string>('oc_reasonForCall', '');
  const [comments, setComments] = usePersistentState<string>('oc_comments', '');

  const generateTitle = (): string => 'Compliance Outbound Call';

  const generateBody = (): string => {
    return `Reason for call: ${reasonForCall.trim()}

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

  const handleClear = () => {
    setReasonForCall('');
    setComments('');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="outbound-call" className="tab-content active">
      <div className="form-section">
        <h3>Compliance Outbound Call</h3>

        <div className="form-group">
          <label htmlFor="oc_reason_for_call">Reason for call:</label>
          <textarea
            id="oc_reason_for_call"
            placeholder="Reason for making this call..."
            value={reasonForCall}
            onChange={(e) => setReasonForCall(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="oc_comments">Comments:</label>
          <textarea
            id="oc_comments"
            placeholder="Additional comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
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
