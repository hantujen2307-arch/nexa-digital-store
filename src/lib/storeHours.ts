'use client';

import { useState, useEffect } from 'react';

/**
 * Konfigurasi Jam Operasional Toko Alpin Premium
 * - Buka setiap hari pukul 08.00 WIB
 * - Tutup setiap hari pukul 22.00 WIB
 * - Timezone: Asia/Jakarta
 */
export const STORE_HOURS = {
  OPEN_TIME: '08:00',
  CLOSE_TIME: '22:00',
  TIMEZONE: 'Asia/Jakarta',
  CLOSED_TITLE: 'Toko sedang tutup',
  CLOSED_NOTICE: 'Pesanan akan dilanjutkan besok pagi pukul 08.00 WIB.',
} as const;

export interface StoreHoursStatus {
  isOpen: boolean;
  statusText: 'TOKO BUKA' | 'TOKO TUTUP';
  currentTimeJakarta: string;
  openTime: string;
  closeTime: string;
  closedTitle: string;
  closedNotice: string;
}

/**
 * Menghitung status operasional toko berdasarkan waktu sekarang di timezone Asia/Jakarta.
 * 
 * Aturan:
 * - 08.00 - 21.59 WIB: TOKO BUKA (isOpen = true)
 * - 22.00 - 07.59 WIB: TOKO TUTUP (isOpen = false)
 */
export function getStoreHoursStatus(date: Date = new Date()): StoreHoursStatus {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: STORE_HOURS.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(date);
    const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minuteStr = parts.find((p) => p.type === 'minute')?.value ?? '00';

    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const currentMinutes = hour * 60 + minute;

    const [openH, openM] = STORE_HOURS.OPEN_TIME.split(':').map(Number);
    const [closeH, closeM] = STORE_HOURS.CLOSE_TIME.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // 08:00 (480 menit) s/d 21:59 (1319 menit) -> BUKA
    // 22:00 (1320 menit) ke atas atau sebelum 08:00 -> TUTUP
    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    return {
      isOpen,
      statusText: isOpen ? 'TOKO BUKA' : 'TOKO TUTUP',
      currentTimeJakarta: `${hourStr}:${minuteStr}`,
      openTime: STORE_HOURS.OPEN_TIME,
      closeTime: STORE_HOURS.CLOSE_TIME,
      closedTitle: STORE_HOURS.CLOSED_TITLE,
      closedNotice: STORE_HOURS.CLOSED_NOTICE,
    };
  } catch (err) {
    // Fallback jika terjadi error pada format timezone
    return {
      isOpen: true,
      statusText: 'TOKO BUKA',
      currentTimeJakarta: '08:00',
      openTime: STORE_HOURS.OPEN_TIME,
      closeTime: STORE_HOURS.CLOSE_TIME,
      closedTitle: STORE_HOURS.CLOSED_TITLE,
      closedNotice: STORE_HOURS.CLOSED_NOTICE,
    };
  }
}

/**
 * Hook React untuk memantau status jam operasional secara real-time.
 * Menghindari hydration mismatch dengan initial mount dan memperbarui setiap 30 detik.
 */
export function useStoreHours() {
  // Hitung initial status
  const [status, setStatus] = useState<StoreHoursStatus>(() => getStoreHoursStatus());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Refresh status saat mounted
    setStatus(getStoreHoursStatus());

    // Update setiap 30 detik agar perubahan jam 22.00 / 08.00 terdeteksi otomatis
    const interval = setInterval(() => {
      setStatus(getStoreHoursStatus());
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    isMounted,
  };
}
