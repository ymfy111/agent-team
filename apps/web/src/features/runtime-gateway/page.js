const GATEWAYS = [
  {
    id: 'gw-prod-01',
    name: 'gw-prod-01',
    status: 'online',
    host: 'dev-host-01',
    endpoint: 'http://10.10.8.21:8080',
    heartbeat: '12 秒前',
    latency: '36 ms',
    registeredAt: '2026-05-28',
    uptime: '2天13小时',
    sandboxUsed: 8,
    sandboxTotal: 12,
    ocRunning: 6,
    teamCount: 3,
    cpu: 42,
    memory: 68,
    summary: 'Team 3 · 沙箱 8/12 · CPU 42%',
  },
  {
    id: 'gw-lab-02',
    name: 'gw-lab-02',
    status: 'degraded',
    host: 'lab-host-02',
    endpoint: 'http://10.10.8.36:8080',
    heartbeat: '2 分钟前',
    latency: '128 ms',
    registeredAt: '2026-05-25',
    uptime: '18小时',
    sandboxUsed: 6,
    sandboxTotal: 10,
    ocRunning: 2,
    teamCount: 1,
    cpu: 76,
    memory: 81,
    summary: 'Team 1 · 沙箱 6/10 · CPU 76%',
  },
  {
    id: 'gw-old-03',
    name: 'gw-old-03',
    status: 'offline',
    host: 'old-host-03',
    endpoint: 'http://10.10.7.18:8080',
    heartbeat: '30 分钟前',
    latency: '-',
    registeredAt: '2026-04-18',
    uptime: '已离线',
    sandboxUsed: 0,
    sandboxTotal: 8,
    ocRunning: 0,
    teamCount: 2,
    cpu: 0,
    memory: 0,
    summary: 'Team 2 · 沙箱 0/8 · 心跳超时',
  },
  {
    id: 'gw-free-04',
    name: 'gw-free-04',
    status: 'online',
    host: 'free-host-04',
    endpoint: 'http://10.10.9.11:8080',
    heartbeat: '8 秒前',
    latency: '22 ms',
    registeredAt: '2026-05-29',
    uptime: '3小时',
    sandboxUsed: 4,
    sandboxTotal: 6,
    ocRunning: 3,
    teamCount: 2,
    cpu: 18,
    memory: 31,
    summary: 'Team 2 · 沙箱 4/6 · CPU 18%',
  },
]

const SANDBOXES = [
  { id: 'p1-dev', gatewayId: 'gw-prod-01', status: 'running', employee: '孙悟空', team: '智能工厂研发组', oc: 'online', task: '实现用户认证模块', lastActive: '1 分钟前', tone: 'green' },
  { id: 'p2-dev', gatewayId: 'gw-prod-01', status: 'running', employee: '猪八戒', team: '智能工厂研发组', oc: 'online', task: '优化网关心跳检测', lastActive: '4 分钟前', tone: 'green' },
  { id: 'p3-qa', gatewayId: 'gw-prod-01', status: 'blocked', employee: '沙僧', team: '智能工厂研发组', oc: 'blocked', task: '修复接口返回 500', lastActive: '12 分钟前', tone: 'amber' },
  { id: 'p4-doc', gatewayId: 'gw-prod-01', status: 'idle', employee: '唐三藏', team: '低代码迁移组', oc: 'idle', task: '无', lastActive: '1 小时前', tone: 'blue' },
  { id: 'p5-reset', gatewayId: 'gw-prod-01', status: 'pending-reset', employee: '未绑定', team: '平台运维组', oc: 'stopped', task: '等待重新初始化', lastActive: '2 小时前', tone: 'gray' },
  { id: 'p6-free', gatewayId: 'gw-prod-01', status: 'available', employee: '未绑定', team: '未绑定', oc: '未启动', task: '可分配工位', lastActive: '-', tone: 'gray' },
  { id: 'lab-a1', gatewayId: 'gw-lab-02', status: 'running', employee: '需求分析岗', team: '低代码迁移组', oc: 'online', task: '梳理低代码迁移清单', lastActive: '3 分钟前', tone: 'green' },
  { id: 'lab-a2', gatewayId: 'gw-lab-02', status: 'running', employee: '测试验证岗', team: '低代码迁移组', oc: 'online', task: '补充 smoke 用例', lastActive: '9 分钟前', tone: 'green' },
  { id: 'free-a1', gatewayId: 'gw-free-04', status: 'running', employee: '平台巡检岗', team: '平台运维组', oc: 'online', task: '巡检运行网关状态', lastActive: '2 分钟前', tone: 'green' },
  { id: 'free-a2', gatewayId: 'gw-free-04', status: 'idle', employee: '文档维护岗', team: '平台运维组', oc: 'idle', task: '无', lastActive: '20 分钟前', tone: 'blue' },
]

