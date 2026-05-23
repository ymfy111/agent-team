/* P0b.5 ActionDispatcher - stable action seam before legacy globals. */
import { eventBus } from './event-bus.js'
import { router } from './router.js'

const handlers = new Map()

export function registerAction(type, handler) {
  handlers.set(type, handler)
}

export function dispatch(type, payload = {}) {
  eventBus.emit('action.dispatch', { type, payload })
  const handler = handlers.get(type)
  if (!handler) {
    eventBus.emit('action.unhandled', { type, payload })
    return false
  }
  try {
    const result = handler(payload)
    eventBus.emit('action.done', { type, payload, result })
    return result
  } catch (error) {
    eventBus.emit('action.error', { type, payload, message: error?.message || String(error) })
    throw error
  }
}

registerAction('app.navigate', ({ pageId, options } = {}) => router.navigate(pageId, options || {}))

export const actionDispatcher = Object.freeze({
  version: 'p0b.5',
  kind: 'app-action-dispatcher',
  dispatch,
  registerAction,
})
