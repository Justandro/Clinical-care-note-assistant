import { TabConfig } from '../types';

export const DEFAULT_TABS: TabConfig[] = [
  { id: 'compliance-checkin', label: 'Compliance Check In', emoji: '📋 ' },
  { id: 'compliance-risk', label: 'Compliance Risk', emoji: '⚠️ ' },
  { id: 'mask-exchange', label: 'Mask Exchange', emoji: '🔄 ' },
  { id: 'supply-request', label: 'Supply Request', emoji: '📦 ' },
  { id: 'maskfit-ar', label: 'MaskFit AR', emoji: '🎯 ' },
  { id: 'inbound-call', label: 'Inbound Call', emoji: '📞 ' },
  { id: 'outbound-call', label: 'Outbound Call', emoji: '📤 ' },
  { id: 'email-inquiry', label: 'Email Inquiry', emoji: '✉️ ' },
  { id: 'removal-request', label: 'Removal Request', emoji: '🗑️ ' },
  { id: 'return-label', label: 'Return Label', emoji: '📄 ' },
  { id: 'reship-vgm', label: 'Reship/VGM Error', emoji: '🚚 ' },
  { id: 'machine-request', label: 'Machine Request', emoji: '⚙️ ' },
  { id: 'o2-replacement', label: 'O2 Replacement (>5yr)', emoji: '💨 ' },
  { id: 'o2-ruw-swap', label: 'O2 RUW / Swap Out', emoji: '🔄 ' },
  { id: 'o2-pickup', label: 'O2 Pickup', emoji: '📦 ' },
  { id: 'o2-supplies', label: 'O2 Supplies', emoji: '💨 ' },
  { id: 'o2-resupply', label: 'O2 Resupply', emoji: '🔁 ' },
  { id: 'sd-card-download-linking', label: 'SD Card / Download', emoji: '💾 ' },
  { id: 'new-contact', label: 'New Contact Info', emoji: '📇 ' },
  { id: 'date-calculator', label: 'Date Calculator', emoji: '📅 ' },
];
