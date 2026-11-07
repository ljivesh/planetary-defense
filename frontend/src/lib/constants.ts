/** Base URL of the Go API. In dev, Vite proxies /api to the backend. */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

/** Astronomical unit in kilometers (IAU 2012). */
export const AU_KM = 149_597_870.7

/** Mean Earth–Moon distance in AU (one "lunar distance", LD). */
export const LD_AU = 0.00256955529

/** Earth's equatorial radius in kilometers. */
export const EARTH_RADIUS_KM = 6378.137

/** Julian Date of the Unix epoch (1970-01-01T00:00:00Z). */
export const JD_UNIX_EPOCH = 2_440_587.5

/** Objects at least this large (m) on a PHA-like orbit are of regional concern. */
export const PHA_DIAMETER_M = 140

export const QUERY_STALE = {
  short: 5 * 60 * 1000,
  long: 60 * 60 * 1000,
} as const
