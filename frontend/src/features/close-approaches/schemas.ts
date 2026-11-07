import { z } from 'zod'

export const diameterRangeSchema = z.object({ minM: z.number(), maxM: z.number() })

export const closeApproachSchema = z.object({
  designation: z.string(),
  fullName: z.string(),
  time: z.string(),
  distanceAu: z.number(),
  distanceMinAu: z.number(),
  distanceMaxAu: z.number(),
  velocityRelKms: z.number(),
  velocityInfKms: z.number(),
  timeUncertainty: z.string(),
  h: z.number().nullable(),
  diameterM: z.number().nullable(),
  estimatedDiameterM: diameterRangeSchema.nullable(),
})

export type CloseApproach = z.infer<typeof closeApproachSchema>

export interface ApproachFilters {
  from?: string
  to?: string
  maxDistAu?: number
  minDiameterM?: number
  limit?: number
}
