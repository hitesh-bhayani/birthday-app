// app/api/images/route.js
import { NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

function getImagesDir(cardId) {
  if (!cardId || cardId === "default") {
    return {
      dirPath: join(process.cwd(), 'public', 'original_images'),
      publicPrefix: '/original_images'
    };
  }
  const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
  return {
    dirPath: join(process.cwd(), 'public', 'uploads', safeId, 'images'),
    publicPrefix: `/uploads/${safeId}/images`
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    
    const { dirPath, publicPrefix } = getImagesDir(cardId);
    
    if (!existsSync(dirPath)) {
      // If it doesn't exist, fallback to original_images if it's default, or empty array
      if (!cardId || cardId === "default") {
        return NextResponse.json([]);
      }
      // If a cardId is specified but no directory exists yet, just return empty list
      return NextResponse.json([]);
    }

    const files = await readdir(dirPath);
    const images = files
      .filter((f) => f.match(/\.(png|jpe?g|gif|webp|svg)$/i))
      .map((f) => `${publicPrefix}/${f}`);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading images directory:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    
    const { filename } = await request.json();
    if (!filename || filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    
    // Extract actual basename to be secure
    const fileBase = filename.split('/').pop();
    
    const { dirPath } = getImagesDir(cardId);
    const filePath = join(dirPath, fileBase);
    
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
