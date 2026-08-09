# Detak Detik

Web app edukasi untuk membantu anak-anak belajar membaca jam analog. Banyak anak sekarang hanya terbiasa dengan jam digital dan kesulitan membaca jam analog — app ini mengatasi itu dengan interaksi drag-and-sync yang langsung memberi feedback visual dan suara.

## Konsep Inti

User (anak-anak) menggeser jarum jam dan jarum menit pada jam analog. Setiap perubahan posisi jarum langsung tersinkronisasi secara real-time dengan:
1. Tampilan jam digital (format HH:MM)
2. Bacaan waktu dalam bentuk kata berbahasa Indonesia (misal: "jam tiga lewat lima belas menit", "setengah empat", "jam delapan kurang sepuluh")
3. Suara/ucapan (text-to-speech) yang membacakan waktu tersebut

## Tech Stack

- **Svelte** + **Vite** — framework utama
- **SVG** untuk render jam analog (bukan Canvas, agar mudah styling & interaktif per elemen)
- **Web Speech API** (`SpeechSynthesisUtterance`) untuk text-to-speech, voice `id-ID` — tidak butuh API key/backend
- **Frontend-only**, tanpa backend/database — semua logic waktu & konversi teks di client-side
- **localStorage** untuk menyimpan posisi jarum terakhir (jam & menit), di-load otomatis saat app dibuka kembali
- Deploy target: **GitHub Pages**, via **GitHub Actions** (auto-deploy setiap push ke `main`)
- **Mobile-friendly** — layout & interaksi drag harus nyaman dipakai di HP/tablet (touch target besar, responsive layout)

## Struktur Project

```
src/
  lib/
    AnalogClock.svelte   # SVG jam + drag logic untuk jarum jam & menit
    DigitalClock.svelte  # Tampilan digital HH:MM
    TimeToWords.svelte   # Konversi angka jam/menit → teks Bahasa Indonesia (mode formal & casual)
    Speech.js            # Wrapper Web Speech API (cek voice id-ID, fallback teks)
    ThemeToggle.svelte   # Toggle dark/light mode
    storage.js           # Wrapper localStorage (save/load posisi jarum)
  App.svelte
  main.js
  app.css                # CSS variables untuk tema dark/light
vite.config.js           # set `base` sesuai nama repo untuk GitHub Pages
```

## Fitur (Prioritas Pengembangan)

### Fase 1 — Inti
- [ ] Jam analog SVG dengan jarum jam & menit yang bisa di-drag (pointer events: `pointerdown`, `pointermove`, `pointerup`) — support touch events untuk mobile
- [ ] Sinkronisasi real-time ke jam digital
- [ ] Snap jarum menit ke kelipatan 5 menit (mode mudah, default)
- [ ] Dark/light mode toggle, menggunakan CSS variables agar mudah di-switch
- [ ] Simpan posisi jarum (jam & menit) ke localStorage setiap kali berubah, dan load otomatis saat app pertama dibuka
- [ ] Layout portrait yang rapi di mobile — jam analog, jam digital, teks bacaan, dan kontrol harus muat tanpa scroll berlebihan

### Fase 2 — Bacaan & Suara
- [ ] Logika konversi waktu → teks Bahasa Indonesia, dengan **2 gaya bahasa yang bisa dipilih user**:
  - **Formal**: "jam dua belas lebih lima belas menit", "jam tiga lebih tiga puluh menit", "jam delapan kurang sepuluh menit"
  - **Casual**: "jam dua belas seperempat", "setengah empat", "jam delapan kurang sepuluh"
  - Simpan preferensi gaya bahasa (formal/casual) di localStorage juga
  - Edge case penting: jam 12 (bukan "jam nol"), dan logika "kurang" (misal 11:50 → "jam dua belas kurang sepuluh", bukan "jam sebelas lewat lima puluh")
- [ ] Integrasi Web Speech API, cek ketersediaan voice `id-ID` via `speechSynthesis.getVoices()`
- [ ] Fallback: tampilkan teks besar jika voice Indonesia tidak tersedia; sembunyikan kontrol suara sepenuhnya jika `SpeechSynthesis` tidak didukung browser sama sekali
- [ ] **Tombol putar ulang suara** — suara tidak hanya auto-play sekali, user (anak) bisa memutar ulang kapan saja
- [ ] **Toggle suara on/off** — berguna untuk konteks kelas/ruang publik

### Fase 3 — Mode Kuis (opsional, iterasi lanjut)
- [ ] Tampilkan target jam dalam digital/kata, anak diminta atur jarum analog agar sesuai
- [ ] Feedback visual + suara saat jawaban benar/salah
- [ ] Mode bebas per menit (bukan snap 5 menit) untuk level lebih sulit

### Opsional — PWA
- [ ] Manifest + icon sederhana agar bisa "Add to Home Screen" di HP

## Prinsip Desain (untuk audiens anak-anak)

- **Interface harus playful** — bukan tampilan edukasi yang kaku/formal. Elemen konkret:
  - Karakter maskot kecil (opsional tapi disarankan) yang bereaksi saat jawaban benar di mode kuis
  - Warna-warna cerah dan hangat, bukan palet korporat/minimalis dingin
  - Micro-animasi: jarum yang "mantul" halus (bounce) saat dilepas setelah snap, tombol yang membesar sedikit saat ditekan (tap feedback)
  - Font yang ramah anak — rounded/playful, bukan font serius/formal
  - Highlight visual saat jarum digeser: angka jam yang "ditunjuk" ikut membesar/berubah warna sesaat
  - Animasi transisi halus (bukan patah-patah) saat snap ke kelipatan 5 menit
- Warna kontras tinggi, angka besar di jam analog
- Jarum tebal dan area drag yang cukup besar (touch-friendly untuk tablet/HP)
- Feedback instan — jangan ada delay antara drag dan update sync
- Hindari teks/istilah teknis; gunakan bahasa yang akrab untuk anak-anak
- Layout responsive, prioritaskan pengalaman mobile (banyak anak akan pakai HP/tablet, bukan desktop)
- Pastikan kontras warna tetap nyaman di kedua mode (dark & light), terutama untuk jarum jam dan angka

## Catatan Development

- Gunakan Svelte reactivity (`$:`) untuk sinkronisasi otomatis antara state jarum (`hours`, `minutes`) dan tampilan turunannya (digital clock, teks, trigger suara) — hindari state management tambahan yang tidak perlu untuk app sesederhana ini.
- Drag logic sebaiknya dibungkus sebagai Svelte action (`use:draggable`) agar reusable antara jarum jam dan jarum menit.
- Saat build untuk GitHub Pages, pastikan `base` di `vite.config.js` sesuai path repo (misal `/detak-detik/`), atau gunakan custom domain jika ada.
- Jangan tambahkan backend atau database — semua state cukup di client-side.
- Untuk dark/light mode, gunakan CSS custom properties (variables) di `app.css`, toggle class di `<html>` atau `<body>`, dan simpan preferensi tema di localStorage juga agar konsisten dengan preferensi terakhir user.
- Untuk drag di mobile, pastikan pointer events (bukan hanya mouse events) sudah menangani touch dengan baik — test di viewport kecil sejak awal, jangan jadi setelan terakhir.
- Setup GitHub Actions workflow (`.github/workflows/deploy.yml`) untuk build & deploy otomatis ke GitHub Pages setiap push ke `main`.
- Selalu cek `typeof window.speechSynthesis !== 'undefined'` sebelum memakai Web Speech API — jangan asumsikan selalu tersedia, terutama di browser lama atau beberapa browser mobile.
