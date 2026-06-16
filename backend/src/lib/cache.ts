import { redis } from './redis';
import { logger } from './logger';

export class CacheService {
  async invalidateFreelancerCache(userId?: string) {
    try {
      if (userId) {
        // Invalidate specific profile
        await redis.del(`freelancer:profile:${userId}`);
        logger.info({ userId }, 'Invalidated freelancer profile cache');
      }
      
      // Invalidate all listing pages (pattern delete)
      const keys = await redis.keys('freelancers:list:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Invalidated ${keys.length} freelancer list cache keys`);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to invalidate cache');
    }
  }
}

export const cacheService = new CacheService();
