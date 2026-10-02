/** Координаты в формате ymaps3 / GeoJSON: [долгота, широта]. */
export type TLngLat = [lng: number, lat: number];
export type TLngLatBounds = [TLngLat, TLngLat];

const EARTH_RADIUS_KM = 6371;
const COORD_KEY_PRECISION = 5;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Расстояние по прямой между двумя точками (формула гаверсинусов), км. */
export function haversineKm([lng1, lat1]: TLngLat, [lng2, lat2]: TLngLat): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Ключ точки для группировки маркеров с одинаковыми координатами (~1 м). */
export function coordsKey([lng, lat]: TLngLat): string {
  return `${lng.toFixed(COORD_KEY_PRECISION)}_${lat.toFixed(COORD_KEY_PRECISION)}`;
}

export function isInBounds([lng, lat]: TLngLat, [[minLng, minLat], [maxLng, maxLat]]: TLngLatBounds) {
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}
