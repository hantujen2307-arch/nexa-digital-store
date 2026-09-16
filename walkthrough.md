# Laporan Audit & Perbaikan Fitur Admin

## Ringkasan Perbaikan
Fitur admin yang sebelumnya tidak muncul/hilang setelah dideploy ke Vercel telah berhasil diaudit, diperbaiki secara menyeluruh, dan diverifikasi siap produksi.

---

## 1. Penyebab Fitur Admin Hilang di Vercel

1. **Inkonsistensi Nama Environment Variable Supabase (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vs `NEXT_PUBLIC_SUPABASE_ANON_KEY`)**:
   - Kode sebelumnya di `src/lib/supabase/client.ts` hanya membaca `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Di Vercel atau integrasi resmi Supabase terbaru, environment variable sering dinamakan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - Akibatnya, di Vercel key tersebut terbaca kosong (`""`), `isSupabaseConfigured()` mengembalikan `false`, dan Supabase dialihkan ke dummy placeholder client (`placeholder.supabase.co`). Hal ini melumpuhkan seluruh otentikasi admin, sesi login, dan query database di Vercel.

2. **Route `/admin` Hanya Berupa Redirect Semu (`redirect('/?admin=open')`)**:
   - File `src/app/admin/page.tsx` sebelumnya hanya melakukan redirect ke `/?admin=open`.
   - Di production Vercel, ketika pengunjung membuka `https://domain-anda.vercel.app/admin`, mereka langsung dilempar ke halaman beranda (`/`) di mana video iklan intro berdurasi 7 detik menutup seluruh layar dengan `z-index: 99999`.
   - Selain itu, script menghapus query parameter URL dengan `window.history.replaceState` sebelum sesi auth sempat divalidasi, sehingga dashboard admin tidak pernah terbuka dan terkesan hilang.

3. **Tidak Tersedianya Halaman Admin Mandiri (Standalone Route)**:
   - Tidak ada antarmuka admin mandiri di `/admin` yang bisa diakses langsung via URL browser atau di-bookmark.

---

## 2. File yang Diperbaiki & Ditambahkan

| File | Keterangan Perbaikan |
|---|---|
| [`src/lib/supabase/client.ts`](file:///Users/jesen/Documents/kodingan/jualan/src/lib/supabase/client.ts) | Menambahkan dukungan penuh untuk `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` maupun `NEXT_PUBLIC_SUPABASE_ANON_KEY` secara otomatis. |
| [`src/components/admin/AdminPortalView.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/components/admin/AdminPortalView.tsx) | **[FILE BARU]** Komponen halaman portal admin mandiri lengkap dengan login guard, tab navigasi, dan seluruh workspace CRUD. |
| [`src/app/admin/page.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/app/admin/page.tsx) | Mengubah dari redirect semu menjadi route mandiri yang menyajikan dashboard admin & login form. |
| [`src/app/admin/login/page.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/app/admin/login/page.tsx) | Halaman login admin resmi di route `/admin/login`. |
| [`src/app/admin/products/page.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/app/admin/products/page.tsx) | Route langsung untuk manajemen produk & harga durasi. |
| [`src/app/admin/services/page.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/app/admin/services/page.tsx) | Route langsung untuk manajemen jasa editing & digital service. |
| [`src/app/admin/promos/page.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/app/admin/promos/page.tsx) | Route langsung untuk manajemen promo tiket bioskop. |
| [`src/app/admin/settings/page.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/app/admin/settings/page.tsx) | Route langsung untuk pengaturan nama website, deskripsi, nomor WhatsApp, dan logo. |
| [`src/components/admin/tabs/ProductsTab.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/components/admin/tabs/ProductsTab.tsx) | Menambahkan field edit link download / panduan aplikasi (`download_url`), harga diskon/coret, dan logo upload. |
| [`src/app/produk/[slug]/page.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/app/produk/[slug]/page.tsx) | Menampilkan tombol Link Download / Panduan Akses jika diisi oleh admin. |
| [`src/components/Footer.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/components/Footer.tsx) | Mengarahkan link "🔐 Admin" di footer langsung ke route `/admin`. |
| [`src/context/AdminPortalContext.tsx`](file:///Users/jesen/Documents/kodingan/jualan/src/context/AdminPortalContext.tsx) | Memperkuat verifikasi otorisasi admin (`checkAdminRole`) agar mengecek ID dan email secara aman. |
| [`supabase/schema.sql`](file:///Users/jesen/Documents/kodingan/jualan/supabase/schema.sql) | Menambahkan kolom `download_url` dan memperkuat security definer function `is_admin`. |
| [`supabase/migration_add_download_url.sql`](file:///Users/jesen/Documents/kodingan/jualan/supabase/migration_add_download_url.sql) | **[FILE BARU]** SQL migration script yang aman (idempotent) tanpa menghapus data yang ada. |

---

## 3. Database & Tabel yang Digunakan

1. **`public.admin_users`**: Menyimpan ID user dan role admin (`admin@nexadigital.id`, `alpino2307@gmail.com`).
2. **`public.products`**: Menyimpan katalog aplikasi (nama, slug, deskripsi, harga coret, link download `download_url`, logo, kategori, badge).
3. **`public.product_packages`**: Menyimpan paket durasi (1 bulan, 3 bulan, dsb) beserta harga aktif & harga asli yang dicoret (`original_price`).
4. **`public.services`**: Menyimpan daftar jasa editing video & desain.
5. **`public.cinema_promos`**: Menyimpan promo tiket XXI, CGV, Cinepolis.
6. **`public.store_settings`**: Menyimpan nama toko (`ALPINO PREM`), deskripsi, nomor WhatsApp (`6285709918896`), dan logo toko.
7. **Storage Buckets**: `product-images`, `service-images`, `cinema-images`, `store-assets`.

---

## 4. Hasil Pengujian & Verifikasi

- **TypeScript Compilation**: Lolos 100% tanpa error (`Finished TypeScript in 1.7s`).
- **Production Next.js Build**: Lolos 100% (`next build` sukses dengan 11 static/dynamic pages).
- **Semua Route Admin**: Mengembalikan HTTP `200` OK:
  - `/admin` -> `200`
  - `/admin/login` -> `200`
  - `/admin/products` -> `200`
  - `/admin/services` -> `200`
  - `/admin/promos` -> `200`
  - `/admin/settings` -> `200`
  - `/` (Customer) -> `200`
- **Security Check (RLS)**: User anonim/customer diblokir dari operasi INSERT/UPDATE/DELETE.
- **Admin CRUD Test**: Penambahan produk, pengubahan harga durasi, pengubahan harga coret, update nomor WhatsApp, dan logout teruji 100% sukses.
