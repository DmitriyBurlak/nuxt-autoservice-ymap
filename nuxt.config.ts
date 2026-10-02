// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
    head: {
      title: 'Карта автосервисов',
      htmlAttrs: { lang: 'ru' },
      meta: [
        {
          name: 'description',
          content: 'Демо: Яндекс.Карты на Nuxt 4 — кластеры, тултипы, геолокация и маршрут до автосервиса',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' }],
    },
  },

  runtimeConfig: {
    public: {
      /** Ключ JS API 3.0 — без него карта не загрузится. env: NUXT_PUBLIC_YANDEX_MAPS_APIKEY */
      yandexMapsApikey: '',
      /** Ключ JS API 2.1 — нужен только для маршрутов через Яндекс. Пусто → маршрут строится через OSRM. */
      ymaps2Apikey: '',
    },
  },

  build: {
    transpile: ['vue-yandex-maps'],
  },

  vite: {
    optimizeDeps: { exclude: ['vue-yandex-maps'] },
  },

  colorMode: {
    preference: 'light',
  },

  fonts: {
    provider: 'bunny',
  },

  typescript: {
    strict: true,
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
});
