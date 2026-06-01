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
<div class="activity-timeline" id="typedActivityStream"><!-- Rendered from OVERVIEW_WORK_ITEMS --></div>
<div class="activity-timeline" id="overviewActivityStream" style="display:none;"></div>
</div>
</div>

`

const OVERVIEW_WORK_ITEMS = [
  {
    id: 'erp-current',
    team: '研发三组',
    project: 'ERP 系统',
    title: 'ERP 系统 当前交付工作项',
    status: '待决策',
    stage: '系统实现',
    batch: 'ORCH 当前调度',
    planned: '01:19',
    actual: '1小时 8分钟',
    progress: 4,
    eventType: 'decision',
    eventTime: '2m 前',
    currentTask: '采购订单到入库单链路重构',
    decision: 'ERP 财务凭证生成规则需人工确认',
    tasks: [
      ['采购订单到入库单链路重构', 'WO-ERP-001', '执行中'],
      ['库存台账接口契约补齐', 'WO-ERP-002', '执行中'],
      ['财务凭证生成规则实现验证', 'WO-ERP-003', '等待决策'],
      ['历史单据兼容迁移脚本', 'WO-ERP-004', '草稿'],
    ],
    acceptance: ['执行  实现3-1 · 实现验证岗', '组长 / 验收  实现3-1 · 组长 / 协同'],
    stopPolicy: '暂停条件：任务失败 / 等待决策 / 运行异常',
  },
  {
    id: 'hr-migration',
    team: '研发一组',
    project: 'HR 代码迁移项目',
    title: 'HR 代码迁移项目 当前交付工作项',
    status: '进行中',
    stage: '系统实现',
    batch: 'TaskBatch 01',
    planned: '00:58',
    actual: '42分钟',
    progress: 0,
    eventType: 'task',
    eventTime: '1m 前',
    currentTask: 'Vue3 工程骨架与路由迁移',
    decision: '确认业务取舍或技术边界',
    tasks: [
      ['Vue3 工程骨架与路由迁移', 'WO-HR-001', '执行中'],
      ['用户权限菜单适配', 'WO-HR-002', '等待决策'],
      ['路由回归截图验证', 'WO-HR-003', '草稿'],
    ],
    acceptance: ['执行  实现1-1 · 实现验证岗', 'QA  截图验证等待中'],
    stopPolicy: '暂停条件：构建失败 / 路由验证不通过',
  },
  {
    id: 'factory-qa',
    team: '研发五组',
    project: '智能软件工厂',
    title: 'QA 截图验证通过 · TF-FACTORY-UI-RUNTIME-01B',
    status: '验收通过',
    stage: '运行态统一',
    batch: 'Task 01B',
    planned: '00:30',
    actual: '28分钟',
    progress: 100,
    eventType: 'qa',
    eventTime: '2m 前',
    currentTask: '首页布局回归通过',
    decision: '',
    tasks: [['截图验证通过', 'QA-01B', '完成'], ['errors=[]', 'QA-ERR', '完成']],
    acceptance: ['QA  浏览器错误为 0', '验收反馈已回写'],
    stopPolicy: '无阻塞',
  },
]

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function renderActivityCard(item) {
  const typeClass = item.eventType === 'qa' ? 'event-type-qa qa-card' : item.eventType === 'decision' ? 'event-type-decision decision-card' : 'event-type-task task-card'
  const alert = item.decision ? `<div class="activity-card-alert"><b>待决策</b> 当前任务等待决策：${esc(item.decision)}</div>` : ''
  const action = item.decision ? '处理 →' : item.eventType === 'qa' ? '报告 →' : '查看 →'
  return `<div class="activity-card ${typeClass}" onclick="window.openOverviewWorkItemDrawer && window.openOverviewWorkItemDrawer('${esc(item.id)}')">
<div class="activity-card-head"><span>${esc(item.team)} · ${esc(item.project)}</span><span>${esc(item.eventTime)}</span></div>
<div class="activity-card-title">${esc(item.title)}</div>
<div class="activity-progress"><i style="width:${Math.max(4, item.progress)}%;"></i></div>
<div class="activity-card-task">${esc(item.currentTask)}</div>
${alert}
<div class="activity-card-foot"><span>${esc(item.progress)}/100 · ${esc(item.stage)}</span><b>${action}</b></div>
</div>`
}

function renderActivityStream() {
  return OVERVIEW_WORK_ITEMS.map(renderActivityCard).join('')
}

function applyTypedActivityStream() {
  const el = document.getElementById('typedActivityStream')
  if (el) el.innerHTML = renderActivityStream()
}

function openOverviewWorkItemDrawer(id) {
  const item = OVERVIEW_WORK_ITEMS.find(entry => entry.id === id) || OVERVIEW_WORK_ITEMS[0]
  let shell = document.getElementById('opsDrawerShell')
  if (!shell) {
    shell = document.createElement('div')
    shell.id = 'opsDrawerShell'
    shell.className = 'ops-drawer-shell'
    document.body.appendChild(shell)
  }
  shell.innerHTML = `<div class="ops-drawer overview-workitem-drawer" role="dialog" aria-modal="false">
