import { Worker, Job } from 'bullmq';
import { redisOptions } from '../lib/redis';
import { prisma } from '../lib/prisma';

export const emailWorker = new Worker('emailQueue', async (job: Job) => {
  console.log(`Processing email job ${job.id} of type ${job.name}`);
  const { to, subject, body } = job.data;
  
  // Here we would actually integrate with SendGrid/AWS SES.
  // For now, we simulate the email sending.
  console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  
}, { connection: redisOptions });

emailWorker.on('completed', (job) => {
  console.log(`Email Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email Job ${job?.id} failed:`, err);
});
