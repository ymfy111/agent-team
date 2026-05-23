/* P0b.6 Page module registry - wraps existing legacy DOM pages. */
import { PAGE_REGISTRY } from '../app/page-registry.js'
import { createLegacyPageModule } from './legacy-page-module.js'

const modules = new Map(PAGE_REGISTRY.map((page) => [page.id, createLegacyPageModule(page)]))

export function getLegacyPageModule(pageId) {
  return modules.get(pageId) || null
}

export function listLegacyPageModules() {
  return Array.from(modules.values())
}

export const legacyPageModules = Object.freeze({
  version: 'p0b.6',
  kind: 'legacy-page-module-registry',
  get: getLegacyPageModule,
  list: listLegacyPageModules,
})
