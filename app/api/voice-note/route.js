// app/api/voice-note/route.js
import { existsSync, readdirSync } from "fs";
import { join } from "path";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    let dirPath = join(process.cwd(), "public", "voice-notes");
    let publicPrefix = "/voice-notes";

    if (cardId && cardId !== "default") {
      const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
      dirPath = join(process.cwd(), "public", "uploads", safeId, "audio");
      publicPrefix = `/uploads/${safeId}/audio`;
    }

    // Check if folder exists
    if (!existsSync(dirPath)) {
      return Response.json({ exists: false, url: null });
    }

    // Find the first audio file in that folder (excluding background track bg.mp3 if it exists)
    const files = readdirSync(dirPath).filter(f =>
      /\.(mp3|m4a|wav|ogg|aac)$/i.test(f) && (cardId && cardId !== "default" ? f === "voice.mp3" : true)
    );

    if (files.length === 0) {
      return Response.json({ exists: false, url: null });
    }

    return Response.json({ exists: true, url: `${publicPrefix}/${files[0]}` });
  } catch {
    return Response.json({ exists: false, url: null });
  }
}
