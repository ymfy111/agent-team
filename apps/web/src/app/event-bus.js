/* P0b.5 EventBus - tiny in-browser event log for app-level actions. */
const listeners = new Map()
const events = []

export function emit(type, payload = {}) {
  const event = Object.freeze({ type, payload, time: Date.now() })
  events.push(event)
  const bucket = listeners.get(type) || []
  const all = listeners.get('*') || []
  ;[...bucket, ...all].forEach((fn) => {
    try { fn(event) } catch (error) { console.error('[agent-team] eventBus listener failed', error) }
  })
  return event
}

export function on(type, fn) {
  if (!listeners.has(type)) listeners.set(type, [])
  listeners.get(type).push(fn)
  return () => {
    const next = (listeners.get(type) || []).filter((item) => item !== fn)
    listeners.set(type, next)
  }
}

export function getEvents() { return events.slice() }

export const eventBus = Object.freeze({
  version: 'p0b.5',
  kind: 'in-browser-action-event-bus',
  emit,
  on,
  getEvents,
})
