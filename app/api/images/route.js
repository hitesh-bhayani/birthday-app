// app/api/images/route.js
import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const dir = join(process.cwd(), 'public', 'original_images');
    const files = await readdir(dir);
    const images = files
      .filter((f) => f.match(/\.(png|jpe?g|svg)$/i))
      .map((f) => `/original_images/${f}`);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading images directory:', error);
    return NextResponse.json([], { status: 500 });
  }
}
