const TEAMS_HTML = String.raw`
<div class="grid-cards" id="teamCardsContainer">
<!-- Rendered via JS -->
</div>
`

export function mountTeamsPage() {
  const page = document.getElementById('page-teams')
  if (!page) return false
  if (page.dataset.featureMounted === 'teams') return true
  page.innerHTML = TEAMS_HTML
  page.dataset.featureMounted = 'teams'
  return true
}

export function createTeamsPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-10',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-10'
      document.documentElement.dataset.enteringPage = feature.id
      mountTeamsPage()
    },
    afterEnter() {
      mountTeamsPage()
      if (typeof window.renderTeamCards === 'function') window.renderTeamCards()
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
