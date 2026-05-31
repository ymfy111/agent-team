const ROLES_HTML = String.raw`
<div class="page-title">
  <div class="page-title-text">数字员工模板（岗位） <span class="page-title-meta">AgentTemplate = 可实例化的岗位能力模板；当前仅保留 AI 原生三类岗位</span></div>
</div>
<div class="card" style="margin-bottom:14px; padding:12px 16px; border-color:#bfdbfe; background:linear-gradient(135deg,#eff6ff,#fff);">
  <div style="font-size:13px; color:#334155; line-height:1.6;">
    <strong>主链路：</strong>岗位定义能力模板 → 基于岗位创建数字员工实例 → 实例继承岗位技能 → 匹配团队与项目运行；专家能力按任务需要沉淀为技能/评审机制，不再作为常驻岗位。
  </div>
</div>
<div class="card" style="margin-bottom:14px; padding:14px 16px;">
  <div class="docs-status-strip">
    <span class="docs-status-pill active">有效岗位模板 3</span>
    <span class="docs-status-pill">协同规划 / 实现验证 / 交付审查</span>
    <span class="docs-status-pill warn">实例继承：通用技能 + 岗位技能</span>
    <span class="docs-status-pill">专家能力沉淀为技能/评审机制</span>
  </div>
</div>
<div class="role-consistency-note-v63328"><strong>v0.6.33 收口口径：</strong>当前配置态岗位与运行态团队保持一致，仅保留协同规划岗、实现验证岗、交付审查岗。</div>
<div class="grid-cards" id="roleCardsContainer"><!-- Rendered via JS --></div>
`

export function mountRolesPage() {
  const page = document.getElementById('page-roles')
  if (!page) return false
  if (page.dataset.featureMounted !== 'roles') {
    page.innerHTML = ROLES_HTML
    page.dataset.featureMounted = 'roles'
  }
  if (typeof window.renderRolesPage === 'function') {
    window.renderRolesPage()
  }
  return true
}

export function createRolesPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-temp-roles-fix-01',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-temp-roles-fix-01'
      document.documentElement.dataset.enteringPage = feature.id
      mountRolesPage()
    },
    afterEnter() {
      mountRolesPage()
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
