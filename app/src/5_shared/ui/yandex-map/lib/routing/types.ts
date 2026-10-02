import type { TLngLat } from '../../model';

export type TRouteProvider = 'yandex' | 'osrm';

export interface IRouteResult {
  /** Геометрия маршрута в формате [lng, lat][] — сразу для LineString в ymaps3 */
  coordinates: TLngLat[];
  distanceMeters: number;
  durationSeconds: number;
  provider: TRouteProvider;
}
