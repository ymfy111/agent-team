export function createLegacyFeature({ id, label, title, groupId, groupLabel, order }) {
  return Object.freeze({
    id,
    label,
    title: title || label,
    groupId,
    groupLabel,
    order,
    pageElementId: `page-${id}`,
    legacy: true,
  })
}
