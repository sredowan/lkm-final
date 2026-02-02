"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000&auto=format&fit=crop",
        title: "Latest iPhone 15 Pro",
        subtitle: "Experience the Titanium Strength",
        cta: "Shop Now",
        link: "/shop?category=iphone",
        color: "bg-[#1c1c1c]"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2000&auto=format&fit=crop",
        title: "Samsung Galaxy S24 Ultra",
        subtitle: "The Power of Galaxy AI",
        cta: "Explore More",
        link: "/shop?brand=samsung",
        color: "bg-[#0b1424]"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1556656793-062ff9878286?q=80&w=2000&auto=format&fit=crop",
        title: "Premium Accessories",
        subtitle: "Protect Your Style",
        cta: "View All",
        link: "/shop?category=accessories",
        color: "bg-brand-blue"
    }
];

export default function StoreHero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative h-[400px] md:h-[600px] overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className={`absolute inset-0 ${slides[current].color}`}
                >
                    <div className="absolute inset-0 bg-black/30 md:bg-transparent">
                        <img
                            src={slides[current].image}
                            alt={slides[current].title}
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>

                    <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-2xl text-white"
                        >
                            <h3 className="text-brand-yellow font-bold uppercase tracking-widest text-sm mb-4">New Arrival</h3>
                            <h2 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">{slides[current].title}</h2>
                            <p className="text-xl md:text-2xl mb-10 opacity-90 font-light">{slides[current].subtitle}</p>
                            <button className="bg-brand-yellow text-brand-blue px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-xl">
                                {slides[current].cta}
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-10 right-4 md:right-10 flex gap-4 z-20">
                <button
                    onClick={prev}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-brand-blue transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={next}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-brand-blue transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-3 h-3 rounded-full transition-all ${current === i ? 'bg-brand-yellow w-8' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </section>
    );
}
