import Bull from 'bull';
import { sendStatusEmail } from '../config/mailer.js';

const redisUrl = new URL(process.env.REDIS_URL);

const emailQueue = new Bull('emailQueue', {
    redis: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port),
        password: redisUrl.password,
        tls: process.env.NODE_ENV === 'production' ? {} : undefined,
        enableReadyCheck: false,   // ← fixes hanging issue
        maxRetriesPerRequest: null  // ← fixes hanging issue
    }
});

emailQueue.process(async (job) => {
    const { toEmail, seekerName, jobTitle, company, status } = job.data;
    await sendStatusEmail(toEmail, seekerName, jobTitle, company, status);
    console.log(`Email sent to ${toEmail} — status: ${status}`);
});

emailQueue.on('error', (error) => {
    console.log('Queue error:', error.message);
});

emailQueue.on('failed', (job, error) => {
    console.log(`Job failed:`, error.message);
});

export default emailQueue;