import { describe, expect, it } from 'vitest';

import { coordsKey, haversineKm, isInBounds } from './geo';
import { groupByCoords } from './groupByCoords';
import { plural } from './plural';
import { formatDistance, formatDuration } from './format';

describe('haversineKm', () => {
  it('0 для одной и той же точки', () => {
    expect(haversineKm([37.6, 55.7], [37.6, 55.7])).toBe(0);
  });

  it('Москва → Санкт-Петербург ≈ 634 км по прямой', () => {
    const km = haversineKm([37.6176, 55.7558], [30.3141, 59.9386]);
    expect(km).toBeGreaterThan(625);
    expect(km).toBeLessThan(645);
  });
});

describe('coordsKey / isInBounds', () => {
  it('точки ближе ~1 м дают один ключ', () => {
    expect(coordsKey([37.123451, 55.123451])).toBe(coordsKey([37.123449, 55.123449]));
    expect(coordsKey([37.1234, 55.1234])).not.toBe(coordsKey([37.1235, 55.1234]));
  });

  it('проверяет попадание в границы', () => {
    const bounds: [[number, number], [number, number]] = [
      [37, 55],
      [38, 56],
    ];
    expect(isInBounds([37.5, 55.5], bounds)).toBe(true);
    expect(isInBounds([30, 59], bounds)).toBe(false);
  });
});

describe('groupByCoords', () => {
  it('объединяет точки с одинаковыми координатами в одну группу', () => {
    const items = [
      { id: 1, c: [37.1, 55.1] as [number, number] },
      { id: 2, c: [37.2, 55.2] as [number, number] },
      { id: 3, c: [37.1, 55.1] as [number, number] },
    ];
    const groups = groupByCoords(items, i => i.c);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.items.map(i => i.id)).toEqual([1, 3]);
    expect(groups[1]!.items.map(i => i.id)).toEqual([2]);
  });
});

describe('plural', () => {
  const forms = ['сервис', 'сервиса', 'сервисов'] as const;
  it.each([
    [1, 'сервис'],
    [2, 'сервиса'],
    [5, 'сервисов'],
    [11, 'сервисов'],
    [12, 'сервисов'],
    [21, 'сервис'],
    [22, 'сервиса'],
    [111, 'сервисов'],
  ])('%i → %s', (n, expected) => {
    expect(plural(n, forms)).toBe(expected);
  });
});

describe('format', () => {
  it('расстояние: метры до 1 км, дальше километры', () => {
    expect(formatDistance(0.347)).toBe('350 м');
    expect(formatDistance(12.345)).toBe('12,3 км');
  });

  it('длительность', () => {
    expect(formatDuration(540)).toBe('9 мин');
    expect(formatDuration(5400)).toBe('1 ч 30 мин');
    expect(formatDuration(7200)).toBe('2 ч');
  });
});
