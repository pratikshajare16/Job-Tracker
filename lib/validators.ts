import { z } from 'zod';

export const STATUSES = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const applicationSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z.enum(STATUSES),
  followUpAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const applicationUpdateSchema = applicationSchema.partial();