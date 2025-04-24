Aplikasi Kesehatan WeFit

Deskripsi
Aplikasi ini adalah platform berbasis web yang dibangun menggunakan Node.js dan Express.js untuk membantu pengguna dalam memantau dan mengelola berbagai metrik kesehatan penting. Pengguna dapat mendaftar, masuk, dan mencatat data kesehatan seperti BMI, persentase lemak tubuh, asupan air harian, konsumsi kalori, dan rasio pinggang-pinggul (WHR). Aplikasi ini juga menyediakan fitur untuk melihat perkembangan data kesehatan secara visual melalui grafik dan riwayat.

Fitur Utama
- Autentikasi Pengguna: Sistem registrasi dan login menggunakan Passport.js dan JSON Web Token (JWT) untuk keamanan dan manajemen sesi.
- Penghitungan Kesehatan:
  - BMI (Body Mass Index): Menghitung indeks massa tubuh berdasarkan berat dan tinggi badan.
  - Persentase Lemak Tubuh: Menghitung persentase lemak tubuh menggunakan pengukuran lingkar pinggang, leher, dan pinggul (untuk wanita).
  - Asupan Air: Mencatat jumlah konsumsi air harian dalam mililiter.
  - Konsumsi Kalori (TDEE): Menghitung Total Daily Energy Expenditure berdasarkan berat, tinggi, usia, jenis kelamin, dan tingkat aktivitas.
  - Rasio Pinggang-Pinggul (WHR): Mengukur risiko kesehatan berdasarkan perbandingan lingkar pinggang dan pinggul.
- Manajemen Data: Pengguna dapat menambah, mengedit, dan menghapus data metrik kesehatan.
- Visualisasi Data: Menampilkan grafik perkembangan metrik kesehatan dari waktu ke waktu.
- UI Responsif: Menggunakan template EJS dan Bootstrap untuk tampilan yang menarik dan responsif.

Teknologi yang Digunakan
- Backend: Node.js, Express.js
- Database: MongoDB dengan Mongoose ODM
- Autentikasi: Passport.js, JWT
- Template Engine: EJS
- Keamanan: bcrypt untuk hashing password

Instalasi dan Pengaturan
1. Clone Repository:
   ```
   git clone <repository-url>
   ```
2. Masuk ke Direktori Proyek:
   ```
   cd project-uts
   ```
3. Install Dependensi:
   ```
   npm install
   ```
4. Konfigurasi Variabel Lingkungan (.env):**
   Buat file `.env` di root proyek dan isi dengan variabel berikut:
   ```
   MONGODB_URI=<string_koneksi_mongodb>
   SESSION_SECRET=<rahasia_session>
   ```
5. Jalankan Aplikasi:
   ```
   npm start
   ```
6. Akses Aplikasi: 
   Buka browser dan kunjungi `http://localhost:3000`

Struktur Folder
- `app.js` - File utama aplikasi yang menginisialisasi server dan middleware.
- `routes/` - Berisi file route untuk autentikasi dan fitur metrik kesehatan (BMI, Lemak, Air, Kalori, WHR).
- `models/` - Model Mongoose untuk pengguna dan data metrik kesehatan.
- `views/` - Template EJS untuk halaman web.
- `public/` - Aset statis seperti CSS, JavaScript, dan gambar.
- `utils/` - Modul utilitas seperti penanganan JWT.

Penjelasan Metrik Kesehatan
- BMI: Dihitung dengan rumus berat (kg) dibagi kuadrat tinggi badan (m). Menunjukkan kategori berat badan.
- Persentase Lemak Tubuh: Menggunakan pengukuran lingkar tubuh dan rumus khusus berdasarkan jenis kelamin.
- Asupan Air: Catatan konsumsi air harian dalam mililiter untuk menjaga hidrasi.
- Konsumsi Kalori (TDEE): Menghitung kebutuhan kalori harian berdasarkan BMR dan tingkat aktivitas.
- Rasio Pinggang-Pinggul (WHR): Indikator risiko penyakit kardiovaskular berdasarkan distribusi lemak tubuh.

Cara Penggunaan
- Daftar akun baru melalui halaman registrasi.
- Login menggunakan username dan password.
- Tambahkan data kesehatan melalui halaman terkait.
- Pantau perkembangan melalui halaman progress yang menampilkan grafik.
- Edit atau hapus data jika diperlukan.

Pengembangan dan Kontribusi
- Pastikan untuk menginstall semua dependensi dengan `npm install`.
- Gunakan `nodemon` untuk pengembangan agar server otomatis restart saat ada perubahan.
- Ikuti standar kode yang sudah ada untuk konsistensi.
- Buat branch baru untuk fitur atau perbaikan dan lakukan pull request.