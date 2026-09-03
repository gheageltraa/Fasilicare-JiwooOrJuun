# Perbaikan pencarian lokasi

Bug terjadi karena endpoint `locations.list` mengembalikan daftar kosong ketika seed lokasi belum pernah dijalankan. Endpoint sekarang otomatis menjalankan seed empat lokasi resmi ketika tabel kosong, lalu mengembalikan data yang sudah terurut.

Logika filter dipindahkan ke `client/src/lib/locations.ts`. Pencarian bersifat case-insensitive, mendukung nama lokasi dan tipe transportasi, mengembalikan seluruh lokasi untuk query kosong, serta menampilkan state loading, error, dan empty pada form report.

Verifikasi berhasil: endpoint `/api/trpc/locations.list` mengembalikan HTTP 200 dengan `Halte Rasuna Said`, `LRT Rasuna Said`, `Stasiun Manggarai`, dan `Stasiun Tebet`. Regression tests untuk seed data dan filter lokasi juga lulus.
