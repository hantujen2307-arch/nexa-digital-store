import { WHATSAPP_NUMBER } from '@/data/config';
import { getActiveWhatsAppNumber } from '@/lib/storeSettings';

/**
 * Format angka ke format Rupiah (contoh: Rp 25.000) atau fallback Rp XX.XXX
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return 'Rp XX.XXX';
  }
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted.replace(/\u00a0/g, ' ').replace(/Rp\s*/, 'Rp ');
}

export const DEFAULT_WHATSAPP_ORDER_MESSAGE = `halo admin ganteng saya mau order nhi
Nama pesanan: tiket/apk(sebutin)
paket  : 7/ hari 1bulan
order sekarang : YA
Payment `;

/**
 * Membuat tautan WhatsApp dengan pesan kustom terenkode
 */
export function createWhatsAppUrl(
  message: string = DEFAULT_WHATSAPP_ORDER_MESSAGE,
  customPhone?: string
): string {
  const phone = customPhone || getActiveWhatsAppNumber() || WHATSAPP_NUMBER;
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  const text = (message || DEFAULT_WHATSAPP_ORDER_MESSAGE).trim();
  const encodedMessage = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Pesan WhatsApp pemesanan Aplikasi Premium
 */
export function getProductOrderWhatsAppUrl(
  productName: string,
  duration: string,
  price: number | string
): string {
  const formattedPrice = typeof price === 'number' ? formatRupiah(price) : price;
  const message = `halo admin ganteng saya mau order nhi
Nama pesanan: ${productName}
paket  : ${duration}${formattedPrice ? ` (${formattedPrice})` : ''}
order sekarang : YA
Payment `;

  return createWhatsAppUrl(message);
}

/**
 * Pesan WhatsApp pemesanan Jasa Editing
 */
export function getServiceOrderWhatsAppUrl(serviceName: string): string {
  const message = `halo admin ganteng saya mau order nhi
Nama pesanan: Jasa ${serviceName}
paket  : Layanan Editing
order sekarang : YA
Payment `;
  return createWhatsAppUrl(message);
}

/**
 * Pesan WhatsApp pemesanan Tiket Bioskop Promo
 */
export function getCinemaOrderWhatsAppUrl(
  promoName: string,
  cinemaName: string,
  price: number | string
): string {
  const formattedPrice = typeof price === 'number' ? formatRupiah(price) : price;
  const message = `halo admin ganteng saya mau order nhi
Nama pesanan: Tiket Promo ${promoName} (${cinemaName})
paket  : Tiket Bioskop${formattedPrice ? ` (${formattedPrice})` : ''}
order sekarang : YA
Payment `;

  return createWhatsAppUrl(message);
}
