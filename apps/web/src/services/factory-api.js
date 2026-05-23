/**
 * P0b.2 Factory API facade.
 *
 * Page code and future adapters should import from this module instead of
 * touching mock data, currentState, or fetch directly. P0b.2 defaults to mock
 * mode; P1 can switch to HTTP mode without changing page call sites.
 */

import { createMockFactoryApi } from './mock-factory-api.js'
import { createHttpFactoryApi } from './http-factory-api.js'

let singleton = null

export function createFactoryApi(options = {}) {
  const mode = options.mode || 'mock'
  if (mode === 'mock') return createMockFactoryApi(options)
  if (mode === 'http') return createHttpFactoryApi(options)
  throw new Error(`Unsupported factory api mode: ${mode}`)
}

export function getFactoryApi() {
  if (!singleton) {
    singleton = createFactoryApi({ mode: 'mock' })
  }
  return singleton
}

export function setFactoryApiForTest(nextApi) {
  singleton = nextApi
}

export async function getFactoryApiHealth() {
  const api = getFactoryApi()
  const [teams, workers, projects, decisions, activities, workOrders] = await Promise.all([
    api.listTeams(),
    api.listWorkers(),
    api.listProjects(),
    api.listDecisions(),
    api.listActivities({ limit: 5 }),
    api.listWorkOrders(),
  ])
  return {
    kind: api.kind || 'unknown',
    teams: teams.length,
    workers: workers.length,
    projects: projects.length,
    decisions: decisions.length,
    activities: activities.length,
    workOrders: workOrders.length,
  }
}
