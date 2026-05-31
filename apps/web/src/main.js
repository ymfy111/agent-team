import { appEnvironment } from './bootstrap/environment.js'
import { storageAdapter, sessionStorageAdapter } from './adapters/storage-adapter.js'
import { resolveAssetPath, ASSET_BASE } from './adapters/asset-path-adapter.js'
import { getDataProvider, listEntityCounts } from './adapters/data-provider.js'
import { getFactoryApi, getFactoryApiHealth } from './services/factory-api.js'
import { initAppShell } from './app/app-shell.js'
import { mountTopBannerTemplate } from './templates/top-banner-template.js'
import { mountSettingsPage } from './features/settings/page.js'
import { mountRuntimeGatewayPage } from './features/runtime-gateway/page.js'
import { mountSkillsPage } from './features/skills/page.js'
import { mountDecisionsPage } from './features/decisions/page.js'
import { mountPoolPage } from './features/pool/page.js'
import { mountTeamsPage } from './features/teams/page.js'
import { mountProjectsPage } from './features/projects/page.js'
import { mountRolesPage } from './features/roles/page.js'
import { mountOverviewPage } from './features/overview/page.js'

// P0a/P0b keeps the legacy prototype runtime as classic scripts.
// This module proves new browser-native ESM code can coexist with the legacy
// runtime and exposes the next stable seam: Factory API.
const appInfo = {
  ...appEnvironment,
  mountedAt: new Date().toISOString(),
  dataProvider: getDataProvider() ? {
    version: getDataProvider().version || 'unknown',
    kind: getDataProvider().kind || 'unknown',
    entityCounts: listEntityCounts(),
  } : null,
  adapters: {
    storage: storageAdapter.__kind === 'memory' ? 'memoryStorage' : 'localStorage',
    sessionStorage: sessionStorageAdapter.__kind === 'memory' ? 'memoryStorage' : 'sessionStorage',
    assetBase: ASSET_BASE,
    sampleAssetPath: resolveAssetPath('pic/avatars/avatar-default.png'),
  },
  factoryApi: {
    kind: 'mock',
    status: 'initializing',
  },
}

window.__AGENT_TEAM_APP__ = Object.freeze(appInfo)
window.__AGENT_TEAM_FACTORY_API__ = getFactoryApi()
window.__AGENT_TEAM_FACTORY_API_READY__ = getFactoryApiHealth()
  .then((health) => {
    const nextInfo = {
      ...appInfo,
      factoryApi: {
        ...health,
        status: 'ready',
      },
    }
    window.__AGENT_TEAM_APP__ = Object.freeze(nextInfo)
    document.documentElement.dataset.factoryApi = `${health.kind}:ready`
    return health
  })
  .catch((error) => {
    const nextInfo = {
      ...appInfo,
      factoryApi: {
        kind: 'mock',
        status: 'error',
        message: error && error.message ? error.message : String(error),
      },
    }
    window.__AGENT_TEAM_APP__ = Object.freeze(nextInfo)
    document.documentElement.dataset.factoryApi = 'mock:error'
    throw error
  })

document.documentElement.dataset.appShell = appEnvironment.mode

// P0b.4: initialize AppShell/Router after legacy runtime has exposed switchNav.
queueMicrotask(() => {
  try {
    const topBannerTemplate = mountTopBannerTemplate()
    mountOverviewPage()
    mountSettingsPage()
    mountRuntimeGatewayPage()
    mountSkillsPage()
    mountDecisionsPage()
    mountPoolPage()
    mountTeamsPage()
    mountProjectsPage()
    mountRolesPage()
    const shell = initAppShell()
    window.__AGENT_TEAM_APP__ = Object.freeze({ ...window.__AGENT_TEAM_APP__, topBannerTemplate, appShell: shell })
  } catch (error) {
    console.error('[agent-team] app shell init failed', error)
    document.documentElement.dataset.appShell = 'p0b.4:error'
  }
})
