// app/api/upload/voice-note/route.js
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Get correct extension from uploaded file
    const originalName = file.name || "voice.webm";
    const extension = originalName.split(".").pop().toLowerCase();

    let dirPath = join(process.cwd(), "public", "voice-notes");
    let filePath = join(dirPath, `message.${extension}`);
    let publicUrl = `/voice-notes/message.${extension}`;

    if (cardId && cardId !== "default") {
      const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
      const dir = join(process.cwd(), "public", "uploads", safeId, "audio");
      dirPath = dir;
      mkdirSync(dir, { recursive: true });
      filePath = join(dir, `voice.${extension}`);
      publicUrl = `/uploads/${safeId}/audio/voice.${extension}`;
    } else {
      mkdirSync(dirPath, { recursive: true });
    }

    // Clean up any existing audio files starting with the same prefix to avoid playback conflicts
    if (existsSync(dirPath)) {
      const prefix = cardId && cardId !== "default" ? "voice." : "message.";
      const existingFiles = readdirSync(dirPath);
      for (const f of existingFiles) {
        if (f.startsWith(prefix)) {
          try {
            unlinkSync(join(dirPath, f));
          } catch (err) {
            console.warn("Could not delete old audio file:", f, err);
          }
        }
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filePath, buffer);

    return Response.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Voice note upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
