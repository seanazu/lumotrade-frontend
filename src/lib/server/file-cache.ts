import fs from 'fs';
import path from 'path';

// Use /tmp directory in serverless environments (Vercel)
// This is the only writable directory in Vercel's serverless functions
const CACHE_DIR = process.env.VERCEL ? '/tmp/.cache' : path.join(process.cwd(), '.cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export type CacheGetResult<T> =
  | { hit: true; data: T; updatedAt: string }
  | { hit: false };

/**
 * Simple file-based cache for development/testing
 * In production, this would use InstantDB properly configured
 */

function getCacheFilePath(key: string, scope: string): string {
  const safeKey = key.replace(/[^a-z0-9]/gi, '_');
  const safeScope = scope.replace(/[^a-z0-9]/gi, '_');
  return path.join(CACHE_DIR, `${safeKey}_${safeScope}.json`);
}

async function getCacheEntry<T>(
  key: string,
  scope: string
): Promise<CacheGetResult<T>> {
  try {
    const filePath = getCacheFilePath(key, scope);
    
    if (!fs.existsSync(filePath)) {
      return { hit: false };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const entry = JSON.parse(fileContent);

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      fs.unlinkSync(filePath);
      return { hit: false };
    }

    return {
      hit: true,
      data: entry.payload as T,
      updatedAt: entry.updatedAt,
    };
  } catch (error) {
    console.error('Error getting cache entry:', error);
    return { hit: false };
  }
}

async function setCacheEntry(
  key: string,
  scope: string,
  payload: unknown,
  opts?: { expiresAt?: Date; purgeOtherDailyScopes?: boolean }
): Promise<void> {
  try {
    const filePath = getCacheFilePath(key, scope);
    const now = new Date().toISOString();

    const entry = {
      cacheKey: key,
      scope,
      payload,
      expiresAt: opts?.expiresAt?.getTime() || null,
      createdAt: now,
      updatedAt: now,
    };

    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), 'utf-8');

    // Purge other daily scopes if requested
    if (opts?.purgeOtherDailyScopes && scope.startsWith('daily:')) {
      const files = fs.readdirSync(CACHE_DIR);
      const safeKey = key.replace(/[^a-z0-9]/gi, '_');
      
      let deletedCount = 0;
      files.forEach(file => {
        if (file.startsWith(safeKey + '_daily_') && file !== path.basename(filePath)) {
          const oldFilePath = path.join(CACHE_DIR, file);
          fs.unlinkSync(oldFilePath);
          deletedCount++;
          console.log(`🗑️  Deleted old cache: ${file}`);
        }
      });
      
      if (deletedCount > 0) {
        console.log(`✅ Purged ${deletedCount} old cache file(s)`);
      }
    }
  } catch (error) {
    console.error('Error setting cache entry:', error);
    throw error;
  }
}

export async function getOrComputeDailyCache<T>(params: {
  key: string;
  dateEt: string; // YYYY-MM-DD
  forceRefresh?: boolean;
  compute: () => Promise<T>;
}): Promise<{
  data: T;
  cache: { hit: boolean; scope: string; storedAt?: string };
}> {
  const scope = `daily:${params.dateEt}`;

  // Try to get from cache first (unless force refresh)
  if (!params.forceRefresh) {
    const cached = await getCacheEntry<T>(params.key, scope);
    if (cached.hit) {
      console.log(`✅ Cache HIT for ${params.key} (${scope})`);
      return {
        data: cached.data,
        cache: { hit: true, scope, storedAt: cached.updatedAt },
      };
    }
  }

  // Compute fresh data
  console.log(`🔄 Cache MISS for ${params.key} (${scope}), computing...`);
  const computed = await params.compute();

  // Store in cache
  await setCacheEntry(params.key, scope, computed, {
    purgeOtherDailyScopes: true,
  });

  console.log(`💾 Cached ${params.key} (${scope})`);

  return { data: computed, cache: { hit: false, scope } };
}

export async function getOrComputeTtlCache<T>(params: {
  key: string;
  ttlSeconds: number;
  forceRefresh?: boolean;
  compute: () => Promise<T>;
}): Promise<{
  data: T;
  cache: { hit: boolean; scope: string; storedAt?: string };
}> {
  const scope = 'ttl';

  // Try to get from cache first (unless force refresh)
  if (!params.forceRefresh) {
    const cached = await getCacheEntry<T>(params.key, scope);
    if (cached.hit) {
      return {
        data: cached.data,
        cache: { hit: true, scope, storedAt: cached.updatedAt },
      };
    }
  }

  // Compute fresh data
  const computed = await params.compute();

  // Store in cache with expiration
  await setCacheEntry(params.key, scope, computed, {
    expiresAt: new Date(Date.now() + params.ttlSeconds * 1000),
  });

  return { data: computed, cache: { hit: false, scope } };
}

