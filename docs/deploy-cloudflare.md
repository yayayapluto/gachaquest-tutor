# Deploy Cloudflare Workers Builds

**URL produksi:** https://tutor-gachaquest.yyypluto.my.id/

Deployment memakai Git integration Cloudflare Workers Builds. Push ke branch produksi menjalankan build lalu deploy Worker aset statis. Tidak ada Actions, token, atau secret di repo.

## Pengaturan di Cloudflare

1. Buka **Workers & Pages** → **Create** → **Workers** → **Connect to Git**.
2. Pilih repo `gachaquest-tutor`.
3. Build command: `bun run build`.
4. Deploy command: `bunx wrangler deploy`.
5. Preview command: `bunx wrangler versions upload`.
6. Environment variable: `BUN_VERSION=1.3.14`.
7. Simpan dan deploy.

`wrangler.jsonc` mengarahkan Worker ke `dist` dan memakai `not_found_handling: single-page-application` untuk fallback SPA.

## Verifikasi setelah deploy

- Halaman utama merespons 200.
- `/assets/screens/05-hub.png` merespons 200 dengan `Content-Type: image/png`.
- `/assets/journey-flow-light.svg` merespons 200 dengan `Content-Type: image/svg+xml`.
- `/assets/screens/18-leaderboard.png` merespons 200.
- Tidak ada request 404 untuk aset di DevTools Network.

## Catatan lokal

- `public/assets/` disalin Vite ke `dist/assets/`.
- `bun run smoke` membangun `dist/` lalu memeriksa 18 screenshot dan 2 diagram di dalam `dist/`.
- Uji konfigurasi Worker tanpa upload: `bunx wrangler deploy --dry-run`.
