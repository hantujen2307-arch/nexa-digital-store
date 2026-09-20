import { Drink } from '@/types/database';

/**
 * =============================================
 * 🥤 DAFTAR PRODUK MINUMAN
 * =============================================
 * Tambahkan minuman baru Anda di sini.
 * Salin salah satu contoh di bawah dan sesuaikan datanya.
 *
 * Panduan pengisian:
 * - id        : unik, huruf kecil + tanda hubung (contoh: 'es-teh-manis')
 * - name      : nama minuman yang akan tampil di toko
 * - category  : kategori bebas (misal: 'Kopi', 'Teh', 'Jus', 'Susu', 'Boba', dll.)
 * - price     : harga dalam Rupiah (angka saja, tanpa Rp)
 * - originalPrice: (opsional) harga sebelum diskon — akan ditampilkan dicoret
 * - description : deskripsi singkat 1-2 kalimat
 * - imageUrl  : URL gambar (bisa dari internet atau kosongkan '')
 * - badge     : (opsional) label kecil seperti 'Best Seller', 'Baru', 'Hot', dll.
 * - active    : true = tampil di toko | false = disembunyikan
 * - sold_count: (opsional) jumlah terjual, untuk tampilan badge
 * =============================================
 */
export const initialDrinks: Drink[] = [
  // ─── CONTOH (hapus atau sesuaikan) ───────────────────────────────────────
  {
    id: 'es-teh-manis',
    name: 'Es Teh Manis',
    category: 'Teh',
    price: 5000,
    originalPrice: null,
    description: 'Teh manis segar dengan es batu pilihan, minuman klasik yang selalu menyegarkan.',
    imageUrl: '',
    badge: null,
    active: true,
    sold_count: 0,
  },
  {
    id: 'es-jeruk',
    name: 'Es Jeruk Peras',
    category: 'Jus',
    price: 8000,
    originalPrice: 10000,
    description: 'Perasan jeruk asli segar tanpa pengawet, kaya vitamin C.',
    imageUrl: '',
    badge: 'Segar',
    active: true,
    sold_count: 0,
  },
  // ─── TAMBAHKAN MINUMAN BARU DI BAWAH INI ─────────────────────────────────
  // {
  //   id: 'nama-unik-minuman',
  //   name: 'Nama Minuman',
  //   category: 'Kategori',
  //   price: 10000,
  //   originalPrice: null,        // isi jika ada diskon, atau null
  //   description: 'Deskripsi singkat minuman.',
  //   imageUrl: '',               // URL gambar atau kosongkan
  //   badge: null,                // misal: 'Baru', 'Best Seller', 'Hot', atau null
  //   active: true,
  //   sold_count: 0,
  // },
];

/** Semua kategori unik dari daftar minuman (untuk filter) */
export const getDrinkCategories = (): string[] => {
  const cats = initialDrinks.map((d) => d.category);
  return ['Semua', ...Array.from(new Set(cats))];
};
