import { z } from 'zod';

export const uploadVideoSchema = z.object({
  language: z.string().optional(),
});

export const jobIdSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format'),
});

export const exportFormatSchema = z.object({
  format: z.enum(['txt', 'srt', 'vtt', 'json'], {
    errorMap: () => ({ message: 'Format must be one of: txt, srt, vtt, json' }),
  }),
});
