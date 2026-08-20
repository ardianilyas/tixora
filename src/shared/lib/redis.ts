import Redis, { type RedisOptions } from "ioredis";
import { env } from "../config/env";

export const redisConnectionOptions: RedisOptions = {
  maxRetriesPerRequest: null,
};

export function createRedisClient(options?: RedisOptions): Redis {
  return new Redis(env.REDIS_URL, {
    ...redisConnectionOptions,
    ...options,
  });
}

export const redis = createRedisClient();