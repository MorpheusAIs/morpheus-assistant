import {
  Chat,
  Card,
  CardText,
  Actions,
  Button,
  Divider,
  Fields,
  Field,
  LinkButton,
  emoji,
  RateLimitError,
  NotImplementedError,
} from "chat";
import { streamText } from "ai";
import { getMorpheusModel } from "./morpheus";

/**
 * System prompt for the Morpheus Assistant.
 */
const SYSTEM_PROMPT = `You are Morpheus Assistant, a helpful AI assistant powered by the Morpheus decentralized AI network.

Key facts about you:
- You run on decentralized compute infrastructure via the Morpheus network
- You are available on Slack, Discord, GitHub, and Linear
- You can help with general questions, coding, analysis, writing, and more
- You support multi-turn conversations — users can reply in-thread to continue chatting

Keep responses concise and helpful. Use markdown formatting when appropriate.
When you don't know something, say so honestly.`;

/**
 * Build conversation history from thread messages for multi-turn chat.
 */
async function getConversationHistory(
  thread: Parameters<Parameters<Chat["onSubscribedMessage"]>[0]>[0]
) {
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  try {
    const result = await thread.adapter.fetchMessages(thread.id, { limit: 20 });
    for (const msg of result.messages) {
      if (!msg.text.trim()) continue;
      messages.push({
        role: msg.author.isMe ? "assistant" : "user",
        content: msg.text,
      });
    }
  } catch {
    // If fetchMessages is not supported, fall back to no history
  }

  return messages;
}

/**
 * Stream an AI response to the thread.
 */
async function streamAIResponse(
  thread: Parameters<Parameters<Chat["onNewMention"]>[0]>[0],
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
) {
  await thread.startTyping();

  const messages = [
    ...history,
    { role: "user" as const, content: userMessage },
  ];

  const result = streamText({
    model: getMorpheusModel(),
    system: SYSTEM_PROMPT,
    messages,
  });

  await thread.post(result.textStream);
}

/**
 * Register all event handlers on the bot instance.
 */
