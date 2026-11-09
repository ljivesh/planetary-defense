import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import { PerspectiveCamera, type Group } from 'three'

import type { Vec3 } from '@/lib/orbital'

interface PixelSizedProps {
  position: Vec3
  /** Radius in CSS pixels; children should be built at unit radius. */
  px: number
  renderOrder?: number
  children: ReactNode
}

/**
 * Keeps its children a constant on-screen size and facing the camera, so body
 * markers stay legible at any zoom (planets aren't drawn to scale anyway).
 */
export function PixelSized({ position, px, children }: PixelSizedProps) {
  const ref = useRef<Group>(null)
  useFrame(({ camera, size }) => {
    const g = ref.current
    if (!g) return
    const d = camera.position.distanceTo(g.position)
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45
    const worldPerPx = (2 * d * Math.tan((fov * Math.PI) / 360)) / size.height
    g.scale.setScalar(worldPerPx * px)
    g.quaternion.copy(camera.quaternion)
  })
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}

interface MarkerProps {
  position: Vec3
  color: string
  px?: number
  /** Ring instead of a filled disc (ghost / reference markers). */
  hollow?: boolean
  opacity?: number
}

/** Flat disc or ring marker drawn on top of the orbit lines. */
export function Marker({ position, color, px = 4, hollow = false, opacity = 1 }: MarkerProps) {
  return (
    <PixelSized position={position} px={px}>
      <mesh renderOrder={10}>
        {hollow ? <ringGeometry args={[0.72, 1, 40]} /> : <circleGeometry args={[1, 32]} />}
        <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} depthWrite={false} />
      </mesh>
    </PixelSized>
  )
}

/** The tracked object: a bright dot inside a thin ring. */
export function TargetMarker({ position, color }: { position: Vec3; color: string }) {
  return (
    <PixelSized position={position} px={9}>
      <mesh renderOrder={11}>
        <ringGeometry args={[0.82, 1, 48]} />
        <meshBasicMaterial color={color} transparent depthTest={false} depthWrite={false} />
      </mesh>
      <mesh renderOrder={11}>
        <circleGeometry args={[0.38, 32]} />
        <meshBasicMaterial color={color} transparent depthTest={false} depthWrite={false} />
      </mesh>
    </PixelSized>
  )
}

/** Small tick glyph for orbit landmarks (nodes, apsides): a hollow diamond. */
export function LandmarkMarker({ position, color }: { position: Vec3; color: string }) {
  return (
    <PixelSized position={position} px={4}>
      <mesh renderOrder={9} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.6, 1, 4]} />
        <meshBasicMaterial color={color} transparent depthTest={false} depthWrite={false} />
      </mesh>
    </PixelSized>
  )
}
