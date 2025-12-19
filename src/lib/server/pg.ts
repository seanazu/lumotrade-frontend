import { Pool } from "pg";

function buildDatabaseUrlFromParts(): string | null {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !database || !user || !password) {
    return null;
  }

  // URL-encode credentials
  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);
  return `postgresql://${u}:${p}@${host}:${port}/${database}`;
}

export function getDatabaseUrl(): string | null {
  return process.env.DATABASE_URL || buildDatabaseUrlFromParts();
}

declare global {
  // eslint-disable-next-line no-var
  var __lumoPgPool: Pool | undefined;
}

export function getPgPool(): Pool | null {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;

  if (globalThis.__lumoPgPool) {
    return globalThis.__lumoPgPool;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DB_POOL_SIZE || 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  globalThis.__lumoPgPool = pool;
  return pool;
}

