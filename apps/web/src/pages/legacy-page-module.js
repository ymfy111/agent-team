/* P0b.6 LegacyPageModule - page lifecycle wrapper without rewriting UI. */
export function createLegacyPageModule(page) {
  return Object.freeze({
    id: page.id,
    title: page.title,
    pageElementId: page.pageElementId,
    version: 'p0b.6',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'p0b.6'
      document.documentElement.dataset.enteringPage = page.id
    },
    afterEnter() {
      document.documentElement.dataset.currentPageModule = page.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
