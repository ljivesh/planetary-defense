import { Line, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Vector3 } from 'three'

import type { Theme } from '@/app/theme-context'
import { SCENE_COLORS, SCENE_SCALE } from '@/features/orbit/lib'
import type { Vec3 } from '@/lib/orbital'

interface OrbitSceneProps {
  theme: Theme
  objectLabel: string
  paths: { earth: Vec3[]; object: Vec3[] }
  earth: Vec3
  object: Vec3 | null
  extent: number
}

interface SceneLabel {
  text: string
  position: Vec3
}

/**
 * Projects 3D anchor points to screen space every frame and moves the matching
 * DOM labels. Cheaper and more predictable than one portal per label.
 */
function LabelProjector({ labels, refs }: { labels: SceneLabel[]; refs: RefObject<(HTMLSpanElement | null)[]> }) {
  const v = useRef(new Vector3())
  useFrame(({ camera, size }) => {
    labels.forEach((label, i) => {
      const el = refs.current[i]
      if (!el) return
      v.current.set(...label.position).project(camera)
      const behind = v.current.z > 1
      const x = ((v.current.x + 1) / 2) * size.width
      const y = ((1 - v.current.y) / 2) * size.height
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -160%)`
      el.style.opacity = behind ? '0' : '1'
    })
  })
  return null
}

/** Heliocentric view: Sun, Earth's orbit and the object's orbit, with live positions. */
export default function OrbitScene({ theme, objectLabel, paths, earth, object, extent }: OrbitSceneProps) {
  const c = SCENE_COLORS[theme]
  const camDist = extent * SCENE_SCALE * 1.6
  const gridSize = Math.ceil(extent * 2.4) * SCENE_SCALE
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])

  const labels: SceneLabel[] = [{ text: 'Earth', position: earth }]
  if (object) labels.push({ text: objectLabel, position: object })

  return (
    <div className="relative size-full">
      <Canvas camera={{ position: [0, camDist * 0.7, camDist], fov: 45 }} dpr={[1, 2]}>
        {theme === 'dark' && <Stars radius={200} depth={60} count={2500} factor={4} fade speed={0.3} />}
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 0, 0]} intensity={2.5} decay={0} />

        <gridHelper args={[gridSize, gridSize / SCENE_SCALE, c.grid, c.grid]} />

        {/* Sun */}
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial color={c.sun} />
        </mesh>

        {/* Earth */}
        <Line points={paths.earth} color={c.earth} lineWidth={1.5} transparent opacity={0.7} />
        <mesh position={earth}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={c.earth} emissive={c.earth} emissiveIntensity={0.3} />
        </mesh>

        {/* Object */}
        {paths.object.length > 0 && <Line points={paths.object} color={c.object} lineWidth={2} />}
        {object && (
          <mesh position={object}>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial color={c.object} emissive={c.object} emissiveIntensity={0.5} />
          </mesh>
        )}

        <LabelProjector labels={labels} refs={labelRefs} />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={camDist * 3} makeDefault />
      </Canvas>

      {labels.map((label, i) => (
        <span
          key={label.text}
          ref={(el) => {
            labelRefs.current[i] = el
          }}
          className="pointer-events-none absolute top-0 left-0 text-xs font-medium whitespace-nowrap"
          style={{ color: c.label }}
        >
          {label.text}
        </span>
      ))}
    </div>
  )
}
