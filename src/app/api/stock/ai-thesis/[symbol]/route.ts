import { NextRequest, NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { polygonClient } from "@/lib/api/clients/polygon-client";
import { openaiClient } from "@/lib/api/clients/openai-client";
import { getEtDateString } from "@/lib/server/time";
import { getOrComputeDailyCache } from "@/lib/server/api-cache";

const CACHE_DURATION = 300; // 5 minutes (AI is expensive)
const STALE_WHILE_REVALIDATE = 600; // 10 minutes

class NotFoundError extends Error {
  status = 404 as const;
}

/**
 * GET /api/stock/ai-thesis/[symbol]
 *
 * Generates comprehensive AI thesis using OpenAI GPT-4
 * Includes technical analysis, fundamentals, news sentiment, and market context
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await context.params;
    const symbol = rawSymbol.toUpperCase();
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "1";
    const dateEt = getEtDateString(new Date());

    const cacheKey = `stock:ai-thesis:${symbol}:v1`;

    const { data: thesis, cache } = await getOrComputeDailyCache({
      key: cacheKey,
      dateEt,
      forceRefresh,
      compute: async () => {
        console.log(`🤖 Generating AI thesis for ${symbol}...`);

        // Gather comprehensive data for AI analysis
        const [quote, profile, technicals, news] = await Promise.all([
          fmpClient.getQuote(symbol),
          fmpClient.getCompanyProfile(symbol),
          polygonClient.getTechnicalAnalysis(symbol),
          fmpClient.getStockNews(symbol, 5),
        ]);

        if (!quote) {
          throw new NotFoundError(`Unable to find data for ${symbol}`);
        }

        // Build comprehensive AI prompt
        const prompt = buildAIThesisPrompt({
          symbol,
          companyName: (profile as any)?.companyName || symbol,
          sector: (profile as any)?.sector || "Unknown",
          quote,
          technicals,
          news,
        });

        // Call OpenAI for analysis
        return await generateThesisWithOpenAI(prompt);
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: thesis,
        cache,
        tradingDateEt: dateEt,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        },
      }
    );
  } catch (error) {
    console.error("Error generating AI thesis:", error);

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message, timestamp: Date.now() },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI thesis",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

interface ThesisPromptData {
  symbol: string;
  companyName: string;
  sector: string;
  quote: any;
  technicals: any;
  news: any[];
}

function buildAIThesisPrompt(data: ThesisPromptData): string {
  const { symbol, companyName, sector, quote, technicals, news } = data;

  return `Analyze ${symbol} (${companyName}) and provide a comprehensive trading thesis.

CURRENT PRICE: $${quote.price?.toFixed(2)} (${quote.changesPercentage > 0 ? "+" : ""}${quote.changesPercentage?.toFixed(2)}% today)

COMPANY INFO:
- Sector: ${sector}
- Market Cap: $${quote.marketCap ? (quote.marketCap / 1e9).toFixed(2) + "B" : "N/A"}
- P/E Ratio: ${quote.pe?.toFixed(2) || "N/A"}
- Volume: ${quote.volume ? (quote.volume / 1e6).toFixed(1) + "M" : "N/A"}

TECHNICAL INDICATORS:
${
  technicals
    ? `
- RSI(14): ${technicals.rsi?.value?.toFixed(1) || "N/A"} - ${technicals.rsi?.interpretation || "N/A"}
- MACD: ${technicals.macd?.value?.toFixed(2) || "N/A"} (Signal: ${technicals.macd?.signal?.toFixed(2) || "N/A"})
- MACD Histogram: ${technicals.macd?.histogram?.toFixed(2) || "N/A"}
- Price vs 20-day MA: ${technicals.movingAverages?.sma20 ? ((quote.price / technicals.movingAverages.sma20 - 1) * 100).toFixed(1) + "%" : "N/A"}
- Price vs 50-day MA: ${technicals.movingAverages?.sma50 ? ((quote.price / technicals.movingAverages.sma50 - 1) * 100).toFixed(1) + "%" : "N/A"}
- Price vs 200-day MA: ${technicals.movingAverages?.sma200 ? ((quote.price / technicals.movingAverages.sma200 - 1) * 100).toFixed(1) + "%" : "N/A"}
- Trend: ${technicals.trend || "neutral"}
- Summary: ${technicals.summary || "N/A"}
`
    : "Technical data unavailable"
}

RECENT NEWS (Last 5 articles):
${news.map((article, i) => `${i + 1}. ${article.title} (${article.site || "Unknown source"})`).join("\n")}

Based on this data, provide a comprehensive trading thesis with the following structure:

1. **thesis**: A clear 2-3 sentence actionable thesis explaining the current opportunity or risk
2. **sentiment**: BULLISH, BEARISH, or NEUTRAL
3. **conviction**: HIGH, MEDIUM, or LOW based on the strength of signals
4. **timeframe**: SHORT (days), MEDIUM (weeks), or LONG (months)
5. **keyDrivers**: Array of 3 key factors supporting your thesis (be specific, cite actual data points)
6. **risks**: Array of 2-3 key risks to watch (what could invalidate the thesis)
7. **shouldTrade**: Boolean indicating if this is a tradeable setup right now
8. **reasoning**: Detailed paragraph explaining your analysis with specific references to the data

IMPORTANT GUIDELINES:
- Be specific: Reference actual numbers (e.g., "RSI at 68 approaching overbought")
- Be actionable: Provide clear direction with conviction level
- Be evidence-based: Cite technical signals, fundamental factors, or news catalysts
- Be risk-aware: Mention key support/resistance and potential risks
- Be honest: If the setup isn't clear or conviction is low, say so

Return ONLY valid JSON matching this exact structure:
{
  "thesis": "string",
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "conviction": "HIGH" | "MEDIUM" | "LOW",
  "timeframe": "SHORT" | "MEDIUM" | "LONG",
  "keyDrivers": ["driver1", "driver2", "driver3"],
  "risks": ["risk1", "risk2"],
  "shouldTrade": boolean,
  "reasoning": "string"
}`;
}

async function generateThesisWithOpenAI(prompt: string) {
  try {
    // Check if OpenAI is configured
    if (!openaiClient.isConfigured()) {
      return {
        thesis:
          "AI analysis unavailable - OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.",
        sentiment: "NEUTRAL" as const,
        conviction: "LOW" as const,
        timeframe: "MEDIUM" as const,
        keyDrivers: [],
        risks: [],
        shouldTrade: false,
        reasoning: "AI-powered analysis requires OpenAI API configuration.",
      };
    }

    // Call OpenAI API
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an elite equity analyst and professional trader with 20+ years of experience. You analyze stocks using:
- Technical analysis (price action, indicators, patterns)
- Fundamental analysis (earnings, revenue growth, margins)
- Sentiment analysis (news, analyst ratings)
- Market regime (current market conditions, sector rotation)

Your goal is to provide a clear, actionable thesis that helps traders make informed decisions. Be specific, data-driven, and honest about risks.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(response);

    // Validate and return
    return {
      thesis: parsed.thesis || "Unable to generate thesis",
      sentiment: (parsed.sentiment || "NEUTRAL") as
        | "BULLISH"
        | "BEARISH"
        | "NEUTRAL",
      conviction: (parsed.conviction || "LOW") as "HIGH" | "MEDIUM" | "LOW",
      timeframe: (parsed.timeframe || "MEDIUM") as "SHORT" | "MEDIUM" | "LONG",
      keyDrivers: parsed.keyDrivers || [],
      risks: parsed.risks || [],
      shouldTrade: Boolean(parsed.shouldTrade),
      reasoning: parsed.reasoning || "Analysis complete",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);

    // Return fallback thesis if OpenAI fails
    return {
      thesis:
        "AI analysis encountered an error. Using technical indicators for basic assessment.",
      sentiment: "NEUTRAL" as const,
      conviction: "LOW" as const,
      timeframe: "MEDIUM" as const,
      keyDrivers: [
        "Technical analysis available",
        "Fundamental data available",
        "Full AI analysis temporarily unavailable",
      ],
      risks: [
        "AI analysis failed - manual review recommended",
        "Limited confidence without AI analysis",
      ],
      shouldTrade: false,
      reasoning:
        "OpenAI API call failed. The system has gathered technical and fundamental data, but the AI-powered narrative analysis is unavailable. Please review the raw data and make your own assessment.",
    };
  }
}
