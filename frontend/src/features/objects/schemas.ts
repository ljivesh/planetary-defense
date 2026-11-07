import { z } from 'zod'

import { diameterRangeSchema } from '@/features/close-approaches/schemas'

export const orbitalElementsSchema = z.object({
  epoch: z.number(),
  e: z.number(),
  a: z.number(),
  q: z.number(),
  ad: z.number().nullable(),
  i: z.number(),
  node: z.number(),
  peri: z.number(),
  m: z.number(),
  tp: z.number(),
  periodDays: z.number().nullable(),
  meanMotionDegPerDay: z.number().nullable(),
})

export const virtualImpactorSchema = z.object({
  date: z.string(),
  impactProbability: z.number(),
  palermo: z.number(),
  torino: z.number().nullable(),
  energyMt: z.number().nullable(),
  sigmaVi: z.number().nullable(),
})

export const riskAssessmentSchema = z.object({
  impactProbability: z.number(),
  palermoCumulative: z.number(),
  palermoMax: z.number(),
  torinoMax: z.number().nullable(),
  impactCount: z.number(),
  energyMt: z.number().nullable(),
  massKg: z.number().nullable(),
  velocityImpactKms: z.number().nullable(),
  method: z.string(),
  computedAt: z.string(),
  impactors: z.array(virtualImpactorSchema),
})

export const objectDetailSchema = z.object({
  designation: z.string(),
  fullName: z.string(),
  shortName: z.string(),
  spkId: z.string(),
  kind: z.string(),
  neo: z.boolean(),
  pha: z.boolean(),
  orbitClass: z.object({ name: z.string(), code: z.string() }),
  orbit: z.object({
    elements: orbitalElementsSchema,
    moidAu: z.number().nullable(),
    conditionCode: z.string(),
    firstObserved: z.string(),
    lastObserved: z.string(),
    dataArcDays: z.number().nullable(),
    observations: z.number(),
    solutionDate: z.string(),
  }),
  physical: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
      value: z.string(),
      sigma: z.string().optional(),
      units: z.string().optional(),
    }),
  ),
  h: z.number().nullable(),
  diameterM: z.number().nullable(),
  estimatedDiameterM: diameterRangeSchema.nullable(),
  risk: riskAssessmentSchema.nullable(),
})

export type ObjectDetail = z.infer<typeof objectDetailSchema>
export type OrbitalElements = z.infer<typeof orbitalElementsSchema>
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>
