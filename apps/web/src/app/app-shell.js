/* P0b.4 AppShell - initializes menu/page/router seams without changing UI. */
import { MENU_GROUPS, MENU_ITEMS } from './menu-config.js'
import { validatePageRegistry } from './page-registry.js'
import { router } from './router.js'
import { actionDispatcher } from './action-dispatcher.js'
import { eventBus } from './event-bus.js'

function installRouterBridge() {
  const current = window.switchNav
  if (typeof current !== 'function') return false
  if (current.__agentTeamRouterBridge) return true

  router.setLegacySwitchNav(current)
  const bridged = function switchNavViaRouter(target, options) {
    return actionDispatcher.dispatch('app.navigate', { pageId: target, options })
  }
  bridged.__agentTeamRouterBridge = true
  bridged.__legacySwitchNav = current
  window.switchNav = bridged
  return true
}

export function initAppShell() {
  const bridgeInstalled = installRouterBridge()
  const status = {
    version: 'p0b.6',
    kind: 'legacy-compatible-app-shell',
    bridgeInstalled,
    menuGroups: MENU_GROUPS.length,
    menuItems: MENU_ITEMS.length,
    router: router.createRouterStatus(),
    eventBus: { version: eventBus.version },
    actionDispatcher: { version: actionDispatcher.version },
    pageRegistry: validatePageRegistry(),
  }
  window.__AGENT_TEAM_APP_SHELL__ = Object.freeze(status)
  window.__AGENT_TEAM_ROUTER__ = router
  document.documentElement.dataset.appShell = 'p0b.6'
  document.documentElement.dataset.router = 'p0b.6'
  document.documentElement.dataset.eventBus = 'p0b.5'
  document.documentElement.dataset.actionDispatcher = 'p0b.5'
  document.documentElement.dataset.currentPage = router.getCurrentPage()
  return status
}
