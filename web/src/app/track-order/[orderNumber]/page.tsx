"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import OrderTrackingProgress from '@/components/shop/OrderTrackingProgress';
import { ArrowLeft, Package, MapPin, Phone, Mail, ShoppingBag, Search } from 'lucide-react';

interface OrderData {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    total: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    paymentMethod: string | null;
    trackingNumber: string | null;
    shippingProvider: string | null;
    createdAt: string;
}

interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: string;
    total: string;
}

export default function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
    const [order, setOrder] = useState<OrderData | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setOrderNumber(p.orderNumber);
            fetchOrder(p.orderNumber);
        });
    }, [params]);

    const fetchOrder = async (orderNum: string) => {
        try {
            const res = await fetch(`/api/orders/${orderNum}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
                setItems(data.items || []);
            } else {
                setError('Order not found. Please check your order number.');
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError('Failed to load order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col font-sans bg-gray-50 text-gray-900">
            <Header />

            <main className="flex-1 pt-32 pb-12 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Back Link */}
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue mb-6 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Shop
                    </Link>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Track Your Package</h1>
                        <p className="text-gray-600">Follow your order's journey from our store to your doorstep</p>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="animate-spin w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading order details...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Continue Shopping
                            </Link>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Order Number Header Card */}
                            <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white rounded-2xl p-6 shadow-xl">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <p className="text-blue-100 text-sm">Order Number</p>
                                        <p className="text-2xl md:text-3xl font-bold">{order.orderNumber}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.paymentStatus === 'paid'
                                                ? 'bg-green-400/20 text-green-100'
                                                : 'bg-yellow-400/20 text-yellow-100'
                                            }`}>
                                            {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending Payment'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking Progress */}
                            <OrderTrackingProgress
                                status={order.status}
                                paymentStatus={order.paymentStatus}
                                shippingProvider={order.shippingProvider}
                                trackingNumber={order.trackingNumber}
                                orderDate={order.createdAt}
                            />

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Items Summary */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-brand-blue" />
                                        Order Items
                                    </h3>
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-gray-900">${Number(item.total).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-xl text-brand-blue">${Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-brand-blue" />
                                        Shipping Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Recipient</p>
                                            <p className="font-medium text-gray-900">{order.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> Email
                                            </p>
                                            <p className="font-medium text-gray-900">{order.customerEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> Phone
                                            </p>
                                            <p className="font-medium text-gray-900">{order.customerPhone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Delivery Address</p>
                                            <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Help Section */}
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
                                <h3 className="font-bold text-yellow-800 mb-2">Need Help?</h3>
                                <p className="text-yellow-700 mb-4">
                                    If you have any questions about your order, feel free to contact us.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="tel:0410807546"
                                        className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-full font-medium hover:bg-yellow-700 transition"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Call Us
                                    </a>
                                    <a
                                        href="mailto:info@lakembamobile.com.au"
                                        className="inline-flex items-center gap-2 bg-white text-yellow-700 px-4 py-2 rounded-full font-medium border border-yellow-300 hover:bg-yellow-50 transition"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email Support
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
}
