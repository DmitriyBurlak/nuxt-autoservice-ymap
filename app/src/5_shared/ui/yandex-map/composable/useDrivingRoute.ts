import type { MaybeRefOrGetter } from 'vue';
import type { TLngLat } from '../model';
import type { IRouteResult } from '../lib/routing/types';

import { buildOsrmRoute } from '../lib/routing/osrm';
import { buildYandexRoute } from '../lib/routing/yandex';

const waypointsKey = (wp: readonly TLngLat[]) => wp.map(([lng, lat]) => `${lng},${lat}`).join('|');

/**
 * Автомаршрут между точками. Провайдер — Яндекс (JS API 2.1, если задан ключ), при ошибке или
 * без ключа — OSRM. Пока маршрут «включён» (`build()` вызван и не было `reset()`), он
 * перестраивается сам при изменении точек — например, когда пользователь двигает метку «Я».
 * Устаревшие ответы отбрасываются (AbortController + сверка ключа точек).
 */
export function useDrivingRoute(waypoints: MaybeRefOrGetter<readonly TLngLat[] | null>) {
  const { ymaps2Apikey } = useRuntimeConfig().public;

  const route = shallowRef<IRouteResult | null>(null);
  const loading = shallowRef(false);
  const error = shallowRef<string | null>(null);
  const isActive = shallowRef(false);

  let controller: AbortController | null = null;

  async function request(wp: readonly TLngLat[], signal: AbortSignal): Promise<IRouteResult> {
    if (ymaps2Apikey) {
      try {
        return await buildYandexRoute(wp, ymaps2Apikey, signal);
      } catch (e) {
        if (signal.aborted) throw e;
        console.warn('[route] Яндекс не построил маршрут, пробуем OSRM:', e);
      }
    }
    return buildOsrmRoute(wp, signal);
  }

  async function run() {
    const wp = toValue(waypoints);
    controller?.abort();
    if (!wp || wp.length < 2) {
      route.value = null;
      return;
    }

    const key = waypointsKey(wp);
    controller = new AbortController();
    const { signal } = controller;
    loading.value = true;
    error.value = null;

    try {
      const result = await request(wp, signal);
      const current = toValue(waypoints);
      if (!signal.aborted && current && waypointsKey(current) === key) route.value = result;
    } catch (e) {
      if (signal.aborted) return;
      route.value = null;
      error.value = 'Не удалось построить маршрут';
      console.error('[route]', e);
    } finally {
      if (!signal.aborted) loading.value = false;
    }
  }

  function build() {
    isActive.value = true;
    return run();
  }

  function reset() {
    isActive.value = false;
    controller?.abort();
    loading.value = false;
    route.value = null;
    error.value = null;
  }

  watch(
    () => {
      const wp = toValue(waypoints);
      return wp ? waypointsKey(wp) : null;
    },
    key => {
      if (!isActive.value) return;
      if (key == null) reset();
      else void run();
    }
  );

  onScopeDispose(() => controller?.abort());

  const distanceKm = computed(() => (route.value ? route.value.distanceMeters / 1000 : null));

  return { route, distanceKm, loading, error, isActive, build, reset };
}
