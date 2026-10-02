<script setup lang="ts">
import type { TLocationStatus } from '../model/useUserLocation';

defineProps<{
  status: TLocationStatus;
  isApproximate: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const isOpen = ref(true);
</script>

<template>
  <UAlert
    v-if="isOpen && isApproximate && (status === 'denied' || status === 'unsupported')"
    color="neutral"
    variant="subtle"
    icon="i-lucide-locate-off"
    title="Геолокация недоступна"
    description="Показываем центр Москвы. Перетащите синюю метку туда, где вы находитесь."
    :actions="status === 'denied' ? [{ label: 'Повторить', color: 'neutral', variant: 'outline', onClick: () => emit('retry') }] : []"
    close
    class="shadow-lg"
    @update:open="isOpen = $event"
  />
</template>
