import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TabId, ToastMessage, ToastType, TabConfig } from './types';
import { DEFAULT_TABS } from './data/tabs';
import { Header } from './components/Header';
import { EulaModal } from './components/EulaModal';
import { TabNav } from './components/TabNav';
import { NotepadModal } from './components/NotepadModal';
import { Toast } from './components/Toast';
import { FloatingCalculator } from './components/FloatingCalculator';

import { ComplianceCheckInTab } from './components/tabs/ComplianceCheckInTab';
import { ComplianceRiskTab } from './components/tabs/ComplianceRiskTab';
import { MaskExchangeTab } from './components/tabs/MaskExchangeTab';
import { SupplyRequestTab } from './components/tabs/SupplyRequestTab';
import { MaskFitARTab } from './components/tabs/MaskFitARTab';
import { InboundCallTab } from './components/tabs/InboundCallTab';
import { OutboundCallTab } from './components/tabs/OutboundCallTab';
import { EmailInquiryTab } from './components/tabs/EmailInquiryTab';
import { RemovalRequestTab } from './components/tabs/RemovalRequestTab';
import { ReturnLabelTab } from './components/tabs/ReturnLabelTab';
import { ReshipVGMTab } from './components/tabs/ReshipVGMTab';
import { MachineRequestTab } from './components/tabs/MachineRequestTab';
import { O2ReplacementTab } from './components/tabs/O2ReplacementTab';
import { O2RuwSwapTab } from './components/tabs/O2RuwSwapTab';
import { O2PickupTab } from './components/tabs/O2PickupTab';
import { O2SuppliesTab } from './components/tabs/O2SuppliesTab';
import { O2ResupplyTab } from './components/tabs/O2ResupplyTab';
import { SdCardDownloadLinkingTab } from './components/tabs/SdCardDownloadLinkingTab';
import { NewContactTab } from './components/tabs/NewContactTab';
import { DateCalculatorTab } from './components/tabs/DateCalculatorTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    try {
      const saved = localStorage.getItem('care_note_active_tab') as TabId;
      if (saved && DEFAULT_TABS.some((t) => t.id === saved)) {
        return saved;
      }
    } catch (e) {}
    return 'compliance-checkin';
  });

  useEffect(() => {
    try {
      localStorage.setItem('care_note_active_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);
  const [isNotepadOpen, setIsNotepadOpen] = useState<boolean>(false);
  const [isEulaOpen, setIsEulaOpen] = useState<boolean>(false);
  const [isArrangeMode, setIsArrangeMode] = useState<boolean>(false);

  // Tab arrangement ordering persisted to localStorage
  const [tabsOrder, setTabsOrder] = useState<TabId[]>(() => {
    try {
      const saved = localStorage.getItem('care_note_tabs_order');
      if (saved) {
        const parsed: TabId[] = JSON.parse(saved);
        // Validate and merge with all valid tab IDs to make sure no new tab is lost
        const validIds = new Set(DEFAULT_TABS.map((t) => t.id));
        const filtered = parsed.filter((id) => validIds.has(id));
        DEFAULT_TABS.forEach((t) => {
          if (!filtered.includes(t.id)) {
            filtered.push(t.id);
          }
        });
        return filtered;
      }
    } catch (e) {}
    return DEFAULT_TABS.map((t) => t.id);
  });

  const orderedTabs: TabConfig[] = useMemo(() => {
    const tabMap = new Map(DEFAULT_TABS.map((t) => [t.id, t]));
    const result: TabConfig[] = [];
    tabsOrder.forEach((id) => {
      const found = tabMap.get(id);
      if (found) result.push(found);
    });
    // Append any tab not yet in tabsOrder
    DEFAULT_TABS.forEach((t) => {
      if (!tabsOrder.includes(t.id)) {
        result.push(t);
      }
    });
    return result;
  }, [tabsOrder]);

  const handleSaveTabsOrder = (newOrder: TabId[]) => {
    setTabsOrder(newOrder);
    try {
      localStorage.setItem('care_note_tabs_order', JSON.stringify(newOrder));
    } catch (e) {}
  };

  const handleResetTabsOrder = () => {
    const defaultOrder = DEFAULT_TABS.map((t) => t.id);
    setTabsOrder(defaultOrder);
    try {
      localStorage.removeItem('care_note_tabs_order');
    } catch (e) {}
  };

  const [notes, setNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('care_note_notepad') || '';
    } catch (e) {
      return '';
    }
  });

  const [isHackerTheme, setIsHackerTheme] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hackerTheme') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply hacker theme class to document.body
  useEffect(() => {
    if (isHackerTheme) {
      document.body.classList.add('theme-hacker');
    } else {
      document.body.classList.remove('theme-hacker');
    }
    try {
      localStorage.setItem('hackerTheme', isHackerTheme ? 'true' : 'false');
    } catch (e) {}
  }, [isHackerTheme]);

  const toggleTheme = useCallback(() => {
    setIsHackerTheme((prev) => !prev);
  }, []);

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    try {
      localStorage.setItem('care_note_notepad', newNotes);
    } catch (e) {}
  };

  const showToast = useCallback((text: string, type: ToastType) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleDownloadOffline = useCallback(async () => {
    if (window.location.protocol === 'file:') {
      showToast('You are already running the offline application locally!', 'info');
      return;
    }

    try {
      showToast('Preparing offline file...', 'info');
      const response = await fetch('/ClinicalCare_OfflineApp.html');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ClinicalCare_OfflineApp.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('ClinicalCare_OfflineApp.html saved to your Downloads!', 'success');
        return;
      }
    } catch {
      // Fallback
    }

    try {
      const a = document.createElement('a');
      a.href = '/ClinicalCare_OfflineApp.html';
      a.download = 'ClinicalCare_OfflineApp.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloading ClinicalCare_OfflineApp.html...', 'info');
    } catch {
      showToast('Download could not be initiated.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDownloadOffline();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownloadOffline]);

  return (
    <div className="container min-h-screen flex flex-col justify-between" id="app-container">
      <Toast toasts={toasts} onRemove={removeToast} />
      <FloatingCalculator showToast={showToast} isHackerTheme={isHackerTheme} />

      <div>
        <Header
          onToggleEula={() => setIsEulaOpen(!isEulaOpen)}
          onToggleNotepad={() => setIsNotepadOpen((prev) => !prev)}
          isArrangeMode={isArrangeMode}
          onToggleArrangeMode={() => setIsArrangeMode((prev) => !prev)}
          isHackerTheme={isHackerTheme}
          onToggleTheme={toggleTheme}
        />

        <EulaModal
          isOpen={isEulaOpen}
          onClose={() => setIsEulaOpen(false)}
        />
        <NotepadModal
          isOpen={isNotepadOpen}
          onClose={() => setIsNotepadOpen(false)}
          notes={notes}
          onNotesChange={handleNotesChange}
          showToast={showToast}
        />

        <TabNav
          tabs={orderedTabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isArrangeMode={isArrangeMode}
          onToggleArrangeMode={() => setIsArrangeMode((prev) => !prev)}
          onReorderTabs={handleSaveTabsOrder}
          onResetTabsOrder={handleResetTabsOrder}
          showToast={showToast}
        />

        <main id="tab-viewport">
          <div key="compliance-checkin" className={activeTab === 'compliance-checkin' ? 'block' : 'hidden'}>
            <ComplianceCheckInTab showToast={showToast} />
          </div>
          <div key="compliance-risk" className={activeTab === 'compliance-risk' ? 'block' : 'hidden'}>
            <ComplianceRiskTab showToast={showToast} />
          </div>
          <div key="mask-exchange" className={activeTab === 'mask-exchange' ? 'block' : 'hidden'}>
            <MaskExchangeTab showToast={showToast} />
          </div>
          <div key="supply-request" className={activeTab === 'supply-request' ? 'block' : 'hidden'}>
            <SupplyRequestTab showToast={showToast} />
          </div>
          <div key="maskfit-ar" className={activeTab === 'maskfit-ar' ? 'block' : 'hidden'}>
            <MaskFitARTab showToast={showToast} />
          </div>
          <div key="inbound-call" className={activeTab === 'inbound-call' ? 'block' : 'hidden'}>
            <InboundCallTab showToast={showToast} />
          </div>
          <div key="outbound-call" className={activeTab === 'outbound-call' ? 'block' : 'hidden'}>
            <OutboundCallTab showToast={showToast} />
          </div>
          <div key="email-inquiry" className={activeTab === 'email-inquiry' ? 'block' : 'hidden'}>
            <EmailInquiryTab showToast={showToast} />
          </div>
          <div key="removal-request" className={activeTab === 'removal-request' ? 'block' : 'hidden'}>
            <RemovalRequestTab showToast={showToast} />
          </div>
          <div key="return-label" className={activeTab === 'return-label' ? 'block' : 'hidden'}>
            <ReturnLabelTab showToast={showToast} />
          </div>
          <div key="reship-vgm" className={activeTab === 'reship-vgm' ? 'block' : 'hidden'}>
            <ReshipVGMTab
              showToast={showToast}
              onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            />
          </div>
          <div key="machine-request" className={activeTab === 'machine-request' ? 'block' : 'hidden'}>
            <MachineRequestTab showToast={showToast} />
          </div>
          <div key="o2-replacement" className={activeTab === 'o2-replacement' ? 'block' : 'hidden'}>
            <O2ReplacementTab
              showToast={showToast}
              onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            />
          </div>
          <div key="o2-ruw-swap" className={activeTab === 'o2-ruw-swap' ? 'block' : 'hidden'}>
            <O2RuwSwapTab
              showToast={showToast}
              onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            />
          </div>
          <div key="o2-pickup" className={activeTab === 'o2-pickup' ? 'block' : 'hidden'}>
            <O2PickupTab
              showToast={showToast}
              onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            />
          </div>
          <div key="o2-supplies" className={activeTab === 'o2-supplies' ? 'block' : 'hidden'}>
            <O2SuppliesTab showToast={showToast} />
          </div>
          <div key="o2-resupply" className={activeTab === 'o2-resupply' ? 'block' : 'hidden'}>
            <O2ResupplyTab
              showToast={showToast}
              onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            />
          </div>
          <div key="new-contact" className={activeTab === 'new-contact' ? 'block' : 'hidden'}>
            <NewContactTab showToast={showToast} />
          </div>
          <div key="sd-card-download-linking" className={activeTab === 'sd-card-download-linking' ? 'block' : 'hidden'}>
            <SdCardDownloadLinkingTab showToast={showToast} />
          </div>
          <div key="date-calculator" className={activeTab === 'date-calculator' ? 'block' : 'hidden'}>
            <DateCalculatorTab showToast={showToast} />
          </div>
        </main>
      </div>
      <footer className="mt-8 mb-4 text-center text-xs text-neutral-500 font-medium pb-4">
        <span>Founded by Val Hykawy and led by </span>
        <span
          role="button"
          tabIndex={0}
          onClick={() => showToast('Hint: Press Ctrl + D to download offline app', 'info')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              showToast('Hint: Press Ctrl + D to download offline app', 'info');
            }
          }}
          className="hover:text-neutral-400 text-neutral-500 transition-colors cursor-pointer select-none font-medium"
          id="footer-author-hint"
        >
          Andrew Navarro
        </span>
      </footer>
    </div>
  );
};

