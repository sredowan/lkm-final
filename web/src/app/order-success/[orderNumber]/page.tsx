"use client";

import { useEffect, useState } from 'react';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Package, ArrowRight, Check, MapPin, Truck } from 'lucide-react';
import OrderTrackingProgress from '@/components/shop/OrderTrackingProgress';

// Animated Checkmark Component
function AnimatedCheckmark() {
    return (
        <div className="success-checkmark">
            <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            <style jsx>{`
                .success-checkmark {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;
                }
                
                .checkmark {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: #1E40AF;
                    stroke-miterlimit: 10;
                    box-shadow: 0 0 0 6px rgba(30, 64, 175, 0.1);
                    animation: scale .3s ease-in-out .9s both;
                }
                
                .checkmark-circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 2;
                    stroke-miterlimit: 10;
                    stroke: #1E40AF;
                    fill: rgba(30, 64, 175, 0.05);
                    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                
                .checkmark-check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    stroke-width: 3;
                    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }
                
                @keyframes stroke {
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                
                @keyframes scale {
                    0%, 100% {
                        transform: none;
                    }
                    50% {
                        transform: scale3d(1.1, 1.1, 1);
                    }
                }
            `}</style>
        </div>
    );
}

// Confetti Animation
function Confetti() {
    return (
        <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#1E40AF', '#3B82F6', '#FBBF24', '#10B981', '#8B5CF6'][Math.floor(Math.random() * 5)]
                    }}
                />
            ))}
            <style jsx>{`
                .confetti-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    overflow: hidden;
                    z-index: 100;
                }
                
                .confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    top: -10px;
                    opacity: 0;
                    animation: confetti-fall 3s linear forwards;
                }
                
                @keyframes confetti-fall {
                    0% {
                        opacity: 1;
                        top: -10px;
                        transform: translateX(0) rotateZ(0deg);
                    }
                    100% {
                        opacity: 0;
                        top: 100vh;
                        transform: translateX(100px) rotateZ(720deg);
                    }
                }
            `}</style>
        </div>
    );
}

interface OrderData {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    total: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    shippingProvider: string | null;
    trackingNumber: string | null;
    createdAt: string;
}

interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    total: string;
}

export default function OrderSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
    const [order, setOrder] = useState<OrderData | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(true);
    const [orderNumber, setOrderNumber] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setOrderNumber(p.orderNumber);
            fetchOrder(p.orderNumber);
        });

        // Stop confetti after 3 seconds
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, [params]);

    const fetchOrder = async (orderNum: string) => {
        try {
            const res = await fetch(`/api/orders/${orderNum}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
                setItems(data.items || []);
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col font-sans bg-gray-50">
                <Header />
                <main className="flex-1 py-20 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full"></div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col font-sans bg-gray-50">
            <Header />
            {showConfetti && <Confetti />}

            <main className="flex-1 pt-32 pb-12 md:pt-48 md:pb-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Success Header with Animation */}
                    <div className="text-center mb-16">
                        <div className="mb-6">
                            <AnimatedCheckmark />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 animate-fade-in">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-700 text-lg animate-fade-in-delay">
                            Thank you for your order. We're preparing it now.
                        </p>
                    </div>

                    {order ? (
                        <>
                            {/* Tracking Progress */}
                            <div className="mb-12 transform animate-slide-up">
                                <h3 className="font-bold text-gray-900 mb-6 px-2 text-xl">Order Status</h3>
                                <OrderTrackingProgress
                                    status={order.status}
                                    paymentStatus={order.paymentStatus}
                                    shippingProvider={order.shippingProvider}
                                    trackingNumber={order.trackingNumber}
                                    orderDate={order.createdAt}
                                />
                                <div className="mt-8 text-center">
                                    <Link
                                        href={`/track-order/${order.orderNumber}`}
                                        className="inline-flex items-center gap-2 text-brand-blue font-bold hover:underline bg-blue-50 px-6 py-2 rounded-full border border-blue-100 transition-colors"
                                    >
                                        View Full Tracking Page <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                            {/* Order Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 transform animate-slide-up">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                                    <div>
                                        <p className="text-sm text-gray-700">Order Number</p>
                                        <p className="text-xl font-bold text-brand-blue">{order.orderNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-700">Payment Status</p>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${order.paymentStatus === 'paid'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.paymentStatus === 'paid' && <Check className="w-4 h-4" />}
                                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                {items.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                                        <div className="space-y-4 mb-6">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.productName}</p>
                                                        <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-bold">${Number(item.total).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-brand-blue">${Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 transform animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <h3 className="font-semibold text-gray-900 mb-4">Delivery Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-700">Name</p>
                                        <p className="font-medium">{order.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">Email</p>
                                        <p className="font-medium">{order.customerEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">Phone</p>
                                        <p className="font-medium">{order.customerPhone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">Address</p>
                                        <p className="font-medium">{order.shippingAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 text-center border-2 border-dashed border-gray-100">
                            <p className="text-gray-900 mb-2">Order Reference</p>
                            <p className="text-2xl font-bold text-brand-blue">{orderNumber}</p>
                            <p className="text-gray-700 mt-4">Your order has been placed successfully!</p>
                        </div>
                    )}

                    {/* What's Next */}
                    <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white rounded-2xl p-10 mb-12 shadow-xl transform animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                            <Package className="w-6 h-6" />
                            What's Next?
                        </h3>
                        <ul className="space-y-3 text-blue-100">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                <span>We've sent a confirmation email to your inbox</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                <span>Our team will process your order within 1-2 business days</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                <span>You'll receive a notification when your order ships</span>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay">
                        <Link
                            href="/shop"
                            className="bg-brand-yellow text-brand-blue px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                        >
                            Continue Shopping <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                
                .animate-fade-in-delay {
                    animation: fade-in 0.6s ease-out 0.3s forwards;
                    opacity: 0;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
