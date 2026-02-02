import React from 'react';
import QuickQuote from '@/components/home/QuickQuote';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function RepairPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Header */}
            <div className="bg-brand-blue text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Get a Repair Quote</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Transparent pricing, fast turnaround, and quality parts. Get an instant estimate for your device repair.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Quote Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Instant Price Estimator</h2>
                            <QuickQuote />
                            <p className="mt-6 text-sm text-gray-500 italic">
                                * Prices are subject to change. Final quote provided upon device inspection.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Why Choose Us */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold mb-4">Why Choose Us?</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                    <span>30 Minute Turnaround</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                    <span>6 Months Warranty</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                    <span>No Fix, No Fee</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                    <span>Best Price Guarantee</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-brand-blue/5 rounded-2xl p-8 border border-brand-blue/10">
                            <h3 className="text-xl font-bold mb-6 text-brand-blue">Visit Our Store</h3>
                            <div className="space-y-4 text-gray-600">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-brand-blue mt-1" />
                                    <p>Shop 2, 52 Railway Parade,<br />Lakemba, NSW 2195</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-brand-blue" />
                                    <a href="tel:0410807546" className="hover:text-brand-blue transition">0410 807 546</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-brand-blue" />
                                    <a href="mailto:lakembamobileking@gmail.com" className="hover:text-brand-blue transition">lakembamobileking@gmail.com</a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-brand-blue mt-1" />
                                    <p>Open 7 Days: 2:00 PM - 11:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
