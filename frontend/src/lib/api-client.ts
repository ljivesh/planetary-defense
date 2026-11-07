import { z } from 'zod'

import { API_BASE_URL } from '@/lib/constants'

/** Error raised for any failed API call, carrying the server's error code. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }

  get isNotFound() {
    return this.status === 404
  }
}

const errorEnvelope = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
})

const dataEnvelope = z.object({ data: z.unknown() })

type QueryValue = string | number | boolean | null | undefined

/** Builds a query string, dropping empty values. */
export function toSearchParams(params: Record<string, QueryValue> = {}): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    sp.set(key, String(value))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

interface GetOptions {
  params?: Record<string, QueryValue>
  signal?: AbortSignal
}

/**
 * GETs `path` from the API, unwraps the `{ data }` envelope and validates it
 * against `schema`, so components only ever see well-typed data.
 */
export async function apiGet<S extends z.ZodType>(
  path: string,
  schema: S,
  { params, signal }: GetOptions = {},
): Promise<z.infer<S>> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}${toSearchParams(params)}`, {
      headers: { Accept: 'application/json' },
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'network_error', 'Could not reach the server. Is the API running?')
  }

  const body: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    const parsed = errorEnvelope.safeParse(body)
    throw parsed.success
      ? new ApiError(res.status, parsed.data.error.code, parsed.data.error.message)
      : new ApiError(res.status, 'http_error', res.statusText || 'Request failed')
  }

  const envelope = dataEnvelope.safeParse(body)
  const parsed = schema.safeParse(envelope.success ? envelope.data.data : undefined)
  if (!parsed.success) {
    console.error('API response validation failed', path, parsed.error.issues)
    throw new ApiError(res.status, 'invalid_response', 'Unexpected response from the server')
  }
  return parsed.data
}
