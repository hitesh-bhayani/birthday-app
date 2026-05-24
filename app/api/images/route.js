// app/api/images/route.js
import { NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function getImagesOrder(cardId) {
  try {
    const DATA_DIR = join(process.cwd(), "data", "wishes");
    const FALLBACK_CONFIG_PATH = join(process.cwd(), "birthday.config.json");
    let configPath = FALLBACK_CONFIG_PATH;
    if (cardId && cardId !== "default") {
      const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
      configPath = join(DATA_DIR, `${safeId}.json`);
    }
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, "utf-8"));
      return config.imagesOrder || null;
    }
  } catch (e) {
    console.error("Error reading config for images order:", e);
  }
  return null;
}

function getImagesDir(cardId) {
  if (!cardId || cardId === "default") {
    return {
      dirPath: join(process.cwd(), 'public', 'original_images'),
      publicPrefix: '/original_images'
    };
  }
  const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
  const customPath = join(process.cwd(), 'public', 'uploads', safeId, 'images');

  // Fallback for pappa-70 to original_images if no custom folder exists
  if (safeId === "pappa-70" && !existsSync(customPath)) {
    return {
      dirPath: join(process.cwd(), 'public', 'original_images'),
      publicPrefix: '/original_images'
    };
  }

  return {
    dirPath: customPath,
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
    let images = files
      .filter((f) => f.match(/\.(png|jpe?g|gif|webp|svg)$/i))
      .map((f) => `${publicPrefix}/${f}`);

    const order = getImagesOrder(cardId);
    if (order && Array.isArray(order)) {
      images.sort((a, b) => {
        let idxA = order.indexOf(a);
        let idxB = order.indexOf(b);
        if (idxA === -1) idxA = 999999;
        if (idxB === -1) idxB = 999999;
        return idxA - idxB;
      });
    }

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
