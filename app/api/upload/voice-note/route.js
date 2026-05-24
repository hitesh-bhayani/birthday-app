// app/api/upload/voice-note/route.js
import { writeFileSync, mkdirSync } from "fs";
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

    let filePath = join(process.cwd(), "public", "voice-notes", "message.mp3");
    let publicUrl = "/voice-notes/message.mp3";

    if (cardId && cardId !== "default") {
      const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
      const dir = join(process.cwd(), "public", "uploads", safeId, "audio");
      mkdirSync(dir, { recursive: true });
      filePath = join(dir, "voice.mp3");
      publicUrl = `/uploads/${safeId}/audio/voice.mp3`;
    } else {
      const dir = join(process.cwd(), "public", "voice-notes");
      mkdirSync(dir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filePath, buffer);

    return Response.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Voice note upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
