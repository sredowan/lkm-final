'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    CreditCard,
    FileText,
    Loader2,
    Truck,
    CheckCircle,
    X,
    AlertCircle
} from 'lucide-react';

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: string;
    total: string;
    refundedQuantity: number;
}

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    subtotal: string;
    tax: string;
    shipping: string;
    total: string;
    totalRefunded: string;
    refundStatus: 'none' | 'partial' | 'full';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: string;
    paymentMethod: string | null;
    stripePaymentIntentId: string | null;
    notes: string | null;
    trackingNumber: string | null;
    shippingProvider: string | null;
    createdAt: string;
    updatedAt: string;
}

const SHIPPING_PROVIDERS = [
    { label: 'Australia Post', value: 'aus_post' },
    { label: 'Sendle', value: 'sendle' },
    { label: 'Startrack', value: 'startrack' },
    { label: 'DHL Express', value: 'dhl' },
    { label: 'Other', value: 'other' }
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-gray-100 text-gray-900',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [showShipModal, setShowShipModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refunds, setRefunds] = useState<any[]>([]);

    // Shipping Modal State
    const [shipForm, setShipForm] = useState({
        provider: 'aus_post',
        tracking: '',
        customerName: '',
        customerPhone: '',
        shippingAddress: ''
    });

    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async () => {
            const { id } = await params;
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
                setItems(data.items);
                setRefunds(data.refunds || []);
                setNotes(data.order.notes || '');

                // Init shipping form
                setShipForm({
                    provider: data.order.shippingProvider || 'aus_post',
                    tracking: data.order.trackingNumber || '',
                    customerName: data.order.customerName,
                    customerPhone: data.order.customerPhone,
                    shippingAddress: data.order.shippingAddress || ''
                });
            }
            setLoading(false);
        };
        fetchOrder();
    }, [params]);

    const updateOrder = async (updates: Partial<Order>) => {
        if (!order) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
            }
        } catch (error) {
            console.error('Failed to update order:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleShipOrder = async () => {
        if (!order) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'shipped',
                    shippingProvider: shipForm.provider,
                    trackingNumber: shipForm.tracking,
                    customerName: shipForm.customerName,
                    customerPhone: shipForm.customerPhone,
                    shippingAddress: shipForm.shippingAddress
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
                setShowShipModal(false);
            }
        } catch (error) {
            console.error('Failed to ship order:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleRefund = async (refundData: any) => {
        if (!order) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${order.id}/refunds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(refundData),
            });
            if (res.ok) {
                // Refresh order details to show new refund status and history
                const refreshRes = await fetch(`/api/orders/${order.id}`);
                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    setOrder(refreshData.order);
                    setItems(refreshData.items);
                    setRefunds(refreshData.refunds || []);
                }
                setShowRefundModal(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to process refund');
            }
        } catch (error) {
            console.error('Failed to process refund:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-700">Order not found.</p>
                <Link href="/admin/orders" className="text-brand-blue hover:underline mt-4 inline-block">
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Workflow Buttons */}
                <div className="flex gap-2">
                    {order.status === 'processing' && (
                        <button
                            onClick={() => setShowShipModal(true)}
                            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow"
                        >
                            <Truck className="w-5 h-5" />
                            Ship Order
                        </button>
                    )}
                    {order.status === 'shipped' && (
                        <button
                            onClick={() => updateOrder({ status: 'delivered' })}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium shadow-sm hover:shadow"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Mark Delivered
                        </button>
                    )}
                    {order.paymentStatus !== 'unpaid' && (
                        <button
                            onClick={() => setShowRefundModal(true)}
                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm"
                        >
                            <CreditCard className="w-5 h-5" />
                            Refund
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-brand-blue" />
                            Order Items
                        </h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-gray-700">
                                    <th className="pb-3">Product</th>
                                    <th className="pb-3 text-center">Qty</th>
                                    <th className="pb-3 text-center text-red-600">Refunded</th>
                                    <th className="pb-3 text-right">Price</th>
                                    <th className="pb-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="py-4 font-medium">{item.productName}</td>
                                        <td className="py-4 text-center">{item.quantity}</td>
                                        <td className="py-4 text-center text-red-600">{item.refundedQuantity > 0 ? item.refundedQuantity : '-'}</td>
                                        <td className="py-4 text-right">${Number(item.price).toFixed(2)}</td>
                                        <td className="py-4 text-right font-medium">${Number(item.total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2">
                                    <td colSpan={3} className="py-4 text-right font-semibold">Subtotal</td>
                                    <td className="py-4 text-right">${Number(order.subtotal).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="py-2 text-right text-gray-700">Tax</td>
                                    <td className="py-2 text-right">${Number(order.tax).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="py-2 text-right text-gray-700">Shipping</td>
                                    <td className="py-2 text-right">${Number(order.shipping).toFixed(2)}</td>
                                </tr>
                                <tr className="text-lg">
                                    <td colSpan={3} className="py-4 text-right font-bold">Total</td>
                                    <td className="py-4 text-right font-bold text-brand-blue">${Number(order.total).toFixed(2)}</td>
                                </tr>
                                {Number(order.totalRefunded) > 0 && (
                                    <tr className="text-lg border-t text-red-600">
                                        <td colSpan={3} className="py-4 text-right font-bold">Total Refunded</td>
                                        <td className="py-4 text-right font-bold">-${Number(order.totalRefunded).toFixed(2)}</td>
                                    </tr>
                                )}
                                {Number(order.totalRefunded) > 0 && (
                                    <tr className="text-xl border-t-2">
                                        <td colSpan={3} className="py-4 text-right font-bold">Net Total</td>
                                        <td className="py-4 text-right font-bold text-green-700">${(Number(order.total) - Number(order.totalRefunded)).toFixed(2)}</td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>

                    {/* Shipping Info Card (Shows up after shipping) */}
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-brand-blue">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-brand-blue" />
                                Shipment Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-700">Provider</p>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {SHIPPING_PROVIDERS.find(p => p.value === order.shippingProvider)?.label || order.shippingProvider || 'Unknown'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700">Tracking Number</p>
                                    <p className="font-mono font-medium text-gray-900 bg-gray-100 inline-block px-2 py-1 rounded">
                                        {order.trackingNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User className="w-5 h-5 text-brand-blue" />
                                Customer Information
                            </h3>
                        </div>
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
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-brand-blue" />
                            Shipping Address
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>
                    </div>

                    {/* Refund History */}
                    {refunds.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-red-500" />
                                Refund History
                            </h3>
                            <div className="space-y-4">
                                {refunds.map((refund: any) => (
                                    <div key={refund.id} className="pb-4 border-b last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-red-600">-${Number(refund.amount).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">{new Date(refund.createdAt).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-gray-700">{refund.reason || 'No reason provided'}</p>
                                        {refund.stripeRefundId && (
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Stripe Ref: {refund.stripeRefundId}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Status & Status</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-700 mb-1">Current Status</p>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrder({ status: e.target.value as any })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <p className="text-sm text-gray-700 mb-1">Payment Status</p>
                                <select
                                    value={order.paymentStatus}
                                    onChange={(e) => updateOrder({ paymentStatus: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="paid">Paid</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-brand-blue" />
                            Payment Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-gray-700">Method</span>
                                <span className="font-medium capitalize">{order.paymentMethod || 'manual'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-700">Total Paid</span>
                                <span className="font-bold text-gray-900">${Number(order.total).toFixed(2)}</span>
                            </div>
                            {order.paymentMethod === 'stripe' && (
                                <div className="pt-3 border-t mt-3">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Stripe Payment Intent ID
                                        {!order.stripePaymentIntentId && (
                                            <span className="text-red-500 text-xs ml-2">(Required for refunds)</span>
                                        )}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="pi_xxx..."
                                            defaultValue={order.stripePaymentIntentId || ''}
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                                            onBlur={(e) => {
                                                if (e.target.value && e.target.value !== order.stripePaymentIntentId) {
                                                    updateOrder({ stripePaymentIntentId: e.target.value });
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Find this in <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Stripe Dashboard</a> → Payments → Click the payment
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-blue" />
                            Order Notes
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this order..."
                            className="w-full px-4 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue mb-3"
                        />
                        <button
                            onClick={() => updateOrder({ notes })}
                            disabled={updating}
                            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                        >
                            {updating ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Ship Order Modal */}
            {showShipModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                        <div className="bg-brand-blue text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Ship Order
                            </h3>
                            <button onClick={() => setShowShipModal(false)} className="hover:bg-white/20 p-1 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <p className="text-sm text-blue-700">
                                    Check and update customer details if necessary before creating shipment label.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Provider</label>
                                    <select
                                        value={shipForm.provider}
                                        onChange={(e) => setShipForm({ ...shipForm, provider: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    >
                                        {SHIPPING_PROVIDERS.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                                    <input
                                        type="text"
                                        value={shipForm.tracking}
                                        onChange={(e) => setShipForm({ ...shipForm, tracking: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        placeholder="e.g. 1Z999..."
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="font-medium text-gray-900 mb-3">Customer Details</p>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={shipForm.customerName}
                                                onChange={(e) => setShipForm({ ...shipForm, customerName: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                value={shipForm.customerPhone}
                                                onChange={(e) => setShipForm({ ...shipForm, customerPhone: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">Address</label>
                                        <textarea
                                            value={shipForm.shippingAddress}
                                            onChange={(e) => setShipForm({ ...shipForm, shippingAddress: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowShipModal(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleShipOrder}
                                disabled={updating}
                                className="px-5 py-2.5 rounded-lg bg-brand-blue text-white hover:bg-blue-700 font-medium flex items-center gap-2"
                            >
                                {updating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Truck className="w-4 h-4" />
                                )}
                                Confirm Shipment
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showRefundModal && (
                <RefundModal
                    order={order}
                    items={items}
                    onClose={() => setShowRefundModal(false)}
                    onConfirm={handleRefund}
                    loading={updating}
                />
            )}
        </div>
    );
}

function RefundModal({ order, items, onClose, onConfirm, loading }: any) {
    const [refundItems, setRefundItems] = useState(
        items.map((item: any) => ({
            productId: item.productId,
            name: item.productName,
            price: parseFloat(item.price),
            quantity: 0,
            maxQuantity: item.quantity - (item.refundedQuantity || 0)
        }))
    );
    const [refundShipping, setRefundShipping] = useState(false);
    const [adjustment, setAdjustment] = useState(0);
    const [reason, setReason] = useState('');
    const [restock, setRestock] = useState(true);

    const subtotal = refundItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shippingAmount = refundShipping ? parseFloat(order.shipping || '0') : 0;
    const totalRefund = subtotal + shippingAmount + adjustment;

    const handleQuantityChange = (productId: number, val: number) => {
        setRefundItems((prev: any[]) => prev.map((item: any) =>
            item.productId === productId
                ? { ...item, quantity: Math.min(item.maxQuantity, Math.max(0, val)) }
                : item
        ));
    };

    const handleSubmit = () => {
        if (totalRefund <= 0) {
            alert('Refund amount must be greater than 0');
            return;
        }
        onConfirm({
            amount: totalRefund.toFixed(2),
            reason,
            refundedItems: refundItems.filter((i: any) => i.quantity > 0).map((i: any) => ({
                productId: i.productId,
                quantity: i.quantity
            })),
            isShippingRefunded: refundShipping,
            restockItems: restock
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
                <div className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Issue Refund
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Select Items to Refund</h4>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-2">Product</th>
                                    <th className="pb-2 text-center">Remaining</th>
                                    <th className="pb-2 text-center">Refund Qty</th>
                                    <th className="pb-2 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {refundItems.map((item: any) => (
                                    <tr key={item.productId}>
                                        <td className="py-3 font-medium text-gray-900">{item.name}</td>
                                        <td className="py-3 text-center text-gray-500">{item.maxQuantity}</td>
                                        <td className="py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.maxQuantity}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 border rounded text-center focus:ring-1 focus:ring-red-500"
                                            />
                                        </td>
                                        <td className="py-3 text-right font-medium">${item.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="checkbox"
                                    checked={refundShipping}
                                    onChange={(e) => setRefundShipping(e.target.checked)}
                                    className="w-5 h-5 text-red-600 rounded"
                                />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">Refund Shipping</p>
                                    <p className="text-xs text-gray-500">${Number(order.shipping).toFixed(2)} will be added</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition border-blue-100 bg-blue-50/30">
                                <input
                                    type="checkbox"
                                    checked={restock}
                                    onChange={(e) => setRestock(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">Restock items</p>
                                    <p className="text-xs text-gray-500">Inventory counts will increase</p>
                                </div>
                            </label>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={adjustment}
                                    onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="e.g. -5.00 for restocking fee"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <h4 className="font-bold text-gray-900 mb-2">Summary</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Items Refund</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            {refundShipping && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium">${shippingAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {adjustment !== 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Adjustment</span>
                                    <span className={`font-medium ${adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {adjustment > 0 ? '+' : ''}{adjustment.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 text-red-600">
                                <span>Total Refund</span>
                                <span>${totalRefund.toFixed(2)}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-2">
                                * Refunds {order.paymentMethod === 'stripe' ? 'will be processed via Stripe' : 'must be handled manually'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Refund</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                            placeholder="e.g. Defective item, Customer changed mind..."
                        />
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || totalRefund <= 0}
                        className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Confirm Refund
                    </button>
                </div>
            </div>
        </div>
    );
}
