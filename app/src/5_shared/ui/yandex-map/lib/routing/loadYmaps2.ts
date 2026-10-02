import type { Ymaps2 } from '../../model';

let readyPromise: Promise<Ymaps2> | null = null;

/**
 * Лениво подключает JS API 2.1 (нужен только ради MultiRoute). Скрипт грузится один раз,
 * при первом построении маршрута; повторные вызовы возвращают тот же промис.
 */
export function loadYmaps2(apikey: string): Promise<Ymaps2> {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise<Ymaps2>((resolve, reject) => {
    if (window.ymaps) {
      const ymaps = window.ymaps;
      ymaps.ready(() => resolve(ymaps));
      return;
    }

    window.__ymaps2OnLoad = () => {
      const ymaps = window.ymaps;
      if (ymaps) ymaps.ready(() => resolve(ymaps));
      else reject(new Error('Yandex Maps 2.1: window.ymaps не найден после загрузки'));
    };

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apikey)}&lang=ru_RU&onload=__ymaps2OnLoad`;
    script.async = true;
    script.onerror = () => {
      readyPromise = null;
      reject(new Error('Не удалось загрузить Yandex Maps 2.1'));
    };
    document.head.appendChild(script);
  });

  return readyPromise;
}
