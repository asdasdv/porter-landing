# Ролики для лендинга

Короткие зацикленные ролики (до 10 с) для блоков Receive, Find, Ship. Снимаются в живом демо
https://warehouse.kaifparty.workers.dev/ и монтируются в Remotion.

## Как устроено
1. **Запись** — `node record-receive.mjs` (и `record-find.mjs`, `record-ship.mjs`). Playwright открывает демо в Chromium
   с `--force-device-scale-factor=2` и снимает кадры через screencast Chrome (2880×1800, ~50–60 к/с): `lib/capture.mjs`.
   Мышь движется плавно (`lib/director.mjs`), каждое событие пишется в `raw/<имя>.json`. Встроенная запись Playwright
   (`recordVideo`) не подходит: она 1x и 25 к/с.
2. **Монтаж** — `src/Clip.jsx` + `src/scenes/<имя>.js`: куски записи с разной скоростью, плавные приближения камеры,
   курсор, нарисованный по логу, растворение в первый кадр для бесшовного повтора.
3. **Рендер** — `node render.mjs Receive receive`: мастер 1920×1200 60 к/с, затем для сайта MP4 (H.264) и WebM (VP9)
   шириной 1600 px без звука и постер JPEG → `out/`.

Перед рендером скопировать запись и лог в `public/` (так делают шаги выше: `cp raw/receive.mp4 raw/receive.json public/`
и первый кадр `public/receive-first.png`). Время в `src/scenes/*.js` — секунды сырой записи: после пересъёмки сверить
с логом (моменты кликов).

Нужно: Node, `npm install`, `npx playwright install chromium`, FFmpeg (Homebrew).
