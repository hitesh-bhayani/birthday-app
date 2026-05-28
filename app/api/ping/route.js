// app/api/ping/route.js
// Keep-alive endpoint — pinged every 5 minutes by UptimeRobot to prevent cold starts
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