const STATUS_META = {
  online: { label: 'online', color: 'green' },
  degraded: { label: 'degraded', color: 'amber' },
  offline: { label: 'offline', color: 'gray' },
  running: { label: 'running', color: 'green' },
  blocked: { label: 'blocked', color: 'amber' },
  idle: { label: 'idle', color: 'blue' },
  'pending-reset': { label: 'pending-reset', color: 'gray' },
  available: { label: 'available', color: 'gray' },
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
}

function getGateway(id) {
  return GATEWAYS.find((gateway) => gateway.id === id) || GATEWAYS[0]
}

function statusDot(status) {
  const tone = (STATUS_META[status] || {}).color || 'gray'
  return `<span class="rtg-dot rtg-dot-${tone}" aria-hidden="true"></span>`
}

function metricCard({ title, value, note, icon, tone }) {
  return `
    <article class="rtg-metric-card rtg-metric-${tone || 'blue'}">
      <div class="rtg-metric-icon">${escapeHTML(icon || '◇')}</div>
      <div class="rtg-metric-content">
        <div class="rtg-metric-title">${escapeHTML(title)}</div>
        <div class="rtg-metric-value">${escapeHTML(value)}</div>
        <div class="rtg-metric-note">${escapeHTML(note)}</div>
      </div>
    </article>`
}

function renderGatewayList(activeGatewayId) {
  return GATEWAYS.map((gateway) => {
    const isActive = gateway.id === activeGatewayId
    return `
      <button class="rtg-gateway-item ${isActive ? 'active' : ''} ${gateway.status === 'offline' ? 'is-offline' : ''}" data-gateway-id="${escapeHTML(gateway.id)}">
        <div class="rtg-gateway-main">
          <div>${statusDot(gateway.status)}<strong>${escapeHTML(gateway.name)}</strong></div>
          <span>${escapeHTML(gateway.heartbeat)}</span>
        </div>
        <div class="rtg-gateway-sub">${escapeHTML(gateway.status)} · ${escapeHTML(gateway.host)}</div>
        <div class="rtg-gateway-sub">${escapeHTML(gateway.summary)}</div>
      </button>`
  }).join('')
}

function getTeamsForGateway(gatewayId) {
  const teams = new Set(SANDBOXES.filter((sandbox) => sandbox.gatewayId === gatewayId).map((sandbox) => sandbox.team || '未绑定'))
  return ['全部 Team', ...Array.from(teams)]
}

function renderTeamFilters(gatewayId, activeTeam) {
  return getTeamsForGateway(gatewayId).map((team) => {
    const count = team === '全部 Team'
      ? SANDBOXES.filter((sandbox) => sandbox.gatewayId === gatewayId).length
      : SANDBOXES.filter((sandbox) => sandbox.gatewayId === gatewayId && sandbox.team === team).length
    return `<button class="rtg-filter-pill ${team === activeTeam ? 'active' : ''}" data-team="${escapeHTML(team)}">${escapeHTML(team)} ${count}</button>`
  }).join('')
}

function renderSandboxCards(gatewayId, activeTeam) {
  const items = SANDBOXES.filter((sandbox) => sandbox.gatewayId === gatewayId && (activeTeam === '全部 Team' || sandbox.team === activeTeam))
  return items.map((sandbox) => `
    <article class="rtg-sandbox-card">
      <div class="rtg-sandbox-head">
        <div>${statusDot(sandbox.status)}<strong>${escapeHTML(sandbox.id)}</strong></div>
        <span class="rtg-status-text rtg-status-${escapeHTML(sandbox.tone)}">${escapeHTML(sandbox.status)}</span>
      </div>
      <div class="rtg-sandbox-row"><span>员工</span><strong>${escapeHTML(sandbox.employee)}</strong></div>
      <div class="rtg-sandbox-row"><span>Team</span><strong>${escapeHTML(sandbox.team)}</strong></div>
      <div class="rtg-sandbox-row"><span>OC</span><strong>${escapeHTML(sandbox.oc)}</strong></div>
      <div class="rtg-sandbox-row"><span>任务</span><strong>${escapeHTML(sandbox.task)}</strong></div>
      <div class="rtg-sandbox-foot"><span>最近活动：${escapeHTML(sandbox.lastActive)}</span><button type="button">查看详情 →</button></div>
    </article>`).join('') || '<div class="rtg-empty">当前筛选下暂无沙箱。</div>'
}

