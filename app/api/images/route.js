// app/api/images/route.js
import { NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
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

export async function DELETE(request) {
  try {
    const { filename } = await request.json();
    if (!filename || filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    const filePath = join(process.cwd(), 'public', 'original_images', filename);
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

