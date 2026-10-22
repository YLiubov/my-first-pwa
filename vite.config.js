// Vite settings
import { defineConfig } from 'vite'

export default defineConfig({
    // "/" means the site runs from the root of the domain
    base: '/',

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