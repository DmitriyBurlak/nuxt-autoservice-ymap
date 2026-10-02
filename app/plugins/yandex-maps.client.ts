import { createYmapsOptions } from 'vue-yandex-maps';

/**
 * Настройка Яндекс.Карт 3.0. Вместо готового nuxt-модуля vue-yandex-maps — свой плагин:
 * модуль падает без ключа, а нам нужно показать понятную заглушку «нужен ключ».
 * Сам скрипт API подгружается при монтировании первой карты.
 */
export default defineNuxtPlugin(() => {
  const { yandexMapsApikey } = useRuntimeConfig().public;
  if (!yandexMapsApikey) {
    console.warn('[ymaps3] NUXT_PUBLIC_YANDEX_MAPS_APIKEY не задан — карта не будет загружена');
    return;
  }

  createYmapsOptions({
    apikey: yandexMapsApikey,
    lang: 'ru_RU',
    initializeOn: 'onComponentMount',
  });
});
