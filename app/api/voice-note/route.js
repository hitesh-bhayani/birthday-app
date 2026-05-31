// app/api/voice-note/route.js
import { existsSync, readdirSync, unlinkSync, readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

function hashPassword(password) {
  if (!password) return "";
  return createHash("sha256").update(password).digest("hex");
}

function verifyPassword(inputPassword, storedPasswordOrHash) {
  if (!storedPasswordOrHash || !inputPassword) return false;
  const isHash = /^[a-fA-F0-9]{64}$/.test(storedPasswordOrHash);
  if (isHash) {
    return hashPassword(inputPassword) === storedPasswordOrHash;
  }
  return inputPassword === storedPasswordOrHash;
}

const DATA_DIR = join(process.cwd(), "data", "wishes");
const FALLBACK_CONFIG_PATH = join(process.cwd(), "birthday.config.json");

function getFilePath(cardId) {
  if (!cardId || cardId === "default") {
    return FALLBACK_CONFIG_PATH;
  }
  const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
  return join(DATA_DIR, `${safeId}.json`);
}

function readConfig(cardId) {
  const path = getFilePath(cardId);
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

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

    // Find the first audio file in that folder matching our prefix and file extension criteria
    const prefix = cardId && cardId !== "default" ? "voice." : "message.";
    const files = readdirSync(dirPath).filter(f =>
      /\.(mp3|m4a|wav|ogg|aac|webm|mpeg)$/i.test(f) && f.startsWith(prefix)
    );

    if (files.length === 0) {
      return Response.json({ exists: false, url: null });
    }

    return Response.json({ exists: true, url: `${publicPrefix}/${files[0]}` });
  } catch {
    return Response.json({ exists: false, url: null });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const password = request.headers.get("x-admin-password");

    const config = readConfig(cardId);
    if (!config) {
      return Response.json({ error: "Card not found" }, { status: 404 });
    }

    // Verify passcode
    const activePassword = config.editPassword || config.adminPassword || "birthday2024";
    if (!verifyPassword(password, activePassword)) {
      await new Promise(resolve => setTimeout(resolve, 350));
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let dirPath = join(process.cwd(), "public", "voice-notes");
    if (cardId && cardId !== "default") {
      const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
      dirPath = join(process.cwd(), "public", "uploads", safeId, "audio");
    }

    if (existsSync(dirPath)) {
      const prefix = cardId && cardId !== "default" ? "voice." : "message.";
      const files = readdirSync(dirPath);
      for (const f of files) {
        if (f.startsWith(prefix)) {
          try {
            unlinkSync(join(dirPath, f));
          } catch (err) {
            console.warn("Error deleting file:", f, err);
          }
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Config DELETE error:", error);
    return Response.json({ error: "Failed to delete voice note" }, { status: 500 });
  }
}
