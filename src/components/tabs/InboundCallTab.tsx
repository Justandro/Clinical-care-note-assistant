import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const InboundCallTab: React.FC<Props> = ({ showToast }) => {
  const [returningCall, setReturningCall] = usePersistentState<boolean>('ic_returningCall', false);
  const [callRegarding, setCallRegarding] = usePersistentState<string>('ic_callRegarding', '');
  const [comments, setComments] = usePersistentState<string>('ic_comments', '');

  const generateTitle = (): string => 'CC-Compliance Inbound Call';

  const generateBody = (): string => {
    return `Is PT returning a call? ${returningCall ? 'Y' : 'N'}
What is this call regarding?
${callRegarding.trim()}

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
    setReturningCall(false);
    setCallRegarding('');
    setComments('');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="inbound-call" className="tab-content active">
      <div className="form-section">
        <h3>CC-Compliance Inbound Call</h3>

        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="ic_returning_call"
              checked={returningCall}
              onChange={(e) => setReturningCall(e.target.checked)}
            />
            <label htmlFor="ic_returning_call">Is PT returning a call?</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="ic_call_regarding">What is this call regarding?</label>
          <textarea
            id="ic_call_regarding"
            placeholder="Describe what this call is about..."
            value={callRegarding}
            onChange={(e) => setCallRegarding(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ic_comments">Comments:</label>
          <textarea
            id="ic_comments"
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
