/**
 * P0a.1 storage adapter.
 *
 * The structured no-build app must run in three environments:
 * - normal browser / Nginx static hosting, where localStorage is available;
 * - sandbox Playwright set_content / virtual origin, where localStorage may throw;
 * - privacy-restricted browsers, where storage APIs may be disabled.
 *
 * Do not access localStorage directly in new code. Use this adapter or the
 * legacy global bridge installed by global-adapters.js.
 */

function createMemoryStorage() {
  const store = new Map()
  return {
    getItem(key) {
      key = String(key)
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(String(key), String(value))
    },
    removeItem(key) {
      store.delete(String(key))
    },
    clear() {
      store.clear()
    },
    key(index) {
      return Array.from(store.keys())[Number(index)] || null
    },
    get length() {
      return store.size
    },
    __kind: 'memory',
  }
}

function storageAvailable(storage) {
  try {
    if (!storage) return false
    const key = '__agent_team_storage_probe__'
    storage.setItem(key, '1')
    storage.removeItem(key)
    return true
  } catch (error) {
    return false
  }
}

export function createStorageAdapter(preferredStorage) {
  if (storageAvailable(preferredStorage)) return preferredStorage
  return createMemoryStorage()
}

function getBrowserStorage(name) {
  try {
    return globalThis[name]
  } catch (error) {
    return null
  }
}

export const storageAdapter = createStorageAdapter(getBrowserStorage('localStorage'))
export const sessionStorageAdapter = createStorageAdapter(getBrowserStorage('sessionStorage'))
