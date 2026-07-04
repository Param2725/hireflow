import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
    tls: {},
    enableReadyCheck: false,
    maxRetriesPerRequest: null
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.log('Redis error:', err.message));

export default redis;