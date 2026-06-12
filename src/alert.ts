import type { THREATS } from './threats';

export type Alert = {
  time: number;
  cities: string[];
  threat: keyof typeof THREATS;
  isDrill: boolean;
};

export type AlertHistory = Array<{
  id: number;
  description?: string;
  alerts: Alert[];
}>;
