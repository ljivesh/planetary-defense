import { z } from 'zod'

import { closeApproachSchema } from '@/features/close-approaches/schemas'
import { fireballSchema } from '@/features/fireballs/schemas'
import { riskObjectSchema } from '@/features/risk/schemas'

export const summarySchema = z.object({
  windowDays: z.number(),
  approachCount: z.number(),
  withinLunarDistance: z.number(),
  closestApproach: closeApproachSchema.nullable(),
  largestApproach: closeApproachSchema.nullable(),
  sentryCount: z.number(),
  highestRisk: riskObjectSchema.nullable(),
  latestFireball: fireballSchema.nullable(),
  generatedAt: z.string(),
})

export type Summary = z.infer<typeof summarySchema>
