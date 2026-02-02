'use client';

import Link from 'next/link';
import QuickQuote from './QuickQuote';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative w-full min-h-[85vh] flex items-center bg-gray-900 overflow-hidden font-poppins">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/hero-bg-premium.png")',
                }}
            />

            {/* Gradient Overlay - darker for better text readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-brand-blue/30" />

            {/* Animated particles or subtle overlay effects could go here */}

            <div className="container mx-auto px-4 relative z-10 pt-32 pb-24 md:py-32">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 text-white text-center lg:text-left space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-sm font-bold tracking-wider mb-4">
                                #1 RATED REPAIR SERVICE IN LAKEMBA
                            </span>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                                Expert Repairs <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-yellow-200">
                                    Instant Solutions
                                </span>
                            </h1>
                        </motion.div>

                        {/* Mobile Form - Visible just after title on mobile */}
                        <div className="lg:hidden w-full max-w-md mx-auto mb-8">
                            <QuickQuote />
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            We bring your devices back to life. Professional mobile, tablet, and laptop repairs with premium parts and warranty you can trust.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                        >
                            <Link
                                href="/shop"
                                className="w-full sm:w-auto px-8 py-4 bg-brand-yellow text-gray-900 rounded-xl font-bold hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,193,7,0.4)] flex items-center justify-center gap-2"
                            >
                                Shop Accessories
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center"
                            >
                                Locate Store
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium text-gray-400"
                        >
                            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Open 7 Days
                            </div>
                            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                6 Months Warranty
                            </div>
                            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                30 Min Repairs
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content - Quote Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="hidden lg:block w-full lg:w-1/2 max-w-md"
                    >
                        <QuickQuote />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
