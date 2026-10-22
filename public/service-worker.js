
// Кеш с файлами приложения (HTML, JS, CSS, иконки).
// Меняй имя (v3, v4...) при каждом обновлении приложения: так браузер скачает свежие файлы
const CACHE_NAME = "pwa-v4";

// Кеш с фото из избранного. Имя НЕ меняем и не удаляем при обновлении.
// Должно совпадать с PHOTOS_CACHE в src/main.js
const PHOTOS_CACHE = "dog-photos-v1";

// Фото собак лежат на этом домене
const DOG_IMAGES_HOST = "images.dog.ceo";

// Files saved for offline use
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Save files in the cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES);
    })
  );
});

// Когда новая версия SW включается, удаляем СТАРЫЕ кеши приложения (pwa-v1, pwa-v2...).
// Кеш с фото (dog-photos-v1) не трогаем: он не начинается с "pwa-"
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith("pwa-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

// Перехватываем все запросы страницы
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Фото собак: если фото сохранено в избранном, отдаём из кеша (работает офлайн).
  // Если нет, идём в сеть, но новые фото в кеш НЕ кладём: в кеш попадают только сохранённые
  if (url.hostname === DOG_IMAGES_HOST) {
    event.respondWith(
      caches.open(PHOTOS_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => cached || fetch(event.request))
      )
    );
    return;
  }

  // Остальные чужие адреса (например dog.ceo/api) не трогаем
  if (url.origin !== self.location.origin) return;

  // Файлы приложения: сначала кеш, если нет, то сеть и сохраняем копию

  event.respondWith(
    // проверка кеша
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        // копия для кеша, чтобы использовать её при следующем запросе, потому что ответ можна прочитать только один раз
        const copy = networkResponse.clone();
        // запись копии в кеш cache.put()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return networkResponse;
      });
    })
  );
});
