<script setup lang="ts">
import type { TServiceCategory } from '../model/types';

import { SERVICE_CATEGORIES } from '../model/types';

const props = withDefaults(
  defineProps<{
    services: TServiceCategory[];
    /** Сколько тегов показать, остальные — «+N» */
    max?: number;
  }>(),
  { max: Infinity }
);

const visible = computed(() => props.services.slice(0, props.max));
const hiddenCount = computed(() => props.services.length - visible.value.length);
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <UBadge
      v-for="service in visible"
      :key="service"
      :icon="SERVICE_CATEGORIES[service].icon"
      :label="SERVICE_CATEGORIES[service].label"
      color="neutral"
      variant="soft"
      size="sm"
    />
    <UBadge v-if="hiddenCount > 0" :label="`+${hiddenCount}`" color="neutral" variant="outline" size="sm" />
  </div>
</template>
