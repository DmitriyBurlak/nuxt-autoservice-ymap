import type { MultiRouteInstance, MultiRouteParams, TLatLng, TLngLat, Ymaps2MapInstance } from '../../model';
import type { IRouteResult } from './types';

import { loadYmaps2 } from './loadYmaps2';

const ROUTE_TIMEOUT_MS = 15_000;

type TRouteMetric = { value: number; text?: string };

interface IMultiRouteModelRoute {
  getPaths?: () => { properties?: { get?: (key: string) => unknown; coordinates?: TLatLng[] } }[];
  properties?: { get?: (key: string) => unknown };
}

interface IMultiRouteWithModel extends MultiRouteInstance {
  model?: {
    getActiveRoute?: () => IMultiRouteModelRoute | null;
    getRoutes?: () => IMultiRouteModelRoute[];
    events?: { add: (event: string, handler: () => void) => void };
  };
}

function getActiveRoute(multiRoute: IMultiRouteWithModel): IMultiRouteModelRoute | null {
  return multiRoute.model?.getActiveRoute?.() ?? multiRoute.model?.getRoutes?.()?.[0] ?? null;
}

/** Склеивает координаты всех участков маршрута и переводит [lat, lng] (2.1) → [lng, lat] (3.0). */
function extractCoordinates(route: IMultiRouteModelRoute): TLngLat[] {
  const result: TLngLat[] = [];
  for (const path of route.getPaths?.() ?? []) {
    const coords =
      path.properties?.coordinates ?? (path.properties?.get?.('coordinates') as TLatLng[] | undefined);
    if (Array.isArray(coords)) result.push(...coords.map(([lat, lng]): TLngLat => [lng, lat]));
  }
  return result;
}

function extractMetric(route: IMultiRouteModelRoute, key: 'distance' | 'duration'): number | null {
  const metric = route.properties?.get?.(key) as TRouteMetric | undefined;
  return typeof metric?.value === 'number' ? metric.value : null;
}

/**
 * Автомаршрут через MultiRoute из JS API 2.1. В 3.0 маршрутизатора нет, поэтому строим маршрут
 * на невидимой карте 2.1, забираем геометрию и метрики, а рисуем уже на карте 3.0.
 */
export async function buildYandexRoute(
  waypoints: readonly TLngLat[],
  apikey: string,
  signal?: AbortSignal
): Promise<IRouteResult> {
  const ymaps = await loadYmaps2(apikey);

  return new Promise<IRouteResult>((resolve, reject) => {
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;width:100px;height:100px;visibility:hidden;';
    document.body.appendChild(container);

    let map: Ymaps2MapInstance | null = null;
    let multiRoute: IMultiRouteWithModel | null = null;
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
      if (map && multiRoute) map.geoObjects.remove?.(multiRoute);
      multiRoute?.destroy?.();
      map?.destroy?.();
      container.remove();
    };

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const onAbort = () => finish(() => reject(new DOMException('Aborted', 'AbortError')));
    signal?.addEventListener('abort', onAbort);

    const timeout = setTimeout(
      () => finish(() => reject(new Error('Yandex: таймаут построения маршрута'))),
      ROUTE_TIMEOUT_MS
    );

    ymaps.modules.require(['multiRouter.MultiRoute'], (MultiRouteCtor: unknown) => {
      if (settled) return;
      if (!MultiRouteCtor) {
        finish(() => reject(new Error('Yandex: модуль MultiRoute не загрузился')));
        return;
      }

      const MultiRoute = MultiRouteCtor as new (params: MultiRouteParams, options?: object) => IMultiRouteWithModel;
      const referencePoints: TLatLng[] = waypoints.map(([lng, lat]) => [lat, lng]);
      multiRoute = new MultiRoute({ referencePoints, results: 1 }, { boundsAutoApply: false });

      map = new ymaps.Map(container, { center: referencePoints[0]!, zoom: 10 });
      map.geoObjects.add(multiRoute);

      const onUpdate = () => {
        const route = multiRoute ? getActiveRoute(multiRoute) : null;
        if (!route) return;
        const coordinates = extractCoordinates(route);
        const distanceMeters = extractMetric(route, 'distance');
        const durationSeconds = extractMetric(route, 'duration');
        if (!coordinates.length || distanceMeters == null || durationSeconds == null) return;

        finish(() => resolve({ coordinates, distanceMeters, durationSeconds, provider: 'yandex' }));
      };

      multiRoute.events?.add('update', onUpdate);
      multiRoute.model?.events?.add('requestfail', () =>
        finish(() => reject(new Error('Yandex: маршрут не найден')))
      );
      onUpdate();
    });
  });
}
