// app/api/config/route.js
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), "birthday.config.json");

function readConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

export async function GET() {
  try {
    const config = readConfig();
    // Never expose the admin password to the frontend
    const { adminPassword, ...safeConfig } = config;
    return Response.json(safeConfig);
  } catch {
    return Response.json({ error: "Failed to read config" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const password = request.headers.get("x-admin-password");
    const config = readConfig();

    if (password !== config.adminPassword) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Merge update into existing config, preserving adminPassword
    const updated = { ...config, ...body, adminPassword: config.adminPassword };

    // If changing password, allow it via explicit field
    if (body.newAdminPassword && body.newAdminPassword.length >= 6) {
      updated.adminPassword = body.newAdminPassword;
    }
    delete updated.newAdminPassword;

    writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to save config" }, { status: 500 });
  }
}
