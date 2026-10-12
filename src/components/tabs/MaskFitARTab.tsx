import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { InstructionAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const MaskFitARTab: React.FC<Props> = ({ showToast }) => {
  const [comments, setComments] = usePersistentState<string>('mf_comments', '');
  const [isNA, setIsNA] = usePersistentState<boolean>('mf_isNA', false);
  const [maskResult, setMaskResult] = usePersistentState<string>('mf_maskResult', '');
  const [addressConfirmed, setAddressConfirmed] = usePersistentState<string>('mf_addressConfirmed', 'Y');

  const generateTitle = (): string => 'CC- MaskFit AR Link Sent';

  const generateBody = (): string => {
    const recResult = isNA ? 'N/A' : (maskResult.trim() || '');
    const commentsFormatted = comments.trim() ? `\n${comments.trim()}\n` : '\n';

    return `Patient has been sent the link for MaskFit AR to complete facial scan.

Comments:${commentsFormatted}
MaskFit AR Recommended Mask Result: ${recResult}
Has shipping address on file been confirmed: ${addressConfirmed}`.trim();
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
    setComments('');
    setIsNA(false);
    setMaskResult('');
    setAddressConfirmed('Y/N');
    showToast('Form cleared!', 'info');
  };

  const handleToggleNA = (checked: boolean) => {
    setIsNA(checked);
    if (checked) {
      setMaskResult('N/A');
    } else if (maskResult === 'N/A') {
      setMaskResult('');
    }
  };

  return (
    <div id="maskfit-ar" className="tab-content active">
      <div className="form-section">
        <h3>CC- MaskFit AR Link Sent</h3>
        <InstructionAlert className="mb-6">
          <p><strong>Patient has been sent the link for MaskFit AR to complete facial scan.</strong></p>
        </InstructionAlert>

        {/* Comments Field */}
        <div className="form-group">
          <label htmlFor="mf_comments">Comments:</label>
          <textarea
            id="mf_comments"
            placeholder="Additional comments regarding MaskFit AR..."
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* MaskFit AR Recommendation with N/A option or custom text */}
        <div className="form-group">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <label htmlFor="mf_mask_result" className="mb-0 font-medium">
              MaskFit AR Recommended Mask Result:
            </label>
            <div className="flex items-center gap-2">
              <label
                htmlFor="mf_na_toggle"
                className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold select-none px-2.5 py-1 rounded border border-gray-600 hover:border-green-500 transition-colors"
                style={{ backgroundColor: isNA ? 'rgba(76, 175, 80, 0.2)' : 'transparent' }}
              >
                <input
                  type="checkbox"
                  id="mf_na_toggle"
                  checked={isNA}
                  onChange={(e) => handleToggleNA(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className={isNA ? 'text-green-400 font-bold' : 'text-gray-300'}>
                  {isNA ? '✓ N/A Selected' : 'Choose N/A'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              id="mf_mask_result"
              placeholder={
                isNA
                  ? 'N/A selected (Uncheck N/A or click Custom to type)'
                  : 'Type any recommended mask, size, or notes...'
              }
              value={isNA ? 'N/A' : maskResult}
              disabled={isNA}
              onChange={(e) => {
                setMaskResult(e.target.value);
                if (isNA) setIsNA(false);
              }}
              className={`w-full ${isNA ? 'opacity-80 bg-gray-800 cursor-not-allowed' : ''}`}
            />
            {isNA && (
              <button
                type="button"
                className="btn btn-secondary px-3 whitespace-nowrap text-xs"
                onClick={() => {
                  setIsNA(false);
                  if (maskResult === 'N/A') setMaskResult('');
                }}
                title="Switch back to typing custom text"
              >
                Type Custom
              </button>
            )}
          </div>
        </div>

        {/* Shipping Address Confirmation */}
        <div className="form-group">
          <label>Has shipping address on file been confirmed:</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="mf_address_confirmed"
                id="mf_address_y"
                value="Y"
                checked={addressConfirmed === 'Y'}
                onChange={(e) => setAddressConfirmed(e.target.value)}
              />
              <label htmlFor="mf_address_y">Y (Yes)</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="mf_address_confirmed"
                id="mf_address_n"
                value="N"
                checked={addressConfirmed === 'N'}
                onChange={(e) => setAddressConfirmed(e.target.value)}
              />
              <label htmlFor="mf_address_n">N (No)</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="mf_address_confirmed"
                id="mf_address_na"
                value="N/A"
                checked={addressConfirmed === 'N/A'}
                onChange={(e) => setAddressConfirmed(e.target.value)}
              />
              <label htmlFor="mf_address_na">N/A</label>
            </div>
          </div>
        </div>
      </div>

      <div className="btn-group flex items-center flex-wrap gap-2">
        <button
          type="button"
          id="mf_copy_title_btn"
          className="btn btn-primary"
          onClick={handleCopyTitle}
        >
          Copy Title
        </button>
        <button
          type="button"
          id="mf_copy_body_btn"
          className="btn btn-primary"
          onClick={handleCopyBody}
        >
          Copy Body
        </button>
        <button
          type="button"
          id="mf_clear_btn"
          className="btn btn-danger"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      <GeneratedNotePreview generatedText={generateBody()} showToast={showToast} />
    </div>
  );
};
