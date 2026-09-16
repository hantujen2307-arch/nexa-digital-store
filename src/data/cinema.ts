import { CinemaPromo } from '@/types';

export const cinemaPromosData: CinemaPromo[] = [
  {
    id: 'cinema-xxi',
    name: 'Cinema XXI & M-Tix',
    logoText: 'XXI',
    discountText: 'Diskon s/d 35%',
    accentGradient: 'from-amber-500/20 to-yellow-600/10 border-amber-500/30',
    badge: 'Paling Populer',
    description: 'Promo tiket bioskop jaringan Cinema XXI dan The Premiere seluruh Indonesia. Booking kursi terbaik tanpa perlu antre di kasir bioskop.',
    ticketTypes: [
      {
        type: 'XXI Deluxe (Senin - Kamis)',
        normalPrice: 'Rp 40.000 - Rp 50.000',
        promoPrice: 'Mulai Rp 28.000',
        saving: 'Hemat s/d Rp 22.000',
      },
      {
        type: 'XXI Deluxe (Jumat - Minggu / Libur)',
        normalPrice: 'Rp 55.000 - Rp 75.000',
        promoPrice: 'Mulai Rp 42.000',
        saving: 'Hemat s/d Rp 33.000',
      },
      {
        type: 'IMAX & The Premiere',
        normalPrice: 'Rp 100.000 - Rp 150.000',
        promoPrice: 'Mulai Rp 75.000',
        saving: 'Hemat s/d Rp 50.000',
      },
    ],
    terms: [
      'Berlaku untuk seluruh bioskop XXI di kota Anda yang tercover M-Tix',
      'Format pemesanan dikirim minimal 1 - 2 jam sebelum jam tayang',
      'Kode booking e-ticket langsung dikirim via WhatsApp',
      'Tinggal scan barcode di kiosk bioskop untuk cetak tiket fisik',
    ],
  },
  {
    id: 'cgv-cinemas',
    name: 'CGV Cinemas',
    logoText: 'CGV',
    discountText: 'Diskon s/d 40%',
    accentGradient: 'from-red-500/20 to-rose-600/10 border-red-500/30',
    badge: 'Hemat Banget',
    description: 'Promo tiket nonton di CGV Cinemas untuk auditorium Regular 2D, Starium, SphereX, hingga Velvet Class.',
    ticketTypes: [
      {
        type: 'CGV Regular 2D (Weekday)',
        normalPrice: 'Rp 35.000 - Rp 45.000',
        promoPrice: 'Mulai Rp 24.000',
        saving: 'Hemat s/d Rp 21.000',
      },
      {
        type: 'CGV Regular 2D (Weekend)',
        normalPrice: 'Rp 50.000 - Rp 65.000',
        promoPrice: 'Mulai Rp 36.000',
        saving: 'Hemat s/d Rp 29.000',
      },
      {
        type: 'CGV Special Auditorium (Starium / 4DX)',
        normalPrice: 'Rp 80.000 - Rp 120.000',
        promoPrice: 'Mulai Rp 58.000',
        saving: 'Hemat s/d Rp 42.000',
      },
    ],
    terms: [
      'Berlaku untuk semua cabang CGV di seluruh Indonesia',
      'Bebas pilih nomor kursi yang masih tersedia',
      'Tiket resmi dalam bentuk e-ticket barcode siap scan',
    ],
  },
  {
    id: 'cinepolis',
    name: 'Cinépolis Cinemas',
    logoText: 'Cinépolis',
    discountText: 'Diskon s/d 30%',
    accentGradient: 'from-blue-500/20 to-indigo-600/10 border-blue-500/30',
    description: 'Promo nonton hemat di bioskop Cinépolis untuk studio Reguler, Macro XE audio Dolby Atmos, dan Cinépolis VIP.',
    ticketTypes: [
      {
        type: 'Cinépolis Regular (Weekday)',
        normalPrice: 'Rp 35.000 - Rp 45.000',
        promoPrice: 'Mulai Rp 25.000',
        saving: 'Hemat s/d Rp 20.000',
      },
      {
        type: 'Cinépolis Regular (Weekend)',
        normalPrice: 'Rp 50.000 - Rp 60.000',
        promoPrice: 'Mulai Rp 38.000',
        saving: 'Hemat s/d Rp 22.000',
      },
      {
        type: 'Cinépolis VIP / Macro XE',
        normalPrice: 'Rp 75.000 - Rp 100.000',
        promoPrice: 'Mulai Rp 55.000',
        saving: 'Hemat s/d Rp 35.000',
      },
    ],
    terms: [
      'Tiket 100% legal dan terbit langsung dari sistem resmi',
      'Pemesanan cepat dan praktis via WhatsApp admin',
      'Tidak ada biaya admin tambahan tersembunyi',
    ],
  },
];

export const cinemaBookingSteps = [
  {
    step: '01',
    title: 'Cek Jadwal & Posisi Kursi',
    description: 'Buka aplikasi M-Tix, CGV, atau TIX ID untuk melihat jadwal tayang dan nomor kursi yang Anda inginkan.',
  },
  {
    step: '02',
    title: 'Kirim Format ke WhatsApp',
    description: 'Klik tombol pesan tiket dan kirim format: Bioskop, Judul Film, Jam Tayang, & Jumlah Tiket ke admin.',
  },
  {
    step: '03',
    title: 'Pembayaran Promo Hemat',
    description: 'Admin menghitungkan total harga promo diskon. Lakukan pembayaran via QRIS atau Transfer Bank.',
  },
  {
    step: '04',
    title: 'Terima Barcode E-Ticket',
    description: 'Admin mengirimkan kode booking / barcode tiket. Anda tinggal cetak di mesin kiosk bioskop dan selamat menonton!',
  },
];
