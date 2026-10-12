import React from 'react';

interface EulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EulaModal: React.FC<EulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="notepad-backdrop"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="notepad-modal max-w-3xl max-h-[85vh] flex flex-col">
        <div className="notepad-header flex items-center justify-between pb-3 border-b border-[#28303d]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="m-0 text-base font-bold text-[#E2E8F0]">End User License Agreement (EULA)</h3>
          </div>
          <button
            type="button"
            className="notepad-close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="notepad-textarea flex-1 overflow-y-auto mt-4 p-4 text-sm text-neutral-300 space-y-4">
          <p><strong>Software:</strong> Notes Assistant</p>
          <p><strong>Copyright © 2026 Authors/Owners:</strong> Andrew Navarro and Val Hykawy</p>
          <p>All Rights Reserved.</p>
          <p>This End User License Agreement ("Agreement") is a binding legal agreement between you (the "User") and the authors of this software, Andrew Navarro and Val Hykawy (the "Owners"). By accessing or using this software, you agree to be bound by the terms of this Agreement.</p>
          
          <h4 className="font-bold text-white mt-6 mb-2">1. GRANT OF LICENSE</h4>
          <p>The Owners grant you a limited, non-exclusive, non-transferable, and revocable license to use the software strictly for its intended operational purposes. This software is licensed, not sold.</p>
          
          <h4 className="font-bold text-white mt-6 mb-2">2. RESTRICTIONS ON SHARING AND DISTRIBUTION</h4>
          <p>You are strictly prohibited from copying, distributing, sharing, transmitting, or otherwise making this software (or any portion of it) available to any third party without the express, prior written permission of the Owners.</p>
          
          <h4 className="font-bold text-white mt-6 mb-2">3. RESTRICTIONS ON MODIFICATION AND REVERSE ENGINEERING</h4>
          <p>Under no circumstances are you permitted to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access, view, or extract the underlying source code of this software.</li>
            <li>Modify, alter, translate, adapt, or create derivative works based upon this software.</li>
            <li>Reverse engineer, decompile, decrypt, or disassemble any part of the software.</li>
            <li>Remove, alter, or obscure any copyright, trademark, or other proprietary rights notices embedded within or displayed by the software.</li>
          </ul>
          
          <h4 className="font-bold text-white mt-6 mb-2">4. OWNERSHIP AND INTELLECTUAL PROPERTY</h4>
          <p>All title, ownership rights, and intellectual property rights in and to the software (including but not limited to any code, themes, interfaces, and text incorporated into the software) shall remain the exclusive property of Andrew Navarro and Val Hykawy.</p>
          
          <h4 className="font-bold text-white mt-6 mb-2">5. TERMINATION</h4>
          <p>This Agreement is effective until terminated. Your rights under this Agreement will terminate automatically and immediately without notice from the Owners if you fail to comply with any term or condition outlined herein. Upon termination, you must cease all use of the software and immediately destroy all copies in your possession.</p>
          
          <h4 className="font-bold text-white mt-6 mb-2">6. DISCLAIMER OF WARRANTY</h4>
          <p>This software is provided "AS IS", without warranty of any kind, express or implied. The Owners shall not be held liable for any damages arising from the use of this software.</p>
          
          <p className="mt-6 italic">By using this software, you acknowledge that you have read this Agreement, understand it, and agree to be bound by its terms and conditions.</p>
        </div>
        
        <div className="notepad-footer flex items-center justify-end pt-3 mt-3 border-t border-[#28303d]">
          <button
            type="button"
            className="btn btn-primary font-bold px-6"
            onClick={onClose}
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
