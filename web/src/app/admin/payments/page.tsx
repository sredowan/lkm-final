'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Wallet, Clock, Store, Truck, Check, X, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface PaymentMethod {
    enabled: boolean;
    testMode?: boolean;
    [key: string]: any;
}

interface PaymentSettings {
    stripe: PaymentMethod;
    paypal: PaymentMethod;
    afterpay: PaymentMethod;
    inStorePickup: PaymentMethod;
    cashOnDelivery: PaymentMethod;
}

const defaultSettings: PaymentSettings = {
    stripe: { enabled: false, testMode: true, publicKey: '', secretKey: '', webhookSecret: '' },
    paypal: { enabled: false, testMode: true, clientId: '', clientSecret: '' },
    afterpay: { enabled: false, testMode: true, merchantId: '', secretKey: '' },
    inStorePickup: { enabled: true, instructions: '' },
    cashOnDelivery: { enabled: false, instructions: '' },
};

export default function PaymentsPage() {
    const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState('online');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/payments');
            if (res.ok) {
                const data = await res.json();
                setSettings({ ...defaultSettings, ...data });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                alert('Payment settings saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateSetting = (gateway: keyof PaymentSettings, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [gateway]: { ...prev[gateway], [field]: value }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Payment Settings</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure payment methods for your store</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-brand-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('online')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'online' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Online Payments
                </button>
                <button
                    onClick={() => setActiveTab('offline')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'offline' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Store className="w-4 h-4 inline mr-2" />
                    Offline Payments
                </button>
            </div>

            {activeTab === 'online' && (
                <div className="space-y-6">
                    {/* Stripe */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Stripe</h3>
                                    <p className="text-sm text-gray-500">Accept credit cards, debit cards, Apple Pay, Google Pay</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.stripe.enabled}
                                    onChange={(e) => updateSetting('stripe', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                        {settings.stripe.enabled && (
                            <div className="p-6 space-y-4 bg-gray-50">
                                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.stripe.testMode}
                                            onChange={(e) => updateSetting('stripe', 'testMode', e.target.checked)}
                                            className="w-4 h-4 text-brand-blue rounded"
                                        />
                                        <span className="text-sm text-yellow-800">Test Mode (use test API keys)</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                                        <input
                                            type="text"
                                            value={settings.stripe.publicKey}
                                            onChange={(e) => updateSetting('stripe', 'publicKey', e.target.value)}
                                            placeholder="pk_test_..."
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                                        <div className="relative">
                                            <input
                                                type={showSecrets['stripe_secret'] ? 'text' : 'password'}
                                                value={settings.stripe.secretKey}
                                                onChange={(e) => updateSetting('stripe', 'secretKey', e.target.value)}
                                                placeholder="sk_test_..."
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleSecret('stripe_secret')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showSecrets['stripe_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                                        <div className="relative">
                                            <input
                                                type={showSecrets['stripe_webhook'] ? 'text' : 'password'}
                                                value={settings.stripe.webhookSecret}
                                                onChange={(e) => updateSetting('stripe', 'webhookSecret', e.target.value)}
                                                placeholder="whsec_..."
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleSecret('stripe_webhook')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showSecrets['stripe_webhook'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PayPal */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">PayPal</h3>
                                    <p className="text-sm text-gray-500">Accept PayPal payments and PayPal Credit</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.paypal.enabled}
                                    onChange={(e) => updateSetting('paypal', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                        {settings.paypal.enabled && (
                            <div className="p-6 space-y-4 bg-gray-50">
                                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.paypal.testMode}
                                            onChange={(e) => updateSetting('paypal', 'testMode', e.target.checked)}
                                            className="w-4 h-4 text-brand-blue rounded"
                                        />
                                        <span className="text-sm text-yellow-800">Sandbox Mode (use sandbox credentials)</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                                        <input
                                            type="text"
                                            value={settings.paypal.clientId}
                                            onChange={(e) => updateSetting('paypal', 'clientId', e.target.value)}
                                            placeholder="Enter PayPal Client ID"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                                        <div className="relative">
                                            <input
                                                type={showSecrets['paypal_secret'] ? 'text' : 'password'}
                                                value={settings.paypal.clientSecret}
                                                onChange={(e) => updateSetting('paypal', 'clientSecret', e.target.value)}
                                                placeholder="Enter PayPal Client Secret"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleSecret('paypal_secret')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showSecrets['paypal_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Afterpay */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Afterpay</h3>
                                    <p className="text-sm text-gray-500">Buy now, pay later in 4 interest-free installments</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.afterpay.enabled}
                                    onChange={(e) => updateSetting('afterpay', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                        {settings.afterpay.enabled && (
                            <div className="p-6 space-y-4 bg-gray-50">
                                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.afterpay.testMode}
                                            onChange={(e) => updateSetting('afterpay', 'testMode', e.target.checked)}
                                            className="w-4 h-4 text-brand-blue rounded"
                                        />
                                        <span className="text-sm text-yellow-800">Sandbox Mode (use test credentials)</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                                        <input
                                            type="text"
                                            value={settings.afterpay.merchantId}
                                            onChange={(e) => updateSetting('afterpay', 'merchantId', e.target.value)}
                                            placeholder="Enter Afterpay Merchant ID"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                                        <div className="relative">
                                            <input
                                                type={showSecrets['afterpay_secret'] ? 'text' : 'password'}
                                                value={settings.afterpay.secretKey}
                                                onChange={(e) => updateSetting('afterpay', 'secretKey', e.target.value)}
                                                placeholder="Enter Afterpay Secret Key"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleSecret('afterpay_secret')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showSecrets['afterpay_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'offline' && (
                <div className="space-y-6">
                    {/* In-Store Pickup */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Store className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">In-Store Pickup</h3>
                                    <p className="text-sm text-gray-500">Customer picks up and pays at the store</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.inStorePickup.enabled}
                                    onChange={(e) => updateSetting('inStorePickup', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                        {settings.inStorePickup.enabled && (
                            <div className="p-6 bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Instructions</label>
                                <textarea
                                    value={settings.inStorePickup.instructions}
                                    onChange={(e) => updateSetting('inStorePickup', 'instructions', e.target.value)}
                                    placeholder="Enter instructions for customers picking up in-store..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue h-24"
                                />
                            </div>
                        )}
                    </div>

                    {/* Cash on Delivery */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Cash on Delivery</h3>
                                    <p className="text-sm text-gray-500">Customer pays when order is delivered</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.cashOnDelivery.enabled}
                                    onChange={(e) => updateSetting('cashOnDelivery', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                        </div>
                        {settings.cashOnDelivery.enabled && (
                            <div className="p-6 bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                                <textarea
                                    value={settings.cashOnDelivery.instructions}
                                    onChange={(e) => updateSetting('cashOnDelivery', 'instructions', e.target.value)}
                                    placeholder="Enter instructions for cash on delivery..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue h-24"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
