import { NextRequest, NextResponse } from "next/server";
import { OPENAI_API_KEY } from "@/lib/env";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * AI Chat API Route
 * 
 * Handles conversational AI with full market context:
 * - Access to all trading data
 * - Real-time market analysis
 * - Technical indicators
 * - News and sentiment
 * - Trading opportunities
 */
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // System message with full context
    const systemMessage = {
      role: "system",
      content: `You are Lumo AI, an expert financial analyst and trading advisor integrated into LumoTrade, a professional trading platform.

You have access to:
- Real-time market data from multiple sources (Polygon, FMP, Finnhub, Marketaux)
- Technical analysis indicators (RSI, MACD, moving averages, volume)
- Trading opportunities identified by AI screening
- News and sentiment analysis
- Options flow and institutional data
- ML-powered predictions and model performance

Your capabilities:
1. Explain market conditions and trends
2. Analyze specific stocks with technical and fundamental data
3. Provide trading insights and strategies
4. Answer questions about the platform's features
5. Help users understand their portfolio and trades
6. Explain ML predictions and model accuracy

Guidelines:
- Be concise but thorough in your explanations
- Use data and metrics when available
- Provide actionable insights
- Always include risk disclaimers for trading advice
- Be professional yet conversational
- If you need specific data about a stock, ask the user for the symbol
- Reference current market conditions (SPY, VIX, sector performance)

Remember: You're a helpful AI assistant, not a certified financial advisor. Always remind users that past performance doesn't guarantee future results.`,
    };

    // Call OpenAI with GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("AI chat error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error.message,
        response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

