<script setup lang="ts">
import type { IMapFilters, TSortBy } from '../model/filters';

import { SERVICE_CATEGORIES, SERVICE_CATEGORY_KEYS } from '~/src/4_entities/autoservice';
import { countActiveFilters, DEFAULT_FILTERS } from '../model/filters';

const filters = defineModel<IMapFilters>({ required: true });

const categoryItems = SERVICE_CATEGORY_KEYS.map(key => ({
  value: key,
  label: SERVICE_CATEGORIES[key].label,
  icon: SERVICE_CATEGORIES[key].icon,
}));

const ratingItems = [
  { value: 0, label: 'Рейтинг: любой' },
  { value: 4, label: 'Рейтинг 4,0+' },
  { value: 4.5, label: 'Рейтинг 4,5+' },
  { value: 4.8, label: 'Рейтинг 4,8+' },
];

const sortItems: { value: TSortBy; label: string }[] = [
  { value: 'distance', label: 'Ближайшие' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'price', label: 'Дешевле' },
];

const activeCount = computed(() => countActiveFilters(filters.value));

function update<K extends keyof IMapFilters>(key: K, value: IMapFilters[K]) {
  filters.value = { ...filters.value, [key]: value };
}

function reset() {
  filters.value = { ...DEFAULT_FILTERS, sortBy: filters.value.sortBy };
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <USelectMenu
      :model-value="filters.categories"
      :items="categoryItems"
      value-key="value"
      multiple
      :search-input="false"
      placeholder="Все услуги"
      icon="i-lucide-wrench"
      class="w-full"
      @update:model-value="update('categories', $event)"
    />

    <div class="grid grid-cols-2 gap-2">
      <USelect
        :model-value="filters.minRating"
        :items="ratingItems"
        icon="i-lucide-star"
        @update:model-value="update('minRating', Number($event))"
      />
      <USelect
        :model-value="filters.sortBy"
        :items="sortItems"
        icon="i-lucide-arrow-down-up"
        @update:model-value="update('sortBy', $event as TSortBy)"
      />
    </div>

    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      <USwitch
        :model-value="filters.openNow"
        label="Открыто сейчас"
        @update:model-value="update('openNow', $event)"
      />
      <USwitch
        :model-value="filters.premiumOnly"
        label="Только премиум"
        @update:model-value="update('premiumOnly', $event)"
      />
      <UButton
        v-if="activeCount"
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-rotate-ccw"
        class="ml-auto"
        @click="reset"
      >
        Сбросить ({{ activeCount }})
      </UButton>
    </div>
  </div>
</template>
