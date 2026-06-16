import { Queue } from 'bullmq';
import { redisOptions } from '../lib/redis';

export const emailQueue = new Queue('email', { connection: redisOptions });
export const notificationQueue = new Queue('notifications', { connection: redisOptions });
export const analyticsQueue = new Queue('analytics', { connection: redisOptions });
