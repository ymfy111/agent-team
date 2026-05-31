const PROJECTS_HTML = String.raw`

<div style="display:flex; justify-content:flex-end; font-size:13px; color:var(--text-muted); margin-bottom:12px;">
<span id="projectsTotalCount">0</span> 个项目 · 由 <span id="projectsTeamCount">0</span> 个团队承接
          </div>
<div class="card" style="padding:0; overflow:hidden;">
<table class="projects-table" id="projectsTable">
<thead>
<tr>
<th style="width:22%;">项目名</th>
<th style="width:9%;">代码</th>
<th style="width:12%;">文档</th>
<th style="width:14%;">承接团队</th>
<th style="width:12%;">状态</th>
<th style="width:13%;">Leader</th>
<th style="width:18%;">最近更新</th>
</tr>
</thead>
<tbody id="projectsTableBody">
<!-- Rendered via JS -->
</tbody>
</table>
</div>

`

export function mountProjectsPage() {
  const page = document.getElementById('page-projects')
  if (!page) return false
  if (page.dataset.featureMounted === 'projects') return true
  page.innerHTML = PROJECTS_HTML
  page.dataset.featureMounted = 'projects'
  return true
}

export function createProjectsPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-11',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-11'
      document.documentElement.dataset.enteringPage = feature.id
      mountProjectsPage()
    },
    afterEnter() {
      mountProjectsPage()
      if (typeof window.renderProjects === 'function') window.renderProjects()
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
