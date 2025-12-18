import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai/openai-client";

export const runtime = "edge";
export const maxDuration = 30;

interface MarketInsightRequest {
  stories: Array<{
    title: string;
    sentiment: string;
    importance: string;
  }>;
  technicalData?: {
    rsi?: number;
    macd?: number;
    trend?: string;
  };
  mlPrediction?: {
    direction: string;
    confidence: number;
  };
}

/**
 * Generate AI-powered market insights using ChatGPT with web search
 */
export async function POST(request: NextRequest) {
  try {
    const body: MarketInsightRequest = await request.json();
    const { stories, technicalData, mlPrediction } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API is not configured",
        },
        { status: 503 }
      );
    }

    // Prepare context for ChatGPT
    const newsContext = stories
      .slice(0, 10)
      .map((s, i) => `${i + 1}. [${s.sentiment.toUpperCase()}] ${s.title}`)
      .join("\n");

    const technicalContext = technicalData
      ? `\nTechnical Indicators:
- RSI: ${technicalData.rsi?.toFixed(1) || "N/A"}
- MACD: ${technicalData.macd?.toFixed(2) || "N/A"}
- Trend: ${technicalData.trend || "N/A"}`
      : "";

    const mlContext = mlPrediction
      ? `\nML Model Prediction: ${mlPrediction.direction} with ${(mlPrediction.confidence * 100).toFixed(1)}% confidence`
      : "";

    const prompt = `You are a senior quantitative analyst at a top hedge fund. Analyze today's market with precision and depth.

**Context:**
${newsContext}
${technicalContext}
${mlContext}

**Provide:**

1. **Market Summary** (3-4 sentences):
   - What's the dominant narrative driving markets today?
   - Which sectors/assets are leading? Which are lagging?
   - What's the institutional sentiment (risk-on vs risk-off)?

2. **Key Takeaways** (4-5 actionable bullets):
   - Specific price levels, catalysts, or inflection points
   - Correlation shifts (e.g., bonds vs equities, VIX behavior)
   - Unusual volume, options activity, or technical setups
   - Macro implications (Fed policy, economic data, geopolitics)

3. **Trading Ideas** (3-4 specific strategies):
   - Entry/exit levels with rationale
   - Sector rotation opportunities
   - Hedging strategies if applicable
   - Time horizon (intraday, swing, position)

4. **Risk Factors** (3-4 specific risks):
   - Event risk (earnings, data releases, geopolitical)
   - Technical levels that could trigger reversals
   - Sentiment extremes (overbought/oversold)
   - Liquidity concerns or market structure risks

**Requirements:**
- Be specific with tickers, levels, and timeframes
- Cite technical indicators (RSI, MACD, support/resistance)
- Consider both bullish AND bearish scenarios
- Focus on asymmetric risk/reward setups
- Professional, concise, actionable`;

    // Call GPT-5.1 with web search enabled
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content:
            "You are a professional market analyst providing concise, actionable insights for traders. Be specific, data-driven, and balanced in your analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const analysis = completion.choices[0]?.message?.content || "";

    // Parse the response into structured sections
    const sections = {
      summary: "",
      keyTakeaways: [] as string[],
      suggestions: [] as string[],
      risks: [] as string[],
    };

    const lines = analysis.split("\n");
    let currentSection = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (
        trimmed.toLowerCase().includes("market summary") ||
        trimmed.startsWith("**Market Summary**")
      ) {
        currentSection = "summary";
        continue;
      } else if (
        trimmed.toLowerCase().includes("key takeaways") ||
        trimmed.startsWith("**Key Takeaways**")
      ) {
        currentSection = "takeaways";
        continue;
      } else if (
        trimmed.toLowerCase().includes("trading suggestions") ||
        trimmed.startsWith("**Trading Suggestions**")
      ) {
        currentSection = "suggestions";
        continue;
      } else if (
        trimmed.toLowerCase().includes("risk factors") ||
        trimmed.startsWith("**Risk Factors**")
      ) {
        currentSection = "risks";
        continue;
      }

      // Add content to appropriate section
      if (currentSection === "summary" && !trimmed.startsWith("**")) {
        sections.summary += (sections.summary ? " " : "") + trimmed;
      } else if (currentSection === "takeaways" && trimmed.match(/^[-•*\d]/)) {
        sections.keyTakeaways.push(trimmed.replace(/^[-•*\d.)\s]+/, ""));
      } else if (currentSection === "suggestions" && trimmed.match(/^[-•*\d]/)) {
        sections.suggestions.push(trimmed.replace(/^[-•*\d.)\s]+/, ""));
      } else if (currentSection === "risks" && trimmed.match(/^[-•*\d]/)) {
        sections.risks.push(trimmed.replace(/^[-•*\d.)\s]+/, ""));
      }
    }

    // Fallback if parsing fails
    if (!sections.summary && analysis) {
      sections.summary = analysis.slice(0, 300);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...sections,
        rawAnalysis: analysis,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error in /api/market/insights:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

