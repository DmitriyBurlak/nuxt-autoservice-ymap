// Импорт из модулей сущности, а не из index — чтобы чистая логика не тянула .vue (тесты в node)
import type { IAutoservice, TServiceCategory } from '~/src/4_entities/autoservice/model/types';
import type { TLngLat } from '~/src/5_shared/lib/geo';

import { isOpenAt } from '~/src/4_entities/autoservice/lib/workingHours';
import { haversineKm } from '~/src/5_shared/lib/geo';

export type TSortBy = 'distance' | 'rating' | 'price';

export interface IMapFilters {
  /** Пусто — все категории; иначе сервис должен уметь хотя бы одну из выбранных */
  categories: TServiceCategory[];
  minRating: number;
  openNow: boolean;
  premiumOnly: boolean;
  sortBy: TSortBy;
}

export const DEFAULT_FILTERS: IMapFilters = {
  categories: [],
  minRating: 0,
  openNow: false,
  premiumOnly: false,
  sortBy: 'distance',
};

export interface IAutoserviceWithDistance {
  service: IAutoservice;
  /** По прямой от пользователя, км */
  distanceKm: number;
}

export function countActiveFilters(filters: IMapFilters): number {
  return (
    (filters.categories.length ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.openNow ? 1 : 0) +
    (filters.premiumOnly ? 1 : 0)
  );
}

const comparators: Record<TSortBy, (a: IAutoserviceWithDistance, b: IAutoserviceWithDistance) => number> = {
  distance: (a, b) => a.distanceKm - b.distanceKm,
  rating: (a, b) => b.service.rating - a.service.rating || b.service.reviewsCount - a.service.reviewsCount,
  price: (a, b) => a.service.priceFrom - b.service.priceFrom,
};

/** Фильтрует, считает расстояние до пользователя и сортирует — для списка и маркеров. */
export function applyFilters(
  services: readonly IAutoservice[],
  filters: IMapFilters,
  context: { userCoordinates: TLngLat; now: Date }
): IAutoserviceWithDistance[] {
  return services
    .filter(
      s =>
        (!filters.categories.length || s.services.some(c => filters.categories.includes(c))) &&
        s.rating >= filters.minRating &&
        (!filters.openNow || isOpenAt(s.workingHours, context.now)) &&
        (!filters.premiumOnly || s.isPremium)
    )
    .map(service => ({ service, distanceKm: haversineKm(context.userCoordinates, service.coordinates) }))
    .sort(comparators[filters.sortBy]);
}
