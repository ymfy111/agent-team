import overviewFeature from './overview/feature.js'
import teamsFeature from './teams/feature.js'
import projectsFeature from './projects/feature.js'
import decisionsFeature from './decisions/feature.js'
import runtimeGatewayFeature from './runtime-gateway/feature.js'
import rolesFeature from './roles/feature.js'
import poolFeature from './pool/feature.js'
import skillsFeature from './skills/feature.js'
import settingsFeature from './settings/feature.js'

export const FEATURES = Object.freeze([
  overviewFeature,
  teamsFeature,
  projectsFeature,
  decisionsFeature,
  runtimeGatewayFeature,
  rolesFeature,
  poolFeature,
  skillsFeature,
  settingsFeature,
].slice().sort((a, b) => (a.order || 0) - (b.order || 0)))

export function findFeature(featureId) {
  return FEATURES.find((feature) => feature.id === featureId) || null
}

export function listFeaturePageIds() {
  return FEATURES.map((feature) => feature.id)
}

export function buildFeatureMenuGroups() {
  const groups = []
  const groupMap = new Map()
  FEATURES.forEach((feature) => {
    if (!feature.groupId) return
    if (!groupMap.has(feature.groupId)) {
      const group = { id: feature.groupId, label: feature.groupLabel || feature.groupId, items: [] }
      groupMap.set(feature.groupId, group)
      groups.push(group)
    }
    groupMap.get(feature.groupId).items.push({ id: feature.id, label: feature.label, title: feature.title })
  })
  return groups.map((group) => Object.freeze({
    ...group,
    items: Object.freeze(group.items.map((item) => Object.freeze(item))),
  }))
}

export function buildFeaturePageRegistry() {
  return FEATURES.map((feature) => Object.freeze({
    id: feature.id,
    title: feature.label,
    pageElementId: feature.pageElementId || `page-${feature.id}`,
    legacy: feature.legacy !== false,
    featureId: feature.id,
  }))
}
