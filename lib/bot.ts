import { Chat } from "chat";
import { createSlackAdapter } from "@chat-adapter/slack";
import { createDiscordAdapter } from "@chat-adapter/discord";
import { createGitHubAdapter } from "@chat-adapter/github";
import { createLinearAdapter } from "@chat-adapter/linear";
import { createRedisState } from "@chat-adapter/state-redis";
import { createMemoryState } from "@chat-adapter/state-memory";
import type { Adapter } from "chat";
import { registerHandlers } from "./handlers";

// ---------------------------------------------------------------------------
// Adapter factory — only enabled adapters are constructed
// ---------------------------------------------------------------------------

function buildAdapters(): Record<string, Adapter> {
  const adapters: Record<string, Adapter> = {};

  // Slack
  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
    adapters.slack = createSlackAdapter();
  }

  // Discord
  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_PUBLIC_KEY) {
    adapters.discord = createDiscordAdapter();
  }

  // GitHub
  if (process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY) {
    adapters.github = createGitHubAdapter({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY,
      ...(process.env.GITHUB_INSTALLATION_ID && {
        installationId: parseInt(process.env.GITHUB_INSTALLATION_ID, 10),
      }),
    });
  } else if (process.env.GITHUB_TOKEN) {
    adapters.github = createGitHubAdapter({
      token: process.env.GITHUB_TOKEN,
    });
  }

  // Linear
  if (process.env.LINEAR_API_KEY) {
    adapters.linear = createLinearAdapter({
      apiKey: process.env.LINEAR_API_KEY,
    });
  } else if (process.env.LINEAR_CLIENT_ID && process.env.LINEAR_CLIENT_SECRET) {
    adapters.linear = createLinearAdapter({
      clientId: process.env.LINEAR_CLIENT_ID,
      clientSecret: process.env.LINEAR_CLIENT_SECRET,
    });
  }

  return adapters;
}

// ---------------------------------------------------------------------------
// State factory — Redis for production, in-memory for development
// ---------------------------------------------------------------------------

function buildState() {
  if (process.env.REDIS_URL) {
    return createRedisState({ url: process.env.REDIS_URL });
  }
  console.warn(
    "[morpheus-assistant] REDIS_URL not set — using in-memory state (not suitable for production)"
  );
  return createMemoryState();
}

// ---------------------------------------------------------------------------
// Bot instance
// ---------------------------------------------------------------------------

const adapters = buildAdapters();

if (Object.keys(adapters).length === 0) {
  console.warn(
    "[morpheus-assistant] No platform adapters configured. Set environment variables for at least one platform. See .env.example"
  );
}

export const bot = new Chat({
  userName: "morpheus-assistant",
  adapters,
  state: buildState(),
  streamingUpdateIntervalMs: 500,
  logger: process.env.NODE_ENV === "development" ? "debug" : "info",
});

// Register all event handlers
registerHandlers(bot);
