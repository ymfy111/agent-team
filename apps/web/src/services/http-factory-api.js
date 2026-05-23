/**
 * P0b.2 placeholder HTTP implementation of the future backend Factory API.
 *
 * This file is intentionally not used in P0b.2 QA. It locks the public method
 * names so switching from mock to real backend later only changes factory-api
 * configuration, not page code.
 */

import { createApiClient } from './api-client.js'

export function createHttpFactoryApi(options = {}) {
  const client = options.client || createApiClient({ baseUrl: options.baseUrl || '/api' })

  return Object.freeze({
    kind: 'http',
    listTeams: () => client.get('/teams'),
    getTeam: (teamId) => client.get(`/teams/${encodeURIComponent(teamId)}`),
    listWorkers: () => client.get('/workers'),
    getWorker: (workerId) => client.get(`/workers/${encodeURIComponent(workerId)}`),
    listProjects: () => client.get('/projects'),
    getProject: (projectId) => client.get(`/projects/${encodeURIComponent(projectId)}`),
    listDecisions: (query = {}) => client.get(withQuery('/decisions', query)),
    getDecision: (decisionId) => client.get(`/decisions/${encodeURIComponent(decisionId)}`),
    resolveDecision: (decisionId, payload) => client.post(`/decisions/${encodeURIComponent(decisionId)}/resolve`, payload),
    listActivities: (query = {}) => client.get(withQuery('/activities', query)),
    listWorkOrders: (query = {}) => client.get(withQuery('/work-orders', query)),
  })
}

function withQuery(path, query) {
  const params = new URLSearchParams()
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}
