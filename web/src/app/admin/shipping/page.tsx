"use client";

import { useState, useEffect } from "react";
import {
    Truck,
    Package,
    MapPin,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    ToggleLeft,
    ToggleRight,
    TestTube,
    Globe
} from "lucide-react";

interface ShippingProvider {
    id: number;
    name: string;
    code: string;
    apiKey: string | null;
    apiSecret: string | null;
    accountNumber: string | null;
    testMode: boolean;
    isActive: boolean;
    settings: string | null;
}

interface ShippingZone {
    id: number;
    name: string;
    postcodes: string | null;
    flatRate: string | null;
    freeShippingThreshold: string | null;
    weightRate: string | null;
    isActive: boolean;
    sortOrder: number;
}

const PROVIDER_OPTIONS = [
    { code: 'aus_post', name: 'Australia Post' },
    { code: 'sendle', name: 'Sendle' },
    { code: 'startrack', name: 'StarTrack' },
    { code: 'dhl', name: 'DHL' },
    { code: 'fedex', name: 'FedEx' },
    { code: 'custom', name: 'Custom Provider' },
];

export default function ShippingPage() {
    const [activeTab, setActiveTab] = useState<'providers' | 'zones'>('providers');
    const [providers, setProviders] = useState<ShippingProvider[]>([]);
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Provider Modal State
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);
    const [providerForm, setProviderForm] = useState({
        name: '',
        code: '',
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        testMode: true,
        isActive: false,
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [showApiSecret, setShowApiSecret] = useState(false);

    // Zone Modal State
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
    const [zoneForm, setZoneForm] = useState({
        name: '',
        postcodes: '',
        flatRate: '',
        freeShippingThreshold: '',
        weightRate: '',
        isActive: true,
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (activeTab === 'providers') {
            fetchProviders();
        } else {
            fetchZones();
        }
    }, [activeTab]);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/shipping/providers');
            const data = await res.json();
            setProviders(data);
        } catch (err) {
            setError('Failed to load providers');
        } finally {
            setLoading(false);
        }
    };

    const fetchZones = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/shipping/zones');
            const data = await res.json();
            setZones(data);
        } catch (err) {
            setError('Failed to load zones');
        } finally {
            setLoading(false);
        }
    };

    // Provider handlers
    const openProviderModal = (provider?: ShippingProvider) => {
        if (provider) {
            setEditingProvider(provider);
            setProviderForm({
                name: provider.name,
                code: provider.code,
                apiKey: provider.apiKey || '',
                apiSecret: provider.apiSecret || '',
                accountNumber: provider.accountNumber || '',
                testMode: provider.testMode,
                isActive: provider.isActive,
            });
        } else {
            setEditingProvider(null);
            setProviderForm({
                name: '',
                code: '',
                apiKey: '',
                apiSecret: '',
                accountNumber: '',
                testMode: true,
                isActive: false,
            });
        }
        setShowProviderModal(true);
    };

    const saveProvider = async () => {
        setSaving(true);
        try {
            const url = editingProvider
                ? `/api/admin/shipping/providers/${editingProvider.id}`
                : '/api/admin/shipping/providers';
            const method = editingProvider ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(providerForm),
            });

            if (res.ok) {
                setShowProviderModal(false);
                fetchProviders();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save provider');
            }
        } catch (err) {
            setError('Failed to save provider');
        } finally {
            setSaving(false);
        }
    };

    const deleteProvider = async (id: number) => {
        if (!confirm('Are you sure you want to delete this provider?')) return;

        try {
            await fetch(`/api/admin/shipping/providers/${id}`, { method: 'DELETE' });
            fetchProviders();
        } catch (err) {
            setError('Failed to delete provider');
        }
    };

    const toggleProviderActive = async (provider: ShippingProvider) => {
        try {
            await fetch(`/api/admin/shipping/providers/${provider.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !provider.isActive }),
            });
            fetchProviders();
        } catch (err) {
            setError('Failed to update provider');
        }
    };

    // Zone handlers
    const openZoneModal = (zone?: ShippingZone) => {
        if (zone) {
            setEditingZone(zone);
            setZoneForm({
                name: zone.name,
                postcodes: zone.postcodes || '',
                flatRate: zone.flatRate || '',
                freeShippingThreshold: zone.freeShippingThreshold || '',
                weightRate: zone.weightRate || '',
                isActive: zone.isActive,
            });
        } else {
            setEditingZone(null);
            setZoneForm({
                name: '',
                postcodes: '',
                flatRate: '',
                freeShippingThreshold: '',
                weightRate: '',
                isActive: true,
            });
        }
        setShowZoneModal(true);
    };

    const saveZone = async () => {
        setSaving(true);
        try {
            const url = editingZone
                ? `/api/admin/shipping/zones/${editingZone.id}`
                : '/api/admin/shipping/zones';
            const method = editingZone ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...zoneForm,
                    flatRate: zoneForm.flatRate ? parseFloat(zoneForm.flatRate) : null,
                    freeShippingThreshold: zoneForm.freeShippingThreshold ? parseFloat(zoneForm.freeShippingThreshold) : null,
                    weightRate: zoneForm.weightRate ? parseFloat(zoneForm.weightRate) : null,
                }),
            });

            if (res.ok) {
                setShowZoneModal(false);
                fetchZones();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save zone');
            }
        } catch (err) {
            setError('Failed to save zone');
        } finally {
            setSaving(false);
        }
    };

    const deleteZone = async (id: number) => {
        if (!confirm('Are you sure you want to delete this zone?')) return;

        try {
            await fetch(`/api/admin/shipping/zones/${id}`, { method: 'DELETE' });
            fetchZones();
        } catch (err) {
            setError('Failed to delete zone');
        }
    };

    const toggleZoneActive = async (zone: ShippingZone) => {
        try {
            await fetch(`/api/admin/shipping/zones/${zone.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !zone.isActive }),
            });
            fetchZones();
        } catch (err) {
            setError('Failed to update zone');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shipping</h1>
                    <p className="text-gray-500 mt-1">Manage shipping providers and delivery zones</p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('providers')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'providers'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <Package className="w-4 h-4" />
                    Providers
                </button>
                <button
                    onClick={() => setActiveTab('zones')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'zones'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    Zones & Rates
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : activeTab === 'providers' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {/* Providers Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Shipping Providers</h2>
                                <p className="text-sm text-gray-500">Configure API keys for shipping carriers</p>
                            </div>
                        </div>
                        <button
                            onClick={() => openProviderModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Provider
                        </button>
                    </div>

                    {/* Providers List */}
                    {providers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No shipping providers configured</p>
                            <button
                                onClick={() => openProviderModal()}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                Add your first provider
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {providers.map(provider => (
                                <div key={provider.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${provider.isActive ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                        <Truck className={`w-5 h-5 ${provider.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">{provider.name}</p>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase">
                                                {provider.code}
                                            </span>
                                            {provider.testMode && (
                                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                                                    <TestTube className="w-3 h-3" />
                                                    Test Mode
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            API Key: {provider.apiKey || 'Not configured'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleProviderActive(provider)}
                                            className={`p-2 rounded-lg transition-colors ${provider.isActive
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-100'
                                                }`}
                                            title={provider.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {provider.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => openProviderModal(provider)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteProvider(provider.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {/* Zones Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Shipping Zones</h2>
                                <p className="text-sm text-gray-500">Define delivery zones and pricing</p>
                            </div>
                        </div>
                        <button
                            onClick={() => openZoneModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Zone
                        </button>
                    </div>

                    {/* Zones List */}
                    {zones.length === 0 ? (
                        <div className="p-12 text-center">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No shipping zones configured</p>
                            <button
                                onClick={() => openZoneModal()}
                                className="mt-4 text-green-600 hover:underline"
                            >
                                Add your first zone
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {zones.map(zone => (
                                <div key={zone.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${zone.isActive ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                        <Globe className={`w-5 h-5 ${zone.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{zone.name}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            {zone.flatRate && (
                                                <span>Flat: ${parseFloat(zone.flatRate).toFixed(2)}</span>
                                            )}
                                            {zone.freeShippingThreshold && (
                                                <span className="text-green-600">
                                                    Free over ${parseFloat(zone.freeShippingThreshold).toFixed(0)}
                                                </span>
                                            )}
                                            {zone.postcodes && (
                                                <span className="truncate max-w-[200px]">
                                                    Postcodes: {zone.postcodes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleZoneActive(zone)}
                                            className={`p-2 rounded-lg transition-colors ${zone.isActive
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-100'
                                                }`}
                                        >
                                            {zone.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => openZoneModal(zone)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteZone(zone.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Provider Modal */}
            {showProviderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingProvider ? 'Edit Provider' : 'Add Provider'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Provider Type
                                </label>
                                <select
                                    value={providerForm.code}
                                    onChange={(e) => {
                                        const selected = PROVIDER_OPTIONS.find(p => p.code === e.target.value);
                                        setProviderForm({
                                            ...providerForm,
                                            code: e.target.value,
                                            name: selected?.name || providerForm.name,
                                        });
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    disabled={!!editingProvider}
                                >
                                    <option value="">Select a provider...</option>
                                    {PROVIDER_OPTIONS.map(opt => (
                                        <option key={opt.code} value={opt.code}>{opt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={providerForm.name}
                                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="e.g., Australia Post"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={providerForm.apiKey}
                                        onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                        placeholder="Enter API key"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    API Secret
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiSecret ? 'text' : 'password'}
                                        value={providerForm.apiSecret}
                                        onChange={(e) => setProviderForm({ ...providerForm, apiSecret: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                        placeholder="Enter API secret (if required)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiSecret(!showApiSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showApiSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={providerForm.accountNumber}
                                    onChange={(e) => setProviderForm({ ...providerForm, accountNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="Enter account number (if required)"
                                />
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={providerForm.testMode}
                                        onChange={(e) => setProviderForm({ ...providerForm, testMode: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Test Mode</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={providerForm.isActive}
                                        onChange={(e) => setProviderForm({ ...providerForm, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowProviderModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveProvider}
                                disabled={saving || !providerForm.name || !providerForm.code}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {editingProvider ? 'Save Changes' : 'Add Provider'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zone Modal */}
            {showZoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingZone ? 'Edit Zone' : 'Add Zone'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Zone Name
                                </label>
                                <input
                                    type="text"
                                    value={zoneForm.name}
                                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                    placeholder="e.g., Sydney Metro"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Postcodes
                                </label>
                                <input
                                    type="text"
                                    value={zoneForm.postcodes}
                                    onChange={(e) => setZoneForm({ ...zoneForm, postcodes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                    placeholder="e.g., 2000-2050, 2100, 2200-2250"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Comma-separated postcodes or ranges (e.g., 2000-2050)
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Flat Rate ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={zoneForm.flatRate}
                                        onChange={(e) => setZoneForm({ ...zoneForm, flatRate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                        placeholder="9.95"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Free Shipping Over ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={zoneForm.freeShippingThreshold}
                                        onChange={(e) => setZoneForm({ ...zoneForm, freeShippingThreshold: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Weight Rate ($ per kg) - Optional
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={zoneForm.weightRate}
                                    onChange={(e) => setZoneForm({ ...zoneForm, weightRate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                    placeholder="1.50"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={zoneForm.isActive}
                                    onChange={(e) => setZoneForm({ ...zoneForm, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowZoneModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveZone}
                                disabled={saving || !zoneForm.name}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {editingZone ? 'Save Changes' : 'Add Zone'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
