import type { LocationQuery, LocationQueryValue } from 'vue-router';
import type { TServiceCategory } from '~/src/4_entities/autoservice';
import type { IMapFilters, TSortBy } from '~/src/3_features/map-filters';

import { SERVICE_CATEGORY_KEYS } from '~/src/4_entities/autoservice';
import { DEFAULT_FILTERS } from '~/src/3_features/map-filters';
import { randomSeed } from '~/src/5_shared/lib/random';

export const COUNT_OPTIONS = [30, 60, 120, 200] as const;
const DEFAULT_COUNT = 60;
const SORT_VALUES: TSortBy[] = ['distance', 'rating', 'price'];

const first = (value: LocationQueryValue | LocationQueryValue[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? undefined;

function parseNumber(value: string | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseFilters(query: LocationQuery): IMapFilters {
  const categories = (first(query.cat) ?? '')
    .split(',')
    .filter((c): c is TServiceCategory => SERVICE_CATEGORY_KEYS.includes(c as TServiceCategory));
  const sort = first(query.sort) as TSortBy | undefined;
  return {
    categories,
    minRating: parseNumber(first(query.rating)) ?? DEFAULT_FILTERS.minRating,
    openNow: first(query.open) === '1',
    premiumOnly: first(query.premium) === '1',
    sortBy: sort && SORT_VALUES.includes(sort) ? sort : DEFAULT_FILTERS.sortBy,
  };
}

/**
 * Состояние страницы в query-параметрах: seed и количество точек, выбранный сервис, фильтры.
 * Ссылкой можно поделиться — по тому же seed сгенерируются те же автосервисы.
 */
export function useMapUrlState() {
  const route = useRoute();
  const router = useRouter();

  const initialCount = parseNumber(first(route.query.count));

  const seed = ref(parseNumber(first(route.query.seed)) ?? randomSeed());
  const count = ref<number>(
    initialCount && (COUNT_OPTIONS as readonly number[]).includes(initialCount) ? initialCount : DEFAULT_COUNT
  );
  const selectedId = ref<number | null>(parseNumber(first(route.query.selected)));
  const filters = ref<IMapFilters>(parseFilters(route.query));

  const query = computed(() => {
    const f = filters.value;
    const q: Record<string, string> = { seed: String(seed.value) };
    if (count.value !== DEFAULT_COUNT) q.count = String(count.value);
    if (selectedId.value != null) q.selected = String(selectedId.value);
    if (f.categories.length) q.cat = f.categories.join(',');
    if (f.minRating > 0) q.rating = String(f.minRating);
    if (f.openNow) q.open = '1';
    if (f.premiumOnly) q.premium = '1';
    if (f.sortBy !== DEFAULT_FILTERS.sortBy) q.sort = f.sortBy;
    return q;
  });

  watch(query, q => void router.replace({ query: q }), { immediate: true });

  return { seed, count, selectedId, filters };
}
