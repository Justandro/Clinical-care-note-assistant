import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

type ContactMode = 'Address' | 'Phone' | 'Both';

export const NewContactTab: React.FC<Props> = ({ showToast }) => {
  const [mode, setMode] = usePersistentState<ContactMode>('nc_mode', 'Address');
  const [titleType, setTitleType] = usePersistentState<string>('nc_titleType', 'Address');
  const [personalTab, setPersonalTab] = usePersistentState<string>('nc_personalTab', 'N');
  const [infoType, setInfoType] = usePersistentState<string>('nc_infoType', 'Address');
  const [mobileText, setMobileText] = usePersistentState<string>('nc_mobileText', 'N/A');
  const [addrSame, setAddrSame] = usePersistentState<string>('nc_addrSame', 'Yes');
  const [pendingOrder, setPendingOrder] = usePersistentState<string>('nc_pendingOrder', 'N');
  const [urgent, setUrgent] = usePersistentState<string>('nc_urgent', 'N/A');
  const [snap, setSnap] = usePersistentState<string>('nc_snap', 'N');
  const [newInfo, setNewInfo] = usePersistentState<string>('nc_newInfo', '');

  const handleModeChange = (newMode: ContactMode) => {
    setMode(newMode);
    if (newMode === 'Address') {
      setTitleType('Address');
      setInfoType('Address');
      setMobileText('N/A');
      setAddrSame((prev) => (prev === 'N/A' ? 'Yes' : prev));
      setPendingOrder((prev) => (prev === 'N/A' ? 'N' : prev));
      setSnap((prev) => (prev === 'N/A' ? 'N' : prev));
      showToast('Switched to Address Only mode', 'info');
    } else if (newMode === 'Phone') {
      setTitleType('Phone');
      setInfoType('Phone');
      setMobileText((prev) => (prev === 'N/A' ? 'N' : prev));
      setAddrSame('N/A');
      setPendingOrder('N/A');
      setUrgent('N/A');
      setSnap('N/A');
      showToast('Switched to Phone Only mode', 'info');
    } else if (newMode === 'Both') {
      setTitleType('Phone/Address');
      setInfoType('Phone/Address');
      setMobileText((prev) => (prev === 'N/A' ? 'N' : prev));
      setAddrSame((prev) => (prev === 'N/A' ? 'Yes' : prev));
      setPendingOrder((prev) => (prev === 'N/A' ? 'N' : prev));
      setSnap((prev) => (prev === 'N/A' ? 'N' : prev));
      showToast('Switched to Phone & Address mode', 'info');
    }
  };

  const generateTitle = (): string => `ADMIN-RCVD New Contact Info^${titleType}^`;

  const generateBody = (): string => {
    return `Did you update personal tab?: ${personalTab}

What contact information did you receive?: (select one): ${infoType}
If Mobile, did you update Text Placeholder Sales Order?: ${mobileText}
If Address, are billing and delivery address the same?: ${addrSame}
If Address, is there a pending order to the patient? ${pendingOrder}
If yes, email Urgent Orders.: ${urgent}
If Delivery Address, was SNAP delivery address updated? ${snap}
Copy new information here:
${newInfo.trim()}`.trim();
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
    setMode('Address');
    setTitleType('Address');
    setPersonalTab('N');
    setInfoType('Address');
    setMobileText('N/A');
    setAddrSame('Yes');
    setPendingOrder('N');
    setUrgent('N/A');
    setSnap('N');
    setNewInfo('');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="new-contact" className="tab-content active">
      <div className="form-section">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="mb-0">ADMIN-RCVD — Contact Info Mode</h3>
          <span className="text-xs text-neutral-400">
            Select a mode to auto-preset N/A fields, or configure manually
          </span>
        </div>

        <div className="form-group mb-4">
          <label className="font-semibold text-sm mb-2 block">Quick Mode Selection:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              id="nc_mode_addr"
              className={`btn ${mode === 'Address' ? 'btn-primary font-bold' : 'btn-secondary'}`}
              onClick={() => handleModeChange('Address')}
            >
              📍 Address Only
            </button>
            <button
              type="button"
              id="nc_mode_phone"
              className={`btn ${mode === 'Phone' ? 'btn-primary font-bold' : 'btn-secondary'}`}
              onClick={() => handleModeChange('Phone')}
            >
              📞 Phone Only
            </button>
            <button
              type="button"
              id="nc_mode_both"
              className={`btn ${mode === 'Both' ? 'btn-primary font-bold' : 'btn-secondary'}`}
              onClick={() => handleModeChange('Both')}
            >
              🔄 Both (Phone & Address)
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Title Header Type (^...^):</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_title_type"
                id="nc_title_address"
                value="Address"
                checked={titleType === 'Address'}
                onChange={(e) => setTitleType(e.target.value)}
              />
              <label htmlFor="nc_title_address">Address</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_title_type"
                id="nc_title_phone"
                value="Phone"
                checked={titleType === 'Phone'}
                onChange={(e) => setTitleType(e.target.value)}
              />
              <label htmlFor="nc_title_phone">Phone</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_title_type"
                id="nc_title_both"
                value="Phone/Address"
                checked={titleType === 'Phone/Address'}
                onChange={(e) => setTitleType(e.target.value)}
              />
              <label htmlFor="nc_title_both">Phone/Address (Both)</label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Note Fields</h3>

        <div className="form-group">
          <label>Did you update personal tab?:</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_personal_tab"
                id="nc_pt_y"
                value="Y"
                checked={personalTab === 'Y'}
                onChange={(e) => setPersonalTab(e.target.value)}
              />
              <label htmlFor="nc_pt_y">Y</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_personal_tab"
                id="nc_pt_n"
                value="N"
                checked={personalTab === 'N'}
                onChange={(e) => setPersonalTab(e.target.value)}
              />
              <label htmlFor="nc_pt_n">N</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>What contact information did you receive?: (select one):</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_info_type"
                id="nc_it_address"
                value="Address"
                checked={infoType === 'Address'}
                onChange={(e) => {
                  setInfoType(e.target.value);
                  if (mode === 'Phone') setMode('Both');
                }}
              />
              <label htmlFor="nc_it_address">Address</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_info_type"
                id="nc_it_phone"
                value="Phone"
                checked={infoType === 'Phone'}
                onChange={(e) => {
                  setInfoType(e.target.value);
                  if (mode === 'Address') setMode('Both');
                }}
              />
              <label htmlFor="nc_it_phone">Phone</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_info_type"
                id="nc_it_both"
                value="Phone/Address"
                checked={infoType === 'Phone/Address'}
                onChange={(e) => {
                  setInfoType(e.target.value);
                  setMode('Both');
                }}
              />
              <label htmlFor="nc_it_both">Phone/Address (Both)</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>
            If Mobile, did you update Text Placeholder Sales Order?:
            {mode === 'Address' && <span className="text-xs text-amber-400 ml-2">(N/A in Address mode)</span>}
          </label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_mobile_text"
                id="nc_mt_y"
                value="Y"
                checked={mobileText === 'Y'}
                onChange={(e) => setMobileText(e.target.value)}
              />
              <label htmlFor="nc_mt_y">Y</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_mobile_text"
                id="nc_mt_n"
                value="N"
                checked={mobileText === 'N'}
                onChange={(e) => setMobileText(e.target.value)}
              />
              <label htmlFor="nc_mt_n">N</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_mobile_text"
                id="nc_mt_na"
                value="N/A"
                checked={mobileText === 'N/A'}
                onChange={(e) => setMobileText(e.target.value)}
              />
              <label htmlFor="nc_mt_na">N/A</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>
            If Address, are billing and delivery address the same?:
            {mode === 'Phone' && <span className="text-xs text-amber-400 ml-2">(N/A in Phone mode)</span>}
          </label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_addr_same"
                id="nc_as_yes"
                value="Yes"
                checked={addrSame === 'Yes'}
                onChange={(e) => setAddrSame(e.target.value)}
              />
              <label htmlFor="nc_as_yes">Yes</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_addr_same"
                id="nc_as_bill"
                value="Billing"
                checked={addrSame === 'Billing'}
                onChange={(e) => setAddrSame(e.target.value)}
              />
              <label htmlFor="nc_as_bill">Billing</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_addr_same"
                id="nc_as_del"
                value="Delivery"
                checked={addrSame === 'Delivery'}
                onChange={(e) => setAddrSame(e.target.value)}
              />
              <label htmlFor="nc_as_del">Delivery</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_addr_same"
                id="nc_as_na"
                value="N/A"
                checked={addrSame === 'N/A'}
                onChange={(e) => setAddrSame(e.target.value)}
              />
              <label htmlFor="nc_as_na">N/A</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>
            If Address, is there a pending order to the patient?:
            {mode === 'Phone' && <span className="text-xs text-amber-400 ml-2">(N/A in Phone mode)</span>}
          </label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_pending_order"
                id="nc_po_y"
                value="Y"
                checked={pendingOrder === 'Y'}
                onChange={(e) => setPendingOrder(e.target.value)}
              />
              <label htmlFor="nc_po_y">Y</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_pending_order"
                id="nc_po_n"
                value="N"
                checked={pendingOrder === 'N'}
                onChange={(e) => setPendingOrder(e.target.value)}
              />
              <label htmlFor="nc_po_n">N</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_pending_order"
                id="nc_po_na"
                value="N/A"
                checked={pendingOrder === 'N/A'}
                onChange={(e) => setPendingOrder(e.target.value)}
              />
              <label htmlFor="nc_po_na">N/A</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>If yes, email Urgent Orders.:</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_urgent"
                id="nc_uo_yes"
                value="Yes"
                checked={urgent === 'Yes'}
                onChange={(e) => setUrgent(e.target.value)}
              />
              <label htmlFor="nc_uo_yes">Yes</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_urgent"
                id="nc_uo_no"
                value="No"
                checked={urgent === 'No'}
                onChange={(e) => setUrgent(e.target.value)}
              />
              <label htmlFor="nc_uo_no">No</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_urgent"
                id="nc_uo_na"
                value="N/A"
                checked={urgent === 'N/A'}
                onChange={(e) => setUrgent(e.target.value)}
              />
              <label htmlFor="nc_uo_na">N/A</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>
            If Delivery Address, was SNAP delivery address updated?:
            {mode === 'Phone' && <span className="text-xs text-amber-400 ml-2">(N/A in Phone mode)</span>}
          </label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="nc_snap"
                id="nc_sn_y"
                value="Y"
                checked={snap === 'Y'}
                onChange={(e) => setSnap(e.target.value)}
              />
              <label htmlFor="nc_sn_y">Y</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_snap"
                id="nc_sn_n"
                value="N"
                checked={snap === 'N'}
                onChange={(e) => setSnap(e.target.value)}
              />
              <label htmlFor="nc_sn_n">N</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="nc_snap"
                id="nc_sn_na"
                value="N/A"
                checked={snap === 'N/A'}
                onChange={(e) => setSnap(e.target.value)}
              />
              <label htmlFor="nc_sn_na">N/A</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="nc_new_info">Copy new information here:</label>
          <textarea
            id="nc_new_info"
            placeholder="Paste the new contact information here..."
            value={newInfo}
            onChange={(e) => setNewInfo(e.target.value)}
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
