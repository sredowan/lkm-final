import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const product = await db.query.products.findFirst({
            where: eq(products.id, parseInt(params.id)),
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching product" },
            { status: 500 }
        );
    }
}
