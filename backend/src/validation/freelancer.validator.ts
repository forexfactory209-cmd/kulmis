import { z } from 'zod';

export const freelancerQuerySchema = z.object({
  page:         z.coerce.number().min(1).default(1),
  limit:        z.coerce.number().min(1).max(50).default(20),
  skill:        z.string().optional(),
  minRate:      z.coerce.number().optional(),
  maxRate:      z.coerce.number().optional(),
  availability: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).optional(),
  search:       z.string().max(100).optional(),
});
