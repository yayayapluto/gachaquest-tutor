# Plan — Web Tutor GachaQuest

Status: **menunggu persetujuan** (belum ada implementasi).
Tanggal: 2026-11-22.

## 1. Tujuan

Satu halaman web statis yang menuntun tiap anggota tim GachaQuest dari membaca
panduan sampai menghasilkan expected result yang bisa dibuktikan. Alur wajib:

1. Pilih nama anggota (P1–P5).
2. Lihat journey pengerjaan dari awal sampai selesai, per fase, per milestone.

Web bersifat interaktif: klik milestone untuk detail, tandai selesai, progres
tersimpan, expected result tampil sebagai teks + screenshot target.

## 2. Non-tujuan

- Bukan pengganti repo panduan. Semua isi panduan tetap di `1-Panduan-GachaQuest/docs/`.
- Tidak ada backend, login, database, atau build tool. Tanpa dependency eksternal.
- Tidak menyentuh `GachaQuest/` dan tidak menulis ke dua repo sumber.

## 3. Sumber data (read-only)

| Sumber | Dipakai untuk |
|---|---|
| `../1-Panduan-GachaQuest/docs/panduan-0-git-dan-kompilasi.md` | fase fondasi: alat, clone, branch, commit, PR, tag, build/test |
| `../1-Panduan-GachaQuest/docs/panduan-P1-scaffold-ui.md` (Milestone 1–7) | journey P1 |
| `../1-Panduan-GachaQuest/docs/panduan-P2-dungeon.md` (Milestone 1–6) | journey P2 |
| `../1-Panduan-GachaQuest/docs/panduan-P3-battle-player.md` (Milestone 1–6) | journey P3 |
| `../1-Panduan-GachaQuest/docs/panduan-P4-gacha-inventory.md` (Langkah 1–7) | journey P4 |
| `../1-Panduan-GachaQuest/docs/panduan-P5-shop-storage.md` (Milestone 1–6) | journey P5 |
| `../1-Panduan-GachaQuest/docs/PEMBAGIAN-TUGAS.md` | peran, file milik, fase F0–F4, DoD, pemetaan materi |
| `../1-Panduan-GachaQuest/docs/screens.md` | nama 18 layar target |
| `../2-Expected-Result-GachaQuest/docs/screens/*.png` | bukti visual expected result (disalin ke `assets/screens/`) |

Nama anggota belum ada di dokumen mana pun; identitas yang dipakai adalah kode
peran P1–P5 beserta perannya. Plan ini tidak mengarang nama orang.

## 4. Struktur deliverable

```
Web-Tutor-GachaQuest/
  index.html            # tiga layar dalam satu dokumen (picker, journey, lightbox)
  styles.css            # token warna/tipe/spasi + layout
  app.js                # render data, navigasi, progres localStorage
  data/journey.js       # window.JOURNEY — data journey P1–P5 (bukan fetch, agar file:// jalan)
  assets/screens/*.png  # 18 screenshot target, disalin dari repo expected result
  docs/plan-web-tutor.md
```

`data/journey.js` dipilih, bukan `journey.json`, karena `fetch()` atas `file://`
gagal di Chrome. Satu `<script>` menetapkan `window.JOURNEY`.

## 5. Model data

```js
window.JOURNEY = {
  members: [{
    code: "P2",                       // kode peran
    role: "Dungeon",
    level: "mahir",                   // dari tabel Peran
    branch: "feat/dungeon",
    filesOwned: ["src/dungeon/dungeon.c", "..."],
    panduan: { title: "...", href: "../1-Panduan-GachaQuest/docs/panduan-P2-dungeon.md" },
    screenings: [ 16 ],               // nomor layar target
    drivers: ["bin/t_dungeon"],
    scenarios: ["S12","S13","S14","S16"],
    phases: [{
      id: "F0", title: "Fondasi", tag: "contract-v1",
      steps: [{
        id: "p2-m1",
        title: "Baca kontrak dan test",
        anchor: "#milestone-1--baca-kontrak-dan-test",
        materi: ["Pertemuan 7: perulangan bersarang"],   // dari Pemetaan Materi
        baca: ["dungeon.h", "tests/t_dungeon.c"],        // yang dibaca
        kerja: ["..."],                                  // langkah kerja
        command: null,                                    // opsional, ada tombol copy
        expected: { text: "...", screens: [] },           // blok Expected asli
        bukti: "..."                                      // syarat tandai selesai
      }]
    }]
  }]
}
```

Aturan isi:

- Satu step = satu milestone/ langkah di panduan. Judul step memakai judul asli.
- `expected.text` disalin dari blok `Expected` panduan; tidak ditulis ulang.
- `anchor` memakai heading panduan agar tautan langsung ke bagian yang dibaca.
- Step terakhir tiap anggota = Definition of Done + PR ke `dev` (dari
  `panduan-0` langkah 6–7 dan Larangan/DoD modul).

