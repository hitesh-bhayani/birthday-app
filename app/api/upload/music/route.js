// app/api/upload/music/route.js
import { writeFileSync } from "fs";
import { join } from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(join(process.cwd(), "public", "birthday-music.mp3"), buffer);

    return Response.json({ success: true, url: "/birthday-music.mp3" });
  } catch (err) {
    console.error("Music upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
