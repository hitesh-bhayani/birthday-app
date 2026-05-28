import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { filename } = params;
  
  // Prevent directory traversal
  const safeFilename = filename.replace(/\.\./g, "");
  const filePath = join(process.cwd(), 'storage', 'voice-notes', safeFilename);

  if (!existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const fileBuffer = readFileSync(filePath);
  
  // Determine content type
  let contentType = 'application/octet-stream';
  const ext = safeFilename.split('.').pop().toLowerCase();
  if (ext === 'mp3') contentType = 'audio/mpeg';
  else if (ext === 'wav') contentType = 'audio/wav';
  else if (ext === 'webm') contentType = 'audio/webm';
  else if (ext === 'ogg') contentType = 'audio/ogg';
  else if (ext === 'm4a') contentType = 'audio/mp4';
  else if (ext === 'aac') contentType = 'audio/aac';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
