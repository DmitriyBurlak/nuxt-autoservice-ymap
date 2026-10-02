import type { Ref } from 'vue';
import type { IAutoserviceWithDistance } from '~/src/3_features/map-filters';
import type { TLngLat } from '~/src/5_shared/lib/geo';
import type { IMapMarker } from '~/src/5_shared/ui/yandex-map';

import { groupByCoords } from '~/src/5_shared/lib/groupByCoords';

export const USER_MARKER_ID = 'user';

export type TAutoserviceMarker = IMapMarker &
  (
    | { kind: 'service'; item: IAutoserviceWithDistance }
    | { kind: 'cluster'; items: IAutoserviceWithDistance[] }
    | { kind: 'user' }
  );

const Z_INDEX = { base: 1, premium: 2, highlighted: 50, selected: 100, user: 200 } as const;

/**
 * Маркеры карты: сервисы с одинаковыми координатами схлопываются в кластер (как заявки
 * с одним адресом в исходном проекте), плюс перетаскиваемая метка пользователя.
 */
export function useAutoserviceMarkers(options: {
  items: Ref<IAutoserviceWithDistance[]>;
  selectedId: Ref<number | null>;
  highlightedId: Ref<number | null>;
  userCoordinates: Ref<TLngLat>;
  onSelect: (serviceId: number) => void;
}) {
  const { items, selectedId, highlightedId, userCoordinates, onSelect } = options;

  const groups = computed(() => groupByCoords(items.value, item => item.service.coordinates));

  function zIndexFor(groupItems: IAutoserviceWithDistance[]): number {
    const ids = groupItems.map(i => i.service.id);
    if (selectedId.value != null && ids.includes(selectedId.value)) return Z_INDEX.selected;
    if (highlightedId.value != null && ids.includes(highlightedId.value)) return Z_INDEX.highlighted;
    if (groupItems.some(i => i.service.isPremium)) return Z_INDEX.premium;
    return Z_INDEX.base;
  }

  const markers = computed<TAutoserviceMarker[]>(() => {
    const result: TAutoserviceMarker[] = groups.value.map(group => {
      const zIndex = zIndexFor(group.items);
      if (group.items.length === 1) {
        const item = group.items[0]!;
        return {
          kind: 'service',
          id: `service-${item.service.id}`,
          coordinates: group.coordinates,
          item,
          zIndex,
          onClick: () => onSelect(item.service.id),
        };
      }
      return { kind: 'cluster', id: `cluster-${group.key}`, coordinates: group.coordinates, items: group.items, zIndex };
    });

    result.push({
      kind: 'user',
      id: USER_MARKER_ID,
      coordinates: userCoordinates.value,
      draggable: true,
      anchor: 'center',
      zIndex: Z_INDEX.user,
    });

    return result;
  });

  return { markers };
}
