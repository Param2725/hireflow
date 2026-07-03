import Bull from 'bull';
import { sendStatusEmail } from '../config/mailer.js';

// Parse Upstash Redis URL for Bull
const redisUrl = new URL(process.env.REDIS_URL);

const emailQueue = new Bull('emailQueue', {
    redis: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port),
        password: redisUrl.password,
        tls: {}   // ← required for Upstash rediss:// connection
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    }
});

emailQueue.process(async (job) => {
    console.log('Processing email job:', job.data);
    const { toEmail, seekerName, jobTitle, company, status } = job.data;
    await sendStatusEmail(toEmail, seekerName, jobTitle, company, status);
    console.log(`Email sent to ${toEmail} — status: ${status}`);
});

emailQueue.on('ready', () => {
    console.log('Email queue ready ✅');
});

emailQueue.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, error) => {
    console.log(`Email job ${job.id} failed:`, error.message);
});

export default emailQueue;