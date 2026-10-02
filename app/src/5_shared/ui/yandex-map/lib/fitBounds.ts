import type { TLngLat, TLngLatBounds } from '../model';

const BOUNDS_PADDING = 0.25;
const SINGLE_POINT_DELTA = 0.01;
const MIN_RANGE = 0.005;

/** Границы области, в которую влезают все точки, с отступом по краям. null — точек нет. */
export function getBoundsForPoints(points: readonly TLngLat[]): TLngLatBounds | null {
  if (!points.length) return null;

  if (points.length === 1) {
    const [lng, lat] = points[0]!;
    return [
      [lng - SINGLE_POINT_DELTA, lat - SINGLE_POINT_DELTA],
      [lng + SINGLE_POINT_DELTA, lat + SINGLE_POINT_DELTA],
    ];
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const padLng = Math.max(maxLng - minLng, MIN_RANGE) * BOUNDS_PADDING;
  const padLat = Math.max(maxLat - minLat, MIN_RANGE) * BOUNDS_PADDING;
  return [
    [minLng - padLng, minLat - padLat],
    [maxLng + padLng, maxLat + padLat],
  ];
}
