// app/api/voice-note/route.js
import { existsSync, readdirSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const voiceNotesDir = join(process.cwd(), "public", "voice-notes");

    // Check if the folder exists
    if (!existsSync(voiceNotesDir)) {
      return Response.json({ exists: false, url: null });
    }

    // Find the first audio file in the folder
    const files = readdirSync(voiceNotesDir).filter(f =>
      /\.(mp3|m4a|wav|ogg|aac)$/i.test(f)
    );

    if (files.length === 0) {
      return Response.json({ exists: false, url: null });
    }

    return Response.json({ exists: true, url: `/voice-notes/${files[0]}` });
  } catch {
    return Response.json({ exists: false, url: null });
  }
}
