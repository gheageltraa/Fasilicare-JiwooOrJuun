<div align="center">
  
  # FasiliCare 🚆
  ### Crowdsourced Public Transport Facility Maintenance & Ticketing Platform
  
  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-success?style=for-the-badge)](https://fasilicare.vercel.app)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/killudha/fasilicare)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  
  **Submission for ITECHNO CUP 2026 - Web Development**
  
  **By Tim Developer**
  
</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Unggulan](#-fitur-unggulan)
- [Demo & Screenshot](#-demo--screenshot)
- [Teknologi](#-teknologi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Instalasi & Setup](#-instalasi--setup)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Tim Developer](#-tim-pengembang)
- [Lisensi](#-lisensi)

---

## 👥 Tim Developer

| Nama | Peran | GitHub |
|------|-------|--------|
| **DHANNY ABDUL QODIR AL JAELANY** | - | [@killudha](https://github.com/killudha) |
| **GHEA GELTRA AMBARWINOTO** | - | [@gheageltraa](https://github.com/gheageltraa) |

---

## 🎯 Tentang Proyek

### Latar Belakang

Jutaan komuter bergantung pada transportasi publik (KRL, MRT, TransJakarta) setiap harinya. Tingginya mobilitas ini menyebabkan tingkat keausan fasilitas sangat cepat. Sayangnya, sistem pelaporan saat ini memiliki kendala utama:
1. **Pelaporan Fragmented & Lambat**: Komuter sering melapor via media sosial yang rentan tenggelam, atau harus mencari petugas di stasiun yang sedang sibuk.
2. **Efek "Black Hole"**: Penumpang yang melapor tidak pernah tahu apakah laporannya diproses atau diabaikan, menurunkan tingkat partisipasi dan kepercayaan publik.
3. **Data Tidak Terstruktur**: Pihak operator kesulitan memetakan fasilitas atau armada mana yang paling rawan rusak karena data keluhan tidak terpusat.

### Solusi yang Ditawarkan

**FasiliCare** hadir sebagai platform *ticketing* pemeliharaan berbasis *crowdsourcing* yang mendigitalkan ekosistem pelaporan kerusakan fasilitas transportasi publik. Platform ini memadukan **Smart QR-Triggered Report**, **Community Upvote Validation**, dan **Real-Time Task Delegation** untuk mendukung *SDG 9: Industri, Inovasi, dan Infrastruktur* serta *SDG 11: Kota dan Komunitas Berkelanjutan*.

### Tujuan Proyek

- 🎯 **Tujuan Utama**: Mempercepat *Response Time* perbaikan fasilitas transportasi publik (Stasiun, Halte, dan Gerbong) melalui pelaporan komunitas yang terpusat dan tervalidasi.
- 📊 **Target Pengguna**: Penumpang komuter (sebagai pelapor komunitas), Kepala Stasiun/Halte (sebagai Admin Triage), dan Teknisi Lapangan (sebagai Eksekutor).
- 💡 **Value Proposition**: Pelaporan dalam hitungan detik via Web/PWA tanpa instalasi berat, transparansi progres perbaikan *end-to-end*, dan pencegahan laporan palsu (*spam*) menggunakan logika verifikasi dari sesama penumpang.

---

## ✨ Fitur Unggulan

### Fitur Utama

| Fitur | Deskripsi | Keunggulan |
|----------|--------------|---------------|
| **Smart QR-Triggered Report** | Komuter memindai QR code di gerbong/halte untuk melapor. Web otomatis mengenali ID lokasi tanpa *input* manual. | Mempercepat pelaporan, mencegah kesalahan ketik lokasi, dan mempercepat respons teknisi ke titik akurat. |
| **Community Upvote Validation** | Sistem anti-spam organik. Laporan tampil di *feed* publik agar divalidasi (di-upvote) penumpang lain sebelum masuk ke teknisi. | Mencegah penumpukan tiket duplikat untuk satu fasilitas rusak yang sama dan menghindari *server overload*. |
| **RBAC Triage Dashboard** | Panel khusus dengan hak akses (*Role-Based Access Control*) terpisah untuk Admin (menyortir laporan) dan Teknisi. | Memastikan alur kerja pendelegasian yang terstruktur (*Menunggu -> Dikerjakan -> Selesai*). |
| **Live Proof of Repair** | Sistem mewajibkan teknisi mengambil "Live Photo" hasil perbaikan sebelum bisa menutup status tiket pelaporan. | Memberikan transparansi penuh. Penumpang pelapor akan mendapat notifikasi bahwa fasilitas sudah bisa digunakan. |

### Fitur Tambahan

- **Heatmap Analytics Dashboard** - Visualisasi grafis bagi manajemen untuk melihat stasiun atau rute mana dengan tingkat kerusakan tertinggi.
- **Progress Tracking Indicator** - *Timeline* pelacakan visual bagi komuter untuk memantau status tiket laporan mereka.
- **Progressive Web App (PWA)** - Optimasi aplikasi web agar tetap responsif dan bisa diakses lancar meski sinyal internet komuter sedang tidak stabil di perjalanan.

---

## 📸 Demo & Screenshot

### Live Demo

🔗 **[Kunjungi Website FasiliCare](https://fasilicare.vercel.app)**

### Screenshot Aplikasi

<div align="center">
  <img src="https://via.placeholder.com/800x450/1e293b/ffffff?text=FasiliCare+Mobile+Scan+Page" alt="Mobile Scan Page" width="800"/>
  <p><em>Halaman Pelaporan Mobile - Antarmuka PWA responsif untuk memindai QR dan mengambil Live Photo kerusakan</em></p>
  
  <img src="https://via.placeholder.com/800x450/1e293b/ffffff?text=Community+Feed+%26+Upvote" alt="Community Feed" width="800"/>
  <p><em>Community Feed - Halaman publik untuk melihat dan memberikan Upvote pada laporan penumpang lain</em></p>
  
  <img src="https://via.placeholder.com/800x450/1e293b/ffffff?text=Admin+Triage+Dashboard" alt="Admin Dashboard" width="800"/>
  <p><em>Admin Triage Dashboard - Panel manajemen Kepala Stasiun untuk menugaskan teknisi</em></p>
</div>

---

## 🛠️ Teknologi

### Tech Stack

#### Frontend
- **Framework**: Next.js (React.js)
- **Styling**: Tailwind CSS
- **State Management**: Zustand / React Context
- **Icons & UI Components**: Lucide React & Radix UI (shadcn/ui)

#### Backend
- **Framework**: Next.js API Routes (Serverless) / Node.js Express
- **Authentication**: NextAuth.js (Google OAuth & JWT credentials)
- **File Storage**: Supabase Storage / Cloudinary

#### Database
- **Relational Database**: PostgreSQL (Hosted on Neon / Supabase)
- **ORM**: Prisma (Type-safe database client)

#### Deployment & CI/CD
- **Hosting**: Vercel (Frontend & Serverless API)
- **Version Control & CI**: GitHub / GitHub Actions

---

## ⚙️ Arsitektur Sistem (Workflow)

1. **Scan & Detect**: Penumpang memindai QR Code di Halte TransJakarta (Contoh ID: `TJ-DA-01`).
2. **Report**: Antarmuka web terbuka. Penumpang login via Google, memotret fasilitas yang rusak, dan mengirim laporan.
3. **Validate**: Laporan masuk ke *Community Feed*. Penumpang lain di lokasi yang sama mengklik tombol "Sama-sama Terdampak" (Upvote).
4. **Dispatch**: Setelah mencapai batas minimal Upvote, Kepala Halte (Admin) menerima tiket dan meneruskannya ke akun Teknisi Lapangan.
5. **Resolve**: Teknisi memperbaiki fasilitas, mengambil *Live Photo* bukti perbaikan via HP, dan menutup tiket (Status: Selesai).

---

## 🚀 Instalasi & Setup

Panduan menjalankan proyek ini secara lokal untuk *development*:

1. **Clone repository**
   ```bash
   git clone [https://github.com/killudha/fasilicare.git](https://github.com/killudha/fasilicare.git)
   cd fasilicare