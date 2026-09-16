import { StoreConfig } from '@/types';

export const storeConfig: StoreConfig = {
  storeName: 'ALPINO PREM',
  tagline: 'Katalog Produk Digital & Layanan Kreatif Terpercaya',
  description: 'Penyedia aplikasi premium bergaransi resmi, jasa editing video & grafis profesional, serta promo tiket bioskop hemat.',
  
  // GANTI NOMOR WHATSAPP DI SINI (Gunakan format 628xxxxxxxxxx tanpa spasi atau tanda plus)
  whatsappNumber: '6285709918896',
  
  whatsappGreeting: `halo admin ganteng saya mau order nhi
Nama pesanan: tiket/apk(sebutin)
paket  : 7/ hari 1bulan
order sekarang : YA
Payment `,
  operationalHours: 'Setiap Hari: 08.00 - 23.00 WIB',
  supportEmail: 'support@nexadigital.id',
  
  socialLinks: {
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    telegram: 'https://t.me',
  },

  benefits: [
    {
      title: '100% Garansi Penggantian',
      description: 'Akun bermasalah langsung diganti baru atau dibantu kendala selama masa aktif.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Proses Cepat 5-15 Menit',
      description: 'Setelah bukti transfer diverifikasi, akun atau pesanan langsung diproses tanpa antre lama.',
      icon: 'Zap',
    },
    {
      title: 'Legal & Amanah',
      description: 'Metode legal, tanpa risiko suspend, dan telah dipercaya ribuan pelanggan sejak 2022.',
      icon: 'BadgeCheck',
    },
    {
      title: 'Dukungan Fast Response',
      description: 'Admin ramah dan responsif siap membantu pertanyaan serta panduan instalasi via WhatsApp.',
      icon: 'Headphones',
    },
  ],
};
