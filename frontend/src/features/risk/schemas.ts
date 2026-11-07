import { z } from 'zod'

import { diameterRangeSchema } from '@/features/close-approaches/schemas'

export const riskObjectSchema = z.object({
  designation: z.string(),
  fullName: z.string(),
  h: z.number().nullable(),
  diameterM: z.number().nullable(),
  estimatedDiameterM: diameterRangeSchema.nullable(),
  impactProbability: z.number(),
  palermoCumulative: z.number(),
  palermoMax: z.number(),
  torinoMax: z.number(),
  impactCount: z.number(),
  yearRange: z.string(),
  velocityInfKms: z.number().nullable(),
  lastObserved: z.string(),
})

export type RiskObject = z.infer<typeof riskObjectSchema>
