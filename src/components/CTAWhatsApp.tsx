import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export default function CTAWhatsApp() {
  return (
    <section className="py-16 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-emerald-950/40 border border-zinc-800 p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-xs font-semibold text-emerald-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Respon Cepat 24 Jam</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Punya Pertanyaan atau Ingin Request Aplikasi?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Admin kami siap membantu ketersediaan produk, konsultasi brief video/desain, atau pemesanan tiket bioskop promo kapan saja.
          </p>

          <a
            href={createWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Hubungi Admin via WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
