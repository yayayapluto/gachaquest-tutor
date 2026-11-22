# Deploy Cloudflare Pages

Deployment memakai Git integration. Push ke branch produksi = deploy. Tidak ada Actions, token, atau secret.

## Pengaturan di Cloudflare

1. Buka **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pilih repo `gachaquest-tutor`.
3. Preset: **Vite**.
4. Build command: `bun run build`.
5. Build output directory: `dist`.
6. Environment variable: `BUN_VERSION=1.3.14`.
7. Simpan dan deploy.

## Verifikasi setelah deploy

- Halaman utama merespons 200.
- `/assets/screens/05-hub.png` merespons 200 dengan `Content-Type: image/png`.
- `/assets/journey-flow-light.svg` merespons 200 dengan `Content-Type: image/svg+xml`.
- `/assets/screens/18-leaderboard.png` merespons 200.
- Tidak ada request 404 untuk aset di DevTools Network.

## Catatan lokal

- `public/assets/screens/` disalin Vite ke `dist/assets/screens/`.
- `public/_redirects` memberi fallback SPA ke `index.html`.
- `bun run smoke` membangun `dist/` lalu memeriksa 18 screenshot dan 2 diagram di dalam `dist/`.
