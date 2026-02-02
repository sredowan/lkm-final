import React from 'react';
import servicesData from '@/data/services.json';
import repairsData from '@/data/repairs.json';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
    params: {
        slug: string;
    }
}

export function generateStaticParams() {
    return servicesData.map((service) => ({
        slug: service.slug,
    }));
}

export default function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params);
    const service = servicesData.find(s => s.slug === slug);

    if (!service) {
        notFound();
    }

    // Filter repairs by keyword matching matches
    const keywords = service.keywords || [service.title];
    const repairs = repairsData.filter(r =>
        keywords.some(k => r.issue.toLowerCase().includes(k.toLowerCase()))
    );

    // Sort by Brand for better readability
    const repairsByBrand = repairs.reduce((acc, repair) => {
        if (!acc[repair.brand]) {
            acc[repair.brand] = [];
        }
        acc[repair.brand].push(repair);
        return acc;
    }, {} as Record<string, typeof repairs>);

    const brands = Object.keys(repairsByBrand).sort();

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-brand-blue text-white py-16">
                <div className="container mx-auto px-4">
                    <Link href="/services" className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
                    <p className="text-xl text-blue-100 max-w-2xl">
                        {service.description}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {brands.length > 0 ? (
                    <div className="space-y-12">
                        {brands.map(brand => (
                            <div key={brand}>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-brand-yellow pl-4">{brand}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {repairsByBrand[brand].map((repair, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{repair.model}</h4>
                                                <p className="text-sm text-gray-500">{repair.time}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-brand-blue text-lg">
                                                    {repair.price === "N/A" || repair.price === "0" ? "Call" : `$${repair.price}`}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-2xl font-bold text-gray-400">Pricing lists are being updated for this service.</h3>
                        <p className="text-gray-500 mt-4">Please contact us directly for an instant quote over the phone.</p>
                        <Link href="/repair" className="inline-block mt-8 bg-brand-yellow text-brand-blue px-8 py-3 rounded-lg font-bold">
                            Get Quote Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
