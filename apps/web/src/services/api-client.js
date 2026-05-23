/**
 * P0b.2 minimal HTTP client facade.
 *
 * The current front-end still runs without backend. This client is intentionally
 * small and browser-native so it can be used later by http-factory-api.js
 * without introducing Vite / pnpm / npm packages.
 */

export function createApiClient(options = {}) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || '/api')
  const fetchImpl = options.fetchImpl || globalThis.fetch

  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch is not available for http factory api')
  }

  async function request(path, init = {}) {
    const url = joinUrl(baseUrl, path)
    const headers = new Headers(init.headers || {})
    if (init.body != null && !headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }

    const response = await fetchImpl(url, {
      ...init,
      headers,
      body: init.body != null && typeof init.body !== 'string' ? JSON.stringify(init.body) : init.body,
    })

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? await response.json() : await response.text()

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText || 'Request failed'}`)
      error.status = response.status
      error.payload = payload
      throw error
    }

    return normalizePayload(payload)
  }

  return Object.freeze({
    baseUrl,
    get: (path) => request(path, { method: 'GET' }),
    post: (path, body) => request(path, { method: 'POST', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    delete: (path) => request(path, { method: 'DELETE' }),
  })
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '/api').replace(/\/+$/, '') || '/api'
}

function joinUrl(baseUrl, path) {
  const cleanPath = String(path || '').replace(/^\/+/, '')
  return `${baseUrl}/${cleanPath}`
}

function normalizePayload(payload) {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data
  }
  return payload
}
