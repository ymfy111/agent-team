/* P0b.4 Page Registry - maps pageId to existing legacy DOM containers. */
import { MENU_ITEMS } from './menu-config.js'

export const PAGE_REGISTRY = Object.freeze([
  ...MENU_ITEMS.map((item) => Object.freeze({
    id: item.id,
    title: item.label,
    pageElementId: `page-${item.id}`,
    legacy: true,
  })),
  Object.freeze({ id: 'team-detail-template', title: '团队详情模板', pageElementId: 'page-team-detail-template', legacy: true, hidden: true }),
])

export function findPage(pageId) {
  return PAGE_REGISTRY.find((page) => page.id === pageId) || null
}

export function canNavigate(pageId) {
  const page = findPage(pageId)
  if (!page || page.hidden) return false
  return Boolean(document.getElementById(page.pageElementId))
}

export function listPageIds() {
  return PAGE_REGISTRY.map((page) => page.id)
}

export function validatePageRegistry() {
  return PAGE_REGISTRY.map((page) => ({
    id: page.id,
    pageElementId: page.pageElementId,
    exists: Boolean(document.getElementById(page.pageElementId)),
    hidden: Boolean(page.hidden),
  }))
}
