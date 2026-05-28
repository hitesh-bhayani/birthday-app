import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise and must be awaited
  const resolvedParams = await params;
  const { filename } = resolvedParams;
  
  // Prevent directory traversal
  const safeFilename = filename.replace(/\.\./g, "");
  const filePath = join(process.cwd(), 'storage', 'original_images', safeFilename);

  if (!existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  try {
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

    // Standard Response with Uint8Array is compatible across all runtimes
    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error("Error serving original image:", err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
