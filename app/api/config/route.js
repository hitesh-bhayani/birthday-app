// app/api/config/route.js
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
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

// Ensure the directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(cardId) {
  if (!cardId || cardId === "default") {
    return FALLBACK_CONFIG_PATH;
  }
  // Sanitize cardId to prevent directory traversal
  const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, "");
  return join(DATA_DIR, `${safeId}.json`);
}

function readConfig(cardId) {
  const path = getFilePath(cardId);
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    
    const config = readConfig(cardId);
    if (!config) {
      return Response.json({ error: "Wish card not found" }, { status: 404 });
    }

    // Never expose the password to the frontend client
    const { editPassword, adminPassword, ...safeConfig } = config;
    return Response.json(safeConfig);
  } catch (error) {
    console.error("Config GET error:", error);
    return Response.json({ error: "Failed to read config" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const password = request.headers.get("x-admin-password");

    const path = getFilePath(cardId);
    let existing = readConfig(cardId);

    // If card doesn't exist, we allow creation (without password)
    // The editPassword will be set inside the request body on first save.
    const isNew = !existing;

    const body = await request.json();

    if (!isNew) {
      const activePassword = existing.editPassword || existing.adminPassword || "birthday2024";
      if (!verifyPassword(password, activePassword)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Merge updates
    const updated = {
      ...existing,
      ...body,
      cardId: cardId || "default",
    };

    // Prevent stripping the password if it's not provided in the request body
    if (!body.editPassword && existing) {
      updated.editPassword = existing.editPassword || existing.adminPassword || "birthday2024";
    }

    // Support updating password explicitly
    if (body.newEditPassword && body.newEditPassword.length >= 4) {
      updated.editPassword = body.newEditPassword;
    }
    delete updated.newEditPassword;
    delete updated.adminPassword; // Standardize on editPassword

    // Hashing before saving
    if (updated.editPassword) {
      const isHash = /^[a-fA-F0-9]{64}$/.test(updated.editPassword);
      if (!isHash) {
        updated.editPassword = hashPassword(updated.editPassword);
      }
    }

    writeFileSync(path, JSON.stringify(updated, null, 2), "utf-8");
    return Response.json({ success: true, cardId: updated.cardId });
  } catch (error) {
    console.error("Config POST error:", error);
    return Response.json({ error: "Failed to save config" }, { status: 500 });
  }
}
