/** Генератор псевдослучайных чисел с зерном: одинаковый seed → одинаковая последовательность. */
export type TRng = () => number;

/** mulberry32 — маленький и быстрый PRNG, для демо-данных качества хватает с запасом. */
export function createRng(seed: number): TRng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

export const randomFloat = (rng: TRng, min: number, max: number) => min + rng() * (max - min);

export const randomInt = (rng: TRng, min: number, max: number) =>
  Math.floor(randomFloat(rng, min, max + 1));

export const chance = (rng: TRng, probability: number) => rng() < probability;

export function pick<T>(rng: TRng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

/** Несколько разных элементов в случайном порядке. */
export function pickMany<T>(rng: TRng, items: readonly T[], count: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
