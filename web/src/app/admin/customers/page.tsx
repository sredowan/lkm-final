"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Plus,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    DollarSign,
    Calendar,
    ChevronRight,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Tag,
    TrendingUp,
    UserCheck,
    Clock,
    X
} from "lucide-react";

interface Customer {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postcode: string | null;
    totalOrders: number;
    totalSpent: string;
    lastOrderDate: string | null;
    tags: string | null;
    source: string | null;
    isActive: boolean;
    createdAt: string;
}

interface CustomerStats {
    totalCustomers: number;
    totalSpent: number;
    avgOrderValue: number;
}

interface Order {
    id: number;
    orderNumber: string;
    total: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stats, setStats] = useState<CustomerStats>({ totalCustomers: 0, totalSpent: 0, avgOrderValue: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [searchQuery, sortBy, sortOrder]);

    const fetchCustomers = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);

            const res = await fetch(`/api/admin/customers?${params}`);
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.customers || []);
                setStats(data.stats || { totalCustomers: 0, totalSpent: 0, avgOrderValue: 0 });
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const viewCustomerDetail = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
        setDetailLoading(true);

        try {
            const res = await fetch(`/api/admin/customers/${customer.id}`);
            if (res.ok) {
                const data = await res.json();
                setCustomerOrders(data.orders || []);
            }
        } catch (error) {
            console.error("Failed to fetch customer details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        return status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-700">Manage your customer relationships and view their journey</p>
                </div>
                <button className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Avg. Order Value</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-brand-blue outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-brand-blue outline-none"
                        >
                            <option value="createdAt">Date Joined</option>
                            <option value="totalSpent">Total Spent</option>
                            <option value="totalOrders">Total Orders</option>
                            <option value="name">Name</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-brand-blue outline-none"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-gray-700">Loading customers...</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-700">No customers found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Customer</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contact</th>
                                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Orders</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Total Spent</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Last Order</th>
                                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white font-semibold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                                    {customer.tags && (
                                                        <div className="flex gap-1 mt-1">
                                                            {customer.tags.split(',').map((tag, i) => (
                                                                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                                    {tag.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Mail className="w-4 h-4 text-gray-700" />
                                                    {customer.email}
                                                </div>
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                                        <Phone className="w-4 h-4 text-gray-700" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                                                <ShoppingBag className="w-4 h-4" />
                                                {customer.totalOrders}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(customer.totalSpent)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-700" />
                                                {formatDate(customer.lastOrderDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => viewCustomerDetail(customer)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5 text-gray-700" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {showDetailModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                                        <p className="text-blue-100">{selectedCustomer.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <ShoppingBag className="w-6 h-6 text-brand-blue mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
                                    <p className="text-sm text-gray-700">Total Orders</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedCustomer.totalSpent)}</p>
                                    <p className="text-sm text-gray-700">Total Spent</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                    <p className="text-lg font-bold text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                                    <p className="text-sm text-gray-700">Customer Since</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Mail className="w-4 h-4 text-gray-700" />
                                            {selectedCustomer.email}
                                        </div>
                                        {selectedCustomer.phone && (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Phone className="w-4 h-4 text-gray-700" />
                                                {selectedCustomer.phone}
                                            </div>
                                        )}
                                        {selectedCustomer.address && (
                                            <div className="flex items-start gap-2 text-gray-900">
                                                <MapPin className="w-4 h-4 text-gray-700 mt-0.5" />
                                                <span>
                                                    {selectedCustomer.address}
                                                    {selectedCustomer.city && `, ${selectedCustomer.city}`}
                                                    {selectedCustomer.postcode && ` ${selectedCustomer.postcode}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Additional Info</h3>
                                    <div className="space-y-2">
                                        {selectedCustomer.source && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-700">Source:</span>
                                                <span className="capitalize">{selectedCustomer.source}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700">Status:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCustomer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order History */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Order History</h3>
                                {detailLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full mx-auto"></div>
                                    </div>
                                ) : customerOrders.length === 0 ? (
                                    <p className="text-gray-700 text-center py-8">No orders yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {customerOrders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                                                        <ShoppingBag className="w-5 h-5 text-brand-blue" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                                        <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                                {order.paymentStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-700" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
