import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { variantTypes, variantOptions } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - List all variant types with their options
export async function GET(request: NextRequest) {
    try {
        const types = await db.select().from(variantTypes).orderBy(asc(variantTypes.name));
        const options = await db.select().from(variantOptions);

        // Group options by typeId
        const result = types.map(type => ({
            ...type,
            options: options.filter(opt => opt.typeId === type.id)
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching variant types:', error);
        return NextResponse.json({ error: 'Failed to fetch variant types' }, { status: 500 });
    }
}

// POST - Create a new variant type or option
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, name, typeId, value } = body;

        if (action === 'createType') {
            const result = await db.insert(variantTypes).values({
                name,
                isActive: true
            });
            return NextResponse.json({ success: true, id: result[0].insertId });
        }

        if (action === 'createOption') {
            const result = await db.insert(variantOptions).values({
                typeId,
                value
            });
            return NextResponse.json({ success: true, id: result[0].insertId });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error creating variant:', error);
        return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
    }
}

// DELETE - Delete a variant type or option
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const typeId = searchParams.get('typeId');
        const optionId = searchParams.get('optionId');

        if (optionId) {
            await db.delete(variantOptions).where(eq(variantOptions.id, parseInt(optionId)));
            return NextResponse.json({ success: true });
        }

        if (typeId) {
            // Options are linked via foreign key, so delete options first or let DB handle it
            // Based on schema, we didn't specify CASCADE in drizzle yet, but our manual move might have.
            // Let's delete options manually to be safe.
            await db.delete(variantOptions).where(eq(variantOptions.typeId, parseInt(typeId)));
            await db.delete(variantTypes).where(eq(variantTypes.id, parseInt(typeId)));
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    } catch (error) {
        console.error('Error deleting variant:', error);
        return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
    }
}
