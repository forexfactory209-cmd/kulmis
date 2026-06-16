import { z } from 'zod';

export const registerValidation = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['FREELANCER', 'CLIENT'], { message: 'Role must be FREELANCER or CLIENT' }),
});

export const loginValidation = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});
