# 🟢 Morpheus Assistant

A multi-platform AI chatbot powered by the [Morpheus](https://mor.org) decentralized AI network. Built with [Vercel Chat SDK](https://chat-sdk.dev).

> **Morpheus Assistant** lets you interact with AI models through the Morpheus compute marketplace — available on Slack, Discord, GitHub, and Linear from a single codebase.

## Features

- 🤖 **AI-Powered Responses** — Streaming AI responses via the Morpheus API Gateway
- 💬 **Multi-Platform** — Works on Slack, Discord, GitHub Issues, and Linear Issues
- 🔄 **Multi-Turn Conversations** — Thread-based conversations with context history
- ⚡ **Streaming** — Real-time streaming responses on supported platforms
- 🎨 **Rich UI** — Interactive cards, buttons, and slash commands (Slack)
- 🔧 **Modular** — Enable only the platforms you need via environment variables
- 🚀 **Serverless-Ready** — Deploy to Vercel with zero config

## Available Models

Models available through the Morpheus AI Gateway:

| Model | Description |
|-------|-------------|
| `llama-3.3-70b` | Meta's Llama 3.3 70B — general purpose (default) |
| `llama-3.3-70b:web` | Llama 3.3 with web search capabilities |
| `qwen3-235b` | Alibaba's Qwen 3 235B — large model |
| `qwen3-235b:web` | Qwen 3 with web search capabilities |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- A [Morpheus API key](#getting-a-morpheus-api-key)
- Credentials for at least one platform (Slack, Discord, GitHub, or Linear)
- [Redis](https://redis.io/) for production (optional for development)

### 1. Clone & Install

```bash
git clone https://github.com/MorpheusAIs/morpheus-assistant.git
cd morpheus-assistant
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials. See platform-specific setup below.

### 3. Run Locally

```bash
npm run dev
```

The bot will start at `http://localhost:3000`. Use a tool like [ngrok](https://ngrok.com) to expose it for webhook testing:

```bash
ngrok http 3000
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments. Set all environment variables in the Vercel dashboard under Settings > Environment Variables.

---

## Getting a Morpheus API Key

The Morpheus API Gateway provides **free AI inference** through the decentralized compute marketplace.

1. Go to [app.mor.org](https://app.mor.org)
2. Create an account or sign in
3. Navigate to the **API Keys** section
4. Click **Create API Key**
5. **Copy the key immediately** — it will only be shown once
6. Add it to your `.env.local` as `MORPHEUS_API_KEY`

> ⚠️ Store your API key securely. Never commit it to version control.

For more details, see the [Morpheus API Documentation](https://apidocs.mor.org/quickstart).

---

## Platform Setup

You only need to configure the platforms you want to use. The bot automatically detects which adapters to enable based on your environment variables.

### Slack

<details>
<summary>Click to expand Slack setup</summary>

#### Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** > **From an app manifest**
3. Select your workspace
4. Paste the contents of [`slack-manifest.yml`](./slack-manifest.yml) from this repo
5. Replace `YOUR_DOMAIN` with your deployment URL (e.g., `morpheus-assistant.vercel.app`)
6. Click **Create**

#### Get Credentials

1. Go to **Settings** > **Basic Information**
2. Under **App Credentials**, copy the **Signing Secret**
3. Go to **OAuth & Permissions**
4. Click **Install to Workspace**
5. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

#### Environment Variables

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
```

#### Slash Commands

After installation, these slash commands are available:
- `/ask <question>` — Ask a one-off question
- `/morpheus help` — Show help information
- `/morpheus models` — List available AI models
- `/morpheus about` — Learn about Morpheus

</details>

### Discord

<details>
<summary>Click to expand Discord setup</summary>

#### Create a Discord Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** and name it "Morpheus Assistant"
3. Go to the **Bot** section
4. Click **Reset Token** and copy the **Bot Token**
5. Under **Privileged Gateway Intents**, enable:
   - Message Content Intent
   - Server Members Intent
6. Go to **General Information** and copy the **Application ID** and **Public Key**

#### Invite the Bot

Go to **OAuth2** > **URL Generator**:
- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Send Messages`, `Read Message History`, `Add Reactions`
- Copy the generated URL and open it to invite the bot to your server

#### Environment Variables

```bash
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_PUBLIC_KEY=your-public-key
DISCORD_APPLICATION_ID=your-application-id
CRON_SECRET=any-random-secret-string
```

#### Interactions Endpoint

In the Discord Developer Portal, set the **Interactions Endpoint URL** to:
```
https://YOUR_DOMAIN/api/webhooks/discord
```

#### Gateway (Serverless)

The Discord adapter uses a cron-based gateway listener for serverless environments. This is automatically configured via `vercel.json` — the cron job runs every 9 minutes to maintain the gateway connection.

</details>

### GitHub

<details>
<summary>Click to expand GitHub setup</summary>

#### Option A: GitHub App (Recommended)

1. Go to [github.com/settings/apps](https://github.com/settings/apps)
2. Click **New GitHub App**
3. Configure:
   - **Name**: Morpheus Assistant
   - **Homepage URL**: Your deployment URL
   - **Webhook URL**: `https://YOUR_DOMAIN/api/webhooks/github`
   - **Webhook Secret**: Generate a secure random string
   - **Permissions**:
     - Issues: Read & Write
     - Pull Requests: Read & Write
   - **Subscribe to events**: Issues, Issue comments, Pull requests, Pull request reviews, Pull request review comments
4. Click **Create GitHub App**
5. Generate a **Private Key** (downloads a `.pem` file)
6. Note the **App ID**
7. Install the app on your repositories

```bash
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your-webhook-secret
```

#### Option B: Personal Access Token

For simpler setups, you can use a PAT:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate a new token with `repo` scope
3. Set up a webhook on each repository pointing to `https://YOUR_DOMAIN/api/webhooks/github`

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=your-webhook-secret
```

</details>

### Linear

<details>
<summary>Click to expand Linear setup</summary>

#### Create Credentials

**Option A: API Key (Simpler)**

1. Go to [linear.app/settings/api](https://linear.app/settings/api)
2. Click **Create Key**
3. Copy the API key

**Option B: OAuth Application**

1. Go to [linear.app/settings/api/applications](https://linear.app/settings/api/applications)
2. Create a new application
3. Note the Client ID and Client Secret

#### Set Up Webhook

1. Go to [linear.app/settings/api](https://linear.app/settings/api) > **Webhooks**
2. Click **New Webhook**
3. Set URL to `https://YOUR_DOMAIN/api/webhooks/linear`
4. Enable events: Issues, Issue comments
5. Copy the **Signing Secret**

#### Environment Variables

```bash
# API Key auth
LINEAR_API_KEY=lin_api_xxxxxxxxxxxx
LINEAR_WEBHOOK_SECRET=your-webhook-secret

# OR OAuth auth
# LINEAR_CLIENT_ID=your-client-id
# LINEAR_CLIENT_SECRET=your-client-secret
# LINEAR_WEBHOOK_SECRET=your-webhook-secret
```

</details>

---

## State Adapters

### Redis (Production)

For production deployments, configure Redis for persistent thread subscriptions and distributed locking:

```bash
REDIS_URL=redis://your-redis-host:6379
```

Popular managed Redis providers:
- [Upstash](https://upstash.com) (serverless, free tier available)
- [Redis Cloud](https://redis.com/cloud/)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)

### In-Memory (Development)

If `REDIS_URL` is not set, the bot falls back to in-memory state. This is fine for local development but **not suitable for production** — state is lost on restart and doesn't work across multiple instances.

---

## Project Structure

```
morpheus-assistant/
├── app/
│   ├── api/
│   │   ├── webhooks/[platform]/route.ts  # Webhook handler for all platforms
│   │   └── discord/gateway/route.ts       # Discord gateway (serverless)
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Landing page
├── lib/
│   ├── morpheus.ts                        # Morpheus AI provider config
│   ├── bot.tsx                            # Chat SDK instance & adapters
│   └── handlers.tsx                       # Event handlers (mentions, commands, etc.)
├── .env.example                           # Environment variable template
├── slack-manifest.yml                     # Slack app manifest
├── vercel.json                            # Vercel config (Discord cron)
├── next.config.ts                         # Next.js config
├── tsconfig.json                          # TypeScript config
└── package.json                           # Dependencies
```

---

## How It Works

1. **Webhook Events** — Each platform sends events (mentions, messages, reactions) to `/api/webhooks/{platform}`
2. **Event Routing** — the Chat SDK normalizes events and routes them to your handlers
3. **AI Processing** — Handlers stream requests to the Morpheus API Gateway via the Vercel AI SDK
4. **Response Delivery** — Responses stream back to the originating platform in real-time

### Event Handlers

| Event | Trigger | Behavior |
|-------|---------|----------|
| `onNewMention` | Bot @-mentioned | Subscribe to thread, stream AI response |
| `onSubscribedMessage` | Message in subscribed thread | Stream AI response with conversation history |
| `/ask <question>` | Slash command | Stream a one-off AI response |
| `/morpheus help` | Slash command | Show help card with available commands |
| `/morpheus models` | Slash command | List available AI models |
| `/morpheus about` | Slash command | Show information about Morpheus |

---

## Development

### Local Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run linter
```

### Testing Webhooks Locally

Use [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 3000
```

Then update your platform webhook URLs to use the ngrok URL (e.g., `https://abc123.ngrok.io/api/webhooks/slack`).

---

## Contributing

Contributions are welcome! Please see the [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Resources

- [Morpheus Network](https://mor.org) — Decentralized AI infrastructure
- [Morpheus API Docs](https://apidocs.mor.org) — API Gateway documentation  
- [Chat SDK Docs](https://chat-sdk.dev/docs) — Vercel Chat SDK documentation
- [Vercel AI SDK](https://sdk.vercel.ai) — AI SDK for TypeScript
