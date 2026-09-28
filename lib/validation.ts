import { z } from "zod";

const emailSchema = z.string().email().transform((email) => email.toLowerCase());

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  businessName: z.string().min(1).max(120),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});

export const businessCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  googleReviewUrl: z.string().url(),
  feedbackEmail: z.string().email().optional().or(z.literal("")),
});

export const businessUpdateSchema = businessCreateSchema.partial().extend({
  name: z.string().min(1).max(120).optional(),
});

export const ratingCreateSchema = z.object({
  slug: z.string().min(1).max(40),
  score: z.number().int().min(1).max(5),
  reasons: z.array(z.string().min(1).max(40)).max(10).default([]),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export const queryPageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
