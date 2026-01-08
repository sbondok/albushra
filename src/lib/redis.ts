import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedisClient() {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) return null as any;
  client = new Redis(url);
  client.on('error', (e) => console.error('Redis error', e));
  return client;
}

export function hasRedis() {
  return !!process.env.REDIS_URL;
}