export function registerHandlers(bot: Chat) {
  // ---------------------------------------------------------------------------
  // New mention — bot is @mentioned in a thread it's not yet subscribed to
  // ---------------------------------------------------------------------------
  bot.onNewMention(async (thread, message) => {
    await thread.subscribe();

    try {
      await streamAIResponse(thread, message.text);
    } catch (error) {
      if (error instanceof RateLimitError) {
        await thread.post(
          "⏳ I'm being rate-limited right now. Please try again in a moment."
        );
      } else {
        console.error("[morpheus-assistant] Error in onNewMention:", error);
        await thread.post(
          "❌ Sorry, I encountered an error processing your request. Please try again."
        );
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Subscribed message — follow-up messages in threads the bot is watching
  // ---------------------------------------------------------------------------
  bot.onSubscribedMessage(async (thread, message) => {
    // Ignore bot's own messages
    if (message.author.isMe) return;

    try {
      const history = await getConversationHistory(thread);
      await streamAIResponse(thread, message.text, history);
    } catch (error) {
      if (error instanceof RateLimitError) {
        await thread.post(
          "⏳ I'm being rate-limited right now. Please try again in a moment."
        );
      } else {
        console.error(
          "[morpheus-assistant] Error in onSubscribedMessage:",
          error
        );
        await thread.post(
          "❌ Sorry, I encountered an error processing your request. Please try again."
        );
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Slash commands
  // ---------------------------------------------------------------------------
  bot.onSlashCommand("/ask", async (event) => {
    if (!event.text.trim()) {
      await event.channel.post("Usage: `/ask <your question>`");
      return;
    }

    try {
      const result = streamText({
        model: getMorpheusModel(),
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: event.text }],
      });

      await event.channel.post(result.textStream);
    } catch (error) {
      console.error("[morpheus-assistant] Error in /ask:", error);
      await event.channel.post(
        "❌ Sorry, I encountered an error. Please try again."
      );
    }
  });

  bot.onSlashCommand("/morpheus", async (event) => {
    const subcommand = event.text.trim().toLowerCase();

    if (subcommand === "help" || subcommand === "") {
      await event.channel.post(
        Card({
          title: "🟢 Morpheus Assistant",
          children: [
            CardText("I'm an AI assistant powered by the **Morpheus decentralized AI network**. Here's how to use me:"),
            Divider(),
            Fields([
              Field({ label: "@mention me", value: "Mention me in any channel to start a conversation" }),
              Field({ label: "/ask", value: "Ask a one-off question: /ask What is Morpheus?" }),
              Field({ label: "/morpheus help", value: "Show this help message" }),
              Field({ label: "/morpheus models", value: "List available AI models" }),
              Field({ label: "/morpheus about", value: "Learn about Morpheus" }),
            ]),
            Divider(),
            Actions([
              LinkButton({ url: "https://mor.org", label: "Learn about Morpheus" }),
              LinkButton({ url: "https://app.mor.org", label: "Get an API Key" }),
              LinkButton({ url: "https://github.com/MorpheusAIs/morpheus-assistant", label: "Source Code" }),
            ]),
          ],
        })
      );
      return;
    }

    if (subcommand === "models") {
      await event.channel.post(
        Card({
          title: "🤖 Available Models",
          children: [
            CardText("Models available through the Morpheus AI Gateway:"),
            Divider(),
            Fields([
              Field({ label: "llama-3.3-70b", value: "Meta's Llama 3.3 — general purpose (default)" }),
              Field({ label: "llama-3.3-70b:web", value: "Llama 3.3 with web search tool calling" }),
              Field({ label: "qwen3-235b", value: "Alibaba's Qwen 3 — large model" }),
              Field({ label: "qwen3-235b:web", value: "Qwen 3 with web search tool calling" }),
            ]),
            Divider(),
            CardText(`Current model: **${process.env.MORPHEUS_MODEL || "llama-3.3-70b"}**`),
          ],
        })
      );
      return;
    }

    if (subcommand === "about") {
      await event.channel.post(
        Card({
          title: "About Morpheus",
          children: [
            CardText("**Morpheus** is a decentralized AI infrastructure network that provides open access to AI compute, models, and agents."),
            CardText("This assistant runs on the Morpheus API Gateway, which routes requests to the highest-rated compute providers in the network. AI inference is currently **free** for all users."),
            Divider(),
            Actions([
              LinkButton({ url: "https://mor.org", label: "Morpheus Website" }),
              LinkButton({ url: "https://apidocs.mor.org", label: "API Documentation" }),
              LinkButton({ url: "https://app.mor.org", label: "Get Started" }),
            ]),
          ],
        })
      );
      return;
    }

    await event.channel.post(
      `Unknown command: \`/morpheus ${subcommand}\`. Try \`/morpheus help\` for available commands.`
    );
  });

  // ---------------------------------------------------------------------------
  // Reactions — acknowledge with a friendly response
  // ---------------------------------------------------------------------------
  try {
    bot.onReaction([emoji.thumbs_up, emoji.heart, emoji.rocket], async (event) => {
      if (event.added && !event.user.isBot) {
        try {
          await event.thread.adapter.addReaction(event.threadId, event.messageId, emoji.heart);
        } catch (error) {
          if (!(error instanceof NotImplementedError)) {
            console.error("[morpheus-assistant] Error in onReaction:", error);
          }
        }
      }
    });
  } catch {
    // onReaction may not be available on all adapters
  }

  // ---------------------------------------------------------------------------
  // Action handlers (for card buttons)
  // ---------------------------------------------------------------------------
  bot.onAction("ask_question", async (event) => {
    await event.thread.post(
      "Go ahead and ask your question! I'll respond right here in this thread."
    );
  });
}
