const POOL_HTML = String.raw`
<div class="origin-chip-slot"></div>
<div class="pool-toolbar-row">
<div class="pool-group-tabs">
<div class="tab active" data-group-tab="team" onclick="switchWorkerGroupTab('team')" style="margin-bottom:-1px;">按团队分组</div>
<div class="tab" data-group-tab="status" onclick="switchWorkerGroupTab('status')" style="margin-bottom:-1px;">按加入状态</div>
</div>
<div class="filter-bar">
<input class="filter-input" id="searchWorkerInput" onkeyup="filterWorkers()" placeholder="搜索数字员工名称、岗位或运行态..." type="text"/>
<select class="filter-select" id="roleFilter" onchange="filterWorkers()">
<option value="all">全部岗位</option>
<option value="@explorer">协同规划岗（组长）</option>
<option value="@fixer">实现验证岗</option>
<option value="@oracle">系统架构师 / 技术专家岗</option>
<option value="@designer">交付审查岗</option>
</select>
<select class="filter-select" id="statusFilter" onchange="filterWorkers()">
<option value="all">所有状态</option>
<option value="unclaimed">🟡 待分配</option>
<option value="offline">⚫ 离线</option>
</select>
</div>
</div>
<!-- v0.6.27-skill: 员工页统计条 -->
<div class="docs-status-strip" style="margin-bottom:10px;"><span class="docs-status-pill active">工厂配置 / 数字员工实例</span><span class="docs-status-pill">由 AI 原生岗位模板实例化</span><span class="docs-status-pill">成员按任务单协作</span></div>
<div class="worker-stats-bar" id="workerStatsBar">
<span>总数: <strong id="statTotal">0</strong></span>
<span>在线: <strong id="statOnline">0</strong></span>
<span>忙碌: <strong id="statBusy">0</strong></span>
<span>技能总数: <strong id="statSkills">0</strong></span>
</div>
<div id="workerPoolContainer">
<!-- Rendered via JS -->
</div>
`

export function mountPoolPage() {
  const page = document.getElementById('page-pool')
  if (!page) return false
  if (page.dataset.featureMounted === 'pool') return true
  page.innerHTML = POOL_HTML
  page.dataset.featureMounted = 'pool'
  return true
}

export function createPoolPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-09',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-09'
      document.documentElement.dataset.enteringPage = feature.id
      mountPoolPage()
    },
    afterEnter() {
      mountPoolPage()
      if (typeof window.renderWorkerPool === 'function') window.renderWorkerPool()
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
