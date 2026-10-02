<script setup lang="ts">
import type { IAutoserviceWithDistance } from '~/src/3_features/map-filters';

import { OpenStatus, RatingStars, ServiceTags } from '~/src/4_entities/autoservice';
import { formatDistance, formatPrice } from '~/src/5_shared/lib/format';
import StarIcon from '~/src/5_shared/ui/icons/StarIcon.vue';

const props = defineProps<{
  items: IAutoserviceWithDistance[];
  selectedId: number | null;
}>();

const emit = defineEmits<{
  select: [serviceId: number];
  /** Наведение на элемент — подсветить пин на карте (null — увели курсор) */
  hover: [serviceId: number | null];
}>();

const listRef = useTemplateRef('listRef');

/** Выбрали сервис на карте — прокручиваем список к нему */
watch(
  () => props.selectedId,
  async id => {
    if (id == null) return;
    await nextTick();
    listRef.value?.querySelector(`[data-service-id="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
);
</script>

<template>
  <div v-if="!items.length" class="flex flex-col items-center gap-2 px-6 py-12 text-center text-muted">
    <UIcon name="i-lucide-search-x" class="size-8" />
    <p class="font-medium text-default">Ничего не нашлось</p>
    <p class="text-sm">Попробуйте ослабить фильтры или сгенерировать новые точки</p>
  </div>

  <ul v-else ref="listRef" class="flex flex-col gap-2" @mouseleave="emit('hover', null)">
    <li v-for="{ service, distanceKm } in items" :key="service.id" :data-service-id="service.id">
      <button
        type="button"
        class="flex w-full cursor-pointer flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors"
        :class="
          service.id === selectedId
            ? 'border-primary bg-primary/5'
            : 'border-default hover:border-accented hover:bg-elevated/50'
        "
        @mouseenter="emit('hover', service.id)"
        @click="emit('select', service.id)"
      >
        <span class="flex items-start justify-between gap-2">
          <span class="flex min-w-0 items-center gap-1.5 font-medium text-highlighted">
            <span class="truncate">{{ service.name }}</span>
            <StarIcon v-if="service.isPremium" class="size-3.5 shrink-0 text-amber-400" />
          </span>
          <span class="shrink-0 text-xs font-medium text-muted">{{ formatDistance(distanceKm) }}</span>
        </span>
        <RatingStars :rating="service.rating" :reviews-count="service.reviewsCount" />
        <span class="truncate text-xs text-muted">{{ service.address }}</span>
        <span class="flex items-center justify-between gap-2">
          <OpenStatus :hours="service.workingHours" />
          <span class="text-xs text-muted">от {{ formatPrice(service.priceFrom) }}</span>
        </span>
        <ServiceTags :services="service.services" :max="2" />
      </button>
    </li>
  </ul>
</template>