function renderGatewayDetail(gatewayId, activeTeam = '全部 Team') {
  const gateway = getGateway(gatewayId)
  return `
    <section class="rtg-detail" data-active-gateway="${escapeHTML(gateway.id)}" data-active-team="${escapeHTML(activeTeam)}">
      <header class="rtg-detail-header">
        <div>
          <div class="rtg-title-row"><h2>${escapeHTML(gateway.name)}｜运行网关监控</h2><span class="rtg-state-badge">${statusDot(gateway.status)}${escapeHTML(gateway.status)}</span></div>
          <p>${escapeHTML(gateway.status)} · 最近心跳 ${escapeHTML(gateway.heartbeat)} · 延迟 ${escapeHTML(gateway.latency)} · ${escapeHTML(gateway.host)} · ${escapeHTML(gateway.endpoint)}</p>
        </div>
        <button class="rtg-dropdown" type="button">网关操作⌄</button>
      </header>
      <div class="rtg-metric-grid">
        ${metricCard({ title: '注册时间', value: gateway.registeredAt, note: '已登记为持久资源', icon: '▣', tone: 'blue' })}
        ${metricCard({ title: '运行时长', value: gateway.uptime, note: '自最近一次启动', icon: '◴', tone: 'green' })}
        ${metricCard({ title: '沙箱数量', value: `${gateway.sandboxUsed} / ${gateway.sandboxTotal}`, note: '已用 / 总容量', icon: '◇', tone: 'indigo' })}
        ${metricCard({ title: 'CPU / 内存', value: `${gateway.cpu}% / ${gateway.memory}%`, note: '资源负载监控', icon: '▣', tone: 'purple' })}
      </div>
      <div class="rtg-boundary-note">本页仅用于监控与穿透查看；Team 绑定网关、员工换沙箱、Skill/MCP/规则/记忆同步请在 Team / 数字员工页面完成。</div>
      <section class="rtg-filter-block">
        <div class="rtg-section-title">Team 筛选</div>
        <div class="rtg-filter-list">${renderTeamFilters(gateway.id, activeTeam)}</div>
      </section>
      <section class="rtg-sandbox-block">
        <div class="rtg-sandbox-title"><strong>沙箱 / OC 卡片</strong><span>卡片风格贴近员工卡；点击只穿透查看，不在此处改绑定。</span></div>
        <div class="rtg-sandbox-grid">${renderSandboxCards(gateway.id, activeTeam)}</div>
      </section>
      <div class="rtg-delete-rule">离线/删除规则：心跳异常只置灰，不自动消失；删除需手动触发，并检查 Team、沙箱、OC、数字员工绑定和历史运行记录。</div>
    </section>`
}

