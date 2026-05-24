// app/api/upload/voice-note/route.js
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const dir = join(process.cwd(), "public", "voice-notes");
    mkdirSync(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    // Always save as message.mp3 so the voice-note API picks it up
    writeFileSync(join(dir, "message.mp3"), buffer);

    return Response.json({ success: true, url: "/voice-notes/message.mp3" });
  } catch (err) {
    console.error("Voice note upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
