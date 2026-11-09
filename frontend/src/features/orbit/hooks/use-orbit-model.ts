import { useMemo } from 'react'

import type { CloseApproach } from '@/features/close-approaches/schemas'
import type { OrbitalElements } from '@/features/objects/schemas'
import {
  apsides,
  dropLines,
  nodePositions,
  splitAtEcliptic,
  toElements,
  toScene,
  trailPath,
} from '@/features/orbit/lib'
import { planetsFor } from '@/features/orbit/planets'
import { EARTH_ELEMENTS, dateToJd, distance, isElliptical, orbitPath, positionAt, type Vec3 } from '@/lib/orbital'

const toSceneAll = (pts: Vec3[]) => pts.map(toScene)

export interface Encounter {
  approach: CloseApproach
  jd: number
  earth: Vec3
  object: Vec3
}

/**
 * Everything the orbit scene draws, in scene coordinates. Static geometry
 * (paths, markers) depends only on the elements; positions depend on `jd`.
 */
export function useOrbitModel(objectElements: OrbitalElements, jd: number, encounterApproach: CloseApproach | null) {
  const el = useMemo(() => toElements(objectElements), [objectElements])
  const elliptical = isElliptical(el)
  const aphelion = elliptical ? (objectElements.ad ?? el.a * (1 + el.e)) : el.a

  const planets = useMemo(
    () => planetsFor(aphelion).map((p) => ({ ...p, path: toSceneAll(orbitPath(p.elements, 256)) })),
    [aphelion],
  )

  const geometry = useMemo(() => {
    if (!elliptical) return null
    const path = orbitPath(el, 720)
    const { above, below } = splitAtEcliptic(path)
    const nodes = nodePositions(el)
    const aps = apsides(el)
    return {
      above: above.map(toSceneAll),
      below: below.map(toSceneAll),
      drops: toSceneAll(dropLines(path, 20)),
      ascending: toScene(nodes.ascending),
      descending: toScene(nodes.descending),
      perihelion: toScene(aps.perihelion),
      aphelion: toScene(aps.aphelion),
    }
  }, [el, elliptical])

  const encounter = useMemo<Encounter | null>(() => {
    if (!elliptical || !encounterApproach) return null
    const ejd = dateToJd(new Date(encounterApproach.time))
    return {
      approach: encounterApproach,
      jd: ejd,
      earth: toScene(positionAt(EARTH_ELEMENTS, ejd)),
      object: toScene(positionAt(el, ejd)),
    }
  }, [el, elliptical, encounterApproach])

  const live = useMemo(() => {
    const earthAu = positionAt(EARTH_ELEMENTS, jd)
    const objectAu: Vec3 | null = elliptical ? positionAt(el, jd) : null
    return {
      planets: planets.map((p) => ({ id: p.id, position: toScene(positionAt(p.elements, jd)) })),
      object: objectAu ? toScene(objectAu) : null,
      trail: elliptical ? toSceneAll(trailPath(el, jd)) : [],
      earthDistanceAu: objectAu ? distance(earthAu, objectAu) : null,
      sunDistanceAu: objectAu ? distance(objectAu, [0, 0, 0]) : null,
      /** Above (+) or below (−) the ecliptic, AU. */
      eclipticHeightAu: objectAu ? objectAu[2] : null,
    }
  }, [planets, elliptical, el, jd])

  return {
    elliptical,
    elements: el,
    planets,
    geometry,
    encounter,
    live,
    /** Radius (AU) the camera and reference rings should frame. */
    extentAu: Math.max(1.6, elliptical ? aphelion : 1.6),
  }
}

export type OrbitModel = ReturnType<typeof useOrbitModel>
