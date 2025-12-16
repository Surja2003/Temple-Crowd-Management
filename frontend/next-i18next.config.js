/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi'],
  },
  react: {
    useSuspense: false,
  },
  fallbackLng: {
    default: ['en'],
  },
  debug: false,
  serializeConfig: false,
  use: [],
};