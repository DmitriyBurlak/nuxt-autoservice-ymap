import type { Ref } from 'vue';
import type { TLngLat } from '~/src/5_shared/lib/geo';

import { useDrivingRoute } from '~/src/5_shared/ui/yandex-map';

/**
 * Маршрут «пользователь → выбранный автосервис». Строится по кнопке, дальше сам
 * перестраивается при перетаскивании метки «Я». Смена сервиса сбрасывает маршрут.
 */
export function useRouteToService(from: Ref<TLngLat>, to: Ref<TLngLat | null>) {
  const waypoints = computed<TLngLat[] | null>(() => (to.value ? [from.value, to.value] : null));

  const driving = useDrivingRoute(waypoints);

  watch(
    () => to.value?.join(','),
    () => driving.reset()
  );

  /** Ссылка на тот же маршрут в Яндекс.Картах (rtext — lat,lng через ~) */
  const yandexMapsUrl = computed(() => {
    if (!to.value) return null;
    const [fromLng, fromLat] = from.value;
    const [toLng, toLat] = to.value;
    return `https://yandex.ru/maps/?rtext=${fromLat},${fromLng}~${toLat},${toLng}&rtt=auto`;
  });

  return { ...driving, yandexMapsUrl };
}
