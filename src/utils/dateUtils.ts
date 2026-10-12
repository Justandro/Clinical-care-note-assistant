export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentDatePST(): string {
  const now = new Date();
  // Format to America/Los_Angeles (PST/PDT)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

export interface ComplianceCalculationResult {
  daysPassed: number;
  daysRemaining: number;
  endDate: string;
  statusText: string;
  statusType: 'success' | 'warning' | 'error';
}

export function calculateComplianceDays(setupDateStr: string): ComplianceCalculationResult | null {
  if (!setupDateStr) return null;
  try {
    const setupDate = new Date(setupDateStr + 'T00:00:00');
    const todayStr = getCurrentDatePST();
    const today = new Date(todayStr + 'T00:00:00');
    
    // Use Math.round to handle 23h/25h days during Daylight Saving Time (DST) transitions cleanly
    const daysPassed = Math.round((today.getTime() - setupDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 90 - daysPassed);
    
    const endDate = new Date(setupDate);
    endDate.setDate(endDate.getDate() + 90);
    const endFormatted = formatLocalDate(endDate);

    if (daysRemaining > 1) {
      return {
        daysPassed,
        daysRemaining,
        endDate: endFormatted,
        statusText: `Days passed: ${daysPassed} | Compliance ends: ${endFormatted} | ${daysRemaining} days remaining (including today) (PST)`,
        statusType: 'success',
      };
    } else if (daysRemaining === 1) {
      return {
        daysPassed,
        daysRemaining,
        endDate: endFormatted,
        statusText: `LAST DAY of compliance period! | ${daysRemaining} day remaining (including today) (PST)`,
        statusType: 'warning',
      };
    } else {
      return {
        daysPassed,
        daysRemaining,
        endDate: endFormatted,
        statusText: `Compliance period ENDED ${daysPassed - 90} days ago (PST)`,
        statusType: 'error',
      };
    }
  } catch (e) {
    return null;
  }
}
