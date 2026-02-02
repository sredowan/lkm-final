import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const allProducts = await db.select().from(products);
        return NextResponse.json(allProducts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products', details: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        // TODO: Add Zod validation here

        // Ensure slug is unique or generate it? Assuming body has slug for now

        const result = await db.insert(products).values(body);

        // For mysql2, result is [ResultSetHeader, FieldPacket[]]
        // Drizzle with mysql2 driver returns the raw array result from the driver for insert/update/delete 
        // when using .execute() or similar, but .values() returns a Promise that resolves to the result.
        // Typings might vary, usually result[0].insertId is correct for mysql2.

        const insertId = (result as any)[0].insertId;

        return NextResponse.json({ success: true, id: insertId }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create product', details: error }, { status: 500 });
    }
}
