// app/api/upload/photos/route.js
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export const config = { api: { bodyParser: false } };

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    const dir = join(process.cwd(), "public", "original_images");
    mkdirSync(dir, { recursive: true });

    const saved = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      writeFileSync(join(dir, filename), buffer);
      saved.push(`/original_images/${filename}`);
    }

    return Response.json({ success: true, saved });
  } catch (err) {
    console.error("Photo upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
