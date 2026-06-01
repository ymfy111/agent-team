const OVERVIEW_HTML = String.raw`

<div class="stat-cards-row">
<div class="stat-card accent-green clickable" onclick="switchNav('teams')" title="查看团队运行态">
<div class="stat-card-title">🏢 活跃 WorkItem</div>
<div class="stat-card-value" id="statTeamCount">5</div>
<div class="stat-card-desc-row">
<span class="stat-card-desc" id="statTeamDesc">Plan / Stage 推进中</span>
<span class="stat-card-trend flat" id="statTeamTrend">查看团队 →</span>
</div>
</div>
<div class="stat-card accent-blue clickable" onclick="switchNav('pool')" title="查看数字员工实例">
<div class="stat-card-title">✅ Task / Step 员工</div>
<div class="stat-card-value" id="statMasterCount">24</div>
<div class="stat-card-desc-row">
<span class="stat-card-desc" id="statMasterDesc">执行 · 协同 · 验证</span>
<span class="stat-card-trend up" id="statMasterTrend">查看员工 →</span>
</div>
</div>
<div class="stat-card accent-orange clickable" onclick="jumpToP0aTasks()" title="查看当前任务单流转">
<div class="stat-card-title">⚡ 当前 TaskBatch</div>
<div class="stat-card-value" id="statWorkerCount">10</div>
<div class="stat-card-desc-row">
<span class="stat-card-desc" id="statWorkerDesc">Task 1/5 · Step 规划中</span>
<span class="stat-card-trend up" id="statWorkerTrend">查看任务 →</span>
</div>
</div>
<div class="stat-card accent-red clickable" onclick="switchNav('decisions')" title="查看待决策与待审查">
<div class="stat-card-title">⚠️ DecisionPacket</div>
<div class="stat-card-value" id="statDecisionCount">4/7</div>
<div class="stat-card-desc-row">
<span class="stat-card-desc" id="statDecisionDesc">待决策 · 待验收</span>
<span class="stat-card-trend down" id="statDecisionTrend">去处理 →</span>
</div>
</div>
</div>
<div class="overview-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; grid-template-rows: 1fr;">
<div class="card">
<div class="card-title" style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
<span>协作全景 · Team WorkItem</span>
<div class="topo-legend" title="节点状态图例">
<span class="topo-legend-item"><i class="topo-legend-dot" style="background:#3b82f6;"></i>空闲</span>
<span class="topo-legend-item"><i class="topo-legend-dot" style="background:#7c3aed;"></i>忙碌</span>
<span class="topo-legend-item"><i class="topo-legend-dot" style="background:#94a3b8;"></i>离线</span>
</div>
</div>
<div class="topo-scroll-area">
<div id="topologyHtml">
<!-- Rendered via JS -->
</div>
</div>
</div>
<div class="card">
<div class="card-title" style="margin-bottom:12px;">工作项事件流</div>
<div class="activity-team-tabs" id="activityTeamTabs">
<!-- Rendered via JS -->
</div>
<div class="activity-timeline" id="typedActivityStream">
<div class="activity-item event-type-decision" style="border-left:3px solid #dc2626; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">2m 前 · 研发一组</div>
<div style="font-size:13px;"><b style="color:#dc2626;">待决策</b> DecisionPacket · 原型架构边界需确认 <span style="color:#64748b;">→ 阻塞 Task 01C</span></div>
</div>
<div class="activity-item event-type-task" style="border-left:3px solid #ea580c; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">5m 前 · 研发二组</div>
<div style="font-size:13px;"><b style="color:#ea580c;">Task </b>01B · S03 抽屉实现 <span style="color:#16a34a;">done</span> · @fixer 回写执行反馈</div>
</div>
<div class="activity-item event-type-qa" style="border-left:3px solid #7c3aed; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">8m 前 · 研发一组</div>
<div style="font-size:13px;"><b style="color:#7c3aed;">QA</b> 截图验证通过 · TF-FACTORY-UI-RUNTIME-01B · errors=[]</div>
</div>
<div class="activity-item event-type-decision" style="border-left:3px solid #dc2626; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">12m 前 · 研发三组</div>
<div style="font-size:13px;"><b style="color:#dc2626;">待决策</b> DecisionPacket · 财务凭证规则审查 <span style="color:#64748b;">→ 阻塞 Task 03A</span></div>
</div>
<div class="activity-item event-type-task" style="border-left:3px solid #2563eb; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">15m 前 · 研发四组</div>
<div style="font-size:13px;"><b style="color:#2563eb;">Task </b>02 · Step 规划中 · @explorer 定位代码入口</div>
</div>
<div class="activity-item event-type-task" style="border-left:3px solid #16a34a; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">20m 前 · 研发五组</div>
<div style="font-size:13px;"><b style="color:#16a34a;">Task </b>01A · 总览页表达增强 <span style="color:#16a34a;">done</span> · 验收通过</div>
</div>
</div>
<div class="activity-timeline" id="overviewActivityStream" style="display:none;"></div>
</div>
</div>

`

