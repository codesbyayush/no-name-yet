/**
 * Importing redis client as type only here and adding dynamic import for redis client
 * in the factory function to avoid bundling the redis client with the server as this
 * is only used in dev and not available in workers environment
 */

import type { RedisClient as BunRedisClient } from 'bun';
import type { AppEnv } from './env';

/**
 * Cache interface for key-value storage
 * Abstracts over different cache implementations (KV, Redis)
 */
export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Cache implementation using Cloudflare Workers KV
 */
export class KVStoreCache implements Cache {
  private kv: KVNamespace;

  constructor(kvNamespace: KVNamespace) {
    this.kv = kvNamespace;
  }

  async get(key: string): Promise<string | null> {
    return await this.kv.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.kv.put(key, value, { expirationTtl: ttlSeconds });
    } else {
      await this.kv.put(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}

/**
 * Cache implementation using Redis
 */
export class RedisCache implements Cache {
  private redis: BunRedisClient;

  constructor(redisClient: BunRedisClient) {
    this.redis = redisClient;
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

/**
 * Factory function to get the appropriate cache implementation based on environment
 */
export async function getCache(env: AppEnv): Promise<Cache> {
  if (env.NODE_ENV === 'development' && env.REDIS_URL) {
    try {
      const { RedisClient } = await import('bun');
      const redisClient = new RedisClient(env.REDIS_URL);
      return new RedisCache(redisClient);
    } catch (error) {
      console.error('Error importing RedisClient:', error);
    }
  }

  if (env.OF_STORE) {
    return new KVStoreCache(env.OF_STORE);
  }

  throw new Error(
    'No cache configured. KV namespace (OF_STORE) should be available from wrangler.toml, or provide REDIS_URL in development.',
  );
}
