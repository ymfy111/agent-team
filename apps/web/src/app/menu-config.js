/* UI Arch: Menu Config - derived from feature registry. */
import { buildFeatureMenuGroups } from '../features/index.js'

export const MENU_GROUPS = Object.freeze(buildFeatureMenuGroups())

export const MENU_ITEMS = Object.freeze(MENU_GROUPS.flatMap((group) =>
  group.items.map((item) => Object.freeze({ ...item, groupId: group.id }))
))

export function findMenuItem(pageId) {
  return MENU_ITEMS.find((item) => item.id === pageId) || null
}

export function listMenuPageIds() {
  return MENU_ITEMS.map((item) => item.id)
}
