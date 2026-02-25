import { after } from "next/server";
import { bot } from "@/lib/bot";
import type { DiscordAdapter } from "@chat-adapter/discord";

export const maxDuration = 800;

export async function GET(request: Request): Promise<Response> {
  // Verify this is a legitimate cron request
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return new Response("CRON_SECRET not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if Discord adapter is configured
  const discord = bot.getAdapter("discord");
  if (!discord) {
    return new Response("Discord adapter not configured", { status: 404 });
  }

  const durationMs = 600 * 1000; // 10 minutes
  const webhookUrl = new URL(
    "/api/webhooks/discord",
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ).toString();

  return (discord as DiscordAdapter).startGatewayListener(
    { waitUntil: (task: Promise<unknown>) => after(() => task) },
    durationMs,
    undefined,
    webhookUrl
  );
}
