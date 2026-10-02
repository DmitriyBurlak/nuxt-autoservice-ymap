<script setup lang="ts">
import type { IAutoserviceWithDistance } from '~/src/3_features/map-filters';
import type { TLngLat } from '~/src/5_shared/lib/geo';
import type { TMarkerDragEndPayload, TPinVariant } from '~/src/5_shared/ui/yandex-map';
import type { TAutoserviceMarker } from '../model/useAutoserviceMarkers';

import { useMediaQuery } from '@vueuse/core';
import { AutoserviceClusterTooltip, AutoserviceTooltip, SERVICE_CATEGORIES } from '~/src/4_entities/autoservice';
import { MapPin, UserLocationPin, YMap } from '~/src/5_shared/ui/yandex-map';
import { useAutoserviceMarkers, USER_MARKER_ID } from '../model/useAutoserviceMarkers';

const props = withDefaults(
  defineProps<{
    items: IAutoserviceWithDistance[];
    userCoordinates: TLngLat;
    isLocationApproximate?: boolean;
    routeLine?: TLngLat[] | null;
    /** Подсветка пина при наведении на элемент списка */
    highlightedId?: number | null;
    /** id только что появившихся сервисов — для анимации */
    appearIds?: ReadonlySet<number>;
    center?: TLngLat;
  }>(),
  {
    isLocationApproximate: false,
    routeLine: null,
    highlightedId: null,
    appearIds: () => new Set(),
    center: undefined,
  }
);

const emit = defineEmits<{
  userMove: [coordinates: TLngLat];
}>();

const selectedId = defineModel<number | null>('selectedId', { default: null });

/** На тач-устройствах hover нет (UPopover mode="hover" = HoverCard игнорирует touch) — кластер открываем тапом */
const isMobile = useMediaQuery('(max-width: 767px)');

const { markers } = useAutoserviceMarkers({
  items: toRef(props, 'items'),
  selectedId,
  highlightedId: toRef(props, 'highlightedId'),
  userCoordinates: toRef(props, 'userCoordinates'),
  onSelect: id => (selectedId.value = id),
});

const mapRef = useTemplateRef('mapRef');

const isServiceSelected = (id: number) => selectedId.value === id;
const containsSelected = (items: IAutoserviceWithDistance[]) => items.some(i => isServiceSelected(i.service.id));

function pinVariant(marker: TAutoserviceMarker): TPinVariant {
  if (marker.kind === 'service') {
    const { id, isPremium } = marker.item.service;
    if (isServiceSelected(id) || props.highlightedId === id) return 'selected';
    return isPremium ? 'premium' : 'default';
  }
  if (marker.kind === 'cluster') {
    const highlighted = marker.items.some(i => i.service.id === props.highlightedId);
    return containsSelected(marker.items) || highlighted ? 'selected' : 'default';
  }
  return 'default';
}

function pinIcon(marker: TAutoserviceMarker): string {
  if (marker.kind === 'cluster') return 'i-lucide-warehouse';
  if (marker.kind === 'service') return SERVICE_CATEGORIES[marker.item.service.services[0] ?? 'maintenance'].icon;
  return 'i-lucide-wrench';
}

function isAppearing(marker: TAutoserviceMarker): boolean {
  if (marker.kind === 'service') return props.appearIds.has(marker.item.service.id);
  if (marker.kind === 'cluster') return marker.items.some(i => props.appearIds.has(i.service.id));
  return false;
}

/** Тултип не показываем у выбранного сервиса — по нему уже открыта карточка */
const hasTooltip = (marker: TAutoserviceMarker) =>
  marker.kind === 'cluster' || (marker.kind === 'service' && !isServiceSelected(marker.item.service.id));

function selectFromCluster(serviceId: number, close?: () => void) {
  selectedId.value = serviceId;
  close?.();
}

function onMarkerDragEnd({ id, coordinates }: TMarkerDragEndPayload) {
  if (id === USER_MARKER_ID) emit('userMove', coordinates);
}

defineExpose({
  fitTo: (points: readonly TLngLat[]) => mapRef.value?.fitTo(points),
  flyTo: (center: TLngLat, zoom?: number) => mapRef.value?.flyTo(center, zoom),
});
</script>

<template>
  <YMap
    ref="mapRef"
    :markers="markers"
    :route-line="routeLine"
    :center="center"
    @map-click="selectedId = null"
    @marker-drag-end="onMarkerDragEnd"
  >
    <template #marker="{ marker }">
      <UserLocationPin v-if="marker.kind === 'user'" :is-approximate="isLocationApproximate" />

      <MapPin
        v-else
        :variant="pinVariant(marker)"
        :icon="pinIcon(marker)"
        :count="marker.kind === 'cluster' ? marker.items.length : 0"
        :starred="marker.kind === 'service' && marker.item.service.isPremium"
        :appear="isAppearing(marker)"
        :popover-mode="isMobile && marker.kind === 'cluster' ? 'click' : 'hover'"
      >
        <template v-if="hasTooltip(marker)" #default="{ close }">
          <AutoserviceClusterTooltip
            v-if="marker.kind === 'cluster'"
            :services="marker.items.map(i => i.service)"
            @select="selectFromCluster($event, close)"
          />
          <AutoserviceTooltip
            v-else-if="marker.kind === 'service'"
            :service="marker.item.service"
            :distance-km="marker.item.distanceKm"
          />
        </template>
      </MapPin>
    </template>
  </YMap>
</template>
