const SETTINGS_HTML = `
  <div class="page-title">设置</div>
  <div class="card" style="max-width: 600px;">
    <div class="card-body">
      <div class="data-row"><span class="data-label">注册中心版本</span><span class="data-value">v2.1.0</span></div>
      <div class="data-row"><span class="data-label">运行时长 (Uptime)</span><span class="data-value">1d 4h 23m</span></div>
      <div class="data-row"><span class="data-label">监听端口</span><span class="data-value">:4090</span></div>
      <div class="data-row"><span class="data-label">当前连接数</span><span class="data-value">12</span></div>
      <div class="data-row"><span class="data-label">心跳超时阈值</span><span class="data-value">30000ms</span></div>
      <div class="data-row" style="flex-direction:column; align-items:flex-start; gap:8px;">
        <span class="data-label">持久化文件路径</span>
        <div style="font-family:monospace; background:var(--bg-base); padding:8px; border-radius:4px; width:100%; font-size:12px; color:var(--text-primary); overflow-x:auto;">
          /data/live-state.json<br>
          /data/decisions-active.json
        </div>
      </div>
      <div class="data-row"><span class="data-label">最后 Checkpoint 时间</span><span class="data-value" id="settingsLastCheck">2026-04-22 10:15:33</span></div>
    </div>
  </div>
  <div class="settings-readonly-note" style="margin-top:16px; max-width:600px; padding:10px 12px; border:1px dashed var(--border); border-radius:8px; color:var(--text-secondary); font-size:12px; background:#fff;">
    设置页仅展示运行信息；数字员工模板和技能配置已拆分到左侧「岗位」「技能」菜单。
  </div>
`

export function mountSettingsPage() {
  const page = document.getElementById('page-settings')
  if (!page) return false
  if (page.dataset.featureMounted === 'settings') return true
  page.innerHTML = SETTINGS_HTML
  page.dataset.featureMounted = 'settings'
  return true
}

export function createSettingsPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-02',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-02'
      document.documentElement.dataset.enteringPage = feature.id
      mountSettingsPage()
    },
    afterEnter() {
      mountSettingsPage()
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
