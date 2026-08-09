# ⏰ Detak Detik

**Yuk belajar membaca jam dengan cara yang seru! 🎉**

Detak Detik adalah aplikasi web yang mengajak anak-anak belajar membaca jam analog sambil bermain. Geser jarumnya, dengar suaranya, dan lihat matahari atau bulan berpindah tempat sesuai waktu yang kamu buat!

🔗 **Coba sekarang:** [rendicahya.github.io/detak-detik](https://rendicahya.github.io/detak-detik/)

---

## 🕹️ Cara Main

1. **Geser jarum jam ⏱️** — Sentuh dan tarik jarum pendek (jarum jam) atau jarum panjang (jarum menit) di jam analog, lalu lihat jam digital dan bacaannya berubah otomatis.
2. **Dengarkan waktunya 🔊** — App akan membacakan waktunya dengan suara. Ada tombol untuk memutar ulang, dan tombol untuk mematikan suara kalau lagi di kelas atau tempat umum.
3. **Pilih gaya bahasa 🗣️** — Suka gaya "Santai" (contoh: *setengah delapan*) atau "Formal" (contoh: *pukul tujuh lebih tiga puluh menit*)? Kamu bisa pilih sendiri!
4. **Pilih tingkat kesulitan 🎯** — Mode "Per 5 Menit" untuk pemula, atau "Per 1 Menit" kalau mau tantangan lebih seru.
5. **Coba mode 12 jam & 24 jam 🔄** — Lihat bagaimana jam yang sama dibaca dengan dua cara berbeda, misalnya jam 9 malam ditulis "21:00" di mode 24 jam.
6. **Lihat langit berubah ☀️🌙** — Latar belakang seluruh halaman ikut berubah warna secara perlahan sesuai waktu yang kamu atur — biru cerah saat siang, oranye saat senja, gelap berbintang saat malam — lengkap dengan matahari atau bulan yang bergeser posisinya!
7. **Atur lewat jam digital juga bisa lho 🔼🔽** — Ada tombol panah naik-turun di atas dan bawah angka jam & menit, jadi nggak harus selalu geser jarum.
8. **Tombol "Waktu sekarang" 🕐** — Klik untuk langsung menampilkan jam yang sebenarnya, sesuai jam di perangkatmu.

---

## ✨ Fitur

- 🕐 Jam analog SVG dengan jarum yang bisa digeser (bekerja di HP, tablet, maupun komputer)
- 🔢 Jam digital yang tersinkron otomatis, lengkap dengan tombol naik/turun
- 📖 Bacaan waktu dalam Bahasa Indonesia — gaya **Santai** dan **Formal**
- 🔊 Suara pembacaan waktu (text-to-speech), dengan tombol putar ulang dan mute
- 🎚️ Mode geser menit: **Per 5 Menit** (mudah) atau **Per 1 Menit** (lebih menantang)
- 🕛 Mode tampilan **12 Jam** dan **24 Jam**
- ☀️🌙 Latar belakang langit yang berubah warna secara gradual, lengkap dengan matahari/bulan yang mengikuti waktu di jam
- 💾 Semua pengaturan otomatis tersimpan, jadi tetap sama walau app ditutup dan dibuka lagi
- ⌨️ Dukungan pintasan keyboard penuh untuk pemakaian di komputer

### Pintasan Keyboard

| Tombol | Fungsi |
| --- | --- |
| `F` | Ganti gaya bahasa Santai / Formal |
| `J` | Ganti mode 12 Jam / 24 Jam |
| `1` / `5` | Ganti mode geser menit (per 1 / per 5 menit) |
| `S` | Atur ke waktu sekarang |
| `R` | Putar ulang suara |
| `M` | Nyalakan/matikan suara |

---

## 🛠️ Untuk Developer

Dibangun dengan **Svelte 5 + Vite**, murni frontend (tanpa backend/database), dan menggunakan **Web Speech API** untuk suara.

```bash
npm install     # pasang dependensi
npm run dev     # jalankan mode pengembangan
npm run build   # build untuk produksi
```

Deploy otomatis ke **GitHub Pages** lewat GitHub Actions setiap kali ada push ke branch `main`.

Lihat [`CLAUDE.md`](./CLAUDE.md) untuk detail arsitektur dan panduan pengembangan lebih lanjut.
