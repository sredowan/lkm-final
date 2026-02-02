import React from 'react';
import { Smartphone, Battery, Droplets, Zap, Camera, Speaker, Power, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import servicesData from '@/data/services.json';

// Icon mapping
const iconMap: { [key: string]: any } = {
    Smartphone,
    Battery,
    Droplets,
    Zap,
    Camera,
    Speaker,
    Power
};

export default function ServicesPage() {
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-brand-blue text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Repair Services</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        We fix it all. From cracked screens to water damage, our expert technicians use high-quality parts to get your device back to new.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container mx-auto px-4 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicesData.map((service) => {
                        const Icon = iconMap[service.icon] || Smartphone;
                        return (
                            <div key={service.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition flex flex-col items-start border border-gray-100">
                                <div className="bg-brand-yellow/10 p-4 rounded-xl mb-6">
                                    <Icon className="w-10 h-10 text-brand-blue" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                                    {service.description}
                                </p>
                                <Link
                                    href={`/services/${service.slug}`}
                                    className="group flex items-center gap-2 font-bold text-brand-blue hover:text-brand-yellow transition"
                                >
                                    Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* OTA CTA */}
            <div className="container mx-auto px-4 mt-20 text-center">
                <h2 className="text-3xl font-bold mb-6">Can't find what you're looking for?</h2>
                <p className="text-gray-600 mb-8">
                    We repair almost every device. Contact us for a custom quote.
                </p>
                <Link
                    href="/repair"
                    className="inline-block bg-brand-yellow text-brand-blue font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-yellow-100"
                >
                    Get a Free Quote
                </Link>
            </div>
        </div>
    );
}
