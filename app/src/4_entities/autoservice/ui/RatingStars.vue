<script setup lang="ts">
import { formatRating } from '~/src/5_shared/lib/format';
import { plural } from '~/src/5_shared/lib/plural';
import StarIcon from '~/src/5_shared/ui/icons/StarIcon.vue';

const props = withDefaults(
  defineProps<{
    rating: number;
    reviewsCount?: number | null;
    size?: 'sm' | 'md';
  }>(),
  { reviewsCount: null, size: 'sm' }
);

/** Заполнение каждой из 5 звёзд, 0–100 % — поддерживает дробный рейтинг (4,3 → 4 полных + 30 %) */
const fills = computed(() =>
  Array.from({ length: 5 }, (_, i) => Math.round(Math.min(1, Math.max(0, props.rating - i)) * 100))
);

const starClass = computed(() => (props.size === 'md' ? 'size-4' : 'size-3.5'));
</script>

<template>
  <div class="flex items-center gap-1.5" :aria-label="`Рейтинг ${formatRating(rating)} из 5`">
    <span class="font-semibold text-highlighted" :class="size === 'md' ? 'text-base' : 'text-sm'">
      {{ formatRating(rating) }}
    </span>
    <span class="flex" aria-hidden="true">
      <span v-for="(fill, i) in fills" :key="i" class="relative" :class="starClass">
        <StarIcon class="absolute inset-0 size-full text-neutral-200" />
        <span class="absolute inset-0 overflow-hidden" :style="{ width: `${fill}%` }">
          <StarIcon class="max-w-none text-amber-400" :class="starClass" />
        </span>
      </span>
    </span>
    <span v-if="reviewsCount != null" class="text-xs text-muted">
      {{ reviewsCount }} {{ plural(reviewsCount, ['отзыв', 'отзыва', 'отзывов']) }}
    </span>
  </div>
</template>
