/* UI Arch: Page module registry - wraps legacy DOM pages and feature pages. */
import { PAGE_REGISTRY } from '../app/page-registry.js'
import { findFeature } from '../features/index.js'
import { createLegacyPageModule } from './legacy-page-module.js'

function createPageModule(page) {
  const feature = findFeature(page.featureId || page.id)
  if (feature && typeof feature.createPageModule === 'function') return feature.createPageModule(feature)
  return createLegacyPageModule(page)
}

const modules = new Map(PAGE_REGISTRY.map((page) => [page.id, createPageModule(page)]))

export function getLegacyPageModule(pageId) {
  return modules.get(pageId) || null
}

export function listLegacyPageModules() {
  return Array.from(modules.values())
}

export const legacyPageModules = Object.freeze({
  version: 'ui-arch-02',
  kind: 'feature-page-module-registry',
  get: getLegacyPageModule,
  list: listLegacyPageModules,
})
