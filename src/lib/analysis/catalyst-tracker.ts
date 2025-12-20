/**
 * Catalyst Calendar Tracker
 * Tracks upcoming events that may impact the stock
 */

export interface Catalyst {
  date: string; // ISO date
  event: string;
  type:
    | "earnings"
    | "dividend"
    | "economic"
    | "product"
    | "regulatory"
    | "other";
  importance: "HIGH" | "MEDIUM" | "LOW";
  description?: string;
  impact: "bullish" | "bearish" | "neutral";
  daysUntil: number;
}

export interface CatalystWarnings {
  nearTermCatalysts: Catalyst[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Identify catalysts from company and market data
 */
export function identifyCatalysts(data: {
  symbol: string;
  earningsDate?: string;
  dividendDate?: string;
  economicEvents?: Array<{ date: string; event: string; importance: string }>;
  news?: Array<{ title: string; date: string }>;
}): Catalyst[] {
  const catalysts: Catalyst[] = [];
  const now = new Date();

  // Earnings
  if (data.earningsDate) {
    const earningsDate = new Date(data.earningsDate);
    const daysUntil = Math.ceil(
      (earningsDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil >= -5 && daysUntil <= 30) {
      catalysts.push({
        date: data.earningsDate,
        event: `${data.symbol} Earnings Report`,
        type: "earnings",
        importance: "HIGH",
        description: "Quarterly earnings announcement",
        impact: "neutral",
        daysUntil,
      });
    }
  }

  // Dividend
  if (data.dividendDate) {
    const divDate = new Date(data.dividendDate);
    const daysUntil = Math.ceil(
      (divDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil >= 0 && daysUntil <= 30) {
      catalysts.push({
        date: data.dividendDate,
        event: "Ex-Dividend Date",
        type: "dividend",
        importance: "MEDIUM",
        description: "Stock trades ex-dividend",
        impact: "bullish",
        daysUntil,
      });
    }
  }

  // Economic events
  if (data.economicEvents) {
    for (const event of data.economicEvents) {
      const eventDate = new Date(event.date);
      const daysUntil = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntil >= 0 && daysUntil <= 14) {
        catalysts.push({
          date: event.date,
          event: event.event,
          type: "economic",
          importance: event.importance as any,
          impact: "neutral",
          daysUntil,
        });
      }
    }
  }

  // Check news for product launches, FDA approvals, etc.
  if (data.news) {
    for (const article of data.news) {
      const title = article.title.toLowerCase();
      const articleDate = new Date(article.date);
      const daysUntil = Math.ceil(
        (articleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntil >= -7 && daysUntil <= 30) {
        if (title.includes("fda") || title.includes("approval")) {
          catalysts.push({
            date: article.date,
            event: "FDA Decision / Regulatory Event",
            type: "regulatory",
            importance: "HIGH",
            description: article.title,
            impact: "neutral",
            daysUntil,
          });
        } else if (title.includes("launch") || title.includes("release")) {
          catalysts.push({
            date: article.date,
            event: "Product Launch",
            type: "product",
            importance: "MEDIUM",
            description: article.title,
            impact: "bullish",
            daysUntil,
          });
        }
      }
    }
  }

  // Sort by date
  catalysts.sort((a, b) => a.daysUntil - b.daysUntil);

  return catalysts;
}

/**
 * Generate warnings and recommendations based on catalysts
 */
export function analyzeCatalystRisk(
  catalysts: Catalyst[],
  strategyTimeframe: string
): CatalystWarnings {
  const nearTermCatalysts = catalysts.filter((c) => c.daysUntil <= 14);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Earnings warnings
  const earningsCatalyst = nearTermCatalysts.find((c) => c.type === "earnings");
  if (earningsCatalyst) {
    if (earningsCatalyst.daysUntil <= 3) {
      warnings.push(
        `⚠️ Earnings in ${earningsCatalyst.daysUntil} days - expect high volatility`
      );
      recommendations.push("Consider reducing position size before earnings");
      recommendations.push("Or widen stop loss to avoid earnings whipsaw");
    } else if (earningsCatalyst.daysUntil <= 7) {
      warnings.push(
        `Earnings approaching in ${earningsCatalyst.daysUntil} days`
      );
      recommendations.push("Monitor IV (implied volatility) for options");
    }
  }

  // High importance events
  const highImportance = nearTermCatalysts.filter(
    (c) => c.importance === "HIGH" && c.type !== "earnings"
  );
  if (highImportance.length > 0) {
    warnings.push(
      `${highImportance.length} high-importance event(s) in next 2 weeks`
    );
    for (const catalyst of highImportance) {
      recommendations.push(
        `Monitor: ${catalyst.event} (${catalyst.daysUntil}d)`
      );
    }
  }

  // Positive catalysts
  const bullishCatalysts = nearTermCatalysts.filter(
    (c) => c.impact === "bullish"
  );
  if (bullishCatalysts.length > 0) {
    recommendations.push(
      `${bullishCatalysts.length} potential positive catalyst(s) identified`
    );
  }

  return {
    nearTermCatalysts,
    warnings,
    recommendations,
  };
}
