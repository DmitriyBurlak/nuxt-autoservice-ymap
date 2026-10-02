import type { TLngLat } from './geo';

import { coordsKey } from './geo';

export interface ICoordsGroup<T> {
  key: string;
  coordinates: TLngLat;
  items: T[];
}

/**
 * Группирует элементы с совпадающими координатами (до ~1 м). Порядок групп — по первому
 * вхождению, порядок внутри группы — исходный. Одна группа из нескольких элементов = кластер на карте.
 */
export function groupByCoords<T>(items: readonly T[], getCoords: (item: T) => TLngLat): ICoordsGroup<T>[] {
  const groups = new Map<string, ICoordsGroup<T>>();
  for (const item of items) {
    const coordinates = getCoords(item);
    const key = coordsKey(coordinates);
    const group = groups.get(key);
    if (group) group.items.push(item);
    else groups.set(key, { key, coordinates, items: [item] });
  }
  return [...groups.values()];
}
