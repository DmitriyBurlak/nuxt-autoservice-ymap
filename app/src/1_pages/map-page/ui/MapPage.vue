<script setup lang="ts">
import type { IAutoservice } from '~/src/4_entities/autoservice';
import type { TLngLat, TLngLatBounds } from '~/src/5_shared/lib/geo';

import { useMediaQuery } from '@vueuse/core';
import { AutoservicesList } from '~/src/2_widgets/autoservices-list';
import { AutoservicesMap } from '~/src/2_widgets/autoservices-map';
import { applyFilters, MapFilters } from '~/src/3_features/map-filters';
import { RoutePanel, useRouteToService } from '~/src/3_features/route-to-service';
import { LocationNotice, useUserLocation } from '~/src/3_features/user-location';
import { AutoserviceCard, generateAutoservices, MOSCOW_BOUNDS, MOSCOW_CENTER } from '~/src/4_entities/autoservice';
import { useCurrentMinute } from '~/src/5_shared/composables/useCurrentMinute';
import { haversineKm, isInBounds } from '~/src/5_shared/lib/geo';
import { plural } from '~/src/5_shared/lib/plural';
import { randomSeed } from '~/src/5_shared/lib/random';

import { useLiveSpawn } from '../model/useLiveSpawn';
import { COUNT_OPTIONS, useMapUrlState } from '../model/useMapUrlState';

/** Если пользователь не в Москве — генерируем точки в таком окне вокруг него (~±12 км) */
const AROUND_USER_DELTA: TLngLat = [0.2, 0.11];
const FOCUS_ZOOM = 14;

const ymaps3Apikey = useRuntimeConfig().public.yandexMapsApikey;

const isDesktop = useMediaQuery('(min-width: 768px)');
const now = useCurrentMinute();

const { seed, count, selectedId, filters } = useMapUrlState();
const { coordinates: userCoordinates, status: locationStatus, isApproximate, locate, setManual } =
  useUserLocation(MOSCOW_CENTER);

/** Область генерации точек: Москва или окно вокруг пользователя, если он в другом городе */
const generationBounds = ref<TLngLatBounds>(MOSCOW_BOUNDS);

const services = shallowRef<IAutoservice[]>([]);
const { isLive, appearIds, markAppeared, maxServices } = useLiveSpawn(services, generationBounds);

function regenerate(options: { animate?: boolean } = {}) {
  services.value = generateAutoservices({ seed: seed.value, count: count.value, bounds: generationBounds.value });
  if (options.animate) markAppeared(services.value.map(s => s.id));
}

function generateNew() {
  selectedId.value = null;
  seed.value = randomSeed();
}

watch([seed, count], () => regenerate({ animate: true }));
regenerate();

/** Ссылка из URL могла указать на несуществующий id — сбрасываем */
if (selectedId.value != null && !services.value.some(s => s.id === selectedId.value)) selectedId.value = null;

const items = computed(() =>
  applyFilters(services.value, filters.value, { userCoordinates: userCoordinates.value, now: now.value })
);

const highlightedId = ref<number | null>(null);

const selectedService = computed(() => services.value.find(s => s.id === selectedId.value) ?? null);
const selectedDistanceKm = computed(() =>
  selectedService.value ? haversineKm(userCoordinates.value, selectedService.value.coordinates) : null
);

const { route, loading: routeLoading, error: routeError, isActive: isRouteActive, build: buildRoute, reset: resetRoute, yandexMapsUrl } =
  useRouteToService(
    userCoordinates,
    computed(() => selectedService.value?.coordinates ?? null)
  );

const mapRef = useTemplateRef('mapRef');

function selectService(id: number) {
  selectedId.value = id;
  const service = services.value.find(s => s.id === id);
  if (service) mapRef.value?.flyTo(service.coordinates, FOCUS_ZOOM);
  if (!isDesktop.value) isListOpen.value = false;
}

/** Маршрут построился — показываем его целиком */
watch(route, value => {
  if (value) mapRef.value?.fitTo(value.coordinates);
});

async function locateMe() {
  const coords = await locate();
  if (coords) mapRef.value?.flyTo(coords, FOCUS_ZOOM);
}

function onUserMove(coordinates: TLngLat) {
  setManual(coordinates);
}

onMounted(async () => {
  const coords = await locate();
  if (!coords) return;
  if (!isInBounds(coords, MOSCOW_BOUNDS)) {
    generationBounds.value = [
      [coords[0] - AROUND_USER_DELTA[0], coords[1] - AROUND_USER_DELTA[1]],
      [coords[0] + AROUND_USER_DELTA[0], coords[1] + AROUND_USER_DELTA[1]],
    ];
    regenerate({ animate: true });
  }
  mapRef.value?.flyTo(coords, 12);
});

/** Мобильная шторка со списком и фильтрами */
const isListOpen = ref(false);

const foundLabel = computed(
  () => `${items.value.length} ${plural(items.value.length, ['автосервис', 'автосервиса', 'автосервисов'])}`
);

const countItems = COUNT_OPTIONS.map((value): { value: number; label: string } => ({ value, label: `${value} точек` }));
</script>

