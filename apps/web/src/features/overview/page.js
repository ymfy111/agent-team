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
<div class="card overview-activity-card">
<div class="card-title" style="margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
<span>团队动态</span>
<span class="activity-top-pill">重点动态 Top 5 · 最新在前</span>
</div>
<div class="activity-team-tabs" id="activityTeamTabs">
<span class="activity-capsule active">全部 (5)</span>
<span class="activity-capsule">研发一组 (1)</span>
<span class="activity-capsule">研发二组 (1)</span>
<span class="activity-capsule warning">待决策 (2)</span>
</div>
<div class="activity-timeline" id="typedActivityStream">
<div class="activity-card event-type-decision decision-card">
<div class="activity-card-head"><span>研发二组 · ERP 系统</span><span>2m 前</span></div>
<div class="activity-card-title">ERP 系统 当前交付工作项</div>
<div class="activity-progress"><i style="width:4%;"></i></div>
<div class="activity-card-task">采购订单到入库单链路重构</div>
<div class="activity-card-alert"><b>待决策</b> 当前任务等待决策：ERP 财务凭证生成规则需人工确认</div>
<div class="activity-card-foot"><span>0/4 任务完成 · 实现3-1 · 实现验证岗</span><b>处理 →</b></div>
</div>
<div class="activity-card event-type-task task-card">
<div class="activity-card-head"><span>研发一组 · HR 代码迁移项目</span><span>1m 前</span></div>
<div class="activity-card-title">HR 代码迁移项目 当前交付工作项</div>
<div class="activity-progress"><i style="width:0%;"></i></div>
<div class="activity-card-task">Vue3 工程骨架与路由迁移</div>
<div class="activity-card-foot"><span>0/4 任务完成 · 实现1-1 / 实现1-3</span><b>查看 →</b></div>
</div>
<div class="activity-card event-type-qa qa-card">
<div class="activity-card-head"><span>研发五组 · 智能软件工厂</span><span>2m 前</span></div>
<div class="activity-card-title">QA 截图验证通过 · TF-FACTORY-UI-RUNTIME-01B</div>
<div class="activity-card-task">errors=[] · 首页布局回归通过</div>
<div class="activity-card-foot"><span>验收反馈已回写</span><b>报告 →</b></div>
</div>
<div class="activity-card event-type-decision decision-card compact">
<div class="activity-card-head"><span>研发三组 · 财务凭证规则</span><span>4m 前</span></div>
<div class="activity-card-title">DecisionPacket · 财务凭证规则审查</div>
<div class="activity-card-foot"><span>阻塞 Task 03A</span><b>处理 →</b></div>
</div>
<div class="activity-card event-type-task task-card compact">
<div class="activity-card-head"><span>研发四组 · 设备管理系统</span><span>6m 前</span></div>
<div class="activity-card-title">Task 02 · Step 规划中</div>
<div class="activity-card-foot"><span>@explorer 定位代码入口</span><b>查看 →</b></div>
</div>
</div>
<div class="activity-timeline" id="overviewActivityStream" style="display:none;"></div>
</div>
</div>

`

const TYPED_ACTIVITY_HTML = `
<div class="activity-card event-type-decision decision-card">
<div class="activity-card-head"><span>研发二组 · ERP 系统</span><span>2m 前</span></div>
<div class="activity-card-title">ERP 系统 当前交付工作项</div>
<div class="activity-progress"><i style="width:4%;"></i></div>
<div class="activity-card-task">采购订单到入库单链路重构</div>
<div class="activity-card-alert"><b>待决策</b> 当前任务等待决策：ERP 财务凭证生成规则需人工确认</div>
<div class="activity-card-foot"><span>0/4 任务完成 · 实现3-1 · 实现验证岗</span><b>处理 →</b></div>
</div>
<div class="activity-card event-type-task task-card">
<div class="activity-card-head"><span>研发一组 · HR 代码迁移项目</span><span>1m 前</span></div>
<div class="activity-card-title">HR 代码迁移项目 当前交付工作项</div>
<div class="activity-progress"><i style="width:0%;"></i></div>
<div class="activity-card-task">Vue3 工程骨架与路由迁移</div>
<div class="activity-card-foot"><span>0/4 任务完成 · 实现1-1 / 实现1-3</span><b>查看 →</b></div>
</div>
<div class="activity-card event-type-qa qa-card">
<div class="activity-card-head"><span>研发五组 · 智能软件工厂</span><span>2m 前</span></div>
<div class="activity-card-title">QA 截图验证通过 · TF-FACTORY-UI-RUNTIME-01B</div>
<div class="activity-card-task">errors=[] · 首页布局回归通过</div>
<div class="activity-card-foot"><span>验收反馈已回写</span><b>报告 →</b></div>
</div>
<div class="activity-card event-type-decision decision-card compact">
<div class="activity-card-head"><span>研发三组 · 财务凭证规则</span><span>4m 前</span></div>
<div class="activity-card-title">DecisionPacket · 财务凭证规则审查</div>
<div class="activity-card-foot"><span>阻塞 Task 03A</span><b>处理 →</b></div>
</div>
<div class="activity-card event-type-task task-card compact">
<div class="activity-card-head"><span>研发四组 · 设备管理系统</span><span>6m 前</span></div>
<div class="activity-card-title">Task 02 · Step 规划中</div>
<div class="activity-card-foot"><span>@explorer 定位代码入口</span><b>查看 →</b></div>
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
