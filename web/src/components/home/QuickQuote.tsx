'use client';

import { useState, useMemo } from 'react';
import repairsData from '@/data/repairs.json';
import { ArrowRight, Clock, DollarSign, Smartphone, ChevronDown, Check, AlertCircle, Calendar, User, Mail, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

// Define types based on the extracted JSON structure
type RepairItem = {
    brand: string;
    model: string;
    issue: string;
    price: string;
    time: string;
};

export default function QuickQuote() {
    const router = useRouter();
    // Step 1: Quote Selection State
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedIssue, setSelectedIssue] = useState<string>('');

    // Step 2: Booking Details State
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Quote, 2: Details, 3: Success
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '',
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Get unique brands
    const brands = useMemo(() => {
        const brandSet = new Set(repairsData.map((item: RepairItem) => item.brand));
        return Array.from(brandSet).sort();
    }, []);

    // Get models for selected brand
    const models = useMemo(() => {
        if (!selectedBrand) return [];
        const modelSet = new Set(
            repairsData
                .filter((item: RepairItem) => item.brand === selectedBrand)
                .map((item: RepairItem) => item.model)
        );
        return Array.from(modelSet).sort();
    }, [selectedBrand]);

    // Get issues for selected model
    const issues = useMemo(() => {
        if (!selectedModel) return [];
        const issueSet = new Set(
            repairsData
                .filter((item: RepairItem) => item.model === selectedModel)
                .map((item: RepairItem) => item.issue)
        );
        return Array.from(issueSet).sort();
    }, [selectedModel]);

    // Get quote details
    const quote = useMemo(() => {
        if (!selectedModel || !selectedIssue) return null;
        return repairsData.find(
            (item: RepairItem) =>
                item.brand === selectedBrand &&
                item.model === selectedModel &&
                item.issue === selectedIssue
        );
    }, [selectedBrand, selectedModel, selectedIssue]);

    const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setBookingData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBookNow = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: selectedBrand,
                    model: selectedModel,
                    issue: selectedIssue,
                    price: quote?.price,
                    bookingDate: bookingData.date,
                    bookingTime: bookingData.time,
                    customerName: bookingData.name,
                    customerEmail: bookingData.email,
                    customerPhone: bookingData.phone,
                    notes: bookingData.notes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit booking');
            }

            setStep(3); // Move to success step
        } catch (error: any) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Steps
    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto relative z-10 border border-white/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-yellow to-brand-blue rounded-t-2xl"></div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                            Instant Repair Quote
                        </h2>
                        <p className="text-center text-gray-500 mb-6 text-sm">Select your device details below</p>

                        <div className="space-y-5">
                            {/* Brand Selection */}
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Device Brand
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 font-medium focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all appearance-none cursor-pointer hover:border-gray-200"
                                        value={selectedBrand}
                                        onChange={(e) => {
                                            setSelectedBrand(e.target.value);
                                            setSelectedModel('');
                                            setSelectedIssue('');
                                        }}
                                    >
                                        <option value="" disabled>Select Brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5 group-hover:text-brand-blue transition-colors" />
                                </div>
                            </div>

                            {/* Model Selection */}
                            <div className={clsx("relative group transition-opacity duration-300", !selectedBrand && "opacity-50 grayscale")}>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Device Model
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 font-medium focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all appearance-none cursor-pointer hover:border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        value={selectedModel}
                                        onChange={(e) => {
                                            setSelectedModel(e.target.value);
                                            setSelectedIssue('');
                                        }}
                                        disabled={!selectedBrand}
                                    >
                                        <option value="" disabled>Select Model</option>
                                        {models.map((model) => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5 group-hover:text-brand-blue transition-colors" />
                                </div>
                            </div>

                            {/* Issue Selection */}
                            <div className={clsx("relative group transition-opacity duration-300", !selectedModel && "opacity-50 grayscale")}>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Problem / Issue
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 font-medium focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all appearance-none cursor-pointer hover:border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        value={selectedIssue}
                                        onChange={(e) => setSelectedIssue(e.target.value)}
                                        disabled={!selectedModel}
                                    >
                                        <option value="" disabled>Select Issue</option>
                                        {issues.map((issue) => (
                                            <option key={issue} value={issue}>{issue}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5 group-hover:text-brand-blue transition-colors" />
                                </div>
                            </div>

                            {/* Quote Result */}
                            <AnimatePresence>
                                {quote && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 bg-gradient-to-br from-brand-blue/5 to-blue-100/50 rounded-xl border border-blue-100">
                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-blue-100/50">
                                                <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                                                    <Clock className="w-4 h-4 text-brand-blue" /> Est. Time
                                                </span>
                                                <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded shadow-sm">
                                                    {quote.time || 'Contact us'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                                                    <DollarSign className="w-4 h-4 text-green-600" /> Est. Price
                                                </span>
                                                <span className="font-bold text-3xl text-brand-blue tracking-tight">
                                                    ${quote.price}
                                                </span>
                                            </div>
                                            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                                                <Check className="w-3 h-3 text-green-500" /> Includes parts & labor
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                className={clsx(
                                    "w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg transform active:scale-95",
                                    quote
                                        ? "bg-brand-yellow text-gray-900 hover:bg-yellow-400 hover:shadow-yellow-400/30"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                )}
                                onClick={() => quote && setStep(2)}
                                disabled={!quote}
                            >
                                {quote ? 'Book This Repair' : 'Get Quote'}
                                {quote && <ArrowRight className="w-5 h-5" />}
                            </button>

                            {!quote && selectedBrand && !selectedModel && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 justify-center text-xs text-amber-600 bg-amber-50 p-2 rounded-lg"
                                >
                                    <AlertCircle className="w-3 h-3" /> Please select your model next
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex items-center mb-4">
                            <button
                                onClick={() => setStep(1)}
                                className="p-1.5 -ml-2 rounded-full hover:bg-gray-100 text-black transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-black ml-2">
                                Booking Details
                            </h2>
                        </div>

                        <form onSubmit={handleBookNow} className="space-y-3 flex-1 overflow-y-auto pr-1">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Repairing</p>
                                    <p className="font-bold text-black text-sm">{selectedBrand} {selectedModel}</p>
                                    <p className="text-xs text-gray-700">{selectedIssue}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-brand-blue">${quote?.price}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-black uppercase tracking-wider ml-1">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            className="w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black font-medium focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-400"
                                            value={bookingData.date}
                                            onChange={handleBookingChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-black uppercase tracking-wider ml-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                        <select
                                            name="time"
                                            required
                                            className="w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black font-medium focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all appearance-none cursor-pointer"
                                            value={bookingData.time}
                                            onChange={handleBookingChange}
                                        >
                                            <option value="" disabled>Select Time</option>
                                            <option value="02:00 PM">02:00 PM</option>
                                            <option value="02:30 PM">02:30 PM</option>
                                            <option value="03:00 PM">03:00 PM</option>
                                            <option value="03:30 PM">03:30 PM</option>
                                            <option value="04:00 PM">04:00 PM</option>
                                            <option value="04:30 PM">04:30 PM</option>
                                            <option value="05:00 PM">05:00 PM</option>
                                            <option value="05:30 PM">05:30 PM</option>
                                            <option value="06:00 PM">06:00 PM</option>
                                            <option value="06:30 PM">06:30 PM</option>
                                            <option value="07:00 PM">07:00 PM</option>
                                            <option value="07:30 PM">07:30 PM</option>
                                            <option value="08:00 PM">08:00 PM</option>
                                            <option value="08:30 PM">08:30 PM</option>
                                            <option value="09:00 PM">09:00 PM</option>
                                            <option value="09:30 PM">09:30 PM</option>
                                            <option value="10:00 PM">10:00 PM</option>
                                            <option value="10:30 PM">10:30 PM</option>
                                            <option value="11:00 PM">11:00 PM</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-black uppercase tracking-wider ml-1">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black font-medium focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-400"
                                        value={bookingData.name}
                                        onChange={handleBookingChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-black uppercase tracking-wider ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="0412 345 678"
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black font-medium focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-400"
                                        value={bookingData.phone}
                                        onChange={handleBookingChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-black uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black font-medium focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-400"
                                        value={bookingData.email}
                                        onChange={handleBookingChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-black uppercase tracking-wider ml-1">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    placeholder="Any specific issues or requests?"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-black font-medium focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all min-h-[60px] placeholder:text-gray-400"
                                    value={bookingData.notes}
                                    onChange={handleBookingChange}
                                />
                            </div>

                            {submitError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {submitError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-6 mt-2 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-blue-800 shadow-md shadow-blue-900/10 transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Booking <Check className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-8"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Booking Confirmed!
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-[260px] mx-auto">
                            We've received your booking request. We'll see you on {bookingData.date} at {bookingData.time}.
                        </p>
                        <button
                            onClick={() => {
                                setStep(1);
                                setBookingData({
                                    date: '',
                                    time: '',
                                    name: '',
                                    email: '',
                                    phone: '',
                                    notes: ''
                                });
                            }}
                            className="bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Book Another
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

