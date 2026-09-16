'use client';

import React, { useState, useEffect } from 'react';
import { Service } from '@/types/database';
import { initialServices } from '@/data/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAdminPortal } from '@/context/AdminPortalContext';
import ServiceCard from './ServiceCard';
import { Sparkles, Loader2 } from 'lucide-react';

export default function ServicesSection() {
  const { dataVersion } = useAdminPortal();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      if (!isSupabaseConfigured()) {
        setServices(initialServices);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Gagal memuat jasa dari Supabase, menggunakan data fallback:', error.message);
          setServices(initialServices);
        } else if (data && data.length > 0) {
          setServices(data as Service[]);
        } else {
          setServices(initialServices);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setServices(initialServices);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [dataVersion]);

  return (
    <section id="jasa" className="py-16 bg-zinc-900/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 text-xs font-medium text-purple-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Layanan Kreatif</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              🎬 Jasa Editing & Digital Service
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Solusi konten visual menarik untuk media sosial, bisnis, dan personal branding Anda.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            <span className="ml-2 text-xs text-zinc-400">Memuat jasa digital...</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
