import type { YMap } from '@yandex/ymaps3-types';
import type { TLngLat, TLngLatBounds } from '~/src/5_shared/lib/geo';

export type { TLngLat, TLngLatBounds, YMap };

export type TMapMarkerId = string | number;

/** Базовый маркер карты. Доменные данные виджеты кладут в наследников этого типа. */
export interface IMapMarker {
  id: TMapMarkerId;
  coordinates: TLngLat;
  draggable?: boolean;
  /** Выравнивание: pin — остриё в точке, center — центр элемента в точке (точки, кластеры). */
  anchor?: 'pin' | 'center';
  zIndex?: number;
  onClick?: () => void;
}

export type TMarkerDragEndPayload = {
  id: TMapMarkerId;
  coordinates: TLngLat;
};

export type TPinVariant = 'default' | 'selected' | 'premium';