const RUNTIME_GATEWAY_CSS = `
  <style id="runtimeGatewayFeatureStyles">
    #page-runtime-gateway { background:#f6f8fc; min-height: calc(100vh - 96px); padding:0; }
    .rtg-page { color:#0f172a; }
    .rtg-page * { box-sizing:border-box; }
    .rtg-page-header { margin-bottom:18px; }
    .rtg-page-title { font-size:24px; font-weight:800; color:#0f172a; margin-bottom:6px; }
    .rtg-page-subtitle { color:#64748b; font-size:13px; line-height:1.6; }
    .rtg-shell { display:grid; grid-template-columns:320px minmax(0, 1fr); gap:20px; align-items:start; }
    .rtg-sidebar, .rtg-main { background:#fff; border:1px solid #dbe3ef; border-radius:18px; box-shadow:0 10px 24px rgba(15,23,42,.04); }
    .rtg-sidebar { padding:18px; min-height:720px; }
    .rtg-sidebar h3 { margin:4px 0 6px; font-size:18px; }
    .rtg-sidebar-desc { margin:0 0 14px; color:#64748b; font-size:12px; }
    .rtg-search { height:38px; border:1px solid #e2e8f0; background:#f8fafc; border-radius:10px; padding:0 12px; color:#94a3b8; display:flex; align-items:center; font-size:13px; margin-bottom:16px; }
    .rtg-gateway-list { display:grid; gap:12px; }
    .rtg-gateway-item { width:100%; text-align:left; border:1px solid #e2e8f0; background:#f8fafc; border-radius:14px; padding:14px 16px; cursor:pointer; color:#0f172a; }
    .rtg-gateway-item.active { border-color:#2563eb; background:#eef4ff; box-shadow:0 0 0 1px rgba(37,99,235,.08); }
    .rtg-gateway-item.is-offline { opacity:.64; background:#f1f5f9; }
    .rtg-gateway-main { display:flex; justify-content:space-between; gap:10px; align-items:center; font-size:13px; }
    .rtg-gateway-main div { display:flex; align-items:center; gap:9px; }
    .rtg-gateway-main strong { font-size:15px; }
    .rtg-gateway-main span { color:#64748b; font-size:12px; }
    .rtg-gateway-sub { margin-top:8px; padding-left:21px; color:#64748b; font-size:12px; line-height:1.25; }
    .rtg-sidebar-footer { margin-top:250px; display:flex; justify-content:space-between; gap:10px; border:1px solid #e2e8f0; background:#f8fafc; border-radius:12px; padding:12px 14px; color:#334155; font-size:13px; }
    .rtg-sidebar-footer span:last-child { color:#64748b; }
    .rtg-main { padding:22px; min-height:720px; }
    .rtg-detail-header { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:16px; }
    .rtg-title-row { display:flex; align-items:center; gap:12px; }
    .rtg-title-row h2 { margin:0; font-size:22px; }
    .rtg-detail-header p { margin:8px 0 0; color:#64748b; font-size:13px; }
    .rtg-state-badge { display:inline-flex; align-items:center; gap:7px; background:#dcfce7; color:#166534; border-radius:999px; padding:5px 12px; font-size:12px; font-weight:700; }
    .rtg-dropdown { border:1px solid #dbe3ef; background:#fff; border-radius:10px; padding:8px 14px; color:#334155; cursor:default; }
    .rtg-metric-grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:14px; margin-bottom:14px; }
    .rtg-metric-card { position:relative; display:flex; align-items:flex-start; gap:14px; min-height:112px; padding:16px 16px 14px; border:1px solid #dbe3ef; border-radius:14px; background:#fff; box-shadow:0 6px 18px rgba(15,23,42,.035); overflow:hidden; }
    .rtg-metric-card:before { content:''; position:absolute; left:0; top:14px; bottom:14px; width:4px; border-radius:4px; background:#2563eb; }
    .rtg-metric-green:before { background:#22c55e; }
    .rtg-metric-indigo:before { background:#6366f1; }
    .rtg-metric-purple:before { background:#8b5cf6; }
    .rtg-metric-icon { width:34px; height:34px; border-radius:12px; display:grid; place-items:center; background:#eff6ff; color:#2563eb; font-weight:800; }
    .rtg-metric-green .rtg-metric-icon { background:#dcfce7; color:#166534; }
    .rtg-metric-indigo .rtg-metric-icon { background:#eef2ff; color:#3730a3; }
    .rtg-metric-purple .rtg-metric-icon { background:#f3e8ff; color:#6b21a8; }
    .rtg-metric-title { color:#64748b; font-size:13px; margin-bottom:10px; }
    .rtg-metric-value { color:#0f172a; font-size:22px; font-weight:800; white-space:nowrap; }
    .rtg-metric-note { color:#94a3b8; font-size:12px; margin-top:4px; }
    .rtg-boundary-note { border:1px solid #dbeafe; background:#eff6ff; color:#1d4ed8; border-radius:12px; padding:10px 12px; font-size:12px; margin-bottom:16px; }
    .rtg-section-title { font-size:16px; font-weight:800; margin-bottom:10px; }
    .rtg-filter-list { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px; }
    .rtg-filter-pill { border:1px solid #dbe3ef; border-radius:999px; background:#fff; color:#334155; padding:7px 14px; font-size:13px; cursor:pointer; }
    .rtg-filter-pill.active { background:#2563eb; border-color:#2563eb; color:#fff; }
    .rtg-sandbox-title { display:flex; align-items:baseline; gap:12px; margin-bottom:12px; }
    .rtg-sandbox-title strong { font-size:16px; }
    .rtg-sandbox-title span { color:#64748b; font-size:12px; }
    .rtg-sandbox-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:14px; }
    .rtg-sandbox-card { border:1px solid #dbe3ef; background:#fff; border-radius:14px; padding:16px 16px 12px; min-height:158px; box-shadow:0 8px 20px rgba(15,23,42,.025); }
    .rtg-sandbox-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .rtg-sandbox-head div { display:flex; align-items:center; gap:8px; }
    .rtg-sandbox-head strong { font-size:16px; }
    .rtg-status-text { font-size:12px; font-weight:700; }
    .rtg-status-green { color:#059669; }
    .rtg-status-amber { color:#d97706; }
    .rtg-status-blue { color:#2563eb; }
    .rtg-status-gray { color:#64748b; }
    .rtg-sandbox-row { display:grid; grid-template-columns:56px minmax(0, 1fr); gap:8px; align-items:center; font-size:13px; line-height:1.75; }
    .rtg-sandbox-row span { color:#64748b; }
    .rtg-sandbox-row strong { color:#334155; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .rtg-sandbox-foot { margin-top:9px; display:flex; justify-content:space-between; gap:10px; align-items:center; color:#94a3b8; font-size:12px; }
    .rtg-sandbox-foot button { border:0; background:transparent; color:#64748b; font-size:12px; padding:0; cursor:default; }
    .rtg-delete-rule { margin-top:16px; border:1px solid #fed7aa; color:#9a3412; background:#fff7ed; border-radius:12px; padding:11px 13px; font-size:12px; }
    .rtg-empty { border:1px dashed #cbd5e1; border-radius:12px; padding:24px; color:#64748b; background:#f8fafc; grid-column:1/-1; text-align:center; }
    .rtg-dot { display:inline-block; width:10px; height:10px; border-radius:999px; vertical-align:-1px; }
    .rtg-dot-green { background:#10b981; }
    .rtg-dot-amber { background:#f59e0b; }
    .rtg-dot-blue { background:#3b82f6; }
    .rtg-dot-gray { background:#94a3b8; }
    @media (max-width: 1180px) { .rtg-shell { grid-template-columns:1fr; } .rtg-metric-grid, .rtg-sandbox-grid { grid-template-columns:repeat(2, minmax(0,1fr)); } .rtg-sidebar { min-height:auto; } .rtg-sidebar-footer { margin-top:16px; } }
  </style>`

