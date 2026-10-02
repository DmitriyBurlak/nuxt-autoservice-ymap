import { createSharedComposable, useNow } from '@vueuse/core';

/** Текущее время с точностью до минуты — один таймер на всё приложение (статус «открыто/закрыто»). */
export const useCurrentMinute = createSharedComposable(() => useNow({ interval: 60_000 }));
