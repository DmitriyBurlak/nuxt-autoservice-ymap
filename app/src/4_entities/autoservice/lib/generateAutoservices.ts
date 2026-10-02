import type { TLngLat, TLngLatBounds } from '~/src/5_shared/lib/geo';
import type { TRng } from '~/src/5_shared/lib/random';
import type { IAutoservice, IWorkingHours } from '../model/types';

import { chance, createRng, pick, pickMany, randomFloat, randomInt } from '~/src/5_shared/lib/random';
import { SERVICE_CATEGORY_KEYS } from '../model/types';
import { COMPLEX_NAMES, MOSCOW_BOUNDS, NAME_BRANDS, NAME_PREFIXES, STREETS } from './dictionaries';

export interface IGenerateOptions {
  seed: number;
  count: number;
  bounds?: TLngLatBounds;
  /** id первой точки — чтобы «живая карта» дописывала точки без коллизий */
  startId?: number;
}

/** Доля точек, которые попадут в автокомплексы (несколько сервисов по одному адресу → кластер) */
const COMPLEX_SHARE = 0.2;
const COMPLEX_SIZE: [number, number] = [2, 4];

function randomPoint(rng: TRng, [[minLng, minLat], [maxLng, maxLat]]: TLngLatBounds): TLngLat {
  return [randomFloat(rng, minLng, maxLng), randomFloat(rng, minLat, maxLat)];
}

/** Рейтинг смещён вверх, как в реальных агрегаторах: большинство 4.0–4.9 */
function randomRating(rng: TRng): number {
  const raw = 5 - Math.abs(randomFloat(rng, -1, 1) * randomFloat(rng, 0, 1.8));
  return Math.round(Math.min(5, Math.max(2.5, raw)) * 10) / 10;
}

function randomWorkingHours(rng: TRng): IWorkingHours {
  if (chance(rng, 0.15)) return { openMinutes: 0, closeMinutes: 0, isAroundTheClock: true };
  const open = pick(rng, [7, 8, 9, 10]) * 60;
  const close = pick(rng, [19, 20, 21, 22]) * 60;
  return { openMinutes: open, closeMinutes: close, isAroundTheClock: false };
}

function randomPhone(rng: TRng): string {
  const d = (len: number) => String(randomInt(rng, 0, 10 ** len - 1)).padStart(len, '0');
  return `+7 (9${d(2)}) ${d(3)}-${d(2)}-${d(2)}`;
}

function randomAddress(rng: TRng): string {
  const building = randomInt(rng, 1, 180);
  const suffix = chance(rng, 0.3) ? `, стр. ${randomInt(rng, 1, 9)}` : '';
  return `${pick(rng, STREETS)}, ${building}${suffix}`;
}

/** Один сервис. Используется и генератором набора, и «живой картой». */
export function generateAutoservice(
  rng: TRng,
  id: number,
  place: { coordinates: TLngLat; address: string; complexName: string | null }
): IAutoservice {
  const servicesCount = randomInt(rng, 1, 4);
  const rating = randomRating(rng);
  return {
    id,
    name: `${pick(rng, NAME_PREFIXES)} «${pick(rng, NAME_BRANDS)}»`,
    address: place.address,
    coordinates: place.coordinates,
    rating,
    reviewsCount: randomInt(rng, 3, rating >= 4.5 ? 1500 : 400),
    services: pickMany(rng, SERVICE_CATEGORY_KEYS, servicesCount),
    priceFrom: randomInt(rng, 5, 60) * 100,
    workingHours: randomWorkingHours(rng),
    phone: randomPhone(rng),
    isPremium: chance(rng, 0.12),
    complexName: place.complexName,
  };
}

export function generateRandomPlace(rng: TRng, bounds: TLngLatBounds = MOSCOW_BOUNDS) {
  return { coordinates: randomPoint(rng, bounds), address: randomAddress(rng), complexName: null };
}

/**
 * Набор случайных автосервисов. Детерминирован по `seed`: одинаковый seed → те же точки
 * (seed хранится в URL, ссылкой можно поделиться). Часть точек собирается в автокомплексы —
 * несколько сервисов по одному адресу, на карте они станут кластером.
 */
export function generateAutoservices({
  seed,
  count,
  bounds = MOSCOW_BOUNDS,
  startId = 1,
}: IGenerateOptions): IAutoservice[] {
  const rng = createRng(seed);
  const result: IAutoservice[] = [];
  let nextId = startId;

  while (result.length < count) {
    const left = count - result.length;
    const isComplex = left >= COMPLEX_SIZE[0] && chance(rng, COMPLEX_SHARE / 2);

    if (isComplex) {
      const size = Math.min(left, randomInt(rng, ...COMPLEX_SIZE));
      const place = { ...generateRandomPlace(rng, bounds), complexName: pick(rng, COMPLEX_NAMES) };
      for (let i = 0; i < size; i++) result.push(generateAutoservice(rng, nextId++, place));
    } else {
      result.push(generateAutoservice(rng, nextId++, generateRandomPlace(rng, bounds)));
    }
  }

  return result;
}
