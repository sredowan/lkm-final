export default function AdminDashboard() {
    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Dashboard</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">$0.00</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Products</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Customers</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="mb-4 text-lg font-bold text-gray-800">Recent Orders</h3>
                <div className="rounded-lg bg-white shadow-sm">
                    <div className="p-6 text-center text-gray-500">No orders yet.</div>
                </div>
            </div>
        </div>
    );
}
