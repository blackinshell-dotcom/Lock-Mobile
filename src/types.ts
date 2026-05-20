export interface MockApp {
  id: string;
  name: string;
  icon: string;
  category: 'Social' | 'Entertainment' | 'Communication' | 'Productivity';
  screentimeRate: number; // multiplier of time spent
  color: string;
}

export interface DayUsage {
  date: string; // YYYY-MM-DD
  targetMinutes: number;
  usedMinutes: number;
  lockTriggered: boolean;
  callsReceived: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relation: string;
}

export interface AppConfig {
  dailyTargetMinutes: number; // e.g. 180 (3 hours)
  timeMultiplier: number; // to speed up simulation for demonstration (1x, 60x, 300x etc)
  isUnlocked: boolean; // lock screen manual state
  contacts: EmergencyContact[];
}
