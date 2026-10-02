<script setup lang="ts">
import type { IRouteResult } from '~/src/5_shared/ui/yandex-map';

import { formatDistance, formatDuration } from '~/src/5_shared/lib/format';

const props = defineProps<{
  route: IRouteResult | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  yandexMapsUrl: string | null;
}>();

const emit = defineEmits<{
  build: [];
  reset: [];
}>();

const providerLabel = computed(() =>
  props.route?.provider === 'yandex' ? 'Маршрут: Яндекс' : 'Маршрут: OSRM / OpenStreetMap'
);
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-if="isActive && route" class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-route" class="size-5 text-(--color-route)" />
        <span class="text-lg font-semibold text-highlighted">{{ formatDistance(route.distanceMeters / 1000) }}</span>
      </div>
      <div class="flex items-center gap-2 text-muted">
        <UIcon name="i-lucide-car" class="size-5" />
        <span class="text-base">{{ formatDuration(route.durationSeconds) }}</span>
      </div>
    </div>

    <p v-if="isActive && route" class="-mt-2 text-xs text-dimmed">{{ providerLabel }}</p>
    <p v-if="error" class="text-sm text-error">{{ error }}</p>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-if="!isActive || !route"
        icon="i-lucide-navigation"
        :loading="loading"
        @click="emit('build')"
      >
        {{ loading ? 'Строим маршрут…' : 'Маршрут от меня' }}
      </UButton>
      <UButton v-else icon="i-lucide-x" color="neutral" variant="outline" @click="emit('reset')">
        Убрать маршрут
      </UButton>

      <UButton
        v-if="yandexMapsUrl"
        :to="yandexMapsUrl"
        target="_blank"
        icon="i-lucide-external-link"
        color="neutral"
        variant="ghost"
      >
        В Яндекс.Картах
      </UButton>
    </div>
  </div>
</template>