<div class="ops-drawer-head"><div><div class="ops-drawer-title">${esc(item.team)} · ${esc(item.project)}</div><div class="ops-drawer-sub">${esc(item.title)}</div></div><button class="ops-drawer-close" onclick="window.closeOpsDrawer && window.closeOpsDrawer()">×</button></div>
<div class="ops-drawer-body">
<div class="overview-drawer-alert"><span class="drawer-badge running">进行中</span>${item.decision ? '<span class="drawer-badge decision">待决策</span>' : ''}<p>当前任务${item.decision ? `等待决策：${esc(item.decision)}` : `正在推进：${esc(item.currentTask)}`}</p><b>${item.decision ? '处理工作项 →' : '查看进度 →'}</b></div>
<div class="overview-drawer-grid"><div><small>计划 / 阶段</small><b>${esc(item.stage)}</b></div><div><small>当前批次</small><b>${esc(item.batch)}</b></div><div><small>预计完成</small><b>${esc(item.planned)}</b></div><div><small>实际运行</small><b>${esc(item.actual)}</b></div></div>
<div class="overview-drawer-section-title">任务列表</div>
<div class="overview-drawer-task-list">${item.tasks.map((task, index) => `<div class="overview-drawer-task ${task[2].includes('决策') ? 'warn' : ''}"><span>${index + 1}</span><div><b>${esc(task[0])}</b><small>${esc(task[1])}</small></div><em>${esc(task[2])}</em></div>`).join('')}</div>
<div class="overview-drawer-section-title">执行与验收</div>
${item.acceptance.map(line => `<div class="overview-drawer-line">${esc(line)}</div>`).join('')}
<div class="overview-drawer-section-title">停止策略</div>
<div class="overview-drawer-line">${esc(item.stopPolicy)}</div>
</div></div>`
  shell.onclick = event => { if (event.target === shell && window.closeOpsDrawer) window.closeOpsDrawer() }
  shell.querySelector('.ops-drawer').onclick = event => event.stopPropagation()
  requestAnimationFrame(() => shell.classList.add('open'))
}

function findWorkItemForTeamCard(card) {
  const project = card?.querySelector?.('.topo-team-project')?.textContent?.trim() || ''
  const team = card?.querySelector?.('.topo-team-name')?.textContent?.trim() || ''
  return OVERVIEW_WORK_ITEMS.find(item => item.project === project)
    || OVERVIEW_WORK_ITEMS.find(item => item.team === team)
    || OVERVIEW_WORK_ITEMS.find(item => item.decision)
    || OVERVIEW_WORK_ITEMS[0]
}

function openDrawerForTeamCard(card) {
  const item = findWorkItemForTeamCard(card)
  openOverviewWorkItemDrawer(item.id)
}

function installTeamDecisionDrawerHandler() {
  const root = document.getElementById('topologyHtml')
  if (!root || root.dataset.decisionDrawerBound === '1') return
  root.dataset.decisionDrawerBound = '1'
  root.addEventListener('click', event => {
    const target = event.target
    const card = target.closest?.('.topo-team-card')
    if (!card) return
    const hotspot = target.closest?.('.topo-focus-bar, .topo-leader-line.warning, .topo-master.online-warning')
    const text = hotspot?.textContent || target.textContent || ''
    if (!hotspot && !/待决策|阻塞|待处理/.test(text)) return
    event.preventDefault()
    event.stopPropagation()
    openDrawerForTeamCard(card)
  })
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
  window.openOverviewWorkItemDrawer = openOverviewWorkItemDrawer
  applyTypedActivityStream()
  setTimeout(installTeamDecisionDrawerHandler, 0)
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
      window.openOverviewWorkItemDrawer = openOverviewWorkItemDrawer
      if (typeof window.renderOverview === 'function') window.renderOverview()
      if (typeof window.renderTopology === 'function') window.renderTopology()
      applyTypedActivityStream()
      setTimeout(applyTypedActivityStream, 120)
      setTimeout(installTeamDecisionDrawerHandler, 160)
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
