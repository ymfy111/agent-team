import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_STATE = Object.freeze({
  gateways: {},
  assignments: {},
  workspaces: {},
  executionSessions: {},
  orchestratorSessions: {},
  runtimeNodes: {},
  events: [],
})

export class StateStore {
  constructor(filePath = path.resolve(process.cwd(), '.runtime/gateway-state.json')) {
    this.filePath = filePath
    this.state = this.load()
  }

  load() {
    if (!fs.existsSync(this.filePath)) return structuredClone(DEFAULT_STATE)
    try {
      return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(fs.readFileSync(this.filePath, 'utf8')) }
    } catch {
      return structuredClone(DEFAULT_STATE)
    }
  }

  save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true })
    fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2))
  }

  now() {
    return new Date().toISOString()
  }

  event(type, payload = {}) {
    this.state.events.push({ type, at: this.now(), ...payload })
    if (this.state.events.length > 200) this.state.events = this.state.events.slice(-200)
    this.save()
  }

  upsert(collection, id, value) {
    const next = { ...(this.state[collection][id] || {}), ...value, id, updatedAt: this.now() }
    this.state[collection][id] = next
    this.save()
    return next
  }

  get(collection, id) {
    return this.state[collection][id] || null
  }

  list(collection) {
    return Object.values(this.state[collection])
  }
}
