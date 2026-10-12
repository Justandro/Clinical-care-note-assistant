export const removalReasonsList: string[] = [
  "REFUSED/NO LONGER USES/NEEDS THERAPY [If patient is within compliance assign to CC, if not assign to CUS]",
  "BAD CONTACT INFO (EFFORTS EXHAUSTED)",
  "BILLING/OOP CONCERNS (BLL) (CGM)",
  "CALL-IN ONLY (PR)",
  "CBA (CLM)",
  "DECEASED - DATE OF DEATH (CUS)",
  "INSURANCE - OON (CLM) (CGM)",
  "INSURANCE - TERMINATED AND DOES NOT HAVE NEW POLICY (CLM) (CGM)",
  "NO SUPPLIES IN 1+ YEAR (PR) (CGM)",
  "NEW/LOCAL PROVIDER (PR) (CGM)",
  "O2 REFUSED/NO LONGER USES/NEEDS THERAPY (CC)",
  "RECEIVED EXCESSIVE CALLS (PR) (CGM)",
  "RECEIVED WRONG SUPPLIES (PR)",
  "UNABLE TO COMPLETE MR FILE (EFFORTS EXHAUSTED) (INT) / (AM) / (CGM)- Utilize dept accordingly",
  "UNSATISFIED WITH OUTSOURCED CALL(S) (CUS) (CGM)",
  "DISCONTINUATION ORDER (CUS)(CGM)",
  "CARECENTRIX SUSPENSION UNRESOLVED (CLM)",
  "UNABLE TO OBTAIN COMP DOWNLOAD FOR APPEALS (CLM)",
  "CANNOT SERVICE STATE (CUS)"
];

export const removalReasonQuestions: Record<string, string[]> = {
  "BILLING/OOP CONCERNS (BLL) (CGM)": [
    "Did you offer a payment plan?",
    "Did you offer to customize the order for the patient?"
  ],
  "CALL-IN ONLY (PR)": [
    "Did you offer to be a need okay?",
    "Did you offer corporate contact only?",
    "Is the pt ok to be contacted via email?"
  ],
  "DECEASED - DATE OF DEATH (CUS)": [
    "Who did you speak with?",
    "Where can they be contacted?"
  ],
  "INSURANCE - OON (CLM) (CGM)": [
    "Did you offer a payment plan?",
    "Did you offer to customize the order for the patient?"
  ],
  "INSURANCE - TERMINATED AND DOES NOT HAVE NEW POLICY (CLM) (CGM)": [
    "Did you refer to our cash pay site?"
  ],
  "REFUSED/NO LONGER USES/NEEDS THERAPY [If patient is within compliance assign to CC, if not assign to CUS]": [
    "Why is the patient no longer using the therapy?",
    "Did you go over the risks of not using the machine nightly?",
    "Is the pt using alternative therapy?"
  ],
  "NO SUPPLIES IN 1+ YEAR (PR) (CGM)": [
    "Did you go over the risks of not using the machine nightly?"
  ],
  "NEW/LOCAL PROVIDER (PR) (CGM)": [
    "[If within compliance (CC)]",
    "Did you educate the patient on freedom of choice?",
    "Did you educate the patient on the convenience of shipping to their door?",
    "Did you educate the patient on having sleep coaches available to them 24/7?"
  ],
  "O2 REFUSED/NO LONGER USES/NEEDS THERAPY (CC)": [
    "Did we receive D/C order?",
    "Does the pt need O2 Release of Liability Waiver emailed?",
    "Email:"
  ],
  "RECEIVED EXCESSIVE CALLS (PR) (CGM)": [
    "Did you offer to change calling frequency?",
    "Did you offer the patient to be corporate only contact?"
  ],
  "RECEIVED WRONG SUPPLIES (PR)": [
    "Can we correct the mistake and re-ship the correct supplies at no cost?",
    "Was the account updated with the correct supplies?"
  ],
  "UNSATISFIED WITH OUTSOURCED CALL(S) (CUS) (CGM)": [
    "Did you offer the patient to be corporate only contact?"
  ]
};

export const getRemovalReasonDept = (reasonText: string): string => {
  if (!reasonText) return 'CUS';

  if (reasonText.includes('BAD CONTACT INFO')) return 'IOC';
  if (reasonText.includes('UNABLE TO COMPLETE MR FILE')) return 'IOC';
  if (reasonText.includes('REFUSED/NO LONGER USES/NEEDS THERAPY')) return 'CUS';
  if (reasonText.includes('CANNOT SERVICE STATE')) return 'CUS';
  if (reasonText.includes('DECEASED')) return 'CUS';
  if (reasonText.includes('DISCONTINUATION ORDER')) return 'CUS';
  if (reasonText.includes('UNSATISFIED WITH OUTSOURCED')) return 'CUS';
  if (reasonText.includes('BILLING/OOP CONCERNS')) return 'BLL';
  if (reasonText.includes('CALL-IN ONLY')) return 'PR';
  if (reasonText.includes('NO SUPPLIES IN 1+ YEAR')) return 'PR';
  if (reasonText.includes('NEW/LOCAL PROVIDER')) return 'PR';
  if (reasonText.includes('RECEIVED EXCESSIVE CALLS')) return 'PR';
  if (reasonText.includes('RECEIVED WRONG SUPPLIES')) return 'PR';
  if (reasonText.includes('CBA')) return 'CLM';
  if (reasonText.includes('INSURANCE - OON')) return 'CLM';
  if (reasonText.includes('INSURANCE - TERMINATED')) return 'CLM';
  if (reasonText.includes('CARECENTRIX SUSPENSION')) return 'CLM';
  if (reasonText.includes('UNABLE TO OBTAIN COMP DOWNLOAD')) return 'CLM';
  if (reasonText.includes('O2 REFUSED/NO LONGER USES/NEEDS THERAPY')) return 'CC';

  const match = reasonText.match(/\(([A-Z]{2,4})\)/);
  if (match) return match[1];

  return 'CUS';
};

