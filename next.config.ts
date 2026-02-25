import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["chat", "@chat-adapter/slack", "@chat-adapter/discord", "@chat-adapter/github", "@chat-adapter/linear", "@chat-adapter/state-redis"],
};

export default nextConfig;
