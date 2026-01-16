"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        price: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/admin/products");
            } else {
                alert("Failed to create product");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Add Product</h2>

            <div className="max-w-2xl rounded-lg bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <input
                            name="slug"
                            type="text"
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            value={formData.slug}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mr-2 rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded bg-brand-blue px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
