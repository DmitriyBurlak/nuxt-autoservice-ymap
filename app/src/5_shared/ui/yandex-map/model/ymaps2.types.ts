/**
 * Минимальные типы Yandex Maps JS API 2.1 — используется только модуль маршрутизации MultiRoute,
 * которого нет в API 3.0.
 */

/** Координаты в формате API 2.1: [широта, долгота] */
export type TLatLng = [lat: number, lng: number];

export interface Ymaps2 {
  ready: (cb: () => void) => void;
  Map: new (el: HTMLElement, opts: { center: number[]; zoom: number }) => Ymaps2MapInstance;
  modules: { require: (names: string[], callback: (...modules: unknown[]) => void) => void };
}

export interface Ymaps2MapInstance {
  geoObjects: { add: (o: unknown) => void; remove?: (o: unknown) => void };
  destroy?: () => void;
}

export interface MultiRouteParams {
  referencePoints: number[][];
  results?: number;
}

export interface MultiRouteInstance {
  events?: { add: (event: string, handler: () => void) => void };
  destroy?: () => void;
}

declare global {
  interface Window {
    ymaps?: Ymaps2;
    __ymaps2OnLoad?: () => void;
  }
}
