import Hero from "@/components/home/Hero";
import BrandsGrid from "@/components/home/BrandsGrid";
import ServicesGrid from "@/components/home/ServicesGrid";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Process from "@/components/home/Process";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import { Phone, MapPin } from "lucide-react";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-white">
      {/* 1. Hero Section with Quick Quote */}
      <Hero />

      {/* 2. Brands Grid - Trust signals immediately after hero */}
      <section className="bg-white pt-4 pb-0 border-b border-gray-100">
        <BrandsGrid />
      </section>

      {/* 3. Why Choose Us - Value Proposition */}
      <WhyChooseUs />

      {/* 4. Reviews Carousel - Social Proof */}
      <ReviewsCarousel />

      {/* 5. Services Grid - Main Business Offerings */}
      <ServicesGrid />

      {/* 5. Process - How it works */}
      <Process />

      {/* 6. CTA Section - Final push to visit */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-xs font-bold tracking-wider mb-6">
            WAITING FOR YOU
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Visit Lakemba Mobile King</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light">
            We are open 7 days a week. Walk-ins welcome for instant repairs. No appointment needed.
          </p>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-4xl mx-auto">
            {/* Location Card */}
            <div className="flex-1 bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer hover:-translate-y-1">
              <div className="flex flex-col items-center gap-4 h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Our Location</span>
                  <p className="font-bold text-2xl mb-1">52 Railway Parade</p>
                  <p className="text-lg text-gray-300">Lakemba, NSW 2195</p>
                  <a href="https://maps.google.com" target="_blank" className="inline-block mt-4 text-brand-yellow hover:text-white transition-colors text-sm font-bold">Get Directions →</a>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="flex-1 bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer hover:-translate-y-1">
              <div className="flex flex-col items-center gap-4 h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-yellow to-amber-500 rounded-2xl flex items-center justify-center text-gray-900 shadow-lg group-hover:scale-110 transition-transform">
                  <Phone className="w-8 h-8" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Call Us Now</span>
                  <p className="text-3xl font-bold mb-1">0410 807 546</p>
                  <p className="text-lg text-gray-300">Open 2pm - 11pm</p>
                  <a href="tel:0410807546" className="inline-block mt-4 text-brand-yellow hover:text-white transition-colors text-sm font-bold">Call Now →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
