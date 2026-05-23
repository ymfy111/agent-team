/**
 * P0b.1 ESM facade for mock data provider.
 *
 * New browser-native ESM code should import from this file instead of
 * reaching into window.__agentTeamDataProvider directly. The legacy runtime
 * still consumes the classic global bridge during P0b.1.
 */

export function getDataProvider() {
  return globalThis.__agentTeamDataProvider || null
}

export function createBaseState(context = {}) {
  const provider = getDataProvider()
  if (!provider || typeof provider.createBaseState !== 'function') {
    throw new Error('P0b.1 data provider is not loaded')
  }
  return provider.createBaseState(context)
}

export function cloneState(state) {
  const provider = getDataProvider()
  if (provider && typeof provider.cloneState === 'function') return provider.cloneState(state)
  return JSON.parse(JSON.stringify(state))
}

export function listEntityCounts(state) {
  const provider = getDataProvider()
  if (provider && typeof provider.listEntityCounts === 'function') return provider.listEntityCounts(state)
  return { teams: 0, workers: 0, decisions: 0, teamMembers: 0 }
}
