import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
    tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    enableReadyCheck: false,   // ← fixes hanging
    maxRetriesPerRequest: null,    // ← fixes hanging
    lazyConnect: true     // ← don't block startup
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.log('Redis error:', err.message));

export default redis;