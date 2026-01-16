'use client';

import Link from 'next/link';
import { Eye, MoreHorizontal } from 'lucide-react';

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    total: string | number;
    status: string;
    paymentMethod?: string;
    createdAt: Date | string | null;
}

interface RecentOrdersProps {
    orders: Order[];
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
    return (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <p className="text-sm text-gray-500">Latest transactions</p>
                </div>
                <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View All →
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="text-gray-400">
                                        <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-sm font-medium">No orders yet</p>
                                        <p className="text-xs mt-1">Orders will appear here when customers make purchases</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.slice(0, 5).map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900">#{order.orderNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{order.customerName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900">
                                            ${Number(order.total).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
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
