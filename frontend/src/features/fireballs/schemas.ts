import { z } from 'zod'

export const fireballSchema = z.object({
  time: z.string(),
  radiatedEnergyJ: z.number(),
  impactEnergyKt: z.number(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  altitudeKm: z.number().nullable(),
  velocityKms: z.number().nullable(),
})

export type Fireball = z.infer<typeof fireballSchema>
