const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/** 0.35 → «350 м», 12.345 → «12,3 км». */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round((km * 1000) / 10) * 10} м`;
  return `${numberFormatter.format(km)} км`;
}

/** 540 → «9 мин», 5400 → «1 ч 30 мин». */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} мин`;
  return minutes ? `${hours} ч ${minutes} мин` : `${hours} ч`;
}

export const formatPrice = (rub: number) => `${priceFormatter.format(rub)} ₽`;

export const formatRating = (rating: number) => rating.toFixed(1).replace('.', ',');