## 6. Journey per anggota (jumlah step nyata)

| Anggota | Peran | Fase | Step |
|---|---|---|---|
| P1 | UI, platform, integrator | F0 fondasi → F1 UI → F3 integrasi → F4 rilis | 10 langkah `panduan-0` + M1–M7 + DoD |
| P2 | Dungeon | F0 fondasi → F2 modul → F3 merge → F4 skenario | 10 + M1–M6 + DoD |
| P3 | Battle & player | idem P2 | 10 + M1–M6 + DoD |
| P4 | Gacha & inventory | idem P2 | 10 + Langkah 1–7 + DoD |
| P5 | Shop, storage, leaderboard | idem P2 | 10 + M1–M6 + DoD |

F0 dipakai bersama (fondasi repo, branch, commit, PR) lalu bercabang ke fase
milik anggota. Tag fase ditampilkan sebagai penanda (`contract-v1`, `ui-ready`,
`integrasi`, `rilis`) sesuai `PEMBAGIAN-TUGAS.md`.

Expected result per anggota:

| Anggota | Driver | Skenario | Layar target |
|---|---|---|---|
| P1 | `bin/t_platform` | — | 01–05, 17 (menu, game baru, load, hub, simpan) |
| P2 | `bin/t_dungeon` | S12, S13, S14, S16 | 16 |
| P3 | `bin/t_player`, `bin/t_battle` | battle/player | 06, 07, 08 |
| P4 | `bin/t_gacha`, `bin/t_inventory` | gacha/inventory | 09–13 |
| P5 | `bin/t_storage`, `bin/t_leaderboard` | storage/shop | 14, 15, 18 |

## 7. Layar dan interaksi

**Layar 1 — Pilih anggota.** Lima kartu besar (P1–P5): kode, peran, level,
daftar file milik, jumlah step, cincin progres. Klik kartu → layar 2. Tombol
`1`–`5` di keyboard memilih kartu.

**Layar 1b — Nama.** Setelah kartu anggota dipilih, panel kecil bertanya
`Halo! Siapa nama kamu?` dengan satu input teks (maks. 24 karakter) dan tombol
`Mulai journey`. Nama disimpan per anggota; kosong → pakai kode peran. Nama
dipakai untuk sapaan beranda dan header journey: `Halo, Farros — P2 Dungeon`.
Nama bisa diubah dari header (`Ganti nama`) tanpa menimpa progres.

**Layar 2 — Journey.** Tiga kolom di desktop lebar:

- Kiri: timeline fase F0→F4, tiap fase berisi daftar milestone dengan status
  (selesai / sekarang / belum). Klik = buka detail.
- Tengah: detail step — judul, fase, materi kuliah terkait, "Baca dulu" (tautan
  ke panduan + anchor), langkah kerja, perintah dengan tombol Salin, blok
  Expected, tombol `Tandai selesai`.
- Kanan: konteks anggota — peran, branch, file milik, larangan (dari bagian
  Larangan panduan), target akhir (driver, skenario, layar) dengan thumbnail
  screenshot yang bisa dibuka besar.

Header: nama anggota + peran, progress bar total, tombol `Ganti anggota`,
`Reset progres`.

**Layar 3 — Expected result.** Lightbox gambar screenshot penuh dengan nomor
layar + deskripsi, navigasi panah, `Esc` menutup.

Interaksi minimum yang dikerjakan: pilih anggota, pindah step, tandai selesai,
copy perintah, buka expected result, reset progres, keyboard (`1–5`, `Esc`,
`←/→` di lightbox). Tanpa animasi berat; hanya transisi 150–200ms.

## 8. Desain visual (desktop 100%, UI besar)

- Target utama 1920×1080 dan 1440×900, tetap utuh di 1280 lebar (grid
  `18rem timeline | 1fr detail | 20rem konteks`).
- Responsif penuh sampai phone 360px. Titik patah:
  - `≥1200px`: tiga kolom seperti di atas.
  - `900–1199px`: dua kolom (timeline kiri, detail kanan); konteks anggota
    jadi panel lipat di bawah detail.
  - `<900px`: satu kolom. Timeline jadi stepper horizontal yang bisa digeser,
    detail step mengalir penuh, header menempel di atas. Konteks anggota jadi
    bagian akordeon setelah detail.
- Di phone: kartu anggota satu per baris, semua kontrol sentuh minimal 44×44px,
  teks tetap 18px body (tidak diperkecil), tidak ada scroll horizontal di 360px.
- Skala tipe lebih besar dari default: body 18px, judul layar 40–56px,
  judul step 28px, metadata 14px. Line-height 1.5 untuk teks baca.
- Token di `:root`: latar gelap netral, aksen gacha (emas/ungu) untuk progres dan
  rarity, teks utama kontras ≥ 7:1, teks sekunder ≥ 4.5:1. Diverifikasi lewat
  `check_contrast` sebelum dinyatakan selesai.
