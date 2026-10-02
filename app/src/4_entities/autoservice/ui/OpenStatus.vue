<script setup lang="ts">
import type { IWorkingHours } from '../model/types';

import { useCurrentMinute } from '~/src/5_shared/composables/useCurrentMinute';
import { formatWorkingHours, isOpenAt } from '../lib/workingHours';

const props = defineProps<{
  hours: IWorkingHours;
}>();

const now = useCurrentMinute();
const isOpen = computed(() => isOpenAt(props.hours, now.value));
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs">
    <span class="size-2 rounded-full" :class="isOpen ? 'bg-green-500' : 'bg-red-500'" />
    <span :class="isOpen ? 'text-green-700' : 'text-red-600'" class="font-medium">
      {{ isOpen ? 'Открыто' : 'Закрыто' }}
    </span>
    <span class="text-muted">· {{ formatWorkingHours(hours) }}</span>
  </span>
</template>
