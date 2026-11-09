import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Vector3 } from 'three'

import type { Vec3 } from '@/lib/orbital'
import { cn } from '@/lib/utils'

export type LabelTone = 'signal' | 'earth' | 'ink' | 'muted'

export interface SceneLabel {
  id: string
  text: string
  position: Vec3
  /** Higher wins when labels collide. */
  priority: number
  tone: LabelTone
}

export type LabelRefs = RefObject<Map<string, HTMLSpanElement>>

const OFFSET_X = 9
const OFFSET_Y = 7
const PAD = 3

/**
 * Projects each label's 3D anchor to screen space every frame and moves the
 * matching DOM span. Labels are placed highest-priority first; any label whose
 * box would overlap one already placed is hidden.
 */
export function LabelProjector({ labels, refs }: { labels: SceneLabel[]; refs: LabelRefs }) {
  const v = useRef(new Vector3())
  const widths = useRef(new Map<string, number>())

  useFrame(({ camera, size }) => {
    const placed: [number, number, number, number][] = []
    const ordered = [...labels].sort((a, b) => b.priority - a.priority)
    for (const label of ordered) {
      const el = refs.current.get(label.id)
      if (!el) continue
      let w = widths.current.get(label.id + label.text)
      if (w === undefined) {
        w = el.offsetWidth
        widths.current.set(label.id + label.text, w)
      }
      const h = 14

      v.current.set(...label.position).project(camera)
      const x = ((v.current.x + 1) / 2) * size.width + OFFSET_X
      const y = ((1 - v.current.y) / 2) * size.height - OFFSET_Y - h
      const rect: [number, number, number, number] = [x - PAD, y - PAD, x + w + PAD, y + h + PAD]

      const offscreen = v.current.z > 1 || rect[2] < 0 || rect[0] > size.width || rect[3] < 0 || rect[1] > size.height
      const collides = placed.some((p) => rect[0] < p[2] && rect[2] > p[0] && rect[1] < p[3] && rect[3] > p[1])
      const visible = !offscreen && !collides

      el.style.transform = `translate(${x}px, ${y}px)`
      el.style.opacity = visible ? '1' : '0'
      if (visible) placed.push(rect)
    }
  })
  return null
}

const TONE_CLASS: Record<LabelTone, string> = {
  signal: 'text-signal',
  earth: 'text-chart-earth',
  ink: 'text-ink',
  muted: 'text-muted-ink',
}

/** DOM layer holding the label spans (rendered outside the canvas). */
export function LabelLayer({ labels, refs }: { labels: SceneLabel[]; refs: LabelRefs }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {labels.map((label) => (
        <span
          key={label.id}
          ref={(el) => {
            if (el) refs.current.set(label.id, el)
            else refs.current.delete(label.id)
          }}
          className={cn(
            'micro absolute top-0 left-0 whitespace-nowrap opacity-0 transition-opacity duration-150',
            TONE_CLASS[label.tone],
            // Symbols such as q / Q are case-sensitive.
            label.text.length <= 2 && 'normal-case',
          )}
        >
          {label.text}
        </span>
      ))}
    </div>
  )
}
