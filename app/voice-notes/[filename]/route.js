import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise and must be awaited
  const resolvedParams = await params;
  const { filename } = resolvedParams;
  
  // Prevent directory traversal
  const safeFilename = filename.replace(/\.\./g, "");
  const filePath = join(process.cwd(), 'storage', 'voice-notes', safeFilename);

  if (!existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  try {
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

    // Standard Response with Uint8Array is compatible across all runtimes
    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error("Error serving voice note:", err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
