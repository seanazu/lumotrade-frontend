export interface SettingsState {
  defaultIndex: string;
  trainingLookbackDays: number;
  validationSplit: number;
  confidenceThreshold: number;
  kellyFraction: number;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  modelRefreshInterval: number;
}

