'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Search, Filter } from 'lucide-react';

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
}

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
    refunded: 'bg-gray-100 text-gray-800',
    partially_refunded: 'bg-orange-100 text-orange-800',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
            params.append('sort', sortOrder);

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter, sortOrder]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders();
    };

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Orders</h2>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue w-64"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-800 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
                <Filter className="w-5 h-5 text-gray-700" />

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-900">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-900">Payment:</label>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-900">Sort:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Order #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Payment</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-700">Loading...</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-700">No orders found.</td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div>{order.customerName}</div>
                                        <div className="text-xs">{order.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${Number(order.total).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/orders/${order.id}`} className="text-brand-blue hover:text-blue-800 inline-flex items-center gap-1">
                                            <Eye className="h-4 w-4" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
