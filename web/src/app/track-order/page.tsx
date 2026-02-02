'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: string;
    total: string;
}

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentStatus: string;
    total: string;
    createdAt: string;
}

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const statusIndex: Record<string, number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
};

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const initialOrderNumber = searchParams.get('order') || '';

    const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!orderNumber.trim()) return;

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            // First find the order by order number using GET API with search
            const listRes = await fetch(`/api/orders?search=${encodeURIComponent(orderNumber)}`);
            const ordersList = await listRes.json();

            if (!Array.isArray(ordersList) || ordersList.length === 0) {
                setError('Order not found. Please check your order number and try again.');
                setOrder(null);
                setItems([]);
                setLoading(false);
                return;
            }

            const foundOrder = ordersList.find((o: Order) => o.orderNumber === orderNumber);
            if (!foundOrder) {
                setError('Order not found. Please check your order number and try again.');
                setOrder(null);
                setItems([]);
                setLoading(false);
                return;
            }

            // Get full order details
            const detailRes = await fetch(`/api/orders/${foundOrder.id}`);
            const data = await detailRes.json();

            if (detailRes.ok) {
                setOrder(data.order);
                setItems(data.items);
            } else {
                setError('Failed to fetch order details.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-search if order number is in URL
    useEffect(() => {
        if (initialOrderNumber) {
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOrderNumber]);

    const currentStatusIndex = order ? statusIndex[order.status] : -1;

    return (
        <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-3">Track Your Order</h1>
                <p className="text-gray-500">Enter your order number to check the status of your order.</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter your order number (e.g., LKM-1234567890-123)"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-blue text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8 text-center">
                    {error}
                </div>
            )}

            {/* Order Result */}
            {order && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-brand-blue text-white p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-blue-200 text-sm">Order Number</p>
                                <p className="text-xl font-bold">{order.orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-200 text-sm">Total</p>
                                <p className="text-xl font-bold">${Number(order.total).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="p-6 border-b">
                        {order.status === 'cancelled' ? (
                            <div className="flex items-center justify-center gap-3 py-8">
                                <XCircle className="w-12 h-12 text-red-500" />
                                <div>
                                    <p className="text-xl font-bold text-red-600">Order Cancelled</p>
                                    <p className="text-gray-500">This order has been cancelled.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                {statusSteps.map((step, index) => {
                                    const isComplete = index <= currentStatusIndex;
                                    const isCurrent = index === currentStatusIndex;
                                    const Icon = step.icon;

                                    return (
                                        <div key={step.key} className="flex-1 flex flex-col items-center relative">
                                            {/* Connector Line */}
                                            {index > 0 && (
                                                <div
                                                    className={`absolute top-5 right-1/2 w-full h-1 -translate-y-1/2 ${index <= currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                                                        }`}
                                                    style={{ zIndex: 0 }}
                                                />
                                            )}

                                            {/* Icon Circle */}
                                            <div
                                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${isComplete
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            {/* Label */}
                                            <p
                                                className={`mt-2 text-sm text-center ${isComplete ? 'text-gray-800 font-medium' : 'text-gray-400'
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">${Number(item.total).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="bg-gray-50 p-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Order Date</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Payment Status</p>
                                <p className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {searched && !order && !error && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No order found with that number.</p>
                </div>
            )}
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans bg-gray-50">
            <Header />

            <main className="flex-1 py-12 md:py-20">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                    </div>
                }>
                    <TrackOrderContent />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
