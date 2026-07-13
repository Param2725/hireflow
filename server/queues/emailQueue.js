import Bull from 'bull';
import { sendStatusEmail } from '../config/mailer.js';

let emailQueue = null;

const createQueue = () => {
    try {
        const redisUrl = new URL(process.env.REDIS_URL);

        emailQueue = new Bull('emailQueue', {
            redis: {
                host: redisUrl.hostname,
                port: Number(redisUrl.port),
                password: redisUrl.password,
                tls: {},
                enableReadyCheck: false,
                maxRetriesPerRequest: null,
                retryStrategy: (times) => {
                    if (times > 3) return null; // stop retrying after 3 attempts
                    return Math.min(times * 1000, 3000);
                }
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 }
            }
        });

        emailQueue.process(async (job) => {
            const { toEmail, seekerName, jobTitle, company, status, interviewDate } = job.data;
            await sendStatusEmail(toEmail, seekerName, jobTitle, company, status, interviewDate);
            console.log(`Email sent to ${toEmail} — status: ${status}`);
        });

        emailQueue.on('ready', () => {
            console.log('Email queue ready');
        });

        emailQueue.on('completed', (job) => {
            console.log(`Email job ${job.id} completed`);
        });

        emailQueue.on('failed', (job, error) => {
            console.log(`Email job ${job.id} failed:`, error.message);
        });

        emailQueue.on('error', (error) => {
            if (error.message.includes('ECONNRESET') || error.message.includes('ETIMEDOUT')) {
                return; // silently ignore connection resets
            }
            console.log('Queue error:', error.message);
        });

    } catch (err) {
        console.log('Queue creation failed:', err.message);
    }
};

createQueue();

export default {
    add: async (data) => {
        if (!emailQueue) {
            console.log('Queue not ready — skipping email');
            return;
        }
        try {
            await emailQueue.add(data);
        } catch (err) {
            console.log('Queue add failed (non-critical):', err.message);
        }
    }
};