<script setup lang="ts">
defineProps<{
  icon: string;
  fillClass: string;
}>();
</script>

<template>
  <span class="relative block">
    <svg viewBox="0 0 24 32" class="block h-9 w-7 drop-shadow-md" :class="fillClass" aria-hidden="true">
      <path
        fill="currentColor"
        stroke="white"
        stroke-width="1.5"
        d="M12 1C5.9 1 1 5.9 1 11.9 1 20 12 31 12 31s11-11 11-19.1C23 5.9 18.1 1 12 1Z"
      />
    </svg>
    <UIcon :name="icon" class="absolute top-[7px] left-1/2 size-3.5 -translate-x-1/2 text-white" />
  </span>
</template>
