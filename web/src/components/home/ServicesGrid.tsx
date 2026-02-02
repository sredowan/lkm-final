'use client';

import { motion } from 'framer-motion';
import { Smartphone, Battery, Laptop, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
    {
        icon: Smartphone,
        title: "Screen Replacement",
        desc: "We restore your device's display to its original glory using premium quality parts. iPhone, Samsung, Pixel & more.",
        link: "/services/screen-repair",
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        icon: Battery,
        title: "Battery Replacement",
        desc: "Extend your device's life with a fresh battery. Installed fast and safely. restore peak performance.",
        link: "/services/battery",
        color: "text-green-600",
        bg: "bg-green-50"
    },
    {
        icon: Laptop,
        title: "Laptop & Tablet",
        desc: "We don't just fix phones. Bring in your iPad, Surface, MacBook or Laptop for expert diagnostics and repair.",
        link: "/services/laptop",
        color: "text-purple-600",
        bg: "bg-purple-50"
    }
];

export default function ServicesGrid() {
    return (
        <section className="py-24 bg-white relative">
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-50 rounded-full blur-3xl -z-10 opacity-60"></div>

            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900 tracking-tight"
                    >
                        Expert Repairs for Every Device
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 leading-relaxed"
                    >
                        From cracked screens to complex motherboard repairs, our skilled technicians have you covered.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group"
                        >
                            <div className={`w-20 h-20 ${service.bg} rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                                <service.icon className={`w-10 h-10 ${service.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{service.title}</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {service.desc}
                            </p>
                            <Link href={service.link} className={`mt-auto font-bold ${service.color} hover:opacity-80 transition-opacity flex items-center gap-2 group-hover:gap-3 transition-all`}>
                                View Pricing <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
