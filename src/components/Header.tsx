import React from 'react';

interface HeaderProps {
  onToggleNotepad: () => void;
  onToggleEula: () => void;
  isArrangeMode: boolean;
  onToggleArrangeMode: () => void;
  isHackerTheme: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleNotepad,
  onToggleEula,
  isArrangeMode,
  onToggleArrangeMode,
  isHackerTheme,
  onToggleTheme,
}) => {
  return (
    <header className="header text-center mb-5 relative pt-1" id="main-header">
      <div className="absolute left-0 top-1 flex items-center gap-2">
        <button
          type="button"
          id="notepad-toggle-btn"
          className="notepad-toggle"
          onClick={onToggleNotepad}
          title="Open Shared Notepad"
        >
          <span className="emoji">📝</span>
        </button>
        <button
          type="button"
          id="eula-toggle-btn"
          className="notepad-toggle eula-toggle-btn"
          onClick={onToggleEula}
          title="View EULA"
        >
          <span className="emoji">📜</span>
        </button>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">
        Clinical Care Note Assistant
      </h1>
      <p className="text-sm sm:text-base text-[#90A4AE]">
        Select a template below to begin
      </p>
      <div className="header-right-actions">
        <button
          type="button"
          id="arrange-tabs-btn"
          className={`arrange-toggle ${isArrangeMode ? 'active' : ''}`}
          onClick={onToggleArrangeMode}
          title={isArrangeMode ? "Exit Arrange Mode" : "Arrange Tabs (Drag & Drop)"}
        >
          <span className="emoji">{isArrangeMode ? '✓' : '⚙️'}</span>
        </button>
        <button
          type="button"
          id="theme-toggle-btn"
          className="theme-toggle"
          onClick={onToggleTheme}
          title={isHackerTheme ? "Switch to Standard Theme" : "Toggle Hacker Mode"}
        >
          <span className="emoji">💻</span>
        </button>
      </div>
    </header>
  );
};
