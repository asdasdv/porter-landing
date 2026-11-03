# Porter — лендинг

Лендинг-презентация концепта складского приложения Porter, где коробки возят роботы.
Ничего не продаёт: показывает продукт и ведёт в живое демо (репозиторий
[asdasdv/warehouse](https://github.com/asdasdv/warehouse), адрес https://warehouse.kaifparty.workers.dev/).

## Что внутри
- `site/` — сам сайт, обычные файлы без сборки: `index.html`, `landing.css`, `landing.js`, картинки в `img/`.
- `wrangler.jsonc` — настройки Cloudflare Worker `porter-landing`, который отдаёт папку `site/`.
- `worker.js` — пропускает через себя только `/video/*` и отдаёт ролики кусками (ответ 206 на `Range`): без этого
  Safari не воспроизводит видео. Остальные файлы Cloudflare отдаёт напрямую.

## Анимации
Заголовки появляются по словам из размытия, блоки проступают при прокрутке, скриншоты чуть увеличиваются
при наведении. Плавная прокрутка — библиотека Lenis 1.3.26 (лежит в `site/vendor/`, лицензия MIT) с теми же
настройками, что у Framer «Smooth Scroll» на intensity 20: `duration: 2`, кривая easeOutExpo. Если в системе включено
«уменьшить движение», анимации и плавная прокрутка выключены.

## Посмотреть у себя
```
cd site && python3 -m http.server 4180
```
Затем открыть http://127.0.0.1:4180.

## Выкладка на Cloudflare
Workers Builds, привязанный к этому репозиторию: корневая папка — корень репозитория, команда сборки не нужна,
команда выкладки — `npx wrangler deploy`. Выкладывается ветка, выбранная в настройках Workers Builds как production
(на 3 ноября 2026 это `light-style`, не `main`); остальные ветки получают preview-адреса вида
`<ветка>-porter-landing.kaifparty.workers.dev`. Кнопка «Try demo» ведёт на постоянный адрес демо
https://warehouse.kaifparty.workers.dev/, не на preview-адрес ветки.
`site/_headers` задаёт кэширование видео и картинок на сутки.
Адрес: https://porter-landing.kaifparty.workers.dev/
