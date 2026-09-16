import React from 'react';
import { ShoppingBag, Tag, MessageCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HowToOrder() {
  const steps = [
    {
      num: '01',
      title: 'Pilih Produk',
      description: 'Pilih aplikasi premium, jasa editing, atau tiket bioskop promo yang Anda butuhkan.',
      icon: ShoppingBag,
      color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50',
    },
    {
      num: '02',
      title: 'Pilih Paket',
      description: 'Tentukan durasi paket atau varian layanan yang sesuai dengan budget Anda.',
      icon: Tag,
      color: 'text-purple-400 bg-purple-950/40 border-purple-800/50',
    },
    {
      num: '03',
      title: 'Klik Beli via WhatsApp',
      description: 'Klik tombol Beli/Pesan, pesan otomatis siap kirim akan langsung terbuka di chat WhatsApp.',
      icon: MessageCircle,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
    },
    {
      num: '04',
      title: 'Selesaikan Pembayaran & Proses Pesanan',
      description: 'Lakukan pembayaran via QRIS atau Transfer Bank. Pesanan langsung diproses cepat 5-15 menit.',
      icon: CheckCircle2,
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
    },
  ];

  return (
    <section id="cara-order" className="py-16 bg-zinc-900/40 border-t border-b border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs font-medium text-cyan-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Alur Simpel Tanpa Login</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            🛒 Cara Order
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Belanja cepat dan aman tanpa perlu registrasi akun atau login pelanggan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 sm:p-6 flex flex-col justify-between hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl border p-2.5 flex items-center justify-center ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-zinc-800">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
