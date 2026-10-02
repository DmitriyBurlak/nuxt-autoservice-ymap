import type { TLngLat } from '~/src/5_shared/lib/geo';

export type TLocationStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported';

const GEOLOCATION_TIMEOUT_MS = 8_000;

/**
 * Местоположение пользователя. Пока геолокация не получена (или запрещена) — используется
 * точка по умолчанию, и позиция помечается как примерная. Метку можно перетащить вручную.
 */
export function useUserLocation(fallback: TLngLat) {
  const coordinates = ref<TLngLat>(fallback);
  const status = shallowRef<TLocationStatus>('idle');
  const isManual = shallowRef(false);

  const isApproximate = computed(() => status.value !== 'granted' && !isManual.value);

  function locate(): Promise<TLngLat | null> {
    if (!('geolocation' in navigator)) {
      status.value = 'unsupported';
      return Promise.resolve(null);
    }

    status.value = 'locating';
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          coordinates.value = [coords.longitude, coords.latitude];
          status.value = 'granted';
          isManual.value = false;
          resolve(coordinates.value);
        },
        () => {
          status.value = 'denied';
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 60_000 }
      );
    });
  }

  function setManual(next: TLngLat) {
    coordinates.value = next;
    isManual.value = true;
  }

  return { coordinates, status, isApproximate, locate, setManual };
}
