import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: [
    'en', // English
    'hi', // Hindi
    'bn', // Bengali
    'te', // Telugu
    'mr', // Marathi
    'ta', // Tamil
    'gu', // Gujarati
    'ur', // Urdu
    'kn', // Kannada
    'or', // Odia
    'ml', // Malayalam
    'pa', // Punjabi
    'as', // Assamese
  ],
  defaultLocale: 'en',
  localePrefix: 'always' // URL hamesha /en/... /hi/... rahegi
})