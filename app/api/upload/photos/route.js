// app/api/upload/photos/route.js
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, parse } from "path";



export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    // Determine target directory
    let dir = join(process.cwd(), "public", "original_images");
    let publicPrefix = "/original_images";
    
    if (cardId && cardId !== "default") {
      const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
      dir = join(process.cwd(), "public", "uploads", safeId, "images");
      publicPrefix = `/uploads/${safeId}/images`;
    }
    
    mkdirSync(dir, { recursive: true });

    const saved = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Clean and sanitize base name
      const originalCleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const parsed = parse(originalCleanName);
      
      let finalFilename = originalCleanName;
      let counter = 1;

      // Proper dynamic duplicate checking: rename to name_1.ext, name_2.ext if it already exists
      while (existsSync(join(dir, finalFilename))) {
        finalFilename = `${parsed.name}_${counter}${parsed.ext}`;
        counter++;
      }

      writeFileSync(join(dir, finalFilename), buffer);
      saved.push(`${publicPrefix}/${finalFilename}`);
    }

    return Response.json({ success: true, saved });
  } catch (err) {
    console.error("Photo upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
