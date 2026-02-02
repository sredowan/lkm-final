'use client';

import React, { useState } from 'react';
import { Smartphone, Battery, Droplets, Zap, Camera, Speaker, Power, ArrowRight, Watch, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import servicesData from '@/data/services.json';

// Icon mapping
const iconMap: { [key: string]: any } = {
    Smartphone,
    Battery,
    Droplets,
    Zap,
    Camera,
    Speaker,
    Power,
    Watch,
    Truck
};

export default function ServicesPage() {
    const [expandedService, setExpandedService] = useState<string | null>(null);

    const toggleService = (id: string) => {
        setExpandedService(expandedService === id ? null : id);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-brand-blue text-white pt-32 pb-16 md:pt-48 md:pb-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-blue-900 opacity-50" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
                    >
                        Our Repair Services
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed"
                    >
                        Expert solutions for all your device problems. Quality parts, fast turnaround, and professional service.
                    </motion.p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container mx-auto px-4 mt-8 md:mt-12 relative z-20">
                <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {servicesData.map((service, index) => {
                        const Icon = iconMap[service.icon] || Smartphone;
                        const isExpanded = expandedService === service.id;

                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col
                                    ${isExpanded ? 'col-span-3 md:col-span-2 lg:col-span-1 ring-2 ring-brand-yellow/50' : ''}
                                `}
                            >
                                <div
                                    className="p-3 md:p-8 cursor-pointer flex flex-col items-center md:items-start text-center md:text-left h-full"
                                    onClick={() => toggleService(service.id)}
                                >
                                    <div className={`
                                        p-2 md:p-4 rounded-lg md:rounded-xl mb-3 md:mb-6 transition-colors duration-300
                                        ${isExpanded ? 'bg-brand-yellow text-brand-blue' : 'bg-brand-blue/5 text-brand-blue'}
                                    `}>
                                        <Icon className="w-6 h-6 md:w-10 md:h-10" />
                                    </div>

                                    <h3 className="text-[10px] md:text-2xl font-bold text-gray-900 mb-1 md:mb-3 leading-tight uppercase md:normal-case">
                                        {service.title.split(' ').slice(0, 2).join(' ')}
                                        {service.title.split(' ').length > 2 && (
                                            <span className="hidden md:inline"> {service.title.split(' ').slice(2).join(' ')}</span>
                                        )}
                                    </h3>

                                    <p className="hidden md:block text-gray-600 mb-6 flex-grow leading-relaxed line-clamp-3">
                                        {service.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-center md:justify-between w-full">
                                        <span className="text-[8px] md:text-sm font-bold text-brand-blue uppercase tracking-wider hidden md:block">
                                            {isExpanded ? 'Show Less' : 'View Details'}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp className="w-3 h-3 md:w-5 md:h-5 text-brand-blue" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3 md:w-5 md:h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-gray-100 bg-gray-50/50"
                                        >
                                            <div className="p-4 md:p-8">
                                                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                                                    {service.details || service.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {service.keywords?.map((keyword: string) => (
                                                        <span key={keyword} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] md:text-xs text-gray-500 font-medium">
                                                            #{keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                                <Link
                                                    href={`/services/${service.slug}`}
                                                    className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-xs md:text-sm hover:bg-blue-700 transition"
                                                >
                                                    Book Repair <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* OTA CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="container mx-auto px-4 mt-20 md:mt-32 text-center"
            >
                <div className="bg-white rounded-3xl p-8 md:p-16 shadow-xl border border-gray-100 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Can't find what you're looking for?</h2>
                    <p className="text-gray-600 mb-8 md:mb-10 text-lg">
                        We repair almost every device imaginable. Our technicians are ready for any challenge.
                    </p>
                    <Link
                        href="/repair"
                        className="inline-flex items-center gap-3 bg-brand-yellow text-brand-blue font-extrabold px-8 py-4 md:px-10 md:py-5 rounded-2xl hover:bg-yellow-400 transition transform hover:-translate-y-1 shadow-lg shadow-yellow-200"
                    >
                        Get a Free Quote Now
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
