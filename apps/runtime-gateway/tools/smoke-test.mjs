import { createServer } from '../src/server.mjs'

const server = createServer()
await new Promise((resolve) => server.listen(0, resolve))
const { port } = server.address()
const base = `http://127.0.0.1:${port}`

async function call(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} failed: ${JSON.stringify(json)}`)
  return json
}

await call('/health')
await call('/api/v1/runtime-gateways/register', { method: 'POST', body: JSON.stringify({ gatewayId: 'gw-local-01', hostId: 'host-local-01' }) })
await call('/api/v1/runtime-gateways/gw-local-01/heartbeat', { method: 'POST', body: JSON.stringify({ load: 0.12 }) })
await call('/api/v1/runtime-gateways/gw-local-01/capabilities', { method: 'PUT', body: JSON.stringify({ capabilities: { supportsOpenCode: true, maxRuntimeNodes: 4 } }) })
await call('/api/v1/assignments/assign-01/activate', { method: 'POST', body: JSON.stringify({ teamId: 'team-01', projectId: 'project-01' }) })
await call('/api/v1/project-workspaces/prepare', { method: 'POST', body: JSON.stringify({ projectWorkspaceId: 'pws-01', projectId: 'project-01' }) })
await call('/api/v1/execution-sessions/start', { method: 'POST', body: JSON.stringify({ sessionId: 'pes-01', projectWorkspaceId: 'pws-01' }) })
await call('/api/v1/orchestrator-sessions/start', { method: 'POST', body: JSON.stringify({ sessionId: 'orch-01', executionSessionId: 'pes-01' }) })
await call('/api/v1/runtime-nodes/start', { method: 'POST', body: JSON.stringify({ nodeId: 'oc-01', executionSessionId: 'pes-01' }) })
await call('/api/v1/diagnostics')
server.close()
console.log('runtime-gateway smoke PASS')
