// Styles and images
import './style.css'
// Put the page content inside <div id="app">
document.querySelector('#app').innerHTML = `
  <main class="dog-app">
    <h1>Dog App 🐶</h1>

    <section class="dog-card">
      <img id="dog-image" alt="Random dog" />
      <div class="actions">
        <button id="next-btn" type="button">Next dog</button>
        <button id="save-btn" type="button">♥ Save</button>
      </div>
      <!-- Сюда пишем сообщения для пользователя (ошибки, "Сохранено") -->
      <p id="status"></p>
    </section>

    <section class="favorites">
      <h2>Favorites</h2>
      <div id="favorites-list"></div>
    </section>
  </main>
`

// ---------- Настройки ----------
// Ключ, под которым список избранного лежит в localStorage
const FAVORITES_KEY = 'dog-favorites'
// Имя кеша для сохранённых фото. Должно совпадать с PHOTOS_CACHE в service-worker.js.
// Это отдельный кеш: при обновлении приложения его не удаляем, иначе избранное пропадёт офлайн
const PHOTOS_CACHE = 'dog-photos-v1'

// ---------- Элементы страницы ----------
const image = document.querySelector('#dog-image')
const nextBtn = document.querySelector('#next-btn')
const saveBtn = document.querySelector('#save-btn')
const statusText = document.querySelector('#status')
const favoritesList = document.querySelector('#favorites-list')

// Показывает короткое сообщение под кнопками
function showStatus(text) {
  statusText.textContent = text
}

// ---------- Избранное: хранение ссылок (localStorage) ----------
// localStorage хранит только строки, поэтому массив превращаем в JSON и обратно.
// Здесь лежат только ССЫЛКИ на фото. Сами картинки для офлайна хранятся в Cache Storage (см. ниже)
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []
  } catch {
    return []
  }
}

// Список избранного в памяти. При запуске берём то, что осталось после прошлой сессии
let favorites = loadFavorites()

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

// ---------- Получение случайной собаки (Dog API) ----------
async function loadDog() {
  showStatus('')
  try {
    // Запрос в Dog API. await ждёт ответ сервера
    const response = await fetch('https://dog.ceo/api/breeds/image/random')
    // fetch не выбрасывает ошибку при ответе 404/500, поэтому проверяем response.ok сами
    if (!response.ok) {
      throw new Error('Request failed')
    }
    // Превращаем ответ в объект: { message: "ссылка на фото", status: "success" }
    const data = await response.json()
    image.src = data.message
  } catch (error) {
    // Сюда попадаем, если нет интернета (офлайн) или сервер ответил ошибкой
    console.error(error)
    showStatus('Не удалось загрузить новое фото. Проверь интернет.')
  }
}

// ---------- Избранное: добавление и удаление ----------
async function addFavorite() {
  const url = image.src
  if (!url) return
  if (favorites.includes(url)) {
    showStatus('Это фото уже в избранном')
    return
  }
  try {
    // Кладём саму картинку в Cache Storage, чтобы она открывалась без интернета.
    // cache.add() скачивает файл по ссылке и сохраняет ответ
    const cache = await caches.open(PHOTOS_CACHE)
    await cache.add(url)
  } catch (error) {
    // Если фото не закешировалось, в избранное не добавляем: офлайн оно бы не открылось
    console.error(error)
    showStatus('Не удалось сохранить фото. Проверь интернет.')
    return
  }
  favorites.push(url)
  saveFavorites()
  renderFavorites()
  showStatus('Сохранено ♥')
}

async function removeFavorite(url) {
  favorites = favorites.filter((item) => item !== url)
  saveFavorites()
  // Удаляем и картинку из кеша, чтобы он не разрастался
  const cache = await caches.open(PHOTOS_CACHE)
  await cache.delete(url)
  renderFavorites()
}

// ---------- Избранное: отображение ----------
// Перерисовывает список с нуля по массиву favorites
function renderFavorites() {
  favoritesList.innerHTML = ''

  if (favorites.length === 0) {
    favoritesList.textContent = 'Пока ничего нет. Нажми ♥ Save под фото.'
    return
  }

  favorites.forEach((url) => {
    const item = document.createElement('div')
    item.className = 'favorite-item'

    const img = document.createElement('img')
    img.src = url
    img.alt = 'Saved dog'
    img.loading = 'lazy'

    const removeBtn = document.createElement('button')
    removeBtn.type = 'button'
    removeBtn.textContent = '✕'
    removeBtn.setAttribute('aria-label', 'Remove from favorites')
    removeBtn.addEventListener('click', () => removeFavorite(url))

    item.append(img, removeBtn)
    favoritesList.append(item)
  })
}

// ---------- Запуск ----------
// Скобок у функции в addEventListener нет: мы передаём функцию, а не вызываем её сразу
nextBtn.addEventListener('click', loadDog)
saveBtn.addEventListener('click', addFavorite)

renderFavorites()
loadDog()

// ---------- Service Worker ----------
// Регистрируем файл service-worker.js. Он кеширует файлы приложения и фото из избранного
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch((error) => console.error(error))
  })
}
