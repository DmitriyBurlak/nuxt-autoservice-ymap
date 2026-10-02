import type { IWorkingHours } from '../model/types';

const pad = (n: number) => String(n).padStart(2, '0');
const toTime = (minutes: number) => `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;

export function formatWorkingHours(hours: IWorkingHours): string {
  if (hours.isAroundTheClock) return 'Круглосуточно';
  return `${toTime(hours.openMinutes)}–${toTime(hours.closeMinutes)}`;
}

/** Открыт ли сервис в момент `now`. Поддерживает работу «через полночь» (20:00–02:00). */
export function isOpenAt(hours: IWorkingHours, now: Date): boolean {
  if (hours.isAroundTheClock) return true;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const { openMinutes, closeMinutes } = hours;
  return openMinutes <= closeMinutes
    ? minutes >= openMinutes && minutes < closeMinutes
    : minutes >= openMinutes || minutes < closeMinutes;
}
