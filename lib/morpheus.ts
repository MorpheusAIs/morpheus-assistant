import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Morpheus AI provider using the decentralized Morpheus API Gateway.
 * OpenAI-compatible endpoint powered by the Morpheus compute marketplace.
 *
 * @see https://apidocs.mor.org/documentation/integrations/vercel-ai-sdk-integration
 */
export const morpheus = createOpenAICompatible({
  name: "morpheus",
  baseURL: "https://api.mor.org/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.MORPHEUS_API_KEY}`,
  },
});

/**
 * Get the configured Morpheus model.
 * Defaults to llama-3.3-70b if MORPHEUS_MODEL is not set.
 */
export function getMorpheusModel() {
  return morpheus.chatModel(process.env.MORPHEUS_MODEL || "llama-3.3-70b");
}
