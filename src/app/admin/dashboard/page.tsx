'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Calendar, RefreshCw } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import RecentOrders from '@/components/admin/RecentOrders';

interface DashboardStats {
    stats: {
        totalOrders: number;
        totalRevenue: number;
        totalProducts: number;
        totalBookings: number;
    };
    recentOrders: any[];
    chartData: Array<{ name: string; revenue: number; orders: number }>;
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex items-center gap-3 text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const stats = data?.stats || { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalBookings: 0 };
    const chartData = data?.chartData || [];
    const recentOrders = data?.recentOrders || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon={<DollarSign className="h-6 w-6" />}
                    color="green"
                    trend={{ value: 12.5, isPositive: true }}
                    subtitle="vs last month"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<ShoppingCart className="h-6 w-6" />}
                    color="blue"
                    trend={{ value: 8.2, isPositive: true }}
                    subtitle="vs last month"
                />
                <StatCard
                    title="Products"
                    value={stats.totalProducts}
                    icon={<Package className="h-6 w-6" />}
                    color="purple"
                    subtitle="Active listings"
                />
                <StatCard
                    title="Repair Bookings"
                    value={stats.totalBookings}
                    icon={<Calendar className="h-6 w-6" />}
                    color="yellow"
                    trend={{ value: 15, isPositive: true }}
                    subtitle="This month"
                />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RevenueChart data={chartData} />
                </div>

                {/* Quick Stats Sidebar */}
                <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                    <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <a
                            href="/admin/products/add"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium">Add Product</p>
                                <p className="text-xs text-gray-400">Create new listing</p>
                            </div>
                        </a>
                        <a
                            href="/admin/orders"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-medium">View Orders</p>
                                <p className="text-xs text-gray-400">Manage all orders</p>
                            </div>
                        </a>
                        <a
                            href="/admin/bookings"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-medium">Repair Bookings</p>
                                <p className="text-xs text-gray-400">View appointments</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <RecentOrders orders={recentOrders} />
        </div>
    );
}
