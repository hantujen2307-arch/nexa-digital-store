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
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalServices: number;
  totalPromos: number;
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
