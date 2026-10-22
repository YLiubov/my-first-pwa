// Vite settings
import { defineConfig } from 'vite'

export default defineConfig({
    // Сайт на GitHub Pages живёт в подпапке /my-first-pwa/, поэтому base должен совпадать с именем репозитория
    base: '/my-first-pwa/',

    // Порт для npm run dev. Свой у каждого проекта, чтобы Service Worker и кеш не смешивались
    server: {
        port: 5190,
        strictPort: true,
    },

    // Порт для npm run preview (проверка production-сборки)
    preview: {
        port: 4190,
        strictPort: true,
    },
})