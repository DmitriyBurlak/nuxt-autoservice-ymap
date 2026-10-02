import type { Ref } from 'vue';
import type { IAutoservice } from '~/src/4_entities/autoservice';
import type { TLngLatBounds } from '~/src/5_shared/lib/geo';

import { useIntervalFn } from '@vueuse/core';
import { generateAutoservice, generateRandomPlace } from '~/src/4_entities/autoservice';
import { createRng, randomSeed } from '~/src/5_shared/lib/random';

const SPAWN_INTERVAL_MS = 2_500;
const APPEAR_ANIMATION_MS = 600;
const MAX_SERVICES = 300;

/**
 * «Живая карта»: пока включено, раз в пару секунд на карте появляется новый автосервис.
 * `appearIds` — сервисы, у которых сейчас проигрывается анимация появления.
 */
export function useLiveSpawn(services: Ref<IAutoservice[]>, bounds: Ref<TLngLatBounds>) {
  const isLive = ref(false);
  const appearIds = shallowRef<ReadonlySet<number>>(new Set());
  const rng = createRng(randomSeed());

  /** Проиграть анимацию появления для набора сервисов (новые точки, перегенерация) */
  function markAppeared(ids: number[]) {
    appearIds.value = new Set([...appearIds.value, ...ids]);
    setTimeout(() => {
      const next = new Set(appearIds.value);
      ids.forEach(id => next.delete(id));
      appearIds.value = next;
    }, APPEAR_ANIMATION_MS);
  }

  function spawn() {
    if (services.value.length >= MAX_SERVICES) {
      isLive.value = false;
      return;
    }
    const nextId = Math.max(0, ...services.value.map(s => s.id)) + 1;
    const service = generateAutoservice(rng, nextId, generateRandomPlace(rng, bounds.value));
    services.value = [...services.value, service];
    markAppeared([service.id]);
  }

  const { pause, resume } = useIntervalFn(spawn, SPAWN_INTERVAL_MS, { immediate: false });

  watch(isLive, live => (live ? resume() : pause()));

  return { isLive, appearIds, markAppeared, maxServices: MAX_SERVICES };
}
