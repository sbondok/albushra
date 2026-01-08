import { describe, it, expect } from 'vitest'

const base = process.env.STAGING_URL

if (!base) {
  throw new Error('STAGING_URL must be set to run e2e tests (CI sets this)')
}

describe('staging e2e tests', () => {
  it('health endpoint returns 200', async () => {
    const res = await fetch(`${base}/api/health`)
    expect(res.ok).toBe(true)
  })

  it('/api/payments should return 401 when unauthenticated', async () => {
    const res = await fetch(`${base}/api/payments`)
    expect(res.status).toBe(401)
  })

  it('/api/upload POST should return 401 when unauthenticated', async () => {
    const res = await fetch(`${base}/api/upload`, { method: 'POST', body: JSON.stringify({ rows: [] }), headers: { 'Content-Type': 'application/json' } })
    expect(res.status).toBe(401)
  })
})
