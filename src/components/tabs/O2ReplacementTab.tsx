import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { InfoAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateTab?: (tabId: string) => void;
}

export const O2ReplacementTab: React.FC<Props> = ({ showToast, onNavigateTab }) => {
  const [machineMakeModel, setMachineMakeModel] = usePersistentState<string>('o2rep_machineMakeModel', '');
  const [lastMachineYear, setLastMachineYear] = usePersistentState<string>('o2rep_lastMachineYear', '');
  const [insurancePaidLast, setInsurancePaidLast] = usePersistentState<string>('o2rep_insurancePaidLast', '');
  const [currentInsurance, setCurrentInsurance] = usePersistentState<string>('o2rep_currentInsurance', '');
  const [currentDoctor, setCurrentDoctor] = usePersistentState<string>('o2rep_currentDoctor', '');
  const [doctorPhone, setDoctorPhone] = usePersistentState<string>('o2rep_doctorPhone', '');
  const [doctorCity, setDoctorCity] = usePersistentState<string>('o2rep_doctorCity', '');
  const [isAwareF2F, setIsAwareF2F] = usePersistentState<string>('o2rep_isAwareF2F', 'Y');
  const [completedF2F, setCompletedF2F] = usePersistentState<string>('o2rep_completedF2F', 'N');

  const generateTitle = (): string => 'CC-O2 Replacement Request';

  const generateBody = (): string => {
    return `REPLACEMENT - GREATER THAN 5 YEARS
CURRENT MACHINE MAKE/MODEL: ${machineMakeModel.trim()}
APPROXIMATELY WHAT YEAR DID YOU RECEIVE YOUR LAST MACHINE: ${lastMachineYear.trim()}
INSURANCE THAT PAID FOR THE LAST MACHINE: ${insurancePaidLast.trim()}
CURRENT INSURANCE: ${currentInsurance.trim()}
CURRENT DOCTOR FOR PRESCRIPTION REQUEST: ${currentDoctor.trim()}
DOCTOR PHONE NUMBER: ${doctorPhone.trim()}
DOCTOR CITY: ${doctorCity.trim()}
IS PATIENT AWARE INSURANCE MAY REQUIRE F2F APPT: ${isAwareF2F}
HAS THE F2F APPT ALREADY BEEN COMPLETED IN THE LAST 3 MONTHS: ${completedF2F}`;
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
    setMachineMakeModel('');
    setLastMachineYear('');
    setInsurancePaidLast('');
    setCurrentInsurance('');
    setCurrentDoctor('');
    setDoctorPhone('');
    setDoctorCity('');
    setIsAwareF2F('Y');
    setCompletedF2F('N');
    showToast('Form cleared!', 'info');
  };

  return (
    <div id="o2-replacement" className="tab-content active">
      <div className="form-section">
        <h3>CC-O2 Replacement Request</h3>
        <InfoAlert className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <p><strong>REPLACEMENT - GREATER THAN 5 YEARS</strong></p>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('o2-ruw-swap')}
              className="text-xs text-white hover:text-white underline font-normal cursor-pointer"
            >
              Need RUW / Swap Out (&lt; 5 yrs)? Click here →
            </button>
          )}
        </InfoAlert>

        {/* Machine Make/Model */}
        <div className="form-group">
          <label htmlFor="o2_make_model">CURRENT MACHINE MAKE/MODEL:</label>
          <input
            type="text"
            id="o2_make_model"
            placeholder="e.g. Inogen One G5, Respironics SimplyGo, Invacare..."
            value={machineMakeModel}
            onChange={(e) => setMachineMakeModel(e.target.value)}
          />
        </div>

        {/* Year Received */}
        <div className="form-group">
          <label htmlFor="o2_year">APPROXIMATELY WHAT YEAR DID YOU RECEIVE YOUR LAST MACHINE:</label>
          <input
            type="text"
            id="o2_year"
            placeholder="e.g. 2018, 2019..."
            value={lastMachineYear}
            onChange={(e) => setLastMachineYear(e.target.value)}
          />
        </div>

        {/* Insurance that paid for last machine */}
        <div className="form-group">
          <label htmlFor="o2_ins_last">INSURANCE THAT PAID FOR THE LAST MACHINE:</label>
          <input
            type="text"
            id="o2_ins_last"
            placeholder="e.g. Medicare, BCBS, Aetna, Humana..."
            value={insurancePaidLast}
            onChange={(e) => setInsurancePaidLast(e.target.value)}
          />
        </div>

        {/* Current Insurance */}
        <div className="form-group">
          <label htmlFor="o2_ins_curr">CURRENT INSURANCE:</label>
          <input
            type="text"
            id="o2_ins_curr"
            placeholder="e.g. Same as above, Medicare Part B, UnitedHealthcare..."
            value={currentInsurance}
            onChange={(e) => setCurrentInsurance(e.target.value)}
          />
        </div>

        {/* Doctor Info Group */}
        <div className="form-group">
          <label htmlFor="o2_dr_name">CURRENT DOCTOR FOR PRESCRIPTION REQUEST:</label>
          <input
            type="text"
            id="o2_dr_name"
            placeholder="e.g. Dr. Jane Smith, MD"
            value={currentDoctor}
            onChange={(e) => setCurrentDoctor(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="o2_dr_phone">DOCTOR PHONE NUMBER:</label>
            <input
              type="text"
              id="o2_dr_phone"
              placeholder="e.g. (555) 123-4567"
              value={doctorPhone}
              onChange={(e) => setDoctorPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="o2_dr_city">DOCTOR CITY:</label>
            <input
              type="text"
              id="o2_dr_city"
              placeholder="e.g. Orlando, FL"
              value={doctorCity}
              onChange={(e) => setDoctorCity(e.target.value)}
            />
          </div>
        </div>

        {/* F2F Appt Awareness */}
        <div className="form-group">
          <label>IS PATIENT AWARE INSURANCE MAY REQUIRE F2F APPT:</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="o2_f2f_aware"
                id="o2_aware_y"
                value="Y"
                checked={isAwareF2F === 'Y'}
                onChange={(e) => setIsAwareF2F(e.target.value)}
              />
              <label htmlFor="o2_aware_y">Y (Yes)</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="o2_f2f_aware"
                id="o2_aware_n"
                value="N"
                checked={isAwareF2F === 'N'}
                onChange={(e) => setIsAwareF2F(e.target.value)}
              />
              <label htmlFor="o2_aware_n">N (No)</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="o2_f2f_aware"
                id="o2_aware_na"
                value="N/A"
                checked={isAwareF2F === 'N/A'}
                onChange={(e) => setIsAwareF2F(e.target.value)}
              />
              <label htmlFor="o2_aware_na">N/A</label>
            </div>
          </div>
        </div>

        {/* F2F Completed in Last 3 Months */}
        <div className="form-group">
          <label>HAS THE F2F APPT ALREADY BEEN COMPLETED IN THE LAST 3 MONTHS:</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="o2_f2f_completed"
                id="o2_completed_y"
                value="Y"
                checked={completedF2F === 'Y'}
                onChange={(e) => setCompletedF2F(e.target.value)}
              />
              <label htmlFor="o2_completed_y">Y (Yes)</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="o2_f2f_completed"
                id="o2_completed_n"
                value="N"
                checked={completedF2F === 'N'}
                onChange={(e) => setCompletedF2F(e.target.value)}
              />
              <label htmlFor="o2_completed_n">N (No)</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="o2_f2f_completed"
                id="o2_completed_na"
                value="N/A"
                checked={completedF2F === 'N/A'}
                onChange={(e) => setCompletedF2F(e.target.value)}
              />
              <label htmlFor="o2_completed_na">N/A</label>
            </div>
          </div>
        </div>
      </div>

      <div className="btn-group flex items-center flex-wrap gap-2">
        <button
          type="button"
          id="o2_copy_title_btn"
          className="btn btn-primary"
          onClick={handleCopyTitle}
        >
          Copy Title
        </button>
        <button
          type="button"
          id="o2_copy_body_btn"
          className="btn btn-primary"
          onClick={handleCopyBody}
        >
          Copy Body
        </button>
        <button
          type="button"
          id="o2_clear_btn"
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
