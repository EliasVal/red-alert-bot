import type { THREATS } from './threats.ts';

export type AlertMessage = {
  type: 'ALERT';
  data: {
    cities: string[];
    isDrill: boolean;
    notificationId: string;
    threat: keyof typeof THREATS;
    time: number;
  };
};

type SystemMessage = {
  type: 'SYSTEM_MESSAGE';
  areaIds: number[];
  citiesIds: number[];
  titleEn: string;
  time: string;
};

export type SocketMessage = SystemMessage | AlertMessage;
