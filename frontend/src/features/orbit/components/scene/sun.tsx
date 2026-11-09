import { useEffect, useMemo } from 'react'
import { AdditiveBlending, CanvasTexture, NormalBlending, SRGBColorSpace } from 'three'

import { PixelSized } from '@/features/orbit/components/scene/pixel-marker'

/** Radial falloff baked into a small canvas: the Sun's one allowed glow. */
function makeGlowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.15, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

export function Sun({ core, glow, dark }: { core: string; glow: string; dark: boolean }) {
  const texture = useMemo(() => makeGlowTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group>
      <sprite scale={[3.2, 3.2, 1]} renderOrder={1}>
        <spriteMaterial
          map={texture}
          color={glow}
          transparent
          opacity={dark ? 0.9 : 0.55}
          blending={dark ? AdditiveBlending : NormalBlending}
          depthWrite={false}
        />
      </sprite>
      <PixelSized position={[0, 0, 0]} px={5}>
        <mesh renderOrder={12}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color={core} depthTest={false} depthWrite={false} transparent />
        </mesh>
      </PixelSized>
    </group>
  )
}
