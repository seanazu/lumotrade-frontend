/**
 * Environment Variables Configuration
 * Centralized access to environment variables with validation
 */

// API Keys
export const POLYGON_API_KEY = process.env.POLYGON_API_KEY || '';
export const MARKETAUX_API_KEY = process.env.MARKETAUX_API_KEY || '';
export const FMP_API_KEY = process.env.FMP_API_KEY || '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
export const ORATS_API_KEY = process.env.ORATS_API_KEY || '';

// Backend URLs
export const ML_BACKEND_URL =
  process.env.NEXT_PUBLIC_ML_BACKEND_URL || 'http://localhost:5001';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Database
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const PGHOST = process.env.PGHOST || 'localhost';
export const PGPORT = parseInt(process.env.PGPORT || '5432', 10);
export const PGDATABASE = process.env.PGDATABASE || '';
export const PGUSER = process.env.PGUSER || '';
export const PGPASSWORD = process.env.PGPASSWORD || '';

// InstantDB
export const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '';

// Feature Flags
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// API Timeouts
export const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10);
export const ML_API_TIMEOUT = parseInt(process.env.ML_API_TIMEOUT || '60000', 10);

/**
 * Validates that required environment variables are set
 * @throws Error if required variables are missing
 */
export function validateEnv() {
  const required = {
    POLYGON_API_KEY,
    MARKETAUX_API_KEY,
    FMP_API_KEY,
    INSTANT_APP_ID,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0 && IS_PRODUCTION) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate on module load in production
if (IS_PRODUCTION) {
  validateEnv();
}

