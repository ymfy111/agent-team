import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { StateStore } from './state-store.mjs'

const PORT = Number(process.env.PORT || 4090)
const store = new StateStore()

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body, null, 2))
}

async function readJson(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  if (!raw.trim()) return {}
  try { return JSON.parse(raw) } catch { return { _invalidJson: true, raw } }
}

function segments(url) {
  return new URL(url, `http://localhost:${PORT}`).pathname.split('/').filter(Boolean)
}

function createId(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`
}

async function route(req, res) {
  const parts = segments(req.url)
  const method = req.method || 'GET'

  if (method === 'GET' && parts.join('/') === 'health') {
    return send(res, 200, { status: 'ok', service: 'runtime-gateway-mock', at: store.now() })
  }

  if (parts[0] !== 'api' || parts[1] !== 'v1') return send(res, 404, { error: 'not_found' })
  const body = await readJson(req)
  const r = parts.slice(2)

  if (method === 'POST' && r.join('/') === 'runtime-gateways/register') {
    const gatewayId = body.gatewayId || createId('gw')
    const gateway = store.upsert('gateways', gatewayId, {
      gatewayId,
      hostId: body.hostId || gatewayId,
      hostName: body.hostName || 'local-runtime-host',
      baseUrl: body.baseUrl || `http://localhost:${PORT}`,
      status: 'online',
      registeredAt: store.now(),
      lastHeartbeatAt: store.now(),
    })
    store.event('gateway_registered', { gatewayId })
    return send(res, 200, { gateway })
  }

  if (method === 'GET' && r.length === 1 && r[0] === 'runtime-gateways') return send(res, 200, { gateways: store.list('gateways') })

  if (r[0] === 'runtime-gateways' && r[1]) {
    const gatewayId = r[1]
    if (method === 'POST' && r[2] === 'heartbeat') {
      const gateway = store.upsert('gateways', gatewayId, { status: 'online', lastHeartbeatAt: store.now(), heartbeat: body })
      store.event('gateway_heartbeat', { gatewayId })
      return send(res, 200, { gateway })
    }
    if ((method === 'PUT' || method === 'POST') && r[2] === 'capabilities') {
      const gateway = store.upsert('gateways', gatewayId, { capabilities: body.capabilities || body })
      store.event('gateway_capabilities_updated', { gatewayId })
      return send(res, 200, { gateway })
    }
    if (method === 'GET' && r[2] === 'capabilities') return send(res, 200, { gatewayId, capabilities: store.get('gateways', gatewayId)?.capabilities || {} })
    if (method === 'GET' && r[2] === 'diagnostics') return send(res, 200, { gatewayId, diagnostics: { status: 'ok', events: store.state.events.slice(-20) } })
  }

  if (method === 'POST' && r[0] === 'assignments' && r[1] && r[2] === 'activate') {
    const assignmentId = r[1]
    const assignment = store.upsert('assignments', assignmentId, { assignmentId, status: 'active', ...body })
    store.event('assignment_activated', { assignmentId })
    return send(res, 200, { assignment })
  }

  if (method === 'POST' && r.join('/') === 'project-workspaces/prepare') {
    const projectWorkspaceId = body.projectWorkspaceId || createId('pws')
    const workspace = store.upsert('workspaces', projectWorkspaceId, { projectWorkspaceId, status: 'prepared', ...body })
    store.event('project_workspace_prepared', { projectWorkspaceId })
    return send(res, 200, { workspace })
  }
  if (method === 'GET' && r[0] === 'project-workspaces' && r[1] && r[2] === 'status') return send(res, 200, { workspace: store.get('workspaces', r[1]) })

  if (method === 'POST' && r.join('/') === 'execution-sessions/start') {
    const sessionId = body.sessionId || createId('pes')
    const session = store.upsert('executionSessions', sessionId, { sessionId, status: 'running', ...body })
    store.event('execution_session_started', { sessionId })
    return send(res, 200, { session })
  }
  if (r[0] === 'execution-sessions' && r[1]) {
    const sessionId = r[1]
    if (method === 'GET') return send(res, 200, { session: store.get('executionSessions', sessionId) })
    if (method === 'POST' && ['pause', 'resume', 'stop'].includes(r[2])) {
      const status = r[2] === 'resume' ? 'running' : r[2] === 'stop' ? 'stopped' : 'paused'
      const session = store.upsert('executionSessions', sessionId, { status })
      store.event(`execution_session_${r[2]}`, { sessionId })
      return send(res, 200, { session })
    }
  }

  if (method === 'POST' && r.join('/') === 'orchestrator-sessions/start') {
    const sessionId = body.sessionId || createId('orch')
    const session = store.upsert('orchestratorSessions', sessionId, { sessionId, status: 'running', ...body })
    store.event('orchestrator_session_started', { sessionId })
    return send(res, 200, { session })
  }
  if (r[0] === 'orchestrator-sessions' && r[1]) {
    const sessionId = r[1]
    if (method === 'GET' && r[2] === 'status') return send(res, 200, { session: store.get('orchestratorSessions', sessionId) })
    if (method === 'GET' && r[2] === 'events') return send(res, 200, { events: store.state.events.filter((e) => e.sessionId === sessionId || e.type.startsWith('orchestrator')).slice(-50) })
    if (method === 'POST' && ['pause', 'resume', 'stop'].includes(r[2])) {
      const status = r[2] === 'resume' ? 'running' : r[2] === 'stop' ? 'stopped' : 'paused'
      const session = store.upsert('orchestratorSessions', sessionId, { status })
      store.event(`orchestrator_session_${r[2]}`, { sessionId })
      return send(res, 200, { session })
    }
  }

  if (method === 'POST' && r.join('/') === 'runtime-nodes/start') {
    const nodeId = body.nodeId || createId('oc')
    const node = store.upsert('runtimeNodes', nodeId, { nodeId, kind: 'OpenCodeRuntimeNode', status: 'running', ...body })
    store.event('runtime_node_started', { nodeId })
    return send(res, 200, { node })
  }
  if (r[0] === 'runtime-nodes' && r[1]) {
    const nodeId = r[1]
    if (method === 'GET' && r[2] === 'status') return send(res, 200, { node: store.get('runtimeNodes', nodeId) })
    if (method === 'GET' && r[2] === 'logs') return send(res, 200, { nodeId, logs: [`${store.now()} mock runtime node log`] })
    if (method === 'POST' && ['stop', 'restart'].includes(r[2])) {
      const status = r[2] === 'restart' ? 'running' : 'stopped'
      const node = store.upsert('runtimeNodes', nodeId, { status, restartedAt: r[2] === 'restart' ? store.now() : undefined })
      store.event(`runtime_node_${r[2]}`, { nodeId })
      return send(res, 200, { node })
    }
  }

  if (method === 'GET' && r[0] === 'diagnostics') return send(res, 200, { diagnostics: { status: 'ok', events: store.state.events.slice(-50) } })

  return send(res, 404, { error: 'not_found', method, path: `/${parts.join('/')}` })
}

export function createServer() {
  return http.createServer((req, res) => route(req, res).catch((error) => send(res, 500, { error: error.message || String(error) })))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(PORT, () => console.log(`runtime-gateway-mock listening on ${PORT}`))
}
