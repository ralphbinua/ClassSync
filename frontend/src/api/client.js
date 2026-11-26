const BASE = import.meta.env.VITE_API_URL

// Turn any error response into a readable message
function messageFrom(body, status) {
  const d = body?.detail
  if (typeof d === 'string') return d
  if (d?.message) return d.message
  if (Array.isArray(d)) return d.map((e) => e.msg).join(', ') // validation errors
  return `Request failed (${status})`
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(messageFrom(body, res.status))
    err.status = res.status
    err.conflicts = body?.detail?.conflicts ?? []
    throw err
  }
  return body
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}