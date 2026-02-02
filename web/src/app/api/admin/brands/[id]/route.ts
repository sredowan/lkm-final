import { NextResponse } from 'next/server';
import { db } from '@/db';
import { brands } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const { name, slug, logo, isPopular, isActive, sortOrder } = body;

        await db.update(brands)
            .set({
                name,
                slug,
                logo,
                isPopular,
                isActive,
                sortOrder
            })
            .where(eq(brands.id, parseInt(params.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update brand:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update brand' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await db.delete(brands).where(eq(brands.id, parseInt(params.id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete brand:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete brand' }, { status: 500 });
    }
}
