import { after } from "next/server";
import { bot } from "@/lib/bot";

type Params = { platform: string };

export async function POST(
  request: Request,
  context: { params: Promise<Params> }
) {
  const { platform } = await context.params;

  const handler = bot.webhooks[platform as keyof typeof bot.webhooks];

  if (!handler) {
    return new Response(`Unknown platform: ${platform}`, { status: 404 });
  }

  return handler(request, {
    waitUntil: (task: Promise<unknown>) => after(() => task),
  });
}
