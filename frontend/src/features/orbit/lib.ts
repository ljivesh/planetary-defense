import type { Theme } from '@/app/theme-context'
import type { OrbitalElements } from '@/features/objects/schemas'
import type { Elements, Vec3 } from '@/lib/orbital'

/** Scene units per AU. */
export const SCENE_SCALE = 10

/** Ecliptic (x, y, z-up) → three.js (x, y-up, z toward viewer). */
export function toScene([x, y, z]: Vec3): Vec3 {
  return [x * SCENE_SCALE, z * SCENE_SCALE, -y * SCENE_SCALE]
}

export function toElements(el: OrbitalElements): Elements {
  return {
    a: el.a,
    e: el.e,
    i: el.i,
    node: el.node,
    peri: el.peri,
    m: el.m,
    epoch: el.epoch,
    meanMotionDegPerDay: el.meanMotionDegPerDay,
  }
}

/** three.js can't read CSS variables, so scene colors are defined per theme. */
export const SCENE_COLORS: Record<Theme, { sun: string; earth: string; object: string; grid: string; label: string }> =
  {
    dark: { sun: '#ffd166', earth: '#3987e5', object: '#d95926', grid: '#1d2840', label: '#e8edf5' },
    light: { sun: '#f2a900', earth: '#2a78d6', object: '#eb6834', grid: '#d5dae3', label: '#0b1220' },
  }
