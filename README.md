# FasiliCare 🚇✨

> **Crowdsourced Public Transport Facility Maintenance Platform**

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-success?style=for-the-badge)](https://fasilicare-eta.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github)](https://github.com/yourusername/fasilicare)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

### Submission for ITECHNO CUP 2026 — Web Development

**By Tim JiwooOrJuun — Dhanny & Ghea**

</div>

---

## 📋 Daftar Isi

* [Tentang Proyek](#-tentang-proyek)

  * [Latar Belakang](#latar-belakang)
  * [Solusi yang Ditawarkan](#solusi-yang-ditawarkan)
  * [Tujuan Proyek](#tujuan-proyek)
* [Fitur Unggulan](#-fitur-unggulan)
* [Demo & Screenshot](#-demo--screenshot)
* [Teknologi](#-teknologi)
* [Arsitektur Sistem](#-arsitektur-sistem)
* [Instalasi & Setup](#️-instalasi--setup)
* [Penggunaan](#-penggunaan)
* [API Documentation](#-api-documentation)
* [Testing](#-testing)
* [Tim Developer](#-tim-developer)
* [Lisensi](#-lisensi)

---

## 👥 Tim Developer

| Nama                              | Peran                               | Email / Kontak                                            |
| --------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| **Dhanny Abdul Qodir Al Jaelany** | Project Lead & Full Stack Developer | [dhanny.aljael@gmail.com](mailto:dhanny.aljael@gmail.com) |
| **Ghea**                          | UI/UX Designer & Frontend Support   | [ghea.geltra@gmail.com](mailto:ghea.geltra@gmail.com)     |

---

## 🎯 Tentang Proyek

### Latar Belakang

Transportasi umum merupakan urat nadi mobilitas perkotaan. Namun, fasilitas penunjang seperti eskalator stasiun, pendingin ruangan kereta, dan mesin tiket sering kali mengalami kerusakan tanpa adanya sistem pelaporan yang terintegrasi.

Commuter harian sering kali kebingungan mengenai ke mana mereka harus melapor, sementara pihak teknisi mengalami kesulitan dalam menentukan prioritas perbaikan karena minimnya data lapangan yang terstruktur dan tervalidasi.

### Solusi yang Ditawarkan

**FasiliCare** hadir sebagai platform *crowdsourced ticketing* yang menjembatani komunikasi antara masyarakat, admin fasilitas, dan teknisi lapangan.

Platform ini membantu:

* Mempermudah masyarakat dalam melaporkan kerusakan fasilitas.
* Mengurangi duplikasi laporan melalui sistem pencarian lokasi pintar.
* Membantu admin melakukan proses *triage* dan menentukan prioritas laporan.
* Mempermudah teknisi dalam menerima serta menyelesaikan tugas perbaikan.
* Menyediakan transparansi terhadap status perbaikan fasilitas publik.

FasiliCare juga dirancang untuk mendukung **United Nations Sustainable Development Goals (SDGs)**:

* 🏭 **SDG 9 — Industry, Innovation and Infrastructure**
  Menyediakan infrastruktur digital inovatif untuk membantu menjaga ketahanan sistem transportasi publik.

* 🏙️ **SDG 11 — Sustainable Cities and Communities**
  Memberdayakan masyarakat untuk berkontribusi dalam menciptakan jaringan mobilitas perkotaan yang lebih aman, tangguh, dan berkelanjutan.

### Tujuan Proyek

* 🎯 **Tujuan Utama**
  Mempercepat waktu respons terhadap perbaikan fasilitas publik melalui sistem pelaporan terpusat berbasis komunitas.

* 📊 **Target Pengguna**

  * **USER** — Komuter atau masyarakat umum.
  * **ADMIN** — Petugas *triage* dan pengelola laporan.
  * **TECH** — Teknisi lapangan.

* 💡 **Value Proposition**

  * Deteksi laporan duplikat secara cerdas.
  * Alur kerja berdasarkan *role*.
  * Transparansi status perbaikan.
  * Gamifikasi untuk meningkatkan partisipasi pengguna.
  * Integrasi antara masyarakat, admin, dan teknisi.

---

## ✨ Fitur Unggulan

### Fitur Utama

| Fitur                      | Deskripsi                                                                                     | Keunggulan                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Role-Based Helpdesk**    | Antarmuka dan logika khusus untuk USER, ADMIN, dan TECH.                                      | Memisahkan alur operasional sehingga proses penanganan tiket menjadi lebih efisien.             |
| **Smart Anti-Duplicate**   | Menampilkan laporan serupa berdasarkan lokasi dan tipe transportasi seperti KRL dan MRT.      | Mengurangi penumpukan tiket atau spam untuk masalah yang sama.                                  |
| **Interactive SDG Impact** | Menampilkan *badge* interaktif yang menjelaskan kontribusi laporan terhadap SDG 9 dan SDG 11. | Mengedukasi pengguna mengenai dampak tindakan mereka terhadap tujuan pembangunan berkelanjutan. |
| **God Mode Switcher**      | Fitur khusus untuk Project Lead untuk berpindah *role* secara instan.                         | Mempermudah demonstrasi *end-to-end flow* tanpa perlu login berulang kali.                      |

### Fitur Tambahan

* 🔐 **Single Sign-On (SSO)**
  Login cepat menggunakan Google OAuth melalui Supabase Auth.

* 🏆 **Gamifikasi Reputasi**
  Pengguna mendapatkan **+10 poin** ketika membuat laporan dan **+50 poin** ketika masalah yang dilaporkan berhasil diselesaikan.

* 📸 **Direct Cloudinary Uploads**
  Pengguna dapat mengunggah foto bukti kerusakan secara langsung dari sisi *client*.

* 📚 **Echoes — Archive Hub**
  Ruang arsip publik untuk melihat tiket yang telah selesai diperbaiki.

---

## 📸 Demo & Screenshot

### Live Demo

🔗 **[Kunjungi Website FasiliCare](https://fasilicare-eta.vercel.app)**

### App Preview

**1. Tampilan Utama (Commuter Hub)**
<div align="center">
  <img src="./ss/HOME.png" alt="Home" width="800"/>
  <p><em>Beranda (Home) - The Community Board untuk pantauan laporan real-time</em></p>
</div>

<div align="center">
  <img src="./ss/DARK%20MODE.png" alt="Dark Mode" width="800"/>
  <p><em>Dukungan Dark Mode penuh untuk kenyamanan akses di malam hari</em></p>
</div>

**2. Autentikasi**
<div align="center">
  <img src="./ss/SIGN%20IN.png" alt="Sign In" width="49%"/>
  <img src="./ss/SIGN%20UP.png" alt="Sign Up" width="49%"/>
  <p><em>Halaman Sign In dan Sign Up yang terintegrasi Single Sign-On (SSO)</em></p>
</div>

**3. Interaksi Pengguna & Gamifikasi**
<div align="center">
  <img src="./ss/TICKET%20DETAIL.png" alt="Ticket Detail" width="800"/>
  <p><em>Ticket Detail - Upvote, komentar, dan pemantauan status perbaikan</em></p>
</div>

<div align="center">
  <img src="./ss/ECHOES.png" alt="Echoes" width="800"/>
  <p><em>Echoes - Ruang arsip publik untuk tiket-tiket yang telah berhasil diperbaiki</em></p>
</div>

<div align="center">
  <img src="./ss/PROFILE.png" alt="Profile" width="49%"/>
  <img src="./ss/NOTIFICATION.png" alt="Notification" width="49%"/>
  <p><em>Profil Pengguna (Gamifikasi Reputasi) & Pusat Notifikasi Real-Time</em></p>
</div>

**4. Role: Administrator Workspace**
<div align="center">
  <img src="./ss/ANALYTIC%20DASHBOARD.png" alt="Analytic Dashboard" width="800"/>
  <p><em>Analytic Dashboard - Pemantauan data fasilitas, sentimen, dan tren kerusakan</em></p>
</div>

<div align="center">
  <img src="./ss/TICKET%20MANAGEMENT.png" alt="Ticket Management" width="800"/>
  <p><em>Ticket Management - Fitur Triage, Approve, dan Assign tugas ke Teknisi</em></p>
</div>

<div align="center">
  <img src="./ss/USER%20MANAGEMENT.png" alt="User Management" width="49%"/>
  <img src="./ss/LOCATION%20MANAGEMENT.png" alt="Location Management" width="49%"/>
  <p><em>Manajemen Pengguna (Role/Point Setup) dan Manajemen Lokasi Transportasi</em></p>
</div>

**5. Role: Tech (Teknisi Lapangan)**
<div align="center">
  <img src="./ss/TASKS%20TECH.png" alt="Tasks Tech" width="800"/>
  <p><em>Tech Tasks - Antrean perbaikan khusus Teknisi (Update status In Progress / Resolved)</em></p>
</div>

---

## 🛠️ Teknologi

### Tech Stack

#### Frontend

```text
Framework     : React (built with Vite)
UI Library    : Tailwind CSS, shadcn/ui, Radix UI
State Mgmt    : React Hooks / Context API
```

#### Backend

```text
Runtime       : Node.js (Vercel Serverless Functions)
Framework     : Express.js
Database      : PostgreSQL (Hosted on Supabase)
ORM           : Drizzle ORM
Auth          : Supabase Auth (Google SSO)
```

#### DevOps & Tools

```text
Deployment    : Vercel
Image Storage : Cloudinary (Unsigned Uploads)
```

### Alasan Pemilihan Teknologi

| Teknologi         | Alasan Pemilihan                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **React + Vite**  | Proses *build* yang cepat dengan HMR (Hot Module Replacement), cocok untuk pengembangan MVP dalam kompetisi. |
| **Drizzle ORM**   | Menyediakan tipisasi yang ketat (*type-safe*) serta ringan untuk lingkungan Serverless Node.js.              |
| **Supabase Auth** | Mempermudah integrasi Google OAuth dan pengelolaan sesi pada platform *serverless* seperti Vercel.           |

---

## 🏗️ Arsitektur Sistem

### Database Schema

```mermaid
erDiagram
    USER ||--o{ TICKET : creates
    LOCATION ||--o{ TICKET : has

    USER {
        string id PK
        string email
        enum role
        int reputation_points
    }

    TICKET {
        string id PK
        string issueDesc
        string photoUrl
        string transitType
        enum status
        enum urgency
    }

    LOCATION {
        string id PK
        string name
        string type
    }
```

---

## ⚙️ Instalasi & Setup

### Prerequisites

Pastikan perangkat telah memiliki:

* **Node.js** v18.x atau lebih tinggi
* **npm**
* **Git**

> Jika terdapat konflik dependency saat instalasi, gunakan `--legacy-peer-deps` sesuai kebutuhan project.

### Langkah Instalasi

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/fasilicare.git
cd fasilicare
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Setup Environment Variables

Buat file `.env` di root directory:

```env
# 1. Database & Security
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DATABASE_POOLER_REGION="ap-southeast-1"
AUTH_SECRET="your_super_secret_key_here"

# 2. Supabase Connection (Wajib untuk fitur Sign in with Google)
VITE_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_ANON_KEY="your_supabase_anon_key"

# 3. Google OAuth Legacy (Jika backend masih membutuhkannya)
# Catatan: Ganti localhost dengan domain Vercel saat production
OAUTH_SERVER_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# 4. Cloudinary (Penyimpanan Foto)
VITE_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
VITE_CLOUDINARY_UPLOAD_PRESET="your_upload_preset"

# 5. Dummy Analytics
VITE_ANALYTICS_ENDPOINT="http://localhost:3000"
VITE_ANALYTICS_WEBSITE_ID="your_analytics_website_id"
```

> ⚠️ **Jangan commit file `.env` ke repository.** Pastikan `.env` sudah tercantum di `.gitignore`.

#### 4. Setup Database

Sinkronisasikan schema Drizzle dengan PostgreSQL:

```bash
npx drizzle-kit push
```

#### 5. Jalankan Development Server

Seed lokasi stasiun dummy:

```bash
npm run db:seed
```

Jalankan development server:

```bash
npm run dev
```

Aplikasi akan tersedia di:

```text
http://localhost:5173
```

---

## 🚀 Penggunaan

### 👤 Untuk Pengguna Umum (Commuters)

1. **Registrasi / Login**
   Klik **Sign in** dan masuk menggunakan akun Google. Pengguna secara otomatis mendapatkan role `USER`.

2. **Membuat Laporan**
   Klik **Sign in to report**, kemudian:

   * Cari lokasi menggunakan *smart search*.
   * Pilih jenis kerusakan.
   * Pilih tipe transportasi.
   * Unggah foto sebagai bukti kerusakan.
   * Kirim laporan.

3. **Melihat SDG Impact**
   Klik *badge* **SDG 9** atau **SDG 11** pada *Hero Card* untuk melihat informasi mengenai dampak laporan terhadap ketahanan dan keberlanjutan kota.

### 🛡️ Untuk Admin

1. **Akses Admin Panel**
   Gunakan akun dengan akses **God Mode** atau atur otorisasi database menjadi `ADMIN`.

2. **Review Laporan**
   Admin dapat melihat laporan yang masuk dan melakukan filter berdasarkan tipe transportasi seperti MRT atau KRL.

3. **Approve & Assign**
   Setelah laporan diverifikasi, admin dapat melakukan *approval* dan menugaskan teknisi melalui fitur *modal*.

### 🔧 Untuk Teknisi (TECH)

1. **Mulai Perbaikan**
   Login sebagai `TECH`, kemudian klik **Mulai Kerjakan** untuk mengubah status tiket menjadi `In Progress`.

2. **Selesaikan Perbaikan**
   Setelah masalah selesai diperbaiki, klik **Selesaikan**.

   Pelapor awal akan mendapatkan tambahan **+50 poin reputasi**.

---

## 📚 API Documentation

### Base URL

#### Development

```text
http://localhost:5173/api
```

#### Production

```text
https://fasilicare-eta.vercel.app/api
```

### Endpoints Utama

```http
GET    /api/tickets
POST   /api/tickets
PATCH  /api/tickets/:id
```

| Method  | Endpoint           | Fungsi                                                |
| ------- | ------------------ | ----------------------------------------------------- |
| `GET`   | `/api/tickets`     | Mengambil daftar laporan untuk Community Board.       |
| `POST`  | `/api/tickets`     | Membuat laporan baru dengan validasi duplikasi.       |
| `PATCH` | `/api/tickets/:id` | Memperbarui status, urgensi, atau assignment teknisi. |

---

## 🧪 Testing

### God Mode — Testing & Presentasi

Untuk mendemonstrasikan keseluruhan *flow* aplikasi di hadapan juri, Project Lead dapat menggunakan akun yang memiliki akses **God Mode**.

Fitur **God Mode Role Switcher** memungkinkan perpindahan role secara cepat:

```text
USER → ADMIN → TECH
```

Dengan demikian, seluruh alur aplikasi dapat didemonstrasikan tanpa harus melakukan login berulang kali.

> **Catatan keamanan:** akses God Mode sebaiknya hanya tersedia untuk akun Project Lead dan tidak digunakan pada environment production publik.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

Lihat file [`LICENSE`](LICENSE) untuk informasi selengkapnya.

---

<div align="center">

### Made with ❤️ by Tim JiwooOrJuun

**For ITECHNO CUP 2026**

**Dhanny & Ghea**

</div>
