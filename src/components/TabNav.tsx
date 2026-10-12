import React, { useState, useRef } from 'react';
import { TabConfig, TabId, ToastType } from '../types';

interface TabNavProps {
  tabs: TabConfig[];
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isArrangeMode: boolean;
  onToggleArrangeMode: () => void;
  onReorderTabs: (newOrder: TabId[]) => void;
  onResetTabsOrder: () => void;
  showToast: (msg: string, type: ToastType) => void;
}

export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  isArrangeMode,
  onToggleArrangeMode,
  onReorderTabs,
  onResetTabsOrder,
  showToast,
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const touchSourceIdx = useRef<number | null>(null);

  // Desktop Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, index: number) => {
    if (!isArrangeMode) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnter = (_e: React.DragEvent<HTMLButtonElement>, index: number) => {
    if (!isArrangeMode || draggedIdx === null) return;
    setDragOverIdx(index);

    if (draggedIdx !== index) {
      // Live swap/reorder like phone app icons
      const updated = [...tabs];
      const [movedItem] = updated.splice(draggedIdx, 1);
      updated.splice(index, 0, movedItem);
      setDraggedIdx(index);
      onReorderTabs(updated.map((t) => t.id));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!isArrangeMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!isArrangeMode) return;
    e.preventDefault();
    setDraggedIdx(null);
    setDragOverIdx(null);
    showToast('Tab arrangement updated', 'success');
  };

  // Touch handlers for mobile / tablet long-press & drag
  const handleTouchStart = (_e: React.TouchEvent<HTMLButtonElement>, index: number) => {
    if (!isArrangeMode) return;
    touchSourceIdx.current = index;
    setDraggedIdx(index);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!isArrangeMode || touchSourceIdx.current === null) return;
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest<HTMLElement>('[data-tab-index]');
    if (targetEl) {
      const targetIdx = Number(targetEl.getAttribute('data-tab-index'));
      if (!isNaN(targetIdx) && touchSourceIdx.current !== targetIdx) {
        const updated = [...tabs];
        const [movedItem] = updated.splice(touchSourceIdx.current, 1);
        updated.splice(targetIdx, 0, movedItem);
        touchSourceIdx.current = targetIdx;
        setDraggedIdx(targetIdx);
        onReorderTabs(updated.map((t) => t.id));
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isArrangeMode) return;
    touchSourceIdx.current = null;
    setDraggedIdx(null);
    setDragOverIdx(null);
    showToast('Tab arrangement updated', 'success');
  };

  const handleTabClick = (tabId: TabId) => {
    if (isArrangeMode) {
      // In arrange mode, prevent accidental tab switching while dragging
      return;
    }
    onSelectTab(tabId);
  };

  return (
    <div className="tab-nav-wrapper mb-5" id="template-nav-container">
      {/* Arrange Mode Notification Banner */}
      {isArrangeMode && (
        <div className="arrange-banner" id="arrange-mode-banner">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">📱</span>
            <div>
              <span className="font-bold">Arrange Mode Active:</span>{' '}
              <span>Hold and drag tabs anywhere in this box to reorder like phone apps.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-warning py-1 px-3 text-xs"
              onClick={() => {
                onResetTabsOrder();
                showToast('Tabs reset to default order', 'info');
              }}
              title="Reset to default order"
            >
              Reset Default
            </button>
            <button
              type="button"
              className="btn btn-success py-1 px-3 text-xs flex items-center gap-1 font-bold"
              onClick={onToggleArrangeMode}
              title="Save & exit arrange mode"
            >
              <span>✓</span>
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* The Tab Grid Container ("that big thing in the top") */}
      <nav
        className={`tab-nav ${isArrangeMode ? 'is-arranging' : ''}`}
        aria-label="Clinical Note Templates Navigation"
        id="template-nav"
      >
        {tabs.map((tab, idx) => {
          const isActive = !isArrangeMode && activeTab === tab.id;
          const isCurrentDragged = isArrangeMode && draggedIdx === idx;
          const isCurrentDragOver = isArrangeMode && dragOverIdx === idx;

          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-tab-${tab.id}`}
              data-tab-index={idx}
              draggable={isArrangeMode}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onTouchStart={(e) => handleTouchStart(e, idx)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => handleTabClick(tab.id)}
              className={`tab-btn ${isActive ? 'active' : ''} ${
                isCurrentDragged ? 'is-dragging' : ''
              } ${isCurrentDragOver ? 'drop-target' : ''}`}
              title={isArrangeMode ? `Drag ${tab.label} to reposition` : tab.label}
            >
              {isArrangeMode && (
                <span className="tab-drag-grip" aria-hidden="true">
                  ⠿
                </span>
              )}
              <span className="emoji">{tab.emoji}</span>
              <span className="tab-label-text">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
