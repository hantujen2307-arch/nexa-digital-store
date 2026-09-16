export type ProductCategory = 'semua' | 'streaming' | 'musik' | 'produktivitas' | 'ai';

export interface ProductPackage {
  id: string;
  name: string;
  duration: string;
  type: 'sharing' | 'private' | 'standard';
  price: number;
  originalPrice?: number;
  features: string[];
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'streaming' | 'musik' | 'produktivitas' | 'ai';
  tagline: string;
  description: string;
  minPrice: number;
  originalPrice?: number;
  badge?: string;
  isPopular?: boolean;
  warranty: string;
  features: string[];
  packages: ProductPackage[];
  accentColor: string; // Tailwind color accent indicator
  iconName: string;
}

export interface EditingService {
  id: string;
  title: string;
  subtitle: string;
  startingPrice: number;
  turnaroundTime: string;
  revisions: string;
  deliverables: string[];
  features: string[];
  isPopular?: boolean;
  iconName: string;
  tags: string[];
}

export interface CinemaPromo {
  id: string;
  name: string;
  logoText: string;
  discountText: string;
  accentGradient: string;
  description: string;
  ticketTypes: {
    type: string;
    normalPrice: string;
    promoPrice: string;
    saving: string;
  }[];
  terms: string[];
  badge?: string;
}

export interface StoreConfig {
  storeName: string;
  tagline: string;
  description: string;
  whatsappNumber: string; // format 628xxxx
  whatsappGreeting: string;
  operationalHours: string;
  supportEmail?: string;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    telegram?: string;
  };
  benefits: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface FAQItem {
  question: string;
  answer: string;
}
