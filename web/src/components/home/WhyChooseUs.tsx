'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, ThumbsUp, Zap, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const features = [
    {
        icon: ShieldCheck,
        title: "Lifetime Warranty",
        desc: "We stand by our quality. Most screen repairs come with a lifetime warranty for peace of mind.",
        color: "text-green-500",
        bg: "bg-green-50"
    },
    {
        icon: Award,
        title: "Certified Technicians",
        desc: "Our team consists of highly trained experts who have fixed thousands of devices.",
        color: "text-brand-blue",
        bg: "bg-blue-50"
    },
    {
        icon: ThumbsUp,
        title: "Best Price Guarantee",
        desc: "Find a lower price? We'll match it. Making premium repairs affordable for everyone.",
        color: "text-amber-500",
        bg: "bg-amber-50"
    },
    {
        icon: Zap,
        title: "Fast Turnaround",
        desc: "Most repairs are done in under 30 minutes while you wait in our comfortable lounge.",
        color: "text-purple-500",
        bg: "bg-purple-50"
    }
];

export default function WhyChooseUs() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-12 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-16 items-start lg:items-center">
                    {/* Text and Features */}
                    <div className="w-full lg:w-1/2">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-brand-yellow font-bold tracking-wider uppercase text-sm mb-4 block"
                        >
                            Why Choose Lakemba Mobile King?
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                        >
                            We treat your device <br /> like it's our own.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 text-lg mb-8 leading-relaxed"
                        >
                            With over 10 years of experience in the industry, we have established ourselves as Lakemba's premier repair centre. We don't cut corners on quality.
                        </motion.p>

                        {/* Desktop Grid Layout */}
                        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + (index * 0.1) }}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 ${feature.color}`}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Mobile Accordion Layout */}
                        <div className="lg:hidden flex flex-col gap-4">
                            {features.map((feature, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggle(index)}
                                            className="w-full flex items-center justify-between p-4 text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center ${feature.color}`}>
                                                    <feature.icon className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-gray-900">{feature.title}</h3>
                                            </div>
                                            <ChevronDown className={clsx("w-5 h-5 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    <div className="px-4 pb-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-50 mt-1">
                                                        <div className="pt-3">
                                                            {feature.desc}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Image / Graphic - Hidden on Mobile */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="hidden lg:block w-full lg:w-5/12 xl:w-1/3 relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500">
                            {/* Replaced broken external link with local high-quality generated asset */}
                            <img
                                src="/technician-repair.png"
                                alt="Technician working on motherboard"
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                                <div className="text-white">
                                    <p className="font-bold text-3xl">100k+</p>
                                    <p className="opacity-80">Devices Repaired</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -z-10 top-10 -right-10 w-32 h-32 bg-brand-yellow/30 rounded-full blur-2xl"></div>
                        <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-brand-blue/30 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
