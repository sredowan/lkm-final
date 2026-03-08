'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    Facebook,
    Instagram,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTouched({});

            // Reset after 5 seconds
            setTimeout(() => setStatus('idle'), 5000);
        }, 1500);
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* 1. Header Section */}
            <section className="bg-gray-900 py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold text-white mb-6 uppercase tracking-tight"
                    >
                        Contact <span className="text-brand-yellow">Us</span>
                    </motion.h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        Have a question about a repair or looking for specific accessories?
                        We're here to help you with expert advice and royal service.
                    </p>
                </div>
            </section>

            <section className="py-20 -mt-10 lg:-mt-16">
                <div className="container mx-auto px-4 text-gray-900">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* 2. Contact Information Cards */}
                        <div className="lg:w-1/3 xl:w-1/4 space-y-6">
                            {[
                                {
                                    icon: <MapPin className="w-6 h-6" />,
                                    title: "Visit Us",
                                    content: "Shop 2, 52 Railway Parade",
                                    sub: "Lakemba, NSW 2195",
                                    color: "bg-blue-500"
                                },
                                {
                                    icon: <Phone className="w-6 h-6" />,
                                    title: "Call Us",
                                    content: "0410 807 546",
                                    sub: "Available 2pm - 11pm",
                                    color: "bg-amber-500"
                                },
                                {
                                    icon: <Mail className="w-6 h-6" />,
                                    title: "Email Us",
                                    content: "lakembamobileking@gmail.com",
                                    sub: "Response within 24h",
                                    color: "bg-red-500"
                                },
                                {
                                    icon: <Clock className="w-6 h-6" />,
                                    title: "Opening Hours",
                                    content: "2:00 PM – 11:00 PM",
                                    sub: "Open 7 Days a week",
                                    color: "bg-green-500"
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={fadeIn}
                                    initial="initial"
                                    animate="animate"
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-start gap-4 hover:shadow-xl transition-all"
                                >
                                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                                        <p className="text-gray-700 font-medium">{item.content}</p>
                                        <p className="text-gray-400 text-sm">{item.sub}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Social Media Links */}
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mt-8">
                                <h3 className="font-bold text-gray-900 mb-4 text-center">Follow Us</h3>
                                <div className="flex justify-center gap-4">
                                    <a
                                        href="https://www.facebook.com/lakemba.mobileking/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all transform hover:-translate-y-1"
                                    >
                                        <Facebook className="w-6 h-6" />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/lakemba.mobileking/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1"
                                    >
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 3. Dynamic Contact Form */}
                        <div className="lg:flex-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-gray-100 h-full"
                            >
                                <div className="mb-10">
                                    <h2 className="text-3xl font-bold mb-2">Send us a Message</h2>
                                    <p className="text-gray-500 font-light">Fill out the form below and we'll get back to you as soon as possible.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-2">Your Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('name')}
                                                placeholder="John Doe"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-2">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('email')}
                                                placeholder="john@example.com"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="0410 000 000"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-2">Subject</label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">General Inquiry</option>
                                                <option value="repair">Repair Quote</option>
                                                <option value="accessory">Accessory Availability</option>
                                                <option value="business">Business Partnership</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-2">Your Message</label>
                                        <textarea
                                            required
                                            name="message"
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell us how we can help..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            disabled={status === 'loading'}
                                            type="submit"
                                            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${status === 'success'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-brand-blue text-white hover:bg-gray-900 shadow-brand-blue/20'
                                                }`}
                                        >
                                            {status === 'loading' ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : status === 'success' ? (
                                                <>
                                                    <CheckCircle2 className="w-6 h-6" />
                                                    Sent Successfully!
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-6 h-6" />
                                                    Send Royal Request
                                                </>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {status === 'success' && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="text-center text-green-600 mt-4 font-medium"
                                                >
                                                    Thanks for reaching out! We'll get back to you shortly.
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Simple Location Map Placeholder */}
            <section className="bg-gray-100 h-[400px] relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center p-8">
                        <MapPin className="w-16 h-16 text-brand-blue mx-auto mb-4 opacity-50" />
                        <h3 className="text-2xl font-bold text-gray-500 uppercase tracking-widest">Find us at Lakemba</h3>
                        <p className="text-gray-400 mt-2">Interactive Map Integration Ready</p>
                    </div>
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <a
                        href="https://www.google.com/maps/dir/?api=1&destination=52+Railway+Parade+Lakemba+NSW+2195"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold font-poppins shadow-2xl hover:bg-brand-yellow hover:text-brand-blue transition-all flex items-center gap-2"
                    >
                        GET DIRECTIONS →
                    </a>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
