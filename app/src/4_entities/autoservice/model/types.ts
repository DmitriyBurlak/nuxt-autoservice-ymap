import type { TLngLat } from '~/src/5_shared/lib/geo';

export type TServiceCategory = 'tires' | 'maintenance' | 'body' | 'diagnostics' | 'wash' | 'electrics';

export interface IWorkingHours {
  /** Минуты от полуночи: 480 = 08:00 */
  openMinutes: number;
  closeMinutes: number;
  isAroundTheClock: boolean;
}

export interface IAutoservice {
  id: number;
  name: string;
  address: string;
  coordinates: TLngLat;
  /** 1.0–5.0 */
  rating: number;
  reviewsCount: number;
  services: TServiceCategory[];
  /** Цена «от», ₽ */
  priceFrom: number;
  workingHours: IWorkingHours;
  phone: string;
  /** Премиум-партнёр — звезда на пине и в карточке */
  isPremium: boolean;
  /** Название автокомплекса, если в одной точке несколько сервисов */
  complexName: string | null;
}

export const SERVICE_CATEGORIES: Record<TServiceCategory, { label: string; icon: string }> = {
  tires: { label: 'Шиномонтаж', icon: 'i-lucide-circle-dot' },
  maintenance: { label: 'ТО и ремонт', icon: 'i-lucide-wrench' },
  body: { label: 'Кузовной ремонт', icon: 'i-lucide-paint-roller' },
  diagnostics: { label: 'Диагностика', icon: 'i-lucide-gauge' },
  wash: { label: 'Мойка', icon: 'i-lucide-droplets' },
  electrics: { label: 'Автоэлектрика', icon: 'i-lucide-zap' },
};

export const SERVICE_CATEGORY_KEYS = Object.keys(SERVICE_CATEGORIES) as TServiceCategory[];
