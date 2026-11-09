import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { Color } from 'three'

import { LandmarkMarker } from '@/features/orbit/components/scene/pixel-marker'
import type { OrbitModel } from '@/features/orbit/hooks/use-orbit-model'
import type { Vec3 } from '@/lib/orbital'

interface ObjectOrbitProps {
  geometry: NonNullable<OrbitModel['geometry']>
  trail: Vec3[]
  color: string
  markColor: string
  background: string
}

/**
 * The object's orbit, drawn so its inclination reads at a glance: solid above
 * the ecliptic, dashed and dimmed below, with drop lines to the plane. The
 * last 60 days of motion are a brighter trail fading into the background.
 */
export function ObjectOrbit({ geometry, trail, color, markColor, background }: ObjectOrbitProps) {
  const trailColors = useMemo(() => {
    const from = new Color(background)
    const to = new Color(markColor)
    return trail.map((_, k) => {
      const c = from.clone().lerp(to, (k / Math.max(trail.length - 1, 1)) ** 1.5)
      return [c.r, c.g, c.b] as [number, number, number]
    })
  }, [trail, background, markColor])

  return (
    <group>
      {geometry.above.map((pts, k) => (
        <Line key={`a${k}`} points={pts} color={color} lineWidth={1.75} />
      ))}
      {geometry.below.map((pts, k) => (
        <Line
          key={`b${k}`}
          points={pts}
          color={color}
          lineWidth={1.25}
          transparent
          opacity={0.5}
          dashed
          dashSize={0.18}
          gapSize={0.14}
        />
      ))}
      {geometry.drops.length > 0 && (
        <Line points={geometry.drops} segments color={color} lineWidth={1} transparent opacity={0.28} />
      )}
      {trail.length > 1 && <Line points={trail} vertexColors={trailColors} lineWidth={3} renderOrder={5} />}

      <LandmarkMarker position={geometry.ascending} color={color} />
      <LandmarkMarker position={geometry.descending} color={color} />
      <LandmarkMarker position={geometry.perihelion} color={color} />
      <LandmarkMarker position={geometry.aphelion} color={color} />
    </group>
  )
}
