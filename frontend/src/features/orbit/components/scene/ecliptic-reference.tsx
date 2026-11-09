import { Line } from '@react-three/drei'
import { useMemo } from 'react'

import { ringRadii, SCENE_SCALE } from '@/features/orbit/lib'
import type { Vec3 } from '@/lib/orbital'

function circle(radius: number, segments = 160): Vec3[] {
  return Array.from({ length: segments + 1 }, (_, k) => {
    const t = (k / segments) * 2 * Math.PI
    return [Math.cos(t) * radius, 0, Math.sin(t) * radius] as Vec3
  })
}

/**
 * The ecliptic plane as an instrument reference: faint concentric AU rings and
 * a tick toward the vernal equinox (♈︎, ecliptic longitude 0°).
 */
export function EclipticReference({ extentAu, color }: { extentAu: number; color: string }) {
  const rings = useMemo(() => ringRadii(extentAu).map((r) => ({ r, pts: circle(r * SCENE_SCALE) })), [extentAu])
  const outer = rings[rings.length - 1].r * SCENE_SCALE

  return (
    <group>
      {rings.map(({ r, pts }) => (
        <Line key={r} points={pts} color={color} lineWidth={1} />
      ))}
      {/* Vernal-equinox direction: ecliptic +x */}
      <Line
        points={[
          [0, 0, 0],
          [outer + 0.6, 0, 0],
        ]}
        color={color}
        lineWidth={1}
        dashed
        dashSize={0.25}
        gapSize={0.25}
      />
    </group>
  )
}