<template>
  <div class="flex h-dvh flex-col bg-default">
    <header class="flex items-center gap-3 border-b border-default px-4 py-2.5 md:px-5">
      <div class="flex min-w-0 items-center gap-2.5">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-inverted">
          <UIcon name="i-lucide-wrench" class="size-5" />
        </span>
        <div class="min-w-0">
          <h1 class="truncate text-base font-semibold text-highlighted">Автосервисы на карте</h1>
          <p class="hidden truncate text-xs text-muted sm:block">
            Демо: Nuxt 4 + Яндекс.Карты · точки сгенерированы случайно (seed {{ seed }})
          </p>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <UTooltip :text="`Новая точка каждые пару секунд (до ${maxServices})`">
          <USwitch v-model="isLive" label="Живая карта" class="hidden sm:flex" />
        </UTooltip>
        <USelect v-model="count" :items="countItems" class="hidden w-32 lg:flex" />
        <UButton icon="i-lucide-shuffle" @click="generateNew">
          <span class="hidden sm:inline">Сгенерировать</span>
        </UButton>
      </div>
    </header>

    <div class="flex min-h-0 flex-1">
      <aside v-if="isDesktop" class="flex w-[380px] shrink-0 flex-col border-r border-default">
        <div class="border-b border-default p-4">
          <MapFilters v-model="filters" />
        </div>
        <p class="px-4 pt-3 pb-2 text-sm text-muted">Найдено: {{ foundLabel }}</p>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <AutoservicesList
            :items="items"
            :selected-id="selectedId"
            @select="selectService"
            @hover="highlightedId = $event"
          />
        </div>
      </aside>

      <main class="relative min-w-0 flex-1">
        <div
          v-if="!ymaps3Apikey"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted p-6 text-center"
        >
          <UIcon name="i-lucide-key-round" class="size-10 text-muted" />
          <p class="text-lg font-semibold text-highlighted">Нужен ключ Яндекс.Карт</p>
          <p class="max-w-md text-sm text-muted">
            Скопируйте <code>.env.example</code> в <code>.env</code> и укажите
            <code>NUXT_PUBLIC_YANDEX_MAPS_APIKEY</code> — ключ JavaScript API из кабинета разработчика Яндекса.
          </p>
        </div>

        <AutoservicesMap
          v-else
          ref="mapRef"
          v-model:selected-id="selectedId"
          :items="items"
          :user-coordinates="userCoordinates"
          :is-location-approximate="isApproximate"
          :route-line="route?.coordinates"
          :highlighted-id="highlightedId"
          :appear-ids="appearIds"
          @user-move="onUserMove"
        />

        <div class="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-col items-end gap-2 md:inset-x-auto md:right-3 md:w-[360px]">
          <LocationNotice
            class="pointer-events-auto"
            :status="locationStatus"
            :is-approximate="isApproximate"
            @retry="locateMe"
          />
        </div>

        <div class="absolute right-3 bottom-6 z-20 flex flex-col items-end gap-2">
          <UTooltip text="Где я">
            <UButton
              icon="i-lucide-locate-fixed"
              color="neutral"
              variant="outline"
              size="lg"
              class="rounded-full bg-default shadow-lg"
              aria-label="Показать моё местоположение"
              :loading="locationStatus === 'locating'"
              @click="locateMe"
            />
          </UTooltip>
        </div>

        <UButton
          v-if="!isDesktop && !selectedService"
          icon="i-lucide-list"
          size="lg"
          class="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full shadow-lg"
          @click="isListOpen = true"
        >
          Список · {{ items.length }}
        </UButton>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-4 opacity-0 md:-translate-x-4 md:translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="translate-y-4 opacity-0 md:-translate-x-4 md:translate-y-0"
        >
          <AutoserviceCard
            v-if="selectedService"
            :key="selectedService.id"
            :service="selectedService"
            :distance-km="selectedDistanceKm"
            class="absolute inset-x-0 bottom-0 z-30 max-h-[65%] overflow-y-auto rounded-b-none md:inset-x-auto md:top-4 md:bottom-auto md:left-4 md:max-h-[calc(100%-2rem)] md:w-[400px] md:rounded-b-3xl"
            @close="selectedId = null"
          >
            <template #route>
              <RoutePanel
                :route="route"
                :loading="routeLoading"
                :error="routeError"
                :is-active="isRouteActive"
                :yandex-maps-url="yandexMapsUrl"
                @build="buildRoute"
                @reset="resetRoute"
              />
            </template>
          </AutoserviceCard>
        </Transition>
      </main>
    </div>

    <UDrawer v-if="!isDesktop" v-model:open="isListOpen" title="Автосервисы" :description="`Найдено: ${foundLabel}`">
      <template #body>
        <div class="flex flex-col gap-4">
          <MapFilters v-model="filters" />
          <div class="flex items-center justify-between gap-3">
            <USwitch v-model="isLive" label="Живая карта" />
            <USelect v-model="count" :items="countItems" class="w-32" />
          </div>
          <AutoservicesList :items="items" :selected-id="selectedId" @select="selectService" @hover="() => {}" />
        </div>
      </template>
    </UDrawer>
  </div>
</template>
