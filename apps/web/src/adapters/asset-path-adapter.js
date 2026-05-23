/**
 * P0a.1 asset path adapter.
 *
 * Current migration baseline intentionally keeps `pic/` as a sibling of
 * `index.html`. Do not rewrite it to `assets/pic/` in P0a/P0a.1.
 *
 * Future resource-directory changes must go through this adapter and visual QA.
 */

const DATA_URL_RE = /^data:/i
const ABSOLUTE_URL_RE = /^(?:https?:)?\/\//i

export const ASSET_BASE = 'pic/'

export function normalizeAssetPath(path) {
  let value = String(path || '').trim()
  if (!value || DATA_URL_RE.test(value) || ABSOLUTE_URL_RE.test(value)) return value
  value = value
    .replace(/^\.\//, '')
    .replace(/^\.\.\//, '')
    .replace(/^\/docs\/prototypes\//, '')
    .replace(/^docs\/prototypes\//, '')
    .replace(/^prototypes\//, '')
  return value
}

export function resolveAssetPath(path) {
  const normalized = normalizeAssetPath(path)
  if (!normalized || DATA_URL_RE.test(normalized) || ABSOLUTE_URL_RE.test(normalized)) return normalized
  if (normalized.startsWith(ASSET_BASE)) return normalized
  return normalized.replace(/^assets\/pic\//, ASSET_BASE)
}
