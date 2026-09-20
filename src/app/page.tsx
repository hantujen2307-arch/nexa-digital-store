import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import ServicesSection from '@/components/ServicesSection';
import FoodDrinksSection from '@/components/FoodDrinksSection';
import CinemaSection from '@/components/CinemaSection';
import HowToOrder from '@/components/HowToOrder';
import CTAWhatsApp from '@/components/CTAWhatsApp';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import IntroAnimation from '@/components/IntroAnimation';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-zinc-950">
      {/* 🎬 Cinematic TV Commercial Intro (±5s) */}
      <IntroAnimation />

      {/* Konten Homepage (Dimuat di background, bertransisi mulus ke tajam di detik 4.4 - 5.0) */}
      <div id="homepage-content" className="flex-1 flex flex-col">
        {/* Navbar Publik (Tanpa Login Customer) */}
        <Navbar />

        <main className="flex-1">
          {/* 1. Hero Section */}
          <Hero />

          {/* 2. 🔥 Aplikasi Premium (15 Produk: 4 col desktop, 3 tablet, 2 mobile) */}
          <ProductGrid />

          {/* 3. 🎬 Jasa Editing & Digital Service */}
          <ServicesSection />

          {/* 4. 🎟️ Promo Tiket Bioskop */}
          <CinemaSection />

          {/* 5. 🍴 Makanan & Minuman */}
          <FoodDrinksSection />

          {/* 6. 🛒 Cara Order (4 Langkah Tanpa Login) */}
          <HowToOrder />

          {/* 7. CTA WhatsApp Bantuan */}
          <CTAWhatsApp />
        </main>

        {/* Footer & Floating WhatsApp */}
        <Footer />
        <FloatingWhatsApp />
      </div>
    </div>
  );
}
