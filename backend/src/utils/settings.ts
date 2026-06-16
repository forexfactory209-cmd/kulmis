import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(__dirname, '../../../settings.json');

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  defaultCurrency: string;
  commissionRate: number;
  maintenanceMode: boolean;
}

const defaultSettings: PlatformSettings = {
  platformName: 'Somlance',
  supportEmail: 'support@somlance.com',
  defaultCurrency: 'USD',
  commissionRate: 15,
  maintenanceMode: false
};

export const getSettings = (): PlatformSettings => {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch (e) {
      console.error("Error reading settings.json", e);
    }
  }
  return { ...defaultSettings };
};

export const saveSettings = (data: Partial<PlatformSettings>) => {
  const current = getSettings();
  const updated = { ...current, ...data };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
};
