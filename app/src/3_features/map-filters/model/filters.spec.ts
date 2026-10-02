import type { IAutoservice } from '~/src/4_entities/autoservice';

import { describe, expect, it } from 'vitest';

import { applyFilters, countActiveFilters, DEFAULT_FILTERS } from './filters';

const base: IAutoservice = {
  id: 0,
  name: '',
  address: '',
  coordinates: [37.6, 55.75],
  rating: 4,
  reviewsCount: 10,
  services: ['tires'],
  priceFrom: 1000,
  workingHours: { openMinutes: 540, closeMinutes: 1260, isAroundTheClock: false },
  phone: '',
  isPremium: false,
  complexName: null,
};

const services: IAutoservice[] = [
  { ...base, id: 1, coordinates: [37.7, 55.75], rating: 4.9, services: ['wash'], priceFrom: 3000 },
  { ...base, id: 2, coordinates: [37.61, 55.75], rating: 3.9, isPremium: true, priceFrom: 500 },
  {
    ...base,
    id: 3,
    coordinates: [37.65, 55.75],
    rating: 4.5,
    services: ['body', 'tires'],
    workingHours: { openMinutes: 0, closeMinutes: 0, isAroundTheClock: true },
  },
];

const context = { userCoordinates: [37.6, 55.75] as [number, number], now: new Date(2026, 0, 1, 23, 0) };
const ids = (filters: Partial<typeof DEFAULT_FILTERS>) =>
  applyFilters(services, { ...DEFAULT_FILTERS, ...filters }, context).map(i => i.service.id);

describe('applyFilters', () => {
  it('по умолчанию — все, сначала ближайшие', () => {
    expect(ids({})).toEqual([2, 3, 1]);
  });

  it('сортировка по рейтингу и цене', () => {
    expect(ids({ sortBy: 'rating' })).toEqual([1, 3, 2]);
    expect(ids({ sortBy: 'price' })).toEqual([2, 3, 1]);
  });

  it('категории — хотя бы одна из выбранных', () => {
    expect(ids({ categories: ['tires'] })).toEqual([2, 3]);
    expect(ids({ categories: ['wash', 'body'] })).toEqual([3, 1]);
  });

  it('минимальный рейтинг, «открыто сейчас», премиум', () => {
    expect(ids({ minRating: 4.5 })).toEqual([3, 1]);
    expect(ids({ openNow: true })).toEqual([3]);
    expect(ids({ premiumOnly: true })).toEqual([2]);
  });

  it('считает расстояние до пользователя', () => {
    const [nearest] = applyFilters(services, DEFAULT_FILTERS, context);
    expect(nearest!.distanceKm).toBeGreaterThan(0.5);
    expect(nearest!.distanceKm).toBeLessThan(0.8);
  });
});

describe('countActiveFilters', () => {
  it('сортировка не считается фильтром', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, sortBy: 'price' })).toBe(0);
    expect(countActiveFilters({ ...DEFAULT_FILTERS, openNow: true, categories: ['wash'] })).toBe(2);
  });
});
