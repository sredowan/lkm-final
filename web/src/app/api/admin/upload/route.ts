import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const folder = formData.get('folder') as string || 'products';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        // Prevent directory traversal attacks by sanitizing folder name
        const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);

        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const ext = path.extname(file.name);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return the public URL
        const imageUrl = `/uploads/${safeFolder}/${filename}`;

        return NextResponse.json({
            success: true,
            imageUrl,
            filename
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
