<script setup lang="ts">
import type { TPinVariant } from '../model';

import PinShape from './PinShape.vue';
import StarIcon from '~/src/5_shared/ui/icons/StarIcon.vue';

const props = withDefaults(
  defineProps<{
    variant?: TPinVariant;
    /** Иконка внутри пина (Iconify) */
    icon?: string;
    /** Счётчик в углу — для кластера (несколько точек в одном месте) */
    count?: number;
    /** Звезда в углу — премиум-точка */
    starred?: boolean;
    /** Проиграть анимацию появления (новые точки «живой карты») */
    appear?: boolean;
    isHoverable?: boolean;
    /** Как открывать поповер: hover — по наведению (на touch не работает), click — по тапу */
    popoverMode?: 'hover' | 'click';
    classPopover?: string;
  }>(),
  {
    variant: 'default',
    icon: 'i-lucide-wrench',
    count: 0,
    starred: false,
    appear: false,
    isHoverable: true,
    popoverMode: 'hover',
    classPopover: '',
  }
);

const fillClass = computed(
  () =>
    ({
      default: 'text-(--color-pin)',
      selected: 'text-(--color-pin-selected)',
      premium: 'text-(--color-pin-premium)',
    })[props.variant]
);
</script>

<template>
  <div class="relative" :class="{ 'pin-appear': appear }">
    <div
      class="pointer-events-auto origin-bottom transition-transform duration-150 ease-out will-change-transform"
      :class="[
        isHoverable ? 'cursor-pointer' : 'cursor-default',
        variant === 'selected' ? 'scale-125' : isHoverable ? 'hover:scale-125' : '',
      ]"
    >
      <UPopover
        v-if="$slots.default"
        :mode="popoverMode"
        :open-delay="80"
        :ui="{
          content: `bg-default p-3 rounded-xl ring-1 ring-default shadow-lg w-[320px] max-w-[calc(100vw-2rem)] ${classPopover}`,
        }"
      >
        <PinShape :icon :fill-class="fillClass" />

        <!-- close приходит только в mode="click" (у HoverCard его нет) -->
        <template #content="{ close }">
          <slot :close="close" />
        </template>
      </UPopover>

      <PinShape v-else :icon :fill-class="fillClass" />
    </div>

    <span
      v-if="count > 1"
      class="pointer-events-none absolute -top-1.5 -right-2.5 z-10 min-w-5 rounded-full border-2 border-white bg-neutral-900 px-1 text-center text-[11px] leading-4 font-bold text-white shadow"
    >
      {{ count }}
    </span>
    <span
      v-if="starred"
      class="pointer-events-none absolute -right-1.5 -bottom-0.5 z-10 flex size-4 items-center justify-center rounded-full bg-white shadow"
    >
      <StarIcon class="size-3 text-amber-400" />
    </span>
  </div>
</template>
