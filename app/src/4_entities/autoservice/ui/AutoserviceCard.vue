<script setup lang="ts">
import type { IAutoservice } from '../model/types';

import { formatDistance, formatPrice } from '~/src/5_shared/lib/format';
import OpenStatus from './OpenStatus.vue';
import RatingStars from './RatingStars.vue';
import ServiceTags from './ServiceTags.vue';
import StarIcon from '~/src/5_shared/ui/icons/StarIcon.vue';

const props = defineProps<{
  service: IAutoservice;
  /** Расстояние по прямой от пользователя, км */
  distanceKm?: number | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

defineSlots<{
  /** Блок маршрута — подставляет фича route-to-service */
  route(): unknown;
}>();

const phoneHref = computed(() => `tel:${props.service.phone.replace(/[^\d+]/g, '')}`);
</script>

<template>
  <article class="flex flex-col rounded-3xl bg-default text-sm shadow-xl ring-1 ring-default">
    <header class="flex items-start justify-between gap-3 p-4 pb-3 md:p-5 md:pb-3">
      <div class="flex min-w-0 flex-col gap-1">
        <p v-if="service.complexName" class="text-xs font-medium text-muted">{{ service.complexName }}</p>
        <h2 class="flex items-center gap-2 text-lg font-semibold text-highlighted md:text-xl">
          <span class="truncate">{{ service.name }}</span>
          <UTooltip v-if="service.isPremium" text="Премиум-партнёр">
            <StarIcon class="size-5 shrink-0 text-amber-400" />
          </UTooltip>
        </h2>
        <RatingStars :rating="service.rating" :reviews-count="service.reviewsCount" size="md" />
      </div>

      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        aria-label="Закрыть"
        class="shrink-0"
        @click="emit('close')"
      />
    </header>

    <div class="flex flex-col gap-3 border-t border-default p-4 md:p-5">
      <div class="flex items-start gap-2">
        <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0 text-muted" />
        <div>
          <p>{{ service.address }}</p>
          <p v-if="distanceKm != null" class="text-xs text-muted">≈ {{ formatDistance(distanceKm) }} по прямой</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-clock" class="size-4 shrink-0 text-muted" />
        <OpenStatus :hours="service.workingHours" />
      </div>

      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-phone" class="size-4 shrink-0 text-muted" />
        <ULink :to="phoneHref" class="text-primary">{{ service.phone }}</ULink>
      </div>

      <ServiceTags :services="service.services" />

      <p class="text-muted">
        Работы от <b class="text-base text-highlighted">{{ formatPrice(service.priceFrom) }}</b>
      </p>
    </div>

    <div v-if="$slots.route" class="border-t border-default p-4 md:p-5">
      <slot name="route" />
    </div>
  </article>
</template>
