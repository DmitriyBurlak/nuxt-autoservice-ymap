import type { TLngLat } from '../../model';
import type { IRouteResult } from './types';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

interface IOsrmResponse {
  code: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: TLngLat[] };
  }[];
}

/** Автомаршрут через публичный демо-сервер OSRM (OpenStreetMap). Ключ не нужен. */
export async function buildOsrmRoute(waypoints: readonly TLngLat[], signal?: AbortSignal): Promise<IRouteResult> {
  const path = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const response = await fetch(`${OSRM_URL}/${path}?overview=full&geometries=geojson`, { signal });
  if (!response.ok) throw new Error(`OSRM: HTTP ${response.status}`);

  const data = (await response.json()) as IOsrmResponse;
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) throw new Error(`OSRM: ${data.code}`);

  return {
    coordinates: route.geometry.coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    provider: 'osrm',
  };
}
