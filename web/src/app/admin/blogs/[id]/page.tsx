'use client';

import { useState, useEffect } from "react";
import BlogEditor from "@/components/admin/BlogEditor";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function EditBlogPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await fetch(`/api/admin/blogs/${id}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Error fetching post:", err);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-gray-500 font-medium">Loading post data...</p>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500 font-bold">Post not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <BlogEditor initialData={data} isEditing />
        </div>
    );
}
