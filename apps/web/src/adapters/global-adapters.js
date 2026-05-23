/*
 * P0a.1 legacy global adapters.
 *
 * This file is intentionally a classic script, loaded before the legacy
 * prototype runtime. It bridges the old global runtime to the new structured
 * app boundary without changing UI behavior.
 */
(function () {
  if (window.__agentTeamAdapters) return

  function createMemoryStorage() {
    var store = Object.create(null)
    return {
      getItem: function (key) {
        key = String(key)
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
      },
      setItem: function (key, value) {
        store[String(key)] = String(value)
      },
      removeItem: function (key) {
        delete store[String(key)]
      },
      clear: function () {
        store = Object.create(null)
      },
      key: function (index) {
        return Object.keys(store)[Number(index)] || null
      },
      get length() {
        return Object.keys(store).length
      },
      __kind: 'memory'
    }
  }

  function storageAvailable(storage) {
    try {
      if (!storage) return false
      var key = '__agent_team_storage_probe__'
      storage.setItem(key, '1')
      storage.removeItem(key)
      return true
    } catch (error) {
      return false
    }
  }

  function createStorageAdapter(storage) {
    return storageAvailable(storage) ? storage : createMemoryStorage()
  }

  function normalizeAssetPath(path) {
    var value = String(path || '').trim()
    if (!value || /^data:/i.test(value) || /^(?:https?:)?\/\//i.test(value)) return value
    return value
      .replace(/^\.\//, '')
      .replace(/^\.\.\//, '')
      .replace(/^\/docs\/prototypes\//, '')
      .replace(/^docs\/prototypes\//, '')
      .replace(/^prototypes\//, '')
      .replace(/^assets\/pic\//, 'pic/')
  }

  function resolveAssetPath(path) {
    return normalizeAssetPath(path)
  }

  function getBrowserStorage(name) {
    try { return window[name] }
    catch (error) { return null }
  }

  window.__agentTeamAdapters = Object.freeze({
    version: 'p0a.1',
    storage: createStorageAdapter(getBrowserStorage('localStorage')),
    sessionStorage: createStorageAdapter(getBrowserStorage('sessionStorage')),
    resolveAssetPath: resolveAssetPath,
    normalizeAssetPath: normalizeAssetPath,
    assetBase: 'pic/'
  })
})()
