'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Smartphone,
    ShieldCheck,
    Clock,
    MapPin,
    Phone,
    Mail,
    CheckCircle2,
    Wrench,
    Award,
    Users
} from 'lucide-react';

const AboutPage = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="bg-white text-gray-900 overflow-hidden">
            {/* 1. Impactful Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center bg-gray-900 border-b border-gray-800 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-transparent"></div>
                    <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                        {[...Array(64)].map((_, i) => (
                            <div key={i} className="border-[0.5px] border-white/10"></div>
                        ))}
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-yellow/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block py-1 px-3 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30 text-xs font-bold tracking-wider mb-6"
                    >
                        GET TO KNOW US
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight"
                    >
                        About <span className="text-brand-yellow uppercase">Lakemba Mobile King</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Your trusted local destination for expert mobile phone repairs and premium tech accessories.
                    </motion.p>
                </div>
            </section>

            {/* 2. Our Journey & Mission */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            variants={fadeIn}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="lg:w-1/2"
                        >
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-yellow rounded-2xl -z-10 blur-2xl opacity-20"></div>
                                <h2 className="text-4xl font-bold mb-8 text-gray-900 border-l-4 border-brand-blue pl-6">
                                    Trusted Tech Experts in <span className="text-brand-blue">Lakemba</span>
                                </h2>
                            </div>
                            <div className="space-y-6 text-lg text-gray-700 leading-relaxed font-light">
                                <p>
                                    Lakemba Mobile King is your trusted local destination for all mobile phone and tech needs.
                                    Conveniently located at Railway Parade, we specialize in fast, reliable smartphone repairs
                                    and a wide range of quality accessories—all under one roof.
                                </p>
                                <p>
                                    Our experienced technicians handle everything from screen repairs and battery replacements
                                    to software issues, using genuine parts and proven techniques. We’re committed to honest
                                    pricing, quick turnaround times, and customer satisfaction you can rely on.
                                </p>
                                <p className="font-medium text-gray-900 italic bg-gray-50 p-6 rounded-2xl border-l-4 border-brand-yellow">
                                    "Whether you need an urgent repair, a new phone case, or tech accessories,
                                    Lakemba Mobile King is right around the corner—ready to help."
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-transparent"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000"
                                    alt="Expert Phone Repair"
                                    className="w-full h-full object-cover"
                                />
                                {/* Achievement Badges */}
                                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
                                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold">100%</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Certified</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-yellow/20 rounded-lg text-brand-yellow">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold">5k+</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Clients</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-yellow rounded-full -z-10 blur-3xl opacity-30"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. Core Values Grid */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-brand-blue font-bold uppercase tracking-[0.2em] text-sm mb-4 block">WHY WE ARE THE KINGS</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Our Core Promises</h2>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            {
                                icon: <Wrench className="w-8 h-8" />,
                                title: "Genuine Parts",
                                desc: "We use high-quality, genuine parts for all repairs to ensure your device lasts longer.",
                                color: "bg-blue-500"
                            },
                            {
                                icon: <Clock className="w-8 h-8" />,
                                title: "Quick Turnaround",
                                desc: "Most repairs are completed on the same day, often while you wait in our store.",
                                color: "bg-amber-500"
                            },
                            {
                                icon: <ShieldCheck className="w-8 h-8" />,
                                title: "Honest Pricing",
                                desc: "No hidden fees or surprise charges. We provide clear, upfront quotes before we start.",
                                color: "bg-green-500"
                            },
                            {
                                icon: <CheckCircle2 className="w-8 h-8" />,
                                title: "LKM Guarantee",
                                desc: "Our work is backed by a solid warranty, giving you complete peace of mind.",
                                color: "bg-purple-500"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group hover:-translate-y-2"
                            >
                                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                <p className="text-gray-600 font-light leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 4. Find Us Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl relative">
                        {/* Decorative Blur */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex flex-col lg:flex-row">
                            <div className="lg:w-1/2 p-12 md:p-20 text-white">
                                <motion.div
                                    variants={fadeIn}
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Visit Us In Person</h2>
                                    <p className="text-xl text-gray-400 mb-12 font-light leading-relaxed">
                                        Drop by our store for a free consultation or to pick up the latest mobile accessories.
                                        We're conveniently located in the heart of Lakemba.
                                    </p>

                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6 group">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-brand-yellow border border-white/10 group-hover:bg-brand-yellow group-hover:text-gray-900 transition-all">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-bold">Our Location</p>
                                                <p className="text-xl font-medium">52 Railway Parade</p>
                                                <p className="text-gray-400 font-light">Lakemba, NSW 2195</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 group">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-brand-blue border border-white/10 group-hover:bg-brand-blue group-hover:text-white transition-all">
                                                <Phone className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-bold">Call Us</p>
                                                <p className="text-xl font-medium">0410 807 546</p>
                                                <p className="text-gray-400 font-light underline hover:text-white cursor-pointer transition-colors">Open 2pm - 11pm Daily</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 group">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-red-400 border border-white/10 group-hover:bg-red-400 group-hover:text-white transition-all">
                                                <Mail className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-bold">Email Us</p>
                                                <p className="text-xl font-medium">info@lakembamobileking.com.au</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Map / Visual Placeholder */}
                            <div className="lg:w-1/2 min-h-[400px] bg-gray-800 relative group overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000"
                                    alt="Our Store"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-gray-900 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-12 right-12">
                                    <div className="bg-brand-yellow text-gray-900 px-8 py-4 rounded-2xl font-bold shadow-2xl hover:bg-white transition-colors cursor-pointer">
                                        GET DIRECTIONS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
