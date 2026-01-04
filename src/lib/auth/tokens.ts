/**
 * JWT Token Management
 * Handles access tokens (24h expiry) and refresh tokens (30 days)
 */

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const ACCESS_TOKEN_KEY = "lumotrade_access_token";
const REFRESH_TOKEN_KEY = "lumotrade_refresh_token";
const TOKEN_EXPIRY_KEY = "lumotrade_token_expiry";

// Access token expires in 24 hours
const ACCESS_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms

// Refresh token expires in 30 days
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

/**
 * Generate a simple JWT-like token (for demo purposes)
 * In production, this should be done server-side with proper signing
 */
function generateToken(
  userId: string,
  email: string,
  expiresIn: number
): string {
  const payload: TokenPayload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + expiresIn,
  };

  // Base64 encode the payload (NOT SECURE - use proper JWT in production)
  return btoa(JSON.stringify(payload));
}

/**
 * Decode and verify a token
 */
function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = JSON.parse(atob(token)) as TokenPayload;

    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/**
 * Create new tokens for a user
 */
export function createTokens(userId: string, email: string): Tokens {
  const accessToken = generateToken(userId, email, ACCESS_TOKEN_EXPIRY);
  const refreshToken = generateToken(userId, email, REFRESH_TOKEN_EXPIRY);
  const expiresAt = Date.now() + ACCESS_TOKEN_EXPIRY;

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(tokens: Tokens): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, tokens.expiresAt.toString());
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(): number | null {
  if (typeof window === "undefined") return null;

  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Clear all tokens
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem("lumotrade_user");
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return true;

  // Consider expired if less than 5 minutes remaining (for safety)
  const BUFFER_TIME = 5 * 60 * 1000; // 5 minutes
  return Date.now() > expiry - BUFFER_TIME;
}

/**
 * Verify and decode access token
 */
export function verifyAccessToken(): TokenPayload | null {
  const token = getAccessToken();
  if (!token) return null;

  return decodeToken(token);
}

/**
 * Refresh the access token using refresh token
 */
export function refreshAccessToken(): Tokens | null {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const decoded = decodeToken(refreshToken);
  if (!decoded) {
    clearTokens();
    return null;
  }

  // Generate new access token
  const tokens = createTokens(decoded.userId, decoded.email);
  storeTokens(tokens);

  console.log("🔄 Access token refreshed");
  return tokens;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  // If token is expired, try to refresh
  if (isTokenExpired()) {
    const refreshed = refreshAccessToken();
    return !!refreshed;
  }

  // Verify token is valid
  const verified = verifyAccessToken();
  return !!verified;
}

/**
 * Get user from token
 */
export function getUserFromToken(): { userId: string; email: string } | null {
  const decoded = verifyAccessToken();
  if (!decoded) return null;

  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}