const TYPED_ACTIVITY_HTML = `
<div class="activity-item event-type-decision" style="border-left:3px solid #dc2626; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">2m 前 · 研发一组</div>
<div style="font-size:13px;"><b style="color:#dc2626;">待决策</b> DecisionPacket · 原型架构边界需确认 <span style="color:#64748b;">→ 阻塞 Task 01C</span></div>
</div>
<div class="activity-item event-type-task" style="border-left:3px solid #ea580c; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">5m 前 · 研发二组</div>
<div style="font-size:13px;"><b style="color:#ea580c;">Task </b>01B · S03 抽屉实现 <span style="color:#16a34a;">done</span> · @fixer 回写执行反馈</div>
</div>
<div class="activity-item event-type-qa" style="border-left:3px solid #7c3aed; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">8m 前 · 研发一组</div>
<div style="font-size:13px;"><b style="color:#7c3aed;">QA</b> 截图验证通过 · TF-FACTORY-UI-RUNTIME-01B · errors=[]</div>
</div>
<div class="activity-item event-type-decision" style="border-left:3px solid #dc2626; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">12m 前 · 研发三组</div>
<div style="font-size:13px;"><b style="color:#dc2626;">待决策</b> DecisionPacket · 财务凭证规则审查 <span style="color:#64748b;">→ 阻塞 Task 03A</span></div>
</div>
<div class="activity-item event-type-task" style="border-left:3px solid #2563eb; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">15m 前 · 研发四组</div>
<div style="font-size:13px;"><b style="color:#2563eb;">Task </b>02 · Step 规划中 · @explorer 定位代码入口</div>
</div>
<div class="activity-item event-type-task" style="border-left:3px solid #16a34a; padding-left:10px; margin-bottom:10px;">
<div style="font-size:11px; color:#64748b;">20m 前 · 研发五组</div>
<div style="font-size:13px;"><b style="color:#16a34a;">Task </b>01A · 总览页表达增强 <span style="color:#16a34a;">done</span> · 验收通过</div>
</div>
`

function applyTypedActivityStream() {
  const el = document.getElementById('overviewActivityStream')
  if (el) el.innerHTML = TYPED_ACTIVITY_HTML
}

// Ensure typed stream persists after legacy runtime overwrites
function installActivityStreamGuard() {
  applyTypedActivityStream()
  // Override the legacy activity renderer to use our typed stream
  const origRenderOverview = window.renderOverview
  if (typeof origRenderOverview === 'function' && !origRenderOverview.__01cGuarded) {
    const wrapped = function() {
      const ret = origRenderOverview.apply(this, arguments)
      applyTypedActivityStream()
      return ret
    }
    wrapped.__01cGuarded = true
    window.renderOverview = wrapped
  }
  ;[200, 600, 1200, 2400, 5000, 8000].forEach(ms => setTimeout(applyTypedActivityStream, ms))
}

export function mountOverviewPage() {
  const page = document.getElementById('page-overview')
  if (!page) return false
  if (page.dataset.featureMounted === 'overview') return true
  page.innerHTML = OVERVIEW_HTML
  page.dataset.featureMounted = 'overview'
  return true
}

export function createOverviewPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-12',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-12'
      document.documentElement.dataset.enteringPage = feature.id
      mountOverviewPage()
    },
    afterEnter() {
      mountOverviewPage()
      if (typeof window.renderOverview === 'function') window.renderOverview()
      if (typeof window.renderTopology === 'function') window.renderTopology()
      setTimeout(applyTypedActivityStream, 120)
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
