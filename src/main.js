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
    </section>

    <section class="favorites">
      <h2>Favorites</h2>
      <div id="favorites-list"></div>
    </section>
  </main>
`

const image = document.querySelector('#dog-image')
const nextBtn = document.querySelector('#next-btn')

async function loadDog() {
  try {
    // отправляет запрос в Dog API. Мы пишем await, потому что нужно дождаться ответа.
    const response = await fetch('https://dog.ceo/api/breeds/image/random')
    // проверяет, что сервер ответил успешно. Если нет, мы сразу прыгаем в catch.
    if (!response.ok) {
      throw new Error('Request failed')
    }

    // превращает ответ в обычный объект JavaScript. Тоже нужен await.
    const data = await response.json()
    // показывает фото на странице / это ссылка на фото. Я видела её в JSON: 
    image.src = data.message
  } catch (error) {
    console.error(error)
  }
}
// в конце запускает функцию один раз при открытии страницы
loadDog()
// запускает её при каждом клике. Скобок у loadDog здесь нет
nextBtn.addEventListener('click', loadDog)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch((error) => console.error(error))
  })
}
