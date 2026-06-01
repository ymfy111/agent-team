const OVERVIEW_HTML = String.raw`

<div class="card" style="margin-bottom:16px; border:1px solid #bfdbfe; background:linear-gradient(135deg,#f8fbff 0%,#eef6ff 54%,#fff7ed 100%);">
<div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:14px;">
<div>
<div class="card-title" style="margin-bottom:4px;">AI 动态工作流总览</div>
<div style="color:#64748b; font-size:13px; line-height:1.6;">从计划到步骤的生成链路：业务目标进入工作项，ORCH 派发 Task，数字员工执行 Step，待决策与验收反馈回流。</div>
</div>
<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; font-size:12px;">
<span class="badge" style="background:#dbeafe;color:#1d4ed8;">Plan P0a 演示</span>
<span class="badge" style="background:#ede9fe;color:#6d28d9;">Stage 运行态统一</span>
<span class="badge" style="background:#fee2e2;color:#b91c1c;">4 项决策待处理</span>
</div>
</div>
<div style="display:grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap:10px;">
<div style="background:#ffffffcc; border:1px solid #dbeafe; border-radius:14px; padding:12px;">
<div style="font-size:12px; color:#2563eb; font-weight:700; margin-bottom:6px;">Plan</div>
<div style="font-weight:800; color:#0f172a;">P0a 演示</div>
<div style="font-size:12px; color:#64748b; margin-top:4px;">目标：AI 原生应用生成工作台</div>
</div>
<div style="background:#ffffffcc; border:1px solid #ddd6fe; border-radius:14px; padding:12px;">
<div style="font-size:12px; color:#7c3aed; font-weight:700; margin-bottom:6px;">Stage</div>
<div style="font-weight:800; color:#0f172a;">Runtime / UI</div>
<div style="font-size:12px; color:#64748b; margin-top:4px;">运行态业务逻辑统一</div>
</div>
<div style="background:#ffffffcc; border:1px solid #bbf7d0; border-radius:14px; padding:12px;">
<div style="font-size:12px; color:#16a34a; font-weight:700; margin-bottom:6px;">WorkItem</div>
<div style="font-weight:800; color:#0f172a;">TF-FACTORY-UI-RUNTIME</div>
<div style="font-size:12px; color:#64748b; margin-top:4px;">首页动态工作流增强</div>
</div>
<div style="background:#ffffffcc; border:1px solid #fed7aa; border-radius:14px; padding:12px;">
<div style="font-size:12px; color:#ea580c; font-weight:700; margin-bottom:6px;">Task</div>
<div style="font-weight:800; color:#0f172a;">01A · 表达增强</div>
<div style="font-size:12px; color:#64748b; margin-top:4px;">当前批次 1/5 · 计划中</div>
</div>
<div style="background:#ffffffcc; border:1px solid #fecaca; border-radius:14px; padding:12px;">
<div style="font-size:12px; color:#dc2626; font-weight:700; margin-bottom:6px;">Step / Gate</div>
<div style="font-weight:800; color:#0f172a;">截图自查门禁</div>
<div style="font-size:12px; color:#64748b; margin-top:4px;">备份 → 修改 → 截图 → 验收</div>
</div>
</div>
<div style="display:grid; grid-template-columns:2fr 1fr; gap:12px; margin-top:12px;">
<div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px;">
<div style="font-weight:800; color:#0f172a; margin-bottom:8px;">员工活动绑定到 Task / Step</div>
<div style="display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; font-size:12px;">
<div><b>@fixer</b><br><span style="color:#64748b;">Task 01A · S03 页面实现</span></div>
<div><b>@designer</b><br><span style="color:#64748b;">Task 01A · S05 截图自查</span></div>
<div><b>@oracle</b><br><span style="color:#64748b;">DecisionPacket · 范围门禁</span></div>
</div>
</div>
<div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px;">
<div style="font-weight:800; color:#0f172a; margin-bottom:8px;">生成产物</div>
<div style="font-size:12px; color:#64748b; line-height:1.7;">页面蓝图 · mock 状态 · 截图证据 · QA 报告</div>
</div>
</div>
</div>
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
<div class="activity-timeline" id="overviewActivityStream">
<!-- Rendered via JS -->
</div>
</div>
</div>

`

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
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
