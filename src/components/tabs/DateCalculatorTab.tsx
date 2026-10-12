import React, { useState, useEffect } from 'react';
import { getCurrentDatePST, formatLocalDate } from '../../utils/dateUtils';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { InfoAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const DateCalculatorTab: React.FC<Props> = ({ showToast }) => {
  const currentDatePST = getCurrentDatePST();
  const [startDate, setStartDate] = usePersistentState<string>('dc_startDate', currentDatePST);
  const [daysToAdd, setDaysToAdd] = usePersistentState<number>('dc_daysToAdd', 0);
  const [calcResult, setCalcResult] = useState<string>('');

  const generateBody = (): string => {
    if (calcResult) {
      return `Date Calculation Result:\n${calcResult}\nStart Date: ${startDate}\nToday's Date: ${currentDatePST}`;
    }
    return `Compliance Date Reference:\nToday's Date: ${currentDatePST}\nSelected Start Date: ${startDate}`;
  };

  useEffect(() => {
    if (startDate) {
      calculateDaysToToday(startDate);
    }
  }, [startDate]);

  const calculateDaysToToday = (dateStr: string) => {
    if (!dateStr) {
      showToast('Please select a start date', 'error');
      return;
    }
    const start = new Date(dateStr + 'T00:00:00');
    const today = new Date(currentDatePST + 'T00:00:00');
    const diffDays = Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setCalcResult(`Days from ${dateStr} to today (PST): ${diffDays} days`);
  };

  const calculateNewDate = (days: number) => {
    if (!startDate) {
      showToast('Please select a start date', 'error');
      return;
    }
    const start = new Date(startDate + 'T00:00:00');
    const newDate = new Date(start);
    newDate.setDate(newDate.getDate() + days);
    const formatted = formatLocalDate(newDate);
    setCalcResult(
      `Result: ${formatted} (${days > 0 ? '+' : ''}${days} days from ${startDate}) (PST)`
    );
  };

  const handleQuickAdd = (days: number) => {
    setDaysToAdd(days);
    calculateNewDate(days);
  };

  return (
    <div id="date-calculator" className="tab-content active">
      <div className="form-section">
        <h3>Date Calculator</h3>

        <InfoAlert className="mb-6">
          <p><strong>Today's Date (PST): <span id="current_date_pst">{currentDatePST}</span></strong></p>
        </InfoAlert>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="calc_start_date">Start Date:</label>
            <input
              type="date"
              id="calc_start_date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <small className="text-small">Auto-calculates days to today when date is selected</small>
          </div>
          <div className="form-group flex items-end">
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={() => calculateDaysToToday(startDate)}
            >
              Recalculate Days
            </button>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="calc_days_add">Days to add/subtract:</label>
            <input
              type="number"
              id="calc_days_add"
              value={daysToAdd}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setDaysToAdd(val);
                calculateNewDate(val);
              }}
            />
            <small className="text-small">Auto-calculates new date when changed</small>
          </div>
          <div className="form-group flex items-end">
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={() => calculateNewDate(daysToAdd)}
            >
              Recalculate Date
            </button>
          </div>
        </div>

        {calcResult && (
          <div id="calc_result" className="status-message status-success">
            {calcResult}
          </div>
        )}

        <div className="form-section mt-5">
          <h3>Quick Add Days</h3>
          <div className="btn-group">
            {[10, 21, 30, 45, 60, 75, 90].map((d) => (
              <button
                key={d}
                type="button"
                className="btn btn-success"
                onClick={() => handleQuickAdd(d)}
              >
                +{d} days
              </button>
            ))}
          </div>
        </div>

        <GeneratedNotePreview
          generatedText={generateBody()}
          showToast={showToast}
          title="Date Calculation Output"
        />
      </div>
    </div>
  );
};
