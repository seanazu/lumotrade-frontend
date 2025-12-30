/**
 * Environment Variables Configuration
 * Centralized access to environment variables with validation
 * 
 * SECURITY NOTES:
 * - All variables WITHOUT NEXT_PUBLIC_ prefix are SERVER-ONLY (never exposed to browser)
 * - Variables WITH NEXT_PUBLIC_ prefix are exposed to browser (use sparingly!)
 * - ML_BACKEND_URL and ML_API_KEY are server-only (proxied through /api/ml/* routes)
 */

// ============================================================================
// SERVER-ONLY API Keys (Never exposed to browser)
// ============================================================================

export const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "";
export const MARKETAUX_API_KEY = process.env.MARKETAUX_API_KEY || "";
export const FMP_API_KEY = process.env.FMP_API_KEY || "";
export const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ""; // Optional
export const ORATS_API_KEY = process.env.ORATS_API_KEY || "";
export const CRON_SECRET = process.env.CRON_SECRET || ""; // Required in production

// ============================================================================
// SERVER-ONLY Backend URLs (Proxied through Next.js API routes)
// ============================================================================

export const ML_BACKEND_URL =
  process.env.ML_BACKEND_URL || "http://localhost:5001";
export const ML_API_KEY = process.env.ML_API_KEY || "";

// ============================================================================
// CLIENT-ACCESSIBLE Variables (Exposed to browser with NEXT_PUBLIC_ prefix)
// ============================================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// InstantDB App ID - Required for client-side authentication
export const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "";

// ============================================================================
// SERVER-ONLY Database Config (Legacy - using InstantDB now)
// ============================================================================

export const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN || "";
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const PGHOST = process.env.PGHOST || "localhost";
export const PGPORT = parseInt(process.env.PGPORT || "5432", 10);
export const PGDATABASE = process.env.PGDATABASE || "";
export const PGUSER = process.env.PGUSER || "";
export const PGPASSWORD = process.env.PGPASSWORD || "";

// Feature Flags
export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = NODE_ENV === "development";

// API Timeouts
export const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || "30000", 10);
export const ML_API_TIMEOUT = parseInt(
  process.env.ML_API_TIMEOUT || "60000",
  10
);

/**
 * Validates that required environment variables are set
 * @throws Error if required variables are missing
 */
export function validateEnv() {
  const required = {
    POLYGON_API_KEY,
    MARKETAUX_API_KEY,
    FMP_API_KEY,
    OPENAI_API_KEY,
    INSTANT_APP_ID,
    CRON_SECRET, // Required in production
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0 && IS_PRODUCTION) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Optional variables (log warning if missing)
  if (!ANTHROPIC_API_KEY && IS_PRODUCTION) {
    console.warn(
      "⚠️ ANTHROPIC_API_KEY not set - Claude AI features will be unavailable"
    );
  }
}

// Validate on module load in production
if (IS_PRODUCTION) {
  validateEnv();
}
