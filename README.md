# Aqualume — immersive aquarium shop

Static site, no build step. Open with any static server:

    npm install
    npm run dev

then visit http://localhost:5188.

## Structure
- `index.html` — page layout
- `css/style.css` — all styles (colour tokens at the top)
- `public/js/data.js` — **edit this** for products, prices, categories, video hotspots, builder rules
- `public/js/main.js` — interactions (loader, scroll-driven scenes, hotspots, cart, tank builder)

## Videos
The three scene videos stream from Pexels (free licence). To use your own footage,
change `data-src` / `data-src-4k` / `poster` on each `<video>` in `index.html`
(e.g. `assets/videos/planted.mp4`).

## Making hotspots follow real fish
1. Open `http://localhost:5188/?track` (or press Shift+T).
2. Pick a fish hotspot, scroll to its scene, then hold the mouse button on the fish
   and follow it while the video plays.
3. Click **Copy JSON** and paste each entry as `path: [...]` on the matching hotspot
   in `public/js/data.js` (keys look like `planted:3` = scene name : hotspot index).
Recorded paths are also kept in the browser's localStorage while you work.
