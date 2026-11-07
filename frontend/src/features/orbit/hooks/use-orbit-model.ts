import { useMemo } from 'react'

import { toElements, toScene } from '@/features/orbit/lib'
import type { OrbitalElements } from '@/features/objects/schemas'
import { EARTH_ELEMENTS, distance, isElliptical, orbitPath, positionAt, type Vec3 } from '@/lib/orbital'

/** Orbit paths (static) and body positions (per Julian Date) in scene coordinates. */
export function useOrbitModel(objectElements: OrbitalElements, jd: number) {
  const el = useMemo(() => toElements(objectElements), [objectElements])
  const elliptical = isElliptical(el)

  const paths = useMemo(
    () => ({
      earth: orbitPath(EARTH_ELEMENTS, 256).map(toScene),
      object: orbitPath(el, 512).map(toScene),
    }),
    [el],
  )

  return useMemo(() => {
    const earthAu = positionAt(EARTH_ELEMENTS, jd)
    const objectAu: Vec3 | null = elliptical ? positionAt(el, jd) : null
    return {
      paths,
      elliptical,
      earth: toScene(earthAu),
      object: objectAu ? toScene(objectAu) : null,
      earthDistanceAu: objectAu ? distance(earthAu, objectAu) : null,
      /** Radius (scene units) the camera should frame. */
      extent: Math.max(1.2, elliptical ? (objectElements.ad ?? objectElements.a) : 1.2),
    }
  }, [paths, elliptical, el, jd, objectElements.ad, objectElements.a])
}
