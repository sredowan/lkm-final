'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BrandsGrid() {
    const brands = [
        { name: 'Apple', slug: 'apple' },
        { name: 'Samsung', slug: 'samsung' },
        { name: 'Google', slug: 'google' },
        { name: 'Oppo', slug: 'oppo' },
        { name: 'Xiaomi', slug: 'xiaomi' },
        { name: 'Motorola', slug: 'motorola' },
        { name: 'Vivo', slug: 'vivo' },
        { name: 'OnePlus', slug: 'oneplus' },
    ];

    return (
        <section className="pt-0 pb-2 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-6">
                    <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">We Repair All Major Brands</p>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 md:gap-6">
                    {brands.map((brand, index) => (
                        <motion.div
                            key={brand.slug}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={`/services/${brand.slug}-repair`}
                                className="flex items-center justify-center p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all group h-full aspect-square md:aspect-auto md:h-24"
                            >
                                <img
                                    src={`https://cdn.simpleicons.org/${brand.slug}/default`}
                                    alt={brand.name}
                                    className="w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-110"
                                />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
