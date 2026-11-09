import { CameraControls, CameraControlsImpl, Line, Stars } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'

import type { Theme } from '@/app/theme-context'
import { EclipticReference } from '@/features/orbit/components/scene/ecliptic-reference'
import { LabelLayer, LabelProjector, type SceneLabel } from '@/features/orbit/components/scene/labels'
import { ObjectOrbit } from '@/features/orbit/components/scene/object-orbit'
import { Marker, TargetMarker } from '@/features/orbit/components/scene/pixel-marker'
import { Sun } from '@/features/orbit/components/scene/sun'
import type { OrbitModel } from '@/features/orbit/hooks/use-orbit-model'
import { ringRadii, SCENE_COLORS, SCENE_SCALE } from '@/features/orbit/lib'
import type { Vec3 } from '@/lib/orbital'

export type ViewMode = 'free' | 'top' | 'side'

export interface ViewRequest {
  mode: ViewMode
  /** Bumped on every request so re-selecting the same view re-applies it. */
  id: number
}

interface OrbitSceneProps {
  theme: Theme
  model: OrbitModel
  objectLabel: string
  encounterLabel: string | null
  view: ViewRequest
  onUserControl: () => void
}

const FOV = 40

/**
 * Camera position for a named view, fitted to the viewport's aspect ratio.
 * SIDE looks along the ecliptic, perpendicular to the line of nodes.
 */
function cameraPosition(mode: ViewMode, extentAu: number, nodeDeg: number, aspect: number): Vec3 {
  // Distance at which a radius of `extentAu` fills the vertical field of view.
  const fit = (extentAu * SCENE_SCALE) / Math.tan(((FOV / 2) * Math.PI) / 180)
  // Tilted and edge-on views foreshorten the plane vertically, so they can sit closer,
  // unless a narrow viewport makes the width the limit.
  const vertical = mode === 'top' ? 1.05 : mode === 'side' ? 0.3 : 0.78
  const d = fit * Math.max(vertical, 1.05 / aspect)
  switch (mode) {
    case 'top':
      return [0, d, 0.01]
    case 'side': {
      const n = (nodeDeg * Math.PI) / 180
      // Ecliptic direction (−sin Ω, cos Ω, 0) in scene axes, lifted 2° so the plane isn't a hairline.
      return [-Math.sin(n) * d, d * 0.035, -Math.cos(n) * d]
    }
    default:
      return [d * 0.18, d * 0.5, d * 0.84]
  }
}

/** Applies view requests to the camera controls (instantly the first time, animated after). */
function ViewRig({
  controls,
  view,
  extentAu,
  nodeDeg,
}: {
  controls: RefObject<CameraControls | null>
  view: ViewRequest
  extentAu: number
  nodeDeg: number
}) {
  // Read the viewport size at request time; resizing alone shouldn't move the camera.
  const get = useThree((st) => st.get)
  const first = useRef(true)

  useEffect(() => {
    const { width, height } = get().size
    const [x, y, z] = cameraPosition(view.mode, extentAu, nodeDeg, width / Math.max(height, 1))
    void controls.current?.setLookAt(x, y, z, 0, 0, 0, !first.current)
    first.current = false
  }, [controls, get, view, extentAu, nodeDeg])
  return null
}

