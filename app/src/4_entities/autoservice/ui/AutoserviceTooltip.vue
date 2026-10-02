<script setup lang="ts">
import type { IAutoservice } from '../model/types';

import { formatDistance, formatPrice } from '~/src/5_shared/lib/format';
import OpenStatus from './OpenStatus.vue';
import RatingStars from './RatingStars.vue';
import ServiceTags from './ServiceTags.vue';
import StarIcon from '~/src/5_shared/ui/icons/StarIcon.vue';

defineProps<{
  service: IAutoservice;
  /** Расстояние по прямой от пользователя, км */
  distanceKm?: number | null;
}>();
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="flex items-start justify-between gap-2">
      <p class="font-semibold text-highlighted">{{ service.name }}</p>
      <StarIcon v-if="service.isPremium" class="mt-0.5 size-4 shrink-0 text-amber-400" />
    </div>

    <RatingStars :rating="service.rating" :reviews-count="service.reviewsCount" />
    <OpenStatus :hours="service.workingHours" />
    <ServiceTags :services="service.services" :max="3" />

    <div class="flex items-center justify-between gap-2 border-t border-default pt-2 text-xs text-muted">
      <span>от <b class="text-highlighted">{{ formatPrice(service.priceFrom) }}</b></span>
      <span v-if="distanceKm != null" class="flex items-center gap-1">
        <UIcon name="i-lucide-navigation" class="size-3" />
        ≈ {{ formatDistance(distanceKm) }} от вас
      </span>
    </div>

    <p class="text-xs text-dimmed">Нажмите на метку, чтобы открыть карточку</p>
  </div>
</template>
