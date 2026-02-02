import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import brandsData from '@/data/brands.json';

export default function BrandsPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Brands We Fix</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Specialized repairs for all major smartphone and tablet manufacturers.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {brandsData.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brands/${brand.slug}`}
                            className="block group bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition border border-gray-100 hover:border-brand-yellow/50"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">{brand.name}</h3>
                                <div className="bg-white p-2 rounded-full shadow-sm group-hover:bg-brand-yellow transition">
                                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-brand-blue" />
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4">{brand.description}</p>
                            <span className="text-brand-blue font-semibold group-hover:underline">View Repairs</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
