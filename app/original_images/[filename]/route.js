import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise and must be awaited
  const resolvedParams = await params;
  const { filename } = resolvedParams;
  
  // Prevent directory traversal
  const safeFilename = filename.replace(/\.\./g, "");
  const filePath = join(process.cwd(), 'storage', 'original_images', safeFilename);

  if (!existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const fileBuffer = readFileSync(filePath);
  
  // Determine content type
  let contentType = 'application/octet-stream';
  const ext = safeFilename.split('.').pop().toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
  else if (ext === 'png') contentType = 'image/png';
  else if (ext === 'webp') contentType = 'image/webp';
  else if (ext === 'gif') contentType = 'image/gif';
  else if (ext === 'svg') contentType = 'image/svg+xml';
  else if (ext === 'heic') contentType = 'image/heic';
  else if (ext === 'heif') contentType = 'image/heif';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
