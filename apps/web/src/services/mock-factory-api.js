/**
 * P0b.2 mock implementation of the future backend Factory API.
 *
 * It simulates asynchronous backend calls but reads from the current Data
 * Provider. UI and legacy runtime should eventually call factory-api.js instead
 * of touching mock-state/currentState directly.
 */

import { createBaseState, cloneState } from '../adapters/data-provider.js'

const ACTIVE_WORK_ORDER_STATUS = new Set(['assigned', 'running', 'blocked', 'submitted', 'reviewing', 'rework_required'])

export function createMockFactoryApi(options = {}) {
  let state = cloneState(options.initialState || createBaseState({ tsNow: options.tsNow || Date.now() }))

  async function listTeams() {
    return clone(state.teams || [])
  }

  async function getTeam(teamId) {
    return clone((state.teams || []).find((team) => team.id === teamId) || null)
  }

  async function listWorkers(options = {}) {
    const includeTeamMembers = options.includeTeamMembers !== false
    const workers = []
    if (includeTeamMembers) {
      for (const team of state.teams || []) {
        if (team.masterId) {
          workers.push({
            id: team.masterId,
            name: team.masterCodename || team.masterName || team.masterId,
            role: '@explorer',
            projectRole: '协同规划岗',
            status: team.masterStatus === 'offline' ? 'offline' : 'busy',
            teamId: team.id,
            teamName: team.name,
            teamRole: 'leader',
            currentTaskSummary: team.task || '',
          })
        }
        for (const member of team.members || []) {
          workers.push({ ...member, teamId: team.id, teamName: team.name, teamRole: 'member' })
        }
      }
    }
    for (const worker of state.workers || []) {
      workers.push({ ...worker, teamRole: 'pool' })
    }
    return clone(workers)
  }

  async function getWorker(workerId) {
    const workers = await listWorkers()
    return clone(workers.find((worker) => worker.id === workerId) || null)
  }

  async function listProjects() {
    const projects = (state.teams || [])
      .filter((team) => team.currentProject)
      .map((team) => ({
        ...team.currentProject,
        teamId: team.id,
        teamName: team.name,
        leaderWorkerId: team.masterId,
        leaderName: team.masterCodename || team.masterId,
      }))
    return clone(projects)
  }

  async function getProject(projectId) {
    const projects = await listProjects()
    return clone(projects.find((project) => project.id === projectId) || null)
  }

  async function listDecisions(options = {}) {
    let decisions = state.decisions || []
    if (options.status) decisions = decisions.filter((decision) => decision.status === options.status)
    if (options.teamId) decisions = decisions.filter((decision) => decision.teamId === options.teamId)
    return clone(decisions)
  }

  async function getDecision(decisionId) {
    return clone((state.decisions || []).find((decision) => decision.id === decisionId) || null)
  }

  async function resolveDecision(decisionId, payload = {}) {
    const decision = (state.decisions || []).find((item) => item.id === decisionId)
    if (!decision) throw notFound('decision', decisionId)
    decision.status = 'resolved'
    decision.resolvedAt = Date.now()
    decision.resolution = clone(payload)
    return clone(decision)
  }

  async function listActivities(options = {}) {
    const activities = []
    for (const team of state.teams || []) {
      for (const activity of team.activities || []) {
        activities.push({ ...activity, teamId: team.id, teamName: team.name })
      }
    }
    const sorted = activities.sort((a, b) => Number(b.time || 0) - Number(a.time || 0))
    const limit = Number(options.limit || 0)
    return clone(limit > 0 ? sorted.slice(0, limit) : sorted)
  }

  async function listWorkOrders(options = {}) {
    const rows = []
    for (const team of state.teams || []) {
      const project = team.currentProject || null
      for (const workOrder of project?.workOrders || []) {
        if (options.activeOnly && !ACTIVE_WORK_ORDER_STATUS.has(workOrder.status)) continue
        rows.push({
          ...workOrder,
          teamId: team.id,
          teamName: team.name,
          projectId: project.id,
          projectName: project.name,
        })
      }
    }
    return clone(rows)
  }

  async function getStateSnapshot() {
    return clone(state)
  }

  async function reset(nextState) {
    state = cloneState(nextState || createBaseState({ tsNow: Date.now() }))
    return getStateSnapshot()
  }

  return Object.freeze({
    kind: 'mock',
    listTeams,
    getTeam,
    listWorkers,
    getWorker,
    listProjects,
    getProject,
    listDecisions,
    getDecision,
    resolveDecision,
    listActivities,
    listWorkOrders,
    getStateSnapshot,
    reset,
  })
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value))
}

function notFound(entity, id) {
  const error = new Error(`${entity} not found: ${id}`)
  error.code = 'NOT_FOUND'
  error.entity = entity
  error.id = id
  return error
}
