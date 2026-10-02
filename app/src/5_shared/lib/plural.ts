/**
 * Склонение по числу: plural(1, ['сервис', 'сервиса', 'сервисов']) → 'сервис'.
 * 1 / 21 → one, 2–4 / 22–24 → few, 0 / 5–20 / 11–14 → many.
 */
export function plural(count: number, [one, few, many]: readonly [string, string, string]): string {
  const mod10 = Math.abs(count) % 10;
  const mod100 = Math.abs(count) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
