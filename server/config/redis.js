import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
    tls: {},
    maxRetriesPerRequest: 3
});

redis.on('connect', () => console.log('Redis Connected'));
redis.on('error', () => console.log('Redis Error: ', err.message));

export default redis;