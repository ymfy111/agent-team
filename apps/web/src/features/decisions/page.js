const DECISIONS_SHELL_HTML = `
  <div class="decision-wb-shell">
    <div class="decision-wb-topbar">
      <div class="decision-wb-heading">
        <div class="decision-wb-eyebrow">⚖️ 用户决策工作台</div>
        <div class="decision-wb-title">只处理影响交付边界的关键决策</div>
      </div>
      <div class="decision-wb-summary" aria-label="待决策摘要">
        <span class="decision-wb-summary-pill blue">待决策 <strong id="decisionWbPending">0</strong></span>
        <span class="decision-wb-summary-pill red">紧急/高风险 <strong id="decisionWbUrgent">0</strong></span>
        <span class="decision-wb-summary-pill amber">待审查 <strong id="decisionWbReview">0</strong></span>
      </div>
      <div class="decision-wb-filter-left">
        <select class="filter-select" id="decisionUrgencyFilter" onchange="renderDecisions()">
          <option value="all">全部紧急度</option>
          <option value="urgent">🔴 紧急</option>
          <option value="normal">常规</option>
        </select>
        <select class="filter-select" id="decisionTeamFilter" onchange="renderDecisions()">
          <option value="all">全部团队</option>
        </select>
        <select class="filter-select" id="decisionStatusFilter" onchange="renderDecisions()">
          <option value="pending">待决策</option>
          <option value="expired">已过期</option>
          <option value="all">全部状态</option>
        </select>
      </div>
    </div>
    <div class="decision-wb-layout">
      <div class="decision-wb-panel">
        <div class="decision-wb-panel-head">
          <div>
            <div class="decision-wb-panel-title">决策队列</div>
            <div class="decision-wb-panel-sub" id="decisionWbListSub">按紧急度与影响范围排序</div>
          </div>
          <span class="decision-wb-pill blue" id="decisionWbVisibleCount">0 项</span>
        </div>
        <div class="decision-wb-list" id="decisionListBody"></div>
      </div>
      <div class="decision-wb-detail-wrap" style="position:relative;">
        <div id="decisionDetailPanel" class="decision-wb-detail">
          <div class="decision-wb-detail-empty">请选择左侧决策项</div>
        </div>
        <div id="decisionStatusOverlay" class="decision-status-overlay" style="display:none;">
          <div class="polling-dot" style="width:24px;height:24px;animation:none;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--info)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div id="decisionStatusText" style="font-weight:600;font-size:16px;color:var(--info);">等待主智能体确认...</div>
          <div style="font-size:13px;color:var(--text-secondary);">决策已下发，正在建立指令通道</div>
        </div>
      </div>
    </div>
  </div>
`

function refreshLegacyDecisionData() {
  try {
    if (typeof window.populateTeamFilters === 'function') window.populateTeamFilters()
  } catch (error) {
    console.warn('[agent-team] populate decision team filters failed', error)
  }

  try {
    if (typeof window.renderDecisions === 'function') window.renderDecisions()
  } catch (error) {
    console.warn('[agent-team] render decisions failed', error)
  }
}

export function mountDecisionsPage() {
  const page = document.getElementById('page-decisions')
  if (!page) return false

  if (page.dataset.featureMounted !== 'decisions') {
    if (page.dataset.v063319Workbench !== '1') {
      page.innerHTML = DECISIONS_SHELL_HTML
      page.dataset.v063319Workbench = '1'
    }
    page.dataset.featureMounted = 'decisions'
  }

  refreshLegacyDecisionData()
  return true
}

export function createDecisionsPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-08',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-08'
      document.documentElement.dataset.enteringPage = feature.id
      mountDecisionsPage()
    },
    afterEnter() {
      mountDecisionsPage()
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
