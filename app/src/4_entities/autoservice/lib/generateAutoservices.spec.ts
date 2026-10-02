import { describe, expect, it } from 'vitest';

import { isInBounds } from '~/src/5_shared/lib/geo';
import { groupByCoords } from '~/src/5_shared/lib/groupByCoords';
import { MOSCOW_BOUNDS } from './dictionaries';
import { generateAutoservices } from './generateAutoservices';
import { isOpenAt } from './workingHours';

describe('generateAutoservices', () => {
  it('детерминирован по seed', () => {
    expect(generateAutoservices({ seed: 42, count: 50 })).toEqual(generateAutoservices({ seed: 42, count: 50 }));
    expect(generateAutoservices({ seed: 42, count: 50 })).not.toEqual(generateAutoservices({ seed: 43, count: 50 }));
  });

  it('создаёт ровно count сервисов с уникальными id начиная со startId', () => {
    const services = generateAutoservices({ seed: 1, count: 120, startId: 10 });
    expect(services).toHaveLength(120);
    expect(new Set(services.map(s => s.id)).size).toBe(120);
    expect(services[0]!.id).toBe(10);
  });

  it('все точки внутри области, данные в допустимых пределах', () => {
    for (const s of generateAutoservices({ seed: 7, count: 200 })) {
      expect(isInBounds(s.coordinates, MOSCOW_BOUNDS)).toBe(true);
      expect(s.rating).toBeGreaterThanOrEqual(2.5);
      expect(s.rating).toBeLessThanOrEqual(5);
      expect(s.services.length).toBeGreaterThan(0);
      expect(new Set(s.services).size).toBe(s.services.length);
    }
  });

  it('часть сервисов собрана в автокомплексы — несколько в одной точке', () => {
    const services = generateAutoservices({ seed: 2026, count: 200 });
    const clusters = groupByCoords(services, s => s.coordinates).filter(g => g.items.length > 1);
    expect(clusters.length).toBeGreaterThan(0);
    for (const cluster of clusters) {
      expect(cluster.items.every(s => s.complexName && s.complexName === cluster.items[0]!.complexName)).toBe(true);
    }
  });
});

describe('isOpenAt', () => {
  const at = (h: number, m = 0) => new Date(2026, 0, 1, h, m);

  it('обычный график 09:00–21:00', () => {
    const hours = { openMinutes: 540, closeMinutes: 1260, isAroundTheClock: false };
    expect(isOpenAt(hours, at(8, 59))).toBe(false);
    expect(isOpenAt(hours, at(9))).toBe(true);
    expect(isOpenAt(hours, at(20, 59))).toBe(true);
    expect(isOpenAt(hours, at(21))).toBe(false);
  });

  it('график через полночь 20:00–02:00', () => {
    const hours = { openMinutes: 1200, closeMinutes: 120, isAroundTheClock: false };
    expect(isOpenAt(hours, at(23))).toBe(true);
    expect(isOpenAt(hours, at(1))).toBe(true);
    expect(isOpenAt(hours, at(12))).toBe(false);
  });

  it('круглосуточно', () => {
    expect(isOpenAt({ openMinutes: 0, closeMinutes: 0, isAroundTheClock: true }, at(3))).toBe(true);
  });
});
