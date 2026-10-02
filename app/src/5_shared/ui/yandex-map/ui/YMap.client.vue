<script setup lang="ts" generic="TMarker extends IMapMarker">
import type { LngLat } from '@yandex/ymaps3-types';
import type { IMapMarker, TLngLat, TMarkerDragEndPayload, YMap } from '../model';

import {
  YandexMap,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultSchemeLayer,
  YandexMapFeature,
  YandexMapMarker,
  YandexMapZoomControl,
} from 'vue-yandex-maps';

import { getBoundsForPoints } from '../lib/fitBounds';

/** Сдвиг курсора (px), после которого mouseup считается перетаскиванием карты, а не кликом */
const CLICK_MOVE_TOLERANCE_PX = 5;
const FLY_DURATION_MS = 300;

const props = withDefaults(
  defineProps<{
    markers?: TMarker[];
    /** Геометрия маршрута [lng, lat][] — рисуется линией поверх карты */
    routeLine?: TLngLat[] | null;
    center?: TLngLat;
    zoom?: number;
  }>(),
  {
    markers: () => [],
    routeLine: null,
    center: () => [37.6176, 55.7558],
    zoom: 11,
  }
);

const emit = defineEmits<{
  /** Клик по пустому месту карты (не по маркеру и не конец перетаскивания) */
  mapClick: [];
  markerDragEnd: [payload: TMarkerDragEndPayload];
}>();

defineSlots<{
  marker(props: { marker: TMarker }): unknown;
}>();

const map = shallowRef<YMap | null>(null);

const mapSettings = {
  location: { center: props.center, zoom: props.zoom },
  behaviors: ['drag', 'scrollZoom', 'pinchZoom', 'dblClick'] as ('drag' | 'scrollZoom' | 'pinchZoom' | 'dblClick')[],
};

function markerSettings(marker: TMarker) {
  return {
    coordinates: marker.coordinates,
    draggable: marker.draggable ?? false,
    zIndex: marker.zIndex,
    mapFollowsOnDrag: marker.draggable ? true : undefined,
    onDragEnd: ([lng, lat]: LngLat) => emit('markerDragEnd', { id: marker.id, coordinates: [lng, lat] }),
  };
}

function onMarkerClick(event: Event, marker: TMarker) {
  event.stopPropagation();
  marker.onClick?.();
}

/** Клик по карте отличаем от перетаскивания: ymaps3 после drag тоже присылает click по контейнеру. */
let pointerDown: { x: number; y: number } | null = null;

function onPointerDown(event: PointerEvent) {
  pointerDown = { x: event.clientX, y: event.clientY };
}

function onContainerClick(event: MouseEvent) {
  if (pointerDown) {
    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    if (moved > CLICK_MOVE_TOLERANCE_PX) return;
  }
  emit('mapClick');
}

/** Подогнать видимую область под набор точек (маршрут, выбранный сервис + пользователь и т.д.). */
function fitTo(points: readonly TLngLat[]) {
  const bounds = getBoundsForPoints(points);
  if (!map.value || !bounds) return;
  map.value.setLocation({ bounds, duration: FLY_DURATION_MS });
}

function flyTo(center: TLngLat, zoom?: number) {
  map.value?.setLocation({ center, zoom: zoom ?? map.value.zoom, duration: FLY_DURATION_MS });
}

defineExpose({ fitTo, flyTo, map });
</script>

<template>
  <div
    class="absolute inset-0 size-full min-h-0"
    @pointerdown.capture="onPointerDown"
    @click="onContainerClick"
  >
    <div
      v-show="!map"
      class="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-loader-circle" class="mr-2 size-4 animate-spin" />
      Карта загружается…
    </div>

    <YandexMap v-model="map" class="size-full!" :settings="mapSettings" width="100%" height="100%">
      <YandexMapDefaultSchemeLayer />
      <YandexMapDefaultFeaturesLayer />

      <YandexMapControls :settings="{ position: 'right' }">
        <YandexMapZoomControl />
      </YandexMapControls>

      <YandexMapFeature
        v-if="routeLine && routeLine.length >= 2"
        :settings="{
          geometry: { type: 'LineString', coordinates: routeLine },
          style: { stroke: [{ color: '#2563eb', width: 5, opacity: 0.85 }] },
        }"
      />

      <YandexMapMarker
        v-for="marker in markers"
        :key="marker.id"
        :position="marker.anchor === 'center' ? 'top-center left-center' : 'top left-center'"
        :settings="markerSettings(marker)"
        @click="onMarkerClick($event, marker)"
      >
        <slot name="marker" :marker="marker" />
      </YandexMapMarker>
    </YandexMap>

  </div>
</template>
