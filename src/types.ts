export type TabId =
  | 'compliance-checkin'
  | 'compliance-risk'
  | 'mask-exchange'
  | 'supply-request'
  | 'maskfit-ar'
  | 'inbound-call'
  | 'outbound-call'
  | 'email-inquiry'
  | 'removal-request'
  | 'return-label'
  | 'reship-vgm'
  | 'machine-request'
  | 'o2-replacement'
  | 'o2-ruw-swap'
  | 'o2-pickup'
  | 'o2-supplies'
  | 'o2-resupply'
  | 'sd-card-download-linking'
  | 'new-contact'
  | 'date-calculator';

export interface TabConfig {
  id: TabId;
  label: string;
  emoji: string;
}

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}
