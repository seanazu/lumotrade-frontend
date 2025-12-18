import { OpenAI } from "openai";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Model configuration - Using GPT-5.1
export const AI_CONFIG = {
  model: "gpt-5.1",
  maxOutputTokens: 1500,
  temperature: 0.7,
};

// Validate API key
export function validateOpenAIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
}
