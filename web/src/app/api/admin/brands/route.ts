import { NextResponse } from 'next/server';
import { db } from '@/db';
import { brands } from '@/db/schema';

export async function POST(req: Request) {
    try {
        // Simple auth check mock - replace with actual session check if needed
        // const session = await auth();
        // if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { name, slug, logo, isPopular, isActive, sortOrder } = body;

        await db.insert(brands).values({
            name,
            slug,
            logo,
            isPopular: isPopular || false,
            isActive: isActive !== undefined ? isActive : true,
            sortOrder: sortOrder || 0
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to create brand:", error);
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }
}
