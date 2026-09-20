import { FoodDrink } from '@/types/database';

/**
 * =====================================================
 * 🍔🥤 DATA SEED MAKANAN & MINUMAN
 * =====================================================
 * Data ini digunakan sebagai FALLBACK ketika:
 * - Supabase belum dikonfigurasi, atau
 * - Tabel `food_drinks` belum dibuat, atau
 * - Tidak ada data di Supabase
 *
 * Data asli dikelola via Admin Panel → "Makanan & Minuman"
 * dan disimpan di tabel `food_drinks` di Supabase.
 * =====================================================
 */
export const initialFoodDrinks: FoodDrink[] = [
  {
    id: 'fd-seed-1',
    name: 'Es Teh Manis Jumbo',
    slug: 'es-teh-manis-jumbo',
    description: 'Teh manis segar ukuran jumbo dengan es batu pilihan, cocok untuk menghilangkan dahaga.',
    category: 'Minuman',
    price: 5000,
    original_price: null,
    image_url: null,
    stock: 100,
    status: true,
    is_featured: true,
  },
  {
    id: 'fd-seed-2',
    name: 'Nasi Goreng Spesial',
    slug: 'nasi-goreng-spesial',
    description: 'Nasi goreng bumbu rahasia dengan telur mata sapi, acar, dan kerupuk renyah.',
    category: 'Makanan',
    price: 18000,
    original_price: 22000,
    image_url: null,
    stock: 50,
    status: true,
    is_featured: true,
  },
  {
    id: 'fd-seed-3',
    name: 'Keripik Singkong Pedas',
    slug: 'keripik-singkong-pedas',
    description: 'Keripik singkong renyah dengan bumbu pedas manis yang bikin nagih.',
    category: 'Snack',
    price: 8000,
    original_price: null,
    image_url: null,
    stock: 200,
    status: true,
    is_featured: false,
  },
  {
    id: 'fd-seed-4',
    name: 'Es Krim Vanilla Cup',
    slug: 'es-krim-vanilla-cup',
    description: 'Es krim vanilla lembut dalam cup, cocok sebagai penutup makan.',
    category: 'Dessert',
    price: 10000,
    original_price: null,
    image_url: null,
    stock: 0,
    status: true,
    is_featured: false,
  },
];
