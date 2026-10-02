<script setup lang="ts">
import type { IAutoservice } from '../model/types';

import { plural } from '~/src/5_shared/lib/plural';
import OpenStatus from './OpenStatus.vue';
import RatingStars from './RatingStars.vue';
import StarIcon from '~/src/5_shared/ui/icons/StarIcon.vue';

const props = defineProps<{
  services: IAutoservice[];
}>();

const emit = defineEmits<{
  select: [serviceId: number];
}>();

const title = computed(() => props.services[0]?.complexName ?? 'Сервисы по адресу');
const address = computed(() => props.services[0]?.address ?? '');
</script>

<template>
  <div class="flex flex-col gap-2" @click.stop>
    <div>
      <p class="text-sm font-semibold text-highlighted">
        {{ title }} · {{ services.length }} {{ plural(services.length, ['сервис', 'сервиса', 'сервисов']) }}
      </p>
      <p class="text-xs text-muted">{{ address }}</p>
    </div>

    <ul class="flex max-h-[280px] flex-col gap-1.5 overflow-y-auto pr-1">
      <li v-for="service in services" :key="service.id">
        <button
          type="button"
          class="flex w-full cursor-pointer flex-col gap-1 rounded-lg border border-default p-2.5 text-left transition-colors hover:bg-elevated"
          @click="emit('select', service.id)"
        >
          <span class="flex items-center justify-between gap-2 text-sm font-medium text-highlighted">
            {{ service.name }}
            <StarIcon v-if="service.isPremium" class="size-3.5 shrink-0 text-amber-400" />
          </span>
          <RatingStars :rating="service.rating" />
          <OpenStatus :hours="service.workingHours" />
        </button>
      </li>
    </ul>
  </div>
</template>
