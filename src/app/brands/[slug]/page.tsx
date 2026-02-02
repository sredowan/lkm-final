import React from 'react';
import brandsData from '@/data/brands.json';
import repairsData from '@/data/repairs.json';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, ChevronRight, MapPin, Truck, Award } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
    params: {
        slug: string;
    }
}

export function generateStaticParams() {
    return brandsData.map((brand) => ({
        slug: brand.slug,
    }));
}

// SEO Metadata Generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const brand = brandsData.find(b => b.slug === slug);

    if (!brand) {
        return {
            title: 'Brand Not Found | Lakemba Mobile King',
        };
    }

    return {
        title: `Fast ${brand.name} Repairs in Lakemba | Lakemba Mobile King`,
        description: `Professional ${brand.name} repair services in Lakemba. Expert technicians, 6-month warranty, 30-minute repairs. Screen replacement, battery, water damage & more. Call 0410 807 546 for a free quote.`,
        keywords: `${brand.name} repair, ${brand.name} screen replacement, ${brand.name} battery, Lakemba phone repair, mobile repair Lakemba`,
        openGraph: {
            title: `${brand.name} Repairs - Lakemba Mobile King`,
            description: `Expert ${brand.name} repair services in Lakemba with 6-month warranty. Fast, reliable, professional.`,
            images: [brand.image],
        }
    };
}

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params);
    const brand = brandsData.find(b => b.slug === slug);

    if (!brand) {
        notFound();
    }

    const brandName = brand.name;
    const phone = "0410 807 546";

    const faqs = [
        {
            q: "What does my repair estimate include?",
            a: "Our estimates include premium parts, expert labor, and a 6-month warranty. There are no hidden fees."
        },
        {
            q: "What types of phones or tablets do you repair?",
            a: "We repair almost all major brands including Apple, Samsung, Oppo, Google Pixel, and more. From latest flagships to older models."
        },
        {
            q: "What if there are more repairs required to get my phone back in working condition?",
            a: "If we find additional issues, we will contact you immediately with a revised quote before proceeding with any extra work."
        },
        {
            q: "When should a phone's battery be replaced?",
            a: "Generally, if your battery health is below 80% or you experience sudden shutdowns, it's time for a replacement."
        },
        {
            q: "What is a Door to Door Repair?",
            a: "We come to your location in Lakemba and surrounding areas to fix your device on the spot in our mobile repair unit."
        },
        {
            q: "Will I lose my data?",
            a: "While most repairs don't affect data, we always recommend backing up your device before any service as a precaution."
        }
    ];

    return (
        <div className="bg-white -mt-[88px]"> {/* Negative margin to overlap with the global header */}
            {/* 1. Hero Section */}
            <section className="relative h-[500px] md:h-[600px] flex items-center overflow-hidden">
                <Image
                    src={brand.heroImage || brand.image}
                    alt={`${brandName} Repairs`}
                    fill
                    className="object-cover"
                    priority
                />
                {/* Royal Blue Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/70 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10 pt-32 md:pt-40">
                    <div className="max-w-3xl">
                        <div className="w-24 h-1.5 bg-brand-yellow mb-8 animate-pulse"></div>
                        <h1 className="font-[var(--font-poppins)] text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                            {brandName} Repairs
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-100 font-light mb-8">Expert repairs with royal treatment</p>
                        <Link
                            href="/repair"
                            className="inline-flex items-center bg-brand-yellow hover:bg-yellow-400 text-gray-900 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-xl"
                        >
                            Get Free Quote
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. Product Overview Section */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col-reverse md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
                            <Image
                                src={brand.image}
                                alt={`${brandName} Service`}
                                fill
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <h2 className="font-[var(--font-poppins)] text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                {brandName} Repairs
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {brand.description}
                            </p>
                            <Link
                                href="/repair"
                                className="inline-flex items-center bg-brand-blue hover:bg-blue-800 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg"
                            >
                                Get a Free Repair Quote
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CTA Bar */}
            <section className="bg-brand-blue py-8 shadow-lg">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white">
                        <span className="font-[var(--font-poppins)] text-2xl md:text-3xl font-bold tracking-wide">Need Help? We're Here For You</span>
                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 bg-brand-yellow text-gray-900 py-3 px-8 rounded-full font-bold text-xl hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg">
                            <Phone className="w-6 h-6" />
                            {phone}
                        </a>
                    </div>
                </div>
            </section>

            {/* 4. Information Grid */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Info Column */}
                        <div className="space-y-6">
                            <h3 className="font-[var(--font-poppins)] text-2xl font-bold text-gray-900 border-b-2 border-brand-yellow pb-2 inline-block">
                                {brandName} Repairs Information
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {brand.details}
                            </p>
                            <p className="text-gray-700 font-medium">
                                {brand.subDetails}
                            </p>
                        </div>

                        {/* Services Column */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-brand-blue transition-all duration-300">
                            <h3 className="font-[var(--font-poppins)] text-2xl font-bold text-gray-900 mb-8">Our Services</h3>
                            <ul className="space-y-4">
                                {brand.serviceList?.map((service, idx) => (
                                    <li key={idx} className="flex items-start gap-3 group">
                                        <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-brand-yellow group-hover:scale-150 transition-transform" />
                                        <span className="text-gray-600 group-hover:text-brand-blue transition">{service}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Devices Column */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-brand-blue transition-all duration-300">
                            <h3 className="font-[var(--font-poppins)] text-2xl font-bold text-gray-900 mb-8">Devices We Fix</h3>
                            <ul className="space-y-4">
                                {brand.deviceList?.map((device, idx) => (
                                    <li key={idx} className="flex items-start gap-3 group">
                                        <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-brand-blue group-hover:scale-150 transition-transform" />
                                        <span className="text-gray-600 group-hover:text-brand-blue transition">{device}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Why We Are Section */}
            <section className="py-24 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-[var(--font-poppins)] text-3xl md:text-5xl font-bold mb-16 text-gray-900">
                        Why We Are The <span className="text-brand-blue italic underline decoration-brand-yellow underline-offset-8 decoration-4">Lakemba Mobile King</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-brand-blue transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
                            <div className="w-24 h-24 mb-6 relative group-hover:scale-110 transition-transform duration-300">
                                <Image src="/uploads/fast-repairs.svg" alt="Fast Repairs" fill />
                            </div>
                            <h4 className="font-[var(--font-poppins)] text-xl font-bold mb-3 text-gray-900">Fast 30min Repairs</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Most repairs are completed in under 30 minutes while you wait.</p>
                        </div>
                        <div className="group flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-brand-blue transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
                            <div className="w-24 h-24 mb-6 relative group-hover:scale-110 transition-transform duration-300">
                                <Image src="/uploads/stores-nationwide.svg" alt="Local Store" fill />
                            </div>
                            <h4 className="font-[var(--font-poppins)] text-xl font-bold mb-3 text-gray-900">Your Local Lakemba Store</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Located in the heart of Lakemba, easily accessible for everyone.</p>
                        </div>
                        <div className="group flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-brand-blue transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
                            <div className="w-24 h-24 mb-6 relative group-hover:scale-110 transition-transform duration-300">
                                <Image src="/uploads/warranty.svg" alt="Warranty" fill />
                            </div>
                            <h4 className="font-[var(--font-poppins)] text-xl font-bold mb-3 text-gray-900">6 Months Warranty</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">We stand by our work with a comprehensive 6-month warranty on parts.</p>
                        </div>
                        <div className="group flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-brand-blue transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
                            <div className="w-24 h-24 mb-6 relative group-hover:scale-110 transition-transform duration-300">
                                <Image src="/uploads/repair.svg" alt="Expert Technicians" fill />
                            </div>
                            <h4 className="font-[var(--font-poppins)] text-xl font-bold mb-3 text-gray-900">Highly Trained Technicians</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Our specialists are certified and experienced in all major brands.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. FAQ Section */}
            <section className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="font-[var(--font-poppins)] text-4xl font-bold mb-4">FAQ's</h2>
                        <p className="text-gray-500">Get answers to common questions about our repair services, warranty, and more!</p>
                    </div>
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:border-brand-blue transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <ChevronRight className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-[var(--font-poppins)] font-bold text-lg mb-2 text-gray-900">{faq.q}</h4>
                                        <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Action Footer */}
            <section className="grid grid-cols-1 md:grid-cols-3">
                <Link href="/repair" className="bg-brand-blue hover:bg-blue-800 py-12 px-8 text-center text-white transition-all group border-r border-blue-700 hover:shadow-xl">
                    <Award className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-[var(--font-poppins)] text-2xl font-bold mb-4">Book Your Repair Online</h3>
                    <div className="inline-block border-2 border-white rounded-full px-6 py-2 text-sm font-bold group-hover:bg-brand-yellow group-hover:text-gray-900 group-hover:border-brand-yellow transition">Get an estimate</div>
                </Link>
                <Link href="/#contact" className="bg-brand-blue hover:bg-blue-800 py-12 px-8 text-center text-white transition-all group border-r border-blue-700 hover:shadow-xl">
                    <MapPin className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-[var(--font-poppins)] text-2xl font-bold mb-4">Find Your Local Store</h3>
                    <div className="inline-block border-2 border-white rounded-full px-6 py-2 text-sm font-bold group-hover:bg-brand-yellow group-hover:text-gray-900 group-hover:border-brand-yellow transition">Store Finder</div>
                </Link>
                <Link href="/services/in-home-repairs" className="bg-brand-blue hover:bg-blue-800 py-12 px-8 text-center text-white transition-all group hover:shadow-xl">
                    <Truck className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-[var(--font-poppins)] text-2xl font-bold mb-4">Door to Door Repair</h3>
                    <div className="inline-block border-2 border-white rounded-full px-6 py-2 text-sm font-bold group-hover:bg-brand-yellow group-hover:text-gray-900 group-hover:border-brand-yellow transition">Repair Quote</div>
                </Link>
            </section>
        </div>
    );
}
