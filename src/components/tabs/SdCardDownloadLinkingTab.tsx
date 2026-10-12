import React, { useState, useMemo } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { CopyFallbackModal } from '../CopyFallbackModal';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { InfoAlert, InstructionAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SdCardDownloadLinkingTab: React.FC<Props> = ({ showToast }) => {
  // Section inclusion toggles
  const [includeHeaderNotice, setIncludeHeaderNotice] = usePersistentState<boolean>('sd_includeHeaderNotice', false);
  const [includeSdCard, setIncludeSdCard] = usePersistentState<boolean>('sd_includeSdCard', true);
  const [includeDownload, setIncludeDownload] = usePersistentState<boolean>('sd_includeDownload', true);
  const [includeLink, setIncludeLink] = usePersistentState<boolean>('sd_includeLink', true);

  // Copy fallback modal state
  const [copyModalState, setCopyModalState] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
  }>({
    isOpen: false,
    title: '',
    text: '',
  });

  // Section 1: SD Card Request
  const [sdMachineMake, setSdMachineMake] = usePersistentState<string>('sd_sdMachineMake', '');
  const [reactQrScan, setReactQrScan] = usePersistentState<string>('sd_reactQrScan', 'N/A');
  const [ptRequestingSd, setPtRequestingSd] = usePersistentState<string>('sd_ptRequestingSd', 'YES');
  const [prepaidEnvelope, setPrepaidEnvelope] = usePersistentState<string>('sd_prepaidEnvelope', 'NO');
  const [sdReason, setSdReason] = usePersistentState<string>('sd_sdReason', '');
  const [patientAddress, setPatientAddress] = usePersistentState<string>('sd_patientAddress', '');

  // Section 2: Physician Office Requesting Compliance Download
  const [reportDays, setReportDays] = usePersistentState<string>('sd_reportDays', '');
  const [physicianName, setPhysicianName] = usePersistentState<string>('sd_physicianName', '');
  const [faxNumber, setFaxNumber] = usePersistentState<string>('sd_faxNumber', '');
  const [phoneNumber, setPhoneNumber] = usePersistentState<string>('sd_phoneNumber', '');
  const [attnTo, setAttnTo] = usePersistentState<string>('sd_attnTo', '');
  const [isLinked, setIsLinked] = usePersistentState<string>('sd_isLinked', 'N');
  const [downloadMachineMake, setDownloadMachineMake] = usePersistentState<string>('sd_downloadMachineMake', '');

  // Section 3: Please Link
  const [mdName, setMdName] = usePersistentState<string>('sd_mdName', '');
  const [softwareSerial, setSoftwareSerial] = usePersistentState<string>('sd_softwareSerial', '');

  // Click-to-green-fade animation tracker
  const [flashedItem, setFlashedItem] = useState<string | null>(null);

  const triggerPressFade = (id: string, callback?: () => void) => {
    setFlashedItem(id);
    if (callback) callback();
    setTimeout(() => {
      setFlashedItem((curr) => (curr === id ? null : curr));
    }, 850);
  };

  // Determine current active mode
  const activePreset = useMemo<'all' | 'sd-only' | 'download-only' | 'link-only' | 'custom'>(() => {
    if (includeSdCard && includeDownload && includeLink) return 'all';
    if (includeSdCard && !includeDownload && !includeLink) return 'sd-only';
    if (!includeSdCard && includeDownload && !includeLink) return 'download-only';
    if (!includeSdCard && !includeDownload && includeLink) return 'link-only';
    return 'custom';
  }, [includeSdCard, includeDownload, includeLink]);

  const generateTitle = (): string => {
    const selected: string[] = [];
    if (includeSdCard) selected.push('SD Card');
    if (includeDownload) selected.push('Download');
    if (includeLink) selected.push('Linking');

    if (selected.length === 0) {
      return 'CC-Requesting SD Card / Download / Linking';
    }

    return `CC-Requesting ${selected.join(' / ')}`;
  };

  const generateBody = (): string => {
    const parts: string[] = [];

    if (includeHeaderNotice) {
      parts.push('**Delete template that does not apply.** PLEASE CLOSE NOTE AFTER FINISHING THE TASK**');
    }

    if (includeSdCard) {
      const makeText = sdMachineMake || 'RESMED/REACT/RESPIRONICS/ *(can no longer support Intellipap)*:';
      const lines = [
        '**REMINDER: SD Cards are sent via USPS Priority Mail (estimated delivery is 7-10 business days)',
        '',
        `Machine Make (choose): ${makeText}`,
        `If React, did you have the patient attempt QR scan: ${reactQrScan}`,
        `PT REQUESTING SD CARD: ${ptRequestingSd}`,
        `Include prepaid envelope: ${prepaidEnvelope}`,
        `Reason patient is requesting SD card: ${sdReason.trim()}`,
        `Patient’s address: ${patientAddress.trim()}`,
      ];
      parts.push(lines.join('\n'));
    }

    if (includeDownload) {
      const makeText = downloadMachineMake || 'RESMED/REACT/RESPIRONICS/INTELLIPAP(need code)';
      const lines = [
        'PHYSICIANS OFFICE REQUESTING COMPLIANCE DOWNLOAD',
        `How many days on the report: ${reportDays.trim()}`,
        `Physician: ${physicianName.trim()}`,
        `Fax Number: ${faxNumber.trim()}`,
        `Phone Number: ${phoneNumber.trim()}`,
        `Attn to: ${attnTo.trim()}`,
        `Is Physician/Facility Linked?: ${isLinked}`,
        `Machine Make (choose): ${makeText}`,
      ];
      parts.push(lines.join('\n'));
    }

    if (includeLink) {
      const linkHeader = mdName.trim() ? `PLEASE LINK (${mdName.trim()}):` : 'PLEASE LINK (MD name):';
      const lines = [
        linkHeader,
        `Compliance Software/serial number: ${softwareSerial.trim()}`,
      ];
      parts.push(lines.join('\n'));
    }

    return parts.join('\n\n').trim();
  };

  const handleCopyTitle = async () => {
    const titleText = generateTitle();
    triggerPressFade('btn-copy-title', async () => {
      const ok = await copyText(titleText);
      if (ok) {
        showToast('Title copied to clipboard!', 'success');
      } else {
        // Fallback popup modal so user can copy with 1 click or Ctrl+C
        setCopyModalState({
          isOpen: true,
          title: 'Copy Title',
          text: titleText,
        });
      }
    });
  };

  const handleCopyBody = async () => {
    const bodyText = generateBody();
    triggerPressFade('btn-copy-body', async () => {
      const ok = await copyText(bodyText);
      if (ok) {
        showToast('Body copied to clipboard!', 'success');
      } else {
        // Fallback popup modal so user can copy with 1 click or Ctrl+C
        setCopyModalState({
          isOpen: true,
          title: 'Copy Body',
          text: bodyText,
        });
      }
    });
  };

  const handleClear = () => {
    triggerPressFade('btn-clear', () => {
      setIncludeHeaderNotice(false);
      setIncludeSdCard(true);
      setIncludeDownload(true);
      setIncludeLink(true);
      setSdMachineMake('');
      setReactQrScan('N/A');
      setPtRequestingSd('YES');
      setPrepaidEnvelope('NO');
      setSdReason('');
      setPatientAddress('');
      setReportDays('');
      setPhysicianName('');
      setFaxNumber('');
      setPhoneNumber('');
      setAttnTo('');
      setIsLinked('N');
      setDownloadMachineMake('');
      setMdName('');
      setSoftwareSerial('');
      showToast('Form cleared!', 'info');
    });
  };

  // Quick preset toggles
  const applyPreset = (preset: 'all' | 'sd-only' | 'download-only' | 'link-only') => {
    triggerPressFade(`preset-${preset}`, () => {
      if (preset === 'all') {
        setIncludeSdCard(true);
        setIncludeDownload(true);
        setIncludeLink(true);
        showToast('Active: All 3 Template Sections', 'info');
      } else if (preset === 'sd-only') {
        setIncludeSdCard(true);
        setIncludeDownload(false);
        setIncludeLink(false);
        showToast('Active: SD Card Request Only', 'info');
      } else if (preset === 'download-only') {
        setIncludeSdCard(false);
        setIncludeDownload(true);
        setIncludeLink(false);
        showToast('Active: Compliance Download Only', 'info');
      } else if (preset === 'link-only') {
        setIncludeSdCard(false);
        setIncludeDownload(false);
        setIncludeLink(true);
        showToast('Active: Please Link MD Only', 'info');
      }
    });
  };

  return (
    <div id="sd-card-download-linking" className="tab-content active">
      <div className="mb-4 p-4 rounded-lg border border-neutral-700">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="m-0">{generateTitle()}</h3>
          <span className="text-xs px-2.5 py-1 rounded bg-[#262626] border border-[#333333] text-neutral-400">
            Active Mode: <strong className="text-white uppercase">{activePreset}</strong>
          </span>
        </div>

        {/* Section Inclusion Toggle Bar */}
        <div className="mb-4 p-4 rounded-lg border border-neutral-700">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-2 border-b border-black/20">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
              Template Section Toggle Mode:
            </span>

            {/* Toggle Buttons with Active Indicator & Green Fade Effect */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                className={`text-xs py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activePreset === 'all'
                    ? 'bg-neutral-800 text-white border-white shadow-sm shadow-blue-500/30 ring-1 ring-white'
                    : 'bg-[#1C1C1C] text-neutral-300 border-neutral-700 hover:bg-[#1E232C]'
                } ${flashedItem === 'preset-all' ? 'flash-green-fade' : ''} flash-text-active`}
                 onClick={() => applyPreset('all')}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activePreset === 'all' ? 'bg-white animate-pulse' : 'bg-gray-500'
                  }`}
                />
                All Sections
                {activePreset === 'all' && (
                  <span className="text-xs uppercase font-bold text-white ml-0.5">ON</span>
                )}
              </button>

              <button
                type="button"
                className={`text-xs py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activePreset === 'sd-only'
                    ? 'bg-neutral-800 text-white border-white shadow-sm shadow-blue-500/30 ring-1 ring-white'
                    : 'bg-[#1C1C1C] text-neutral-300 border-neutral-700 hover:bg-[#1E232C]'
                } ${flashedItem === 'preset-sd-only' ? 'flash-green-fade' : ''} flash-text-active`}
                 onClick={() => applyPreset('sd-only')}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activePreset === 'sd-only' ? 'bg-white animate-pulse' : 'bg-gray-500'
                  }`}
                />
                SD Card Only
                {activePreset === 'sd-only' && (
                  <span className="text-xs uppercase font-bold text-white ml-0.5">ON</span>
                )}
              </button>

              <button
                type="button"
                className={`text-xs py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activePreset === 'download-only'
                    ? 'bg-neutral-800 text-white border-white shadow-sm shadow-blue-500/30 ring-1 ring-white'
                    : 'bg-[#1C1C1C] text-neutral-300 border-neutral-700 hover:bg-[#1E232C]'
                } ${flashedItem === 'preset-download-only' ? 'flash-green-fade' : ''} flash-text-active`}
                 onClick={() => applyPreset('download-only')}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activePreset === 'download-only' ? 'bg-white animate-pulse' : 'bg-gray-500'
                  }`}
                />
                Download Only
                {activePreset === 'download-only' && (
                  <span className="text-xs uppercase font-bold text-white ml-0.5">ON</span>
                )}
              </button>

              <button
                type="button"
                className={`text-xs py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activePreset === 'link-only'
                    ? 'bg-neutral-800 text-white border-white shadow-sm shadow-blue-500/30 ring-1 ring-white'
                    : 'bg-[#1C1C1C] text-neutral-300 border-neutral-700 hover:bg-[#1E232C]'
                } ${flashedItem === 'preset-link-only' ? 'flash-green-fade' : ''} flash-text-active`}
                 onClick={() => applyPreset('link-only')}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activePreset === 'link-only' ? 'bg-white animate-pulse' : 'bg-gray-500'
                  }`}
                />
                Link MD Only
                {activePreset === 'link-only' && (
                  <span className="text-xs uppercase font-bold text-white ml-0.5">ON</span>
                )}
              </button>
            </div>
          </div>

          {/* Individual Section Switch Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {/* SD Toggle */}
            <div
              className={`p-2 rounded-md border flex items-center justify-between transition-all cursor-pointer select-none ${
                includeSdCard
                  ? 'bg-purple-900/40 border-purple-500'
                  : 'bg-[#1C1C1C] border-[#333333] opacity-60'
              }`}
               
              onClick={() => triggerPressFade('toggle-sec-1', () => setIncludeSdCard((prev) => !prev))
              }
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeSdCard}
                  onChange={(e) => setIncludeSdCard(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer"
                />
                <span
                  className={`text-xs font-semibold ${
                    flashedItem === 'toggle-sec-1' ? 'flash-green-fade' : ''
                  } ${includeSdCard ? 'text-white' : 'text-neutral-500'}`}
                >
                  1. SD Card Request
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  includeSdCard ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {includeSdCard ? 'ACTIVE' : 'OFF'}
              </span>
            </div>

            {/* Download Toggle */}
            <div
              className={`p-2 rounded-md border flex items-center justify-between transition-all cursor-pointer select-none ${
                includeDownload
                  ? 'bg-blue-900/40 border-blue-500'
                  : 'bg-[#1C1C1C] border-[#333333] opacity-60'
              }`}
               
              onClick={() => triggerPressFade('toggle-sec-2', () => setIncludeDownload((prev) => !prev))
              }
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeDownload}
                  onChange={(e) => setIncludeDownload(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer"
                />
                <span
                  className={`text-xs font-semibold ${
                    flashedItem === 'toggle-sec-2' ? 'flash-green-fade' : ''
                  } ${includeDownload ? 'text-white' : 'text-neutral-500'}`}
                >
                  2. Compliance Download
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  includeDownload ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {includeDownload ? 'ACTIVE' : 'OFF'}
              </span>
            </div>

            {/* Link Toggle */}
            <div
              className={`p-2 rounded-md border flex items-center justify-between transition-all cursor-pointer select-none ${
                includeLink
                  ? 'bg-emerald-900/40 border-emerald-500'
                  : 'bg-[#1C1C1C] border-[#333333] opacity-60'
              }`}
               
              onClick={() => triggerPressFade('toggle-sec-3', () => setIncludeLink((prev) => !prev))
              }
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeLink}
                  onChange={(e) => setIncludeLink(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer"
                />
                <span
                  className={`text-xs font-semibold ${
                    flashedItem === 'toggle-sec-3' ? 'flash-green-fade' : ''
                  } ${includeLink ? 'text-white' : 'text-neutral-500'}`}
                >
                  3. Please Link MD
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  includeLink ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {includeLink ? 'ACTIVE' : 'OFF'}
              </span>
            </div>

            {/* Header Notice Toggle */}
            <div
              className={`p-2 rounded-md border flex items-center justify-between transition-all cursor-pointer select-none ${
                includeHeaderNotice
                  ? 'bg-neutral-800 border-neutral-500'
                  : 'bg-[#1C1C1C] border-[#333333] opacity-60'
              }`}
               
              onClick={() => triggerPressFade('toggle-header-notice', () => setIncludeHeaderNotice((prev) => !prev))
              }
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeHeaderNotice}
                  onChange={(e) => setIncludeHeaderNotice(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer"
                />
                <div>
                  <span
                    className={`text-xs font-semibold block ${
                      flashedItem === 'toggle-header-notice' ? 'flash-green-fade' : ''
                    } ${includeHeaderNotice ? 'text-white' : 'text-neutral-500'}`}
                  >
                    Header Instruction Banner
                  </span>
                  <span className="text-xs text-neutral-400 block leading-tight">
                    "**Delete template that does not apply...**"
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  includeHeaderNotice
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {includeHeaderNotice ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Notice Explanation Banner (Visible when enabled) */}
        {includeHeaderNotice && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/50 bg-red-900/10 text-xs text-neutral-300 flex items-start justify-between gap-3">
            <div>
              <div className="font-bold flex items-center gap-1.5 text-red-500 mb-0.5">
                <span>ℹ️</span> Header Notice Included in Note:
              </div>
              <code className="bg-[#1C1C1C]/40 px-2 py-0.5 rounded text-red-400 font-mono block mt-1">
                **Delete template that does not apply.** PLEASE CLOSE NOTE AFTER FINISHING THE TASK**
              </code>
              <p className="text-xs text-neutral-400 mt-1 m-0">
                This is the standard clinical instruction reminding staff to delete inapplicable sections and close the note. Since you can now toggle individual sections directly above, you can turn this notice <strong>OFF</strong> if you don't need it in your final note.
              </p>
            </div>
            <button
              type="button"
              className="text-xs bg-[#1C1C1C] hover:bg-[#1E232C] text-neutral-300 px-2 py-1 rounded border border-neutral-700 shrink-0 font-semibold cursor-pointer"
              onClick={() => setIncludeHeaderNotice(false)}
            >
              Turn OFF
            </button>
          </div>
        )}

        {/* SECTION 1: SD CARD REQUEST */}
        {includeSdCard ? (
          <div className="mb-4 p-4 rounded-lg border-2 border-purple-500 bg-purple-900/10">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/20">
              <h3>
                
                Section 1: SD Card Request
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-white/15 text-white font-bold">
                ✓ Included in Note
              </span>
            </div>

            <InstructionAlert className="mb-4 text-xs">
              <p><strong>**REMINDER: SD Cards are sent via USPS Priority Mail (estimated delivery is 7-10 business days)</strong></p>
            </InstructionAlert>

            {/* Machine Make */}
            <div className="form-group">
              <label>Machine Make (choose):</label>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {['RESMED', 'REACT', 'RESPIRONICS'].map((make) => (
                  <button
                    key={make}
                    type="button"
                    className={`btn text-xs py-1 px-3 cursor-pointer ${
                      sdMachineMake === make ? 'btn-primary font-bold' : 'btn-secondary'
                    } ${flashedItem === `sd-make-${make}` ? 'flash-green-fade' : ''} flash-text-active`}
                    onClick={() => triggerPressFade(`sd-make-${make}`, () => setSdMachineMake(make))}
                  >
                    {make}
                  </button>
                ))}
              </div>

              {/* Custom Note Input + Keep Full Template Text Button on far right */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  id="sd-custom-make-input"
                  className="flex-1 min-w-0"
                  placeholder="Or custom make / notes (can no longer support Intellipap)"
                  value={sdMachineMake}
                  onChange={(e) => setSdMachineMake(e.target.value)}
                />
                <button
                  type="button"
                  id="sd-btn-keep-full"
                  className={`text-[11px] py-1.5 px-2.5 rounded border whitespace-nowrap cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${
                    !sdMachineMake
                      ? 'bg-[#2b3543] text-white border-[#5a677a] font-semibold shadow-sm ring-1 ring-white/15'
                      : 'bg-[#181d24] text-neutral-400 border-neutral-800 hover:bg-[#222933] hover:text-neutral-200'
                  } ${flashedItem === 'sd-make-full' ? 'flash-green-fade' : ''} flash-text-active`}
                  onClick={() => triggerPressFade('sd-make-full', () => setSdMachineMake(''))}
                  title="Keep original multi-option template string"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${!sdMachineMake ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
                  Keep Full Template Text
                </button>
              </div>
            </div>

            {/* If React QR Scan */}
            <div className="form-group">
              <label>If React, did you have the patient attempt QR scan:</label>
              <div className="radio-group">
                {['YES', 'NO', 'N/A'].map((val) => (
                  <div
                    className="radio-item cursor-pointer"
                    key={val}
                     
                    onClick={() => triggerPressFade(`sd-qr-${val}`, () => setReactQrScan(val))
                    }
                  >
                    <input
                      type="radio"
                      name="sd_qr_scan"
                      id={`sd_qr_${val}`}
                      value={val}
                      checked={reactQrScan === val}
                      onChange={(e) => setReactQrScan(e.target.value)}
                    />
                    <label
                      htmlFor={`sd_qr_${val}`}
                      className={`${
                        flashedItem === `sd-qr-${val}` ? 'flash-green-fade' : ''
                      } flash-text-active`}
                    >
                      {val}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* PT Requesting SD Card & Prepaid Envelope */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>PT REQUESTING SD CARD:</label>
                <div className="radio-group">
                  {['YES', 'NO'].map((val) => (
                    <div
                      className="radio-item cursor-pointer"
                      key={val}
                       
                      onClick={() => triggerPressFade(`sd-pt-${val}`, () => setPtRequestingSd(val))
                      }
                    >
                      <input
                        type="radio"
                        name="sd_pt_req"
                        id={`sd_pt_${val}`}
                        value={val}
                        checked={ptRequestingSd === val}
                        onChange={(e) => setPtRequestingSd(e.target.value)}
                      />
                      <label
                        htmlFor={`sd_pt_${val}`}
                        className={`${
                          flashedItem === `sd-pt-${val}` ? 'flash-green-fade' : ''
                        } flash-text-active`}
                      >
                        {val}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Include prepaid envelope:</label>
                <div className="radio-group">
                  {['YES', 'NO'].map((val) => (
                    <div
                      className="radio-item cursor-pointer"
                      key={val}
                       
                      onClick={() => triggerPressFade(`sd-pre-${val}`, () => setPrepaidEnvelope(val))
                      }
                    >
                      <input
                        type="radio"
                        name="sd_prepaid"
                        id={`sd_pre_${val}`}
                        value={val}
                        checked={prepaidEnvelope === val}
                        onChange={(e) => setPrepaidEnvelope(e.target.value)}
                      />
                      <label
                        htmlFor={`sd_pre_${val}`}
                        className={`${
                          flashedItem === `sd-pre-${val}` ? 'flash-green-fade' : ''
                        } flash-text-active`}
                      >
                        {val}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason & Address */}
            <div className="form-group">
              <label htmlFor="sd_reason">Reason patient is requesting SD card:</label>
              <input
                type="text"
                id="sd_reason"
                placeholder="e.g. Needs download for DOT / DMV, physician request, machine not transmitting..."
                value={sdReason}
                onChange={(e) => setSdReason(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sd_address">Patient’s address:</label>
              <input
                type="text"
                id="sd_address"
                placeholder="Street address, City, State, ZIP..."
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-lg border-2 border-dashed border-purple-500/50 bg-purple-900/5 flex items-center justify-between text-xs text-neutral-500">
            <span>Section 1: SD Card Request (Excluded from note)</span>
            <button
              type="button"
              className="text-white hover:underline font-semibold cursor-pointer"
              onClick={() => setIncludeSdCard(true)}
            >
              + Enable Section 1
            </button>
          </div>
        )}

        {/* SECTION 2: PHYSICIANS OFFICE REQUESTING COMPLIANCE DOWNLOAD */}
        {includeDownload ? (
          <div className="mb-4 p-4 rounded-lg border-2 border-blue-500 bg-blue-900/10">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/20">
              <h3>
                
                Section 2: Physicians Office Requesting Compliance Download
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-white/15 text-white font-bold">
                ✓ Included in Note
              </span>
            </div>

            {/* How many days */}
            <div className="form-group">
              <label htmlFor="dl_days">How many days on the report:</label>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {['30', '60', '90', '180', '365'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn text-xs py-1 px-2.5 cursor-pointer ${
                      reportDays === `${d} days` || reportDays === d
                        ? 'btn-primary font-bold'
                        : 'btn-secondary'
                    } ${flashedItem === `dl-days-${d}` ? 'flash-green-fade' : ''} flash-text-active`}
                     
                    onClick={() => triggerPressFade(`dl-days-${d}`, () => setReportDays(`${d} days`))
                    }
                  >
                    {d} Days
                  </button>
                ))}
              </div>
              <input
                type="text"
                id="dl_days"
                placeholder="e.g. 30 days, 90 days, 1 year..."
                value={reportDays}
                onChange={(e) => setReportDays(e.target.value)}
              />
            </div>

            {/* Physician & Attn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="dl_physician">Physician:</label>
                <input
                  type="text"
                  id="dl_physician"
                  placeholder="e.g. Dr. Jane Smith"
                  value={physicianName}
                  onChange={(e) => setPhysicianName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dl_attn">Attn to:</label>
                <input
                  type="text"
                  id="dl_attn"
                  placeholder="e.g. Medical Records, Sleep Lab, Nurse..."
                  value={attnTo}
                  onChange={(e) => setAttnTo(e.target.value)}
                />
              </div>
            </div>

            {/* Fax & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="dl_fax">Fax Number:</label>
                <input
                  type="text"
                  id="dl_fax"
                  placeholder="e.g. (555) 987-6543"
                  value={faxNumber}
                  onChange={(e) => setFaxNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dl_phone">Phone Number:</label>
                <input
                  type="text"
                  id="dl_phone"
                  placeholder="e.g. (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Linked & Machine Make */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Is Physician/Facility Linked?:</label>
                <div className="radio-group">
                  {['Y', 'N', 'N/A'].map((val) => (
                    <div
                      className="radio-item cursor-pointer"
                      key={val}
                       
                      onClick={() => triggerPressFade(`dl-linked-${val}`, () => setIsLinked(val))
                      }
                    >
                      <input
                        type="radio"
                        name="dl_linked"
                        id={`dl_linked_${val}`}
                        value={val}
                        checked={isLinked === val}
                        onChange={(e) => setIsLinked(e.target.value)}
                      />
                      <label
                        htmlFor={`dl_linked_${val}`}
                        className={`${
                          flashedItem === `dl-linked-${val}` ? 'flash-green-fade' : ''
                        } flash-text-active`}
                      >
                        {val}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Machine Make (choose):</label>
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  {['RESMED', 'REACT', 'RESPIRONICS', 'INTELLIPAP(need code)'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`btn text-xs py-1 px-2.5 cursor-pointer ${
                        downloadMachineMake === m ? 'btn-primary font-bold' : 'btn-secondary'
                      } ${flashedItem === `dl-make-${m}` ? 'flash-green-fade' : ''} flash-text-active`}
                      onClick={() => triggerPressFade(`dl-make-${m}`, () => setDownloadMachineMake(m))}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Custom Note Input + Keep Full Template Text Button on far right */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    id="dl-custom-make-input"
                    className="flex-1 min-w-0"
                    placeholder="RESMED/REACT/RESPIRONICS/INTELLIPAP(need code) or custom..."
                    value={downloadMachineMake}
                    onChange={(e) => setDownloadMachineMake(e.target.value)}
                  />
                  <button
                    type="button"
                    id="dl-btn-keep-full"
                    className={`text-[11px] py-1.5 px-2.5 rounded border whitespace-nowrap cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${
                      !downloadMachineMake
                        ? 'bg-[#2b3543] text-white border-[#5a677a] font-semibold shadow-sm ring-1 ring-white/15'
                        : 'bg-[#181d24] text-neutral-400 border-neutral-800 hover:bg-[#222933] hover:text-neutral-200'
                    } ${flashedItem === 'dl-make-full' ? 'flash-green-fade' : ''} flash-text-active`}
                    onClick={() => triggerPressFade('dl-make-full', () => setDownloadMachineMake(''))}
                    title="Keep original multi-option template string"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${!downloadMachineMake ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
                    Keep Full Template Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-lg border-2 border-dashed border-blue-500/50 bg-blue-900/5 flex items-center justify-between text-xs text-neutral-500">
            <span>Section 2: Physicians Office Requesting Compliance Download (Excluded from note)</span>
            <button
              type="button"
              className="text-white hover:underline font-semibold cursor-pointer"
              onClick={() => setIncludeDownload(true)}
            >
              + Enable Section 2
            </button>
          </div>
        )}

        {/* SECTION 3: PLEASE LINK */}
        {includeLink ? (
          <div className="mb-4 p-4 rounded-lg border-2 border-emerald-500 bg-emerald-900/10">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/20">
              <h3>
                
                Section 3: Please Link MD
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-white/15 text-white font-bold">
                ✓ Included in Note
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="link_md">PLEASE LINK (MD name):</label>
              <input
                type="text"
                id="link_md"
                placeholder="e.g. Dr. John Doe, MD / Clinic Name"
                value={mdName}
                onChange={(e) => setMdName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="link_serial">Compliance Software/serial number:</label>
              <input
                type="text"
                id="link_serial"
                placeholder="e.g. AirView / Care Orchestrator / SN# 23214567890"
                value={softwareSerial}
                onChange={(e) => setSoftwareSerial(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-lg border-2 border-dashed border-emerald-500/50 bg-emerald-900/5 flex items-center justify-between text-xs text-neutral-500">
            <span>Section 3: Please Link MD (Excluded from note)</span>
            <button
              type="button"
              className="text-white hover:underline font-semibold cursor-pointer"
              onClick={() => setIncludeLink(true)}
            >
              + Enable Section 3
            </button>
          </div>
        )}
      </div>

      <div className="btn-group flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="sd_copy_title_btn"
            className={`btn btn-primary cursor-pointer ${
              flashedItem === 'btn-copy-title' ? 'flash-green-fade' : ''
            } flash-text-active`}
            onClick={handleCopyTitle}
          >
            Copy Title
          </button>
          <button
            type="button"
            id="sd_copy_body_btn"
            className={`btn btn-primary cursor-pointer ${
              flashedItem === 'btn-copy-body' ? 'flash-green-fade' : ''
            } flash-text-active`}
            onClick={handleCopyBody}
          >
            Copy Body
          </button>
          <button
            type="button"
            id="sd_clear_btn"
            className={`btn btn-danger cursor-pointer ${
              flashedItem === 'btn-clear' ? 'flash-green-fade' : ''
            } flash-text-active`}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
        <div className="text-xs text-neutral-400 bg-[#1C1C1C] px-3 py-1.5 rounded border border-neutral-700">
          Subject: <strong className="text-white font-mono">{generateTitle()}</strong>
        </div>
      </div>

      {/* Generated Note Preview with in-place editing, resizing, and popout */}
      <GeneratedNotePreview generatedText={generateBody()} showToast={showToast} title={generateTitle()} />

      {/* Copy Modal Fallback */}
      <CopyFallbackModal
        isOpen={copyModalState.isOpen}
        onClose={() => setCopyModalState((prev) => ({ ...prev, isOpen: false }))}
        title={copyModalState.title}
        text={copyModalState.text}
        showToast={showToast}
      />
    </div>
  );
};
