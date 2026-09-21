export interface ProductPackage {
  id: string;
  product_id: string;
  duration: string;
  price: number;
  original_price?: number | null;
  active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  full_description: string;
  logo_url: string;
  category: string;
  badge: string | null;
  download_url?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  packages?: ProductPackage[];
  min_price?: number;
  min_original_price?: number | null;
  sold_count?: number | null;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  price: number | null;
  original_price?: number | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CinemaPromo {
  id: string;
  name: string;
  cinema: string;
  description: string;
  price: number;
  original_price?: number | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  sold_count?: number | null;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalServices: number;
  totalPromos: number;
  totalFoodDrinks: number;
  activeFoodDrinks: number;
  outOfStockFoodDrinks: number;
  totalPulsaTokens?: number;
  activePulsaTokens?: number;
  outOfStockPulsaTokens?: number;
  lowStockPulsaTokens?: number;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  store_subtitle: string;
  store_description: string;
  whatsapp_number: string;
  logo_url: string;
  updated_at?: string;
}

/**
 * FoodDrink — produk Makanan & Minuman
 * Disimpan di tabel `food_drinks` di Supabase.
 */
export interface FoodDrink {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;           // 'Makanan' | 'Minuman' | 'Snack' | 'Dessert' | 'Lainnya'
  price: number;              // harga jual (Rp)
  original_price?: number | null; // harga coret/normal (opsional)
  image_url: string | null;
  stock: number;              // jumlah stok; 0 = habis
  status: boolean;            // true = aktif & tampil di toko
  is_featured: boolean;       // true = produk unggulan
  created_at?: string;
  updated_at?: string;
}

/**
 * PulsaTokenType — jenis produk Pulsa & Token
 */
export type PulsaTokenType = 'pulsa' | 'data' | 'token_pln' | 'voucher_game' | 'ewallet' | string;

/**
 * PulsaToken — model lengkap tabel `pulsa_tokens` (digunakan di Admin)
 */
export interface PulsaToken {
  id: string;
  name: string;
  slug: string;
  type: PulsaTokenType;
  provider: string;
  nominal: number;
  cost_price: number;        // Harga Modal (hanya untuk admin)
  selling_price: number;     // Harga Jual
  description: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * PulsaTokenPublic — representasi publik (cost_price dihilangkan)
 */
export type PulsaTokenPublic = Omit<PulsaToken, 'cost_price'>;

