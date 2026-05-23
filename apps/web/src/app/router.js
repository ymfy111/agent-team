/* P0b.4 Router - compatibility wrapper around legacy switchNav/switchTab. */
import { canNavigate, findPage, validatePageRegistry } from './page-registry.js'
import { findMenuItem } from './menu-config.js'
import { getLegacyPageModule } from '../pages/legacy-page-modules.js'

let legacySwitchNav = null
let currentPageId = 'overview'
let isNavigating = false

function detectCurrentPage() {
  const activePage = document.querySelector('.page.active')
  if (activePage && activePage.id && activePage.id.startsWith('page-')) {
    return activePage.id.slice('page-'.length)
  }
  const activeNav = document.querySelector('.nav-item.active[data-target]')
  if (activeNav) return activeNav.dataset.target
  return currentPageId
}

export function setLegacySwitchNav(fn) {
  legacySwitchNav = typeof fn === 'function' ? fn : null
}

export function getCurrentPage() {
  currentPageId = detectCurrentPage()
  return currentPageId
}

export function navigate(pageId, options = {}) {
  if (!pageId) return false
  const page = findPage(pageId)
  if (!page || (!options.allowHidden && page.hidden)) return false

  const pageModule = getLegacyPageModule(pageId)
  if (pageModule && typeof pageModule.beforeEnter === 'function') pageModule.beforeEnter()
  currentPageId = pageId
  document.documentElement.dataset.currentPage = pageId
  document.documentElement.dataset.currentMenu = findMenuItem(pageId)?.groupId || 'unknown'

  if (legacySwitchNav && !isNavigating) {
    isNavigating = true
    try {
      legacySwitchNav(pageId)
    } finally {
      isNavigating = false
      currentPageId = detectCurrentPage()
      document.documentElement.dataset.currentPage = currentPageId
      if (pageModule && typeof pageModule.afterEnter === 'function') pageModule.afterEnter()
    }
    return true
  }

  // Fallback only; normal P0b.4 path should still use legacy switchNav.
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.target === pageId))
  document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'))
  const pageEl = document.getElementById(page.pageElementId)
  if (pageEl) pageEl.classList.add('active')
  if (pageModule && typeof pageModule.afterEnter === 'function') pageModule.afterEnter()
  return true
}

export function createRouterStatus() {
  return {
    version: 'p0b.6',
    kind: 'legacy-compatible-router',
    currentPage: getCurrentPage(),
    pages: validatePageRegistry(),
  }
}

export const router = Object.freeze({
  version: 'p0b.6',
  kind: 'legacy-compatible-router',
  canNavigate,
  navigate,
  getCurrentPage,
  setLegacySwitchNav,
  createRouterStatus,
})
