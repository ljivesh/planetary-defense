import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns'

import { AU_KM, LD_AU } from '@/lib/constants'

const EM_DASH = '—'

// ---------- unit conversions ----------

export const auToLd = (au: number) => au / LD_AU
export const auToKm = (au: number) => au * AU_KM

// ---------- numbers ----------

export function formatNumber(n: number | null | undefined, maximumFractionDigits = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return EM_DASH
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(n)
}

/** 1,284 → "1.3K", 12_900_000 → "12.9M". */
export function formatCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return EM_DASH
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

// ---------- domain values ----------

/** Lunar distances, the most intuitive unit for close approaches. */
export function formatLd(au: number): string {
  const ld = auToLd(au)
  return `${formatNumber(ld, ld < 10 ? 2 : 1)} LD`
}

export function formatKm(au: number): string {
  return `${formatCompact(auToKm(au))} km`
}

export function formatAu(au: number | null | undefined, digits = 4): string {
  if (au === null || au === undefined) return EM_DASH
  return `${au.toFixed(digits)} AU`
}

export function formatVelocity(kms: number | null | undefined): string {
  if (kms === null || kms === undefined) return EM_DASH
  return `${formatNumber(kms, 1)} km/s`
}

interface DiameterInput {
  diameterM: number | null
  estimatedDiameterM: { minM: number; maxM: number } | null
}

function formatMeters(m: number): string {
  return m >= 1000 ? `${formatNumber(m / 1000, 2)} km` : `${formatNumber(m, m < 10 ? 1 : 0)} m`
}

/** Measured diameter when known, otherwise the H-based estimate range. */
export function formatDiameter({ diameterM, estimatedDiameterM }: DiameterInput): string {
  if (diameterM !== null) return formatMeters(diameterM)
  if (estimatedDiameterM) {
    return `${formatMeters(estimatedDiameterM.minM)} – ${formatMeters(estimatedDiameterM.maxM)}`
  }
  return EM_DASH
}

/** Single representative size (m) for sorting and chart sizing. */
export function representativeDiameterM({ diameterM, estimatedDiameterM }: DiameterInput): number | null {
  if (diameterM !== null) return diameterM
  if (estimatedDiameterM) return Math.sqrt(estimatedDiameterM.minM * estimatedDiameterM.maxM)
  return null
}

/** Impact probability as "1 in 2,941" (more readable than 3.4e-4). */
export function formatOdds(p: number | null | undefined): string {
  if (!p || p <= 0) return EM_DASH
  const odds = 1 / p
  return `1 in ${odds >= 1e6 ? formatCompact(odds) : formatNumber(Math.round(odds), 0)}`
}

export function formatProbability(p: number | null | undefined): string {
  if (p === null || p === undefined) return EM_DASH
  if (p === 0) return '0%'
  if (p < 1e-4) return p.toExponential(1)
  return `${formatNumber(p * 100, 3)}%`
}

/** Energy in kilotons of TNT, switching to megatons when large. */
export function formatEnergyKt(kt: number | null | undefined): string {
  if (kt === null || kt === undefined) return EM_DASH
  return kt >= 1000 ? `${formatNumber(kt / 1000, 1)} Mt` : `${formatNumber(kt, kt < 1 ? 3 : 1)} kt`
}

export function formatSigned(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined) return EM_DASH
  return `${n > 0 ? '+' : ''}${n.toFixed(digits)}`
}

// ---------- dates ----------

function toDate(value: string | Date): Date | null {
  const d = typeof value === 'string' ? parseISO(value) : value
  return isValid(d) ? d : null
}

export function formatDate(value: string | Date): string {
  const d = toDate(value)
  return d ? format(d, 'MMM d, yyyy') : EM_DASH
}

export function formatDateTime(value: string | Date): string {
  const d = toDate(value)
  return d ? `${format(d, 'MMM d, yyyy HH:mm')} UTC` : EM_DASH
}

/** "in 3 days" / "2 months ago". */
export function formatRelative(value: string | Date): string {
  const d = toDate(value)
  return d ? formatDistanceToNowStrict(d, { addSuffix: true }) : EM_DASH
}

/** YYYY-MM-DD for API query params, in UTC. */
export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