- Kartu anggota memakai kode besar (72px) sebagai jangkar visual, bukan emoji.
- Status memakai label teks + ikon bentuk (siram/centang), bukan warna saja.

## 9. State dan persistensi

- `localStorage` key `gachaquest-tutor-v1`:
  `{ "names": { "P2": "Farros" }, "done": { "P2": ["p2-m1", "p2-m2"] } }`.
- Nama kosong tidak disimpan; sapaan jatuh ke kode peran (`Halo, P2`).
- Progres = jumlah step selesai / total step anggota; cincin dan bar memakai
  angka yang sama.
- Reset progres anggota meminta konfirmasi inline (bukan `confirm()`), bisa
  dibatalkan.
- Tanpa data storage: semua step belum selesai, web tetap jalan.

## 10. Verifikasi

1. Buka `index.html` langsung (file://) di Chromium; tiga layar tampil.
2. Pilih P2: timeline F0–F4 tampil, step M1–M6 ada, klik step mengganti detail.
3. Tandai 2 step → reload → status tetap, bar progres naik sesuai hitungan.
4. Tombol salin menaruh perintah di clipboard.
5. Expected result P2 menampilkan screenshot layar 16; lightbox buka/tutup.
6. Cek 1280×800, 1440×900, 1920×1080: tidak ada scroll horizontal, teks tidak
   terpotong.
7. Cek responsif 768×1024 (tablet) dan 360×740 (phone): layout menyusut sesuai
   §8, timeline jadi stepper, tidak ada scroll horizontal, kontrol sentuh ≥44px.
8. Isi nama "Farros" untuk P2 → header journey menampilkan `Halo, Farros`; reload
   → nama tetap; reset progres tidak menghapus nama.
9. Tab-only: semua kontrol bisa difokus, focus ring terlihat; `Esc`/`←/→` jalan.
10. `check_contrast` untuk pasangan warna teks/latar utama dan tombol.
11. Semua tautan panduan menunjuk file yang benar-benar ada.

## 11. Urutan implementasi

| Tahap | Kerja | Selesai bila |
|---|---|---|
| 1 | `data/journey.js` untuk P1–P5 | 5 anggota, jumlah step sesuai §6, tiap step punya baca/kerja/expected/bukti |
| 2 | `index.html` + `styles.css` shell + token + titik patah responsif | layout 3 kolom utuh di 1440, 1 kolom utuh di 360 |
| 3 | `app.js`: picker, input nama, timeline, detail, lightbox | pindah anggota/step tanpa reload, sapaan pakai nama, tanpa error konsol |
| 4 | progres + copy + reset + keyboard | reload mempertahankan status dan nama, shortcut jalan |
| 5 | salin screenshot, tautan panduan | 18 gambar tampil, semua tautan resolve |
| 6 | verifikasi §10 | seluruh butir lulus, hasil dicatat |

## 12. Risiko dan keputusan

- **Screenshot besar.** 18 PNG dari repo expected result bisa berat. Disalin
  apa adanya dulu; `loading="lazy"` + thumbnail `max-height` di kartu. Kompres
  hanya kalau ukuran total > 8 MB.
- **Anchor panduan.** Slug heading GitHub untuk heading dengan `—` dan kode
  perlu dicocokkan manual; tautan yang tidak resolve diganti ke file tanpa
  anchor.
- **Nama anggota.** Tidak ada di sumber, jadi diisi pengguna di layar 1b. Input
  di-trim, maksimal 24 karakter, disimpan per kode peran; tidak dipakai untuk
  apa pun selain sapaan.
- **Git.** Direktori diinisialisasi sebagai repo git atas perintah pengguna.
  Commit mikro per tahap pekerjaan (plan, data, shell, app, aset, verifikasi).
  Push ke repo publik baru hanya setelah seluruh pekerjaan selesai dan
  diverifikasi; sebelum itu semua kerja tetap lokal.

## Decisions 2026-11-22

Anotasi Plannotator putaran 1:

1. **Responsif wajib, termasuk tablet dan phone.** Layout tidak boleh berhenti
   di desktop. §8 sekarang memuat titik patah ≥1200 / 900–1199 / <900, satu
   kolom di 360px, kontrol sentuh ≥44px, tanpa scroll horizontal. §10 menambah
   uji 768×1024 dan 360×740. Urutan implementasi tahap 2 memuat titik patah.
2. **Input nama setelah pilih anggota.** Layar 1b menanyakan nama, disimpan per
   anggota di `localStorage` (`names`), dipakai sebagai sapaan (`Halo, Farros`)
   di beranda dan header journey. Nama bisa diganti tanpa menghapus progres;
   kosong → fallback kode peran. §7, §9, §10, §12 diperbarui.
