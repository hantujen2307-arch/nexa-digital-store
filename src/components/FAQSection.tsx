'use client';

import React, { useState } from 'react';
import { faqData } from '@/data/faq';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <section id="faq" className="py-20 bg-zinc-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs font-medium text-cyan-400 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pertanyaan Umum</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Jawaban lengkap seputar garansi akun, pembayaran, dan alur layanan kami.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 mb-12">
          {faqData.map((item, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-sm sm:text-base font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 bg-zinc-900/20">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Callout box for more questions */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              Masih punya pertanyaan lain yang belum terjawab?
            </h4>
            <p className="text-xs text-zinc-400">
              Admin kami siap melayani dan memberikan panduan lengkap dengan senang hati.
            </p>
          </div>

          <a
            href={createWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Tanya Admin Langsung</span>
          </a>
        </div>
      </div>
    </section>
  );
}
