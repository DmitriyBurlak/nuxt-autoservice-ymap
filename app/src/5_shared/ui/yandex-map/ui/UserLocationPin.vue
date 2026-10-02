<script setup lang="ts">
defineProps<{
  /** Позиция примерная (геолокация недоступна) — показываем пунктирную обводку */
  isApproximate?: boolean;
}>();
</script>

<template>
  <UTooltip
    :text="isApproximate ? 'Примерное местоположение — перетащите метку' : 'Вы здесь — метку можно перетащить'"
  >
    <div class="relative flex size-6 cursor-grab items-center justify-center active:cursor-grabbing">
      <span class="user-pulse absolute inset-0 rounded-full bg-(--color-user)" />
      <span
        class="relative size-4 rounded-full border-[3px] border-white bg-(--color-user) shadow-md"
        :class="{ 'outline-2 outline-offset-2 outline-dashed outline-(--color-user)': isApproximate }"
      />
    </div>
  </UTooltip>
</template>
