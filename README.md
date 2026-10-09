# hackathon-frontend-2026

Frontend React + TypeScript + Vite. Styling menggunakan Tailwind CSS 4. Modul moodboard mengikuti struktur `src/modules/moodboards/{api,types,components,pages}` dan memakai API client bersama di `src/core/network`.

## Menjalankan aplikasi

Dari root repository, masuk ke folder backend:

```sh
cd backend
docker compose up -d --build
```

Buka http://localhost:5173. Nginx meneruskan `/api` ke backend; API key hanya berada di backend. Konfigurasikan `AI_API_KEY` dan `AI_VISION_MODEL` pada `backend/.env` untuk mengaktifkan analisis. Upload dan pengelolaan referensi tetap tersedia sebelum AI dikonfigurasi.

Untuk pengembangan lokal di folder frontend ini:

```sh
npm install
npm run dev
```

Backend harus berjalan di port 8000. Salin `.env.example` jika perlu mengubah `API_PROXY_TARGET`. Gunakan Node.js 24 LTS.

## Alur moodboard

Pilih project → Moodboards → buat moodboard → upload JPEG/PNG/WebP → atur konteks dan peran referensi → analisis → baca ringkasan → review setiap temuan dan konflik → simpan review → setujui versi → ekspor Markdown. Ekspor Inggris membutuhkan konfirmasi terjemahan. Versi lama menggunakan snapshot referensi saat analisis, sehingga riwayat tetap konsisten.

Ringkasan menampilkan gaya, nuansa, palet warna, elemen visual, kelompok, panduan, konflik, pertanyaan, keterbatasan, dan referensi dalam bahasa manusia. Job diperbarui otomatis; kegagalan parsial dapat dicoba ulang.

```sh
npm run build
npm test
```