function renderPage(activeGatewayId = 'gw-prod-01', activeTeam = '全部 Team') {
  const gateway = getGateway(activeGatewayId)
  return `
    ${RUNTIME_GATEWAY_CSS}
    <div class="rtg-page">
      <div class="rtg-page-header">
        <div class="rtg-page-title">运行网关</div>
        <div class="rtg-page-subtitle">网关运行状态监控 · 沙箱/OC 运行概览 · 默认全部 Team · 监控与穿透查看，不做绑定/解绑主操作</div>
      </div>
      <div class="rtg-shell">
        <aside class="rtg-sidebar">
          <h3>运行网关</h3>
          <p class="rtg-sidebar-desc">已注册网关台账，离线不自动消失</p>
          <div class="rtg-search">⌕ 搜索网关 / 主机 / Team</div>
          <div class="rtg-gateway-list">${renderGatewayList(gateway.id)}</div>
          <div class="rtg-sidebar-footer"><span>＋ 注册新网关</span><span>高级运维入口</span></div>
        </aside>
        <main class="rtg-main">${renderGatewayDetail(gateway.id, activeTeam)}</main>
      </div>
    </div>`
}

function installRuntimeGatewayInteractions(page) {
  page.querySelectorAll('.rtg-gateway-item').forEach((button) => {
    button.addEventListener('click', () => {
      const gatewayId = button.dataset.gatewayId || 'gw-prod-01'
      page.innerHTML = renderPage(gatewayId, '全部 Team')
      installRuntimeGatewayInteractions(page)
    })
  })
  page.querySelectorAll('.rtg-filter-pill').forEach((button) => {
    button.addEventListener('click', () => {
      const detail = page.querySelector('.rtg-detail')
      const gatewayId = detail?.dataset.activeGateway || 'gw-prod-01'
      const team = button.dataset.team || '全部 Team'
      page.innerHTML = renderPage(gatewayId, team)
      installRuntimeGatewayInteractions(page)
    })
  })
}

export function mountRuntimeGatewayPage() {
  const page = document.getElementById('page-runtime-gateway')
  if (!page) return false
  if (page.dataset.featureMounted === 'runtime-gateway') return true
  page.innerHTML = renderPage('gw-prod-01', '全部 Team')
  page.dataset.featureMounted = 'runtime-gateway'
  installRuntimeGatewayInteractions(page)
  return true
}

export function createRuntimeGatewayPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'runtime-gateway-v5',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'runtime-gateway-v5'
      document.documentElement.dataset.enteringPage = feature.id
      mountRuntimeGatewayPage()
    },
    afterEnter() {
      mountRuntimeGatewayPage()
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
