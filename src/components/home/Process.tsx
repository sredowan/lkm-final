'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, Truck, Wrench, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: MousePointerClick,
        title: "Book Online",
        desc: "Select your device and repair needed to get an instant quote."
    },
    {
        icon: Truck,
        title: "Mail or Visit",
        desc: "Drop off your device or use our free mail-in service."
    },
    {
        icon: Wrench,
        title: "Expert Repair",
        desc: "Our certified technicians fix your device using premium parts."
    },
    {
        icon: CheckCircle,
        title: "Ready to Go",
        desc: "Pick up your device or get it shipped back. Good as new!"
    }
];

export default function Process() {
    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-brand-blue font-bold tracking-wider uppercase text-sm mb-2 block"
                    >
                        Simple Process
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    >
                        How It Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 text-lg"
                    >
                        We’ve made getting your device fixed as easy as 1-2-3-4.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 -z-10 bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent"></div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all duration-300 group text-center relative"
                        >
                            <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                                <step.icon className="w-10 h-10 text-brand-blue group-hover:text-brand-yellow transition-colors" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-sm font-bold text-brand-blue shadow-md border-2 border-white">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