/** Heliocentric orbit diagram: planets, the object's orbit and landmarks, with live positions. */
export default function OrbitScene({
  theme,
  model,
  objectLabel,
  encounterLabel,
  view,
  onUserControl,
}: OrbitSceneProps) {
  const c = SCENE_COLORS[theme]
  const controls = useRef<CameraControls>(null)
  const labelRefs = useRef(new Map<string, HTMLSpanElement>())
  const { extentAu, geometry, live, encounter } = model
  const nodeDeg = model.elements.node
  const initial = useMemo(() => cameraPosition('free', extentAu, nodeDeg, 2), [extentAu, nodeDeg])

  // Wheel zoom only after the user clicks into the scene, so scrolling the page past it never hijacks the wheel.
  const [wheelZoom, setWheelZoom] = useState(false)

  const labels = useMemo<SceneLabel[]>(() => {
    const out: SceneLabel[] = [{ id: 'sun', text: 'Sun', position: [0, 0, 0], priority: 60, tone: 'muted' }]
    for (const p of model.planets) {
      const pos = live.planets.find((lp) => lp.id === p.id)?.position
      if (!pos) continue
      out.push(
        p.id === 'earth'
          ? { id: p.id, text: 'Earth', position: pos, priority: 90, tone: 'earth' }
          : { id: p.id, text: p.name, position: pos, priority: 50, tone: 'muted' },
      )
    }
    if (live.object) out.push({ id: 'object', text: objectLabel, position: live.object, priority: 100, tone: 'signal' })
    if (encounter && encounterLabel) {
      out.push({ id: 'encounter', text: encounterLabel, position: encounter.object, priority: 80, tone: 'ink' })
    }
    if (geometry) {
      out.push(
        { id: 'q', text: 'q', position: geometry.perihelion, priority: 22, tone: 'muted' },
        { id: 'Q', text: 'Q', position: geometry.aphelion, priority: 22, tone: 'muted' },
        { id: 'asc', text: '☊', position: geometry.ascending, priority: 21, tone: 'muted' },
        { id: 'desc', text: '☋', position: geometry.descending, priority: 21, tone: 'muted' },
      )
    }
    const radii = ringRadii(extentAu)
    const theta = (200 * Math.PI) / 180
    for (const r of radii) {
      const R = r * SCENE_SCALE
      out.push({
        id: `ring${r}`,
        text: `${r} AU`,
        position: [Math.cos(theta) * R, 0, Math.sin(theta) * R],
        priority: 10,
        tone: 'muted',
      })
    }
    out.push({
      id: 'equinox',
      text: '♈︎ 0°',
      position: [radii[radii.length - 1] * SCENE_SCALE + 0.6, 0, 0],
      priority: 12,
      tone: 'muted',
    })
    return out
  }, [model.planets, live, objectLabel, encounter, encounterLabel, geometry, extentAu])

  return (
    <div
      className="relative size-full"
      onPointerDown={() => setWheelZoom(true)}
      onPointerLeave={() => setWheelZoom(false)}
    >
      <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: initial, fov: FOV, near: 0.05, far: 4000 }}>
        <color attach="background" args={[c.surface]} />
        {theme === 'dark' && <Stars radius={600} depth={200} count={1400} factor={3} saturation={0} fade speed={0} />}

        <EclipticReference extentAu={extentAu} color={c.ring} />
        <Sun core={c.sun} glow={c.glow} dark={theme === 'dark'} />

        {model.planets.map((p) => (
          <Line
            key={p.id}
            points={p.path}
            color={p.id === 'earth' ? c.earth : c.planet}
            lineWidth={p.id === 'earth' ? 1.5 : 1}
            transparent
            opacity={p.id === 'earth' ? 0.85 : 1}
          />
        ))}
        {live.planets.map((p) => (
          <Marker
            key={p.id}
            position={p.position}
            color={p.id === 'earth' ? c.earth : c.planet}
            px={p.id === 'earth' ? 5 : 3.5}
          />
        ))}

        {geometry && (
          <ObjectOrbit
            geometry={geometry}
            trail={live.trail}
            color={c.object}
            markColor={c.objectMark}
            background={c.surface}
          />
        )}

        {encounter && (
          <group>
            <Line
              points={[encounter.earth, encounter.object]}
              color={c.objectMark}
              lineWidth={1}
              dashed
              dashSize={0.1}
              gapSize={0.1}
            />
            <Marker position={encounter.earth} color={c.earth} px={7} hollow opacity={0.8} />
            <Marker position={encounter.object} color={c.objectMark} px={11} hollow opacity={0.6} />
          </group>
        )}

        {live.object && <TargetMarker position={live.object} color={c.objectMark} />}

        <LabelProjector labels={labels} refs={labelRefs} />
        <ViewRig controls={controls} view={view} extentAu={extentAu} nodeDeg={nodeDeg} />
        <CameraControls
          ref={controls}
          makeDefault
          minDistance={2}
          maxDistance={extentAu * SCENE_SCALE * 8}
          dollyToCursor
          mouseButtons-wheel={wheelZoom ? CameraControlsImpl.ACTION.DOLLY : CameraControlsImpl.ACTION.NONE}
          onControlStart={onUserControl}
        />
      </Canvas>
      <LabelLayer labels={labels} refs={labelRefs} />
    </div>
  )
}
