/*
 * Generated from agent-team-v0.6.33.45-prototype.html
 * P0a structured no-build migration: legacy runtime split only.
 * Keep this file as a classic browser script so existing onclick/global functions remain available.
 * Minimal hardening: direct localStorage calls after safeStorage initialization are routed to safeStorage.
 */

(function(){
  if (window.__v063339TimerGuard) return;
  window.__v063339TimerGuard = true;
  var nativeSetTimeout = window.setTimeout.bind(window);
  var nativeClearTimeout = window.clearTimeout.bind(window);
  var nativeSetInterval = window.setInterval.bind(window);
  var nativeClearInterval = window.clearInterval.bind(window);
  var timers = [];
  window.__v063339NativeTimers = { setTimeout:nativeSetTimeout, clearTimeout:nativeClearTimeout, setInterval:nativeSetInterval, clearInterval:nativeClearInterval };
  function shouldBlockInterval(cb, delay){
    var s = '';
    try { s = String(cb || ''); } catch(e) { s = ''; }
    return delay && delay <= 15000 && /(renderOverview|refreshAllViews|enhanceOverviewStats|stabilizeOverview|runEnhance|setVersionV63328|renameVisibleExpert|patchAll|lightRefreshV21)/.test(s);
  }
  window.setTimeout = function(cb, delay){
    var args = Array.prototype.slice.call(arguments, 2);
    var id = nativeSetTimeout.apply(null, [cb, delay].concat(args));
    try { if ((delay || 0) <= 15000) timers.push({id:id, type:'timeout', delay:delay || 0}); } catch(e) {}
    return id;
  };
  window.setInterval = function(cb, delay){
    var args = Array.prototype.slice.call(arguments, 2);
    if (shouldBlockInterval(cb, delay || 0)) return 0;
    var id = nativeSetInterval.apply(null, [cb, delay].concat(args));
    try { timers.push({id:id, type:'interval', delay:delay || 0}); } catch(e) {}
    return id;
  };
  window.__v063339StopLegacyTimers = function(){
    timers.forEach(function(t){ try { (t.type === 'interval' ? nativeClearInterval : nativeClearTimeout)(t.id); } catch(e) {} });
    try {
      var probe = nativeSetTimeout(function(){}, 0);
      nativeClearTimeout(probe);
      var from = Math.max(1, probe - 6000), to = probe + 2000;
      for (var i = from; i <= to; i++) { nativeClearTimeout(i); nativeClearInterval(i); }
    } catch(e) {}
    window.setTimeout = nativeSetTimeout;
    window.clearTimeout = nativeClearTimeout;
    window.clearInterval = nativeClearInterval;
    window.setInterval = function(cb, delay){
      var args = Array.prototype.slice.call(arguments, 2);
      if (shouldBlockInterval(cb, delay || 0)) return 0;
      return nativeSetInterval.apply(null, [cb, delay].concat(args));
    };
    window.__v063339TimersStopped = true;
  };
})();


;


    // TODO v0.6: 统一改 addEventListener，参考新增的 origin-chip / topology 模式
    /* =========================================================================
       1. Utilities & Formatters
       ========================================================================= */
    const tsNow = Date.now();
    
    function escapeHTML(s) {
      return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    const safeStorage = (() => {
      const adapter = window.__agentTeamAdapters && window.__agentTeamAdapters.storage;
      if (adapter && typeof adapter.getItem === 'function') return adapter;
      try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return localStorage; }
      catch(e) { const m={}; return { getItem:k=>m[k]??null, setItem:(k,v)=>{m[k]=v;}, removeItem:k=>{delete m[k];} }; }
    })();
    
    function formatRelativeTime(ts) {
      if (!ts) return '未知';
      const diffSec = Math.floor((Date.now() - ts) / 1000);
      if (diffSec < 60) return `${diffSec}s 前`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m 前`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h 前`;
      return `${Math.floor(diffHour / 24)}d 前`;
    }

    function formatCountdown(ts) {
        if(!ts) return '';
        const diffMs = ts - Date.now();
        if(diffMs < 0) return '已过期';
        const diffMin = Math.floor(diffMs / 60000);
        return `${diffMin}min 后过期`;
    }

    
    const ROLE_MAP = {
      '@explorer': '探索者',
      '@fixer': '修复者',
      '@oracle': '决策者',
      '@librarian': '文献员',
      '@designer': '设计者'
    };
    function getRoleName(role) {
      return ROLE_MAP[role] || role;
    }
    // v0.6.4: 统一显示岗位名 — 优先 projectRole（业务可读，如"测试工程师"），
    // 兜底底层 role 名（如"探索者"）。样式仍按底层 role 着色，保持视觉一致。
    function getDisplayRole(w) {
      if (!w) return '';
      return (w.projectRole && w.projectRole.trim()) || getRoleName(w.role) || '';
    }

    function getShortProjectRole(w) {
      const label = getDisplayRole(w);
      if (label.includes('测试')) return '测试';
      if (label.includes('开发')) return '开发';
      if (label.includes('架构')) return '架构';
      if (label.includes('设计')) return '设计';
      if (label.includes('建模')) return '建模';
      return (w && w.name ? w.name : label || '').replace(/\d+(?:-\d+)?$/, '');
    }

    function getPersonaTone(workerOrTeam, isLeader = false) {
      const raw = String((isLeader ? workerOrTeam?.id : workerOrTeam?.id) || workerOrTeam?.name || '0');
      let sum = isLeader ? 1 : 0;
      for (const ch of raw) sum += ch.charCodeAt(0);
      return `tone-${sum % 5}`;
    }

    function getPersonaIndex(worker, fallback = '01') {
      const raw = String(worker?.id || worker?.name || fallback);
      const m = raw.match(/(\d+)(?!.*\d)/);
      return String(m ? m[1] : fallback).slice(-2).padStart(2, '0');
    }

    function getPersonaStatusClass(status) {
      if (status === 'offline') return 'status-offline';
      if (status === 'busy' || status === 'online') return 'status-busy';
      return 'status-idle';
    }

    function getPersonaAvatarSrc(status) {
      // Legacy fallback kept for older render paths. Root persona-avatar-*.png assets were removed;
      // all digital employee avatars now come from pic/avatars/. Status is expressed by UI dots/tags.
      var rel = 'pic/avatars/avatar-default.png';
      var isFileProtocol = window.location.protocol === 'file:';
      var inPrototypesDir = window.location.pathname.indexOf('/prototypes/') >= 0;
      if (isFileProtocol || inPrototypesDir) return './' + rel;
      return '/docs/prototypes/' + rel;
    }
    function getAvatarKey(status) {
      if (status === 'offline') return 'offline';
      if (status === 'busy' || status === 'online') return 'busy';
      return 'default';
    }

    function getPersonaRoleTitle(worker) {
      const label = getDisplayRole(worker);
      if (label.includes('测试')) return '测试工程师';
      if (label.includes('开发')) return '开发工程师';
      if (label.includes('架构')) return '架构师';
      if (label.includes('设计')) return '设计师';
      if (label.includes('建模')) return '建模师';
      return label || '数字员工';
    }

    function getPersonaMemberName(worker) {
      return worker?.name || getDisplayRole(worker) || '数字员工';
    }


    function getTeamCardWorkers(team) {
      const members = team.members || [];
      if (team.id !== 't1') return members;
      const preferred = ['测试', '开发', '架构'];
      return preferred
        .map(role => members.find(member => getShortProjectRole(member) === role))
        .filter(Boolean);
    }

    const STATUS_MAP = {
      'busy':      { label: '忙碌',  icon: '🟣', color: '#7c3aed' },
      'idle':      { label: '空闲',  icon: '🔵', color: '#1677ff' },
      'unclaimed': { label: '待分配', icon: '🟡', color: '#f59e0b' },
      'offline':   { label: '离线',  icon: '⚫', color: '#94a3b8' },
      'online':    { label: '在线',  icon: '🟢', color: '#10b981' },
      'healthy':   { label: '健康',  icon: '🟢', color: '#10b981' },
      'degraded':  { label: '降级',  icon: '🟡', color: '#f59e0b' }
    };
    function getStatusLabel(status) {
      return STATUS_MAP[status]?.label || status;
    }
    function getStatusIcon(status) {
      return STATUS_MAP[status]?.icon || '⚪';
    }
    function getStatusColor(status) {
      return STATUS_MAP[status]?.color || '#94a3b8';
    }

    function getRoleClass(role) {
      if (!role) return '';
      return role.replace('@', '');
    }

    /* ---------- v0.6.0 项目相关工具 ---------- */
    const PROJECT_STAGE_LABEL = {
      discovery: '立项', design: '设计', build: '开发',
      test: '测试', release: '发布', archived: '归档'
    };
    const DOC_STATUS_LABEL = {
      draft:'草稿', in_review:'评审中', approved:'已批准',
      in_execution:'实施中', done:'已完成', archived:'已归档',
      blocked:'阻塞', rejected:'已退回'
    };
    const DOC_CATEGORY_LABEL = {
      specs:'specs', plans:'plans', decisions:'decisions',
      reports:'reports', notes:'notes'
    };
    function getStageLabel(s) { return PROJECT_STAGE_LABEL[s] || s || '-'; }
    function getDocStatusLabel(s) { return DOC_STATUS_LABEL[s] || s || '-'; }
    function summarizeDocs(docs) {
      const out = { total: 0, byStatus: {}, byCategory: {} };
      (docs || []).forEach(d => {
        out.total++;
        out.byStatus[d.status] = (out.byStatus[d.status] || 0) + 1;
        out.byCategory[d.category] = (out.byCategory[d.category] || 0) + 1;
      });
      return out;
    }

    function handleCopyContext() {
      const btn = document.getElementById('copyContextBtn');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 已复制`;
      setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
    }

    /* =========================================================================
       2. Mock Data State
       ========================================================================= */
    const baseState = (() => {
      const provider = window.__agentTeamDataProvider;
      if (!provider || typeof provider.createBaseState !== 'function') {
        throw new Error('P0b.1 data provider is not loaded: src/data/mock-state.js');
      }
      return provider.createBaseState({ tsNow });
    })();

    const prototypeStore = (() => {
      const store = window.__agentTeamPrototypeStore;
      if (!store || typeof store.init !== 'function') {
        throw new Error('P0b.3 prototype store is not loaded: src/adapters/prototype-store.js');
      }
      return store;
    })();

    let currentState = prototypeStore.init(baseState); 
    let isNetworkDisconnected = false;
    let currentSelectedDecisionId = null;

    function updateState(patch, opts = {}) {
      currentState = prototypeStore.patchState(patch);
      if (opts.refresh !== false) refreshAllViews();
    }

    const safeSessionStorage = (() => {
      const adapter = window.__agentTeamAdapters && window.__agentTeamAdapters.sessionStorage;
      if (adapter && typeof adapter.getItem === 'function') return adapter;
      try { sessionStorage.setItem('__t','1'); sessionStorage.removeItem('__t'); return sessionStorage; }
      catch(e) { const m={}; return { getItem:k=>m[k]??null, setItem:(k,v)=>{m[k]=v;}, removeItem:k=>{delete m[k];} }; }
    })();

    function setNavOrigin(origin) {
      safeSessionStorage.setItem('navOrigin', JSON.stringify(origin));
    }

    function getNavOrigin() {
      try {
        const raw = safeSessionStorage.getItem('navOrigin');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        safeSessionStorage.removeItem('navOrigin');
        return null;
      }
    }

    function getActiveOriginChipSlot() {
      const activePage = document.querySelector('.page.active');
      if (!activePage) return null;
      const isTargetPage = activePage.id === 'page-pool' || activePage.id.startsWith('page-team-');
      return isTargetPage ? activePage.querySelector('.origin-chip-slot') : null;
    }

    function renderOriginChip() {
      document.querySelectorAll('.origin-chip-slot').forEach(slot => { slot.innerHTML = ''; });
      const origin = getNavOrigin();
      const slot = getActiveOriginChipSlot();
      if (!origin || !slot) return;
      const label = escapeHTML(origin.label || '来源页');
      const target = escapeHTML(origin.target || '-');
      slot.innerHTML = `
        <div class="origin-chip" data-action="back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span class="origin-chip-text">来自 ${label} · ${target}</span>
        </div>
      `;
    }

    function goBackToOrigin() {
      safeSessionStorage.removeItem('navOrigin');
      renderOriginChip();
      switchNav('overview');
    }

    function navigateFromTopologyToTeam(teamId, originTarget) {
      setNavOrigin({ from: 'overview-topology', label: '协作全景', target: originTarget });
      openTeamTab(teamId);
    }

    function navigateFromTopologyToWorker(workerName) {
      setNavOrigin({ from: 'overview-topology', label: '协作全景', target: workerName });
      switchNav('pool');
      const searchInput = document.getElementById('searchWorkerInput');
      if (searchInput) searchInput.value = workerName;
      filterWorkers();
    }

    document.addEventListener('click', (event) => {
      const originChip = event.target.closest('.origin-chip[data-action="back"]');
      if (originChip) {
        goBackToOrigin();
        return;
      }

      const topoNode = event.target.closest('.topo-node[data-action]');
      if (!topoNode) {
        // v0.6.4: 点击协作全景空白处 → 团队动态切回"全部"
        const topoArea = event.target.closest('#topologyHtml');
        if (topoArea) {
          filterActivityByTeam(null);
        }
        return;
      }

      const action = topoNode.dataset.action;
      if (action === 'open-team') {
        // v0.6.4: 点 Leader 管理节点 → 弹出右滑抽屉（与组员一致）
        const teamId = topoNode.dataset.teamId;
        if (teamId) {
          openLeaderDrawer(teamId);
        }
      } else if (action === 'open-worker') {
        // v0.5.5+: 打开右滑抽屉，而不是跳转到 Pool
        openDrawer(null, topoNode.dataset.workerName);
      }
    });

    /* =============================================================
       v0.6.4: 消息通知浮层
       ============================================================= */
    const MOCK_NOTIFICATIONS = [
      { icon: '⚠️', iconBg: '#fef3c7', iconColor: '#d97706', title: '测试1-1 上报：依赖树发现循环引用', meta: '研发一组 · 1m 前', unread: true },
      { icon: '✅', iconBg: '#d1fae5', iconColor: '#059669', title: '开发1-1 完成任务：用户模块重构', meta: '研发一组 · 4m 前', unread: true },
      { icon: '📋', iconBg: '#dbeafe', iconColor: '#2563eb', title: '架构2-1 提交决策请求：方案性能差异<5%', meta: '研发二组 · 7m 前', unread: true },
      { icon: '🔄', iconBg: '#f3e8ff', iconColor: '#7c3aed', title: '设计1-1 提交了 3 个组件视觉规范', meta: '研发一组 · 12m 前', unread: false },
      { icon: '🚨', iconBg: '#fee2e2', iconColor: '#dc2626', title: '目标仓库访问权限不足，需人工授权', meta: '研发五组 · 15m 前', unread: false },
    ];

    function toggleNotifPopover() {
      const popover = document.getElementById('notifPopover');
      if (!popover) return;
      const willOpen = !popover.classList.contains('open');
      popover.classList.toggle('open', willOpen);
      if (willOpen) renderNotifications();
    }

    function renderNotifications() {
      const body = document.getElementById('notifBody');
      if (!body) return;
      if (MOCK_NOTIFICATIONS.length === 0) {
        body.innerHTML = '<div class="notif-empty">暂无新消息</div>';
        return;
      }
      body.innerHTML = MOCK_NOTIFICATIONS.map(n => `
        <div class="notif-item" style="${n.unread ? 'background:#f8fafc;' : ''}">
          <div class="notif-item-icon" style="background:${n.iconBg};color:${n.iconColor};">${n.icon}</div>
          <div class="notif-item-body">
            <div class="notif-item-title">${n.title}</div>
            <div class="notif-item-meta">${n.meta}</div>
          </div>
        </div>
      `).join('');
    }

    function markAllNotifRead() {
      MOCK_NOTIFICATIONS.forEach(n => n.unread = false);
      const dot = document.getElementById('notifDot');
      if (dot) dot.style.display = 'none';
      renderNotifications();
    }

    // 点击外部关闭 notif popover
    document.addEventListener('click', function(e) {
      const popover = document.getElementById('notifPopover');
      const btn = document.getElementById('notifBtn');
      if (!popover || !popover.classList.contains('open')) return;
      if (popover.contains(e.target) || (btn && btn.contains(e.target))) return;
      popover.classList.remove('open');
    });

    function handleMockScenario(value) {
      if (!value) return;
      try {
        switch (value) {
          case 'normal':
          case 'master_offline':
          case 'team_degraded':
          case 'decision_expired':
            mockToggleState(value); break;
          case 'network': mockToggleNetwork(); break;
          case 'loading': mockToggleLoading(); break;
        }
      } catch (e) {
        console.warn('[mock]', value, e);
      } finally {
        const sel = document.getElementById('mockScenarioSelect');
        if (sel) sel.value = '';  // 兜底重置占位项，便于再次触发
      }
    }

    function mockToggleState(mode) {
        // TODO: 存量状态重置尚未迁移到 updateState 入口
        currentState = prototypeStore.resetState(baseState);
        document.getElementById('teamDegradedBanner').style.display = 'none';

        if(mode === 'master_offline') {
            currentState.teams[0].masterStatus = 'offline';
            currentState.teams[0].healthy = false;
        } else if (mode === 'team_degraded') {
            currentState.teams[0].healthy = false;
            currentState.teams[0].members[0].status = 'offline';
            currentState.teams[0].members[0].offlineSince = tsNow - 300000;
            document.getElementById('teamDegradedBanner').style.display = 'block';
            document.getElementById('teamDegradedBanner').innerText = '⚠️ Team 异常：研发一组 的 测试1-1 已离线';
        } else if (mode === 'decision_expired') {
            currentState.decisions[0].expiresAt = tsNow - 10000;
            currentState.decisions[0].status = 'expired';
            currentSelectedDecisionId = currentState.decisions[0].id;
        }
        
        refreshAllViews();
    }

    function mockToggleNetwork() {
      isNetworkDisconnected = !isNetworkDisconnected;
      const banner = document.getElementById('networkErrorBanner');
      const dot = document.getElementById('pollingDot');
      const text = document.getElementById('pollingText');
      
      if (isNetworkDisconnected) {
        banner.style.display = 'block';
        dot.style.background = 'var(--danger)';
        dot.style.animation = 'none';
        text.innerText = '连接断开';
        document.getElementById('decisionAlertBanner').style.display = 'none';
      } else {
        banner.style.display = 'none';
        dot.style.background = 'var(--success)';
        text.innerText = '已连接 (轮询 3s)';
        renderDecisions(); // re-evaluate alert banner
      }
    }

    function mockToggleLoading() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById('loadingPage').classList.add('active');
        setTimeout(() => {
            switchNav('overview');
        }, 1500);
    }

    /* =========================================================================
       3. Render Logic
       ========================================================================= */

    function refreshAllViews() {
        renderSidebar();
        renderOverview();
        renderTeamCards();
        renderProjects();
        renderWorkerPool();
        renderRolesPage();
        renderSkillTable();
        renderSkillStudio();
        updateWorkerStats();
        renderDecisions();
        populateTeamFilters();
        
        // If a team tab is open, refresh it
        const activeTab = document.querySelector('.tab.active');
        if(activeTab && activeTab.dataset.tabTarget && activeTab.dataset.tabTarget.startsWith('team-')) {
            const teamId = activeTab.dataset.tabTarget.split('-')[1];
            renderTeamDetailLeftPanel(teamId);
        }
        renderOriginChip();
    }

    function renderSidebar() {
        // Sidebar simplified, secondary lists removed
    }

    function renderOverview() {
        // 在线员工：teams.members 在线 + workers 池非 offline
        const teamMembersOnline = currentState.teams.reduce((acc, t) => acc + t.members.filter(m=>m.status!=='offline').length, 0);
        const poolOnline = currentState.workers.filter(w=>w.status!=='offline').length;
        const teamMembersTotal = currentState.teams.reduce((acc, t) => acc + t.members.length, 0);
        const poolTotal = currentState.workers.length;
        const totalMembers = teamMembersTotal + poolTotal;
        const onlineMembers = teamMembersOnline + poolOnline;
        const offlineMembers = totalMembers - onlineMembers;
        document.getElementById('statMasterCount').innerText = onlineMembers;
        document.getElementById('statMasterDesc').innerText = `${totalMembers} 总 / ${offlineMembers} 离线`;

        // 活跃团队
        document.getElementById('statTeamCount').innerText = currentState.teams.length;
        const degraded = currentState.teams.filter(t=>!t.healthy || t.masterStatus==='offline').length;
        document.getElementById('statTeamDesc').innerText = degraded === 0 ? '全部正常运行' : `${degraded} 个降级`;

        // 任务吞吐 mock 142
        // (statWorkerCount 已在 HTML 内默认 142)

        // 待决策
        const pendingDecisions = currentState.decisions.filter(d=>d.status==='pending');
        document.getElementById('statDecisionCount').innerText = pendingDecisions.length;
        if (pendingDecisions.length > 0) {
            const earliest = Math.min(...pendingDecisions.map(d=>d.timeTs));
            document.getElementById('statDecisionDesc').innerText = `最早 ${formatRelativeTime(earliest)}`;
        } else {
            document.getElementById('statDecisionDesc').innerText = '暂无待决策';
        }

        // Gather activities (v0.5.5: 携带 teamId 以支持过滤)
        let activities = [];
        currentState.teams.forEach(t => {
            t.activities.forEach(a => activities.push({...a, teamId: t.id, teamName: t.name}));
        });
        activities.sort((a,b) => b.time - a.time);
        // 缓存到全局供过滤使用
        currentActivityList = activities;

        renderActivityTeamTabs();
        renderActivityStream();

        renderTopology();
    }

    // v0.5.5: 当前团队动态过滤状态
    let currentActivityFilter = 'all';
    let currentActivityList = [];

    function renderActivityTeamTabs() {
        const tabs = document.getElementById('activityTeamTabs');
        if (!tabs) return;
        const teamCounts = {};
        currentActivityList.forEach(a => {
            teamCounts[a.teamId] = (teamCounts[a.teamId] || 0) + 1;
        });
        let html = `<div class="activity-team-tab ${currentActivityFilter === 'all' ? 'active' : ''}" data-filter="all">全部 (${currentActivityList.length})</div>`;
        currentState.teams.forEach(t => {
            const count = teamCounts[t.id] || 0;
            html += `<div class="activity-team-tab ${currentActivityFilter === t.id ? 'active' : ''}" data-filter="${t.id}">${escapeHTML(t.name)} (${count})</div>`;
        });
        if (teamCounts['unassigned']) {
            html += `<div class="activity-team-tab ${currentActivityFilter === 'unassigned' ? 'active' : ''}" data-filter="unassigned">未分配 (${teamCounts['unassigned']})</div>`;
        }
        tabs.innerHTML = html;
        tabs.querySelectorAll('.activity-team-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                filterActivityByTeam(tab.dataset.filter);
            });
        });
    }

    function renderActivityStream() {
        const stream = document.getElementById('overviewActivityStream');
        if (!stream) return;
        const filtered = currentActivityFilter === 'all'
            ? currentActivityList
            : currentActivityList.filter(a => a.teamId === currentActivityFilter);
        if (filtered.length === 0) {
            stream.innerHTML = `<div style="color:var(--text-muted); font-size:13px; padding:20px 0; text-align:center;">该团队暂无动态</div>`;
            return;
        }
        stream.innerHTML = filtered.slice(0, 10).map(a => `
            <div class="activity-item">
                <div class="activity-time">${formatRelativeTime(a.time)} - ${escapeHTML(a.teamName)}</div>
                <div class="activity-content">${a.desc}</div>
            </div>
        `).join('');
    }

    // v0.5.5: 拓扑图 Master 点击联动事件流过滤
    function filterActivityByTeam(teamId) {
        currentActivityFilter = teamId || 'all';
        renderActivityTeamTabs();
        renderActivityStream();
    }

    function renderTopology() {
        const host = document.getElementById('topologyHtml');
        if (!host) return;
        const teams = currentState.teams;

        // 团队卡片 HTML
        const cardsHtml = teams.map(t => {
            const masterCls = t.masterStatus === 'offline'
              ? 'offline'
              : (t.healthy ? 'online-healthy' : 'online-warning');
            const members = getTeamCardWorkers(t);
            const workersHtml = members.map(m => {
                const sCls = (m.status === 'idle' || m.status === 'busy' || m.status === 'offline') ? m.status : 'offline';
                const tip = `${m.name} · ${getDisplayRole(m) || ''} · ${getStatusLabel(m.status)}`;
                return `<div class="topo-worker topo-node ${sCls}"
                          data-action="open-worker"
                          data-worker-name="${escapeHTML(m.name)}"
                          data-master="${escapeHTML(t.name)}"
                          title="${escapeHTML(tip)}">
                          <span class="persona-avatar worker ${getPersonaTone(m)} ${getPersonaStatusClass(m.status)}"><img class="persona-avatar-img" src="${getWorkerAvatarSrc(m)}" alt="" loading="lazy"><span class="persona-status-dot ${sCls}"></span></span>
                          <span class="topo-worker-text"><span class="topo-worker-name">${escapeHTML(getPersonaMemberName(m))}</span><span class="topo-worker-role">${escapeHTML(getPersonaRoleTitle(m))}</span></span>
                        </div>`;
            }).join('');

            return `<div class="topo-team-card" data-team-id="${escapeHTML(t.id)}">
              <div class="topo-team-header">
                <div class="topo-team-titlewrap">
                  <span class="topo-team-name">${escapeHTML(t.name)}</span>
                  ${t.currentProject
                    ? `<div class="topo-team-projectline"><span class="topo-team-project" title="${escapeHTML(t.currentProject.name)}">${escapeHTML(t.currentProject.name)}</span><span class="stage-badge stage-${t.currentProject.stage}">${escapeHTML(getStageLabel(t.currentProject.stage))}</span></div>`
                    : `<div class="topo-team-projectline"><span class="topo-team-noproj">未绑定项目</span></div>`}
                </div>
                <span class="topo-team-enter" onclick="openTeamTab('${escapeHTML(t.id)}')">→ 详情</span>
              </div>
               <div class="topo-master topo-node ${masterCls}"
                    data-action="open-team"
                    data-team-id="${escapeHTML(t.id)}"
                    data-origin-target="${escapeHTML(t.name)}"
                    data-master="${escapeHTML(t.name)}"
                    title="${escapeHTML(t.masterCodename || '')} · 团队负责人 · 点击查看团队">
                 <span class="persona-avatar ${getPersonaTone(t, true)} ${getPersonaStatusClass(t.masterStatus === 'offline' ? 'offline' : 'busy')}"><img class="persona-avatar-img" src="${getLeaderAvatarSrc(t)}" alt="" loading="lazy"><span class="persona-status-dot ${t.masterStatus === 'offline' ? 'offline' : 'busy'}"></span></span>
                 <span class="persona-main">
                   <span class="persona-name-row"><span class="topo-master-name">${escapeHTML(t.masterCodename || '')}</span><span class="persona-role-tag">组长</span></span>
                   <span class="persona-task">任务协调 / 决策把关</span>
                 </span>
                 <button class="topo-node-action" title="与 ${escapeHTML(t.masterCodename || 'Leader')} 对话" onclick="event.stopPropagation(); openChatWith('${escapeHTML(t.masterId || t.id)}')">
                   <span aria-hidden="true">💬</span><span>对话</span>
                 </button>
               </div>
               <div class="topo-workers">${workersHtml}</div>
             </div>`;
        }).join('');
        host.innerHTML = cardsHtml;

        // 待分配池（沿用原有 HTML 容器）
        const unclaimed = currentState.workers.filter(w => w.status === 'unclaimed' || w.status === 'offline');
        const poolEl = document.getElementById('unassignedPoolHtml');
        if (unclaimed.length > 0) {
            poolEl.style.display = 'block';
            poolEl.querySelector('.pool-title').textContent = `待分配（${unclaimed.length}）`;
            poolEl.querySelector('.pool-nodes').innerHTML = unclaimed.map(w => {
                const isOffline = w.status === 'offline';
                const cls = isOffline ? 'offline' : 'unclaimed';
                return `<div class="pool-node ${cls} topo-node" data-action="open-worker" data-worker-name="${escapeHTML(w.name)}" title="${escapeHTML(w.name)} · ${escapeHTML(getRoleName(w.role) || '')} · ${escapeHTML(getStatusLabel(w.status))}">${escapeHTML(w.name)}</div>`;
            }).join('');
        } else {
            poolEl.style.display = 'none';
        }

        // hover 联动高亮
        // v0.6.4 修订：绑在 team-card 上而非节点，避免节点间隙触发的闪动
        // hover 整张卡片 → 其他卡片变暗；单节点不再单独高亮
        const scope = host.parentElement; // .topo-scroll-area，含池
        const allCards = scope.querySelectorAll('.topo-team-card');
        allCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                allCards.forEach(other => {
                    if (other !== card) other.classList.add('dimmed');
                });
            });
            card.addEventListener('mouseleave', () => {
                allCards.forEach(other => other.classList.remove('dimmed'));
            });
        });
    }

    function renderTeamCards() {
      const container = document.getElementById('teamCardsContainer');
      let html = '';
      if (currentState.teams.length === 0) {
        html = `
          <div style="grid-column: 1/-1" class="empty-state">
            <div class="empty-state-icon">
              <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 2H15a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"></path><path d="M4 7h16v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"></path></svg>
            </div>
            <h3>暂无运行中的 Team</h3>
            <p>Team 由主智能体注册自动创建。请先启动主智能体。</p>
          </div>`;
      } else {
        html = currentState.teams.map(t => {
          let statusClass = t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'healthy' : 'degraded');
          let cardClass = t.healthy ? '' : 'degraded';
          let titlePrefix = t.masterStatus === 'offline' ? `<span class="status-dot offline"></span> ${escapeHTML(t.masterCodename || 'Leader')} 离线 ` : `<span class="status-dot ${statusClass}"></span> `;

          // v0.6.0: 当前项目摘要
          const proj = t.currentProject;
          let projectBlock = '';
          if (proj) {
            const ds = summarizeDocs(proj.docs);
            const approved = ds.byStatus['approved'] || 0;
            projectBlock = `
              <div style="margin: 12px 0 0; padding-top:12px; border-top:1px dashed var(--border);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:6px;">📦 当前项目 <span class="health-dot health-${proj.health}" title="健康度：${proj.health}"></span></div>
                <div style="font-size:14px; font-weight:600; color:var(--text-primary); margin-bottom:6px;">${escapeHTML(proj.name)}</div>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  <span class="stage-badge stage-${proj.stage}">${escapeHTML(getStageLabel(proj.stage))}</span>
                  ${proj.codeRepo ? `<span class="repo-chip" title="${escapeHTML(proj.codeRepo.url)}">📁 代码 ${proj.codeRepo.commits}</span>` : ''}
                  ${proj.modelRepo ? `<span class="repo-chip" title="${escapeHTML(proj.modelRepo.url)}">🧩 模型 ${escapeHTML(proj.modelRepo.version)}</span>` : ''}
                  <span class="doc-chip" title="共 ${ds.total} 篇文档，${approved} 已批准">📄 ${ds.total}/${approved}</span>
                </div>
              </div>`;
          }

          return `
          <div class="card ${cardClass}" onclick="openTeamTab('${t.id}')">
            <div class="card-header">
              <div class="card-title">
                ${titlePrefix} ${t.name}
              </div>
              <div class="card-actions" onclick="event.stopPropagation();">
                ${t.pendingDecisions > 0 ? `<span class="badge" style="margin:0; background:#F59E0B;">${t.pendingDecisions} 待决</span>` : ''}
                <button class="icon-btn" title="打开监控" onclick="event.stopPropagation(); openTeamTab('${t.id}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </button>
                <button class="icon-btn" title="更多" onclick="event.stopPropagation(); openTeamMore('${t.id}', this)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="data-row"><span class="data-label">Leader 状态</span><span class="status-badge ${statusClass}">${getStatusIcon(statusClass)} ${escapeHTML(getStatusLabel(statusClass))}</span></div>
              <div class="data-row"><span class="data-label">当前任务</span><span class="data-value" style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${t.task}">${t.task || '无任务'}</span></div>
              <div class="data-row"><span class="data-label">最近活动</span><span class="data-value" style="font-size:12px; font-weight:normal;">${formatRelativeTime(t.lastActivity)}</span></div>
              <div class="data-row"><span class="data-label">在线员工</span><span class="data-value">${t.members.filter(m=>m.status!=='offline').length} / ${t.members.length}</span></div>
              ${projectBlock}
            </div>
          </div>
        `}).join('');
      }
      
      if(container)       container.innerHTML = html;
    }

    /* v0.6.2 · 项目索引：从 teams[].currentProject 聚合生成 */
    function renderProjects() {
      const tbody = document.getElementById('projectsTableBody');
      if (!tbody) return;

      // 聚合：一团队一活跃项目（v0.6.x 业务前提）
      const rows = currentState.teams
        .filter(t => t.currentProject)
        .map(t => ({ team: t, proj: t.currentProject }));

      // 统计
      const totalEl = document.getElementById('projectsTotalCount');
      const teamCntEl = document.getElementById('projectsTeamCount');
      if (totalEl) totalEl.textContent = rows.length;
      if (teamCntEl) teamCntEl.textContent = rows.length;

      if (rows.length === 0) {
        tbody.innerHTML = `<tr class="empty"><td colspan="7">暂无进行中的项目</td></tr>`;
        return;
      }

      // 外链图标
      const iconExt = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
      const iconDoc = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;

      tbody.innerHTML = rows.map(({team, proj}) => {
        const statusClass = team.masterStatus === 'offline' ? 'offline'
                          : (proj.health === 'healthy' ? 'healthy' : 'degraded');
        const HEALTH_LABEL = { healthy: '健康', warning: '告警', degraded: '告警', critical: '严重', unknown: '未知' };
        const statusLabel = team.masterStatus === 'offline' ? 'Leader 离线'
                          : (HEALTH_LABEL[proj.health] || proj.health || '-');
        const stageLabel = getStageLabel(proj.stage);

        // 代码链接
        const codeUrl = proj.codeRepo && proj.codeRepo.url ? `https://${proj.codeRepo.url}` : null;
        const codeCell = codeUrl
          ? `<a class="proj-link" href="${escapeHTML(codeUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="${escapeHTML(proj.codeRepo.url)} · ${proj.codeRepo.commits || 0} 次提交">${iconExt}<span>代码</span></a>`
          : `<span class="proj-link disabled">${iconExt}<span>—</span></span>`;

        // 文档：跳到团队详情页的「项目文档」tab
        const docCount = (proj.docs || []).length;
        const docCell = docCount > 0
          ? `<a class="proj-link" href="javascript:void(0)" onclick="event.stopPropagation(); openTeamProjectDocs('${team.id}')" title="共 ${docCount} 篇文档">${iconDoc}<span>文档 ${docCount}</span></a>`
          : `<span class="proj-link disabled">${iconDoc}<span>—</span></span>`;

        // 最近更新：取项目最新文档时间 或 团队最后活动时间
        const latestDocTs = (proj.docs || []).reduce((m, d) => Math.max(m, d.updatedTs || 0), 0);
        const lastTs = Math.max(latestDocTs, team.lastActivity || 0, proj.codeRepo?.lastCommitTs || 0);
        const lastTimeTxt = lastTs ? formatRelativeTime(lastTs) : '-';

        return `
          <tr>
            <td>
              <span class="proj-name" onclick="openTeamTab('${team.id}')" title="打开团队详情">${escapeHTML(proj.name)}</span>
              <span class="proj-stage">${escapeHTML(stageLabel)}</span>
            </td>
            <td>${codeCell}</td>
            <td>${docCell}</td>
            <td><span class="proj-team" onclick="openTeamTab('${team.id}')">${escapeHTML(team.name)}</span></td>
            <td><span class="proj-status"><span class="status-dot ${statusClass}"></span>${escapeHTML(statusLabel)}</span></td>
            <td class="proj-leader">${escapeHTML(team.masterCodename || '-')}</td>
            <td class="proj-time">${escapeHTML(lastTimeTxt)}</td>
          </tr>`;
      }).join('');
    }

    /* v0.6.2 · 打开团队详情并切到「项目文档」tab */
    function openTeamProjectDocs(teamId) {
      openTeamTab(teamId);
      // 延迟等 team detail page 挂载完成
      setTimeout(() => { switchTeamTab(teamId, 'docs'); }, 50);
    }

    function toggleRoleGroup(role) {
      const g = document.getElementById('role-group-' + role);
      if(g) g.classList.toggle('collapsed');
    }

    function filterWorkers() { renderWorkerPool(); }
    function switchWorkerGroupTab(mode) {
      document.querySelectorAll('[data-group-tab]').forEach(el => el.classList.remove('active'));
      document.querySelector(`[data-group-tab="${mode}"]`)?.classList.add('active');
      renderWorkerPool();
    }

    

// === 数字员工模板与 Skill 配置 (v0.6.30) ===
let selectedSkillId = 'sct-to-customer-table';
const defaultSkillMarkdown = `# SCT 明细转换为客户化报价表

## 目标
把一个 SCT 或 BOM 明细区域，整理成客户化报价配置表。

## 输出要求

最终只输出 Markdown 表格，不要解释。表头固定为：

| 序号 | 部件编码 | 型号 | 产品描述 | 配置参数 | 数量 | 单位 | 单价 | 总价 | 页码 | 备注 |
|---|---|---|---|---|---:|---|---:|---:|---|---|

## 解析规则

1. 自动识别明细表头，例如：序号、部件编码、型号、描述、总数。
2. 产品描述保留关键规格、容量、接口、数量、服务等信息。
3. 配置参数默认留空，除非输入中明确给出客户化参数。
4. 数量必须来自明细行本身，不得平均分摊，也不得把多个硬盘型号合并。
5. 遇到项目总价、projectTotalPrice 或 </table> 视为明细结束。

## 质量检查

- 不编造不存在的物料。
- 不把图片、空行、HTML 噪声作为物料行。
- 同一物料多次出现时，保留原始行顺序。
`;
const skills = [
  { id: 'sct-to-customer-table', name: 'sct-to-customer-table', version: '0.1.0', description: '将 SCT/BOM 明细转换为客户化报价配置表。', content: defaultSkillMarkdown, mdContent: defaultSkillMarkdown, enabled: true, scope: 'role', createdAt: '2026-05-14', updatedAt: '2026-05-14' },
  { id: 'code-read', name: '代码文件读取', version: '1.0.0', description: '读取项目中的源码文件和配置文件。', content: '能够通过 Read/Glob 工具读取指定路径的文件内容，支持 offset/limit 精准定位。', mdContent: '# 代码文件读取\n\n使用 Read/Glob 工具读取指定路径的文件内容。', enabled: true, scope: 'global', createdAt: '2026-05-01', updatedAt: '2026-05-01' },
  { id: 'code-search', name: '代码搜索定位', version: '1.0.0', description: '通过正则或关键词搜索代码内容。', content: '使用 Grep 工具按正则搜索文件内容，支持 include 过滤文件类型。', mdContent: '# 代码搜索定位\n\n使用 Grep 工具按正则搜索文件内容。', enabled: true, scope: 'global', createdAt: '2026-05-01', updatedAt: '2026-05-01' },
  { id: 'bash-run', name: '命令执行', version: '1.0.0', description: '在终端执行 bash 命令。', content: '通过 Bash 工具执行命令，支持 workdir、timeout 参数。', mdContent: '# 命令执行\n\n通过 Bash 工具执行命令。', enabled: true, scope: 'global', createdAt: '2026-05-01', updatedAt: '2026-05-01' },
  { id: 'status-report', name: '状态汇报', version: '1.0.0', description: '向用户汇报当前任务进展。', content: '在完成阶段性任务后，主动输出结论、关键依据和下一步。', mdContent: '# 状态汇报\n\n主动输出结论、关键依据和下一步。', enabled: true, scope: 'global', createdAt: '2026-05-01', updatedAt: '2026-05-01' },
  { id: 'code-edit', name: '代码修改', version: '1.0.0', description: '精准编辑源码文件。', content: '使用 Edit 工具进行精确字符串替换，支持 replaceAll。', mdContent: '# 代码修改\n\n使用 Edit 工具进行精确字符串替换。', enabled: true, scope: 'role', createdAt: '2026-05-02', updatedAt: '2026-05-02' },
  { id: 'test-run', name: '测试运行', version: '1.0.0', description: '执行测试套件并分析结果。', content: '运行项目测试命令，分析 pass/fail/error，定位失败用例。', mdContent: '# 测试运行\n\n运行项目测试命令并分析结果。', enabled: true, scope: 'role', createdAt: '2026-05-02', updatedAt: '2026-05-02' },
  { id: 'architecture-review', name: '架构分析', version: '1.0.0', description: '分析代码架构和依赖关系。', content: '通过目录结构、导入关系、模块边界分析项目架构。', mdContent: '# 架构分析\n\n分析目录结构、导入关系和模块边界。', enabled: true, scope: 'role', createdAt: '2026-05-02', updatedAt: '2026-05-02' },
  { id: 'decision-tradeoff', name: '决策权衡', version: '1.0.0', description: '多方案对比分析并给出推荐。', content: '对比 2-3 种方案的收益、风险、成本，给出推荐。', mdContent: '# 决策权衡\n\n对比多种方案并给出推荐。', enabled: true, scope: 'role', createdAt: '2026-05-02', updatedAt: '2026-05-02' },
  { id: 'visual-review', name: '视觉评审', version: '1.0.0', description: '评审 UI 设计和原型。', content: '对截图/原型进行视觉走查，指出间距、对齐、色彩、字号等问题。', mdContent: '# 视觉评审\n\n对截图或原型进行视觉走查。', enabled: true, scope: 'role', createdAt: '2026-05-03', updatedAt: '2026-05-03' },
  { id: 'prototype-output', name: '原型输出', version: '1.0.0', description: '输出 HTML/CSS 原型文件。', content: '基于设计规范产出可浏览的 HTML 原型，保持版本化。', mdContent: '# 原型输出\n\n产出可浏览的 HTML 原型。', enabled: true, scope: 'role', createdAt: '2026-05-03', updatedAt: '2026-05-03' }
];
const roleSkillMappings = [
  { roleId: 'explorer', skillId: 'sct-to-customer-table', source: 'role', enabled: true },
  { roleId: 'fixer', skillId: 'sct-to-customer-table', source: 'role', enabled: true },
  { roleId: 'explorer', skillId: 'code-edit', source: 'role', enabled: true },
  { roleId: 'fixer', skillId: 'code-edit', source: 'role', enabled: true },
  { roleId: 'fixer', skillId: 'test-run', source: 'role', enabled: true },
  { roleId: 'oracle', skillId: 'architecture-review', source: 'role', enabled: true },
  { roleId: 'oracle', skillId: 'decision-tradeoff', source: 'role', enabled: true },
  { roleId: 'designer', skillId: 'visual-review', source: 'role', enabled: true },
  { roleId: 'designer', skillId: 'prototype-output', source: 'role', enabled: true }
];
const roles = [
  { id: 'explorer', displayName: '测试工程师', templateName: '测试工程师数字员工模板', description: '负责需求澄清、用例设计、测试验证与缺陷反馈。', responsibilities: ['需求澄清', '测试用例', '验收验证', '质量反馈'], createPolicy: '可创建多个测试数字员工，按项目分配。' },
  { id: 'fixer', displayName: '定制开发 / 建模', templateName: '定制开发数字员工模板', description: '负责代码修改、低代码模型配置、构建修复与测试执行。', responsibilities: ['代码修改', '模型配置', '测试运行', '构建修复'], createPolicy: '可创建多个开发/建模数字员工，分别匹配不同项目。' },
  { id: 'oracle', displayName: '架构师', templateName: '架构师数字员工模板', description: '负责架构分析、方案权衡、风险判断和关键决策建议。', responsibilities: ['架构分析', '方案评审', '风险识别', '决策建议'], createPolicy: '通常少量实例，按项目提供架构治理。' },
  { id: 'designer', displayName: '设计师', templateName: '设计师数字员工模板', description: '负责界面设计、原型输出、视觉评审和交互优化。', responsibilities: ['界面设计', '原型输出', '视觉评审', '交互优化'], createPolicy: '可按项目创建设计实例或共享设计评审能力。' }
];

function getAllWorkers() {
  if (typeof currentState === 'undefined' || !currentState.workers) return [];
  var allW = [...currentState.workers];
  currentState.teams.forEach(function(t){ t.members.forEach(function(m){ allW.push(m); }); });
  return allW;
}
function updateWorkerStats() {
  var allW = getAllWorkers();
  const statTotal = document.getElementById('statTotal');
  const statOnline = document.getElementById('statOnline');
  const statBusy = document.getElementById('statBusy');
  const statSkills = document.getElementById('statSkills');
  if (statTotal) statTotal.textContent = allW.length;
  if (statOnline) statOnline.textContent = allW.filter(function(w){return w.status==='idle'||w.status==='busy';}).length;
  if (statBusy) statBusy.textContent = allW.filter(function(w){return w.status==='busy';}).length;
  if (statSkills) statSkills.textContent = skills.filter(function(s){return s.enabled;}).length;
}

function normalizeRole(role) { return String(role || '').replace('@',''); }
function getWorkersByRole(role) {
  const r = normalizeRole(role);
  return getAllWorkers().filter(function(w){ return normalizeRole(w.role) === r; });
}
function getSkillRoleIds(skillId) {
  return roleSkillMappings.filter(function(m){ return m.enabled && m.skillId === skillId; }).map(function(m){ return m.roleId; });
}
function getSkillsForRole(role) {
  const r = normalizeRole(role);
  const mappedIds = roleSkillMappings.filter(function(m){ return m.enabled && m.roleId === r; }).map(function(m){ return m.skillId; });
  return skills.filter(function(s){ return s.enabled && (s.scope === 'global' || mappedIds.includes(s.id)); });
}
function getImpactForSkill(skill) {
  const allW = getAllWorkers();
  if (!skill) return { roles: 0, instances: 0 };
  if (skill.scope === 'global') return { roles: roles.length, instances: allW.length };
  const roleIds = getSkillRoleIds(skill.id);
  return { roles: roleIds.length, instances: allW.filter(function(w){ return roleIds.includes(normalizeRole(w.role)); }).length };
}
function renderRolesPage() {
  const c = document.getElementById('roleCardsContainer');
  if (!c) return;
  c.innerHTML = roles.map(function(r){
    const workers = getWorkersByRole(r.id);
    const skillCount = getSkillsForRole(r.id).length;
    const online = workers.filter(function(w){ return w.status === 'idle' || w.status === 'busy'; }).length;
    return `<div class="card role-template-card">
      <div class="card-header">
        <div>
          <div class="card-title">@${r.id} · ${r.templateName}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:6px;line-height:1.5;">${r.description}</div>
        </div>
        <span class="status-badge healthy"><span class="status-dot healthy"></span>启用</span>
      </div>
      <div class="card-body">
        <div class="data-row"><span class="data-label">数字员工实例</span><span class="data-value">${workers.length} 个 / 在线 ${online}</span></div>
        <div class="data-row"><span class="data-label">继承技能</span><span class="data-value">${skillCount} 项</span></div>
        <div class="role-template-flow">基于此岗位模板创建数字员工 → 自动继承岗位技能 → 分配到团队/项目 → 启动独立运行会话。</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${r.responsibilities.map(x=>`<span class="docs-status-pill">${x}</span>`).join('')}</div>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" onclick="alert('基于 ${r.displayName} 模板创建数字员工实例（占位）：后续进入创建向导，选择名称、团队、项目和运行参数。')">+ 创建数字员工</button>
        <button class="btn btn-secondary" onclick="switchNav('skills'); setTimeout(()=>{ switchSkillTab('mapping'); const el=document.getElementById('mappingRoleSelect'); if(el){el.value='${r.id}'; renderRoleMapping('${r.id}');}}, 0);">查看技能</button>
        <button class="btn" onclick="alert('编辑岗位模板（占位）：职责、创建策略、默认运行参数。')">编辑岗位</button>
      </div>
    </div>`;
  }).join('');
}
function switchSkillTab(tab) {
  document.querySelectorAll('.skill-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.skillTab === tab); });
  const ids = { studio: 'skillStudioPanel', assets: 'skillAssetsPanel', mapping: 'skillMappingPanel' };
  Object.keys(ids).forEach(function(k){ const el = document.getElementById(ids[k]); if (el) el.style.display = tab === k ? 'block' : 'none'; });
  if (tab === 'studio') renderSkillStudio();
  if (tab === 'assets') renderSkillTable();
  if (tab === 'mapping') renderRoleMapping(document.getElementById('mappingRoleSelect').value);
}
function selectSkill(skillId) {
  selectedSkillId = skillId || null;
  renderSkillStudio();
}
function renderSkillStudio() {
  const skill = skills.find(function(x){ return x.id === selectedSkillId; }) || skills[0];
  selectedSkillId = skill ? skill.id : null;
  const nameEl = document.getElementById('skillStudioName');
  const descEl = document.getElementById('skillStudioDesc');
  const mdEl = document.getElementById('skillStudioMd');
  const versionEl = document.getElementById('skillStudioVersion');
  if (!nameEl || !descEl || !mdEl) return;
  nameEl.value = skill ? skill.name : '';
  descEl.value = skill ? skill.description : '';
  mdEl.value = skill ? (skill.mdContent || skill.content || '') : '';
  if (versionEl) versionEl.textContent = (skill ? 'draft · v' + (skill.version || '0.1.0') : 'draft · new');
  syncSkillStudioYaml();
  syncSkillLineNums();
}
function syncSkillStudioYaml() {
  const skill = skills.find(function(x){ return x.id === selectedSkillId; });
  const name = document.getElementById('skillStudioName')?.value || '';
  const desc = document.getElementById('skillStudioDesc')?.value || '';
  const roleIds = skill ? getSkillRoleIds(skill.id) : [];
  const scope = skill ? skill.scope : 'role';
  const yaml = `---\nname: ${name}\nversion: ${skill ? skill.version || '0.1.0' : '0.1.0'}\nsummary: ${desc}\nscope: ${scope}\nroles: ${scope === 'global' ? '["*"]' : '[' + roleIds.map(r=>'"@'+r+'"').join(', ') + ']'}\ntrigger: 用户需要把 SCT/BOM 明细转换为客户化报价配置表时使用。\n---`;
  const yamlEl = document.getElementById('skillStudioYaml');
  if (yamlEl) yamlEl.textContent = yaml;
  const impact = getImpactForSkill(skill);
  const impactEl = document.getElementById('skillStudioImpact');
  if (impactEl) impactEl.textContent = `影响 ${impact.roles} 个数字员工模板、${impact.instances} 个数字员工实例`;
}
function syncSkillLineNums() {
  const md = document.getElementById('skillStudioMd');
  const nums = document.getElementById('skillLineNums');
  if (!md || !nums) return;
  const n = Math.max(1, md.value.split('\n').length);
  nums.textContent = Array.from({length:n}, (_,i)=>String(i+1)).join('\n');
}
function renderSkillTable(filter) {
  const tbody = document.getElementById('skillTableBody');
  if (!tbody) return;
  const q = (filter || '').trim();
  const filtered = q ? skills.filter(s => s.name.includes(q) || s.description.includes(q)) : skills;
  tbody.innerHTML = filtered.map(function(s){
    const roleIds = getSkillRoleIds(s.id);
    const scopeText = s.scope === 'global' ? '通用技能（全部模板）' : '岗位技能：' + roleIds.map(r => '@' + r).join(', ');
    const impact = getImpactForSkill(s);
    return '<tr><td><strong>' + escapeHTML(s.name) + '</strong></td><td>' + escapeHTML(s.description) + '</td><td>' + escapeHTML(scopeText) + '</td><td>' + impact.instances + '</td><td>v' + escapeHTML(s.version || '-') + ' · ' + (s.enabled ? '<span style="color:#34a853">启用</span>' : '<span style="color:#999">停用</span>') + '</td><td><span class="skill-action" onclick="selectSkill(\'' + s.id + '\'); switchSkillTab(\'studio\')">编辑</span><span class="skill-action danger" onclick="alert(\'停用技能（占位）：发布停用版本后才会影响实例\')">停用</span></td></tr>';
  }).join('');
}
function filterSkills(val) { renderSkillTable(val); }
function renderRoleMapping(role) {
  const list = document.getElementById('roleMappingList');
  if (!list) return;
  const roleInfo = roles.find(function(r){ return r.id === role; });
  const matched = getSkillsForRole(role);
  list.innerHTML = '<div style="font-size:13px;color:#555;margin-bottom:8px;">' + (roleInfo ? roleInfo.templateName : '@' + role) + ' 最终生效 <strong>' + matched.length + '</strong> 项技能：</div>' + matched.map(function(s){
    const isGlobal = s.scope === 'global';
    return '<div style="padding:8px 12px;border:1px solid #eee;border-radius:4px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;"><span><strong>' + escapeHTML(s.name) + '</strong> — ' + escapeHTML(s.description) + (isGlobal ? ' <em style="color:#888">(通用)</em>' : ' <em style="color:#888">(岗位匹配)</em>') + '</span><span class="skill-action" onclick="selectSkill(\'' + s.id + '\'); switchSkillTab(\'studio\')">编辑 SKILL.md</span></div>';
  }).join('');
}
function openSkillDrawer(skillId) { selectSkill(skillId || skills[0]?.id); switchSkillTab('studio'); }
function closeSkillDrawer() { const el = document.getElementById('skillDrawerOverlay'); if (el) el.style.display = 'none'; }
function saveSkill() { alert('技能已保存草稿（原型占位）'); closeSkillDrawer(); }
function renderWorkerPool() {
      const container = document.getElementById('workerPoolContainer');
      const keyword = document.getElementById('searchWorkerInput').value.toLowerCase();
      const roleFilter = document.getElementById('roleFilter').value;
      const statusFilter = document.getElementById('statusFilter').value;
      
      let allWorkers = [...currentState.workers];
      currentState.teams.forEach(t => {
         t.members.forEach(m => {
            allWorkers.push({ ...m, teamId: t.id, teamName: t.name });
         });
      });

      let filtered = allWorkers.filter(w => {
        const matchKey = w.name.toLowerCase().includes(keyword) || (w.id && w.id.toLowerCase().includes(keyword)) || (w.session && w.session.toLowerCase().includes(keyword));
        const matchRole = roleFilter === 'all' || w.role === roleFilter;
        const matchStatus = statusFilter === 'all' || w.status === statusFilter;
        return matchKey && matchRole && matchStatus;
      });

      if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">没有找到符合条件的 Worker</div>`;
        return;
      }
      
      // Group mode
      const groupBy = document.querySelector('[data-group-tab].active')?.dataset.groupTab || 'status';
      
      let html = '';
      
      const renderGroup = (key, title, workers, icon) => {
        if (workers.length === 0) return '';
        html += `
        <div class="role-group" id="role-group-${key}">
          <div class="role-group-header" onclick="toggleRoleGroup('${key}')">
            
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-weight:600; display:flex; align-items:center; gap:6px;">
                ${icon || ''}
                ${title}
              </span>
              <span class="badge" style="margin:0; background: var(--info); font-size:12px; padding:2px 8px; font-weight:normal;">${workers.length} 个实例</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="role-group-content">
            ${workers.map(w => {
              const teamObj = w.teamId ? currentState.teams.find(t => t.id === w.teamId) : null;
              const subLine = teamObj
                ? `${escapeHTML(w.id)} · ${escapeHTML(w.teamName)} · ${escapeHTML(teamObj.masterCodename || '')}`
                : `${escapeHTML(w.id)}`;
              const statusDot = (w.status === 'idle' || w.status === 'busy' || w.status === 'offline') ? w.status : 'offline';
              return `
              <div class="worker-card clickable ${w.status === 'offline' ? 'offline' : ''}" onclick="openDrawer('${escapeHTML(w.id)}')">
                <div class="worker-card-top">
                  <div class="worker-card-head">
                    <div class="worker-card-identity">
                      <span class="worker-card-avatar"><img src="${getWorkerAvatarSrc(w)}" alt="" loading="lazy"><span class="persona-status-dot ${statusDot}"></span></span>
                      <span class="role-badge worker-card-role-under-avatar ${getRoleClass(w.role)}" title="${escapeHTML(w.role || '')}">${escapeHTML(getDisplayRole(w))}</span>
                    </div>
                    <div class="worker-card-main">
                      <div class="worker-card-title-row" style="font-weight:600; font-size:16px; color:var(--text-primary);">
                        <span class="worker-card-name">${escapeHTML(w.name)}</span>
                      </div>
                      <div class="worker-card-meta" title="${subLine}">${escapeHTML(w.id)}</div>
                    </div>
                  </div>
                  <div class="card-actions worker-card-actions" onclick="event.stopPropagation();">
                      <button class="icon-btn" title="对话" onclick="event.stopPropagation(); openWorkerChat('${escapeHTML(w.id)}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </button>
                      <button class="icon-btn" title="监控" onclick="event.stopPropagation(); openWorkerMonitor('${escapeHTML(w.id)}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      </button>
                      <button class="icon-btn" title="更多" onclick="event.stopPropagation(); openWorkerMore('${escapeHTML(w.id)}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                      </button>
                  </div>
                </div>
                <div class="worker-card-body">
                  <div>状态摘要: <span title="${escapeHTML(w.currentTaskSummary || '')}">${escapeHTML(w.currentTaskSummary || '-')}</span></div>
                  <div>最后心跳: ${formatRelativeTime(w.heartbeatTs)}</div>
                  <div class="worker-card-skills-summary" title="点击查看技能详情">🔧 ${getSkillsForRole(w.role).length} 项技能</div>
                </div>
                ${w.teamId ? '' : `
                <div style="margin-top:8px; padding-top:8px; border-top:1px solid var(--border); text-align:right;">
                  <button class="btn btn-primary btn-sm" ${w.status==='offline' ? 'disabled' : ''} onclick="event.stopPropagation(); openJoinTeamModal('${w.id}')">加入团队</button>
                </div>`}
              </div>
            `;}).join('')}
          </div>
        </div>`;
      };
      
      if (groupBy === 'team') {
        // Group by team
        const teamGroups = {};
        const unassigned = [];
        filtered.forEach(w => {
          if (w.teamId) {
            if (!teamGroups[w.teamId]) teamGroups[w.teamId] = { name: w.teamName, workers: [] };
            teamGroups[w.teamId].workers.push(w);
          } else {
            unassigned.push(w);
          }
        });
        // Render each team group
        currentState.teams.forEach(t => {
          if (teamGroups[t.id]) {
            renderGroup('team-' + t.id, t.name, teamGroups[t.id].workers, '<span style="color:var(--info)">◆</span>');
          }
        });
        if (unassigned.length > 0) {
          renderGroup('team-none', '未加入团队', unassigned, '<span style="color:var(--warning)">⊘</span>');
        }
      } else {
        // Group by join status (default)
        const groups = { joined: [], unjoined: [] };
        filtered.forEach(w => {
          if(w.teamId) groups.joined.push(w);
          else groups.unjoined.push(w);
        });
        renderGroup('joined', '已加入团队', groups.joined, '<span style="color:var(--success)">✓</span>');
        renderGroup('unjoined', '未加入团队', groups.unjoined, '<span style="color:var(--warning)">⊘</span>');
      }

      container.innerHTML = html;
    }

    function populateTeamFilters() {
        const filter = document.getElementById('decisionTeamFilter');
        if(!filter) return;
        let html = `<option value="all">全部团队</option>`;
        currentState.teams.forEach(t => {
            html += `<option value="${t.id}">${t.name}</option>`;
        });
        // 兜底：来自未认领池的决策
        if (currentState.decisions.some(d => d.teamId === 'unassigned')) {
            html += `<option value="unassigned">未分配</option>`;
        }
        filter.innerHTML = html;
    }

    function renderDecisions() {
      const urgencyFilter = document.getElementById('decisionUrgencyFilter')?.value || 'all';
      const teamFilter = document.getElementById('decisionTeamFilter')?.value || 'all';
      const statusFilter = document.getElementById('decisionStatusFilter')?.value || 'pending';

      const pendingCount = currentState.decisions.filter(d => d.status === 'pending').length;
      const badgeEl = document.getElementById('menuDecisionCount');
      badgeEl.innerText = pendingCount;
      badgeEl.setAttribute('data-count', pendingCount);
      document.getElementById('menuDecisionCount').style.display = pendingCount ? 'inline-block' : 'none';
      document.getElementById('alertDecisionCount').innerText = pendingCount;
      
      const alertBanner = document.getElementById('decisionAlertBanner');
      const isDecisionsTab = document.getElementById('page-decisions').classList.contains('active');
      
      if (pendingCount > 0 && !isNetworkDisconnected && !isDecisionsTab) {
        alertBanner.style.display = 'inline-flex';
      } else {
        alertBanner.style.display = 'none';
      }

      const tbody = document.getElementById('decisionListBody');
      const detailPanel = document.getElementById('decisionDetailPanel');
      
      let filtered = currentState.decisions.filter(d => {
          if(statusFilter !== 'all' && d.status !== statusFilter) return false;
          if(urgencyFilter === 'urgent' && !d.urgent) return false;
          if(urgencyFilter === 'normal' && d.urgent) return false;
          if(teamFilter !== 'all' && d.teamId !== teamFilter) return false;
          return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state" style="padding:40px; border:none; background:transparent;">无匹配的决策项</td></tr>`;
        detailPanel.style.display = 'none';
        return;
      }

      tbody.innerHTML = filtered.map(d => {
        const teamName = currentState.teams.find(t=>t.id===d.teamId)?.name || (d.teamId === 'unassigned' ? '未分配' : d.teamId);
        const isSelected = d.id === currentSelectedDecisionId;
        
        let rowClass = "decision-row";
        if(isSelected) rowClass += " selected";
        if(d.urgent) rowClass += " urgent";
        if(d.status === 'expired') rowClass += " expired";
        
        let statusHtml = '';
        if(d.status === 'expired') statusHtml = `<span style="color:var(--text-muted)">已过期 ${formatRelativeTime(d.expiresAt).replace(' 前', '')}前</span>`;
        else if(d.urgent) statusHtml = `<span style="color:var(--danger)">🔴 紧急</span>`;
        else statusHtml = `<span style="color:var(--text-secondary)">⚪ 常规</span>`;

        return `
          <tr class="${rowClass}" onclick="selectDecision('${d.id}')">
            <td style="font-weight:500;">${d.title}</td>
            <td><span class="role-badge" style="background:var(--bg-base); color:var(--text-secondary); border:1px solid var(--border);">${d.type}</span></td>
            <td>${teamName}</td>
            <td>${statusHtml}</td>
          </tr>
        `;
      }).join('');
      
      if (!currentSelectedDecisionId && filtered.length > 0) {
        selectDecision(filtered[0].id);
      } else if (currentSelectedDecisionId) {
        renderDecisionDetail(currentSelectedDecisionId);
      }
    }

    function selectDecision(id) {
      currentSelectedDecisionId = id;
      renderDecisions();
    }

    function renderDecisionDetail(id) {
      const d = currentState.decisions.find(x => x.id === id);
      const panel = document.getElementById('decisionDetailPanel');
      
      if (!d) {
        panel.style.display = 'none';
        return;
      }
      
      panel.style.display = 'flex';
      const teamObj = currentState.teams.find(t=>t.id===d.teamId);
      const teamName = teamObj?.name || (d.teamId === 'unassigned' ? '未分配' : d.teamId);
      let requesterLabel = d.requesterId;
      if (teamObj) {
        if (teamObj.masterId === d.requesterId) requesterLabel = `${teamObj.masterCodename}（${d.requesterId}）`;
        else {
          const mem = teamObj.members.find(m => m.id === d.requesterId);
          if (mem) requesterLabel = `${mem.name}（${d.requesterId}）`;
        }
      } else {
        const poolWorker = currentState.workers.find(w => w.id === d.requesterId);
        if (poolWorker) requesterLabel = `${poolWorker.name}（${d.requesterId}）`;
      }
      const isExpired = d.status === 'expired';
      
      let expireHtml = '';
      if(d.expiresAt) {
          const msLeft = d.expiresAt - tsNow;
          if(isExpired) {
              expireHtml = `<span style="color:var(--text-muted)">已过期</span>`;
          } else if(msLeft < 600000) {
              expireHtml = `<span style="color:var(--danger); font-weight:600;">⚠️ ${formatCountdown(d.expiresAt)}</span>`;
          } else {
              expireHtml = `<span>${formatCountdown(d.expiresAt)}</span>`;
          }
      }

      panel.innerHTML = `
        <div class="decision-detail-header">
          <div class="decision-detail-meta">
            <span>发起方: ${teamName} / ${requesterLabel}</span>
            <span>发起时间: ${formatRelativeTime(d.timeTs)}</span>
          </div>
          <div class="decision-detail-title">
            ${d.urgent ? '🔴 ' : ''}${d.title}
          </div>
          <div style="font-size:12px; margin-top:8px; display:flex; justify-content:space-between;">
             <span class="role-badge" style="background:var(--bg-base); border:1px solid var(--border);">${d.type}</span>
             ${expireHtml}
          </div>
        </div>
        <div class="decision-detail-body">
          <div class="decision-context">
            <div class="context-header">
              <span>上下文说明</span>
              <button class="btn" style="height:24px; padding:0 8px; font-size:11px;" id="copyContextBtn" onclick="handleCopyContext()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 复制
              </button>
            </div>
            <pre class="context-body">${d.context}</pre>
          </div>
          
          <div class="decision-options-title">可选操作</div>
          <div class="decision-options-list">
            ${d.options.map((opt, i) => `
              <button class="decision-option-btn ${opt.kind} ${isExpired ? 'disabled' : ''}" ${isExpired ? 'disabled' : ''}>
                <span style="font-weight:500;">${['A','B','C','D'][i]}. ${opt.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    /* =========================================================================
       4. Navigation & Tabs
       ========================================================================= */
    function switchNav(target) {
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const activeNav = document.querySelector(`.nav-item[data-target="${target}"]`);
      if(activeNav) activeNav.classList.add('active');
      
      if (['overview', 'teams', 'projects', 'pool', 'decisions', 'runtime-gateway', 'roles', 'skills', 'settings'].includes(target)) {
        switchTab(target);
      }
    }

    function switchTab(target) {
      // Create tab if not exists
      let tab = document.querySelector(`.tab[data-tab-target="${target}"]`);
      if (!tab) {
        const tabsBar = document.getElementById('tabsBar');
        const TAB_TITLES = {
          'overview': '总览',
          'teams': '团队',
          'projects': '项目',
          'pool': '员工',
          'decisions': '待决策',
          'runtime-gateway': '运行网关',
          'roles': '岗位',
          'skills': '技能',
          'settings': '设置'
        };
        let title = TAB_TITLES[target] || target;
        let icon = '';
        if (target.startsWith('team-')) {
           const t = currentState.teams.find(x=>x.id === target.split('-')[1]);
           if(t) {
               let sClass = t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'healthy' : 'degraded');
               icon = `<span class="status-dot ${sClass}"></span>`;
                title = escapeHTML(t.name);
           }
        }
        
        tab = document.createElement('div');
        tab.className = 'tab';
        tab.setAttribute('data-tab-target', target);
        tab.innerHTML = `${icon} ${title} <span class="tab-close" onclick="event.stopPropagation(); closeTab('${target}')">×</span>`;
        tab.onclick = () => switchTab(target);
        tabsBar.appendChild(tab);
      }
      
      // Update Tab active state
      document.querySelectorAll('.tab[data-tab-target]').forEach(el => el.classList.remove('active'));
      tab.classList.add('active');
      
      // Update Page active state
      document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
      
      let pageId = `page-${target}`;
      if (target.startsWith('team-')) {
        let page = document.getElementById(pageId);
        if (!page) {
          const template = document.getElementById('page-team-detail-template').innerHTML;
          page = document.createElement('div');
          page.id = pageId;
          page.className = 'page';
          page.innerHTML = template;
          document.getElementById('pageContainer').appendChild(page);
        }
        renderTeamDetailLeftPanel(target.split('-')[1]);
        page.classList.add('active');
      } else {
        const standardPage = document.getElementById(`page-${target}`);
        if(standardPage) standardPage.classList.add('active');
        if (target === 'roles') renderRolesPage();
        if (target === 'skills') { renderSkillTable(); renderRoleMapping(document.getElementById('mappingRoleSelect')?.value || 'explorer'); }
      }
      
      // Sync nav highlight
      if (!target.startsWith('team-')) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const navMatch = document.querySelector(`.nav-item[data-target="${target}"]`);
        if(navMatch) navMatch.classList.add('active');
      }
      renderOriginChip();
    }

    function closeTab(target) {
      const tab = document.querySelector(`.tab[data-tab-target="${target}"]`);
      if (tab) tab.remove();
      
      if (target.startsWith('team-')) {
        const page = document.getElementById(`page-${target}`);
        if (page) page.remove();
      }
      
      // Switch to overview
      switchTab('overview');
    }

    function openTeamTab(teamId) {
      switchTab(`team-${teamId}`);
    }

    // 团队卡片操作：更多（占位提示，后续可改成下拉菜单）
    function openTeamMore(teamId, btn) {
      const team = currentState.teams.find(t => t.id === teamId);
      const name = team ? team.name : teamId;
      alert(`【${name}】更多操作\n\n后续将支持：\n· 查看历史\n· 导出报告\n· 暂停/恢复\n· 重启 Leader\n· 团队设置`);
    }

    // v0.6.1 员工卡图标行桩函数（后续 v0.6.2 替换为右侧抽屉对话）
    function openWorkerChat(id) {
      // v0.6.1 stub: 后续将替换为右侧抽屉对话面板
      alert(`💬 与员工 [${id}] 对话\n\n（v0.6.2 将实现右侧对话抽屉）`);
    }
    function openWorkerMonitor(id) {
      alert(`🖥️ 员工 [${id}] 监控\n\n实时屏幕/日志/任务进度`);
    }
    function openWorkerMore(id) {
      alert(`员工 [${id}] 更多\n\n· 历史对话\n· 性能数据\n· 重启 / 下线`);
    }

    /* =========================================================================
       5. Team Details & Modals
       ========================================================================= */

    function renderTeamDetailLeftPanel(teamId) {
        const page = document.getElementById(`page-team-${teamId}`);
        if(!page) return;
        const t = currentState.teams.find(x=>x.id === teamId);
        if(!t) return;

        let statusClass = t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'healthy' : 'degraded');

        // v0.6.5: 绑定 tab 切换（每次进入都重绑）
        page.querySelectorAll('[data-team-tab]').forEach(tabEl => {
          tabEl.onclick = () => switchTeamTab(teamId, tabEl.dataset.teamTab);
        });
        // 默认激活「团队工作台」
        switchTeamTab(teamId, 'workbench', /*skipRender*/ true);
        
        // Master Card
        const masterCard = page.querySelector('.detail-master-card');
        masterCard.innerHTML = `
            <div class="card-title" style="margin-bottom:12px;"><span class="status-dot ${statusClass}"></span> ${escapeHTML(t.masterCodename || '')}（Leader）<span class="project-role-badge role-leader">项目负责人</span></div>
            <div class="data-row"><span class="data-label">编号</span><span class="data-value" style="font-family:monospace;">${escapeHTML(t.masterId || '')}</span></div>
            <div class="data-row"><span class="data-label">状态</span><span class="status-badge ${statusClass}">${getStatusIcon(t.masterStatus)} ${escapeHTML(getStatusLabel(t.masterStatus))}</span></div>
            <div class="data-row"><span class="data-label">在线时长</span><span class="data-value">${escapeHTML(t.uptime)}</span></div>
            <div class="data-row"><span class="data-label">当前任务</span><span class="data-value" style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(t.task)}</span></div>
            <div class="data-row"><span class="data-label">Session</span><span class="data-value" style="font-family:monospace;">${escapeHTML(t.sessionId)}</span></div>
            <div class="data-row"><span class="data-label">Endpoint</span><span class="data-value" style="font-family:monospace;">${escapeHTML(t.endpoint)}</span></div>
            <button class="leader-chat-btn" onclick="openChatWith('${escapeHTML(t.masterId || t.id)}')">💬 协作</button>
        `;

        // Members
        const memBody = page.querySelector('.detail-members-body');
        memBody.innerHTML = t.members.map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--bg-base);">
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <div style="font-weight:500; font-size:13px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span class="status-dot ${m.status}"></span> ${escapeHTML(m.name)}
                        <span style="font-family:monospace; font-size:11px; color:var(--text-muted);">${escapeHTML(m.id)}</span>
                        <span class="role-badge ${getRoleClass(m.role)}" style="transform:scale(0.8); transform-origin:left;" title="${escapeHTML(m.role || '')}">${escapeHTML(getDisplayRole(m))}</span>
                    </div>
                    <div style="font-size:11px; color:var(--text-secondary);">${escapeHTML(m.status==='offline'?`已离线 ${formatRelativeTime(m.offlineSince).replace(' 前','')}` : m.currentTaskSummary || getStatusLabel(m.status))}</div>
                </div>
                <button class="btn btn-danger" style="height:24px; padding:0 8px; font-size:11px;" onclick="confirmRemoveWorker('${teamId}', '${m.id}')">移出</button>
            </div>
        `).join('');

        // Available Workers
        const availBody = page.querySelector('.detail-available-workers');
        const availables = currentState.workers.filter(w=>w.status === 'unclaimed');
        if(availables.length === 0) {
            availBody.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">池中暂无可用 Worker</div>`;
        } else {
            availBody.innerHTML = availables.map(w => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border:1px dashed var(--border); border-radius:6px;">
                    <div style="font-size:12px;"><span class="role-badge ${getRoleClass(w.role)}" style="transform:scale(0.8); transform-origin:left;" title="${escapeHTML(w.role || '')}">${escapeHTML(getDisplayRole(w))}</span> ${escapeHTML(w.name)}</div>
                    <button class="btn btn-primary" style="height:24px; padding:0 8px; font-size:11px;" onclick="assignWorkerToTeam('${w.id}', '${teamId}')">指派</button>
                </div>
            `).join('');
        }

        // Other Team Workers
        const otherBody = page.querySelector('.detail-other-workers');
        let others = [];
        currentState.teams.forEach(otherT => {
            if(otherT.id !== teamId) {
                otherT.members.forEach(m => others.push({...m, teamName: otherT.name}));
            }
        });
        if(others.length === 0) {
            otherBody.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">无其他占用</div>`;
        } else {
            otherBody.innerHTML = others.slice(0, 3).map(w => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border:1px solid var(--border); border-radius:6px; opacity:0.6;">
                    <div style="font-size:12px;">${escapeHTML(w.name)}</div>
                    <div style="font-size:11px;">归属 ${escapeHTML(w.teamName)}</div>
                </div>
            `).join('') + (others.length>3?`<div style="font-size:11px; text-align:center;">+${others.length-3} 更多</div>`:'');
        }

        // Context default to activities
        const contextBody = page.querySelector('.detail-context-body');
        contextBody.innerHTML = `<div class="activity-timeline">` + t.activities.map(a => `
            <div class="activity-item">
                <div class="activity-time">${formatRelativeTime(a.time)}</div>
                <div class="activity-content">${escapeHTML(a.desc)}</div>
            </div>
        `).join('') + `</div>`;

        // v0.6.0: 渲染「当前项目」pane（兼容隐藏桩，仍调用以填充 detail-project-body）
        renderProjectPane(teamId);

        // v0.6.5: 渲染 Team Header（两行）
        renderTeamHeader(t, page);

        // v0.6.5: 渲染文档 tab
        renderDocsPane(t, page);

        // v0.6.7: 团队工作台 = 左侧首页同款团队卡 + 右侧任务看板
        renderDetailTopologyCard(t, page);
        renderWorkbenchAgentDetail(t, page);
    }

    /* v0.6.5: 团队详情 tab 切换（2 tab） */
    function switchTeamTab(teamId, tabKey, skipRender) {
      const page = document.getElementById(`page-team-${teamId}`);
      if (!page) return;
      page.querySelectorAll('[data-team-tab]').forEach(el => {
        el.classList.toggle('active', el.dataset.teamTab === tabKey);
      });
      page.querySelectorAll('[data-team-tab-pane]').forEach(el => {
        el.classList.toggle('active', el.dataset.teamTabPane === tabKey);
      });
      if (skipRender) return;
      const team = currentState.teams.find(t => t.id === teamId);
      if (!team) return;
      if (tabKey === 'workbench') {
        renderDetailTopologyCard(team, page);
        renderWorkbenchAgentDetail(team, page);
      } else if (tabKey === 'docs') {
        renderDocsPane(team, page);
      }
    }

    /* v0.6.1: 渲染 Leader 横幅（团队对话首屏顶部） */
    function renderLeaderBanner(team, page) {
      const banner = page.querySelector('.leader-banner-body');
      if (!banner) return;
      const status = team.masterStatus === 'offline' ? 'offline' : (team.healthy ? 'healthy' : 'degraded');
      const statusLabel = getStatusLabel(status);
      const leaderName = team.masterCodename || team.master || 'Leader';
      const initial = leaderName.charAt(0);
      const onlineCount = (team.members || []).filter(m => m.status !== 'offline').length;
      const totalCount = (team.members || []).length;
      banner.innerHTML = `
        <div style="width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg, var(--info), #6366f1); color:white; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; flex-shrink:0;">
          ${escapeHTML(initial)}
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px; flex-wrap:wrap;">
            <div style="font-size:18px; font-weight:700; color:var(--text-primary);">${escapeHTML(leaderName)}</div>
            <span class="status-badge ${status}" style="font-size:11px;">${getStatusIcon(status)} ${escapeHTML(statusLabel)}</span>
            <span style="font-size:12px; color:var(--text-muted);">· ${escapeHTML(team.name)} Leader（主控）</span>
          </div>
          <div style="font-size:13px; color:var(--text-secondary); margin-bottom:8px;">
            当前任务：<span style="color:var(--text-primary); font-weight:500;">${escapeHTML(team.task || '无任务')}</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted);">
            最近活动 ${formatRelativeTime(team.lastActivity)} · 在线员工 ${onlineCount}/${totalCount}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn btn-primary" onclick="openWorkerChat('${escapeHTML(leaderName)}')" style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            协作
          </button>
          <button class="btn btn-secondary" onclick="openWorkerMore('${escapeHTML(leaderName)}')" style="font-size:12px;">更多</button>
        </div>
      `;
    }

    /* v0.6.1: 渲染团队成员小卡网格 */
    function renderLeaderTeamMembers(team, page) {
      const grid = page.querySelector('.leader-team-members-grid');
      const chip = page.querySelector('.member-count-chip');
      if (!grid) return;
      const members = team.members || [];
      if (chip) chip.textContent = `${members.filter(m => m.status !== 'offline').length} 在线 / ${members.length} 总`;
      grid.innerHTML = members.map(m => {
        const status = m.status || 'idle';
        const statusColor = status === 'busy' ? '#ef4444' : (status === 'offline' ? '#94a3b8' : '#10b981');
        const statusText = status === 'busy' ? '忙碌' : (status === 'offline' ? '离线' : '空闲');
        const safeName = escapeHTML(m.name);
        return `
          <div class="leader-member-mini" style="border:1px solid var(--border); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px; background:#fff; transition:all .15s; cursor:pointer;" onclick="switchAgentDetailInWorkbench('${team.id}','${safeName}')" onmouseover="this.style.borderColor='var(--info)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.borderColor='var(--border)'; this.style.transform=''">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:28px; height:28px; border-radius:50%; background:${statusColor}; color:white; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; flex-shrink:0;">${escapeHTML(m.name.charAt(0))}</div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:13px; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${safeName}</div>
                <div style="font-size:11px; color:var(--text-muted);">${escapeHTML(getRoleName(m.role) || '员工')}</div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:${statusColor};">● ${statusText}</span>
              <div style="display:flex; gap:2px;" onclick="event.stopPropagation();">
                <button class="icon-btn" style="width:22px; height:22px;" title="对话" onclick="event.stopPropagation(); openWorkerChat('${safeName}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button class="icon-btn" style="width:22px; height:22px;" title="监控" onclick="event.stopPropagation(); switchAgentDetailInWorkbench('${team.id}','${safeName}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    /* v0.6.1: 渲染团队动态流（取该 team 的 activities，缺失时使用 mock） */
    function renderLeaderTeamActivity(team, page) {
      const wrap = page.querySelector('.leader-team-activity');
      if (!wrap) return;
      const own = Array.isArray(team.activities) ? team.activities : [];
      const items = own.length > 0 ? own.slice(0, 3) : [
        { time: Date.now() - 60 * 1000, desc: `${team.masterCodename || 'Leader'} 下达指令：${team.task || '继续当前任务'}` },
        { time: Date.now() - 3 * 60 * 1000, desc: `${team.members[1]?.name || '成员'} 完成子任务` },
        { time: Date.now() - 8 * 60 * 1000, desc: `${team.members[2]?.name || '成员'} 提交 PR review` }
      ];
      const summary = items.map(a => `${formatRelativeTime(a.time)} ${a.desc || a.text || a.message || ''}`).join(' · ');
      wrap.innerHTML = `
        <div class="activity-summary-row">
          <span class="activity-summary-label">📈 最近动态</span>
          <span class="activity-summary-text">${escapeHTML(summary)}</span>
          <span class="activity-summary-link" onclick="switchNav('overview')">查看全部</span>
        </div>
      `;
    }

    /* v0.6.0: 渲染当前项目面板 */
    function renderProjectPane(teamId) {
      const page = document.getElementById(`page-team-${teamId}`);
      if (!page) return;
      const t = currentState.teams.find(x => x.id === teamId);
      if (!t) return;
      const body = page.querySelector('.detail-project-body');
      if (!body) return;
      const proj = t.currentProject;
      if (!proj) {
        body.innerHTML = `<div class="empty-state" style="padding:40px;">该团队当前未承载项目</div>`;
        return;
      }
      const ds = summarizeDocs(proj.docs);
      const startedAgo = formatRelativeTime(proj.startedAt).replace(' 前', '');
      const docStatusBreakdown = Object.entries(ds.byStatus)
        .map(([k, v]) => `${v} ${getDocStatusLabel(k)}`).join(' · ');

      // 卡片 1：项目概要 + 三仓
      const codeRepo = proj.codeRepo;
      const modelRepo = proj.modelRepo;
      const repoSection = `
        <div class="pp-row">
          <div class="pp-icon">📁</div>
          <div class="pp-body">
            <div class="pp-line1">代码仓: ${escapeHTML(codeRepo.url)}</div>
            <div class="pp-line2">分支 <code>${escapeHTML(codeRepo.branch)}</code> · ${codeRepo.commits} commits · ${formatRelativeTime(codeRepo.lastCommitTs)}</div>
          </div>
        </div>
        ${modelRepo ? `
        <div class="pp-row">
          <div class="pp-icon">🧩</div>
          <div class="pp-body">
            <div class="pp-line1">模型仓: ${escapeHTML(modelRepo.url)}</div>
            <div class="pp-line2">${escapeHTML(modelRepo.version)} · ${formatRelativeTime(modelRepo.lastUpdateTs)}</div>
          </div>
        </div>` : `
        <div class="pp-row">
          <div class="pp-icon" style="opacity:0.4;">🧩</div>
          <div class="pp-body" style="opacity:0.5;">
            <div class="pp-line1">模型仓：未配置</div>
            <div class="pp-line2">本项目未使用低代码建模</div>
          </div>
        </div>`}
        <div class="pp-row">
          <div class="pp-icon">📄</div>
          <div class="pp-body">
            <div class="pp-line1">文档空间: docs/${escapeHTML(proj.id)}/</div>
            <div class="pp-line2">${ds.total} 篇文档（${docStatusBreakdown || '空'}）</div>
          </div>
        </div>
      `;

      const summaryCard = `
        <div class="card project-panel-card">
          <div class="pp-title">
            📦 ${escapeHTML(proj.name)}
            <span class="stage-badge stage-${proj.stage}">${escapeHTML(getStageLabel(proj.stage))}</span>
            <span class="health-dot health-${proj.health}" title="健康度：${proj.health}"></span>
          </div>
          <div class="pp-meta">启动于 ${startedAgo}前 · 项目 ID <code>${escapeHTML(proj.id)}</code></div>
          ${repoSection}
        </div>
      `;

      // 卡片 2：阻塞
      const blockers = proj.blockers || [];
      const blockerCard = `
        <div class="card project-panel-card">
          <div class="card-title" style="margin-bottom:12px; font-size:14px;">⚠️ 当前阻塞 (${blockers.length})</div>
          ${blockers.length === 0
            ? `<div style="font-size:13px; color:var(--text-muted); padding:12px 0;">无阻塞项 ✅</div>`
            : blockers.map(b => `
              <div class="blocker-item severity-${b.severity}">
                <div class="blocker-desc">${escapeHTML(b.desc)}</div>
                <div class="blocker-meta">${formatRelativeTime(b.since)} · ${b.severity === 'high' ? '高' : (b.severity === 'medium' ? '中' : '低')}严重度</div>
              </div>
            `).join('')}
        </div>
      `;

      // 卡片 3：文档树概览
      const cats = ['specs','plans','reports','decisions','notes'];
      const docTreeCard = `
        <div class="card project-panel-card">
          <div class="card-title" style="margin-bottom:12px; font-size:14px;">📄 文档树概览</div>
          <div class="doc-tree-grid">
            ${cats.map(c => `
              <div class="doc-tree-cell">
                <div class="dt-cat">${c}</div>
                <div class="dt-num">${ds.byCategory[c] || 0}</div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:12px; font-size:12px; color:var(--text-muted); text-align:right;">→ 详细看板见「文档」tab（v0.6.1）</div>
        </div>
      `;

      body.innerHTML = summaryCard + blockerCard + docTreeCard;
    }

    /* ==========================================================
       v0.6.5: 团队详情页改造 — Header / 工作台右栏 / 文档 tab
       ========================================================== */

    // 文档协作 mock：哪些 docId 处于何种状态 + 谁在用 + 最近修改
    const mockDocCollab = {
      'doc-p1-1': { collab:'stable',  reader:null,           lastEditor:'@leader',   lastEditAgo:'5min',  conflicts:0 },
      'doc-p1-2': { collab:'active',  reader:'@worker-1',    lastEditor:'@leader',   lastEditAgo:'5min',  conflicts:0 },
      'doc-p1-3': { collab:'waiting', reader:'@worker-2',    lastEditor:'@worker-2', lastEditAgo:'2h',    conflicts:0 },
      'doc-p1-4': { collab:'stable',  reader:null,           lastEditor:'@designer', lastEditAgo:'2d',    conflicts:0 },
      'doc-p1-5': { collab:'conflict',reader:'@worker-1',    lastEditor:'@human',    lastEditAgo:'15min', conflicts:3 },
      'doc-p1-6': { collab:'active',  reader:'@leader',      lastEditor:'@leader',   lastEditAgo:'7d',    conflicts:0 },
      'doc-p1-7': { collab:'stable',  reader:null,           lastEditor:'@leader',   lastEditAgo:'2d',    conflicts:0 },
      'doc-p1-8': { collab:'stable',  reader:null,           lastEditor:'@oracle',   lastEditAgo:'14d',   conflicts:0 },
      'doc-p1-9': { collab:'waiting', reader:'@oracle',      lastEditor:'@oracle',   lastEditAgo:'5h',    conflicts:0 },
      'doc-p1-10':{ collab:'stable',  reader:null,           lastEditor:'@designer', lastEditAgo:'10d',   conflicts:0 },
      'doc-p1-11':{ collab:'active',  reader:'@worker-3',    lastEditor:'@worker-3', lastEditAgo:'2.5h',  conflicts:0 }
    };

    function getDocCollab(docId) {
      return mockDocCollab[docId] || { collab:'stable', reader:null, lastEditor:'@leader', lastEditAgo:'1d', conflicts:0 };
    }

    function getCollabIcon(state) {
      return ({ conflict:'🔴', active:'⚡', waiting:'🟡', stable:'🟢' })[state] || '🟢';
    }

    // 文档树状态：每个 team 当前选中文档 / 预览编辑模式 / 历史抽屉 / 发布态 计时器
    const docsUiState = {}; // { [teamId]: { selectedDocId, mode, draftSavedTimer, publishTimer } }

    function getDocsUi(teamId) {
      if (!docsUiState[teamId]) docsUiState[teamId] = { selectedDocId: null, mode: 'preview', draftSavedTimer: null, publishTimer: null };
      return docsUiState[teamId];
    }

    /* ---- A. Team Header ---- */
    function renderTeamHeader(team, page) {
      const wrap = page.querySelector('[data-team-header]');
      if (!wrap) return;
      const proj = team.currentProject || {};
      const ds = summarizeDocs(proj.docs);
      const blockerCount = (proj.blockers || []).length;
      const stage = proj.stage || 'build';
      const health = proj.health || 'healthy';

      // 待我处理：从文档协作 mock 抽 conflict + waiting human
      const todoItems = (proj.docs || []).filter(d => {
        const c = getDocCollab(d.id);
        return c.collab === 'conflict' || c.collab === 'waiting';
      });
      const activeDocs = (proj.docs || []).filter(d => getDocCollab(d.id).collab === 'active').length;
      const readers = new Set((proj.docs || []).map(d => getDocCollab(d.id).reader).filter(Boolean));
      const latestDoc = (proj.docs || []).slice().sort((a,b) => (b.updatedTs || 0) - (a.updatedTs || 0))[0];

      const repoBtns = `
        <div class="th-repo-btns">
          <button class="th-repo-btn" title="${escapeHTML(proj.codeRepo?.url || '')}" onclick="alert('打开代码仓: ${escapeHTML(proj.codeRepo?.url || '-')}')">📁 代码仓</button>
          <button class="th-repo-btn ${proj.modelRepo ? '' : 'disabled'}" title="${escapeHTML(proj.modelRepo?.url || '未配置')}" onclick="${proj.modelRepo ? `alert('打开模型仓: ${escapeHTML(proj.modelRepo.url)}')` : `alert('本项目未配置模型仓')`}">🧩 模型仓</button>
        </div>
      `;

      wrap.innerHTML = `
        <div class="team-header-row row-1">
          <span class="th-team-name">${escapeHTML(team.name)}</span>
          <span class="th-project-name">${escapeHTML(proj.name || '无项目')}</span>
          <span class="stage-badge stage-${stage}">${escapeHTML(getStageLabel(stage))}</span>
          <span class="health-dot health-${health}" title="健康度：${health}"></span>
          <span class="th-blockers-chip ${blockerCount === 0 ? 'zero' : ''}" onclick="${blockerCount > 0 ? `alert('查看阻塞列表（${blockerCount} 项）')` : ''}">⚠️ 阻塞 ${blockerCount}</span>
        </div>
        <div class="team-header-row row-2">
          ${repoBtns}
          <div class="th-doc-summary" onclick="switchTeamTab('${team.id}','docs')" title="打开项目文档库" style="cursor:pointer;">
            <span>📄 文档活跃</span>
            <strong>${activeDocs}</strong><span>篇</span>
            <span class="summary-dot"></span>
            <strong>${readers.size}</strong><span>个 Agent 正在读写</span>
            ${latestDoc ? `<span class="summary-dot"></span><span>最近 ${formatRelativeTime(latestDoc.updatedTs)}</span>` : ''}
          </div>
          <div class="th-todo-wrap">
            <span class="th-todo-chip" onclick="event.stopPropagation(); toggleTodoDropdown('${team.id}')">⚠️ 待我处理 (${todoItems.length})</span>
            <div class="th-todo-dropdown" data-todo-dropdown>
              ${todoItems.length === 0
                ? `<div class="th-todo-dropdown-item" style="color:var(--text-muted);">无待处理项</div>`
                : todoItems.map(d => {
                    const c = getDocCollab(d.id);
                    const tag = c.collab === 'conflict' ? `🔴 ${c.conflicts} 处冲突` : '🟡 等待裁决';
                    return `<div class="th-todo-dropdown-item" onclick="closeTodoDropdown('${team.id}'); switchTeamTab('${team.id}','docs'); selectDoc('${team.id}','${d.id}')"><span style="flex-shrink:0;">${tag.split(' ')[0]}</span><div style="flex:1;"><div style="color:var(--text-primary); font-weight:500;">${escapeHTML(d.title)}</div><div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${tag}</div></div></div>`;
                  }).join('')}
            </div>
          </div>
        </div>
      `;

      // 全局点击关闭下拉
      document.addEventListener('click', () => closeTodoDropdown(team.id), { once:true });
    }

    function toggleTodoDropdown(teamId) {
      const page = document.getElementById(`page-team-${teamId}`);
      if (!page) return;
      const dd = page.querySelector('[data-todo-dropdown]');
      if (!dd) return;
      const willOpen = !dd.classList.contains('open');
      // 先关其他 team 的
      document.querySelectorAll('[data-todo-dropdown]').forEach(el => el.classList.remove('open'));
      if (willOpen) {
        dd.classList.add('open');
        setTimeout(() => {
          document.addEventListener('click', () => dd.classList.remove('open'), { once:true });
        }, 0);
      }
    }
    function closeTodoDropdown(teamId) {
      const page = document.getElementById(`page-team-${teamId}`);
      if (!page) return;
      const dd = page.querySelector('[data-todo-dropdown]');
      if (dd) dd.classList.remove('open');
    }

    /* ---- B. 工作台右栏：执行焦点 + Agent 详情切换 ---- */

    /* ============ v0.6.7: 团队工作台 — 左编队右详情 ============ */

    // 每个 team 当前选中智能体： 'leader' 或 member.id
    const selectedAgentByTeam = {};
    function getSelectedAgent(teamId) {
      return selectedAgentByTeam[teamId] || 'leader';
    }
    function setSelectedAgent(teamId, key) {
      selectedAgentByTeam[teamId] = key || 'leader';
    }

    // 切换某 team 当前选中的智能体（key='leader' 或 member.id），并重渲左右
    function selectWorkbenchAgent(teamId, agentKey) {
      const page = document.getElementById(`page-team-${teamId}`);
      if (!page) return;
      const team = currentState.teams.find(t => t.id === teamId);
      if (!team) return;
      setSelectedAgent(teamId, agentKey);
      switchTeamTab(teamId, 'workbench', /*skipRender*/ true);
      renderDetailTopologyCard(team, page);
      renderWorkbenchAgentDetail(team, page);
    }

    // 渲染左栏编队（Leader 置顶 + 成员两列）
    function renderWorkbenchRoster(team, page) {
      const leaderSlot = page.querySelector('[data-roster-leader-slot]');
      const grid = page.querySelector('[data-roster-members-grid]');
      const chip = page.querySelector('.member-count-chip');
      if (!leaderSlot || !grid) return;
      const members = team.members || [];
      const onlineCount = members.filter(m => m.status !== 'offline').length;
      if (chip) chip.textContent = `${onlineCount} 在线 / ${members.length} 总`;

      const selected = getSelectedAgent(team.id);

      // Leader 卡
      const leaderName = team.masterCodename || team.master || 'Leader';
      const leaderInitial = leaderName.charAt(0);
      const leaderStatus = team.masterStatus === 'offline' ? 'offline' : (team.healthy ? 'busy' : 'idle');
      const leaderActive = (selected === 'leader');
      leaderSlot.innerHTML = `
        <div class="roster-agent-card is-leader ${leaderActive ? 'active' : ''}"
             onclick="selectWorkbenchAgent('${team.id}','leader')">
          <span class="ra-leader-tag">LEADER</span>
          <div class="ra-head">
            <div class="ra-identity">
              <div class="ra-avatar"><img class="ra-avatar-img" src="${getLeaderAvatarSrc(team)}" alt="" loading="lazy"><span class="persona-status-dot ${leaderStatus === 'offline' ? 'offline' : 'busy'}"></span></div>
              <div class="ra-role">组长</div>
            </div>
            <div class="ra-main">
              <div class="ra-name-row"><div class="ra-name">${escapeHTML(leaderName)}</div></div>
              <div class="ra-task" title="${escapeHTML(team.task || '')}">${escapeHTML(team.task || '协调团队中…')}</div>
              <div class="ra-foot">
                <span class="ra-status" style="color:${rosterStatusColor(leaderStatus)};">● ${escapeHTML(getStatusLabel(leaderStatus))}</span>
                <div class="ra-actions" onclick="event.stopPropagation();">
                  <button class="icon-btn" title="发起会话" onclick="event.stopPropagation(); openChatWith('${escapeHTML(team.masterId || team.id)}')">💬</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // 成员卡
      grid.innerHTML = members.map(m => {
        const status = m.status || 'idle';
        const safeId = escapeHTML(m.id);
        const isActive = (selected === m.id);
        const statusDot = (status === 'idle' || status === 'busy' || status === 'offline') ? status : 'offline';
        return `
          <div class="roster-agent-card ${isActive ? 'active' : ''}"
               onclick="selectWorkbenchAgent('${team.id}','${safeId}')">
            <div class="ra-head">
              <div class="ra-identity">
                <div class="ra-avatar"><img class="ra-avatar-img" src="${getWorkerAvatarSrc(m)}" alt="" loading="lazy"><span class="persona-status-dot ${statusDot}"></span></div>
                <div class="ra-role">${escapeHTML(getDisplayRole(m) || '员工')}</div>
              </div>
              <div class="ra-main">
                <div class="ra-name-row"><div class="ra-name">${escapeHTML(m.name)}</div></div>
                <div class="ra-task" title="${escapeHTML(m.currentTaskSummary || '')}">${escapeHTML(m.currentTaskSummary || (status === 'idle' ? '空闲待命' : (status === 'offline' ? '已离线' : '执行中…')))}</div>
                <div class="ra-foot">
                  <span class="ra-status" style="color:${rosterStatusColor(status)};">● ${escapeHTML(getStatusLabel(status))}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

    }

    function rosterStatusColor(status) {
      if (status === 'busy') return '#7c3aed';
      if (status === 'offline') return '#94a3b8';
      return '#60a5fa';
    }

    function getTeamPendingDecisions(team) {
      return (currentState.decisions || []).filter(d => d.teamId === team.id && d.status === 'pending');
    }

    function renderWorkItems(items, emptyText = '暂无记录', limit = 4) {
      const safeItems = (items || []).filter(Boolean).slice(0, limit);
      if (safeItems.length === 0) return `<div class="work-status-note">${escapeHTML(emptyText)}</div>`;
      return `<ul class="work-status-list">${safeItems.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
    }

    function getProjectDoneItems(project) {
      return (project?.docs || [])
        .filter(d => d.status === 'done' || d.category === 'reports')
        .slice(0, 3)
        .map(d => `${d.category}/${d.title} · ${getDocStatusLabel(d.status)}`);
    }

    function getDecisionItems(team) {
      return getTeamPendingDecisions(team).slice(0, 3).map(d => `${d.type}：${d.title}`);
    }

    function getContextItems(team, project, doc) {
      const items = [];
      if (project?.name) items.push(`项目：${project.name} · ${getStageLabel(project.stage)}`);
      if (doc?.title) items.push(`当前依据：${doc.category}/${doc.title}`);
      if (project?.codeRepo?.url) items.push(`代码仓库：${project.codeRepo.url} · ${project.codeRepo.branch}`);
      if (project?.modelRepo?.url) items.push(`模型/流程：${project.modelRepo.url} · ${project.modelRepo.version || '-'}`);
      return items;
    }

    function getRoleOutputLabel(worker, project) {
      const role = getPersonaRoleTitle(worker);
      if (role.includes('测试')) return '验证报告 / 缺陷复现 / 风险样本';
      if (role.includes('开发')) return '修复提交 / 回归用例 / 变更说明';
      if (role.includes('架构')) return 'ADR / 技术取舍 / 风险判断';
      if (role.includes('设计')) return '交互规范 / 视觉标注 / 异常态说明';
      if (role.includes('建模')) return '模型映射 / 数据校验 / 脚本记录';
      return project?.currentProject ? '任务产出 / 执行记录' : '任务产出';
    }

    function renderTaskItems(items, emptyText = '暂无任务') {
      const safeItems = (items || []).filter(Boolean).slice(0, 4);
      if (safeItems.length === 0) return `<div class="task-empty">${escapeHTML(emptyText)}</div>`;
      return `<ul class="task-item-list">${safeItems.map(item => `<li class="task-item">${escapeHTML(item)}</li>`).join('')}</ul>`;
    }

    function renderTaskLane(title, items, type, emptyText) {
      const count = (items || []).filter(Boolean).length;
      return `<div class="task-lane-card ${type}"><div class="task-lane-title"><span>${title}</span><span class="task-lane-count">${count}</span></div>${renderTaskItems(items, emptyText)}</div>`;
    }

    function getTeamBoardItems(team, project) {
      const members = team.members || [];
      const pending = getTeamPendingDecisions(team);
      const blockers = project?.blockers || [];
      return {
        doing: members.filter(m => m.status === 'busy').map(m => `${m.name}：${m.currentTaskSummary || '执行中'}`),
        todo: [
          ...members.filter(m => m.status === 'idle').map(m => `${m.name}：待分配下一步任务`),
          ...pending.map(d => `待裁决：${d.title}`),
          ...blockers.map(b => `阻塞：${b.desc || b.title || '存在阻塞'}`),
          ...pending.filter(d => d.urgent).map(d => `紧急决策：${d.title}`)
        ],
        done: getProjectDoneItems(project),
      };
    }

    function getMemberBoardItems(team, project, member) {
      const acts = (team.activities || []).filter(a => (a.desc || '').includes(member.name)).map(a => a.desc || '');
      const current = member.currentTaskSummary || (member.status === 'idle' ? '等待 Leader 分配下一步' : '执行中');
      return {
        doing: member.status === 'busy' ? [`${member.name}：${current}`] : [],
        todo: [
          ...(member.status === 'idle' ? [`${member.name}：待接收下一步任务`] : [`输出：${getRoleOutputLabel(member, project)}`]),
          ...(member.status === 'offline' ? ['成员离线，需要 Leader 重新调度'] : getTeamPendingDecisions(team).slice(0, 2).map(d => `关联决策：${d.title}`))
        ],
        done: acts.filter(text => /完成|修复|更新|输出|补齐|复核/.test(text)),
      };
    }

    function renderDetailTopologyCard(team, page) {
      const host = page.querySelector('#detailTopologyHtml');
      if (!host || !team) return;
      const masterCls = team.masterStatus === 'offline' ? 'offline' : (team.healthy ? 'online-healthy' : 'online-warning');
      const members = getTeamCardWorkers(team);
      const workersHtml = members.map(m => {
        const sCls = (m.status === 'idle' || m.status === 'busy' || m.status === 'offline') ? m.status : 'offline';
        const activeCls = getSelectedAgent(team.id) === m.id ? ' active' : '';
        return `<div class="topo-worker topo-node ${sCls}${activeCls}" data-action="select-agent" data-agent-id="${escapeHTML(m.id)}" onclick="selectWorkbenchAgent('${escapeHTML(team.id)}','${escapeHTML(m.id)}')" title="${escapeHTML(m.name)} · ${escapeHTML(getPersonaRoleTitle(m))} · ${escapeHTML(getStatusLabel(m.status))}">
          <span class="persona-avatar worker ${getPersonaTone(m)} ${getPersonaStatusClass(m.status)}"><img class="persona-avatar-img" src="${getWorkerAvatarSrc(m)}" alt="" loading="lazy"><span class="persona-status-dot ${sCls}"></span></span>
          <span class="topo-worker-text"><span class="topo-worker-name">${escapeHTML(getPersonaMemberName(m))}</span><span class="topo-worker-role">${escapeHTML(getPersonaRoleTitle(m))}</span></span>
        </div>`;
      }).join('');
      const leaderActiveCls = getSelectedAgent(team.id) === 'leader' ? ' active' : '';
      host.innerHTML = `<div id="topologyHtml" class="detail-topology-scope"><div class="topo-team-card detail-topology-card" data-team-id="${escapeHTML(team.id)}">
        <div class="topo-master topo-node ${masterCls}${leaderActiveCls}" data-action="select-agent" data-agent-id="leader" onclick="selectWorkbenchAgent('${escapeHTML(team.id)}','leader')" title="${escapeHTML(team.masterCodename || '')} · 团队负责人">
          <span class="persona-avatar ${getPersonaTone(team, true)} ${getPersonaStatusClass(team.masterStatus === 'offline' ? 'offline' : 'busy')}"><img class="persona-avatar-img" src="${getLeaderAvatarSrc(team)}" alt="" loading="lazy"><span class="persona-status-dot ${team.masterStatus === 'offline' ? 'offline' : 'busy'}"></span></span>
          <span class="persona-main">
            <span class="persona-name-row"><span class="topo-master-name">${escapeHTML(team.masterCodename || '')}</span><span class="persona-role-tag">组长</span></span>
            <span class="persona-task">任务协调 / 决策把关</span>
          </span>
          <button class="topo-node-action" title="与 ${escapeHTML(team.masterCodename || 'Leader')} 对话" onclick="event.stopPropagation(); openChatWith('${escapeHTML(team.masterId || team.id)}')"><span aria-hidden="true">💬</span><span>对话</span></button>
        </div>
        <div class="topo-workers">${workersHtml}</div>
      </div></div>`;
    }

    // 渲染右栏：当前选中智能体详情（Leader 时仅展示个体内容）
    function renderWorkbenchAgentDetail(team, page) {
      const masterCard = page.querySelector('.detail-master-card');
      const ctx = page.querySelector('.detail-context-body');
      const currentDocRow = page.querySelector('[data-agent-current-doc]');
      if (!masterCard) return;

      const selected = getSelectedAgent(team.id);
      const isLeader = (selected === 'leader');
      const member = isLeader ? null : (team.members || []).find(m => m.id === selected);
      // 容错：选中的成员不存在时回退到 Leader
      if (!isLeader && !member) {
        setSelectedAgent(team.id, 'leader');
        return renderWorkbenchAgentDetail(team, page);
      }

      const proj = team.currentProject || {};
      const docs = proj.docs || [];
      const activeDocForLeader = docs.find(d => getDocCollab(d.id).collab === 'active') || docs[0];

      if (isLeader) {
        const leaderName = team.masterCodename || 'Leader';
        const boardItems = getTeamBoardItems(team, proj);

        masterCard.innerHTML = `
          <div class="task-overview-card">
            <div class="task-overview-left">
              <div class="agent-detail-avatar"><img src="${getLeaderAvatarSrc(team)}" alt="" loading="lazy"><span class="persona-status-dot ${team.masterStatus === 'offline' ? 'offline' : 'busy'}"></span></div>
              <div>
                <div class="task-overview-title">${escapeHTML(leaderName)} <span class="role-badge oracle">组长</span></div>
                <div class="task-overview-sub">${escapeHTML(proj.name || team.name)} · ${escapeHTML(getStageLabel(proj.stage) || '推进中')} · 当前重点：${escapeHTML(team.task || '协调成员推进')}</div>
              </div>
            </div>
            <button class="team-manage-btn" onclick="alert('管理成员功能暂未实现\n\n后续将支持：\n· 添加组员\n· 删除组员\n· 调整成员角色与归属')">⚙️ 管理成员</button>
          </div>

          <div class="task-board-grid">
            ${renderTaskLane('🔵 正在做', boardItems.doing, 'doing', '暂无进行中任务')}
            ${renderTaskLane('🟡 待完成', boardItems.todo, 'todo', '暂无待完成事项')}
            ${renderTaskLane('✅ 已完成', boardItems.done, 'done', '暂无完成记录')}
          </div>
        `;

        // 上下文：团队 activity
        if (ctx) {
          const acts = (team.activities || []).slice(0, 4);
          ctx.innerHTML = acts.length === 0
            ? `<div style="font-size:12px; color:var(--text-muted); padding:12px;">暂无团队动态</div>`
            : `<div class="activity-timeline">` + acts.map(a => `
                <div class="activity-item">
                  <div class="activity-time">${formatRelativeTime(a.time)}</div>
                  <div class="activity-content">${escapeHTML(a.desc || a.text || a.message || '')}</div>
                </div>
              `).join('') + `</div>`;
        }
        // Leader 视角下，「当前在读」已并入主卡，此处隐藏冗余条
        if (currentDocRow) { currentDocRow.style.display = 'none'; currentDocRow.innerHTML = ''; }
        return;
      }

      // —— 成员视角 ——
      const m = member;
      const status = m.status || 'idle';
      const statusDot = (status === 'idle' || status === 'busy' || status === 'offline') ? status : 'offline';
      // 该成员当前在读：mock 取 specs 第一篇或项目首个 doc
      const specs = docs.filter(d => d.category === 'specs');
      const memberDoc = specs[0] || docs[0];
      const memberBoardItems = getMemberBoardItems(team, proj, m);

      masterCard.innerHTML = `
        <div class="task-overview-card">
          <div class="task-overview-left">
            <div class="agent-detail-avatar"><img src="${getWorkerAvatarSrc(m)}" alt="" loading="lazy"><span class="persona-status-dot ${statusDot}"></span></div>
            <div>
              <div class="task-overview-title">${escapeHTML(m.name)} <span class="role-badge ${getRoleClass(m.role)}">${escapeHTML(getPersonaRoleTitle(m))}</span></div>
              <div class="task-overview-sub">${escapeHTML(proj.name || team.name)} · 当前分配任务：${escapeHTML(m.currentTaskSummary || (status === 'idle' ? '空闲待命' : '执行中'))}</div>
            </div>
          </div>
        </div>

        <div class="task-board-grid">
          ${renderTaskLane('🔵 正在做', memberBoardItems.doing, 'doing', '当前未执行任务')}
          ${renderTaskLane('🟡 待完成', memberBoardItems.todo, 'todo', '暂无待完成事项')}
          ${renderTaskLane('✅ 已完成', memberBoardItems.done, 'done', '暂无完成记录')}
        </div>
      `;

      // 上下文：与该成员相关的动态，无则回退最近 3 条
      if (ctx) {
        const acts = (team.activities || []).filter(a => (a.desc || '').includes(m.name));
        const list = acts.length > 0 ? acts.slice(0, 4) : (team.activities || []).slice(0, 3);
        ctx.innerHTML = list.length === 0
          ? `<div style="font-size:12px; color:var(--text-muted); padding:12px;">暂无相关动态</div>`
          : `<div class="activity-timeline">` + list.map(a => `
              <div class="activity-item">
                <div class="activity-time">${formatRelativeTime(a.time)}</div>
                <div class="activity-content">${escapeHTML(a.desc)}</div>
              </div>
            `).join('') + `</div>`;
      }
      if (currentDocRow) { currentDocRow.style.display = 'none'; currentDocRow.innerHTML = ''; }
    }

    /* ---- 旧函数：renderExecutionFocus / switchAgentDetailInWorkbench
           保留以兼容外部调用，内部委派到 v0.6.7 实现 ---- */
    function renderExecutionFocus(team, page) {
      // v0.6.7: 委派到新实现；调用方不再依赖此函数
      setSelectedAgent(team.id, 'leader');
      renderWorkbenchAgentDetail(team, page);
    }

    function switchAgentDetailInWorkbench(teamId, agentName) {
      // v0.6.7: 兼容旧调用 — agentName 可能是 Leader codename / member.name / member.id
      const team = currentState.teams.find(t => t.id === teamId);
      if (!team) return;
      const isLeader = !agentName || agentName === (team.masterCodename || team.master) || agentName === team.masterId;
      if (isLeader) return selectWorkbenchAgent(teamId, 'leader');
      const member = (team.members || []).find(m => m.id === agentName || m.name === agentName);
      selectWorkbenchAgent(teamId, member ? member.id : 'leader');
    }

    function renderAgentCurrentDoc(team, page, agentName) {
      const row = page.querySelector('[data-agent-current-doc]');
      if (!row) return;
      // mock：每个 agent 当前在读一篇 specs 文档
      const proj = team.currentProject;
      const specs = (proj?.docs || []).filter(d => d.category === 'specs');
      const doc = specs[0] || (proj?.docs || [])[0];
      if (!doc) { row.innerHTML = ''; row.style.display = 'none'; return; }
      row.style.display = '';
      row.innerHTML = `📄 当前在读：<strong>${escapeHTML(doc.category)}/${escapeHTML(doc.title)}</strong>`;
      row.onclick = () => {
        switchTeamTab(team.id, 'docs');
        setTimeout(() => selectDoc(team.id, doc.id), 30);
      };
    }

    /* ---- C. 项目文档 tab ---- */
    function renderDocsPane(team, page) {
      const proj = team.currentProject;
      const treeWrap = page.querySelector('[data-docs-tree]');
      const bc = page.querySelector('[data-docs-breadcrumb]');
      const statusStrip = page.querySelector('[data-docs-status-strip]');
      if (bc) bc.textContent = `docs/${proj?.id || team.id}/`;
      if (!treeWrap) return;
      if (!proj || !proj.docs || proj.docs.length === 0) {
        treeWrap.innerHTML = `<div style="padding:30px; color:var(--text-muted); text-align:center; font-size:12px;">暂无文档</div>`;
        return;
      }
      if (statusStrip) {
        const activeCount = proj.docs.filter(d => getDocCollab(d.id).collab === 'active').length;
        const humanCount = proj.docs.filter(d => ['waiting','conflict'].includes(getDocCollab(d.id).collab)).length;
        const latest = proj.docs.slice().sort((a,b) => (b.updatedTs || 0) - (a.updatedTs || 0))[0];
        statusStrip.innerHTML = `
          <span class="docs-status-pill active">⚡ 活跃 ${activeCount}</span>
          <span class="docs-status-pill warn">🟡 待 human ${humanCount}</span>
          <span class="docs-status-pill">🕒 最近 ${latest ? formatRelativeTime(latest.updatedTs) : '—'}</span>
        `;
      }
      const ui = getDocsUi(team.id);
      // 默认选中第一个
      if (!ui.selectedDocId) ui.selectedDocId = proj.docs[0].id;

      const catLabels = { specs:'01-需求与设计', plans:'02-计划与任务', reports:'03-实现与验证 / 04-交付审查', decisions:'05-决策与变更', notes:'交接记录 / 备忘' };
      const cats = ['specs','plans','reports','decisions','notes'];
      treeWrap.innerHTML = cats.map(cat => {
        const items = proj.docs.filter(d => d.category === cat);
        if (items.length === 0) return '';
        return `
          <div class="docs-tree-group" data-docs-group="${cat}">
            <div class="docs-tree-group-header" onclick="this.parentElement.classList.toggle('collapsed')">
              <span title="${cat}"><span class="arrow">▼</span> ${catLabels[cat] || cat}</span>
              <span class="docs-tree-group-count">${items.length}</span>
            </div>
            <div class="docs-tree-list">
              ${items.map(d => {
                const c = getDocCollab(d.id);
                const active = ui.selectedDocId === d.id ? 'active' : '';
                return `<div class="docs-tree-item ${active}" data-docid="${d.id}" onclick="selectDoc('${team.id}','${d.id}')">
                  <span class="doc-title" title="${escapeHTML(d.title)}">${escapeHTML(d.title)}</span>
                  <span class="doc-collab-icon" title="${c.collab}">${getCollabIcon(c.collab)}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');

      renderDocDetail(team, page, ui.selectedDocId);
    }

    function selectDoc(teamId, docId) {
      const page = document.getElementById(`page-team-${teamId}`);
      const team = currentState.teams.find(t => t.id === teamId);
      if (!page || !team) return;
      const ui = getDocsUi(teamId);
      ui.selectedDocId = docId;
      // 高亮树
      page.querySelectorAll('.docs-tree-item').forEach(el => {
        el.classList.toggle('active', el.dataset.docid === docId);
      });
      renderDocDetail(team, page, docId);
    }

    function getDocsLayoutFromControl(control) {
      const page = control?.closest?.('[id^="page-team-"]') || document.querySelector('.page.active');
      return page ? page.querySelector('.docs-layout') : null;
    }

    function syncDocsCollapseButtons(layout) {
      const page = layout?.closest?.('[id^="page-team-"]');
      if (!page) return;
      const treeBtn = page.querySelector('[data-docs-tree-toggle]');
      const detailBtn = page.querySelector('[data-docs-detail-toggle]');
      const treeCollapsed = layout.classList.contains('docs-tree-collapsed');
      const detailCollapsed = layout.classList.contains('docs-detail-collapsed');
      if (treeBtn) {
        treeBtn.classList.toggle('active', treeCollapsed);
        treeBtn.textContent = treeCollapsed ? '展开目录' : '折叠目录';
      }
      if (detailBtn) {
        detailBtn.classList.toggle('active', detailCollapsed);
        detailBtn.textContent = detailCollapsed ? '展开详情' : '折叠详情';
      }
    }

    function toggleDocsTreeCollapse(control) {
      const layout = getDocsLayoutFromControl(control);
      if (!layout) return;
      layout.classList.toggle('docs-tree-collapsed');
      syncDocsCollapseButtons(layout);
    }

    function toggleDocsDetailCollapse(control) {
      const layout = getDocsLayoutFromControl(control);
      if (!layout) return;
      layout.classList.toggle('docs-detail-collapsed');
      syncDocsCollapseButtons(layout);
    }

    function expandDocsTreeFromRail(event) {
      const layout = event.currentTarget?.closest?.('.docs-layout');
      if (!layout || !layout.classList.contains('docs-tree-collapsed')) return;
      layout.classList.remove('docs-tree-collapsed');
      syncDocsCollapseButtons(layout);
    }

    function expandDocsDetailFromRail(event) {
      const layout = event.currentTarget?.closest?.('.docs-layout');
      if (!layout || !layout.classList.contains('docs-detail-collapsed')) return;
      layout.classList.remove('docs-detail-collapsed');
      syncDocsCollapseButtons(layout);
    }

    function renderDocDetail(team, page, docId) {
      const proj = team.currentProject;
      const doc = (proj?.docs || []).find(d => d.id === docId);
      const titleEl = page.querySelector('[data-docs-detail-title]');
      const collabBar = page.querySelector('[data-docs-collab-bar]');
      const content = page.querySelector('[data-docs-content]');
      const preview = page.querySelector('[data-docs-preview]');
      const publishBtn = page.querySelector('[data-docs-publish]');
      const saveBtn = page.querySelector('[data-docs-save-draft]');
      const autosave = page.querySelector('[data-docs-autosave]');
      const ui = getDocsUi(team.id);
      if (!doc) {
        if (titleEl) titleEl.textContent = '请选择左侧文档';
        if (collabBar) collabBar.innerHTML = '';
        if (content) content.value = '';
        if (preview) preview.textContent = '请选择文档查看内容…';
        return;
      }
      const c = getDocCollab(doc.id);
      const catLabels = { specs:'01-需求与设计', plans:'02-计划与任务', reports:'03-实现与验证 / 04-交付审查', decisions:'05-决策与变更', notes:'交接记录 / 备忘' };
      if (titleEl) titleEl.textContent = `${catLabels[doc.category] || doc.category}/${doc.title} · v${doc.version}`;
      if (collabBar) {
        const lines = [];
        if (c.reader) {
          lines.push(`<div class="docs-collab-line clickable" onclick="alert('跳转到团队工作台并选中 ${c.reader}'); switchTeamTab('${team.id}','workbench');">📖 ${escapeHTML(c.reader)} 正在读取此文档</div>`);
        }
        lines.push(`<div class="docs-collab-line">✏️ ${escapeHTML(c.lastEditor)} ${escapeHTML(c.lastEditAgo)} 前修改</div>`);
        if (c.conflicts > 0) {
          lines.push(`<div class="docs-collab-line warn">⚠️ ${c.conflicts} 处冲突待 human 裁决</div>`);
        }
        collabBar.innerHTML = lines.join('');
      }
      if (content) {
        content.value = mockDocBody(doc);
      }
      if (preview) preview.innerHTML = renderMarkdownPreview(content ? content.value : mockDocBody(doc));
      if (publishBtn) {
        publishBtn.classList.remove('published');
        publishBtn.innerHTML = '📢 发布给 Agent';
      }
      if (saveBtn) saveBtn.disabled = ui.mode !== 'edit';
      if (autosave) autosave.textContent = `草稿已自动保存 · 12s 前`;
      applyDocViewMode(page, team.id);
    }

    function renderMarkdownPreview(markdown) {
      const lines = String(markdown || '').split('\n');
      let inList = false;
      const closeList = () => {
        if (!inList) return '';
        inList = false;
        return '</ul>';
      };
      return lines.map(line => {
        const raw = line.trim();
        if (!raw) return closeList();
        if (raw.startsWith('# ')) return closeList() + `<h1>${escapeHTML(raw.slice(2))}</h1>`;
        if (raw.startsWith('## ')) return closeList() + `<h2>${escapeHTML(raw.slice(3))}</h2>`;
        if (raw.startsWith('> ')) return closeList() + `<blockquote>${escapeHTML(raw.slice(2))}</blockquote>`;
        if (raw.startsWith('- ')) {
          const start = inList ? '' : '<ul>';
          inList = true;
          return `${start}<li>${escapeHTML(raw.slice(2))}</li>`;
        }
        return closeList() + `<p>${escapeHTML(raw)}</p>`;
      }).join('') + closeList();
    }

    function applyDocViewMode(page, teamId) {
      const ui = getDocsUi(teamId);
      const mode = ui.mode || 'preview';
      const content = page.querySelector('[data-docs-content]');
      const preview = page.querySelector('[data-docs-preview]');
      const saveBtn = page.querySelector('[data-docs-save-draft]');
      const modeBtns = page.querySelectorAll('[data-docs-mode-btn]');
      if (content && preview) {
        if (mode === 'edit') {
          content.style.display = '';
          preview.style.display = 'none';
        } else {
          preview.innerHTML = renderMarkdownPreview(content.value);
          preview.style.display = '';
          content.style.display = 'none';
        }
      }
      if (saveBtn) saveBtn.disabled = mode !== 'edit';
      modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.docsModeBtn === mode));
    }

    function setDocViewModeForActiveTeam(mode) {
      const pane = document.querySelector('[data-team-tab-pane="docs"].active');
      const page = pane?.closest('.page');
      const teamId = (page?.id || '').replace('page-team-','');
      if (!teamId || !page) return;
      const ui = getDocsUi(teamId);
      ui.mode = mode === 'edit' ? 'edit' : 'preview';
      applyDocViewMode(page, teamId);
    }

    function saveDocDraft() {
      const pane = document.querySelector('[data-team-tab-pane="docs"].active');
      const page = pane?.closest('.page');
      const teamId = (page?.id || '').replace('page-team-','');
      if (!teamId || !page) return;
      const ui = getDocsUi(teamId);
      if ((ui.mode || 'preview') !== 'edit') return;
      const autosave = page.querySelector('[data-docs-autosave]');
      if (autosave) autosave.textContent = '草稿已保存 · 刚刚';
      if (ui.draftSavedTimer) clearTimeout(ui.draftSavedTimer);
      ui.draftSavedTimer = setTimeout(() => {
        if (autosave) autosave.textContent = '草稿已自动保存 · 12s 前';
        ui.draftSavedTimer = null;
      }, 2000);
    }

    function mockDocBody(doc) {
      const tpl = [
`# ${doc.title}`,
``,
`> 类别: ${({ specs:'01-需求与设计', plans:'02-计划与任务', reports:'03-实现与验证 / 04-交付审查', decisions:'05-决策与变更', notes:'交接记录 / 备忘' })[doc.category] || doc.category} · 状态: ${doc.status} · 版本: ${doc.version}`,
``,
`## §1 背景与目标`,
`本文档描述 ${doc.title} 的核心目标、范围与关键约束。`,
``,
`## §2 当前状态`,
`- 作者：${doc.authorId}`,
`- 评审人：${(doc.reviewerIds || []).join(', ') || '—'}`,
`- 最近更新：${formatRelativeTime(doc.updatedTs)}`,
``,
`## §3 验收标准`,
`1. 功能可用性：所有核心路径覆盖且通过 e2e 测试`,
`2. 性能指标：P95 响应时间 < 200ms`,
`3. 文档同步：决策与变更须落入 decisions/`,
``,
`## §4 风险与待办`,
`- 依赖外部 SDK 版本未定`,
`- 等待架构评审确认存储选型`,
``,
`<!-- v0.6.6 mock：实际编辑器在生产版接入 -->`
      ];
      return tpl.join('\n');
    }

    function publishDoc() {
      const teamId = (document.querySelector('[data-team-tab-pane="docs"].active')?.closest('.page')?.id || '').replace('page-team-','');
      if (!teamId) return;
      const page = document.getElementById(`page-team-${teamId}`);
      if (!page) return;
      const btn = page.querySelector('[data-docs-publish]');
      const ui = getDocsUi(teamId);
      if (!btn) return;
      btn.classList.add('published');
      btn.innerHTML = `已发布 · 5s 内可撤销 <span class="undo-link" onclick="event.stopPropagation(); undoPublish('${teamId}')">撤销</span>`;
      if (ui.publishTimer) clearTimeout(ui.publishTimer);
      ui.publishTimer = setTimeout(() => {
        btn.classList.remove('published');
        btn.innerHTML = `📢 发布给 Agent`;
        ui.publishTimer = null;
      }, 5000);
    }

    function undoPublish(teamId) {
      const page = document.getElementById(`page-team-${teamId}`);
      if (!page) return;
      const btn = page.querySelector('[data-docs-publish]');
      const ui = getDocsUi(teamId);
      if (ui.publishTimer) { clearTimeout(ui.publishTimer); ui.publishTimer = null; }
      if (btn) {
        btn.classList.remove('published');
        btn.innerHTML = `📢 发布给 Agent`;
      }
    }

    function rollbackDoc() {
      alert('占位：回滚到上一个版本');
    }

    function toggleDocHistoryDrawer(open) {
      // 找到当前 active 的 docs pane
      const pane = document.querySelector('[data-team-tab-pane="docs"].active');
      if (!pane) return;
      const drawer = pane.querySelector('[data-doc-history-drawer]');
      const overlay = pane.querySelector('[data-doc-history-overlay]');
      const body = pane.querySelector('[data-doc-history-body]');
      if (!drawer) return;
      if (open) {
        // mock 5-8 条本文档变更因果链
        if (body) {
          const items = [
            { time:'14:32', text:`@human 修改「§3 验收标准」 → 已通知 worker-1 重读`, kind:'' },
            { time:'14:15', text:`@leader 决策「采用方案 A」 → 写入 decisions/04`, kind:'causal-decision' },
            { time:'13:50', text:`@worker-2 报告阻塞 → 追加到 reports/sprint-3`, kind:'causal-block' },
            { time:'13:20', text:`@worker-1 提交「§2 状态更新」 → 触发 review 流程`, kind:'' },
            { time:'12:48', text:`@oracle 评审通过「§1 背景与目标」 → 状态 in_review → approved`, kind:'causal-decision' },
            { time:'11:30', text:`@designer 补充 UI 截图 → 引用更新到 specs/坐席工作台`, kind:'' },
            { time:'昨日 17:02', text:`@worker-3 发现冲突段落 → 标注待裁决`, kind:'causal-block' }
          ];
          body.innerHTML = items.map(it => `<div class="doc-history-item ${it.kind}"><div class="dh-time">${it.time}</div><div class="dh-text">${escapeHTML(it.text)}</div></div>`).join('');
        }
        drawer.classList.add('open');
        if (overlay) overlay.classList.add('open');
      } else {
        drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
      }
    }

    function assignWorkerToTeam(workerId, teamId) {
        const worker = currentState.workers.find(w => w.id === workerId);
        const team = currentState.teams.find(t => t.id === teamId);
        if (!worker || !team) return;

        const nextWorkers = currentState.workers.filter(w => w.id !== workerId);
        const assignedWorker = {
          ...worker,
          status: worker.status === 'offline' ? 'offline' : 'idle',
          teamId,
          teamName: team.name,
          currentTaskSummary: worker.currentTaskSummary || ''
        };
        const nextTeams = currentState.teams.map(t => t.id === teamId
          ? { ...t, members: [...t.members, assignedWorker] }
          : t
        );

        // TODO: 接 V2 注册中心 API 后改为 POST /teams/:id/members
        updateState({ workers: nextWorkers, teams: nextTeams });
        closeJoinTeamModal();
    }

    // Modal logic
    let pendingAction = null;

    function confirmRemoveWorker(teamId, workerId) {
        document.getElementById('confirmModalOverlay').classList.add('open');
        document.getElementById('confirmModal').classList.add('open');
        document.getElementById('confirmModalTitle').innerText = '移出员工';
        document.getElementById('confirmModalText').innerText = '将从 Team 中移除该 Worker，其将返回可用池。是否继续？';
        document.getElementById('confirmModalBtn').disabled = false;
        pendingAction = () => {
            // Mock remove logic
            closeConfirmModal();
        };
    }

    function closeConfirmModal() {
        document.getElementById('confirmModalOverlay').classList.remove('open');
        document.getElementById('confirmModal').classList.remove('open');
        pendingAction = null;
    }

    document.getElementById('confirmModalBtn').addEventListener('click', () => {
        if(pendingAction) pendingAction();
    });

    let pendingJoinWorkerId = null;
    function openJoinTeamModal(workerId) {
        pendingJoinWorkerId = workerId;
        const sel = document.getElementById('joinTeamSelect');
        sel.innerHTML = currentState.teams.map(t => `<option value="${t.id}">${escapeHTML(t.name)} ${t.healthy?'':'(降级)'}</option>`).join('');
        document.getElementById('joinTeamModalOverlay').classList.add('open');
        document.getElementById('joinTeamModal').classList.add('open');
    }
    
    function closeJoinTeamModal() {
        document.getElementById('joinTeamModalOverlay').classList.remove('open');
        document.getElementById('joinTeamModal').classList.remove('open');
        pendingJoinWorkerId = null;
    }

    function submitJoinTeam() {
        const teamId = document.getElementById('joinTeamSelect').value;
        if (!pendingJoinWorkerId || !teamId) {
          closeJoinTeamModal();
          return;
        }
        assignWorkerToTeam(pendingJoinWorkerId, teamId);
    }

    // Init
    

    
    

    window.onload = () => {
        refreshAllViews();
        setInterval(() => {
            if(!isNetworkDisconnected) renderOverview();
        }, 10000);
        const initialChatTarget = new URLSearchParams(location.search).get('target') || 'all';
        renderChatTargetOptions();
        const chatTargetSelect = document.getElementById('chatTargetSelect');
        if (chatTargetSelect) chatTargetSelect.value = initialChatTarget;
        chatRuntimeState = loadChatRuntimeConfig(initialChatTarget);
        renderChatRuntimeConfig();
        renderLeaderWorkflowState();
    };

    /* =============================================================
       Chat Panel (v0.5.5) - 对话组件
       ============================================================= */
    function renderChatTargetOptions() {
      const sel = document.getElementById('chatTargetSelect');
      if (!sel) return;
      const opts = ['<option value="all">全局助手</option>'];
      (currentState.teams || []).forEach(t => {
        const dot = t.masterStatus === 'online' ? '🟢' : '⚪';
        opts.push(`<option value="${escapeHTML(t.masterId || t.id)}">${dot} ${escapeHTML(t.masterCodename || '')} · ${escapeHTML(t.name)}</option>`);
      });
      sel.innerHTML = opts.join('');
    }

    function getChatTargetLabel(targetId) {
      if (targetId === 'all' || !targetId) return '全局助手';
      const team = (currentState.teams || []).find(t => (t.masterId === targetId) || (t.id === targetId));
      if (!team) return '组长';
      return `${team.masterCodename || ''} · ${team.name}`;
    }

    const CHAT_MAX_TURNS = 10;

    let chatRuntimeState = {
      targetId: 'all',
      mode: 'bridge',
      port: '7000',
      bridgePort: '',
      sessionId: '',
      token: '',
      sessionTitle: 'AGENT-TEAM/全局助手/LEADER',
      sessionDirectory: '',
      sessionUpdatedAt: '',
      endpointLabel: 'local-7000',
      model: 'github-copilot/gpt-5.5',
      interactionMode: 'text-protocol',
      status: '未连接'
    };

    function getLeaderIdForChatTarget(targetId) {
      if (!targetId || targetId === 'all') return 'all';
      const team = findChatTargetTeam(targetId);
      return team ? team.id : targetId;
    }

    function getExpectedLeaderSessionTitle(targetId) {
      if (!targetId || targetId === 'all') return 'AGENT-TEAM/全局助手/LEADER';
      const team = findChatTargetTeam(targetId);
      return `AGENT-TEAM/${team ? team.name : getChatTargetLabel(targetId)}/LEADER`;
    }

    function getShortSessionId(sessionId) {
      const value = String(sessionId || '');
      return value ? `...${value.slice(-8)}` : '未绑定';
    }

    function formatSessionUpdatedAt(value) {
      if (!value) return '未知';
      const n = Number(value);
      if (!Number.isFinite(n)) return String(value);
      return new Date(n).toLocaleString('zh-CN', { hour12: false });
    }

    function getChatLeaderConfigKey(targetId) {
      const key = targetId || 'all';
      return `p3:xiaoyun:leader-runtime:${key}`;
    }

    function getChatHistoryKey(targetId, sessionId = chatRuntimeState?.sessionId || '') {
      return `p3:xiaoyun:chat-history:${targetId || 'all'}:${sessionId || 'no-session'}`;
    }

    function loadSharedChatHistory(targetId, sessionId = chatRuntimeState?.sessionId || '') {
      try { return JSON.parse(safeStorage.getItem(getChatHistoryKey(targetId, sessionId)) || '[]'); }
      catch { return []; }
    }

    function saveSharedChatHistory(targetId, history, sessionId = chatRuntimeState?.sessionId || '') {
      safeStorage.setItem(getChatHistoryKey(targetId, sessionId), JSON.stringify(trimChatHistoryToRecentTurns(history || [])));
    }

    function trimChatHistoryToRecentTurns(history, maxTurns = CHAT_MAX_TURNS) {
      const rows = Array.isArray(history) ? history : [];
      let userCount = 0;
      let start = 0;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i]?.role === 'user') userCount += 1;
        if (userCount >= maxTurns) { start = i; break; }
      }
      return userCount >= maxTurns ? rows.slice(start) : rows;
    }

    function addSharedChatHistory(role, text, attachments = []) {
      const keyTarget = chatRuntimeState?.targetId || 'all';
      const history = loadSharedChatHistory(keyTarget, chatRuntimeState?.sessionId || '');
      history.push({ role, text: text || '', attachments, time: Date.now() });
      saveSharedChatHistory(keyTarget, history, chatRuntimeState?.sessionId || '');
    }

    function renderSharedChatHistory(targetId) {
      const messages = document.getElementById('chatMessages');
      if (!messages) return false;
      const history = loadSharedChatHistory(targetId, chatRuntimeState?.sessionId || '');
      if (!history.length) return false;
      messages.classList.remove('empty');
      messages.innerHTML = '';
      history.forEach(item => appendChatMsg(item.role, item.text, item.attachments || [], false));
      return true;
    }

    function extractOpenCodeMessageText(message) {
      const parts = message?.parts || message?.message?.parts || message?.properties?.parts || [];
      if (Array.isArray(parts)) {
        return parts.map(part => part?.text || part?.content || part?.input?.text || '').filter(Boolean).join('\n').trim();
      }
      return String(message?.text || message?.content || '').trim();
    }

    function normalizeOpenCodeMessageRole(message) {
      const role = message?.role || message?.message?.role || message?.properties?.role || '';
      return role === 'user' ? 'user' : 'bot';
    }

    async function renderRecentSessionMessages(targetId, limit = 8) {
      if (!chatRuntimeState.sessionId || (chatRuntimeState.mode !== 'bridge' && chatRuntimeState.mode !== 'opencode')) return false;
      try {
        const params = new URLSearchParams({ port: chatRuntimeState.port || '7000', sessionId: chatRuntimeState.sessionId, limit: String(limit) });
        if (chatRuntimeState.token) params.set('token', chatRuntimeState.token);
        const url = chatRuntimeState.mode === 'bridge'
          ? `http://127.0.0.1:${chatRuntimeState.bridgePort || 5177}/api/opencode/session/messages?${params.toString()}&limit=${encodeURIComponent(String(limit))}`
          : `http://127.0.0.1:${chatRuntimeState.port || 7000}/session/${encodeURIComponent(chatRuntimeState.sessionId)}/message?limit=${encodeURIComponent(String(limit))}`;
        const res = await fetch(url);
        if (!res.ok) return false;
        const payload = await res.json();
        const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.messages) ? payload.messages : []);
        const messages = document.getElementById('chatMessages');
        if (!messages || !rows.length) return false;
        messages.classList.remove('empty');
        messages.innerHTML = '';
        rows.slice(-limit).forEach(row => {
          const text = extractOpenCodeMessageText(row);
          if (text) appendChatMsg(normalizeOpenCodeMessageRole(row), text, [], false);
        });
        updateChatTurnNavigator();
        return true;
      } catch {
        return false;
      }
    }

    function findChatTargetTeam(targetId) {
      if (!targetId || targetId === 'all') return null;
      return (currentState.teams || []).find(t => t.masterId === targetId || t.id === targetId) || null;
    }

    function loadChatRuntimeConfig(targetId) {
      const raw = safeStorage.getItem(getChatLeaderConfigKey(targetId));
      const fallback = { targetId: targetId || 'all', mode: 'bridge', port: '7000', bridgePort: '', sessionId: '', token: '', sessionTitle: getExpectedLeaderSessionTitle(targetId), sessionDirectory: '', sessionUpdatedAt: '', endpointLabel: 'local-7000', model: 'github-copilot/gpt-5.5', interactionMode: 'text-protocol', transportMode: 'normalized', status: '未连接' };
      try {
        return raw ? { ...fallback, ...JSON.parse(raw), targetId: targetId || 'all' } : fallback;
      } catch (err) {
        return fallback;
      }
    }

    function saveChatRuntimeConfig() {
      const mode = document.getElementById('chatModeSelect')?.value || 'bridge';
      const port = document.getElementById('chatOpenCodePort')?.value.trim() || '7000';
      const bridgePort = '';
      const sessionId = document.getElementById('chatOpenCodeSessionId')?.value.trim() || '';
      const token = document.getElementById('chatOpenCodeToken')?.value.trim() || '';
      const model = document.getElementById('chatModelSelect')?.value || chatRuntimeState.model || 'github-copilot/gpt-5.5';
      const interactionMode = document.getElementById('chatInteractionModeSelect')?.value || chatRuntimeState.interactionMode || 'text-protocol';
      const transportMode = document.getElementById('chatTransportModeSelect')?.value || chatRuntimeState.transportMode || 'normalized';
      const effectiveMode = transportMode === 'direct-opencode' ? 'opencode' : mode;
      chatRuntimeState = { ...chatRuntimeState, mode: effectiveMode, port, bridgePort, sessionId, token, model, interactionMode, transportMode };
      safeStorage.setItem(getChatLeaderConfigKey(chatRuntimeState.targetId), JSON.stringify({ mode: effectiveMode, port, bridgePort, sessionId, token, sessionTitle: chatRuntimeState.sessionTitle, sessionDirectory: chatRuntimeState.sessionDirectory, sessionUpdatedAt: chatRuntimeState.sessionUpdatedAt, endpointLabel: chatRuntimeState.endpointLabel, model, interactionMode, transportMode }));
      renderChatRuntimeConfig();
    }

    function renderLeaderSessionCard() {
      const card = document.getElementById('chatLeaderSessionCard');
      if (!card) return;
      const title = chatRuntimeState.sessionTitle || getExpectedLeaderSessionTitle(chatRuntimeState.targetId);
      const directory = chatRuntimeState.sessionDirectory ? `工作目录：${escapeHTML(chatRuntimeState.sessionDirectory)}` : '工作目录：等待绑定';
      const updated = `最近更新：${escapeHTML(formatSessionUpdatedAt(chatRuntimeState.sessionUpdatedAt))}`;
      const shortId = getShortSessionId(chatRuntimeState.sessionId);
      const attachCommand = getTuiAttachCommand();
      card.innerHTML = `
        <div class="chat-session-card-title">当前组长会话：${escapeHTML(title)}</div>
        <div class="chat-session-card-sub">${directory}<br>${updated} · Session ${escapeHTML(shortId)}</div>
        <div class="chat-session-card-code">TUI 中查找：${escapeHTML(title)}</div>
        <div class="chat-session-card-code chat-session-command">${escapeHTML(attachCommand)}</div>
        <div class="chat-session-card-code chat-session-command">${escapeHTML(getTuiSelectSessionCommand())}</div>
        <button type="button" class="chat-copy-command-btn" onclick="copyTuiAttachCommand()">复制 TUI attach 命令</button>`;
    }

    function getTuiAttachCommand() {
      const sessionId = chatRuntimeState.sessionId || '<sessionId>';
      const dir = chatRuntimeState.sessionDirectory || '/home/kk/workspace/p3';
      const port = chatRuntimeState.port || '7000';
      return `opencode attach http://127.0.0.1:${port} --dir ${dir} -s ${sessionId}`;
    }

    function getTuiSelectSessionCommand() {
      const sessionId = chatRuntimeState.sessionId || '<sessionId>';
      const dir = chatRuntimeState.sessionDirectory || '/home/kk/workspace/p3';
      const port = chatRuntimeState.port || '7000';
      return `curl -s -X POST 'http://127.0.0.1:${port}/tui/select-session?directory=${encodeURIComponent(dir)}' -H 'Content-Type: application/json' -d '{"sessionID":"${sessionId}"}'`;
    }

    async function copyTuiAttachCommand() {
      const command = `${getTuiAttachCommand()}\n${getTuiSelectSessionCommand()}`;
      try {
        await navigator.clipboard.writeText(command);
        setChatConnectionStatus('已复制 TUI 命令');
      } catch (err) {
        setChatConnectionStatus('复制失败，请手动复制');
      }
    }

    function renderChatRuntimeConfig() {
      const label = getChatTargetLabel(chatRuntimeState.targetId);
      const leaderInput = document.getElementById('chatLeaderLabel');
      const modeSelect = document.getElementById('chatModeSelect');
      const portInput = document.getElementById('chatOpenCodePort');
      const bridgePortInput = document.getElementById('chatBridgePort');
      const sessionInput = document.getElementById('chatOpenCodeSessionId');
      const tokenInput = document.getElementById('chatOpenCodeToken');
      const statusInput = document.getElementById('chatConnectionStatus');
      const modelSelect = document.getElementById('chatModelSelect');
      const interactionModeSelect = document.getElementById('chatInteractionModeSelect');
      const transportModeSelect = document.getElementById('chatTransportModeSelect');
      const modelSummary = document.getElementById('chatModelSummary');
      if (leaderInput) leaderInput.value = label;
      if (modeSelect) modeSelect.value = chatRuntimeState.mode;
      if (portInput) portInput.value = chatRuntimeState.port;
      if (bridgePortInput) bridgePortInput.value = '同源 /api';
      if (sessionInput) sessionInput.value = chatRuntimeState.sessionId;
      if (tokenInput) tokenInput.value = chatRuntimeState.token || '';
      if (statusInput) statusInput.value = chatRuntimeState.status;
      if (modelSelect) modelSelect.value = chatRuntimeState.model || 'github-copilot/gpt-5.5';
      if (transportModeSelect) transportModeSelect.value = chatRuntimeState.transportMode || 'normalized';
      if (interactionModeSelect) interactionModeSelect.value = chatRuntimeState.interactionMode || 'text-protocol';
      if (modelSummary) modelSummary.textContent = formatModelLabel(chatRuntimeState.model || 'github-copilot/gpt-5.5');
      renderLeaderSessionCard();
    }

    function parseModelRef(value) {
      const raw = String(value || 'github-copilot/gpt-5.5');
      const [providerID, ...rest] = raw.split('/');
      return { providerID: providerID || 'github-copilot', modelID: rest.join('/') || 'gpt-5.5' };
    }

    function formatModelLabel(value) {
      return parseModelRef(value).modelID.replace('-preview', '');
    }

    function updateChatExpandButton() {
      const panel = document.getElementById('chatPanel');
      const btn = document.getElementById('chatExpandBtn');
      if (!panel || !btn) return;
      const expanded = panel.classList.contains('expanded');
      btn.title = expanded ? '还原窗口' : '放大窗口';
      btn.setAttribute('aria-label', expanded ? '还原窗口' : '放大窗口');
      btn.setAttribute('data-window-control', expanded ? 'restore' : 'maximize');
      btn.innerHTML = expanded
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M4 14V5a1 1 0 0 1 1-1h9"/><path d="M10 20h9a1 1 0 0 0 1-1v-9"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H5a1 1 0 0 0-1 1v3"/><path d="M16 4h3a1 1 0 0 1 1 1v3"/><path d="M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M16 20h3a1 1 0 0 0 1-1v-3"/></svg>';
    }

    function toggleChatPanel(forceOpen) {
      const panel = document.querySelector('.chat-panel');
      if (!panel) return;
      if (!isXiaoyunPopupMode() && safeStorage.getItem('p3:xiaoyun:popup-open') === '1' && forceOpen !== false) {
        toggleFabMenu(false);
        return;
      }
      const willOpen = forceOpen === true
        ? true
        : forceOpen === false
          ? false
          : panel.classList.contains('hidden');
      if (willOpen) {
        // v0.6.4: 默认显示在屏幕中心偏右下
        const pw = panel.offsetWidth || 380;
        const ph = panel.offsetHeight || 540;
        const cx = Math.round((window.innerWidth - pw) / 2 + window.innerWidth * 0.08);
        const cy = Math.round((window.innerHeight - ph) / 2 + window.innerHeight * 0.06);
        panel.style.top = cy + 'px';
        panel.style.left = cx + 'px';
        panel.style.bottom = 'auto';
        panel.style.right = 'auto';
        panel.classList.remove('hidden');
        updateChatExpandButton();
        // fab-bot 头像保持可见，不隐藏 trigger
      } else {
        panel.classList.add('hidden');
      }
    }

    /* =============================================================
       v0.6.4: 浮动汉堡按钮交互（点击展开机器人 / 上下拖动 / 打开聊天）
       ============================================================= */
    function toggleFabMenu(forceOpen) {
      const trigger = document.getElementById('fabTrigger');
      const menu = document.getElementById('fabMenu');
      if (!trigger || !menu) return;
      const willOpen = forceOpen === true ? true
                     : forceOpen === false ? false
                     : !trigger.classList.contains('open');
      if (willOpen) {
        trigger.classList.add('open');
        menu.classList.add('open');
      } else {
        trigger.classList.remove('open');
        menu.classList.remove('open');
      }
    }

    function openAssistantFromMenu() {
      // fab-bot 点击：toggle 对话框（开↔关），fab 菜单收起
      toggleFabMenu(false);
      toggleChatPanel(); // 无参数 = toggle
    }

    // 注：根据用户反馈，展开后只能通过再次点击 fabTrigger 折叠，点击外部不自动关闭

    // fabTrigger：点击切换 + 上下拖动（X 固定 right:24px）
    (function() {
      const trigger = document.getElementById('fabTrigger');
      const menu = document.getElementById('fabMenu');
      if (!trigger) return;
      let dragging = false;
      let startY = 0;
      let startBottom = 24;
      let moved = false;
      const DRAG_THRESHOLD = 4;

      function syncMenuPosition() {
        // fab-menu 跟随 trigger 垂直位置（始终在按钮上方 8px）
        if (!menu) return;
        const triggerBottom = parseInt(trigger.style.bottom || '24', 10);
        const triggerHeight = trigger.offsetHeight || 36;
        menu.style.bottom = (triggerBottom + triggerHeight + 8) + 'px';
        menu.style.right = '12px';
        menu.style.top = 'auto';
        menu.style.left = 'auto';
      }

      trigger.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        dragging = true;
        moved = false;
        startY = e.clientY;
        startBottom = parseInt(getComputedStyle(trigger).bottom, 10) || 24;
        trigger.classList.add('dragging');
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        const dy = startY - e.clientY; // 向上拖 = bottom 增大
        if (Math.abs(dy) > DRAG_THRESHOLD) moved = true;
        let newBottom = startBottom + dy;
        const minBottom = 12;
        const maxBottom = window.innerHeight - trigger.offsetHeight - 12;
        if (newBottom < minBottom) newBottom = minBottom;
        if (newBottom > maxBottom) newBottom = maxBottom;
        trigger.style.bottom = newBottom + 'px';
        trigger.style.top = 'auto';
        syncMenuPosition();
      });

      document.addEventListener('mouseup', function() {
        if (!dragging) return;
        dragging = false;
        trigger.classList.remove('dragging');
        // 没拖动 → 视为点击，切换 fab-menu
        if (!moved) {
          toggleFabMenu();
          syncMenuPosition();
        }
      });
    })();


    // 对话框拖动
    (function() {
      let isDragging = false;
      let dragOffsetX = 0;
      let dragOffsetY = 0;

      function initDrag() {
        const panel = document.querySelector('.chat-panel');
        const header = document.querySelector('.chat-header');
        if (!panel || !header) return;

        header.addEventListener('mousedown', function(e) {
          // 不拦截按钮点击
          if (e.target.closest('button')) return;
          isDragging = true;
          const rect = panel.getBoundingClientRect();
          dragOffsetX = e.clientX - rect.left;
          dragOffsetY = e.clientY - rect.top;
          // 切换到 top/left 定位
          panel.style.top = rect.top + 'px';
          panel.style.left = rect.left + 'px';
          panel.style.bottom = 'auto';
          panel.style.right = 'auto';
          e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
          if (!isDragging) return;
          const panel = document.querySelector('.chat-panel');
          let newX = e.clientX - dragOffsetX;
          let newY = e.clientY - dragOffsetY;
          // 边界限制：不超出视口
          const maxX = window.innerWidth - panel.offsetWidth;
          const maxY = window.innerHeight - panel.offsetHeight;
          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));
          panel.style.left = newX + 'px';
          panel.style.top = newY + 'px';
          panel.style.bottom = 'auto';
          panel.style.right = 'auto';
        });

        document.addEventListener('mouseup', function() {
          isDragging = false;
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDrag);
      } else {
        initDrag();
      }
    })();

    // 对话框大小调整
    (function() {
      let resizeMode = null;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let startLeft = 0;
      let startTop = 0;

      function initResize() {
        const panel = document.getElementById('chatPanel');
        const handle = document.getElementById('chatResizeHandle');
        const handleNw = document.getElementById('chatResizeHandleNw');
        if (!panel) return;

        function startResize(e, mode) {
          if (e.button !== 0) return;
          const rect = panel.getBoundingClientRect();
          resizeMode = mode;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = rect.width;
          startHeight = rect.height;
          startLeft = rect.left;
          startTop = rect.top;
          panel.style.left = `${rect.left}px`;
          panel.style.top = `${rect.top}px`;
          panel.style.right = 'auto';
          panel.style.bottom = 'auto';
          panel.classList.remove('expanded');
          updateChatExpandButton();
          e.preventDefault();
          e.stopPropagation();
        }

        if (handle) handle.addEventListener('mousedown', (e) => startResize(e, 'se'));
        if (handleNw) handleNw.addEventListener('mousedown', (e) => startResize(e, 'nw'));

        document.addEventListener('mousemove', (e) => {
          if (!resizeMode) return;
          const minWidth = 360;
          const minHeight = 460;
          if (resizeMode === 'nw') {
            const maxWidth = startLeft + startWidth - 16;
            const maxHeight = startTop + startHeight - 16;
            const nextWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + startX - e.clientX));
            const nextHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + startY - e.clientY));
            const nextLeft = Math.max(16, startLeft + startWidth - nextWidth);
            const nextTop = Math.max(16, startTop + startHeight - nextHeight);
            panel.style.width = `${nextWidth}px`;
            panel.style.height = `${nextHeight}px`;
            panel.style.left = `${nextLeft}px`;
            panel.style.top = `${nextTop}px`;
          } else {
            const maxWidth = window.innerWidth - startLeft - 16;
            const maxHeight = window.innerHeight - startTop - 16;
            const nextWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + e.clientX - startX));
            const nextHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + e.clientY - startY));
            panel.style.width = `${nextWidth}px`;
            panel.style.height = `${nextHeight}px`;
          }
          panel.style.right = 'auto';
          panel.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => { resizeMode = null; });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResize);
      } else {
        initResize();
      }
    })();

    function expandChat() {
      const panel = document.querySelector('.chat-panel');
      if (panel) {
        panel.style.width = '';
        panel.style.height = '';
        panel.classList.toggle('expanded');
        updateChatExpandButton();
      }
    }

    async function switchChatTarget(targetId) {
      const messages = document.getElementById('chatMessages');
      if (!messages) return;
      const sel = document.getElementById('chatTargetSelect');
      if (sel) sel.value = targetId;
      const label = getChatTargetLabel(targetId);
      chatRuntimeState = loadChatRuntimeConfig(targetId);
      if (activeChatAdapter) {
        activeChatAdapter.disconnect();
        activeChatAdapter = null;
      }
      renderChatRuntimeConfig();
      const team = findChatTargetTeam(targetId);
      leaderWorkflowState = {
        teamName: team ? team.name : '全局助手',
        projectName: team && team.currentProject ? team.currentProject.name : '智能软件工厂控制台',
        phase: '需求澄清中',
        scope: team && team.currentProject ? '当前团队项目范围内的需求、执行与验收' : '全局需求澄清与团队路由'
      };
      renderLeaderWorkflowState();
      messages.classList.remove('empty');
      if (!(await renderRecentSessionMessages(targetId)) && !renderSharedChatHistory(targetId)) {
        messages.innerHTML = `
          <div class="chat-msg bot">
            <div class="chat-avatar">${BOT_AVATAR_SVG}</div>
            <div class="chat-bubble">已切换到 ${escapeHTML(label)}，有什么需要帮助的？</div>
          </div>`;
      }
      discoveredOpenCodeSessions = [];
      discoverOpenCodeSessions();
    }

    const BOT_AVATAR_SVG = `<img src="pic/xiaoyun/xiaoyun-global-assistant.png" alt="小云" />`;

    function appendChatMsg(role, text, attachments = [], persist = true) {
      const messages = document.getElementById('chatMessages');
      if (!messages) return;
      messages.classList.remove('empty');
      const div = document.createElement('div');
      div.className = `chat-msg ${role}`;
      div.dataset.turnRole = role;
      const avatar = role === 'user' ? '👤' : BOT_AVATAR_SVG;
      const imgs = attachments.map(file => `<img src="${escapeHTML(file.url)}" alt="${escapeHTML(file.filename || 'image')}" style="max-width:160px;max-height:120px;border-radius:8px;margin:4px 4px 0 0;border:1px solid #dbeafe;object-fit:cover;" />`).join('');
      div.innerHTML = `<div class="chat-avatar">${avatar}</div><div class="chat-bubble chat-rich">${renderChatRichText(text || '')}${imgs ? `<div>${imgs}</div>` : ''}</div>`;
      messages.appendChild(div);
      if (persist) addSharedChatHistory(role, text, attachments);
      pruneChatMessagesToRecentTurns();
      scrollChatMessagesToBottom('auto');
      updateChatTurnNavigator();
    }

    function pruneChatMessagesToRecentTurns(maxTurns = CHAT_MAX_TURNS) {
      const messages = document.getElementById('chatMessages');
      if (!messages) return;
      const userTurns = Array.from(messages.querySelectorAll('.chat-msg.user'));
      if (userTurns.length <= maxTurns) return;
      const firstKeep = userTurns[userTurns.length - maxTurns];
      while (messages.firstElementChild && messages.firstElementChild !== firstKeep) {
        messages.firstElementChild.remove();
      }
    }

    function autoResizeChatTextarea(textarea) {
      if (!textarea) return;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }

    let chatPendingFiles = [];

    function renderChatAttachments() {
      const box = document.getElementById('chatAttachments');
      if (!box) return;
      box.classList.toggle('has-items', chatPendingFiles.length > 0);
      box.innerHTML = chatPendingFiles.map((file, index) => `<div class="chat-attachment"><img src="${escapeHTML(file.url)}" alt="${escapeHTML(file.filename)}"/><button type="button" onclick="removeChatAttachment(${index})">×</button></div>`).join('');
    }

    function removeChatAttachment(index) {
      chatPendingFiles.splice(index, 1);
      renderChatAttachments();
    }

    function addChatImageFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        chatPendingFiles.push({ type: 'file', mime: file.type || 'image/png', url: String(reader.result || ''), filename: file.name || `paste-${Date.now()}.png` });
        chatPendingFiles = chatPendingFiles.slice(0, 4);
        renderChatAttachments();
      };
      reader.readAsDataURL(file);
    }

    function scrollChatMessagesToBottom(behavior = 'auto') {
      const messages = document.getElementById('chatMessages');
      if (!messages) return;
      const apply = () => {
        messages.scrollTo({ top: messages.scrollHeight, behavior });
        messages.scrollTop = messages.scrollHeight;
      };
      apply();
      requestAnimationFrame(apply);
      setTimeout(apply, 80);
    }

    function updateChatTurnNavigator() {
      const messages = document.getElementById('chatMessages');
      const nav = document.getElementById('chatTurnNav');
      if (!messages || !nav) return;
      const configPanel = document.getElementById('chatConnectionPanel');
      if (configPanel && !configPanel.classList.contains('hidden')) {
        nav.classList.remove('visible');
        return;
      }
      const turns = Array.from(messages.querySelectorAll('.chat-msg.user')).slice(-8);
      if (!turns.length) {
        nav.innerHTML = '';
        nav.classList.remove('visible');
        return;
      }
      turns.forEach((turn, index) => {
        if (!turn.id) turn.id = `chat-turn-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`;
      });
      const buttons = turns.map(turn => {
        const isDecision = Boolean(turn.nextElementSibling && turn.nextElementSibling.querySelector('.chat-decision-card, .chat-confirm-card'));
        const cls = isDecision ? 'decision user' : 'user';
        const title = isDecision ? '跳到触发决策的用户消息' : '跳到用户消息';
        return `<button type="button" class="chat-turn-dot ${cls}" title="${title}" onclick="jumpToChatTurn('${turn.id}')"></button>`;
      }).join('');
      nav.innerHTML = buttons + '<button type="button" class="chat-turn-dot bottom" title="回到最新" onclick="scrollChatToBottom()"></button>';
      nav.classList.toggle('visible', turns.length >= 3);
    }

    function jumpToChatTurn(id) {
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const nav = document.getElementById('chatTurnNav');
      if (!nav) return;
      nav.querySelectorAll('.chat-turn-dot').forEach(btn => btn.classList.remove('active'));
      const buttons = Array.from(nav.querySelectorAll('.chat-turn-dot'));
      const idx = Array.from(document.querySelectorAll('#chatMessages .chat-msg.user')).slice(-8).findIndex(el => el.id === id);
      if (buttons[idx]) buttons[idx].classList.add('active');
    }

    function scrollChatToBottom() {
      scrollChatMessagesToBottom('smooth');
      const nav = document.getElementById('chatTurnNav');
      if (nav) {
        nav.querySelectorAll('.chat-turn-dot').forEach(btn => btn.classList.remove('active'));
        nav.querySelector('.chat-turn-dot.bottom')?.classList.add('active');
      }
    }

    function renderChatRichText(text) {
      if (!text) return '';
      const decision = parseDecisionBlock(text);
      if (decision) return renderDecisionCard(decision);
      let src = String(text).replace(/\r\n/g, '\n');
      const codeBlocks = [];
      src = src.replace(/```([\s\S]*?)```/g, (_, code) => {
        const token = `@@CODE_${codeBlocks.length}@@`;
        codeBlocks.push(`<pre class="chat-code-block">${escapeHTML(code.trim())}</pre>`);
        return token;
      });
      let html = escapeHTML(src)
        .replace(/^\[WARNING\]\s*(.*)$/gm, '<div class="chat-callout warning">⚠️ $1</div>')
        .replace(/^\[ERROR\]\s*(.*)$/gm, '<div class="chat-callout error">⛔ $1</div>')
        .replace(/^\[DONE\]\s*(.*)$/gm, '<div class="chat-callout done">✅ $1</div>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
        .replace(/\n/g, '<br>');
      codeBlocks.forEach((block, i) => {
        html = html.replace(`@@CODE_${i}@@`, block);
      });
      return html;
    }

    function splitLabelPair(text) {
      const raw = String(text || '').trim();
      const m = raw.match(/^([A-Za-z0-9_-]+)[\.、:)：]\s*(.*)$/);
      return { id: m ? m[1] : '', label: m ? m[2] : raw };
    }

    function normalizeOptionMarkdown(text) {
      const src = String(text || '').trim();
      if (/^QUESTION\b/i.test(src) && /\/QUESTION\s*$/i.test(src)) {
        return `[QUESTION]${src.replace(/^QUESTION\b/i, '').replace(/\/QUESTION\s*$/i, '')}[/QUESTION]`;
      }
      if (src.includes('\n')) {
        const lines = src.split('\n').map(l => l.trim()).filter(Boolean);
        const optionLines = lines.filter(l => /^[-*]\s*[A-D][\.、:)：]/i.test(l));
        if (optionLines.length >= 2) {
          const questionLine = [...lines].reverse().find(l => !/^[-*]\s*/.test(l) && /[?？：:]$/.test(l)) || '请选择一个选项';
          return `[QUESTION]\ntitle: 请选择\nquestion: ${questionLine.replace(/^问题[:：]\s*/, '')}\noptions:\n${optionLines.join('\n')}\n`;
        }
      }
      return src;
    }

    function parseDecisionBlock(text) {
      const raw = String(text || '').trim();
      const multiQuestion = parseNaturalQuestionSet(raw);
      if (multiQuestion) return multiQuestion;
      const naturalTabs = parseNaturalTabbedQuestion(raw);
      if (naturalTabs) return naturalTabs;
      const bundle = parseDecisionBundle(raw);
      if (bundle) return bundle;
      const src = normalizeOptionMarkdown(raw);
      const questionMatch = src.match(/\[QUESTION\]([\s\S]*?)(?:\[\/QUESTION\])?$/i);
      const decisionMatch = src.match(/\[DECISION_REQUEST\]([\s\S]*?)\[\/DECISION_REQUEST\]/i);
      if (!questionMatch && !decisionMatch) return null;
      const body = (decisionMatch ? decisionMatch[1] : questionMatch[1]).trim();
      const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
      const tabsQuestion = parseQuestionTabs(lines);
      if (tabsQuestion) return tabsQuestion;
      const data = { title: '需要确认', source: '', question: '', recommendation: '', options: [] };
      let inOptions = false;
      lines.forEach(line => {
        if (/^title[:：]/i.test(line)) data.title = line.replace(/^title[:：]/i, '').trim();
        else if (/^source[:：]/i.test(line)) data.source = line.replace(/^source[:：]/i, '').trim();
        else if (/^question[:：]/i.test(line)) data.question = line.replace(/^question[:：]/i, '').trim();
        else if (/^recommendation[:：]/i.test(line)) data.recommendation = line.replace(/^recommendation[:：]/i, '').trim();
        else if (/^options[:：]/i.test(line)) inOptions = true;
        else if ((inOptions && /^[-*]\s*/.test(line)) || /^[A-Za-z0-9_-]+[\.、:)：]\s*/.test(line)) {
          const raw = line.replace(/^[-*]\s*/, '').trim();
          const pair = splitLabelPair(raw);
          data.options.push({ id: pair.id || String(data.options.length + 1), label: pair.label });
        } else if (!data.question) data.question = line;
      });
      if (!data.options.length) data.options = [
        { id: 'A', label: '采用 Leader 推荐' },
        { id: 'B', label: '让 Leader 自行决定' }
      ];
      return data;
    }

    function parseNaturalQuestionSet(text) {
      const src = String(text || '').trim();
      if (!src.includes('\n')) return null;
      if (/\[QUESTION\]|\bQUESTION\b|\bTABS\b|\[DECISION_BUNDLE\]/i.test(src)) return null;
      const sections = src.split(/^---\s*$/m).map(s => s.trim()).filter(Boolean);
      if (sections.length < 2) return null;
      const questions = sections.map((section, index) => {
        const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
        const titleLine = lines.find(line => /^(问题|Question)\s*\d*[:：]/i.test(line));
        const title = titleLine ? titleLine.replace(/^(问题|Question)\s*\d*[:：]/i, '').trim() : `问题 ${index + 1}`;
        const optionLines = lines.filter(line => /^[A-Za-z0-9_-]+[\.、:)：]\s*/.test(line));
        const options = optionLines.map(line => {
          const pair = splitLabelPair(line);
          return { id: pair.id || String(optionLines.indexOf(line) + 1), label: pair.label };
        });
        return { id: `q${index + 1}`, title, options };
      }).filter(q => q.options.length >= 2);
      return questions.length >= 2 ? { type: 'question-wizard', title: '需要确认', questions } : null;
    }

    function parseNaturalTabbedQuestion(text) {
      const src = String(text || '').trim();
      if (!src.includes('\n')) return null;
      if (/\[QUESTION\]|\bQUESTION\b|\bTABS\b|\[DECISION_BUNDLE\]/i.test(src)) return null;
      const lines = src.split('\n').map(l => l.trim()).filter(Boolean);
      const categoryLineIndex = lines.findIndex(line => /^(分类|标签|类别|类型)[:：]/.test(line));
      if (categoryLineIndex < 0) return null;
      const categoryLine = lines[categoryLineIndex].replace(/^(分类|标签|类别|类型)[:：]\s*/, '');
      const categories = categoryLine.split(/\s*[\/／|｜、,，]\s*/).map(s => s.trim()).filter(Boolean);
      if (categories.length < 2) return null;
      const optionLines = lines.filter(line => /^[A-Za-z0-9_-]+[\.、:)：]\s*/.test(line));
      if (optionLines.length < 2) return null;
      const tasks = optionLines.map(line => splitLabelPair(line));
      const taskPrefix = /^[^：:]{1,12}[：:]\s*/;
      const flatTasks = tasks.map(task => ({
        id: task.id,
        label: task.label.replace(taskPrefix, ''),
        category: (task.label.match(/^([^：:]{1,12})[：:]/) || [])[1] || ''
      }));
      const tabs = categories.map(cat => ({
        id: cat,
        title: cat,
        options: flatTasks.map(task => ({
          id: `${cat}-${task.id}`,
          choice: task.id,
          label: `${task.id}. ${task.label}`
        }))
      }));
      if (!tabs.length) return null;
      const question = lines.slice(0, categoryLineIndex).find(line => /[?？：:]$/.test(line)) || '请选择分类和任务：';
      return { type: 'question-tabs', title: '需要确认', question, tabs, tuiLike: true };
    }

    function parseQuestionTabs(lines) {
      const tabsIndex = lines.findIndex(line => /^TABS[:：]?$/i.test(line));
      if (tabsIndex < 0) return null;
      const titleLine = lines.find(line => /^title[:：]/i.test(line));
      const questionLine = lines.find(line => /^question[:：]/i.test(line)) || lines.slice(0, tabsIndex).reverse().find(line => !/^title[:：]/i.test(line));
      const tabs = [];
      const tasks = [];
      let inTabs = false;
      lines.forEach(line => {
        if (/^TABS[:：]?$/i.test(line)) { inTabs = true; return; }
        if (/^OPTIONS[:：]?$/i.test(line)) { inTabs = false; return; }
        const raw = line.replace(/^[-*]\s*/, '').trim();
        const pair = splitLabelPair(raw);
        if (inTabs && /^[-*]\s*/.test(line)) {
          tabs.push({ id: pair.id || `tab${tabs.length + 1}`, title: pair.label });
        } else if (!inTabs && /^[A-Za-z0-9_-]+[\.、:)：]\s*/.test(raw)) {
          tasks.push({ id: pair.id || String(tasks.length + 1), label: pair.label });
        }
      });
      if (!tabs.length || !tasks.length) return null;
      const normalizedTabs = tabs.map((tab, index) => ({
        id: tab.id,
        title: tab.title,
        options: tasks.filter(task => task.label.startsWith(`${tab.title}：`) || task.label.startsWith(`${tab.title}:`)).map(task => ({
          id: task.id,
          label: task.label.replace(new RegExp(`^${escapeRegExp(tab.title)}[：:]\\s*`), '')
        }))
      })).filter(tab => tab.options.length);
      return {
        type: 'question-tabs',
        title: titleLine ? titleLine.replace(/^title[:：]/i, '').trim() : '需要确认',
        question: questionLine ? questionLine.replace(/^question[:：]/i, '').trim() : '请选择分类和任务',
        tabs: normalizedTabs.length ? normalizedTabs : tabs.map(tab => ({ ...tab, options: [] }))
      };
    }

    function escapeRegExp(text) {
      return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function parseDecisionBundle(src) {
      let normalized = String(src || '').trim();
      if (/^DECISION_BUNDLE\b/i.test(normalized) && /\/DECISION_BUNDLE\s*$/i.test(normalized)) {
        normalized = `[DECISION_BUNDLE]${normalized.replace(/^DECISION_BUNDLE\b/i, '').replace(/\/DECISION_BUNDLE\s*$/i, '')}[/DECISION_BUNDLE]`;
      }
      const match = normalized.match(/\[DECISION_BUNDLE\]([\s\S]*?)\[\/DECISION_BUNDLE\]/i);
      if (!match) return null;
      const body = match[1].trim();
      const sections = body.split(/^---\s*$/m).map(s => s.trim()).filter(Boolean);
      const bundle = { type: 'bundle', title: '复杂决策', tabs: [] };
      sections.forEach((section, index) => {
        const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
        const tab = { id: `tab${index + 1}`, title: `议题${index + 1}`, question: '', recommendation: '', options: [] };
        lines.forEach(line => {
          if (/^title[:：]/i.test(line) && index === 0 && !bundle.tabs.length) bundle.title = line.replace(/^title[:：]/i, '').trim();
          else if (/^tab[:：]/i.test(line)) tab.title = line.replace(/^tab[:：]/i, '').trim();
          else if (/^question[:：]/i.test(line)) tab.question = line.replace(/^question[:：]/i, '').trim();
          else if (/^recommendation[:：]/i.test(line)) tab.recommendation = line.replace(/^recommendation[:：]/i, '').trim();
          else if (/^[-*]\s*/.test(line) || /^[A-Za-z0-9_-]+[\.、:)：]\s*/.test(line)) {
            const raw = line.replace(/^[-*]\s*/, '').trim();
            const m = raw.match(/^([A-Za-z0-9_-]+)[\.、:)：]\s*(.*)$/);
            tab.options.push({ id: m ? m[1] : String(tab.options.length + 1), label: m ? m[2] : raw });
          } else if (!tab.question && !/^title[:：]/i.test(line)) tab.question = line;
        });
        if (tab.question || tab.options.length || tab.recommendation) bundle.tabs.push(tab);
      });
      return bundle.tabs.length ? bundle : null;
    }

    function renderDecisionCard(data) {
      if (data.type === 'bundle') return renderDecisionBundle(data);
      if (data.type === 'question-wizard') return renderQuestionWizard(data);
      if (data.type === 'question-tabs') return renderQuestionTabs(data);
      const optionHtml = data.options.map(opt => {
        const prompt = `[ANSWER]\nquestion: ${data.question || data.title || '需要确认'}\nchoice: ${opt.id}\nlabel: ${opt.label}\n[/ANSWER]`;
        return `<button type="button" class="chat-decision-option" data-answer="${escapeHTML(prompt)}">${escapeHTML(opt.id)}. ${escapeHTML(opt.label)}</button>`;
      }).join('');
      return `
        <div class="chat-decision-card">
          <div class="chat-decision-title">${escapeHTML(data.title || '需要确认')}</div>
          ${data.source ? `<div class="chat-decision-meta">来源：${escapeHTML(data.source)}</div>` : ''}
          ${data.question ? `<div>${escapeHTML(data.question)}</div>` : ''}
          ${data.recommendation ? `<div class="chat-callout">Leader 建议：${escapeHTML(data.recommendation)}</div>` : ''}
          <div class="chat-decision-options">${optionHtml}</div>
        </div>`;
    }

    function renderQuestionTabs(data) {
      if (data.tuiLike) {
        return renderQuestionWizard({
          title: data.title || '需要确认',
          questions: data.tabs.map(tab => ({ id: tab.id, title: tab.title, options: tab.options })),
          question: data.question
        });
      }
      const uid = `qt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const tabs = data.tabs.map((tab, index) => `<button type="button" class="chat-decision-tab ${index === 0 ? 'active' : ''}" data-tab-card="${uid}" data-tab-index="${index}">${escapeHTML(tab.title)}</button>`).join('');
      const panels = data.tabs.map((tab, index) => `
        <div class="chat-decision-tab-panel ${index === 0 ? 'active' : ''}" data-tab-card="${uid}" data-tab-panel="${index}">
          <div class="chat-decision-options">${tab.options.map(opt => {
            const prompt = `[ANSWER]\ntab: ${tab.title}\nquestion: ${data.question}\nchoice: ${opt.id}\nlabel: ${opt.label}\n[/ANSWER]`;
            return `<button type="button" class="chat-decision-option" data-answer="${escapeHTML(prompt)}">${escapeHTML(opt.id)}. ${escapeHTML(opt.label)}</button>`;
          }).join('')}</div>
        </div>`).join('');
      return `
        <div class="chat-decision-card" data-question-tabs="true">
          <div class="chat-decision-title">${escapeHTML(data.title || '需要确认')}</div>
          ${data.question ? `<div>${escapeHTML(data.question)}</div>` : ''}
          <div class="chat-decision-tabs">${tabs}</div>
          ${panels}
        </div>`;
    }

    function renderQuestionWizard(data) {
      const uid = `qw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const questions = data.questions || [];
      const tabs = questions.map((q, index) => `<button type="button" class="xy-question-tab ${index === 0 ? 'active' : ''}" data-qw-card="${uid}" data-qw-index="${index}">${escapeHTML(q.title)}</button>`).join('') + `<button type="button" class="xy-question-tab" data-qw-card="${uid}" data-qw-index="confirm">确认</button>`;
      const panels = questions.map((q, index) => `
        <div class="xy-question-panel ${index === 0 ? 'active' : ''}" data-qw-card="${uid}" data-qw-panel="${index}">
          <div class="xy-question-title">${escapeHTML(q.title)}</div>
          ${q.options.map(opt => `<button type="button" class="xy-question-option" data-qw-card="${uid}" data-qw-question="${index}" data-qw-choice="${escapeHTML(opt.id)}" data-qw-label="${escapeHTML(opt.label)}"><span>${escapeHTML(opt.id)}.</span><span>${escapeHTML(opt.label)}</span></button>`).join('')}
        </div>`).join('');
      const review = `
        <div class="xy-question-panel" data-qw-card="${uid}" data-qw-panel="confirm">
          <div class="xy-question-title">Review</div>
          <div class="xy-question-review" data-qw-review="${uid}">${questions.map(q => `<div>${escapeHTML(q.title)}：<strong>未选择</strong></div>`).join('')}</div>
          <div class="xy-question-actions">
            <button type="button" data-qw-back="${uid}">返回修改</button>
            <button type="button" class="primary" data-qw-submit="${uid}">确认提交</button>
          </div>
        </div>`;
      const payload = escapeHTML(JSON.stringify({ title: data.title || '需要确认', question: data.question || '', questions }));
      const nativeAttrs = data.nativeQuestionId ? ` data-native-question-id="${escapeHTML(data.nativeQuestionId)}"` : '';
      return `
        <div class="xy-question-card" data-qw="${uid}" data-qw-payload="${payload}"${nativeAttrs}>
          <div class="xy-question-tabs">${tabs}</div>
          ${data.question ? `<div class="chat-decision-meta">${escapeHTML(data.question)}</div>` : ''}
          ${panels}${review}
          <div class="xy-question-help">←→ 切换　Enter 提交　Esc 取消</div>
        </div>`;
    }

    function appendNativeQuestionCard(request) {
      const messages = document.getElementById('chatMessages');
      if (!messages || !request || !Array.isArray(request.questions)) return;
      clearStreamingPlaceholderBeforeInteraction();
      const questions = request.questions.map((q, index) => ({
        id: `q${index + 1}`,
        title: q.header || q.question || `问题 ${index + 1}`,
        options: (q.options || []).map((opt, optIndex) => {
          const label = typeof opt === 'string' ? opt : (opt.label || opt.value || String(opt));
          return { id: String.fromCharCode(65 + optIndex), label };
        })
      })).filter(q => q.options.length);
      if (!questions.length) return;
      messages.classList.remove('empty');
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.dataset.turnRole = 'bot';
      div.innerHTML = `<div class="chat-avatar">${BOT_AVATAR_SVG}</div><div class="chat-bubble chat-rich">${renderQuestionWizard({ title: 'Questions', questions, nativeQuestionId: request.id })}</div>`;
      messages.appendChild(div);
      scrollChatMessagesToBottom('auto');
      updateChatTurnNavigator();
    }

    function appendInteractionQuestionCard(interaction) {
      const messages = document.getElementById('chatMessages');
      if (!messages || !interaction || interaction.interactionType !== 'questions') return;
      if (document.querySelector(`[data-interaction-id="${CSS.escape(interaction.id)}"]`)) return;
      clearStreamingPlaceholderBeforeInteraction();
      const questions = (interaction.questions || []).map((q, index) => ({
        id: q.id || `q${index + 1}`,
        title: q.title || q.prompt || `Question ${index + 1}`,
        prompt: q.prompt || q.title || '',
        inputType: q.inputType || 'text',
        required: q.required !== false,
        options: Array.isArray(q.options) ? q.options : [],
        placeholder: q.placeholder || ''
      }));
      if (!questions.length) return;
      messages.classList.remove('empty');
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.dataset.turnRole = 'bot';
      div.innerHTML = `<div class="chat-avatar">${BOT_AVATAR_SVG}</div><div class="chat-bubble chat-rich">${renderInteractionQuestions({ ...interaction, questions })}</div>`;
      messages.appendChild(div);
      scrollChatMessagesToBottom('auto');
      updateChatTurnNavigator();
    }

    function clearStreamingPlaceholderBeforeInteraction() {
      const streaming = document.querySelector('#chatMessages .chat-bubble[data-streaming="true"]');
      const message = streaming?.closest('.chat-msg.bot');
      if (streaming && !streaming.textContent.trim() && message) {
        message.remove();
      }
      if (activeChatAdapter) activeChatAdapter.streamingBubble = null;
    }

    function renderInteractionQuestions(interaction) {
      const uid = `iq-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const questions = interaction.questions || [];
      const tabs = shouldShowInteractionTabs(questions)
        ? `<div class="xy-question-tabs">${questions.map((q, index) => `<button type="button" class="xy-question-tab ${index === 0 ? 'active' : ''}" data-iq-card="${uid}" data-iq-index="${index}">${escapeHTML(q.title)}</button>`).join('')}</div>`
        : '';
      const panels = questions.map((q, index) => `
        <div class="xy-question-panel ${index === 0 ? 'active' : ''}" data-iq-card="${uid}" data-iq-panel="${index}">
          ${shouldShowInteractionPanelTitle(questions, q) ? `<div class="xy-question-title">${escapeHTML(q.title)}</div>` : ''}
          <div class="chat-decision-meta">${escapeHTML(q.prompt || '')}</div>
          ${renderInteractionQuestionInput(uid, q, index)}
        </div>`).join('');
      const payload = escapeHTML(JSON.stringify({ id: interaction.id, questions }));
      return `
        <div class="xy-question-card" data-iq="${uid}" data-iq-payload="${payload}" data-interaction-id="${escapeHTML(interaction.id)}">
          <div class="chat-decision-title">${escapeHTML(interaction.title || `Asked ${questions.length} questions`)}</div>
          ${tabs}
          ${panels}
          <div class="xy-question-review" data-iq-review="${uid}">${questions.map(q => `<div>${escapeHTML(q.title)}：<strong>未填写</strong></div>`).join('')}</div>
          <div class="xy-question-state" data-iq-state="${uid}">等待提交或取消</div>
          <div class="xy-question-actions">
            <button type="button" data-iq-dismiss="${uid}">取消</button>
            <button type="button" class="primary" data-iq-submit="${uid}">确认</button>
          </div>
        </div>`;
    }

    function shouldShowInteractionTabs(questions) {
      return questions.length > 1;
    }

    function shouldShowInteractionPanelTitle(questions, q) {
      if (questions.length > 1) return true;
      const title = String(q?.title || '').trim();
      const prompt = String(q?.prompt || '').trim();
      return !!title && !!prompt && title !== prompt;
    }

    function renderInteractionQuestionInput(uid, q, index) {
      if (q.inputType === 'single-choice' || q.inputType === 'select') {
        return `<div>${q.options.map(opt => `<button type="button" class="xy-question-option" data-iq-mode="single" data-iq-card="${uid}" data-iq-question="${index}" data-iq-value="${escapeHTML(opt.value)}" data-iq-label="${escapeHTML(opt.label)}"><span class="xy-option-mark">( )</span><span class="xy-option-label">${escapeHTML(opt.id || '')}　${escapeHTML(opt.label)}</span></button>`).join('')}</div>`;
      }
      if (q.inputType === 'multi-choice') {
        return `<div>${q.options.map(opt => `<button type="button" class="xy-question-option" data-iq-mode="multi" data-iq-multi="true" data-iq-card="${uid}" data-iq-question="${index}" data-iq-value="${escapeHTML(opt.value)}" data-iq-label="${escapeHTML(opt.label)}"><span class="xy-option-mark">[ ]</span><span class="xy-option-label">${escapeHTML(opt.id || '')}　${escapeHTML(opt.label)}</span></button>`).join('')}</div>`;
      }
      return q.inputType === 'textarea'
        ? `<textarea class="xy-question-input" data-iq-card="${uid}" data-iq-question="${index}" placeholder="${escapeHTML(q.placeholder || '请输入')}" rows="3"></textarea>`
        : `<input class="xy-question-input" data-iq-card="${uid}" data-iq-question="${index}" placeholder="${escapeHTML(q.placeholder || '请输入')}" />`;
    }

    function renderDecisionBundle(data) {
      const tabs = data.tabs.map(tab => `<span class="chat-decision-tab">${escapeHTML(tab.title)}</span>`).join('');
      const bodies = data.tabs.map(tab => `
        <div class="chat-callout">
          <strong>${escapeHTML(tab.title)}</strong><br>
          ${escapeHTML(tab.question || '')}
          ${tab.recommendation ? `<br>Leader 建议：${escapeHTML(tab.recommendation)}` : ''}
          ${tab.options.length ? `<div class="chat-decision-options">${tab.options.map(opt => { const prompt = `[ANSWER]\ntab: ${tab.title}\nquestion: ${tab.question || ''}\nchoice: ${opt.id}\nlabel: ${opt.label}\n[/ANSWER]`; return `<button type="button" class="chat-decision-option" data-answer="${escapeHTML(prompt)}">${escapeHTML(opt.id)}. ${escapeHTML(opt.label)}</button>`; }).join('')}</div>` : ''}
        </div>`).join('');
      return `
        <div class="chat-decision-card">
          <div class="chat-decision-title">${escapeHTML(data.title || '复杂决策')}</div>
          <div class="chat-decision-tabs">${tabs}<span class="chat-decision-tab">汇总</span></div>
          ${bodies}
          <div class="chat-callout done">汇总：请逐项确认后，最后向 Leader 发送“确认提交以上选择”。</div>
          <div class="chat-decision-options">
            <button type="button" class="chat-decision-option" data-answer="[ANSWER]
            <button type="button" class="chat-decision-option" data-answer="[ANSWER]
          </div>
        </div>`;
    }

    let leaderWorkflowState = {
      teamName: '研发一组',
      projectName: '智能软件工厂控制台',
      phase: '需求澄清中',
      scope: '团队工作台与小云交互原型'
    };

    function renderLeaderWorkflowState() {
      const el = document.getElementById('chatLeaderStatus');
      if (!el) return;
      el.innerHTML = `
        <div class="chat-leader-status-main">当前：${escapeHTML(leaderWorkflowState.teamName)} / ${escapeHTML(leaderWorkflowState.projectName)} · ${escapeHTML(leaderWorkflowState.phase)}</div>
        <div class="chat-leader-status-sub">范围：${escapeHTML(leaderWorkflowState.scope)}</div>
      `;
    }

    function appendLeaderConfirmCard(title, body, actions) {
      const messages = document.getElementById('chatMessages');
      if (!messages) return;
      messages.classList.remove('empty');
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.dataset.turnRole = 'bot';
      const buttons = actions.map(a => `<button type="button" onclick="sendQuickMsg('${escapeHTML(a.prompt)}')">${escapeHTML(a.label)}</button>`).join('');
      div.innerHTML = `
        <div class="chat-avatar">${BOT_AVATAR_SVG}</div>
        <div class="chat-bubble">
          <div class="chat-confirm-card">
            <strong>${escapeHTML(title)}</strong>
            <div>${escapeHTML(body)}</div>
            <div class="chat-confirm-actions">${buttons}</div>
          </div>
        </div>`;
      messages.appendChild(div);
      scrollChatMessagesToBottom('auto');
      updateChatTurnNavigator();
    }

    function setChatConnectionStatus(status) {
      chatRuntimeState.status = status;
      const statusInput = document.getElementById('chatConnectionStatus');
      if (statusInput) statusInput.value = status;
    }

    function appendChatError(text) {
      appendChatMsg('bot', `连接错误：${text}`);
    }

    function formatAssistantErrorMessage(message) {
      const raw = String(message || '模型侧返回错误');
      if (/image media type not supported|Failed to read request body|external image URLs are not supported/i.test(raw)) {
        return '当前模型/接口不支持这次图片输入。该图片消息可能污染当前 Leader session 的上下文，建议重建干净 session 后继续非图片任务。';
      }
      return raw;
    }

    function createStreamingBotMessage() {
      const messages = document.getElementById('chatMessages');
      if (!messages) return null;
      messages.classList.remove('empty');
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.dataset.turnRole = 'bot';
      div.innerHTML = `<div class="chat-avatar">${BOT_AVATAR_SVG}</div><div class="chat-bubble" data-streaming="true"></div>`;
      messages.appendChild(div);
      scrollChatMessagesToBottom('auto');
      updateChatTurnNavigator();
      return div.querySelector('.chat-bubble');
    }

    function finalizeStreamingBubble(bubble) {
      if (!bubble) return;
      const raw = bubble.textContent || '';
      bubble.classList.add('chat-rich');
      bubble.removeAttribute('data-streaming');
      bubble.innerHTML = renderChatRichText(raw);
      scrollChatMessagesToBottom('auto');
      updateChatTurnNavigator();
    }

    class OpenCodeChatAdapter {
      constructor(config) {
        this.config = { ...config };
        this.eventSource = null;
        this.streamingBubble = null;
      }

      endpoint() {
        return this.isBridge() ? window.location.origin : `http://127.0.0.1:${this.config.port}`;
      }

      isBridge() {
        return this.config.mode === 'bridge';
      }

      streamUrl() {
        if (this.isBridge()) {
          const params = new URLSearchParams({ leaderId: getLeaderIdForChatTarget(this.config.targetId), sessionId: this.config.sessionId });
          if (this.config.token) params.set('token', this.config.token);
          params.set('transportMode', this.config.transportMode || 'normalized');
          return `${this.endpoint()}/api/chat/stream?${params.toString()}`;
        }
        return `${this.endpoint()}/event`;
      }

      connect() {
        if (this.eventSource) this.disconnect();
        this.eventSource = new EventSource(this.streamUrl());
        this.eventSource.onopen = () => setChatConnectionStatus('已连接');
        this.eventSource.onerror = () => setChatConnectionStatus('SSE 断开');
        this.eventSource.onmessage = (event) => this.handleEvent(event);
        this.eventSource.addEventListener('delta', (event) => this.handleBridgeDelta(event));
        this.eventSource.addEventListener('interaction', (event) => this.handleBridgeInteraction(event));
        this.eventSource.addEventListener('interaction-closed', (event) => this.handleBridgeInteractionClosed(event));
        this.eventSource.addEventListener('assistant-error', (event) => this.handleBridgeAssistantError(event));
        this.eventSource.addEventListener('question', (event) => this.handleBridgeQuestion(event));
        this.eventSource.addEventListener('question-replied', (event) => this.handleBridgeQuestionClosed(event, 'submit'));
        this.eventSource.addEventListener('question-rejected', (event) => this.handleBridgeQuestionClosed(event, 'dismiss'));
        this.eventSource.addEventListener('done', () => this.handleAssistantDone());
        this.eventSource.addEventListener('error', () => setChatConnectionStatus('SSE 断开'));
        this.syncPendingQuestions();
      }

      disconnect() {
        if (this.eventSource) this.eventSource.close();
        this.eventSource = null;
      }

      handleBridgeDelta(event) {
        let payload;
        try { payload = JSON.parse(event.data); } catch (err) { return; }
        if (!payload.delta) return;
        if (!this.streamingBubble) this.streamingBubble = createStreamingBotMessage();
        if (this.streamingBubble) {
          this.streamingBubble.textContent += payload.delta;
          scrollChatMessagesToBottom('auto');
        }
      }

      handleBridgeQuestion(event) {
        let request;
        try { request = JSON.parse(event.data); } catch (err) { return; }
        this.appendPendingQuestion(request);
        setChatConnectionStatus('等待选择');
      }

      handleBridgeInteraction(event) {
        let interaction;
        try { interaction = JSON.parse(event.data); } catch (err) { return; }
        if (interaction.sessionID && interaction.sessionID !== this.config.sessionId) return;
        appendInteractionQuestionCard(interaction);
        setChatConnectionStatus('等待选择');
      }

      handleBridgeInteractionClosed(event) {
        let payload;
        try { payload = JSON.parse(event.data); } catch (err) { return; }
        markInteractionClosed(payload.id || payload.questionID || payload.rawId || '', payload.action || 'dismiss');
      }

      handleBridgeAssistantError(event) {
        let payload = {};
        try { payload = JSON.parse(event.data); } catch (err) {}
        const error = payload.error || {};
        const message = error?.data?.message || error?.message || payload.message || '模型侧返回错误';
        finalizeStreamingBubble(this.streamingBubble);
        this.streamingBubble = null;
        setChatConnectionStatus('错误');
        appendChatError(formatAssistantErrorMessage(message));
      }

      handleBridgeQuestionClosed(event, action) {
        let payload = {};
        try { payload = JSON.parse(event.data); } catch (err) {}
        markInteractionClosed(payload.id || payload.questionID || '', action);
      }

      appendPendingQuestion(request) {
        if (!request || request.sessionID !== this.config.sessionId) return;
        if (document.querySelector(`[data-native-question-id="${CSS.escape(request.id)}"]`)) return;
        appendNativeQuestionCard(request);
      }

      async syncPendingQuestions() {
        if (!this.isBridge() || !this.config.sessionId) return;
        const params = new URLSearchParams({ leaderId: getLeaderIdForChatTarget(this.config.targetId) });
        if (this.config.token) params.set('token', this.config.token);
        try {
          const normalized = (this.config.transportMode || 'normalized') !== 'passthrough';
          const url = normalized ? `${this.endpoint()}/api/interactions?${params.toString()}` : `${this.endpoint()}/api/opencode/question?${params.toString()}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const pending = await res.json();
          let matched = false;
          (Array.isArray(pending) ? pending : []).forEach(request => {
            if (request && request.sessionID === this.config.sessionId) {
              matched = true;
              normalized ? appendInteractionQuestionCard(request) : this.appendPendingQuestion(request);
            }
          });
          if (matched) setChatConnectionStatus('等待选择');
        } catch (err) {
          // pending question sync is best-effort; live SSE remains authoritative
        }
      }

      handleAssistantDone() {
        finalizeStreamingBubble(this.streamingBubble);
        this.streamingBubble = null;
        setChatConnectionStatus('已连接');
        leaderWorkflowState = { ...leaderWorkflowState, phase: '等待验收' };
        renderLeaderWorkflowState();
      }

      handleEvent(event) {
        let payload;
        try { payload = JSON.parse(event.data); } catch (err) { return; }
        const properties = payload.properties || {};
        const payloadSessionId = properties.sessionID || (properties.info && properties.info.sessionID) || (properties.message && properties.message.sessionID) || '';
        if (payloadSessionId !== this.config.sessionId) return;
        if (payload.type === 'message.part.delta' && properties.field === 'text' && properties.delta) {
          if (!this.streamingBubble) this.streamingBubble = createStreamingBotMessage();
          if (this.streamingBubble) {
            this.streamingBubble.textContent += properties.delta;
            scrollChatMessagesToBottom('auto');
          }
        }
        if (payload.type === 'question.asked') {
          appendNativeQuestionCard(properties);
          setChatConnectionStatus('等待选择');
        }
        if (payload.type === 'message.updated') {
          const info = properties.info || {};
          if (info.role === 'assistant' && info.finish === 'stop' && info.time && info.time.completed) {
            this.handleAssistantDone();
          }
        }
      }

      async testSession() {
        if (!this.config.sessionId) throw new Error('缺少 sessionId');
        if (this.isBridge()) {
          const params = new URLSearchParams({ port: this.config.port, sessionId: this.config.sessionId });
          if (this.config.token) params.set('token', this.config.token);
          return fetch(`${this.endpoint()}/api/opencode/session?${params.toString()}`);
        }
        return fetch(`${this.endpoint()}/session/${this.config.sessionId}`);
      }

      async sendMessage(text, files = []) {
        if (!this.config.sessionId) throw new Error('缺少 sessionId');
        if (!this.eventSource) this.connect();
        this.streamingBubble = createStreamingBotMessage();
        setChatConnectionStatus('接收中');
        leaderWorkflowState = { ...leaderWorkflowState, phase: '执行中' };
        renderLeaderWorkflowState();
        const sendUrl = this.isBridge()
          ? `${this.endpoint()}/api/chat/send`
          : `${this.endpoint()}/session/${this.config.sessionId}/prompt_async`;
        const wantsNativeQuestion = /(?:原生\s*question|tui\s*原生|question\s*工具|TUI\s*question)/i.test(text || '');
        const effectiveInteractionMode = wantsNativeQuestion ? 'native-question' : (this.config.interactionMode || 'text-protocol');
        if (wantsNativeQuestion && this.config.interactionMode !== 'native-question') {
          this.config.interactionMode = 'native-question';
          chatRuntimeState = { ...chatRuntimeState, interactionMode: 'native-question' };
          const select = document.getElementById('chatInteractionModeSelect');
          if (select) select.value = 'native-question';
          persistChatRuntimeConfig();
          appendChatMsg('bot', '已检测到“原生 question”请求，本轮自动切换为原生 question 模式。');
        }
        const sendBody = this.isBridge()
          ? { leaderId: getLeaderIdForChatTarget(this.config.targetId), sessionId: this.config.sessionId, token: this.config.token || '', model: this.config.model || 'github-copilot/gpt-5.5', interactionMode: effectiveInteractionMode, text, files }
          : { model: parseModelRef(this.config.model), parts: [...(text ? [{ type: 'text', text }] : []), ...files] };
        const res = await fetch(sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: chatSendAbortController.signal,
          body: JSON.stringify(sendBody)
        });
        if (this.isBridge()) {
          if (!res.ok) throw new Error(`bridge send HTTP ${res.status}`);
        } else if (res.status !== 204) {
          throw new Error(`prompt_async HTTP ${res.status}`);
        }
      }

      async replyQuestion(questionId, answers) {
        if (!questionId) throw new Error('缺少 questionId');
        const params = new URLSearchParams();
        if (this.isBridge()) params.set('leaderId', getLeaderIdForChatTarget(this.config.targetId));
        else params.set('port', this.config.port);
        if (this.config.token) params.set('token', this.config.token);
        const url = this.isBridge()
          ? `${this.endpoint()}/api/opencode/question/${encodeURIComponent(questionId)}/reply?${params.toString()}`
          : `${this.endpoint()}/question/${encodeURIComponent(questionId)}/reply`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        });
        if (!res.ok) throw new Error(`question reply HTTP ${res.status}`);
        return res;
      }

      async submitInteraction(interactionId, answers) {
        if (!interactionId) throw new Error('缺少 interactionId');
        if ((this.config.transportMode || 'normalized') === 'passthrough') return this.replyQuestion(interactionId, answers.map(a => [a.value]));
        const params = new URLSearchParams({ leaderId: getLeaderIdForChatTarget(this.config.targetId) });
        if (this.config.token) params.set('token', this.config.token);
        const res = await fetch(`${this.endpoint()}/api/interactions/${encodeURIComponent(interactionId)}/submit?${params.toString()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        });
        if (!res.ok) throw new Error(`interaction submit HTTP ${res.status}`);
        return res;
      }

      async dismissInteraction(interactionId) {
        if (!interactionId) throw new Error('缺少 interactionId');
        const params = new URLSearchParams({ leaderId: getLeaderIdForChatTarget(this.config.targetId) });
        if (this.config.token) params.set('token', this.config.token);
        const res = await fetch(`${this.endpoint()}/api/interactions/${encodeURIComponent(interactionId)}/dismiss?${params.toString()}`, { method: 'POST' });
        if (!res.ok) throw new Error(`interaction dismiss HTTP ${res.status}`);
        return res;
      }
    }

    let activeChatAdapter = null;
    let discoveredOpenCodeSessions = [];
    let chatSendAbortController = null;

    function getActiveChatAdapter() {
      if (activeChatAdapter && (chatRuntimeState.mode === 'opencode' || chatRuntimeState.mode === 'bridge')) return activeChatAdapter;
      if (chatRuntimeState.mode !== 'opencode' && chatRuntimeState.mode !== 'bridge') return null;
      activeChatAdapter = new OpenCodeChatAdapter(chatRuntimeState);
      activeChatAdapter.connect();
      return activeChatAdapter;
    }

    function persistChatRuntimeConfig() {
      safeStorage.setItem(getChatLeaderConfigKey(chatRuntimeState.targetId), JSON.stringify({
        mode: chatRuntimeState.mode,
        port: chatRuntimeState.port,
        bridgePort: chatRuntimeState.bridgePort,
        sessionId: chatRuntimeState.sessionId,
        token: chatRuntimeState.token,
        sessionTitle: chatRuntimeState.sessionTitle,
        sessionDirectory: chatRuntimeState.sessionDirectory,
        sessionUpdatedAt: chatRuntimeState.sessionUpdatedAt,
        endpointLabel: chatRuntimeState.endpointLabel,
        model: chatRuntimeState.model || 'github-copilot/gpt-5.5',
        interactionMode: chatRuntimeState.interactionMode || 'text-protocol',
        transportMode: chatRuntimeState.transportMode || 'normalized'
      }));
    }

    function renderChatSendIcon(isSending) {
      return isSending
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
    }

    function setChatSendingState(isSending) {
      const btn = document.getElementById('chatSendBtn');
      if (!btn) return;
      btn.dataset.chatSendState = isSending ? 'sending' : 'idle';
      btn.title = isSending ? '终止发送' : '发送';
      btn.setAttribute('aria-label', isSending ? '终止发送' : '发送');
      btn.classList.toggle('sending', isSending);
      btn.innerHTML = renderChatSendIcon(isSending);
    }

    function stopCurrentChatSend() {
      if (!chatSendAbortController) return false;
      chatSendAbortController.abort();
      return true;
    }

    function handleChatSendButtonClick() {
      if (chatSendAbortController) {
        stopCurrentChatSend();
        return;
      }
      sendChatMsg();
    }

    async function sendChatMsg() {
      const textarea = document.getElementById('chatTextarea');
      if (!textarea) return;
      const msg = textarea.value.trim();
      const files = [...chatPendingFiles];
      if (!msg && !files.length) return;
      chatSendAbortController = new AbortController();
      setChatSendingState(true);
      appendChatMsg('user', msg || '发送图片', files);
      textarea.value = '';
      autoResizeChatTextarea(textarea);
      chatPendingFiles = [];
      renderChatAttachments();

      saveChatRuntimeConfig();
      if (chatRuntimeState.mode === 'opencode' || chatRuntimeState.mode === 'bridge') {
        try {
          const adapter = getActiveChatAdapter();
          await adapter.sendMessage(msg, files);
        } catch (err) {
          if (err?.name === 'AbortError') {
            setChatConnectionStatus('已终止');
            appendChatMsg('bot', '已终止本次发送');
          } else {
            setChatConnectionStatus('错误');
            appendChatError(err.message || String(err));
          }
        } finally {
          chatSendAbortController = null;
          setChatSendingState(false);
        }
        return;
      }

      const sel = document.getElementById('chatTargetSelect');
      const targetLabel = getChatTargetLabel(sel ? sel.value : 'all');
      leaderWorkflowState = { ...leaderWorkflowState, phase: '执行中' };
      renderLeaderWorkflowState();
      setTimeout(() => {
        if (!chatSendAbortController) return;
        appendChatMsg('bot', `[${targetLabel}] 收到，正在处理"${msg}"...`);
        leaderWorkflowState = { ...leaderWorkflowState, phase: '等待验收' };
        renderLeaderWorkflowState();
        appendLeaderConfirmCard('验收确认', '组长已完成本轮处理，请确认是否通过验收。', [
          { label: '通过验收', prompt: '通过验收' },
          { label: '需要修改', prompt: '需要修改：' },
          { label: '变更需求', prompt: '变更需求：' }
        ]);
        chatSendAbortController = null;
        setChatSendingState(false);
      }, 800);
    }

    async function testChatConnection() {
      saveChatRuntimeConfig();
      const { sessionId } = chatRuntimeState;
      if (!sessionId) {
        setChatConnectionStatus('缺少 sessionId');
        appendChatError('请先输入组长对应的 OpenCode sessionId');
        return;
      }
      try {
        const adapter = new OpenCodeChatAdapter(chatRuntimeState);
        const res = await adapter.testSession();
        if (res.status === 200) {
          setChatConnectionStatus('已连接');
          if (activeChatAdapter) activeChatAdapter.disconnect();
          activeChatAdapter = adapter;
          activeChatAdapter.connect();
          appendChatMsg('bot', `同源网关连接验证通过。TUI 中查找：${chatRuntimeState.sessionTitle || getExpectedLeaderSessionTitle(chatRuntimeState.targetId)}`);
        } else if (res.status === 404) {
          setChatConnectionStatus('session 不存在');
          appendChatError(`session 不存在：${sessionId}`);
        } else {
          setChatConnectionStatus(`HTTP ${res.status}`);
          appendChatError(`连接返回 HTTP ${res.status}`);
        }
      } catch (err) {
        setChatConnectionStatus('端口不可达');
        appendChatError(err.message || String(err));
      }
    }

    async function discoverOpenCodeSessions() {
      saveChatRuntimeConfig();
      setChatConnectionStatus('绑定组长会话中...');
      const { token } = chatRuntimeState;
      const leaderId = getLeaderIdForChatTarget(chatRuntimeState.targetId);
      const url = `${window.location.origin}/api/leaders/${encodeURIComponent(leaderId)}/session?${new URLSearchParams(token ? { token } : {}).toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const session = payload.session || null;
        if (!session || !session.id) throw new Error('未返回组长 session');
        const leader = payload.leader || {};
        discoveredOpenCodeSessions = [session];
        chatRuntimeState = {
          ...chatRuntimeState,
          port: leader.endpointLabel ? String(leader.endpointLabel).replace('local-', '') : chatRuntimeState.port,
          sessionId: session.id,
          sessionTitle: leader.sessionTitle || session.title || getExpectedLeaderSessionTitle(chatRuntimeState.targetId),
          sessionDirectory: session.directory || '',
          sessionUpdatedAt: session.time?.updated || '',
          endpointLabel: leader.endpointLabel || chatRuntimeState.endpointLabel,
          status: payload.created ? '已创建组长会话' : '已绑定组长会话'
        };
        persistChatRuntimeConfig();
        renderDiscoveredSessionOptions();
        renderChatRuntimeConfig();
        setChatConnectionStatus(chatRuntimeState.status);
        appendChatMsg('bot', `${payload.created ? '已创建' : '已绑定'}固定组长会话。TUI 中查找：${chatRuntimeState.sessionTitle}`);
        if (activeChatAdapter) activeChatAdapter.disconnect();
        activeChatAdapter = new OpenCodeChatAdapter(chatRuntimeState);
        activeChatAdapter.connect();
      } catch (err) {
        setChatConnectionStatus(`绑定失败：${err.message || String(err)}`);
        appendChatError(err.message || String(err));
      }
    }

    async function recreateOpenCodeLeaderSession() {
      saveChatRuntimeConfig();
      setChatConnectionStatus('新建组长会话中...');
      const { token } = chatRuntimeState;
      const leaderId = getLeaderIdForChatTarget(chatRuntimeState.targetId);
      const url = `${window.location.origin}/api/leaders/${encodeURIComponent(leaderId)}/session/recreate?${new URLSearchParams(token ? { token } : {}).toString()}`;
      try {
        const res = await fetch(url, { method: 'POST' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const session = payload.session || null;
        if (!session || !session.id) throw new Error('未返回新组长 session');
        const leader = payload.leader || {};
        discoveredOpenCodeSessions = [session];
        chatRuntimeState = {
          ...chatRuntimeState,
          port: leader.endpointLabel ? String(leader.endpointLabel).replace('local-', '') : chatRuntimeState.port,
          sessionId: session.id,
          sessionTitle: leader.sessionTitle || session.title || getExpectedLeaderSessionTitle(chatRuntimeState.targetId),
          sessionDirectory: session.directory || '',
          sessionUpdatedAt: session.time?.updated || '',
          endpointLabel: leader.endpointLabel || chatRuntimeState.endpointLabel,
          status: '已新建组长会话'
        };
        persistChatRuntimeConfig();
        renderDiscoveredSessionOptions();
        renderChatRuntimeConfig();
        setChatConnectionStatus(chatRuntimeState.status);
        appendChatMsg('bot', `已新建并绑定组长会话。旧同名会话已标记 stale：${payload.staled?.length || 0} 个。TUI 中请打开：${chatRuntimeState.sessionTitle} / ${session.id}`);
        if (activeChatAdapter) activeChatAdapter.disconnect();
        activeChatAdapter = new OpenCodeChatAdapter(chatRuntimeState);
        activeChatAdapter.connect();
      } catch (err) {
        setChatConnectionStatus(`新建失败：${err.message || String(err)}`);
        appendChatError(err.message || String(err));
      }
    }

    async function recreateCleanLeaderSession() {
      saveChatRuntimeConfig();
      setChatConnectionStatus('重建干净 session 中...');
      const { token } = chatRuntimeState;
      const leaderId = getLeaderIdForChatTarget(chatRuntimeState.targetId);
      const url = `${window.location.origin}/api/leaders/${encodeURIComponent(leaderId)}/session/recreate?${new URLSearchParams(token ? { token } : {}).toString()}`;
      try {
        const res = await fetch(url, { method: 'POST' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const session = payload.session || null;
        if (!session || !session.id) throw new Error('未返回干净 Leader session');
        const leader = payload.leader || {};
        discoveredOpenCodeSessions = [session];
        chatRuntimeState = {
          ...chatRuntimeState,
          port: leader.endpointLabel ? String(leader.endpointLabel).replace('local-', '') : chatRuntimeState.port,
          sessionId: session.id,
          sessionTitle: leader.sessionTitle || session.title || getExpectedLeaderSessionTitle(chatRuntimeState.targetId),
          sessionDirectory: session.directory || '',
          sessionUpdatedAt: session.time?.updated || Date.now(),
          endpointLabel: leader.endpointLabel || chatRuntimeState.endpointLabel,
          status: '已重建干净 session'
        };
        persistChatRuntimeConfig();
        renderDiscoveredSessionOptions();
        renderChatRuntimeConfig();
        setChatConnectionStatus(chatRuntimeState.status);
        appendChatMsg('bot', `已重建干净 Leader session，可继续非图片任务。TUI 中请打开：${chatRuntimeState.sessionTitle} / ${session.id}`);
        if (activeChatAdapter) activeChatAdapter.disconnect();
        activeChatAdapter = new OpenCodeChatAdapter(chatRuntimeState);
        activeChatAdapter.connect();
      } catch (err) {
        setChatConnectionStatus(`重建失败：${err.message || String(err)}`);
        appendChatError(err.message || String(err));
      }
    }

    function renderDiscoveredSessionOptions() {
      const select = document.getElementById('chatDiscoveredSessionSelect');
      if (!select) return;
      if (!discoveredOpenCodeSessions.length) {
        select.innerHTML = '<option value="">未发现会话</option>';
        return;
      }
      select.innerHTML = discoveredOpenCodeSessions.map(s => {
        const dir = s.directory ? ` · ${s.directory.replace('/home/kk/workspace/', '')}` : '';
        return `<option value="${escapeHTML(s.id)}">${escapeHTML(s.title || '(no title)')}${dir} · ${escapeHTML(getShortSessionId(s.id))}</option>`;
      }).join('');
    }

    function selectDiscoveredSession(sessionId) {
      if (!sessionId) return;
      const found = discoveredOpenCodeSessions.find(s => s.id === sessionId);
      const sessionInput = document.getElementById('chatOpenCodeSessionId');
      const select = document.getElementById('chatDiscoveredSessionSelect');
      if (sessionInput) sessionInput.value = sessionId;
      if (select) select.value = sessionId;
      chatRuntimeState = { ...chatRuntimeState, sessionId, sessionTitle: found?.title || chatRuntimeState.sessionTitle, sessionDirectory: found?.directory || chatRuntimeState.sessionDirectory, sessionUpdatedAt: found?.time?.updated || chatRuntimeState.sessionUpdatedAt };
      persistChatRuntimeConfig();
      renderChatRuntimeConfig();
      if (found) {
        leaderWorkflowState = {
          ...leaderWorkflowState,
          teamName: found.directory && found.directory.endsWith('/p3') ? '研发一组' : leaderWorkflowState.teamName,
          phase: '需求澄清中'
        };
        renderLeaderWorkflowState();
      }
    }

    function toggleChatConfigPanel(forceOpen) {
      const panel = document.getElementById('chatConnectionPanel');
      const chatPanel = document.getElementById('chatPanel');
      if (!panel) return;
      const willOpen = forceOpen === true ? true : forceOpen === false ? false : panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !willOpen);
      if (chatPanel) chatPanel.classList.toggle('settings-open', willOpen);
      if (willOpen) renderChatRuntimeConfig();
      updateChatTurnNavigator();
      if (willOpen && !discoveredOpenCodeSessions.length) discoverOpenCodeSessions();
    }

    function toggleChatDeveloperPanel() {
      const panel = document.getElementById('chatDeveloperPanel');
      const btn = document.getElementById('chatDevToggleBtn');
      if (!panel) return;
      const isOpen = panel.classList.toggle('hidden') === false;
      if (btn) {
        btn.classList.toggle('open', isOpen);
        btn.textContent = isOpen ? '收起详情' : '展开详情';
      }
    }

    function sendQuickMsg(text) {
      const textarea = document.getElementById('chatTextarea');
      if (!textarea) return;
      textarea.value = text;
      sendChatMsg();
    }

    function toggleChatDeepThink() {
      const btn = document.getElementById('chatDeepThinkBtn');
      if (btn) btn.classList.toggle('active');
    }

    function isXiaoyunPopupMode() {
      return new URLSearchParams(location.search).get('xiaoyun') === 'popup';
    }

    let xiaoyunPopupRef = null;
    let xiaoyunPopupWatchTimer = null;

    function setEmbeddedPopupState(open) {
      safeStorage.setItem('p3:xiaoyun:popup-open', open ? '1' : '0');
      if (!open) {
        restoreEmbeddedChatAfterPopupClose();
      }
    }

    function restoreEmbeddedChatAfterPopupClose() {
      toggleFabMenu(false);
      toggleChatPanel(true);
    }

    function watchPopupWindow(popup) {
      if (xiaoyunPopupWatchTimer) clearInterval(xiaoyunPopupWatchTimer);
      xiaoyunPopupRef = popup;
      xiaoyunPopupWatchTimer = setInterval(() => {
        if (!xiaoyunPopupRef || xiaoyunPopupRef.closed) {
          clearInterval(xiaoyunPopupWatchTimer);
          xiaoyunPopupWatchTimer = null;
          xiaoyunPopupRef = null;
          setEmbeddedPopupState(false);
        }
      }, 700);
    }

    function getPopupWindowState() {
      try { return normalizePopupWindowState(JSON.parse(safeStorage.getItem('p3:xiaoyun:popup-window') || '{}')); }
      catch { return normalizePopupWindowState({}); }
    }

    function normalizePopupWindowState(raw) {
      const screenWidth = window.screen?.availWidth || window.screen?.width || 1440;
      const screenHeight = window.screen?.availHeight || window.screen?.height || 900;
      const width = Math.min(Math.max(Number(raw?.width) || 720, 480), Math.max(480, screenWidth));
      const height = Math.min(Math.max(Number(raw?.height) || 820, 560), Math.max(560, screenHeight));
      return {
        width,
        height,
        left: Math.min(Math.max(Number(raw?.left) || 120, 0), Math.max(0, screenWidth - 80)),
        top: Math.min(Math.max(Number(raw?.top) || 80, 0), Math.max(0, screenHeight - 80))
      };
    }

    let popupWindowStateSaveTimer = null;

    function schedulePopupWindowStateSave() {
      if (popupWindowStateSaveTimer) clearTimeout(popupWindowStateSaveTimer);
      popupWindowStateSaveTimer = setTimeout(savePopupWindowState, 200);
    }

    function savePopupWindowState() {
      if (!isXiaoyunPopupMode()) return;
      safeStorage.setItem('p3:xiaoyun:popup-window', JSON.stringify({
        width: Math.max(480, window.outerWidth || 720),
        height: Math.max(560, window.outerHeight || 820),
        left: Math.max(0, window.screenX || window.screenLeft || 0),
        top: Math.max(0, window.screenY || window.screenTop || 0)
      }));
    }

    function toggleChatWindowMode() {
      if (isXiaoyunPopupMode()) {
        safeStorage.setItem('p3:xiaoyun:popup-open', '0');
        window.close();
        return;
      }
      const target = encodeURIComponent(chatRuntimeState.targetId || document.getElementById('chatTargetSelect')?.value || 'all');
      safeStorage.setItem('p3:xiaoyun:popup-target', decodeURIComponent(target));
      const url = `/xiaoyun?xiaoyun=popup`;
      const state = getPopupWindowState();
      const features = [
        `width=${Math.round(state.width)}`,
        `height=${Math.round(state.height)}`,
        `left=${Math.round(state.left)}`,
        `top=${Math.round(state.top)}`,
        'resizable=yes',
        'scrollbars=no'
      ].join(',');
      const popup = window.open(url, 'xiaoyun-popup', features);
      if (popup) {
        setEmbeddedPopupState(true);
        watchPopupWindow(popup);
        toggleChatPanel(false);
      }
    }

    // textarea: Enter 发送，Shift+Enter 换行
    document.addEventListener('DOMContentLoaded', () => {
      const ta = document.getElementById('chatTextarea');
      if (ta) {
        ta.addEventListener('input', () => autoResizeChatTextarea(ta));
        ta.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMsg();
          }
        });
        ta.addEventListener('paste', (e) => {
          const items = [...(e.clipboardData?.items || [])];
          items.filter(item => item.type.startsWith('image/')).forEach(item => addChatImageFile(item.getAsFile()));
        });
      }
      const imageInput = document.getElementById('chatImageInput');
      if (imageInput) imageInput.addEventListener('change', () => {
        [...(imageInput.files || [])].forEach(addChatImageFile);
        imageInput.value = '';
      });
      if (isXiaoyunPopupMode()) {
        safeStorage.setItem('p3:xiaoyun:popup-open', '1');
        window.addEventListener('beforeunload', () => { savePopupWindowState(); safeStorage.setItem('p3:xiaoyun:popup-open', '0'); });
        window.addEventListener('resize', schedulePopupWindowStateSave);
        window.addEventListener('move', schedulePopupWindowStateSave);
        document.body.classList.add('xiaoyun-popup');
        const target = new URLSearchParams(location.search).get('target') || safeStorage.getItem('p3:xiaoyun:popup-target') || 'all';
        if (location.pathname !== '/xiaoyun') history.replaceState(null, '', '/xiaoyun');
        setTimeout(() => {
          const sel = document.getElementById('chatTargetSelect');
          if (sel) sel.value = target;
          switchChatTarget(target);
        }, 300);
        toggleChatPanel(true);
        const btn = document.getElementById('chatPopupBtn');
        if (btn) { btn.textContent = '收回 ↙'; btn.title = '收回页面'; btn.setAttribute('aria-label', '收回页面'); }
      }
      if (!isXiaoyunPopupMode()) {
        window.addEventListener('storage', (e) => {
          if (e.key === 'p3:xiaoyun:popup-open' && e.newValue === '0') setEmbeddedPopupState(false);
        });
      }
      // 注入 fab-bot 头像（复用 BOT_AVATAR_SVG 的 base64 PNG 卡通机器人）
      const fabBot = document.getElementById('fabBot');
      if (fabBot && typeof BOT_AVATAR_SVG === 'string') {
        // BOT_AVATAR_SVG 自带 width=28，覆盖为 fab 内部尺寸
        fabBot.innerHTML = BOT_AVATAR_SVG.replace(/width="\d+"/, 'width="32"').replace(/height="\d+"/, 'height="32"');
      }
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.chat-decision-option[data-answer]');
        if (!btn) return;
        sendQuickMsg(btn.dataset.answer || '');
      });
      document.addEventListener('click', (e) => {
        const tab = e.target.closest('.chat-decision-tab[data-tab-card]');
        if (!tab) return;
        const cardId = tab.dataset.tabCard;
        const tabIndex = tab.dataset.tabIndex;
        document.querySelectorAll(`.chat-decision-tab[data-tab-card="${cardId}"]`).forEach(el => el.classList.toggle('active', el === tab));
        document.querySelectorAll(`.chat-decision-tab-panel[data-tab-card="${cardId}"]`).forEach(el => el.classList.toggle('active', el.dataset.tabPanel === tabIndex));
      });
      document.addEventListener('click', (e) => {
        const tab = e.target.closest('.xy-question-tab[data-qw-card]');
        if (!tab) return;
        showQuestionWizardPanel(tab.dataset.qwCard, tab.dataset.qwIndex);
      });
      document.addEventListener('click', (e) => {
        const opt = e.target.closest('.xy-question-option[data-qw-card]');
        if (!opt) return;
        const cardId = opt.dataset.qwCard;
        const qIndex = opt.dataset.qwQuestion;
        document.querySelectorAll(`.xy-question-option[data-qw-card="${cardId}"][data-qw-question="${qIndex}"]`).forEach(el => el.classList.toggle('selected', el === opt));
        opt.dataset.selected = 'true';
        const tab = document.querySelector(`.xy-question-tab[data-qw-card="${cardId}"][data-qw-index="${qIndex}"]`);
        if (tab) tab.classList.add('done');
        updateQuestionWizardReview(cardId);
        const nextIndex = String(Number(qIndex) + 1);
        if (document.querySelector(`.xy-question-panel[data-qw-card="${cardId}"][data-qw-panel="${nextIndex}"]`)) showQuestionWizardPanel(cardId, nextIndex);
        else showQuestionWizardPanel(cardId, 'confirm');
      });
      document.addEventListener('click', (e) => {
        const submit = e.target.closest('[data-qw-submit]');
        if (submit) submitQuestionWizard(submit.dataset.qwSubmit);
        const back = e.target.closest('[data-qw-back]');
        if (back) showQuestionWizardPanel(back.dataset.qwBack, '0');
      });
      document.addEventListener('click', async (e) => {
        const tab = e.target.closest('[data-iq-index]');
        if (tab) {
          const cardId = tab.dataset.iqCard;
          document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-index]`).forEach(el => el.classList.toggle('active', el === tab));
          document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-panel]`).forEach(el => el.classList.toggle('active', el.dataset.iqPanel === tab.dataset.iqIndex));
          return;
        }
        const opt = e.target.closest('[data-iq-value]');
        if (opt) {
          const cardId = opt.dataset.iqCard;
          const qIndex = opt.dataset.iqQuestion;
          if (opt.dataset.iqMulti !== 'true') document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-question="${qIndex}"][data-iq-value]`).forEach(el => el.classList.remove('selected'));
          opt.classList.toggle('selected');
          document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-question="${qIndex}"][data-iq-value]`).forEach(el => {
            const mark = el.querySelector('.xy-option-mark');
            if (!mark) return;
            mark.textContent = el.dataset.iqMulti === 'true'
              ? (el.classList.contains('selected') ? '[✓]' : '[ ]')
              : (el.classList.contains('selected') ? '(•)' : '( )');
          });
          updateInteractionReview(cardId);
          if (opt.classList.contains('selected')) showNextInteractionQuestion(cardId, Number(qIndex));
          return;
        }
        const submitInteraction = e.target.closest('[data-iq-submit]');
        if (submitInteraction) {
          await submitInteractionAnswers(submitInteraction.dataset.iqSubmit);
          return;
        }
        const dismissInteractionBtn = e.target.closest('[data-iq-dismiss]');
        if (dismissInteractionBtn) await dismissInteraction(dismissInteractionBtn.dataset.iqDismiss);
      });
      document.addEventListener('input', (e) => {
        if (e.target.matches('[data-iq-card][data-iq-question]')) updateInteractionReview(e.target.dataset.iqCard);
      });
    });

    function showQuestionWizardPanel(cardId, index) {
      document.querySelectorAll(`.xy-question-tab[data-qw-card="${cardId}"]`).forEach(el => el.classList.toggle('active', el.dataset.qwIndex === String(index)));
      document.querySelectorAll(`.xy-question-panel[data-qw-card="${cardId}"]`).forEach(el => el.classList.toggle('active', el.dataset.qwPanel === String(index)));
    }

    function showInteractionPanel(cardId, index) {
      document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-index]`).forEach(el => el.classList.toggle('active', el.dataset.iqIndex === String(index)));
      document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-panel]`).forEach(el => el.classList.toggle('active', el.dataset.iqPanel === String(index)));
      const input = document.querySelector(`[data-iq-card="${cardId}"][data-iq-panel="${index}"] input, [data-iq-card="${cardId}"][data-iq-panel="${index}"] textarea`);
      if (input) setTimeout(() => input.focus(), 30);
    }

    function showNextInteractionQuestion(cardId, currentIndex) {
      const tabs = [...document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-index]`)];
      const next = tabs.find(tab => Number(tab.dataset.iqIndex) > currentIndex && !tab.classList.contains('done'))
        || tabs.find(tab => !tab.classList.contains('done'));
      if (next) showInteractionPanel(cardId, next.dataset.iqIndex);
    }

    function getQuestionWizardPayload(cardId) {
      const card = document.querySelector(`.xy-question-card[data-qw="${cardId}"]`);
      if (!card) return null;
      try { return JSON.parse(card.dataset.qwPayload || '{}'); } catch { return null; }
    }

    function getQuestionWizardAnswers(cardId) {
      const payload = getQuestionWizardPayload(cardId);
      if (!payload) return [];
      return (payload.questions || []).map((q, index) => {
        const selected = document.querySelector(`.xy-question-option.selected[data-qw-card="${cardId}"][data-qw-question="${index}"]`);
        return { title: q.title, choice: selected?.dataset.qwChoice || '', label: selected?.dataset.qwLabel || '未选择' };
      });
    }

    function updateQuestionWizardReview(cardId) {
      const review = document.querySelector(`.xy-question-review[data-qw-review="${cardId}"]`);
      if (!review) return;
      const answers = getQuestionWizardAnswers(cardId);
      review.innerHTML = answers.map(a => `<div>${escapeHTML(a.title)}：<strong>${escapeHTML(a.label)}</strong></div>`).join('');
    }

    async function submitQuestionWizard(cardId) {
      const payload = getQuestionWizardPayload(cardId);
      const answers = getQuestionWizardAnswers(cardId);
      const card = document.querySelector(`.xy-question-card[data-qw="${cardId}"]`);
      const nativeQuestionId = card?.dataset.nativeQuestionId || '';
      if (nativeQuestionId && activeChatAdapter && typeof activeChatAdapter.replyQuestion === 'function') {
        await activeChatAdapter.replyQuestion(nativeQuestionId, answers.map(a => [a.label]));
        appendChatMsg('user', `[ANSWER]\nquestionId: ${nativeQuestionId}\n${answers.map((a, index) => `item${index + 1}: ${a.title}\nlabel${index + 1}: ${a.label}`).join('\n')}\n[/ANSWER]`);
        return;
      }
      const lines = ['[ANSWER]', `question: ${payload?.question || payload?.title || '需要确认'}`];
      answers.forEach((a, index) => {
        lines.push(`item${index + 1}: ${a.title}`);
        lines.push(`choice${index + 1}: ${a.choice}`);
        lines.push(`label${index + 1}: ${a.label}`);
      });
      lines.push('[/ANSWER]');
      sendQuickMsg(lines.join('\n'));
    }

    function collectInteractionAnswers(cardId) {
      const root = document.querySelector(`[data-iq="${cardId}"]`);
      if (!root) return { interactionId: '', answers: [], missing: [] };
      let payload = {};
      try { payload = JSON.parse(root.dataset.iqPayload || '{}'); } catch { payload = {}; }
      const answers = [];
      const missing = [];
      (payload.questions || []).forEach((q, index) => {
        const selected = [...root.querySelectorAll(`[data-iq-question="${index}"].selected`)];
        const textInput = root.querySelector(`input[data-iq-question="${index}"], textarea[data-iq-question="${index}"]`);
        let value = '';
        let label = '';
        if (selected.length) {
          value = selected.map(el => el.dataset.iqValue);
          label = selected.map(el => el.dataset.iqLabel).join('、');
          if (value.length === 1) value = value[0];
        } else if (textInput) {
          value = textInput.value.trim();
          label = value;
        }
        if (q.required !== false && (!label || (Array.isArray(value) && !value.length))) missing.push(index);
        answers.push({ questionId: q.id, value, label });
      });
      return { interactionId: payload.id, answers, missing };
    }

    function updateInteractionReview(cardId) {
      const root = document.querySelector(`[data-iq="${cardId}"]`);
      const review = document.querySelector(`[data-iq-review="${cardId}"]`);
      if (!root || !review) return;
      let payload = {};
      try { payload = JSON.parse(root.dataset.iqPayload || '{}'); } catch { payload = {}; }
      const collected = collectInteractionAnswers(cardId);
      review.innerHTML = (payload.questions || []).map((q, index) => `<div>${escapeHTML(q.title)}：<strong>${escapeHTML(collected.answers[index]?.label || '未填写')}</strong></div>`).join('');
      document.querySelectorAll(`[data-iq-card="${cardId}"][data-iq-index]`).forEach((tab, index) => tab.classList.toggle('done', Boolean(collected.answers[index]?.label)));
    }

    function setInteractionCardState(card, action) {
      if (!card) return;
      const done = action === 'submit' || action === 'replied';
      const dismissed = action === 'dismiss' || action === 'reject' || action === 'rejected';
      card.classList.toggle('done', done);
      card.classList.toggle('dismissed', dismissed);
      const state = card.querySelector('[data-iq-state]');
      if (state) state.textContent = done ? '已提交，等待 OpenCode 继续' : dismissed ? '已取消，已同步到 OpenCode' : '等待提交或取消';
      card.querySelectorAll('button, input, textarea, select').forEach(el => {
        if (done || dismissed) el.disabled = true;
      });
    }

    function markInteractionClosed(interactionId, action) {
      if (!interactionId) return;
      const escaped = CSS.escape(interactionId);
      const card = document.querySelector(`[data-interaction-id="${escaped}"], [data-native-question-id="${escaped}"]`);
      setInteractionCardState(card, action);
      setChatConnectionStatus(action === 'submit' || action === 'replied' ? '已提交选择' : '已取消选择');
    }

    async function submitInteractionAnswers(cardId) {
      const collected = collectInteractionAnswers(cardId);
      if (collected.missing.length) {
        setChatConnectionStatus('请完成所有问题');
        return;
      }
      const adapter = getActiveChatAdapter();
      await adapter.submitInteraction(collected.interactionId, collected.answers);
      setInteractionCardState(document.querySelector(`[data-iq="${cardId}"]`), 'submit');
      setChatConnectionStatus('已提交选择');
    }

    async function dismissInteraction(cardId) {
      const collected = collectInteractionAnswers(cardId);
      const adapter = getActiveChatAdapter();
      await adapter.dismissInteraction(collected.interactionId);
      setInteractionCardState(document.querySelector(`[data-iq="${cardId}"]`), 'dismiss');
      setChatConnectionStatus('已关闭选择');
    }

    function getActivePendingInteractionCard() {
      const cards = [...document.querySelectorAll('.xy-question-card[data-iq]:not(.done):not(.dismissed)')];
      return cards[cards.length - 1] || null;
    }

    async function dismissActiveInteractionFromKeyboard() {
      const card = getActivePendingInteractionCard();
      if (!card) return false;
      const cardId = card.dataset.iq;
      if (!cardId) return false;
      await dismissInteraction(cardId);
      return true;
    }

    function openChatWith(masterIdOrTeamId) {
      toggleChatPanel(true);
      const sel = document.getElementById('chatTargetSelect');
      if (!sel) return;
      // 优先匹配 masterId，否则尝试 teamId
      let val = 'all';
      const team = (currentState.teams || []).find(t => t.masterId === masterIdOrTeamId || t.id === masterIdOrTeamId);
      if (team) val = team.masterId || team.id;
      sel.value = val;
      switchChatTarget(val);
    }

    // 拓扑 Master 节点：双击/右键打开对话
    document.addEventListener('dblclick', (event) => {
      const node = event.target.closest('.topo-node[data-action="open-team"]');
      if (!node) return;
      event.preventDefault();
      const teamId = node.dataset.teamId;
      const team = (currentState.teams || []).find(t => t.id === teamId);
      if (team) openChatWith(team.masterId || team.id);
    });
    document.addEventListener('contextmenu', (event) => {
      const node = event.target.closest('.topo-node[data-action="open-team"]');
      if (!node) return;
      event.preventDefault();
      const teamId = node.dataset.teamId;
      const team = (currentState.teams || []).find(t => t.id === teamId);
      if (team) openChatWith(team.masterId || team.id);
    });

    /* =========================================================================
       Worker / 员工详情 抽屉（v0.5.5+）
       说明：拓扑 SVG 上的 Worker 节点只有 name；员工页/Pool 同时有 id + name。
       openDrawer(id, name?) — 任一非空即可定位。
       ========================================================================= */
    function findWorkerByIdOrName(id, name) {
      // 1. 在 teams.members 找
      for (const team of currentState.teams || []) {
        for (const m of team.members || []) {
          if ((id && m.id === id) || (name && m.name === name)) {
            return { worker: m, teamInfo: { name: team.name, masterCodename: team.masterCodename, masterId: team.masterId, teamId: team.id } };
          }
        }
      }
      // 2. 在 workers 池找
      for (const w of currentState.workers || []) {
        if ((id && w.id === id) || (name && w.name === name)) {
          return { worker: w, teamInfo: null };
        }
      }
      return null;
    }

    function openDrawer(workerId, workerName) {
      const found = findWorkerByIdOrName(workerId, workerName);
      if (!found) return;
      const { worker, teamInfo } = found;

      const roleName = (typeof getRoleName === 'function') ? getRoleName(worker.role) : worker.role;
      const statusInfo = STATUS_MAP[worker.status] || { label: worker.status || '未知', icon: '⚪', color: '#94a3b8' };
      const heartbeatStr = worker.heartbeatTs ? formatRelativeTime(worker.heartbeatTs) : '-';
      const summary = worker.currentTaskSummary || '-';

      // 标题
      document.getElementById('workerDrawerTitle').innerHTML =
        `${escapeHTML(worker.name || '-')}<span class="drawer-title-badge">${escapeHTML(getDisplayRole(worker))}</span>`;

      // 内容
      const teamLine = teamInfo
        ? `${escapeHTML(teamInfo.name)} · ${escapeHTML(teamInfo.masterCodename || '')}`
        : '<span style="color:#94a3b8">未分配</span>';
      const sessionLine = worker.session ? escapeHTML(worker.session) : '<span style="color:#94a3b8">-</span>';

      document.getElementById('workerDrawerBody').innerHTML = `
        <div class="drawer-field">
          <div class="drawer-field-label">编号</div>
          <div class="drawer-field-value" style="font-family:monospace;">${escapeHTML(worker.id || '-')}</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">岗位</div>
          <div class="drawer-field-value">
            <span class="role-badge ${getRoleClass(worker.role)}" title="${escapeHTML(worker.role || '')}">${escapeHTML(getDisplayRole(worker))}</span>
          </div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">当前状态</div>
          <div class="drawer-field-value">${statusInfo.icon} ${escapeHTML(statusInfo.label)}</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">归属团队</div>
          <div class="drawer-field-value">${teamLine}</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">会话</div>
          <div class="drawer-field-value" style="font-family:monospace;">${sessionLine}</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">状态摘要</div>
          <div class="drawer-field-value">${escapeHTML(summary)}</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">最后心跳</div>
          <div class="drawer-field-value">${escapeHTML(heartbeatStr)}</div>
        </div>
      `;

      // 底部操作
      let footerHtml = '<button type="button" class="drawer-action-btn secondary" onclick="closeDrawer()">关闭</button>';
      if (teamInfo && teamInfo.masterId) {
        footerHtml += `<button type="button" class="drawer-action-btn primary" onclick="closeDrawer(); openChatWith('${escapeHTML(teamInfo.masterId)}');">💬 联系组长</button>`;
      } else if (worker.id && worker.status !== 'offline') {
        footerHtml += `<button type="button" class="drawer-action-btn primary" onclick="closeDrawer(); openJoinTeamModal('${escapeHTML(worker.id)}');">加入团队</button>`;
      } else {
        footerHtml += `<button type="button" class="drawer-action-btn primary" disabled>加入团队</button>`;
      }
      document.getElementById('workerDrawerFooter').innerHTML = footerHtml;

      // 显示（复用现有 .open 样式）
      document.getElementById('workerDrawerOverlay').classList.add('open');
      document.getElementById('workerDrawerPanel').classList.add('open');
    }

    function closeDrawer() {
      const ov = document.getElementById('workerDrawerOverlay');
      const pn = document.getElementById('workerDrawerPanel');
      if (ov) ov.classList.remove('open');
      if (pn) pn.classList.remove('open');
    }

    // v0.6.1: Leader 右滑抽屉（驾驶舱）
    function openLeaderDrawer(teamId) {
      const team = currentState.teams.find(t => t.id === teamId);
      if (!team) return;

      const leaderName = team.masterCodename || team.master || 'Leader';
      const status = team.masterStatus === 'offline' ? 'offline' : (team.healthy ? 'healthy' : 'degraded');
      const statusLabel = getStatusLabel(status);
      const onlineCount = team.members.filter(m => m.status !== 'offline').length;
      const busyCount = team.members.filter(m => m.status === 'busy').length;
      const pendingCount = team.pendingDecisions || 0;
      const proj = team.currentProject;

      // 标题
      document.getElementById('workerDrawerTitle').innerHTML =
        `${escapeHTML(leaderName)}<span class="drawer-title-badge">Leader</span>`;

      // 当前项目
      let projSection = '';
      if (proj) {
        const ds = typeof summarizeDocs === 'function' ? summarizeDocs(proj.docs) : { total: 0 };
        projSection = `
          <div class="drawer-field">
            <div class="drawer-field-label">当前项目</div>
            <div class="drawer-field-value">
              <div style="font-weight:600; margin-bottom:4px;">${escapeHTML(proj.name)}</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <span class="stage-badge stage-${proj.stage}">${escapeHTML(typeof getStageLabel === 'function' ? getStageLabel(proj.stage) : proj.stage)}</span>
                ${proj.codeRepo ? `<span class="repo-chip">📁 代码 ${proj.codeRepo.commits}</span>` : ''}
                <span class="doc-chip">📄 ${ds.total} 篇文档</span>
              </div>
            </div>
          </div>`;
      }

      // 待决策预览（最多 3 条）
      let decisionsPreview = '';
      if (pendingCount > 0) {
        const allDecisions = (currentState.pendingDecisions || []).filter(d => d.teamId === teamId || d.team === team.name);
        const top3 = allDecisions.slice(0, 3);
        if (top3.length > 0) {
          decisionsPreview = `
            <div class="drawer-field">
              <div class="drawer-field-label">待决策预览</div>
              <div class="drawer-field-value" style="display:flex; flex-direction:column; gap:6px;">
                ${top3.map(d => `<div style="font-size:12px; padding:6px 8px; background:#fffbeb; border-radius:4px; border-left:3px solid #f59e0b;">
                  <span style="color:#92400e; font-weight:500;">${escapeHTML(d.title || d.summary || '待决策')}</span>
                </div>`).join('')}
              </div>
            </div>`;
        }
      }

      // 团队动态预览（最近 3 条）
      const activities = (team.activities || []).slice(0, 3);
      let activitySection = '';
      if (activities.length > 0) {
        activitySection = `
          <div class="drawer-field">
            <div class="drawer-field-label">最近动态</div>
            <div class="drawer-field-value" style="display:flex; flex-direction:column; gap:4px;">
              ${activities.map(a => `<div style="font-size:12px; color:var(--text-secondary);">
                <span style="color:var(--text-muted); margin-right:6px;">${formatRelativeTime(a.time)}</span>${escapeHTML(a.desc || a.text || '')}
              </div>`).join('')}
            </div>
          </div>`;
      }

      document.getElementById('workerDrawerBody').innerHTML = `
        <div class="drawer-field">
          <div class="drawer-field-label">身份</div>
          <div class="drawer-field-value">${escapeHTML(team.name)} · Leader（主控）</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">当前状态</div>
          <div class="drawer-field-value">${getStatusIcon(status)} ${escapeHTML(statusLabel)}</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">当前任务</div>
          <div class="drawer-field-value" style="font-weight:500;">${escapeHTML(team.task || '无任务')}</div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">团队负载</div>
          <div class="drawer-field-value">
            <span style="display:inline-flex; gap:12px;">
              <span>👥 ${onlineCount}/${team.members.length} 在线</span>
              <span style="color:#7c3aed;">🔥 ${busyCount} 忙碌</span>
              ${pendingCount > 0 ? `<span style="color:#f59e0b;">⚠️ ${pendingCount} 待决策</span>` : ''}
            </span>
          </div>
        </div>
        <div class="drawer-field">
          <div class="drawer-field-label">最近活动</div>
          <div class="drawer-field-value" style="font-size:12px;">${formatRelativeTime(team.lastActivity)}</div>
        </div>
        ${projSection}
        ${decisionsPreview}
        ${activitySection}
      `;

      // 底部操作
      document.getElementById('workerDrawerFooter').innerHTML = `
        <button type="button" class="drawer-action-btn secondary" onclick="closeDrawer()">关闭</button>
        <button type="button" class="drawer-action-btn secondary" onclick="closeDrawer(); openTeamTab('${escapeHTML(teamId)}')">进入团队详情</button>
        <button type="button" class="drawer-action-btn primary" onclick="closeDrawer(); openWorkerChat('${escapeHTML(leaderName)}')">💬 协作</button>
      `;

      document.getElementById('workerDrawerOverlay').classList.add('open');
      document.getElementById('workerDrawerPanel').classList.add('open');
    }

    // ESC 关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const pn = document.getElementById('workerDrawerPanel');
        if (pn && pn.classList.contains('open')) closeDrawer();
        else dismissActiveInteractionFromKeyboard();
      }
    });

  


;


(function(){
  // v0.6.32 原型就地优化补丁：只改展示层 mock、文案和头像引用，不接真实后端。
  const V632_PATCH_TS = Date.now();
  const ROLE_LABELS_V632 = {
    '@explorer': '协同规划岗（组长）',
    '@fixer': '实现验证岗',
    '@designer': '交付审查岗',
    '@oracle': '系统架构师 / 技术专家岗'
  };
  const ROLE_SHORT_V632 = {
    '@explorer': '协同规划岗',
    '@fixer': '实现验证岗',
    '@designer': '交付审查岗',
    '@oracle': '技术专家岗'
  };

  function assetPathV632(relativePath) {
    const adapter = window.__agentTeamAdapters && window.__agentTeamAdapters.resolveAssetPath;
    if (typeof adapter === 'function') return adapter(relativePath);
    const isFileProtocol = window.location.protocol === 'file:';
    const inPrototypesDir = window.location.pathname.indexOf('/prototypes/') >= 0;
    if (isFileProtocol || inPrototypesDir) return './' + relativePath;
    return '/docs/prototypes/' + relativePath;
  }

  window.getLeaderAvatarSrc = function(teamOrWorker) {
    // p01：组长使用深色人形数字员工头像；状态仍由 UI 状态点表达。
    return assetPathV632('pic/avatars/avatar-leader-planner-01.png');
  };
  window.getWorkerAvatarSrc = function(workerOrStatus) {
    const worker = typeof workerOrStatus === 'object' ? workerOrStatus : {};
    const role = worker.role || '';
    const nameOrId = String(worker.name || worker.id || '');
    const useAltImplementer = /(?:实现|AGT-).*?(?:-2|2$|4$|6$|8$)/.test(nameOrId);
    if (role === '@fixer') {
      return assetPathV632(useAltImplementer ? 'pic/avatars/avatar-implementer-02.png' : 'pic/avatars/avatar-implementer-01.png');
    }
    if (role === '@designer') return assetPathV632('pic/avatars/avatar-reviewer-01.png');
    if (role === '@oracle') return assetPathV632('pic/avatars/avatar-architect-01.png');
    if (role === '@explorer') return assetPathV632('pic/avatars/avatar-leader-planner-01.png');
    return assetPathV632('pic/avatars/avatar-default.png');
  };

  if (typeof ROLE_MAP !== 'undefined') {
    ROLE_MAP['@explorer'] = '协同规划岗（组长）';
    ROLE_MAP['@fixer'] = '实现验证岗';
    ROLE_MAP['@designer'] = '交付审查岗';
    ROLE_MAP['@oracle'] = '系统架构师 / 技术专家岗';
    delete ROLE_MAP['@librarian'];
  }

  getDisplayRole = function(w) {
    if (!w) return '';
    if (w.teamRole === 'leader' || w.isLeader) return '协同规划岗（组长）';
    return w.projectRole || ROLE_LABELS_V632[w.role] || getRoleName(w.role) || '';
  };
  getPersonaRoleTitle = function(worker) {
    if (!worker) return '数字员工';
    return getDisplayRole(worker).replace('（组长）', '');
  };
  getShortProjectRole = function(w) {
    const label = getDisplayRole(w);
    if (label.includes('协同规划')) return '组长';
    if (label.includes('实现验证')) return '实现';
    if (label.includes('交付审查')) return '审查';
    if (label.includes('技术专家') || label.includes('架构')) return '专家';
    return label || '员工';
  };
  getPersonaMemberName = function(worker) { return worker?.name || '数字员工'; };
  getPersonaRoleTitle = function(worker) { return getDisplayRole(worker) || '数字员工'; };
  getRoleOutputLabel = function(worker) {
    const role = getDisplayRole(worker);
    if (role.includes('协同规划')) return '需求澄清 / 任务拆解 / 进度汇总 / 决策请求';
    if (role.includes('实现验证')) return '代码实现 / TDD 自测 / 执行回执 / 修复记录';
    if (role.includes('交付审查')) return '审查结论 / 整改建议 / 初验收记录';
    if (role.includes('技术专家') || role.includes('架构')) return '架构判断 / 技术风险 / 建议方案';
    return '任务产出 / 执行记录';
  };

  function workOrder(id, title, status, owner, pct, review) {
    return { id, title, status, owner, pct, review };
  }
  function doc(id, category, title, status, author, reviewers, agoMs, version) {
    return { id, category, title, status, authorId: author, reviewerIds: reviewers || [], updatedTs: tsNow - agoMs, version: version || '0.1' };
  }
  function member(id, name, role, projectRole, status, task, offset) {
    return { id, name, role, projectRole, status, currentTaskSummary: task, heartbeatTs: tsNow - (offset || 3000), templateId: role.replace('@','') };
  }
  function project(id, name, stage, health, repo, docs, blockers, workOrders, acceptanceQueue) {
    return {
      id, name, stage, health,
      startedAt: tsNow - 7 * 86400000,
      codeRepo: { url: repo, branch: 'main', commits: 32, lastCommitTs: tsNow - 3600000, provider: 'github' },
      modelRepo: null,
      docs, blockers: blockers || [], workOrders: workOrders || [], acceptanceQueue: acceptanceQueue || []
    };
  }

  function buildTeamsV632() {
    return [
      {
        id:'t1', name:'研发一组', masterStatus:'online', healthy:true, masterId:'AGT-001', masterCodename:'管理1',
        task:'P0a 工程骨架任务拆解 / 进度跟踪', pendingDecisions:1, pendingReviews:2, uptime:'2h 15m', sessionId:'sess-p0a-001', endpoint:'mock://leader-1',
        expertSupport:'已介入：运行节点 / 员工运行绑定 评审', lastActivity:tsNow - 60000,
        members:[
          member('AGT-002','实现1-1','@fixer','实现验证岗','busy','搭建前端路由与页面骨架，执行自测',2000),
          member('AGT-003','实现1-2','@fixer','实现验证岗','idle','等待接收 运行节点 mock 字段任务',5000),
          member('AGT-004','审查1-1','@designer','交付审查岗','busy','审查 P0a 工程骨架是否满足可演示闭环',3500),
          member('AGT-005','架构专家-1','@oracle','系统架构师 / 技术专家岗','busy','评审 运行节点 / 员工运行绑定 抽象',4500)
        ],
        activities:[
          {time:tsNow-60000, desc:'协同规划岗 管理1 拆解 P0a 工程骨架任务单，并分派给实现1-1 / 实现1-2'},
          {time:tsNow-180000, desc:'实现验证岗 实现1-1 完成前端路由自测，提交执行回执'},
          {time:tsNow-300000, desc:'交付审查岗 审查1-1 发现文档发布语义不清，退回实现验证岗补充说明'},
          {time:tsNow-480000, desc:'系统架构师 架构专家-1 评审 运行节点 / 员工运行绑定 设计边界'}
        ],
        currentProject: project('p0a','P0a 工程骨架','build','healthy','github.com/ymfy111/agent-team',[
          doc('p0a-doc-1','specs','产品需求规格 v0.6.32', 'approved','AGT-001',['AGT-005'],86400000,'v0.6.32'),
          doc('p0a-doc-2','specs','系统设计方案 v0.6.32', 'approved','AGT-005',['AGT-001'],72000000,'v0.6.32'),
          doc('p0a-doc-3','plans','P0a 执行顺序与任务卡清单','in_execution','AGT-001',['AGT-004'],5400000,'0.4'),
          doc('p0a-doc-4','reports','工程骨架实现记录','in_execution','AGT-002',['AGT-004'],3600000,'0.3'),
          doc('p0a-doc-5','reports','工程骨架自测记录','in_review','AGT-002',['AGT-004'],1800000,'0.2'),
          doc('p0a-doc-6','decisions','决策记录：v0.6.32 作为稳定基线','approved','AGT-001',[],86400000,'final')
        ], [{id:'blk-p0a-1', desc:'待确认 运行节点 字段只做 mock 展示，不触发真实调度', since:tsNow-7200000, severity:'medium'}], [
          workOrder('WO-P0A-001','建立前端 Mock 工程骨架','running','实现1-1',65,'self_check'),
          workOrder('WO-P0A-002','补充 运行节点 展示字段','assigned','实现1-2',10,'self_check'),
          workOrder('WO-P0A-003','工程骨架初验收','reviewing','审查1-1',40,'independent_acceptance')
        ], ['WO-P0A-003','文档发布语义审查'])
      },
      {
        id:'t2', name:'研发二组', masterStatus:'online', healthy:true, masterId:'AGT-006', masterCodename:'管理2',
        task:'P0b 文档发布闭环 / Agent 上下文语义', pendingDecisions:1, pendingReviews:1, uptime:'1h 42m', sessionId:'sess-p0b-002', endpoint:'mock://leader-2',
        expertSupport:'暂无待决策', lastActivity:tsNow - 150000,
        members:[
          member('AGT-007','实现2-1','@fixer','实现验证岗','busy','完善保存草稿 / 发布给 Agent 的展示差异',1600),
          member('AGT-008','实现2-2','@fixer','实现验证岗','idle','等待处理撤销发布 mock 交互',4200),
          member('AGT-009','审查2-1','@designer','交付审查岗','idle','准备审查文档分类和发布说明',5200)
        ],
        activities:[
          {time:tsNow-150000, desc:'协同规划岗 管理2 发布 P0b 文档发布闭环计划'},
          {time:tsNow-260000, desc:'实现验证岗 实现2-1 区分保存草稿与发布给 Agent 的按钮语义'},
          {time:tsNow-420000, desc:'交付审查岗 审查2-1 等待接收文档库初验收任务'}
        ],
        currentProject: project('p0b','P0b 文档发布闭环','design','healthy','github.com/ymfy111/agent-team',[
          doc('p0b-doc-1','specs','文档作为协作上下文说明','approved','AGT-006',['AGT-009'],86400000,'1.0'),
          doc('p0b-doc-2','plans','P0b 文档发布闭环任务卡','in_execution','AGT-006',['AGT-009'],7200000,'0.5'),
          doc('p0b-doc-3','reports','发布给 Agent mock 验证记录','draft','AGT-007',[],1800000,'0.1'),
          doc('p0b-doc-4','decisions','文档发布前关键确认项','in_review','AGT-006',['AGT-009'],3600000,'0.2')
        ], [], [
          workOrder('WO-P0B-001','文档分类展示层映射','running','实现2-1',55,'self_check'),
          workOrder('WO-P0B-002','发布给 Agent 语义说明','submitted','实现2-1',90,'independent_acceptance')
        ], ['WO-P0B-002'])
      },
      {
        id:'t3', name:'研发三组', masterStatus:'online', healthy:false, masterId:'AGT-010', masterCodename:'管理3',
        task:'P1 小云对话集成边界说明', pendingDecisions:1, pendingReviews:0, uptime:'48m', sessionId:'sess-p1-xy-003', endpoint:'mock://leader-3',
        expertSupport:'待介入：agent-web-kit 事件订阅边界', lastActivity:tsNow - 90000,
        members:[
          member('AGT-011','实现3-1','@fixer','实现验证岗','busy','调整小云入口文案，保持 Mock / 待接入口径',1800),
          member('AGT-012','实现3-2','@fixer','实现验证岗','offline','离线，等待恢复后处理附件展示',7200000),
          member('AGT-013','审查3-1','@designer','交付审查岗','idle','审查小云是否混入团队成员',6200)
        ],
        activities:[
          {time:tsNow-90000, desc:'协同规划岗 管理3 提交小云 / agent-web-kit 集成边界待决策'},
          {time:tsNow-250000, desc:'实现验证岗 实现3-1 将小云说明收敛为全局助手入口'},
          {time:tsNow-520000, desc:'交付审查岗 审查3-1 确认小云未进入团队编队'}
        ],
        currentProject: project('p1-xy','P1 小云对话集成','design','warning','github.com/ymfy111/agent-team',[
          doc('p1xy-doc-1','specs','小云全局助手边界说明','approved','AGT-010',['AGT-013'],86400000,'0.8'),
          doc('p1xy-doc-2','plans','agent-web-kit 待接入计划','draft','AGT-010',[],3600000,'0.1'),
          doc('p1xy-doc-3','decisions','是否引入问题卡 / 决策卡事件订阅','in_review','AGT-010',['AGT-013'],1800000,'0.2')
        ], [{id:'blk-xy-1', desc:'agent-web-kit 仅做边界展示，不能误表达为已真实接入', since:tsNow-3600000, severity:'medium'}], [
          workOrder('WO-P1-XY-001','小云入口与说明文案收敛','running','实现3-1',45,'self_check')
        ], [])
      },
      {
        id:'t4', name:'研发四组', masterStatus:'online', healthy:true, masterId:'AGT-014', masterCodename:'管理4',
        task:'P1 数字员工运行态 / 运行节点 展示', pendingDecisions:0, pendingReviews:1, uptime:'3h 10m', sessionId:'sess-runtime-004', endpoint:'mock://leader-4',
        expertSupport:'已介入：运行态绑定设计', lastActivity:tsNow - 210000,
        members:[
          member('AGT-015','实现4-1','@fixer','实现验证岗','busy','补充 员工运行绑定 mock 信息',1100),
          member('AGT-016','实现4-2','@fixer','实现验证岗','idle','等待运行态摘要字段验收',5300),
          member('AGT-017','审查4-1','@designer','交付审查岗','busy','审查运行态是否仅为占位展示',2800),
          member('AGT-018','技术专家-1','@oracle','系统架构师 / 技术专家岗','idle','评审多 运行节点 部署假设',6600)
        ],
        activities:[
          {time:tsNow-210000, desc:'系统架构师 技术专家-1 建议引入 运行节点 / RuntimeNode 抽象'},
          {time:tsNow-390000, desc:'实现验证岗 实现4-1 补充 员工运行绑定 的 workspaceDir 与 syncStatus 展示'},
          {time:tsNow-760000, desc:'交付审查岗 审查4-1 检查是否出现真实 OpenCode Runtime 调度表达'}
        ],
        currentProject: project('p1-runtime','P1 数字员工运行态','build','healthy','github.com/ymfy111/agent-team',[
          doc('p1rt-doc-1','specs','数字员工运行态设计说明','approved','AGT-014',['AGT-018'],86400000,'0.6'),
          doc('p1rt-doc-2','plans','运行节点 mock 展示任务卡','in_execution','AGT-014',['AGT-017'],7200000,'0.3'),
          doc('p1rt-doc-3','reports','运行态字段自测记录','in_review','AGT-015',['AGT-017'],2600000,'0.2')
        ], [], [
          workOrder('WO-P1-RT-001','员工运行绑定 展示字段补齐','running','实现4-1',70,'self_check'),
          workOrder('WO-P1-RT-002','运行态占位审查','reviewing','审查4-1',35,'independent_acceptance')
        ], ['WO-P1-RT-002'])
      },
      {
        id:'t5', name:'研发五组', masterStatus:'online', healthy:true, masterId:'AGT-019', masterCodename:'管理5',
        task:'P1 交付审查闭环 / 整改任务单', pendingDecisions:1, pendingReviews:3, uptime:'4h 25m', sessionId:'sess-review-005', endpoint:'mock://leader-5',
        expertSupport:'暂无待决策', lastActivity:tsNow - 120000,
        members:[
          member('AGT-020','实现5-1','@fixer','实现验证岗','busy','修复审查退回的问题清单',1200),
          member('AGT-021','实现5-2','@fixer','实现验证岗','idle','等待接收 acceptance_fix 任务单',5500),
          member('AGT-022','审查5-1','@designer','交付审查岗','busy','执行交付审查并生成整改建议',1800)
        ],
        activities:[
          {time:tsNow-120000, desc:'交付审查岗 审查5-1 退回文档发布逻辑问题，生成整改建议'},
          {time:tsNow-300000, desc:'实现验证岗 实现5-1 接收 acceptance_fix 整改任务单'},
          {time:tsNow-540000, desc:'协同规划岗 管理5 汇总审查结果，准备报工前确认'}
        ],
        currentProject: project('p1-review','P1 交付审查闭环','test','healthy','github.com/ymfy111/agent-team',[
          doc('p1rv-doc-1','specs','交付审查岗职责边界','approved','AGT-019',['AGT-022'],86400000,'1.0'),
          doc('p1rv-doc-2','plans','交付审查闭环任务卡','in_execution','AGT-019',['AGT-022'],7200000,'0.4'),
          doc('p1rv-doc-3','reports','初验收记录：文档发布闭环','in_review','AGT-022',['AGT-019'],1800000,'0.2'),
          doc('p1rv-doc-4','reports','整改建议清单','draft','AGT-022',[],900000,'0.1'),
          doc('p1rv-doc-5','decisions','是否允许初验收报工','in_review','AGT-019',['AGT-022'],2400000,'0.1')
        ], [], [
          workOrder('WO-P1-RV-001','交付审查清单 mock 展示','reviewing','审查5-1',60,'independent_acceptance'),
          workOrder('WO-P1-RV-002','整改任务单生成展示','running','实现5-1',50,'self_check')
        ], ['WO-P1-RV-001','WO-P1-RV-002','初验收报工确认'])
      }
    ];
  }

  function buildDecisionsV632() {
    return [
      { id:'d-v632-1', teamId:'t1', requesterId:'AGT-005', type:'技术路线取舍', title:'运行节点 是否作为独立抽象进入 P0a 展示', urgent:false, timeTs:tsNow-60000, expiresAt:tsNow+3600000, status:'pending', projectId:'p0a', sourceRole:'系统架构师 / 技术专家岗', sourceDoc:'系统设计方案 v0.6.32', suggestedOwner:'用户 / 协同规划岗 管理1', escalationPath:'实现验证岗 → 协同规划岗 → 系统架构师 → 用户', fromReview:false, context:'技术专家建议在原型中展示 运行节点 / RuntimeNode 抽象，但本轮只能做 mock 展示，不能表达为真实调度能力。\n\n需要确认：是否在团队详情和设置页展示该抽象。', options:[{label:'展示为 模拟 / 占位能力',kind:'primary'},{label:'暂不展示，留到后续设计文档',kind:'normal'}] },
      { id:'d-v632-2', teamId:'t2', requesterId:'AGT-006', type:'文档发布确认', title:'发布给 Agent 前是否需要用户确认关键执行上下文', urgent:false, timeTs:tsNow-180000, expiresAt:tsNow+7200000, status:'pending', projectId:'p0b', sourceRole:'协同规划岗', sourceDoc:'P0b 文档发布闭环任务卡', suggestedOwner:'用户', escalationPath:'协同规划岗 → 用户确认', fromReview:false, context:'文档发布会成为数字员工执行上下文。当前只是原型 mock，但需要在 UI 上明确“保存草稿”和“发布给 Agent”的差异。', options:[{label:'保留发布前确认说明',kind:'primary'},{label:'只保留按钮，不展示确认说明',kind:'normal'}] },
      { id:'d-v632-3', teamId:'t3', requesterId:'AGT-010', type:'agent-web-kit 边界', title:'小云是否展示问题卡 / 决策卡事件订阅说明', urgent:false, timeTs:tsNow-90000, expiresAt:tsNow+5400000, status:'pending', projectId:'p1-xy', sourceRole:'协同规划岗', sourceDoc:'小云全局助手边界说明', suggestedOwner:'系统架构师 / 用户', escalationPath:'协同规划岗 → 系统架构师 → 用户确认', fromReview:false, context:'小云是全局助手，不是组长或团队成员。agent-web-kit 只负责聊天 UI、消息渲染、附件、问题卡、决策卡和事件订阅，本轮不真实接入。', options:[{label:'展示边界说明，不做真实接入',kind:'primary'},{label:'隐藏 agent-web-kit 文案',kind:'normal'}] },
      { id:'d-v632-4', teamId:'t5', requesterId:'AGT-022', type:'待审查升级', title:'交付审查退回后是否允许直接报工', urgent:true, timeTs:tsNow-120000, expiresAt:tsNow+1800000, status:'pending', projectId:'p1-review', sourceRole:'交付审查岗', sourceDoc:'初验收记录：文档发布闭环', suggestedOwner:'协同规划岗 管理5', escalationPath:'交付审查岗 → 协同规划岗 → 实现验证岗整改', fromReview:true, context:'交付审查岗发现发布语义不清，按规则应优先退回实现验证岗整改。只有涉及业务取舍或报工口径时，才升级给用户决策。', options:[{label:'退回实现验证岗整改，暂不报工',kind:'primary'},{label:'允许带风险报工',kind:'danger'}] }
    ];
  }

  function applyV632MockState() {
    if (typeof baseState === 'undefined' || typeof currentState === 'undefined') return;
    baseState.teams = buildTeamsV632();
    baseState.workers = [
      member('AGT-030','实现-1','@fixer','实现验证岗','unclaimed','待分配到 P1 数字员工运行态任务',3500),
      member('AGT-031','审查-1','@designer','交付审查岗','unclaimed','待加入交付审查闭环',6500),
      member('AGT-032','技术专家-2','@oracle','系统架构师 / 技术专家岗','idle','共享专家池，按待决策',4800)
    ];
    baseState.decisions = buildDecisionsV632();
    currentState = prototypeStore.resetState(baseState);
    currentSelectedDecisionId = currentState.decisions[0]?.id || null;
  }

  function applyV632RolesAndSkills() {
    if (typeof roles !== 'undefined' && Array.isArray(roles)) {
      roles.splice(0, roles.length,
        { id:'explorer', displayName:'协同规划岗', templateName:'协同规划岗数字员工模板', description:'默认担任团队 Leader，负责用户沟通、需求与设计收敛、计划拆解、任务分派、进度跟踪、分歧协调和决策升级。', responsibilities:['用户沟通','需求与设计收敛','任务单拆解','进度跟踪','阻塞与分歧初判','升级用户决策'], createPolicy:'每个团队最多 1 个，且只能作为组长 / Leader，不进入普通成员池。' },
        { id:'fixer', displayName:'实现验证岗', templateName:'实现验证岗数字员工模板', description:'负责开发、TDD、自测、修复和提交执行回执，可多个实例并行，但不负责最终交付放行。', responsibilities:['代码实现','TDD / 自测','缺陷修复','执行回执','待提交内容整理'], createPolicy:'可多实例并行，按任务单分配到具体项目。' },
        { id:'designer', displayName:'交付审查岗', templateName:'交付审查岗数字员工模板', description:'负责独立质量门禁、初验收、整改建议和通过后报工，不等同于开发自测。', responsibilities:['待审查任务','审查范围','审查结论','整改建议','初验收报工'], createPolicy:'可多实例，但与实现验证岗职责分离。' },
        { id:'oracle', displayName:'系统架构师 / 技术专家岗', templateName:'系统架构师 / 技术专家岗数字员工模板', description:'默认作为共享专家池，按待决策重大技术决策、架构分歧和关键方案评审。', responsibilities:['架构评审','技术风险识别','重大方案判断','升级用户决策建议'], createPolicy:'默认共享专家池，不强制每个团队固定配置。' }
      );
    }
    if (typeof skills !== 'undefined' && Array.isArray(skills)) {
      skills.splice(0, skills.length,
        { id:'requirements-clarification', name:'需求澄清', version:'1.0.0', description:'将用户意图沉淀为可执行需求和约束。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# 需求澄清\n\n输出需求边界、约束、待决策问题。', content:'# 需求澄清' },
        { id:'planning-breakdown', name:'计划拆解', version:'1.0.0', description:'将需求和设计拆成可派发 WorkOrder。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# 计划拆解\n\n输出任务单、依赖、验收标准。', content:'# 计划拆解' },
        { id:'progress-tracking', name:'进度跟踪', version:'1.0.0', description:'跟踪任务单状态、阻塞和交付风险。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# 进度跟踪', content:'# 进度跟踪' },
        { id:'code-implementation', name:'代码实现', version:'1.0.0', description:'基于任务单完成代码和配置实现。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# 代码实现', content:'# 代码实现' },
        { id:'tdd-self-check', name:'TDD / 自测', version:'1.0.0', description:'执行测试、自验证和问题修复。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# TDD / 自测', content:'# TDD / 自测' },
        { id:'acceptance-checklist', name:'验收清单', version:'1.0.0', description:'按任务单验收标准执行交付审查。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# 验收清单', content:'# 验收清单' },
        { id:'rework-suggestion', name:'整改建议', version:'1.0.0', description:'输出交付审查不通过后的完整问题清单和整改建议。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# 整改建议', content:'# 整改建议' },
        { id:'architecture-review', name:'架构评审', version:'1.0.0', description:'识别架构风险、分歧和关键技术取舍。', enabled:true, scope:'role', updatedAt:'2026-05-17', mdContent:'# 架构评审', content:'# 架构评审' },
        { id:'decision-escalation', name:'决策升级', version:'1.0.0', description:'把超出岗位判断范围的问题升级给协同规划岗或用户。', enabled:true, scope:'global', updatedAt:'2026-05-17', mdContent:'# 决策升级', content:'# 决策升级' }
      );
    }
    if (typeof roleSkillMappings !== 'undefined' && Array.isArray(roleSkillMappings)) {
      roleSkillMappings.splice(0, roleSkillMappings.length,
        { roleId:'explorer', skillId:'requirements-clarification', source:'role', enabled:true },
        { roleId:'explorer', skillId:'planning-breakdown', source:'role', enabled:true },
        { roleId:'explorer', skillId:'progress-tracking', source:'role', enabled:true },
        { roleId:'explorer', skillId:'decision-escalation', source:'role', enabled:true },
        { roleId:'fixer', skillId:'code-implementation', source:'role', enabled:true },
        { roleId:'fixer', skillId:'tdd-self-check', source:'role', enabled:true },
        { roleId:'designer', skillId:'acceptance-checklist', source:'role', enabled:true },
        { roleId:'designer', skillId:'rework-suggestion', source:'role', enabled:true },
        { roleId:'oracle', skillId:'architecture-review', source:'role', enabled:true },
        { roleId:'oracle', skillId:'decision-escalation', source:'role', enabled:true }
      );
      selectedSkillId = 'requirements-clarification';
    }
  }

  function allWorkersV632() {
    const out = [];
    (currentState.teams || []).forEach(t => {
      out.push({ id:t.masterId, name:t.masterCodename, role:'@explorer', projectRole:'协同规划岗（组长）', status:t.masterStatus === 'offline' ? 'offline' : 'busy', teamId:t.id, teamName:t.name, teamRole:'leader', isLeader:true, currentTaskSummary:t.task, heartbeatTs:t.lastActivity || tsNow, templateId:'explorer' });
      (t.members || []).forEach(m => out.push({ ...m, teamId:t.id, teamName:t.name, teamRole:'member' }));
    });
    (currentState.workers || []).forEach(w => out.push({ ...w, teamRole:'pool' }));
    return out;
  }
  getAllWorkers = allWorkersV632;

  function roleComposition(team) {
    const members = team.members || [];
    const impl = members.filter(m => m.role === '@fixer').length;
    const review = members.filter(m => m.role === '@designer').length;
    const expert = members.filter(m => m.role === '@oracle').length;
    return `实现验证岗 x${impl} · 交付审查岗 x${review} · 技术专家 ${expert ? '已介入' : '待介入 / 暂无待决策'}`;
  }
  function pendingReviews(team) { return Number(team.pendingReviews || team.currentProject?.acceptanceQueue?.length || 0); }
  function pendingDecisions(team) { return (currentState.decisions || []).filter(d => d.teamId === team.id && d.status === 'pending').length; }
  function activeWorkOrders(team) { return (team.currentProject?.workOrders || []).filter(w => ['assigned','running','blocked','submitted','reviewing'].includes(w.status)); }

  renderOverview = function() {
    const all = allWorkersV632();
    const online = all.filter(w => w.status !== 'offline').length;
    const offline = all.length - online;
    const activeTasks = (currentState.teams || []).reduce((n,t)=>n + activeWorkOrders(t).length,0);
    const reviewCount = (currentState.teams || []).reduce((n,t)=>n + pendingReviews(t),0);
    const decisionCount = (currentState.decisions || []).filter(d=>d.status==='pending').length;
    document.getElementById('statMasterCount').innerText = online;
    document.getElementById('statMasterDesc').innerText = `${all.length} 总 / ${offline} 离线`;
    document.getElementById('statTeamCount').innerText = currentState.teams.length;
    document.getElementById('statTeamDesc').innerText = '岗位驱动团队运行中';
    document.getElementById('statWorkerCount').innerText = activeTasks;
    document.getElementById('statWorkerDesc').innerText = '分派 · 执行 · 审查';
    document.getElementById('statDecisionCount').innerText = `${decisionCount}/${reviewCount}`;
    document.getElementById('statDecisionDesc').innerText = `${decisionCount} 待决策 · ${reviewCount} 待审查`;
    currentActivityList = [];
    (currentState.teams || []).forEach(t => (t.activities || []).forEach(a => currentActivityList.push({...a, teamId:t.id, teamName:t.name})));
    currentActivityList.sort((a,b)=>b.time-a.time);
    renderActivityTeamTabs();
    renderActivityStream();
    renderTopology();
  };

  renderTopology = function() {
    const host = document.getElementById('topologyHtml');
    if (!host) return;
    host.innerHTML = (currentState.teams || []).map(t => {
      const masterCls = t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'online-healthy' : 'online-warning');
      const members = t.members || [];
      const workersHtml = members.map(m => {
        const sCls = ['idle','busy','offline'].includes(m.status) ? m.status : 'idle';
        return `<div class="topo-worker topo-node ${sCls}" data-action="open-worker" data-worker-name="${escapeHTML(m.name)}" data-master="${escapeHTML(t.name)}" title="${escapeHTML(m.name)} · ${escapeHTML(getDisplayRole(m))} · ${escapeHTML(getStatusLabel(m.status))}">
          <span class="persona-avatar worker ${getPersonaTone(m)} ${getPersonaStatusClass(m.status)}"><img class="persona-avatar-img" src="${getWorkerAvatarSrc(m)}" alt="" loading="lazy"><span class="persona-status-dot ${sCls}"></span></span>
          <span class="topo-worker-text"><span class="topo-worker-name">${escapeHTML(m.name)}</span><span class="topo-worker-role">${escapeHTML(getDisplayRole(m))}</span></span>
        </div>`;
      }).join('');
      const expertText = (t.members || []).some(m=>m.role==='@oracle') ? '专家支持：已介入' : `专家支持：${t.expertSupport || '待介入 / 暂无待决策'}`;
      return `<div class="topo-team-card" data-team-id="${escapeHTML(t.id)}">
        <div class="topo-team-header"><div class="topo-team-titlewrap"><span class="topo-team-name">${escapeHTML(t.name)}</span><div class="topo-team-projectline"><span class="topo-team-project" title="${escapeHTML(t.currentProject?.name || '')}">${escapeHTML(t.currentProject?.name || '未绑定项目')}</span><span class="stage-badge stage-${t.currentProject?.stage || 'build'}">${escapeHTML(getStageLabel(t.currentProject?.stage))}</span></div></div><span class="topo-team-enter" onclick="openTeamTab('${escapeHTML(t.id)}')">→ 详情</span></div>
        <div class="topo-master topo-node ${masterCls}" data-action="open-team" data-team-id="${escapeHTML(t.id)}" title="${escapeHTML(t.masterCodename)} · 协同规划岗（组长）">
          <span class="persona-avatar ${getPersonaTone(t,true)} ${getPersonaStatusClass(t.masterStatus === 'offline' ? 'offline' : 'busy')}"><img class="persona-avatar-img" src="${getLeaderAvatarSrc(t)}" alt="" loading="lazy"><span class="persona-status-dot ${t.masterStatus === 'offline' ? 'offline' : 'busy'}"></span></span>
          <span class="persona-main"><span class="persona-name-row"><span class="topo-master-name">${escapeHTML(t.masterCodename)}</span><span class="persona-role-tag">协同规划岗 · 组长</span></span><span class="persona-task">${escapeHTML(t.task || '需求澄清 / 任务拆解 / 进度跟踪')}</span></span>
          <button class="topo-node-action" title="与 ${escapeHTML(t.masterCodename)} 对话" onclick="event.stopPropagation(); openChatWith('${escapeHTML(t.masterId || t.id)}')"><span>💬</span><span>对话</span></button>
        </div>
        <div style="font-size:11px;color:var(--text-secondary);margin:-4px 0 8px;display:flex;gap:8px;flex-wrap:wrap;"><span>${escapeHTML(roleComposition(t))}</span><span>${escapeHTML(expertText)}</span></div>
        <div class="topo-workers">${workersHtml}</div>
      </div>`;
    }).join('');
    const poolEl = document.getElementById('unassignedPoolHtml');
    const unclaimed = (currentState.workers || []).filter(w => w.status === 'unclaimed' || w.status === 'offline');
    if (poolEl) {
      if (unclaimed.length) {
        poolEl.style.display = 'block';
        poolEl.querySelector('.pool-title').textContent = `待分配数字员工（${unclaimed.length}）`;
        poolEl.querySelector('.pool-nodes').innerHTML = unclaimed.map(w => `<div class="pool-node ${w.status === 'offline' ? 'offline' : 'unclaimed'} topo-node" data-action="open-worker" data-worker-name="${escapeHTML(w.name)}" title="${escapeHTML(w.name)} · ${escapeHTML(getDisplayRole(w))}">${escapeHTML(w.name)}</div>`).join('');
      } else poolEl.style.display = 'none';
    }
  };

  renderTeamCards = function() {
    const container = document.getElementById('teamCardsContainer');
    if (!container) return;
    container.innerHTML = (currentState.teams || []).map(t => {
      const proj = t.currentProject || {};
      const ds = summarizeDocs(proj.docs || []);
      const approved = ds.byStatus.approved || 0;
      const statusClass = t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'healthy' : 'degraded');
      return `<div class="card ${t.healthy ? '' : 'degraded'}" onclick="openTeamTab('${t.id}')">
        <div class="card-header"><div class="card-title"><span class="status-dot ${statusClass}"></span>${escapeHTML(t.name)}</div><div class="card-actions" onclick="event.stopPropagation();"><span class="badge" style="margin:0;background:#f59e0b;">${pendingDecisions(t)} 待决</span><button class="icon-btn" title="打开团队工作台" onclick="event.stopPropagation(); openTeamTab('${t.id}')">→</button></div></div>
        <div class="card-body">
          <div class="data-row"><span class="data-label">当前项目</span><span class="data-value">${escapeHTML(proj.name || '-')}</span></div>
          <div class="data-row"><span class="data-label">当前阶段</span><span class="stage-badge stage-${proj.stage || 'build'}">${escapeHTML(getStageLabel(proj.stage))}</span></div>
          <div class="data-row"><span class="data-label">组长</span><span class="data-value">${escapeHTML(t.masterCodename)} / 协同规划岗</span></div>
          <div class="data-row"><span class="data-label">岗位构成</span><span class="data-value" style="font-size:12px;text-align:right;">${escapeHTML(roleComposition(t))}</span></div>
          <div class="data-row"><span class="data-label">专家支持</span><span class="data-value" style="font-size:12px;text-align:right;">${escapeHTML(t.expertSupport || '待介入 / 暂无待决策')}</span></div>
          <div class="data-row"><span class="data-label">文档完成度</span><span class="doc-chip">📄 ${ds.total}/${approved}</span></div>
          <div class="data-row"><span class="data-label">待审查 / 待决策</span><span class="data-value">${pendingReviews(t)} / ${pendingDecisions(t)}</span></div>
          <div class="data-row"><span class="data-label">健康状态</span><span class="status-badge ${statusClass}">${getStatusIcon(statusClass)} ${escapeHTML(getStatusLabel(statusClass))}</span></div>
        </div>
      </div>`;
    }).join('');
  };

  renderProjects = function() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;
    const table = tbody.closest('table');
    const head = table?.querySelector('thead tr');
    if (head) head.innerHTML = '<th>项目 / 阶段</th><th>承接团队</th><th>组长 / 协同规划岗</th><th>岗位配置</th><th>专家支持</th><th>待审查 / 待决策</th><th>文档 / 最近更新</th>';
    const rows = (currentState.teams || []).filter(t=>t.currentProject).map(t=>({team:t, proj:t.currentProject}));
    const totalEl = document.getElementById('projectsTotalCount');
    const teamCntEl = document.getElementById('projectsTeamCount');
    if (totalEl) totalEl.textContent = rows.length;
    if (teamCntEl) teamCntEl.textContent = rows.length;
    tbody.innerHTML = rows.map(({team, proj}) => {
      const latestDocTs = (proj.docs || []).reduce((m,d)=>Math.max(m,d.updatedTs || 0),0);
      const ds = summarizeDocs(proj.docs || []);
      return `<tr>
        <td><span class="proj-name" onclick="openTeamTab('${team.id}')">${escapeHTML(proj.name)}</span><span class="proj-stage">${escapeHTML(getStageLabel(proj.stage))}</span></td>
        <td><span class="proj-team" onclick="openTeamTab('${team.id}')">${escapeHTML(team.name)}</span></td>
        <td>${escapeHTML(team.masterCodename)} / 协同规划岗</td>
        <td style="font-size:12px;">${escapeHTML(roleComposition(team))}</td>
        <td style="font-size:12px;">${escapeHTML(team.expertSupport || '待介入 / 暂无待决策')}</td>
        <td>${pendingReviews(team)} / ${pendingDecisions(team)}</td>
        <td><a class="proj-link" href="javascript:void(0)" onclick="event.stopPropagation(); openTeamProjectDocs('${team.id}')">📄 ${ds.total} 篇</a><span class="proj-time">${formatRelativeTime(Math.max(latestDocTs, team.lastActivity || 0))}</span></td>
      </tr>`;
    }).join('');
  };

  renderWorkerPool = function() {
    const container = document.getElementById('workerPoolContainer');
    if (!container) return;
    const keyword = (document.getElementById('searchWorkerInput')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('roleFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    let filtered = allWorkersV632().filter(w => {
      const text = `${w.name} ${w.id} ${getDisplayRole(w)} ${w.currentTaskSummary || ''}`.toLowerCase();
      return text.includes(keyword) && (roleFilter === 'all' || w.role === roleFilter) && (statusFilter === 'all' || w.status === statusFilter);
    });
    const groupBy = document.querySelector('[data-group-tab].active')?.dataset.groupTab || 'team';
    const renderCard = w => {
      const statusDot = ['idle','busy','offline'].includes(w.status) ? w.status : (w.status === 'unclaimed' ? 'unclaimed' : 'idle');
      const teamLine = w.teamId ? `${escapeHTML(w.teamName)} · ${w.teamRole === 'leader' ? '组长' : '成员'}` : '共享池 / 未分配';
      const contactBtn = w.teamRole === 'leader'
        ? `<button class="icon-btn" title="组长协调入口" onclick="event.stopPropagation(); openChatWith('${escapeHTML(w.id)}')">💬</button>`
        : `<button class="icon-btn" title="团队任务协作" onclick="event.stopPropagation(); openWorkerChat('${escapeHTML(w.id)}')">↪</button>`;
      return `<div class="worker-card clickable ${w.status === 'offline' ? 'offline' : ''}" onclick="openDrawer('${escapeHTML(w.id)}')">
        <div class="worker-card-top"><div class="worker-card-head"><div class="worker-card-identity"><span class="worker-card-avatar"><img src="${w.teamRole === 'leader' ? getLeaderAvatarSrc(w) : getWorkerAvatarSrc(w)}" alt="" loading="lazy"><span class="persona-status-dot ${statusDot}"></span></span><span class="role-badge worker-card-role-under-avatar ${getRoleClass(w.role)}">${escapeHTML(getDisplayRole(w))}</span></div><div class="worker-card-main"><div class="worker-card-title-row" style="font-weight:600;font-size:16px;color:var(--text-primary);"><span class="worker-card-name">${escapeHTML(w.name)}</span></div><div class="worker-card-meta">${escapeHTML(w.id)}</div></div></div><div class="card-actions worker-card-actions" onclick="event.stopPropagation();">${contactBtn}<button class="icon-btn" title="监控" onclick="event.stopPropagation(); openWorkerMonitor('${escapeHTML(w.id)}')">▣</button></div></div>
        <div class="worker-card-body"><div>所属: ${teamLine}</div><div>当前状态: ${escapeHTML(getStatusLabel(w.status))}</div><div>当前关注: ${escapeHTML(w.currentTaskSummary || '-')}</div><div class="worker-card-skills-summary">🔧 ${getSkillsForRole(w.role).length} 项岗位技能</div><div style="color:var(--text-muted);">${w.teamRole === 'leader' ? '团队协调 / 任务分派' : (w.teamId ? '成员按任务单协作' : '待分配到团队')}</div></div>
      </div>`;
    };
    const renderGroup = (key,title,workers,icon) => workers.length ? `<div class="role-group" id="role-group-${key}"><div class="role-group-header" onclick="toggleRoleGroup('${key}')"><div style="display:flex;align-items:center;gap:10px;"><span style="font-weight:600;display:flex;align-items:center;gap:6px;">${icon || ''}${title}</span><span class="badge" style="margin:0;background:var(--info);font-size:12px;padding:2px 8px;font-weight:normal;">${workers.length} 个实例</span></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div><div class="role-group-content">${workers.map(renderCard).join('')}</div></div>` : '';
    let html = '';
    if (groupBy === 'team') {
      (currentState.teams || []).forEach(t => html += renderGroup('team-'+t.id, t.name, filtered.filter(w=>w.teamId===t.id), '<span style="color:var(--info)">◆</span>'));
      html += renderGroup('team-none','共享专家池 / 未分配', filtered.filter(w=>!w.teamId), '<span style="color:var(--warning)">⊘</span>');
    } else {
      html += renderGroup('role-planner','协同规划岗（组长）', filtered.filter(w=>w.role==='@explorer'), '🧭');
      html += renderGroup('role-impl','实现验证岗', filtered.filter(w=>w.role==='@fixer'), '🛠️');
      html += renderGroup('role-review','交付审查岗', filtered.filter(w=>w.role==='@designer'), '✅');
      html += renderGroup('role-expert','系统架构师 / 技术专家岗', filtered.filter(w=>w.role==='@oracle'), '🧠');
    }
    container.innerHTML = html || `<div class="empty-state">没有找到符合条件的数字员工</div>`;
  };

  const origRenderDecisionDetailV632 = renderDecisionDetail;
  renderDecisionDetail = function(id) {
    const d = (currentState.decisions || []).find(x => x.id === id);
    origRenderDecisionDetailV632(id);
    const panel = document.getElementById('decisionDetailPanel');
    const body = panel?.querySelector('.decision-detail-body');
    if (!d || !body) return;
    const team = (currentState.teams || []).find(t => t.id === d.teamId);
    const extra = document.createElement('div');
    extra.className = 'decision-context';
    extra.innerHTML = `<div class="context-header"><span>决策来源与升级路径</span></div><div style="padding:12px 16px;font-size:12px;color:var(--text-secondary);line-height:1.8;">
      <div><strong>发起岗位：</strong>${escapeHTML(d.sourceRole || '协同规划岗')}</div>
      <div><strong>所属团队：</strong>${escapeHTML(team?.name || d.teamId)}</div>
      <div><strong>影响项目：</strong>${escapeHTML(team?.currentProject?.name || d.projectId || '-')}</div>
      <div><strong>关联文档：</strong>${escapeHTML(d.sourceDoc || '-')}</div>
      <div><strong>建议处理人：</strong>${escapeHTML(d.suggestedOwner || '用户')}</div>
      <div><strong>升级路径：</strong>${escapeHTML(d.escalationPath || '协同规划岗 → 用户')}</div>
      <div><strong>是否由待审查升级：</strong>${d.fromReview ? '是，来自交付审查整改争议' : '否'}</div>
    </div>`;
    body.insertBefore(extra, body.firstChild);
  };

  function adjustStaticDomV632() {
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) roleFilter.innerHTML = '<option value="all">全部岗位</option><option value="@explorer">协同规划岗（组长）</option><option value="@fixer">实现验证岗</option><option value="@designer">交付审查岗</option><option value="@oracle">系统架构师 / 技术专家岗</option>';
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.innerHTML = '<option value="all">全部状态</option><option value="busy">🟣 忙碌</option><option value="idle">🟢 在线</option><option value="unclaimed">🟡 待分配</option><option value="offline">⚫ 离线</option>';
    const workerSearch = document.getElementById('searchWorkerInput');
    if (workerSearch) workerSearch.placeholder = '搜索数字员工名称、岗位或运行态...';
    const settings = document.getElementById('page-settings');
    if (settings && !settings.querySelector('[data-v632-boundary-note]')) {
      const note = document.createElement('div');
      note.setAttribute('data-v632-boundary-note','1');
      note.className = 'docs-status-strip';
      note.style.marginBottom = '12px';
      note.innerHTML = '<span class="docs-status-pill active">当前版本：v0.6.32</span><span class="docs-status-pill">运行模式：Mock / Prototype</span><span class="docs-status-pill">Gateway / OpenCode Runtime：占位</span><span class="docs-status-pill">小云：Mock / agent-web-kit 待接入</span>';
      settings.prepend(note);
    }
    document.querySelectorAll('.app-header-badge').forEach(el => { el.textContent = 'v0.6.33.45'; });
  }

  applyV632RolesAndSkills();
  applyV632MockState();

  const prevOnloadV632 = window.onload;
  window.onload = function() {
    if (typeof prevOnloadV632 === 'function') prevOnloadV632.apply(this, arguments);
    adjustStaticDomV632();
    if (typeof renderOverview === 'function') renderOverview();
    if (typeof renderTeamCards === 'function') renderTeamCards();
    if (typeof renderProjects === 'function') renderProjects();
    if (typeof updateDecisionTeamFilter === 'function') updateDecisionTeamFilter();
    if (typeof renderDecisions === 'function') renderDecisions();
    if (typeof renderWorkerPool === 'function') renderWorkerPool();
    if (typeof renderRolesPage === 'function') renderRolesPage();
    if (typeof renderSkillTable === 'function') renderSkillTable();
    if (typeof renderRoleMapping === 'function') renderRoleMapping('explorer');
  };
})();


;


(function(){
  // 首页协作全景：p01 参考卡片布局 + 移除待分配池。只覆盖展示层 renderTopology，不改底层数据模型。
  function p01Esc(v) { return typeof escapeHTML === 'function' ? escapeHTML(v == null ? '' : String(v)) : String(v == null ? '' : v); }
  function p01StageLabel(stage) { return typeof getStageLabel === 'function' ? getStageLabel(stage) : (stage || '-'); }
  function p01StatusLabel(status) { return typeof getStatusLabel === 'function' ? getStatusLabel(status) : (status || '-'); }
  function p01DisplayRole(worker) { return typeof getDisplayRole === 'function' ? getDisplayRole(worker) : (worker?.projectRole || worker?.role || '数字员工'); }
  function p01WorkerAvatar(worker) { return typeof getWorkerAvatarSrc === 'function' ? getWorkerAvatarSrc(worker) : 'pic/avatars/avatar-default.png'; }
  function p01LeaderAvatar(team) { return typeof getLeaderAvatarSrc === 'function' ? getLeaderAvatarSrc(team) : 'pic/avatars/avatar-default.png'; }
  function p01PendingReviews(team) { return typeof pendingReviews === 'function' ? pendingReviews(team) : Number(team?.pendingReviews || 0); }
  function p01PendingDecisions(team) { return typeof pendingDecisions === 'function' ? pendingDecisions(team) : Number(team?.pendingDecisions || 0); }
  function p01DocPercent(project) {
    const docs = project?.docs || [];
    if (!docs.length) return 0;
    const done = docs.filter(d => ['approved','done','in_execution'].includes(d.status)).length;
    return Math.max(0, Math.min(100, Math.round(done / docs.length * 100)));
  }
  function p01RoleCounts(team) {
    const members = team?.members || [];
    return {
      impl: members.filter(m => m.role === '@fixer').length,
      review: members.filter(m => m.role === '@designer').length,
      expert: members.filter(m => m.role === '@oracle').length
    };
  }
  function p01TeamMembers(team) {
    const members = (team?.members || []).filter(m => ['@fixer','@designer','@oracle'].includes(m.role));
    const impl = members.filter(m => m.role === '@fixer').slice(0, 2);
    const reviewer = members.filter(m => m.role === '@designer').slice(0, 1);
    const expert = members.filter(m => m.role === '@oracle').slice(0, 1);
    return [...impl, ...reviewer, ...expert].slice(0, 4);
  }
  function p01NormalizeStatus(status) {
    return ['idle','busy','offline'].includes(status) ? status : 'idle';
  }
  function p01ExpertText(team) {
    const hasExpert = (team?.members || []).some(m => m.role === '@oracle');
    return hasExpert ? '已介入' : (team?.expertSupport || '待介入 / 暂无待决策');
  }
  function p01MetricIcon(kind) {
    const icons = { project:'▣', stage:'▰', health:'●', doc:'━' };
    return icons[kind] || '•';
  }
  function p01HealthText(team) {
    if (team?.masterStatus === 'offline') return '离线';
    return team?.healthy ? '良好' : '需关注';
  }
  function p01HealthCls(team) {
    if (team?.masterStatus === 'offline') return 'offline';
    return team?.healthy ? 'idle' : 'busy';
  }

  const previousAdjustStaticDom = window.adjustStaticDomV632;
  window.adjustOverviewLegendP01 = function() {
    document.querySelectorAll('#page-overview .topo-legend .topo-legend-item').forEach(item => {
      const text = (item.textContent || '').trim();
      const dot = item.querySelector('.topo-legend-dot');
      if (text.includes('空闲')) {
        item.innerHTML = '<i class="topo-legend-dot" style="background:#22c55e;"></i>在线';
      } else if (text.includes('忙碌')) {
        item.innerHTML = '<i class="topo-legend-dot" style="background:#f97316;"></i>忙碌';
      } else if (text.includes('离线')) {
        item.innerHTML = '<i class="topo-legend-dot" style="background:#94a3b8;"></i>离线';
      }
    });
  };

  window.renderTopology = function() {
    const host = document.getElementById('topologyHtml');
    if (!host) return;
    const teams = currentState?.teams || [];
    host.innerHTML = teams.map(t => {
      const project = t.currentProject || {};
      const stage = project.stage || 'build';
      const masterStatus = t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'online-healthy' : 'online-warning');
      const counts = p01RoleCounts(t);
      const workers = p01TeamMembers(t);
      const docPercent = p01DocPercent(project);
      const reviewCount = p01PendingReviews(t);
      const decisionCount = p01PendingDecisions(t);
      const workersHtml = workers.map(m => {
        const sCls = p01NormalizeStatus(m.status);
        return `<div class="topo-worker topo-node ${sCls}" data-action="open-worker" data-worker-name="${p01Esc(m.name)}" data-master="${p01Esc(t.name)}" title="${p01Esc(m.name)} · ${p01Esc(p01DisplayRole(m))} · ${p01Esc(p01StatusLabel(m.status))}">
          <span class="persona-avatar worker ${typeof getPersonaTone === 'function' ? getPersonaTone(m) : ''} ${typeof getPersonaStatusClass === 'function' ? getPersonaStatusClass(m.status) : ''}"><img class="persona-avatar-img" src="${p01Esc(p01WorkerAvatar(m))}" alt="" loading="lazy"><span class="persona-status-dot ${sCls}"></span></span>
          <span class="topo-worker-text"><span class="topo-worker-name">${p01Esc(m.name)}</span><span class="topo-worker-role">${p01Esc(p01DisplayRole(m))}</span><span class="topo-worker-focus">关注：${p01Esc(m.currentTaskSummary || '待接收任务单')}</span></span>
        </div>`;
      }).join('');
      return `<div class="topo-team-card" data-team-id="${p01Esc(t.id)}">
        <div class="topo-team-header">
          <div class="topo-team-titlewrap">
            <span class="topo-team-name">${p01Esc(t.name)}</span>
            <div class="topo-team-projectline"><span class="topo-team-project" title="${p01Esc(project.name || '')}">${p01Esc(project.name || '未绑定项目')}</span><span class="stage-badge stage-${p01Esc(stage)}">${p01Esc(p01StageLabel(stage))}</span></div>
          </div>
          <span class="topo-team-enter" onclick="openTeamTab('${p01Esc(t.id)}')">→ 详情</span>
        </div>
        <div class="topo-master topo-node ${masterStatus}" data-action="open-team" data-team-id="${p01Esc(t.id)}" title="${p01Esc(t.masterCodename)} · 协同规划岗（组长）">
          <span class="persona-avatar ${typeof getPersonaTone === 'function' ? getPersonaTone(t, true) : ''} ${typeof getPersonaStatusClass === 'function' ? getPersonaStatusClass(t.masterStatus === 'offline' ? 'offline' : 'busy') : ''}"><img class="persona-avatar-img" src="${p01Esc(p01LeaderAvatar(t))}" alt="" loading="lazy"><span class="persona-status-dot ${t.masterStatus === 'offline' ? 'offline' : 'idle'}"></span></span>
          <span class="persona-main"><span class="persona-name-row"><span class="topo-master-name">${p01Esc(t.masterCodename)}</span><span class="persona-role-tag">协同规划岗 · 组长</span></span><span class="persona-task">任务协调 / 决策把关<br>关注：${p01Esc(t.task || '需求澄清 / 任务拆解 / 进度跟踪')}</span></span>
          <button class="topo-node-action" title="与 ${p01Esc(t.masterCodename)} 对话" onclick="event.stopPropagation(); openChatWith('${p01Esc(t.masterId || t.id)}')"><span>💬</span><span>对话</span></button>
        </div>
        <div class="topo-card-meta">
          <span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 ${counts.impl}</span><span class="role-pill review">交付审查 ${counts.review}</span><span class="role-pill expert">专家支持：${p01Esc(p01ExpertText(t))}</span>
        </div>
        <div class="topo-workers">${workersHtml}</div>
        <div class="topo-card-summary">
          <span class="topo-summary-item"><span class="topo-summary-icon">${p01MetricIcon('project')}</span>当前项目：<strong title="${p01Esc(project.name || '-')}">${p01Esc(project.name || '-')}</strong></span>
          <span class="topo-summary-item"><span class="topo-summary-icon">${p01MetricIcon('stage')}</span>阶段：<strong>${p01Esc(p01StageLabel(stage))}</strong></span>
          <span class="topo-summary-item"><span class="topo-summary-icon" style="color:${p01HealthCls(t)==='busy' ? '#f97316' : p01HealthCls(t)==='offline' ? '#94a3b8' : '#22c55e'}">${p01MetricIcon('health')}</span>健康：<strong>${p01Esc(p01HealthText(t))}</strong></span>
          <span class="topo-summary-item"><span>文档：${docPercent}%</span><span class="topo-doc-progress"><i style="width:${docPercent}%"></i></span></span>
          <span class="topo-summary-item"><span>待审查：<strong>${reviewCount}</strong></span></span>
          <span class="topo-summary-item"><span>待决策：<strong>${decisionCount}</strong></span></span>
        </div>
      </div>`;
    }).join('');

    window.adjustOverviewLegendP01?.();

    const allCards = host.querySelectorAll('.topo-team-card');
    allCards.forEach(card => {
      card.addEventListener('mouseenter', () => allCards.forEach(other => { if (other !== card) other.classList.add('dimmed'); }));
      card.addEventListener('mouseleave', () => allCards.forEach(other => other.classList.remove('dimmed')));
    });
  };

  const prevOnload = window.onload;
  window.onload = function() {
    if (typeof prevOnload === 'function') prevOnload.apply(this, arguments);
    window.adjustOverviewLegendP01?.();
    if (typeof renderTopology === 'function') renderTopology();
  };
})();


;


(function(){
  function removeOverviewUnassignedPool(){
    document.querySelectorAll('#page-overview #unassignedPoolHtml').forEach(el => el.remove());
    document.querySelectorAll('#page-overview .topo-legend .topo-legend-item').forEach(item => {
      if ((item.textContent || '').includes('待分配')) item.remove();
    });
  }
  const prevLoad = window.onload;
  window.onload = function(){
    if (typeof prevLoad === 'function') prevLoad.apply(this, arguments);
    removeOverviewUnassignedPool();
  };
  document.addEventListener('DOMContentLoaded', removeOverviewUnassignedPool);
  window.removeOverviewUnassignedPool = removeOverviewUnassignedPool;
})();


;


(function(){
  // 首页协作全景 v3：保留 p01 视觉层级；去掉待分配池；取消 hover 变暗；将长“关注”改成短状态/任务提示。
  function v3Esc(v) { return typeof escapeHTML === 'function' ? escapeHTML(v == null ? '' : String(v)) : String(v == null ? '' : v); }
  function v3StageLabel(stage) { return typeof getStageLabel === 'function' ? getStageLabel(stage) : (stage || '-'); }
  function v3StatusLabel(status) {
    if (status === 'idle') return '在线';
    if (status === 'busy') return '忙碌';
    if (status === 'offline') return '离线';
    return typeof getStatusLabel === 'function' ? getStatusLabel(status) : (status || '-');
  }
  function v3DisplayRole(worker) { return typeof getDisplayRole === 'function' ? getDisplayRole(worker) : (worker?.projectRole || worker?.role || '数字员工'); }
  function v3WorkerAvatar(worker) { return typeof getWorkerAvatarSrc === 'function' ? getWorkerAvatarSrc(worker) : 'pic/avatars/avatar-default.png'; }
  function v3LeaderAvatar(team) { return typeof getLeaderAvatarSrc === 'function' ? getLeaderAvatarSrc(team) : 'pic/avatars/avatar-leader-planner-01.png'; }
  function v3PendingReviews(team) { return typeof pendingReviews === 'function' ? pendingReviews(team) : Number(team?.pendingReviews || 0); }
  function v3PendingDecisions(team) { return typeof pendingDecisions === 'function' ? pendingDecisions(team) : Number(team?.pendingDecisions || 0); }
  function v3DocPercent(project) {
    const docs = project?.docs || [];
    if (!docs.length) return 0;
    const done = docs.filter(d => ['approved','done','in_execution'].includes(d.status)).length;
    return Math.max(0, Math.min(100, Math.round(done / docs.length * 100)));
  }
  function v3RoleCounts(team) {
    const members = team?.members || [];
    return {
      impl: members.filter(m => m.role === '@fixer').length,
      review: members.filter(m => m.role === '@designer').length,
      expert: members.filter(m => m.role === '@oracle').length
    };
  }
  function v3TeamMembers(team) {
    const members = (team?.members || []).filter(m => ['@fixer','@designer','@oracle'].includes(m.role));
    const impl = members.filter(m => m.role === '@fixer').slice(0, 2);
    const reviewer = members.filter(m => m.role === '@designer').slice(0, 1);
    const expert = members.filter(m => m.role === '@oracle').slice(0, 1);
    return [...impl, ...reviewer, ...expert].slice(0, 4);
  }
  function v3NormalizeStatus(status) { return ['idle','busy','offline'].includes(status) ? status : 'idle'; }
  function v3ExpertText(team) {
    const hasExpert = (team?.members || []).some(m => m.role === '@oracle');
    return hasExpert ? '已介入' : (team?.expertSupport || '待介入');
  }
  function v3HealthText(team) {
    if (team?.masterStatus === 'offline') return '离线';
    return team?.healthy ? '良好' : '需关注';
  }
  function v3HealthCls(team) {
    if (team?.masterStatus === 'offline') return 'offline';
    return team?.healthy ? 'idle' : 'warning';
  }
  function v3WorkerMode(worker) {
    const role = v3DisplayRole(worker);
    const status = v3NormalizeStatus(worker.status);
    if (role.includes('实现')) return status === 'busy' ? '任务单执行中' : (status === 'offline' ? '待恢复' : '可接任务');
    if (role.includes('交付') || role.includes('审查')) return status === 'busy' ? '审查中' : (status === 'offline' ? '待恢复' : '质量门禁');
    if (role.includes('专家') || role.includes('架构')) return status === 'busy' ? '评审中' : '按待决策';
    return status === 'busy' ? '处理中' : '待任务';
  }
  function v3RemoveUnassignedPool(){
    document.querySelectorAll('#page-overview #unassignedPoolHtml').forEach(el => el.remove());
    document.querySelectorAll('#page-overview .topo-legend .topo-legend-item').forEach(item => {
      const text = (item.textContent || '').trim();
      if (text.includes('待分配')) item.remove();
      else if (text.includes('空闲')) item.innerHTML = '<i class="topo-legend-dot" style="background:#22c55e;"></i>在线';
      else if (text.includes('忙碌')) item.innerHTML = '<i class="topo-legend-dot" style="background:#f97316;"></i>忙碌';
      else if (text.includes('离线')) item.innerHTML = '<i class="topo-legend-dot" style="background:#94a3b8;"></i>离线';
    });
  }

  window.renderTopology = function() {
    const host = document.getElementById('topologyHtml');
    if (!host) return;
    const teams = currentState?.teams || [];
    host.innerHTML = teams.map(t => {
      const project = t.currentProject || {};
      const stage = project.stage || 'build';
      const masterStatus = t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'online-healthy' : 'online-warning');
      const counts = v3RoleCounts(t);
      const workers = v3TeamMembers(t);
      const docPercent = v3DocPercent(project);
      const reviewCount = v3PendingReviews(t);
      const decisionCount = v3PendingDecisions(t);
      const healthCls = v3HealthCls(t);
      const workersHtml = workers.map(m => {
        const sCls = v3NormalizeStatus(m.status);
        const fullTask = m.currentTaskSummary || v3WorkerMode(m);
        return `<div class="topo-worker topo-node ${sCls}" data-action="open-worker" data-worker-name="${v3Esc(m.name)}" data-master="${v3Esc(t.name)}" title="${v3Esc(m.name)} · ${v3Esc(v3DisplayRole(m))} · ${v3Esc(v3StatusLabel(m.status))} · ${v3Esc(fullTask)}">
          <span class="persona-avatar worker ${typeof getPersonaTone === 'function' ? getPersonaTone(m) : ''} ${typeof getPersonaStatusClass === 'function' ? getPersonaStatusClass(m.status) : ''}"><img class="persona-avatar-img" src="${v3Esc(v3WorkerAvatar(m))}" alt="" loading="lazy"><span class="persona-status-dot ${sCls}"></span></span>
          <span class="topo-worker-text"><span class="topo-worker-name">${v3Esc(m.name)}</span><span class="topo-worker-role">${v3Esc(v3DisplayRole(m))}</span><span class="topo-worker-cues"><span class="topo-worker-state">${v3Esc(v3StatusLabel(m.status))}</span><span class="topo-worker-mode">${v3Esc(v3WorkerMode(m))}</span></span></span>
        </div>`;
      }).join('');
      return `<div class="topo-team-card" data-team-id="${v3Esc(t.id)}">
        <div class="topo-team-header">
          <div class="topo-team-titlewrap">
            <span class="topo-team-name">${v3Esc(t.name)}</span>
            <div class="topo-team-projectline"><span class="topo-team-project" title="${v3Esc(project.name || '')}">${v3Esc(project.name || '未绑定项目')}</span><span class="stage-badge stage-${v3Esc(stage)}">${v3Esc(v3StageLabel(stage))}</span></div>
          </div>
          <span class="topo-team-enter" onclick="openTeamTab('${v3Esc(t.id)}')">→ 详情</span>
        </div>
        <div class="topo-master topo-node ${masterStatus}" data-action="open-team" data-team-id="${v3Esc(t.id)}" title="${v3Esc(t.masterCodename)} · 协同规划岗（组长） · ${v3Esc(t.task || '任务协调 / 决策把关')}">
          <span class="persona-avatar ${typeof getPersonaTone === 'function' ? getPersonaTone(t, true) : ''} ${typeof getPersonaStatusClass === 'function' ? getPersonaStatusClass(t.masterStatus === 'offline' ? 'offline' : 'busy') : ''}"><img class="persona-avatar-img" src="${v3Esc(v3LeaderAvatar(t))}" alt="" loading="lazy"><span class="persona-status-dot ${t.masterStatus === 'offline' ? 'offline' : 'idle'}"></span></span>
          <span class="persona-main topo-leader-stack"><span class="topo-master-name">${v3Esc(t.masterCodename)}</span><span class="persona-role-tag">协同规划岗 · 组长</span><span class="topo-leader-cues"><span class="topo-leader-line ${reviewCount + decisionCount > 0 ? 'warning' : ''}">协调与分派 · 审查 ${reviewCount} / 决策 ${decisionCount}</span></span></span>
          <button class="topo-node-action" title="与 ${v3Esc(t.masterCodename)} 对话" onclick="event.stopPropagation(); openChatWith('${v3Esc(t.masterId || t.id)}')"><span>💬</span><span>对话</span></button>
        </div>
        <div class="topo-card-meta">
          <span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 ${counts.impl}</span><span class="role-pill review">交付审查 ${counts.review}</span><span class="role-pill expert">专家：${v3Esc(v3ExpertText(t))}</span>
        </div>
        <div class="topo-workers">${workersHtml}</div>
        <div class="topo-card-summary">
          <span class="topo-summary-item health"><span class="topo-summary-label">健康状态</span><span class="topo-summary-value"><i class="topo-summary-dot ${healthCls === 'warning' ? 'warning' : healthCls}"></i>${v3Esc(v3HealthText(t))}</span></span>
          <span class="topo-summary-item doc"><span class="topo-summary-label">文档完成度</span><span class="topo-summary-value">${docPercent}%</span><span class="topo-doc-progress"><i style="width:${docPercent}%"></i></span></span>
          <span class="topo-summary-item"><span class="topo-summary-label">待审查</span><span class="topo-summary-value">${reviewCount}</span></span>
          <span class="topo-summary-item"><span class="topo-summary-label">待决策</span><span class="topo-summary-value">${decisionCount}</span></span>
        </div>
      </div>`;
    }).join('');
    host.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
    v3RemoveUnassignedPool();
  };

  const prevOnload = window.onload;
  window.onload = function() {
    if (typeof prevOnload === 'function') prevOnload.apply(this, arguments);
    v3RemoveUnassignedPool();
    if (typeof renderTopology === 'function') renderTopology();
  };
  document.addEventListener('DOMContentLoaded', v3RemoveUnassignedPool);
  window.removeOverviewUnassignedPool = v3RemoveUnassignedPool;
})();


;


(function(){
  if (window.__p0aDemoClosureV7Applied) return;
  window.__p0aDemoClosureV7Applied = true;

  const WO_STATUS_LABEL = { draft:'草稿', assigned:'已分派', running:'执行中', submitted:'已提交', reviewing:'审查中', accepted:'已通过', rework_required:'需整改', done:'完成', blocked:'阻塞' };
  const STEP_DELAY = 1900;
  const STEPS = [
    { key:'locate', label:'打开总览并定位团队', active:'AGT-001', op:'打开总览页，先定位研发一组卡片；此时只做观察，不改变真实数据。', nav(t){ if (typeof switchNav === 'function') switchNav('overview'); }, apply(t){ normalizeTeam(t); addActivity(t,'浏览器定位研发一组，准备启动 P0a 闭环演示。'); } },
    { key:'team', label:'进入团队工作台', active:'AGT-001', op:'进入研发一组工作台，确认组长、实现验证岗、交付审查岗的分工。', nav(t){ if (typeof openTeamTab === 'function') openTeamTab(t.id); }, apply(t){ normalizeTeam(t); t.task = 'P0a 演示：协同规划岗发布任务单并进入分派'; updateWO(t,'WO-P0A-001','assigned',15); updateWO(t,'WO-P0A-002','assigned',10); addActivity(t,'协同规划岗 管理1 发布 P0a 工程骨架任务单，并分派给实现验证岗。'); } },
    { key:'running', label:'实现验证执行', active:'AGT-002', op:'实现验证岗开始并行执行，首页统计与团队卡状态同步变化。', apply(t){ setMember(t,'AGT-002','busy','执行前端路由与 Mock 数据整理'); setMember(t,'AGT-003','busy','实现文档发布占位与撤销发布交互'); updateWO(t,'WO-P0A-001','running',45); updateWO(t,'WO-P0A-002','running',38); addActivity(t,'实现验证岗 实现1-1 / 实现1-2 开始并行执行 P0a 工程骨架任务。'); } },
    { key:'submit', label:'提交自测回执', active:'AGT-003', op:'实现验证岗提交自测回执，任务从执行中进入待审查队列。', apply(t){ setMember(t,'AGT-002','idle','已提交自测记录，等待审查'); setMember(t,'AGT-003','idle','已提交文档发布占位实现，等待审查'); updateWO(t,'WO-P0A-001','submitted',72); updateWO(t,'WO-P0A-002','submitted',68); t.pendingReviews = 2; addActivity(t,'实现验证岗完成自测并提交交付审查。'); } },
    { key:'review', label:'交付审查', active:'AGT-004', op:'交付审查岗开始质量门禁检查，发现问题后会退回整改。', apply(t){ setMember(t,'AGT-004','busy','审查任务单验收标准与页面语义一致性'); updateWO(t,'WO-P0A-003','reviewing',45); t.pendingReviews = 2; addActivity(t,'交付审查岗 审查1-1 发现文档发布语义不清，退回实现验证岗补充说明。'); } },
    { key:'rework', label:'生成整改任务', active:'AGT-001', op:'协同规划岗生成整改任务单，把审查问题退回实现验证岗处理。', apply(t){ updateWO(t,'WO-P0A-001','rework_required',78); updateWO(t,'WO-P0A-004','assigned',20); t.pendingReviews = 1; addActivity(t,'协同规划岗根据审查意见生成整改任务单 WO-P0A-004。'); } },
    { key:'fix', label:'整改提交', active:'AGT-002', op:'实现验证岗完成整改并再次提交，等待交付审查岗复审。', apply(t){ setMember(t,'AGT-002','busy','补充文档发布语义说明并同步 Activity 回写'); updateWO(t,'WO-P0A-004','submitted',88); addActivity(t,'实现验证岗完成整改并重新提交交付审查。'); } },
    { key:'pass', label:'复审通过', active:'AGT-004', op:'交付审查岗复审通过，任务单进入初验收通过状态。', apply(t){ setMember(t,'AGT-004','idle','已形成 P0a 初验收记录'); updateWO(t,'WO-P0A-001','accepted',100); updateWO(t,'WO-P0A-002','accepted',100); updateWO(t,'WO-P0A-003','accepted',100); updateWO(t,'WO-P0A-004','accepted',100); t.pendingReviews = 0; addActivity(t,'交付审查岗复审通过，形成 P0a 初验收记录。'); } },
    { key:'decision', label:'进入待决策', active:'AGT-005', op:'打开待决策页，演示需要用户确认的 运行节点 展示边界。', nav(t){ if (typeof switchNav === 'function') switchNav('decisions'); }, apply(t){ setMember(t,'AGT-005','busy','评审 运行节点 / 员工运行绑定 展示边界'); upsertDecision(t,'pending'); t.pendingDecisions = 1; addActivity(t,'系统架构师建议确认 运行节点 仅作为 模拟 / 占位能力展示。'); } },
    { key:'done', label:'返回总览完成闭环', active:'AGT-001', op:'确认决策并返回总览页，P0a 演示闭环完成。', nav(t){ if (typeof switchNav === 'function') switchNav('overview'); }, apply(t){ upsertDecision(t,'resolved'); t.pendingDecisions = 0; t.task = 'P0a 演示完成：任务单、审查、整改、决策、Activity 已闭环'; addActivity(t,'用户确认 运行节点 仅展示为 模拟 / 占位能力，P0a 演示闭环完成。'); } }
  ];

  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function esc(s){ return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function cssEsc(s){ try { return CSS.escape(String(s)); } catch(e) { return String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&'); } }
  function team(){ return (currentState?.teams || []).find(t => t.id === 't1') || (currentState?.teams || [])[0]; }
  function ensureProject(t){ if (!t.currentProject) t.currentProject = { id:'p0a', name:'P0a 工程骨架', stage:'build', health:'healthy', docs:[], workOrders:[], blockers:[] }; t.currentProject.workOrders = t.currentProject.workOrders || []; return t.currentProject; }
  function normalizeTeam(t){
    if (!t) return; const p = ensureProject(t); p.id = p.id || 'p0a'; p.name = 'P0a 工程骨架'; p.stage = 'build'; p.health = 'healthy';
    const base = [
      ['WO-P0A-001','建立前端 Mock 工程骨架','draft','实现1-1',0],
      ['WO-P0A-002','补充 运行节点 展示字段','draft','实现1-2',0],
      ['WO-P0A-003','P0a 工程骨架初验收','draft','审查1-1',0],
      ['WO-P0A-004','整改：补充文档发布语义','draft','实现1-1',0]
    ];
    base.forEach(([id,title,status,owner,pct]) => { let w = p.workOrders.find(x => x.id === id); if (!w) { w = {id,title,status,owner,pct}; p.workOrders.push(w); } });
    t.pendingReviews = Number(t.pendingReviews || 0); t.pendingDecisions = Number(t.pendingDecisions || 0);
  }
  function updateWO(t,id,status,pct){ normalizeTeam(t); const w = ensureProject(t).workOrders.find(x => x.id === id); if (w){ w.status = status; w.pct = pct; w.updatedAt = Date.now(); } }
  function setMember(t,id,status,task){ const m = (t?.members || []).find(x => x.id === id); if (m){ m.status = status; m.currentTaskSummary = task; m.heartbeatTs = Date.now(); } }
  function addActivity(t,desc){ if (!t) return; t.activities = t.activities || []; t.activities.unshift({ time: Date.now(), desc }); t.lastActivity = Date.now(); }
  function upsertDecision(t,status){
    currentState.decisions = currentState.decisions || []; const id = 'd-p0a-demo-runtimehost'; let d = currentState.decisions.find(x => x.id === id);
    if (!d){ d = { id, teamId:t.id, requesterId:'AGT-005', type:'技术路线取舍', title:'运行节点 是否仅作为 P0a 模拟展示', urgent:false, timeTs:Date.now(), expiresAt:Date.now()+3600000, status:'pending', projectId:ensureProject(t).id, sourceRole:'系统架构师 / 技术专家岗', sourceDoc:'系统设计方案 v0.6.32', suggestedOwner:'用户 / 协同规划岗 管理1', escalationPath:'实现验证岗 → 协同规划岗 → 系统架构师 → 用户', fromReview:false, context:'P0a 仅做前端 Mock 演示，运行节点 不能表达为真实调度能力。', options:[{label:'展示为 模拟 / 占位能力',kind:'primary'},{label:'暂不展示，留到后续开发',kind:'normal'}] }; currentState.decisions.unshift(d); }
    d.status = status; d.timeTs = Date.now(); if (status === 'resolved') d.resolvedAt = Date.now();
  }
  function captureBaseline(){ if (!window.__p0aDemoBaselineState && typeof currentState !== 'undefined') window.__p0aDemoBaselineState = clone(currentState); }
  function clearTimers(){ (window.__p0aDemoTimers || []).forEach(clearTimeout); window.__p0aDemoTimers = []; }
  function renderAll(){ ['renderOverview','renderTeamCards','renderProjects','renderDecisions','renderWorkerPool'].forEach(fn => { try { if (typeof window[fn] === 'function') window[fn](); } catch(e){} }); injectButton(); renderRunner(); }
  function activeName(id){ const t = team(); if (!t) return ''; if (t.masterId === id) return t.masterCodename; const m = (t.members || []).find(x => x.id === id); return m ? m.name : ''; }
  function recentActivities(t){ const list = (t?.activities || []).filter(a => /P0a|实现验证岗|交付审查岗|运行节点|浏览器/.test(String(a.desc || ''))).slice(0,5); return list.map(a => `<div class="p0a-activity-item">${esc(a.desc)}</div>`).join('') || '<div class="p0a-wo-sub">演示启动后自动回写关键 Activity。</div>'; }
  function displayWorkOrderId(id){
    const map = {'WO-P0A-001':'任务一','WO-P0A-002':'任务二','WO-P0A-003':'任务三','WO-P0A-004':'任务四'};
    return map[id] || '任务单';
  }
  function displayOwner(owner){
    const text = String(owner || '-');
    if (/实现/.test(text)) return '实现验证岗';
    if (/审查/.test(text)) return '交付审查岗';
    if (/管理|组长|协同/.test(text)) return '协同规划岗';
    return text.replace(/AGT-\d+/g, '数字员工');
  }
  function displayTaskTitle(title){
    return String(title || '')
      .replace(/运行节点\s*\/\s*Worker运行绑定|运行节点|Worker运行绑定/g, '运行节点')
      .replace(/P0a\s*/g, '')
      .replace(/Mock/g, '模拟')
      .replace(/Runtime/g, '运行')
      .replace(/Worker/g, '数字员工')
      .trim() || '任务单';
  }
  function displayOpText(text){
    return String(text || '')
      .replace(/运行节点/g, '运行节点')
      .replace(/P0a/g, '本轮')
      .replace(/Mock/g, '模拟')
      .replace(/WO-P0A-001/g, '任务一')
      .replace(/WO-P0A-002/g, '任务二')
      .replace(/WO-P0A-003/g, '任务三')
      .replace(/WO-P0A-004/g, '任务四')
      .replace(/AGT-\d+/g, '数字员工');
  }
  function workOrders(t){ const list = (ensureProject(t).workOrders || []).filter(w => /^WO-P0A/.test(w.id)).slice(0,4); return list.map(w => `<div class="p0a-wo"><div><div class="p0a-wo-title">${esc(displayTaskTitle(w.title))}</div><div class="p0a-wo-sub">${esc(displayWorkOrderId(w.id))} · ${esc(displayOwner(w.owner || '-'))} · ${Number(w.pct || 0)}%</div></div><span class="p0a-status ${esc(w.status)}">${esc(WO_STATUS_LABEL[w.status] || w.status)}</span></div>`).join(''); }
  function ensureRunner(){
    let mask = document.getElementById('p0aDemoRunnerMask');
    if (!mask){ mask = document.createElement('div'); mask.id = 'p0aDemoRunnerMask'; mask.className = 'p0a-demo-runner-mask'; mask.innerHTML = '<div class="p0a-demo-runner" id="p0aDemoRunner"></div>'; document.body.appendChild(mask); }
    return mask;
  }
  function renderRunner(){
    const state = window.__p0aDemoState || { visible:false, running:false, index:0, label:'待开始', op:'' };
    const mask = ensureRunner(); const box = document.getElementById('p0aDemoRunner'); const t = team();
    mask.classList.toggle('open', !!state.visible); if (!box || !t) return;
    const idx = Math.max(0, Math.min(Number(state.index || 0), STEPS.length)); const percent = Math.round(idx / STEPS.length * 100);
    const pendingDec = (currentState?.decisions || []).filter(d => d.teamId === t.id && d.status === 'pending').length;
    const pendingRev = Number(t.pendingReviews || t.currentProject?.acceptanceQueue?.length || 0);
    const woDone = (t.currentProject?.workOrders || []).filter(w => /^WO-P0A/.test(w.id) && ['accepted','done'].includes(w.status)).length;
    const collapsed = state.collapsed !== false;
    box.className = 'p0a-demo-runner' + (collapsed ? ' is-collapsed' : '');
    const opText = displayOpText(state.op || state.label || '待开始');
    const playIcon = state.running ? 'Ⅱ' : '▶';
    const playTitle = state.running ? '暂停演示' : (state.paused ? '继续演示' : '启动演示');
    const iconClass = state.running ? ' running' : (state.paused ? ' paused' : '');
    box.innerHTML = `<div class="p0a-runner-head"><button class="p0a-runner-icon${iconClass}" type="button" title="${playTitle}" onclick="toggleP0aDemoPlay(event)">${playIcon}</button><div class="p0a-runner-title"><span>P0a 演示</span></div><div class="p0a-runner-current" title="${esc(opText)}">${esc(opText)}</div><div class="p0a-runner-mini">${idx}/${STEPS.length}</div><div class="p0a-runner-actions"><button class="p0a-runner-btn primary" onclick="toggleP0aDemoRunner()">${collapsed ? '展开' : '收起'}</button><button class="p0a-runner-btn" onclick="stepP0aAutoDemo()">单步</button><button class="p0a-runner-btn" onclick="resetP0aAutoDemo()">重置</button><button class="p0a-runner-btn" onclick="closeP0aDemoRunner()">关闭</button></div></div>
      <div class="p0a-runner-body"><div class="p0a-op-card"><div class="p0a-op-current">${esc(opText)}</div><div class="p0a-op-progress"><i style="width:${percent}%"></i></div><div class="p0a-step-grid">${STEPS.map((s,i)=>`<div class="p0a-step ${i < idx ? 'done' : ''} ${i === idx && state.running ? 'active' : ''}" title="${esc(s.label)}"><b>${i+1}</b>${esc(s.label)}</div>`).join('')}</div></div>
      <div class="p0a-kpi-grid"><div class="p0a-kpi"><div class="p0a-kpi-label">待审查</div><div class="p0a-kpi-value">${pendingRev}</div></div><div class="p0a-kpi"><div class="p0a-kpi-label">待决策</div><div class="p0a-kpi-value">${pendingDec}</div></div><div class="p0a-kpi"><div class="p0a-kpi-label">任务完成</div><div class="p0a-kpi-value">${woDone}/4</div></div><div class="p0a-kpi"><div class="p0a-kpi-label">当前对象</div><div class="p0a-kpi-value">${esc(activeName(state.active) || '-')}</div></div></div>
      <div class="p0a-info-grid"><div class="p0a-side-card"><div class="p0a-side-title"><span>任务单</span><span>任务队列</span></div><div class="p0a-wo-list">${workOrders(t)}</div></div><div class="p0a-side-card"><div class="p0a-side-title"><span>活动回写</span><span>最近 5 条</span></div><div class="p0a-activity-list">${recentActivities(t)}</div></div></div></div>`;
    const btn = document.getElementById('p0aAutoDemoBtn');
    if (btn){ btn.classList.toggle('running', !!state.running); btn.innerHTML = state.running ? '⏸ 演示中' : (state.paused ? '▶ 继续演示' : (idx >= STEPS.length ? '↻ 再演示一次' : '▶ 启动 P0a 演示')); }
  }
  function injectButton(){
    document.getElementById('p0aDemoStrip')?.remove();
    const title = document.querySelector('#page-overview .card .card-title');
    if (title && !title.querySelector('#p0aAutoDemoBtn')){
      const wrap = document.createElement('span'); wrap.className = 'p0a-demo-inline-actions'; wrap.innerHTML = '<button id="p0aAutoDemoBtn" class="p0a-demo-inline-btn" type="button" onclick="startP0aAutoDemo()">▶ 启动 P0a 演示</button>'; title.appendChild(wrap);
    }
  }
  function runP0aStepsFrom(startIndex){
    clearTimers();
    const startAt = Math.max(0, Math.min(Number(startIndex || 0), STEPS.length));
    window.__p0aDemoTimers = [];
    STEPS.slice(startAt).forEach((step, offset) => {
      const i = startAt + offset;
      const timer = setTimeout(() => {
        const s = window.__p0aDemoState || {};
        if (s.paused) return;
        const currentTeam = team(); window.__p0aDemoActiveWorkerId = step.active;
        if (step.nav) step.nav(currentTeam); step.apply(currentTeam);
        const prevState = window.__p0aDemoState || {};
        window.__p0aDemoState = { visible:true, running:i < STEPS.length - 1, paused:false, collapsed:prevState.collapsed !== false, index:i + 1, label:step.label, op:step.op, active:step.active };
        renderAll();
        if (i === STEPS.length - 1) setTimeout(() => { window.__p0aDemoActiveWorkerId = null; window.__p0aDemoState.running = false; window.__p0aDemoState.paused = false; renderAll(); }, 650);
      }, offset * STEP_DELAY + (offset === 0 ? 180 : 220));
      window.__p0aDemoTimers.push(timer);
    });
  }
  window.startP0aAutoDemo = function(){
    const cur = window.__p0aDemoState || {};
    if (cur.visible && cur.paused) { window.__p0aDemoState = { ...cur, running:true, paused:false, op:(cur.op || cur.label || '继续演示') }; runP0aStepsFrom(cur.index || 0); renderAll(); return; }
    captureBaseline(); clearTimers(); if (window.__p0aDemoBaselineState) currentState = prototypeStore.replaceState(window.__p0aDemoBaselineState);
    const t = team(); if (!t) return; normalizeTeam(t); window.__p0aDemoActiveWorkerId = null;
    window.__p0aDemoState = { visible:true, running:true, paused:false, collapsed:true, index:0, label:'准备开始', op:'准备启动 P0a 自动演示。' };
    if (typeof switchNav === 'function') switchNav('overview'); renderAll(); runP0aStepsFrom(0);
  };
  window.toggleP0aDemoPlay = function(evt){
    if (evt && evt.stopPropagation) evt.stopPropagation();
    const s = window.__p0aDemoState || {};
    if (!s.visible || (!s.running && !s.paused && Number(s.index || 0) >= STEPS.length)) { window.startP0aAutoDemo(); return; }
    if (s.running) { clearTimers(); window.__p0aDemoState = { ...s, running:false, paused:true, op:'已暂停：' + (s.op || s.label || 'P0a 演示') }; renderAll(); return; }
    if (s.paused) { window.__p0aDemoState = { ...s, running:true, paused:false, op:(s.op || s.label || '继续演示').replace(/^已暂停：/, '') }; renderAll(); runP0aStepsFrom(s.index || 0); return; }
    window.startP0aAutoDemo();
  };
  window.stepP0aAutoDemo = function(){
    captureBaseline();
    clearTimers();
    const cur = window.__p0aDemoState || {};
    if (!cur.visible && window.__p0aDemoBaselineState) currentState = prototypeStore.replaceState(window.__p0aDemoBaselineState);
    const next = Math.max(0, Math.min(Number(cur.index || 0), STEPS.length - 1));
    const currentTeam = team();
    const step = STEPS[next];
    if (!currentTeam || !step) return;
    window.__p0aDemoActiveWorkerId = step.active;
    if (step.nav) step.nav(currentTeam);
    step.apply(currentTeam);
    const prevState = window.__p0aDemoState || {};
    window.__p0aDemoState = { visible:true, running:false, paused:true, collapsed:prevState.collapsed !== false, index:next + 1, label:step.label, op:'单步：' + step.op, active:step.active };
    renderAll();
  };
  window.resetP0aAutoDemo = function(){ captureBaseline(); clearTimers(); window.__p0aDemoActiveWorkerId = null; const prevState = window.__p0aDemoState || {}; window.__p0aDemoState = { visible:true, running:false, paused:false, collapsed:prevState.collapsed !== false, index:0, label:'已重置', op:'已重置：进度回到 0，可以重新启动演示。' }; if (window.__p0aDemoBaselineState) currentState = prototypeStore.replaceState(window.__p0aDemoBaselineState); renderAll(); };
  window.closeP0aDemoRunner = function(){ const s = window.__p0aDemoState || {}; s.visible = false; window.__p0aDemoState = s; renderRunner(); };
  window.toggleP0aDemoRunner = function(){ const s = window.__p0aDemoState || {}; s.visible = true; s.collapsed = !(s.collapsed !== false); window.__p0aDemoState = s; renderRunner(); };

  const prevRenderTopology = window.renderTopology;
  window.renderTopology = function(){
    if (typeof prevRenderTopology === 'function') prevRenderTopology();
    document.querySelectorAll('#page-overview #unassignedPoolHtml').forEach(el => el.remove());
    document.querySelectorAll('#page-overview #topologyHtml .dimmed').forEach(el => el.classList.remove('dimmed'));
    const activeId = window.__p0aDemoActiveWorkerId; const t = team();
    if (activeId && t){
      let selector = '';
      if (t.masterId === activeId) selector = `.topo-master[data-team-id="${cssEsc(t.id)}"]`;
      else { const m = (t.members || []).find(x => x.id === activeId); if (m) selector = `.topo-worker[data-worker-name="${cssEsc(m.name)}"]`; }
      if (selector) document.querySelectorAll(`#page-overview #topologyHtml ${selector}`).forEach(el => el.classList.add('p0a-demo-active'));
    }
  };
  const prevOnload = window.onload;
  window.onload = function(){ if (typeof prevOnload === 'function') prevOnload.apply(this, arguments); captureBaseline(); injectButton(); renderRunner(); };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ captureBaseline(); injectButton(); renderRunner(); document.getElementById('p0aDemoStrip')?.remove(); }, 60); });
})();


;


(function(){
  if (window.__p0aDemoClosureV6Applied) return;
  window.__p0aDemoClosureV6Applied = true;
  function enhanceStatCards(){
    const configs = [
      ['statTeamCount', ['运行态', '5 组编队']],
      ['statMasterCount', ['组长 5', '成员 19']],
      ['statWorkerCount', ['执行/审查', 'Mock 联动']],
      ['statDecisionCount', ['待决策', '待审查']]
    ];
    configs.forEach(([id, chips]) => {
      const value = document.getElementById(id);
      const card = value && value.closest('.stat-card');
      if (!card || card.querySelector('.stat-card-extra')) return;
      const extra = document.createElement('div');
      extra.className = 'stat-card-extra';
      extra.innerHTML = chips.map(t => `<span class="mini-chip">${String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</span>`).join('');
      card.appendChild(extra);
    });
  }
  const prevRenderOverview = window.renderOverview;
  window.renderOverview = function(){
    if (typeof prevRenderOverview === 'function') prevRenderOverview.apply(this, arguments);
    enhanceStatCards();
  };
  const prevOnload = window.onload;
  window.onload = function(){
    if (typeof prevOnload === 'function') prevOnload.apply(this, arguments);
    setTimeout(enhanceStatCards, 80);
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(enhanceStatCards, 80));
})();


;


(function(){
  if (window.__p0aDemoClosureV11Applied) return;
  window.__p0aDemoClosureV11Applied = true;

  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function setText(id, text){ const el = document.getElementById(id); if (el) el.textContent = text; }

  function countWorkOrders(){
    try {
      const statusSet = new Set(['assigned','running','blocked','submitted','reviewing']);
      let total = 0;
      (currentState?.teams || []).forEach(t => (t.currentProject?.workOrders || []).forEach(w => { if (statusSet.has(w.status)) total += 1; }));
      return total;
    } catch(e) { return 0; }
  }
  function countPendingReviews(){
    try { return (currentState?.teams || []).reduce((n,t)=>n + Number(t.pendingReviews || t.currentProject?.acceptanceQueue?.length || 0), 0); }
    catch(e) { return 0; }
  }
  function countPendingDecisions(){
    try { return (currentState?.decisions || []).filter(d => d.status === 'pending').length; }
    catch(e) { return 0; }
  }

  function normalizeStatCards(){
    const configs = [
      ['statTeamCount', ['团队页', '健康状态']],
      ['statMasterCount', ['员工页', '岗位分布']],
      ['statWorkerCount', ['任务流转', '点击查看']],
      ['statDecisionCount', ['待决策', '待审查']]
    ];
    configs.forEach(([id, chips]) => {
      const value = document.getElementById(id);
      const card = value && value.closest('.stat-card');
      if (!card) return;
      let extra = card.querySelector('.stat-card-extra');
      if (!extra) { extra = document.createElement('div'); extra.className = 'stat-card-extra'; card.appendChild(extra); }
      extra.innerHTML = chips.map(t => `<span class="mini-chip">${esc(t)}</span>`).join('');
    });
    setText('statWorkerDesc', '已分派 / 执行 / 审查中');
    setText('statWorkerTrend', '查看任务 →');
    setText('statTeamTrend', '查看团队 →');
    setText('statMasterTrend', '查看员工 →');
    setText('statDecisionTrend', '去处理 →');
    const taskCount = countWorkOrders();
    if (taskCount) setText('statWorkerCount', taskCount);
    const d = countPendingDecisions(), r = countPendingReviews();
    if (d || r) { setText('statDecisionCount', `${d}/${r}`); setText('statDecisionDesc', `${d} 待决策 · ${r} 待审查`); }
  }

  window.jumpToP0aTasks = function(){
    try {
      if (typeof setNavOrigin === 'function') setNavOrigin({ label:'总览 · 任务单流转', target:'P0a 工程骨架' });
      if (typeof openTeamTab === 'function') openTeamTab('t1');
      setTimeout(() => {
        try {
          if (typeof switchTeamTab === 'function') switchTeamTab('t1','workbench');
          if (typeof selectWorkbenchAgent === 'function') selectWorkbenchAgent('t1','leader');
          const page = document.getElementById('page-team-t1');
          const taskArea = page?.querySelector('.work-status-grid, .agent-detail-card, [data-agent-current-doc]') || page;
          taskArea?.scrollIntoView({ block:'start', behavior:'smooth' });
        } catch(e) {}
      }, 80);
    } catch(e) {
      if (typeof switchNav === 'function') switchNav('projects');
    }
  };

  const prevRenderOverview = window.renderOverview;
  window.renderOverview = function(){
    if (typeof prevRenderOverview === 'function') prevRenderOverview.apply(this, arguments);
    normalizeStatCards();
  };
  const prevRefreshAllViews = window.refreshAllViews;
  if (typeof prevRefreshAllViews === 'function') {
    window.refreshAllViews = function(){ const ret = prevRefreshAllViews.apply(this, arguments); normalizeStatCards(); return ret; };
  }
  const prevOnload = window.onload;
  window.onload = function(){ if (typeof prevOnload === 'function') prevOnload.apply(this, arguments); setTimeout(normalizeStatCards, 100); };
  document.addEventListener('DOMContentLoaded', () => setTimeout(normalizeStatCards, 100));
})();


;


(function(){
  if (window.__p0aDemoClosureV12Applied) return;
  window.__p0aDemoClosureV12Applied = true;
  function safeText(id, text){ const el=document.getElementById(id); if(el) el.textContent=text; }
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function p0aTeam(){ return (window.currentState?.teams || []).find(t=>t.id==='t1') || (window.currentState?.teams || [])[0]; }
  function activeTaskCount(){
    const states=new Set(['assigned','running','blocked','submitted','reviewing','rework_required']);
    let n=0; try{ (window.currentState?.teams || []).forEach(t => (t.currentProject?.workOrders || []).forEach(w => { if(states.has(w.status)) n++; })); }catch(e){}
    return n;
  }
  function pendingReviews(){
    try { return (window.currentState?.teams || []).reduce((n,t)=>n + Number(t.pendingReviews || t.currentProject?.acceptanceQueue?.length || 0),0); } catch(e){ return 0; }
  }
  function pendingDecisions(){
    try { return (window.currentState?.decisions || []).filter(d=>d.status==='pending').length; } catch(e){ return 0; }
  }
  function busyWorkers(){
    try { return (window.currentState?.teams || []).flatMap(t=>t.members || []).filter(m=>m.status==='busy').length; } catch(e){ return 0; }
  }
  function setChips(id, chips){
    const value=document.getElementById(id); const card=value && value.closest('.stat-card'); if(!card) return;
    let extra=card.querySelector('.stat-card-extra'); if(!extra){ extra=document.createElement('div'); extra.className='stat-card-extra'; card.appendChild(extra); }
    extra.innerHTML=chips.map(x=>`<span class="mini-chip">${esc(x)}</span>`).join('');
  }
  function refineOverviewStats(){
    const teams=(window.currentState?.teams || []);
    const online=(window.currentState?.workers || []).filter(w=>w.status!=='offline').length || Number(document.getElementById('statMasterCount')?.textContent || 0);
    const busy=busyWorkers();
    const tasks=activeTaskCount();
    const dec=pendingDecisions();
    const rev=pendingReviews();
    safeText('statTeamDesc', `${teams.length || 5} 组编队运行`);
    safeText('statMasterDesc', `${online || 24} 在线 · ${busy} 忙碌`);
    safeText('statWorkerDesc', '分派 · 执行 · 审查');
    safeText('statDecisionDesc', `${dec} 待决策 · ${rev} 待审查`);
    if (tasks) safeText('statWorkerCount', tasks);
    safeText('statTeamTrend', '查看团队 →');
    safeText('statMasterTrend', '查看员工 →');
    safeText('statWorkerTrend', '查看任务 →');
    safeText('statDecisionTrend', '去处理 →');
    const workerTitle=document.querySelector('#statWorkerCount')?.closest('.stat-card')?.querySelector('.stat-card-title');
    if(workerTitle) workerTitle.textContent='⚡ 任务单流转';
    setChips('statTeamCount', ['组长 5','项目 5']);
    setChips('statMasterCount', [`忙碌 ${busy}`, '状态可见']);
    setChips('statWorkerCount', ['可跳转','演示联动']);
    setChips('statDecisionCount', [`待审 ${rev}`, `待决 ${dec}`]);
  }
  window.jumpToP0aTasks = function(){
    try{
      const t=p0aTeam();
      if(t && typeof openTeamTab==='function') openTeamTab(t.id);
      setTimeout(()=>{
        try{
          const page=document.getElementById(`page-team-${t?.id || 't1'}`);
          const tab=page?.querySelector('[data-team-tab="workbench"]'); if(tab) tab.click();
          const target=page?.querySelector('.work-status-grid, .agent-detail-card, .team-tab-bar') || page;
          target?.scrollIntoView({ block:'start', behavior:'smooth' });
        }catch(e){}
      },100);
    }catch(e){ if(typeof switchNav==='function') switchNav('projects'); }
  };
  const prevRenderOverview=window.renderOverview;
  if(typeof prevRenderOverview==='function'){
    window.renderOverview=function(){ const ret=prevRenderOverview.apply(this,arguments); refineOverviewStats(); return ret; };
  }
  const prevRenderAll=window.renderAll;
  if(typeof prevRenderAll==='function'){
    window.renderAll=function(){ const ret=prevRenderAll.apply(this,arguments); refineOverviewStats(); return ret; };
  }
  const oldReset=window.resetP0aAutoDemo;
  window.resetP0aAutoDemo=function(){
    if(typeof oldReset==='function') oldReset();
    const prev=window.__p0aDemoState || {};
    window.__p0aDemoActiveWorkerId=null;
    window.__p0aDemoState={ visible:true, running:false, paused:false, collapsed:prev.collapsed !== false, index:0, label:'已重置', op:'已重置：进度回到 0，可以重新启动演示。' };
    if(typeof renderAll==='function') renderAll();
    else if(typeof renderRunner==='function') renderRunner();
  };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refineOverviewStats,120));
  setTimeout(refineOverviewStats,180);
})();


;


(function(){
  if (window.__p0aDemoClosureV13Applied) return;
  window.__p0aDemoClosureV13Applied = true;
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function setText(id, text){ const el=document.getElementById(id); const v=String(text ?? ''); if(el && el.textContent!==v) el.textContent=v; }
  function teams(){ return window.currentState?.teams || []; }
  function p0aTeam(){ return teams().find(t=>t.id==='t1') || teams()[0]; }
  function workOrders(){ const out=[]; teams().forEach(t => (t.currentProject?.workOrders || []).forEach(w => out.push({...w, team:t}))); return out; }
  function statusLabel(st){ return ({draft:'草稿',assigned:'已分派',running:'执行中',blocked:'阻塞',submitted:'待审查',reviewing:'审查中',accepted:'已通过',rework_required:'需整改',done:'完成'}[st] || '未知'); }
  function zhTaskTitle(title){ return String(title || '任务单')
    .replace(/P0a\s*/g,'')
    .replace(/运行节点/g,'运行节点')
    .replace(/Mock/g,'模拟')
    .replace(/Runtime/g,'运行')
    .replace(/Worker/g,'数字员工')
    .replace(/WO-P0A-\d+/g,'任务单')
    .trim() || '任务单'; }
  function ownerRole(owner){ const t=String(owner||''); if(/审查/.test(t)) return '交付审查岗'; if(/实现/.test(t)) return '实现验证岗'; if(/管理|协同/.test(t)) return '协同规划岗'; return '数字员工'; }
  function activeTask(){
    const priority=['running','submitted','reviewing','rework_required','assigned','blocked','accepted','draft'];
    const list=workOrders().filter(w=>/^WO-P0A/.test(String(w.id||'')));
    return list.sort((a,b)=>priority.indexOf(a.status)-priority.indexOf(b.status))[0] || null;
  }
  function pendingReviews(){ try{return teams().reduce((n,t)=>n+Number(t.pendingReviews || t.currentProject?.acceptanceQueue?.length || 0),0);}catch(e){return 0;} }
  function pendingDecisions(){ try{return (window.currentState?.decisions || []).filter(d=>d.status==='pending').length;}catch(e){return 0;} }
  function busyWorkers(){ try{return teams().flatMap(t=>t.members||[]).filter(m=>m.status==='busy').length;}catch(e){return 0;} }
  function onlineWorkers(){
    try{
      const teamOnline=teams().flatMap(t=>t.members||[]).filter(m=>m.status!=='offline').length;
      const poolOnline=(window.currentState?.workers||[]).filter(w=>w.status!=='offline').length;
      return teamOnline+poolOnline;
    }catch(e){return 0;}
  }
  function setRows(id, rows){
    const value=document.getElementById(id); const card=value && value.closest('.stat-card'); if(!card) return;
    let extra=card.querySelector('.stat-card-extra');
    if(!extra){ extra=document.createElement('div'); extra.className='stat-card-extra'; card.appendChild(extra); }
    extra.innerHTML=rows.slice(0,3).map(r=>`<span class="mini-chip" title="${esc(r)}">${esc(r)}</span>`).join('');
  }
  function refineStats(){
    const task=activeTask(); const rev=pendingReviews(); const dec=pendingDecisions(); const busy=busyWorkers(); const online=onlineWorkers(); const allTeams=teams();
    const taskStatus=task ? statusLabel(task.status) : '暂无任务';
    const taskTitle=task ? zhTaskTitle(task.title) : '暂无执行中任务';
    const taskOwner=task ? ownerRole(task.owner) : '等待分派';
    const taskPct=task ? `${Number(task.pct||0)}%` : '0%';
    const taskCount=workOrders().filter(w=>['assigned','running','blocked','submitted','reviewing','rework_required'].includes(w.status)).length;
    const workerCard=document.getElementById('statWorkerCount')?.closest('.stat-card');
    const workerTitle=workerCard?.querySelector('.stat-card-title'); if(workerTitle) workerTitle.textContent='⚡ 执行中任务';
    setText('statTeamCount', `${allTeams.length || 5}`); setText('statTeamDesc', '编队健康 · 项目覆盖'); setText('statTeamTrend', '查看团队 →');
    setText('statMasterCount', `${online || 24}`); setText('statMasterDesc', `${busy} 忙碌 · 状态可见`); setText('statMasterTrend','查看员工 →');
    setText('statWorkerCount', `${taskCount}`); setText('statWorkerDesc', `${taskStatus} · ${taskOwner}`); setText('statWorkerTrend','查看任务 →');
    setText('statDecisionCount', `${rev + dec}`); setText('statDecisionDesc', `${rev} 待审查 · ${dec} 待决策`); setText('statDecisionTrend','去处理 →');
    setRows('statTeamCount', ['组长统一入口','成员协同','项目闭环']);
    setRows('statMasterCount', [`在线 ${online || 24}` , `忙碌 ${busy}`, '离线降饱和']);
    setRows('statWorkerCount', [taskTitle, `进度 ${taskPct}`, '点击查看任务']);
    setRows('statDecisionCount', [`待审查 ${rev}`, `待决策 ${dec}`, '审查决策分离']);
    if (workerCard) { workerCard.onclick = window.jumpToP0aTasks || function(){ if (typeof switchNav==='function') switchNav('teams'); }; workerCard.title='点击跳转到团队工作台查看任务流转'; }
  }
  function sanitizeVisibleDemo(){
    const map={
      'WO-P0A-001':'任务一','WO-P0A-002':'任务二','WO-P0A-003':'任务三','WO-P0A-004':'任务四',
      'RuntimeHost':'运行节点','WorkerRuntimeBinding':'员工运行绑定','Mock':'模拟'
    };
    const sel=['.p0a-wo-sub','.p0a-wo-title','.p0a-runner-current','.p0a-op-current','.p0a-step','.p0a-activity-item'];
    document.querySelectorAll(sel.join(',')).forEach(el=>{
      let t=el.textContent || '';
      Object.entries(map).forEach(([a,b])=>{ t=t.split(a).join(b); });
      t=t.replace(/AGT-\d+/g,'数字员工');
      if(el.textContent!==t) el.textContent=t;
    });
  }
  const oldReset=window.resetP0aAutoDemo;
  window.resetP0aAutoDemo=function(){
    if (typeof oldReset==='function') oldReset();
    const s=window.__p0aDemoState || {};
    window.__p0aDemoState={...s, visible:true, collapsed:s.collapsed !== false, running:false, paused:false, index:0, label:'已重置', op:'已重置：进度回到 0，可以重新启动演示。'};
    setTimeout(()=>{ refineStats(); sanitizeVisibleDemo(); },80);
  };
  function run(){ refineStats(); sanitizeVisibleDemo(); }
  ['renderOverview','refreshAllViews'].forEach(fn=>{ const old=window[fn]; if(typeof old==='function' && !old.__v13Wrapped){ const wrapped=function(){ const ret=old.apply(this,arguments); setTimeout(run,0); return ret; }; wrapped.__v13Wrapped=true; window[fn]=wrapped; } });
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(run,120); });
  setTimeout(run,180);
})();


;


(function(){
  if (window.__p0aDemoClosureV14Applied) return;
  window.__p0aDemoClosureV14Applied = true;
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function roleName(w){ return (typeof getDisplayRole === 'function') ? getDisplayRole(w) : (w.role || '数字员工'); }
  function roleClass(w){ return (typeof getRoleClass === 'function') ? getRoleClass(w.role) : ''; }
  function statusLabel(st){ return (typeof getStatusLabel === 'function') ? getStatusLabel(st) : ({busy:'忙碌',idle:'在线',offline:'离线'}[st] || st || '未知'); }
  function skillsCount(w){ try { return getSkillsForRole(w.role).length; } catch(e) { return 0; } }
  function teamText(w){
    if (!w.teamId) return '共享池';
    return `${w.teamName || '研发组'} · ${w.teamRole === 'leader' ? '组长' : '成员'}`;
  }
  function contactText(w){ return w.teamRole === 'leader' ? '组长协调入口' : (w.teamId ? '团队任务协作' : '待分配'); }
  window.getLargeWorkerAvatarSrc = function(w){
    if (!w) return 'pic/avatars/avatar-default-large.png';
    if (w.teamRole === 'leader' || w.role === '@explorer') return 'pic/avatars/avatar-leader-planner-large.png';
    if (w.role === '@oracle') return 'pic/avatars/avatar-architect-01-large.png';
    if (w.role === '@designer') return 'pic/avatars/avatar-reviewer-01-large.png';
    if (w.role === '@fixer') {
      const n = String(w.id || w.name || '').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
      return n % 2 ? 'pic/avatars/avatar-implementer-01-large.png' : 'pic/avatars/avatar-implementer-02-large.png';
    }
    return 'pic/avatars/avatar-default-large.png';
  };
  window.renderWorkerPool = function(){
    const container = document.getElementById('workerPoolContainer');
    if (!container || typeof allWorkersV632 !== 'function') return;
    const keyword = (document.getElementById('searchWorkerInput')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('roleFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    let filtered = allWorkersV632().filter(w => {
      const text = `${w.name} ${w.id} ${roleName(w)} ${w.currentTaskSummary || ''}`.toLowerCase();
      return text.includes(keyword) && (roleFilter === 'all' || w.role === roleFilter) && (statusFilter === 'all' || w.status === statusFilter);
    });
    const groupBy = document.querySelector('[data-group-tab].active')?.dataset.groupTab || 'team';
    const renderCard = w => {
      const statusDot = ['idle','busy','offline'].includes(w.status) ? w.status : (w.status === 'unclaimed' ? 'unclaimed' : 'idle');
      const leader = w.teamRole === 'leader';
      const contactBtn = leader
        ? `<button class="icon-btn" title="组长协调入口" onclick="event.stopPropagation(); openChatWith('${esc(w.id)}')">💬</button>`
        : `<button class="icon-btn" title="团队任务协作" onclick="event.stopPropagation(); openWorkerChat('${esc(w.id)}')">↪</button>`;
      const focus = w.currentTaskSummary || (leader ? '任务协调 / 决策把关 / 里程碑跟踪' : '任务单执行 / 自测回执 / 状态同步');
      return `<div class="worker-card worker-card-v14 clickable ${w.status === 'offline' ? 'offline' : ''}" onclick="openDrawer('${esc(w.id)}')">
        <div class="worker-avatar-panel">
          <span class="worker-card-avatar worker-card-avatar-large"><img src="${window.getLargeWorkerAvatarSrc(w)}" alt="" loading="lazy"><span class="persona-status-dot ${statusDot}"></span></span>
          <span class="worker-status-pill">${esc(statusLabel(w.status))}</span>
        </div>
        <div class="worker-info-panel">
          <div class="worker-title-line"><span class="worker-card-name">${esc(w.name)}</span><span class="role-badge ${roleClass(w)}">${leader ? '组长' : '成员'}</span></div>
          <div class="worker-card-meta">${esc(w.id)}</div>
          <div class="worker-role-line">${esc(roleName(w))}${leader ? ' · 团队协调入口' : ''}</div>
          <div class="worker-focus-line" title="${esc(focus)}">${esc(focus)}</div>
          <div class="worker-meta-strip">
            <div class="worker-meta-chip" title="${esc(teamText(w))}">所属 <strong>${esc(teamText(w))}</strong></div>
            <div class="worker-meta-chip">技能 <strong>${skillsCount(w)}</strong></div>
            <div class="worker-meta-chip" title="${esc(contactText(w))}">联系 <strong>${esc(contactText(w))}</strong></div>
          </div>
        </div>
        <div class="card-actions worker-card-actions" onclick="event.stopPropagation();">${contactBtn}<button class="icon-btn" title="监控" onclick="event.stopPropagation(); openWorkerMonitor('${esc(w.id)}')">▣</button></div>
      </div>`;
    };
    const renderGroup = (key,title,workers,icon) => workers.length ? `<div class="role-group" id="role-group-${esc(key)}"><div class="role-group-header" onclick="toggleRoleGroup('${esc(key)}')"><div style="display:flex;align-items:center;gap:10px;"><span style="font-weight:600;display:flex;align-items:center;gap:6px;">${icon || ''}${esc(title)}</span><span class="badge" style="margin:0;background:var(--info);font-size:12px;padding:2px 8px;font-weight:normal;">${workers.length} 个实例</span></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div><div class="role-group-content">${workers.map(renderCard).join('')}</div></div>` : '';
    let out = '';
    if (groupBy === 'team') {
      (window.currentState?.teams || []).forEach(t => out += renderGroup('team-'+t.id, t.name, filtered.filter(w=>w.teamId===t.id), '<span style="color:var(--info)">◆</span>'));
      out += renderGroup('team-none','共享专家池 / 未分配', filtered.filter(w=>!w.teamId), '<span style="color:var(--warning)">⊘</span>');
    } else {
      out += renderGroup('role-planner','协同规划岗（组长）', filtered.filter(w=>w.role==='@explorer'), '🧭');
      out += renderGroup('role-impl','实现验证岗', filtered.filter(w=>w.role==='@fixer'), '🛠️');
      out += renderGroup('role-review','交付审查岗', filtered.filter(w=>w.role==='@designer'), '✅');
      out += renderGroup('role-expert','系统架构师 / 技术专家岗', filtered.filter(w=>w.role==='@oracle'), '🧠');
    }
    container.innerHTML = out || `<div class="empty-state">没有找到符合条件的数字员工</div>`;
  };
  const refresh = function(){ try { if (typeof window.renderWorkerPool === 'function') window.renderWorkerPool(); } catch(e){} };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,120));
  const oldSwitchNav = window.switchNav;
  if (typeof oldSwitchNav === 'function' && !oldSwitchNav.__v14Wrapped) {
    const wrapped = function(){ const ret = oldSwitchNav.apply(this, arguments); setTimeout(refresh, 80); return ret; };
    wrapped.__v14Wrapped = true;
    window.switchNav = wrapped;
  }
})();


;


(function(){
  if (window.__p0aDemoClosureV15Applied) return;
  window.__p0aDemoClosureV15Applied = true;
  window.setUiTheme = function(theme){
    const v = theme === 'cyberpunk' ? 'cyberpunk' : 'light';
    document.body.setAttribute('data-ui-theme', v);
    try { safeStorage.setItem('agentTeamUiTheme', v); } catch(e) {}
    const sel = document.getElementById('uiThemeSelect'); if (sel) sel.value = v;
  };
  document.addEventListener('DOMContentLoaded', function(){
    let v = 'light'; try { v = safeStorage.getItem('agentTeamUiTheme') || 'light'; } catch(e) {}
    window.setUiTheme(v);
  });
})();


;


(function(){
  if (window.__p0aDemoClosureV16Applied) return;
  window.__p0aDemoClosureV16Applied = true;
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function getWorkersSafe(){
    try { if (typeof window.getAllWorkers === 'function') return window.getAllWorkers() || []; } catch(e) {}
    try { if (typeof getAllWorkers === 'function') return getAllWorkers() || []; } catch(e) {}
    const st = window.currentState || (typeof currentState !== 'undefined' ? currentState : null) || {teams:[], workers:[]};
    const out = [];
    (st.teams || []).forEach(t => {
      out.push({id:t.masterId, name:t.masterCodename, role:'@explorer', projectRole:'协同规划岗（组长）', status:t.masterStatus === 'offline' ? 'offline' : 'busy', teamId:t.id, teamName:t.name, teamRole:'leader', isLeader:true, currentTaskSummary:t.task});
      (t.members || []).forEach(m => out.push(Object.assign({}, m, {teamId:t.id, teamName:t.name, teamRole:'member'})));
    });
    (st.workers || []).forEach(w => out.push(Object.assign({}, w, {teamRole:w.teamRole || 'pool'})));
    return out;
  }
  function roleName(w){ try { return (typeof getDisplayRole === 'function') ? getDisplayRole(w) : (w.projectRole || w.role || '数字员工'); } catch(e){ return w.projectRole || w.role || '数字员工'; } }
  function roleClass(w){ try { return (typeof getRoleClass === 'function') ? getRoleClass(w.role) : ''; } catch(e){ return ''; } }
  function statusLabel(st){ try { return (typeof getStatusLabel === 'function') ? getStatusLabel(st) : ({busy:'忙碌',idle:'在线',offline:'离线',unclaimed:'待分配'}[st] || st || '未知'); } catch(e){ return ({busy:'忙碌',idle:'在线',offline:'离线',unclaimed:'待分配'}[st] || st || '未知'); } }
  function skillsCount(w){ try { return getSkillsForRole(w.role).length; } catch(e) { return 0; } }
  function largeAvatar(w){
    if (typeof window.getLargeWorkerAvatarSrc === 'function') return window.getLargeWorkerAvatarSrc(w);
    if (typeof window.getWorkerAvatarSrc === 'function') return window.getWorkerAvatarSrc(w);
    return 'pic/avatars/avatar-default.png';
  }
  function teamText(w){ if (!w.teamId) return '共享池'; return `${w.teamName || '研发组'} · ${w.teamRole === 'leader' ? '组长' : '成员'}`; }
  function contactText(w){ return w.teamRole === 'leader' ? '组长协调入口' : (w.teamId ? '团队任务协作' : '待分配'); }
  function updateStats(list){
    const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
    set('statTotal', list.length);
    set('statOnline', list.filter(w=>w.status!=='offline').length);
    set('statBusy', list.filter(w=>w.status==='busy').length);
    set('statSkills', Array.from(new Set(list.flatMap(w=>{ try { return getSkillsForRole(w.role).map(s=>s.id || s.name); } catch(e){ return []; } }))).length);
  }
  function card(w){
    const statusDot = ['idle','busy','offline'].includes(w.status) ? w.status : (w.status === 'unclaimed' ? 'unclaimed' : 'idle');
    const leader = w.teamRole === 'leader';
    const contactBtn = leader
      ? `<button class="icon-btn" title="组长协调入口" onclick="event.stopPropagation(); openChatWith('${esc(w.id)}')">💬</button>`
      : `<button class="icon-btn" title="团队任务协作" onclick="event.stopPropagation(); openWorkerChat('${esc(w.id)}')">↪</button>`;
    const focus = w.currentTaskSummary || (leader ? '任务协调 / 决策把关 / 里程碑跟踪' : '任务单执行 / 自测回执 / 状态同步');
    return `<div class="worker-card worker-card-v14 clickable ${w.status === 'offline' ? 'offline' : ''}" onclick="openDrawer('${esc(w.id)}')">
      <div class="worker-avatar-panel">
        <span class="worker-card-avatar worker-card-avatar-large"><img src="${esc(largeAvatar(w))}" alt="" loading="lazy"><span class="persona-status-dot ${statusDot}"></span></span>
        <span class="worker-status-pill">${esc(statusLabel(w.status))}</span>
      </div>
      <div class="worker-info-panel">
        <div class="worker-title-line"><span class="worker-card-name">${esc(w.name)}</span><span class="role-badge ${roleClass(w)}">${leader ? '组长' : '成员'}</span></div>
        <div class="worker-role-line">${esc(roleName(w)).replace('（组长）','')}${leader ? ' · 协调入口' : ''}</div>
        <div class="worker-focus-line" title="${esc(focus)}">${esc(focus)}</div>
        <div class="worker-meta-strip">
          <div class="worker-meta-chip" title="${esc(teamText(w))}">所属 <strong>${esc(teamText(w))}</strong></div>
          <div class="worker-meta-chip">技能 <strong>${skillsCount(w)}</strong></div>
          <div class="worker-meta-chip" title="${esc(contactText(w))}">联系 <strong>${esc(contactText(w))}</strong></div>
        </div>
      </div>
      <div class="card-actions worker-card-actions" onclick="event.stopPropagation();">${contactBtn}<button class="icon-btn" title="监控" onclick="event.stopPropagation(); openWorkerMonitor('${esc(w.id)}')">▣</button></div>
    </div>`;
  }
  function group(key,title,workers,icon){
    if (!workers.length) return '';
    return `<div class="role-group" id="role-group-${esc(key)}"><div class="role-group-header" onclick="toggleRoleGroup('${esc(key)}')"><div style="display:flex;align-items:center;gap:10px;"><span style="font-weight:600;display:flex;align-items:center;gap:6px;">${icon||''}${esc(title)}</span><span class="badge" style="margin:0;background:var(--info);font-size:12px;padding:2px 8px;font-weight:normal;">${workers.length} 个实例</span></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div><div class="role-group-content">${workers.map(card).join('')}</div></div>`;
  }
  window.renderWorkerPool = function(){
    const container = document.getElementById('workerPoolContainer');
    if (!container) return;
    let all = getWorkersSafe();
    updateStats(all);
    const keyword = (document.getElementById('searchWorkerInput')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('roleFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const filtered = all.filter(w => {
      const text = `${w.name||''} ${w.id||''} ${roleName(w)} ${statusLabel(w.status)} ${w.currentTaskSummary||''} ${w.teamName||''}`.toLowerCase();
      return text.includes(keyword) && (roleFilter === 'all' || w.role === roleFilter) && (statusFilter === 'all' || w.status === statusFilter);
    });
    const groupBy = document.querySelector('[data-group-tab].active')?.dataset.groupTab || 'team';
    let out='';
    if (groupBy === 'status') {
      out += group('status-busy','忙碌 / 执行中', filtered.filter(w=>w.status==='busy'), '🟣');
      out += group('status-idle','在线 / 空闲', filtered.filter(w=>w.status==='idle' || w.status==='online'), '🟢');
      out += group('status-unclaimed','待分配', filtered.filter(w=>w.status==='unclaimed'), '🟡');
      out += group('status-offline','离线', filtered.filter(w=>w.status==='offline'), '⚫');
    } else {
      const state = window.currentState || (typeof currentState !== 'undefined' ? currentState : null) || {teams:[]};
      (state.teams || []).forEach(t => out += group('team-'+t.id, t.name, filtered.filter(w=>w.teamId===t.id), '<span style="color:var(--info)">◆</span>'));
      out += group('team-none','共享专家池 / 未分配', filtered.filter(w=>!w.teamId), '<span style="color:var(--warning)">⊘</span>');
    }
    container.innerHTML = out || `<div class="empty-state">没有找到符合条件的数字员工</div>`;
  };
  window.filterWorkers = function(){ window.renderWorkerPool(); };
  const oldSwitchWorkerGroupTab = window.switchWorkerGroupTab;
  window.switchWorkerGroupTab = function(tab){
    document.querySelectorAll('[data-group-tab]').forEach(el=>el.classList.toggle('active', el.dataset.groupTab === tab));
    setTimeout(()=>window.renderWorkerPool(), 0);
    if (oldSwitchWorkerGroupTab && oldSwitchWorkerGroupTab.__keepOriginal) return oldSwitchWorkerGroupTab.apply(this, arguments);
  };
  const oldSwitchNav = window.switchNav;
  if (typeof oldSwitchNav === 'function' && !oldSwitchNav.__v16Wrapped) {
    const wrapped = function(){ const ret = oldSwitchNav.apply(this, arguments); if (arguments[0] === 'pool') setTimeout(()=>window.renderWorkerPool(), 80); return ret; };
    wrapped.__v16Wrapped = true;
    window.switchNav = wrapped;
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{ try { if (document.getElementById('page-pool')?.classList.contains('active')) window.renderWorkerPool(); } catch(e){} },160));
})();


;


(function(){
  if (window.__p0aDemoClosureV17Applied) return;
  window.__p0aDemoClosureV17Applied = true;

  function stopP0aDemoTimers(){
    try {
      (window.__p0aDemoTimers || []).forEach(function(timerId){ clearTimeout(timerId); });
      window.__p0aDemoTimers = [];
    } catch (e) {}
  }

  window.closeP0aDemoRunner = function(){
    stopP0aDemoTimers();
    window.__p0aDemoActiveWorkerId = null;
    const previous = window.__p0aDemoState || {};
    window.__p0aDemoState = {
      ...previous,
      visible: false,
      running: false,
      paused: false,
      index: Number(previous.index || 0),
      label: previous.label || '已关闭',
      op: previous.op || '演示已关闭'
    };
    try { if (typeof renderRunner === 'function') renderRunner(); } catch (e) {}
    try { if (typeof renderOverview === 'function') renderOverview(); } catch (e) {}
    try {
      const btn = document.getElementById('p0aAutoDemoBtn');
      if (btn) {
        btn.classList.remove('running');
        btn.innerHTML = '▶ 启动 P0a 演示';
      }
    } catch (e) {}
  };
})();


;


(function(){
  if (window.__p0aDemoClosureV18Applied) return;
  window.__p0aDemoClosureV18Applied = true;

  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function state(){ return (typeof currentState !== 'undefined' ? currentState : (window.currentState || {})); }
  function findTeam(teamId){ return (state().teams || []).find(t => t.id === teamId) || null; }
  function stageText(card, team){
    const domStage = card?.querySelector('.stage-badge')?.textContent?.trim();
    if (domStage) return domStage;
    const raw = team?.currentProject?.stage || team?.stage || '';
    const map = {design:'设计', develop:'开发', development:'开发', test:'测试', delivery:'交付', planning:'规划', modeling:'建模'};
    return map[raw] || raw || '进行中';
  }
  function zhText(t){
    return String(t || '')
      .replace(/P0a\s*/g,'')
      .replace(/P0b\s*/g,'')
      .replace(/P1\s*/g,'')
      .replace(/Mock/g,'模拟')
      .replace(/RuntimeHost/g,'运行节点')
      .replace(/WorkerRuntimeBinding/g,'员工运行绑定')
      .replace(/agent-web-kit/gi,'事件订阅')
      .replace(/小云对话集成/g,'对话集成')
      .replace(/^[:：\s-]+|[:：\s-]+$/g,'')
      .trim();
  }
  function activeWorkOrder(team){
    const list = team?.currentProject?.workOrders || [];
    const order = ['running','submitted','reviewing','rework_required','assigned','blocked','accepted','done','draft'];
    return [...list].sort((a,b)=>order.indexOf(a.status)-order.indexOf(b.status))[0] || null;
  }
  function currentTaskText(team, card){
    const wo = activeWorkOrder(team);
    let text = zhText(wo?.title || team?.task || card?.querySelector('.topo-team-project')?.textContent || '任务待分派');
    if (!text) text = '任务待分派';
    if (text.length > 16) text = text.slice(0, 16) + '…';
    return text;
  }
  function pendingReviewCount(team){
    try { return Number(team?.pendingReviews || team?.currentProject?.acceptanceQueue?.length || 0); } catch(e){ return 0; }
  }
  function pendingDecisionCount(team){
    try {
      const decisions = state().decisions || [];
      return decisions.filter(d => d.status === 'pending' && (!d.teamId || d.teamId === team?.id)).length;
    } catch(e){ return 0; }
  }
  function buildMeta(team, card){
    const stage = stageText(card, team);
    const task = currentTaskText(team, card);
    const rev = pendingReviewCount(team);
    const dec = pendingDecisionCount(team);
    const attention = rev || dec ? `审查 ${rev} · 决策 ${dec}` : '当前无待处理';
    return `
      <div class="topo-meta-kpi">
        <span class="topo-meta-kpi-label">当前阶段</span>
        <span class="topo-meta-kpi-value">${esc(stage)}</span>
      </div>
      <div class="topo-meta-kpi">
        <span class="topo-meta-kpi-label">当前任务</span>
        <span class="topo-meta-kpi-value" title="${esc(task)}">${esc(task)}</span>
      </div>
      <div class="topo-meta-kpi ${rev || dec ? 'is-attention' : ''}">
        <span class="topo-meta-kpi-label">待处理重点</span>
        <span class="topo-meta-kpi-value">${esc(attention)}</span>
      </div>`;
  }
  function enhanceOverviewMeta(){
    document.querySelectorAll('.topo-team-card').forEach(card => {
      const meta = card.querySelector('.topo-card-meta');
      if (!meta) return;
      const team = findTeam(card.getAttribute('data-team-id'));
      meta.innerHTML = buildMeta(team, card);
    });
  }
  function fixRunnerHead(){
    const runner = document.querySelector('.p0a-demo-runner');
    if (!runner) return;
    const current = runner.querySelector('.p0a-runner-current');
    if (current && !runner.classList.contains('is-collapsed')) current.style.display = 'none';
    if (current && runner.classList.contains('is-collapsed')) current.style.display = '';
  }
  const wrap = (name, after) => {
    const old = window[name];
    if (typeof old === 'function' && !old.__v18Wrapped) {
      const fn = function(){ const ret = old.apply(this, arguments); setTimeout(after, 0); return ret; };
      fn.__v18Wrapped = true;
      window[name] = fn;
    }
  };
  wrap('renderOverview', function(){ enhanceOverviewMeta(); fixRunnerHead(); });
  wrap('renderTopology', enhanceOverviewMeta);
  wrap('renderRunner', fixRunnerHead);
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ enhanceOverviewMeta(); fixRunnerHead(); }, 150); });
  setTimeout(function(){ enhanceOverviewMeta(); fixRunnerHead(); }, 260);
})();


;


(function(){
  if (window.__p0aDemoClosureV19Applied) return;
  window.__p0aDemoClosureV19Applied = true;

  function clearDemoTimers(){
    try { (window.__p0aDemoTimers || []).forEach(function(id){ clearTimeout(id); clearInterval(id); }); } catch(e) {}
    window.__p0aDemoTimers = [];
  }
  function hideDemoDom(){
    try {
      var mask = document.getElementById('p0aDemoRunnerMask') || document.querySelector('.p0a-demo-runner-mask');
      if (mask) {
        mask.classList.remove('open');
        mask.style.display = 'none';
        mask.setAttribute('aria-hidden', 'true');
      }
      var runner = document.getElementById('p0aDemoRunner') || document.querySelector('.p0a-demo-runner');
      if (runner) runner.innerHTML = '';
    } catch(e) {}
  }
  function resetLaunchButton(){
    try {
      var btn = document.getElementById('p0aAutoDemoBtn');
      if (btn) {
        btn.classList.remove('running');
        btn.textContent = '▶ 启动 P0a 演示';
      }
    } catch(e) {}
  }

  window.closeP0aDemoRunner = function(ev){
    try { if (ev && ev.stopPropagation) ev.stopPropagation(); } catch(e) {}
    clearDemoTimers();
    window.__p0aDemoActiveWorkerId = null;
    var prev = window.__p0aDemoState || {};
    window.__p0aDemoState = Object.assign({}, prev, {
      visible: false,
      running: false,
      paused: false,
      index: 0,
      label: '已关闭',
      op: '演示已终止'
    });
    hideDemoDom();
    resetLaunchButton();
    try { if (typeof window.renderOverview === 'function') window.renderOverview(); } catch(e) {}
    try { if (typeof window.refreshAllViews === 'function') window.refreshAllViews(); } catch(e) {}
    return false;
  };

  document.addEventListener('click', function(e){
    var target = e.target && e.target.closest && e.target.closest('.p0a-runner-btn');
    if (target && target.textContent && target.textContent.trim() === '关闭') {
      e.preventDefault();
      window.closeP0aDemoRunner(e);
    }
  }, true);
})();


;


(function(){
  if (window.__p0aDemoClosureV20Applied) return;
  window.__p0aDemoClosureV20Applied = true;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function appState(){ return window.currentState || {}; }
  function teams(){ return appState().teams || []; }
  function teamById(id){ return teams().find(function(t){ return t.id === id; }) || null; }
  function teamIndex(team){ return Math.max(0, teams().findIndex(function(t){ return t.id === team.id; })); }
  function fmtK(n){ return n >= 1000 ? (Math.round(n/100)/10) + 'K' : String(n); }
  function teamMetrics(team){
    var i = team ? teamIndex(team) : 0;
    var active = (team && team.currentProject && team.currentProject.workOrders || []).filter(function(w){ return ['assigned','running','blocked','submitted','reviewing','rework_required'].indexOf(w.status) >= 0; }).length;
    return {
      tokens: 42000 - i * 5200 + active * 1800,
      sessions: 12 - Math.min(i, 4) + active,
      rounds: 58 - i * 7 + active * 3,
      avg: 3100 + i * 260
    };
  }
  function totalMetrics(){
    return teams().reduce(function(a,t){
      var m = teamMetrics(t);
      a.tokens += m.tokens; a.sessions += m.sessions; a.rounds += m.rounds;
      return a;
    }, {tokens:0, sessions:0, rounds:0});
  }
  function stageText(team, card){
    var domStage = card && card.querySelector('.stage-badge') && card.querySelector('.stage-badge').textContent.trim();
    if (domStage) return domStage;
    var map = {design:'设计', build:'开发', develop:'开发', development:'开发', test:'测试', release:'交付', planning:'规划'};
    var raw = team && team.currentProject && team.currentProject.stage;
    return map[raw] || raw || '推进中';
  }
  function pendingReviews(team){
    try { return Number(team.pendingReviews || (team.currentProject && team.currentProject.acceptanceQueue && team.currentProject.acceptanceQueue.length) || 0); } catch(e){ return 0; }
  }
  function pendingDecisions(team){
    try { return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && (!d.teamId || d.teamId === team.id); }).length; } catch(e){ return 0; }
  }
  function openBlockers(team){
    try { return (team.blockers || (team.currentProject && team.currentProject.blockers) || []).filter(function(b){ return !b.status || ['open','leader_reviewing','converted_to_decision'].indexOf(b.status) >= 0; }).length; } catch(e){ return 0; }
  }
  function activeWorkOrder(team){
    var list = (team && team.currentProject && team.currentProject.workOrders) || [];
    var order = ['running','submitted','reviewing','rework_required','assigned','blocked','accepted','done','draft'];
    return list.slice().sort(function(a,b){ return order.indexOf(a.status) - order.indexOf(b.status); })[0] || null;
  }
  function statusLabel(s){ return ({draft:'草稿',assigned:'已分派',running:'执行中',blocked:'阻塞',submitted:'待审查',reviewing:'审查中',accepted:'已通过',rework_required:'需整改',done:'完成'}[s] || s || '推进中'); }
  function cleanTitle(s){
    return String(s || '任务单')
      .replace(/P0a\s*/g,'').replace(/P0b\s*/g,'').replace(/P1\s*/g,'')
      .replace(/Mock/g,'模拟').replace(/RuntimeHost/g,'运行节点').replace(/WorkerRuntimeBinding/g,'员工运行绑定')
      .replace(/agent-web-kit/ig,'事件订阅').replace(/^[:：\s-]+|[:：\s-]+$/g,'').trim() || '任务单';
  }
  function busyMinutesFor(name){
    var s = String(name || '');
    var n = 0;
    for (var i=0;i<s.length;i++) n = (n * 31 + s.charCodeAt(i)) % 97;
    return 7 + (n % 58);
  }
  function longestBusy(team){
    var list = (team && team.members || []).filter(function(m){ return m.status === 'busy'; });
    if (!list.length) return 0;
    return Math.max.apply(null, list.map(function(m){ return busyMinutesFor(m.name || m.id); }));
  }
  function nextAction(team, hasNeed){
    if (hasNeed) {
      if (pendingDecisions(team)) return '组长确认决策项';
      if (pendingReviews(team)) return '交付审查复核';
      if (openBlockers(team)) return '处理阻塞升级';
      return '处理介入事项';
    }
    var wo = activeWorkOrder(team);
    if (!wo) return '等待组长分派任务';
    if (wo.status === 'running') return '实现验证岗提交自测';
    if (wo.status === 'submitted') return '交付审查岗复核';
    if (wo.status === 'reviewing') return '输出审查结论';
    if (wo.status === 'rework_required') return '生成整改任务单';
    if (wo.status === 'assigned') return '启动任务执行';
    return '推进下一任务单';
  }
  function makeSummary(team, card){
    var rev = pendingReviews(team), dec = pendingDecisions(team), blk = openBlockers(team);
    var hasNeed = !!(dec || blk || (rev && rev > 0));
    var wo = activeWorkOrder(team);
    var busy = longestBusy(team);
    var title, sub, icon, link, mode;
    if (hasNeed) {
      var pieces = [];
      if (dec) pieces.push('待决策 ' + dec);
      if (rev) pieces.push('待审查 ' + rev);
      if (blk) pieces.push('阻塞 ' + blk);
      title = '待决策 · ' + pieces.join(' · ');
      sub = '建议动作：' + nextAction(team, true);
      icon = '!';
      link = '处理';
      mode = 'need';
    } else {
      var task = cleanTitle((wo && wo.title) || (team && team.task) || (team && team.currentProject && team.currentProject.name));
      title = '进行中 · ' + task;
      sub = (wo ? statusLabel(wo.status) : stageText(team, card)) + (busy ? ' · 最长忙碌 ' + busy + 'm' : ' · 等待分派');
      icon = '▶';
      link = '任务流';
      mode = 'flow';
    }
    return '<div class="team-run-summary ' + (hasNeed ? 'need-action' : 'in-progress') + '" onclick="event.stopPropagation(); window.openTeamRunDrawer && window.openTeamRunDrawer(\'' + esc(team.id) + '\', \'' + mode + '\')" title="' + esc(title + ' / ' + sub) + '">' +
      '<span class="team-run-icon">' + esc(icon) + '</span>' +
      '<span class="team-run-main"><span class="team-run-title">' + esc(title) + '</span><span class="team-run-sub">' + esc(sub) + '</span></span>' +
      '<span class="team-run-link">' + esc(link) + ' →</span>' +
      '</div>';
  }
  function enhanceTeamCards(){
    document.querySelectorAll('#page-overview #topologyHtml .topo-team-card').forEach(function(card){
      var team = teamById(card.getAttribute('data-team-id'));
      var meta = card.querySelector('.topo-card-meta');
      if (!team || !meta) return;
      meta.innerHTML = makeSummary(team, card);
      var metrics = teamMetrics(team);
      card.setAttribute('title', (card.getAttribute('title') || '') + ' 今日Token ' + fmtK(metrics.tokens) + ' · 会话 ' + metrics.sessions);
    });
  }
  function enhanceBusyDurations(){
    document.querySelectorAll('#page-overview #topologyHtml .topo-worker.busy').forEach(function(node){
      var nameEl = node.querySelector('.topo-worker-name');
      var modeEl = node.querySelector('.topo-worker-mode') || node.querySelector('.topo-worker-role');
      if (!nameEl || !modeEl) return;
      var mins = busyMinutesFor(nameEl.textContent);
      var long = mins >= 45;
      var text = '忙碌 ' + mins + 'm · ' + (long ? '需组长关注' : '任务单执行中');
      modeEl.innerHTML = '<span class="busy-duration-chip ' + (long ? 'long' : '') + '">' + esc(text) + '</span>';
      node.setAttribute('title', (node.getAttribute('title') || '') + ' · ' + text);
    });
  }
  function ensureDrawer(){
    var shell = document.getElementById('opsDrawerShell');
    if (!shell) {
      shell = document.createElement('div');
      shell.id = 'opsDrawerShell';
      shell.className = 'ops-drawer-shell';
      shell.innerHTML = '<div class="ops-drawer"><div class="ops-drawer-head"><div><div class="ops-drawer-title" id="opsDrawerTitle">运行详情</div><div class="ops-drawer-sub" id="opsDrawerSub">团队运行摘要</div></div><button class="ops-drawer-close" onclick="window.closeOpsDrawer && window.closeOpsDrawer()">×</button></div><div class="ops-drawer-body" id="opsDrawerBody"></div></div>';
      document.body.appendChild(shell);
    }
    return shell;
  }
  window.closeOpsDrawer = function(){
    var shell = document.getElementById('opsDrawerShell');
    if (shell) shell.classList.remove('open');
  };
  function drawerOpen(title, sub, body){
    var shell = ensureDrawer();
    var titleEl = document.getElementById('opsDrawerTitle');
    var subEl = document.getElementById('opsDrawerSub');
    var bodyEl = document.getElementById('opsDrawerBody');
    titleEl.textContent = title;
    subEl.textContent = sub;
    bodyEl.innerHTML = body;
    shell.classList.add('open');
  }
  function workOrderLists(team){
    var list = (team.currentProject && team.currentProject.workOrders) || [];
    var done = list.filter(function(w){ return ['accepted','done'].indexOf(w.status) >= 0; }).slice(0,3);
    var active = list.filter(function(w){ return ['assigned','running','submitted','reviewing','rework_required','blocked'].indexOf(w.status) >= 0; }).slice(0,3);
    var plan = list.filter(function(w){ return ['draft'].indexOf(w.status) >= 0; }).slice(0,3);
    if (!done.length) done = [{title:'任务拆解已完成', status:'done'}, {title:'上下文发布已完成', status:'done'}];
    if (!active.length) active = [activeWorkOrder(team) || {title:team.currentProject && team.currentProject.name || '当前任务推进', status:'running'}];
    if (!plan.length) plan = [{title:'交付审查复核', status:'draft'}, {title:'组长汇总 Activity', status:'draft'}];
    return {done:done, active:active, plan:plan};
  }
  function itemHtml(w, extra){
    return '<div class="ops-item"><div class="ops-item-title">' + esc(cleanTitle(w.title)) + '</div><div class="ops-item-sub">' + esc(statusLabel(w.status)) + (extra ? ' · ' + esc(extra) : '') + '</div></div>';
  }
  window.openTeamRunDrawer = function(teamId, mode){
    var team = teamById(teamId);
    if (!team) return;
    var metrics = teamMetrics(team);
    var rev = pendingReviews(team), dec = pendingDecisions(team), blk = openBlockers(team);
    var body = '<div class="ops-metric-grid">' +
      '<div class="ops-metric"><div class="ops-metric-label">今日 Token</div><div class="ops-metric-value">' + esc(fmtK(metrics.tokens)) + '</div></div>' +
      '<div class="ops-metric"><div class="ops-metric-label">会话数 / 轮次</div><div class="ops-metric-value">' + esc(metrics.sessions + ' / ' + metrics.rounds) + '</div></div>' +
      '</div>';
    if (mode === 'need') {
      body += '<div class="ops-section-title">待决策事项</div><div class="ops-list">';
      if (dec) body += '<div class="ops-item"><div class="ops-item-title">待决策 ' + dec + ' 项</div><div class="ops-item-sub">来源：协同规划岗 / 技术专家 · 建议先确认业务取舍或技术边界</div><div class="ops-item-actions"><button class="ops-mini-btn warning" onclick="switchNav && switchNav(\'decisions\')">进入待决策</button><button class="ops-mini-btn">交给组长处理</button></div></div>';
      if (rev) body += '<div class="ops-item"><div class="ops-item-title">待审查 ' + rev + ' 项</div><div class="ops-item-sub">来源：交付审查岗 · 优先复核交付物，失败后退回实现验证岗整改</div><div class="ops-item-actions"><button class="ops-mini-btn">查看审查队列</button><button class="ops-mini-btn">生成整改任务</button></div></div>';
      if (blk) body += '<div class="ops-item"><div class="ops-item-title">阻塞升级 ' + blk + ' 项</div><div class="ops-item-sub">需要组长判断是否升级技术专家或用户决策</div><div class="ops-item-actions"><button class="ops-mini-btn warning">标记需处理</button></div></div>';
      if (!dec && !rev && !blk) body += '<div class="ops-item"><div class="ops-item-title">暂无待决策事项</div><div class="ops-item-sub">团队处于正常推进状态</div></div>';
      body += '</div>';
    } else {
      var groups = workOrderLists(team);
      body += '<div class="ops-section-title">最新完成</div><div class="ops-list">' + groups.done.map(function(w){ return itemHtml(w, '已回写 Activity'); }).join('') + '</div>';
      body += '<div class="ops-section-title">进行中</div><div class="ops-list">' + groups.active.map(function(w){ return itemHtml(w, '下一步：' + nextAction(team, false)); }).join('') + '</div>';
      body += '<div class="ops-section-title">计划进行</div><div class="ops-list">' + groups.plan.map(function(w){ return itemHtml(w, '等待触发'); }).join('') + '</div>';
    }
    drawerOpen(team.name + ' · ' + (mode === 'need' ? '待决策' : '任务流'), (team.currentProject && team.currentProject.name || '当前项目') + ' · Token 与会话也在此查看', body);
  };
  window.openOpsDrawer = function(){
    var total = totalMetrics();
    var body = '<div class="ops-metric-grid">' +
      '<div class="ops-metric"><div class="ops-metric-label">今日 Token</div><div class="ops-metric-value">' + esc(fmtK(total.tokens)) + '</div></div>' +
      '<div class="ops-metric"><div class="ops-metric-label">会话 / 轮次</div><div class="ops-metric-value">' + esc(total.sessions + ' / ' + total.rounds) + '</div></div>' +
      '</div><div class="ops-section-title">团队排行</div><div class="ops-list">' +
      teams().map(function(t){
        var m = teamMetrics(t);
        return '<div class="ops-item clickable" onclick="window.openTeamRunDrawer(\'' + esc(t.id) + '\', \'flow\')"><div class="ops-item-title">' + esc(t.name) + ' · ' + esc(t.currentProject && t.currentProject.name || '未绑定项目') + '</div><div class="ops-card-stat"><span>Token ' + esc(fmtK(m.tokens)) + '</span><span>会话 ' + esc(m.sessions) + '</span><span>轮次 ' + esc(m.rounds) + '</span><span>均轮 ' + esc(fmtK(m.avg)) + '</span></div></div>';
      }).join('') + '</div>';
    drawerOpen('运营指标', '用于观察 Token 消耗、会话数和团队活跃度，不新增独立页面', body);
  };
  function enhanceTopOpsCard(){
    /* v0.6.33.45：顶部统计卡由最终卡片脚本统一维护。
       这里不再覆盖“数字员工”卡片文案，避免与员工排行/Token 会话点击抽屉产生重复刷新。 */
  }
  function hardCloseDemo(ev){
    try { if (ev) { ev.preventDefault && ev.preventDefault(); ev.stopPropagation && ev.stopPropagation(); } } catch(e) {}
    try { (window.__p0aDemoTimers || []).forEach(function(id){ clearTimeout(id); clearInterval(id); }); } catch(e) {}
    window.__p0aDemoTimers = [];
    window.__p0aDemoActiveWorkerId = null;
    var prev = window.__p0aDemoState || {};
    window.__p0aDemoState = Object.assign({}, prev, { visible:false, running:false, paused:false, index:0, label:'已关闭', op:'演示已终止' });
    var mask = document.getElementById('p0aDemoRunnerMask') || document.querySelector('.p0a-demo-runner-mask');
    if (mask) {
      mask.classList.remove('open');
      mask.classList.add('force-hidden');
      mask.style.display = 'none';
      mask.setAttribute('aria-hidden', 'true');
    }
    var runner = document.getElementById('p0aDemoRunner') || document.querySelector('.p0a-demo-runner');
    if (runner) runner.innerHTML = '';
    var btn = document.getElementById('p0aAutoDemoBtn');
    if (btn) { btn.classList.remove('running'); btn.textContent = '▶ 启动 P0a 演示'; }
    return false;
  }
  window.closeP0aDemoRunner = hardCloseDemo;
  ['startP0aAutoDemo','toggleP0aDemoRunner','toggleP0aDemoPlay'].forEach(function(name){
    var old = window[name];
    if (typeof old === 'function' && !old.__v20Wrapped) {
      var fn = function(){
        var mask = document.getElementById('p0aDemoRunnerMask') || document.querySelector('.p0a-demo-runner-mask');
        if (mask) { mask.classList.remove('force-hidden'); mask.style.display = ''; }
        return old.apply(this, arguments);
      };
      fn.__v20Wrapped = true;
      window[name] = fn;
    }
  });
  document.addEventListener('click', function(e){
    var target = e.target && e.target.closest && e.target.closest('.p0a-runner-btn');
    if (target && /关闭/.test(target.textContent || '')) hardCloseDemo(e);
  }, true);
  function runEnhance(){ enhanceTeamCards(); enhanceBusyDurations(); enhanceTopOpsCard(); }
  ['renderOverview','renderTopology','refreshAllViews'].forEach(function(name){
    var old = window[name];
    if (typeof old === 'function' && !old.__v20Wrapped2) {
      var fn = function(){ var ret = old.apply(this, arguments); setTimeout(runEnhance, 0); return ret; };
      fn.__v20Wrapped2 = true;
      window[name] = fn;
    }
  });
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(runEnhance, 180); });
  setTimeout(runEnhance, 260);
})();


;


(function(){
  if (window.__p0aDemoClosureV21Applied) return;
  window.__p0aDemoClosureV21Applied = true;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function appState(){ return window.currentState || (typeof currentState !== 'undefined' ? currentState : {}) || {}; }
  function teams(){ return appState().teams || []; }
  function teamById(id){ return teams().find(function(t){ return t.id === id; }) || null; }
  function fmtK(n){ return n >= 1000 ? (Math.round(n/100)/10) + 'K' : String(n || 0); }
  function cleanTitle(s){
    return String(s || '任务单')
      .replace(/P0a\s*/g,'').replace(/P0b\s*/g,'').replace(/P1\s*/g,'')
      .replace(/Mock/g,'模拟').replace(/RuntimeHost/g,'运行节点').replace(/WorkerRuntimeBinding/g,'员工运行绑定')
      .replace(/agent-web-kit/ig,'事件订阅').replace(/^[:：\s-]+|[:：\s-]+$/g,'').trim() || '任务单';
  }
  function shortText(s, n){ s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; }
  function pendingDecisions(team){
    try { return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && (!d.teamId || d.teamId === team.id); }).length; } catch(e){ return 0; }
  }
  function openBlockers(team){
    try { return (team.blockers || (team.currentProject && team.currentProject.blockers) || []).filter(function(b){ return !b.status || ['open','leader_reviewing','converted_to_decision'].indexOf(b.status) >= 0; }).length; } catch(e){ return 0; }
  }
  function workOrders(team){ return (team && team.currentProject && team.currentProject.workOrders) || []; }
  function activeWorkOrder(team){
    var order = ['blocked','rework_required','running','submitted','reviewing','assigned','accepted','done','draft'];
    return workOrders(team).slice().sort(function(a,b){ return order.indexOf(a.status) - order.indexOf(b.status); })[0] || null;
  }
  function statusLabel(s){ return ({draft:'草稿',assigned:'已分派',running:'执行中',blocked:'阻塞',submitted:'待审查',reviewing:'审查中',accepted:'已通过',rework_required:'需整改',done:'完成'}[s] || s || '推进中'); }
  function busyMinutesFor(name){
    var s = String(name || ''); var n = 0;
    for (var i=0;i<s.length;i++) n = (n * 31 + s.charCodeAt(i)) % 97;
    return 7 + (n % 58);
  }
  function longestBusy(team){
    var list = (team && team.members || []).filter(function(m){ return m.status === 'busy'; });
    if (!list.length) return 0;
    return Math.max.apply(null, list.map(function(m){ return busyMinutesFor(m.name || m.id); }));
  }
  function intervention(team){
    var dec = pendingDecisions(team);
    var blk = openBlockers(team);
    var rework = workOrders(team).filter(function(w){ return ['blocked','rework_required'].indexOf(w.status) >= 0; }).length;
    if (dec) return {type:'need', text:'待决策 ' + dec + '：确认业务取舍或技术边界', mode:'need'};
    if (blk) return {type:'need', text:'阻塞 ' + blk + '：需组长判断是否升级', mode:'need'};
    if (rework) return {type:'need', text:'审查退回：确认整改范围与优先级', mode:'need'};
    return null;
  }
  function flowText(team){
    var wo = activeWorkOrder(team);
    var task = shortText(cleanTitle((wo && wo.title) || (team && team.task) || (team && team.currentProject && team.currentProject.name)), 12);
    var busy = longestBusy(team);
    var status = wo ? statusLabel(wo.status) : '推进中';
    var next = status === '执行中' ? '下一步提交自测' : status === '待审查' ? '等待交付审查' : status === '审查中' ? '输出审查结论' : status === '已分派' ? '准备启动执行' : '推进下一任务';
    return '当前：' + task + ' · ' + status + (busy ? ' · 忙碌 ' + busy + 'm' : '') + '｜' + next;
  }
  function summaryHtml(team){
    var need = intervention(team);
    var cls = need ? 'need-action' : 'in-progress';
    var badge = need ? '待决策' : '进行中';
    var text = need ? need.text : flowText(team);
    var mode = need ? 'need' : 'flow';
    var link = need ? '处理' : '任务流';
    return '<div class="team-run-summary-v21 ' + cls + '" onclick="event.stopPropagation(); window.openTeamRunDrawer && window.openTeamRunDrawer(\'' + esc(team.id) + '\', \'' + mode + '\')" title="' + esc(text) + '">' +
      '<span class="team-run-badge-v21">' + esc(badge) + '</span>' +
      '<span class="team-run-text-v21">' + esc(text) + '</span>' +
      '<span class="team-run-link-v21">' + esc(link) + ' →</span>' +
      '</div>';
  }
  function enhanceTeamCardsV21(){
    var cards = document.querySelectorAll('#page-overview #topologyHtml .topo-team-card');
    cards.forEach(function(card){
      var team = teamById(card.getAttribute('data-team-id'));
      var meta = card.querySelector('.topo-card-meta');
      if (!team || !meta) return;
      var html = summaryHtml(team);
      var key = team.id + '|' + html.length + '|' + html;
      if (meta.getAttribute('data-v21-key') !== key) {
        meta.innerHTML = html;
        meta.setAttribute('data-v21-key', key);
      }
    });
  }
  function enhanceBusyV21(){
    document.querySelectorAll('#page-overview #topologyHtml .topo-worker.busy').forEach(function(node){
      var nameEl = node.querySelector('.topo-worker-name');
      var modeEl = node.querySelector('.topo-worker-mode') || node.querySelector('.topo-worker-role');
      if (!nameEl || !modeEl) return;
      var mins = busyMinutesFor(nameEl.textContent);
      var long = mins >= 45;
      var text = '忙碌 ' + mins + 'm · ' + (long ? '需关注' : '执行中');
      var html = '<span class="busy-duration-chip ' + (long ? 'long' : '') + '" title="' + esc(text) + '">' + esc(text) + '</span>';
      if (modeEl.innerHTML !== html) modeEl.innerHTML = html;
    });
  }
  function lightRefreshV21(){
    enhanceTeamCardsV21();
    enhanceBusyV21();
    /* v0.6.33.45：不在轻量刷新里覆盖顶部“数字员工”卡片文案；
       Token 与会话排行仍通过点击团队/员工卡片打开抽屉查看。 */
  }

  /* 阻止 10 秒一次的整页 renderOverview，改成轻量数据刷新，避免页面闪动 */
  (function interceptOverviewInterval(){
    if (window.__v21OverviewIntervalIntercepted) return;
    window.__v21OverviewIntervalIntercepted = true;
    var nativeSetInterval = window.setInterval;
    window.setInterval = function(cb, delay){
      var code = '';
      try { code = String(cb); } catch(e) {}
      if (Number(delay) === 10000 && code.indexOf('renderOverview') >= 0) {
        return nativeSetInterval(function(){
          try { lightRefreshV21(); } catch(e) {}
        }, delay);
      }
      return nativeSetInterval.apply(window, arguments);
    };
  })();

  /* 演示关闭：强制终止计时器并隐藏控制台，后续 renderRunner 不再把它重新打开 */
  function closeDemoHardV21(ev){
    try { if (ev) { ev.preventDefault && ev.preventDefault(); ev.stopPropagation && ev.stopPropagation(); } } catch(e) {}
    window.__p0aDemoForceClosed = true;
    try { (window.__p0aDemoTimers || []).forEach(function(id){ clearTimeout(id); clearInterval(id); }); } catch(e) {}
    window.__p0aDemoTimers = [];
    window.__p0aDemoActiveWorkerId = null;
    var prev = window.__p0aDemoState || {};
    window.__p0aDemoState = Object.assign({}, prev, { visible:false, running:false, paused:false, label:'已关闭', op:'演示已终止' });
    var mask = document.getElementById('p0aDemoRunnerMask') || document.querySelector('.p0a-demo-runner-mask');
    if (mask) {
      mask.classList.remove('open');
      mask.classList.add('force-hidden');
      mask.setAttribute('data-force-hidden','true');
      mask.style.setProperty('display','none','important');
      mask.style.setProperty('visibility','hidden','important');
      mask.setAttribute('aria-hidden','true');
    }
    var box = document.getElementById('p0aDemoRunner') || document.querySelector('.p0a-demo-runner');
    if (box) box.innerHTML = '';
    var btn = document.getElementById('p0aAutoDemoBtn');
    if (btn) { btn.classList.remove('running'); btn.textContent = '▶ 启动 P0a 演示'; }
    return false;
  }
  window.closeP0aDemoRunner = closeDemoHardV21;
  var oldRenderRunner = window.renderRunner;
  if (typeof oldRenderRunner === 'function' && !oldRenderRunner.__v21CloseWrapped) {
    var rr = function(){
      if (window.__p0aDemoForceClosed) {
        var mask = document.getElementById('p0aDemoRunnerMask') || document.querySelector('.p0a-demo-runner-mask');
        if (mask) {
          mask.classList.remove('open');
          mask.classList.add('force-hidden');
          mask.setAttribute('data-force-hidden','true');
          mask.style.setProperty('display','none','important');
        }
        return;
      }
      return oldRenderRunner.apply(this, arguments);
    };
    rr.__v21CloseWrapped = true;
    window.renderRunner = rr;
  }
  ['startP0aAutoDemo','toggleP0aDemoRunner','toggleP0aDemoPlay','resetP0aAutoDemo'].forEach(function(name){
    var old = window[name];
    if (typeof old === 'function' && !old.__v21ForceOpenWrapped) {
      var fn = function(){
        window.__p0aDemoForceClosed = false;
        var mask = document.getElementById('p0aDemoRunnerMask') || document.querySelector('.p0a-demo-runner-mask');
        if (mask) {
          mask.classList.remove('force-hidden');
          mask.removeAttribute('data-force-hidden');
          mask.style.removeProperty('display');
          mask.style.removeProperty('visibility');
        }
        return old.apply(this, arguments);
      };
      fn.__v21ForceOpenWrapped = true;
      window[name] = fn;
    }
  });
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('.p0a-runner-btn, [onclick*="closeP0aDemoRunner"]');
    if (btn && /关闭/.test(btn.textContent || btn.getAttribute('title') || '')) closeDemoHardV21(e);
  }, true);

  /* 渲染后只做局部 DOM 差量增强，不主动触发整页刷新 */
  ['renderOverview','renderTopology'].forEach(function(name){
    var old = window[name];
    if (typeof old === 'function' && !old.__v21LightWrapped) {
      var fn = function(){ var ret = old.apply(this, arguments); setTimeout(lightRefreshV21, 0); return ret; };
      fn.__v21LightWrapped = true;
      window[name] = fn;
    }
  });
  var moTimer = 0;
  var mo = new MutationObserver(function(){
    clearTimeout(moTimer);
    moTimer = setTimeout(lightRefreshV21, 80);
  });
  document.addEventListener('DOMContentLoaded', function(){
    var host = document.getElementById('topologyHtml');
    if (host) mo.observe(host, {childList:true, subtree:true});
    setTimeout(lightRefreshV21, 160);
  });
  setTimeout(function(){
    var host = document.getElementById('topologyHtml');
    if (host) { try { mo.observe(host, {childList:true, subtree:true}); } catch(e) {} }
    lightRefreshV21();
  }, 260);
})();


;


(function(){
  if (window.__p0aDemoClosureV22Applied) return;
  window.__p0aDemoClosureV22Applied = true;
  function markLeaderAvatars(){
    document.querySelectorAll('.worker-card-v14 .worker-card-avatar-large img[src*="avatar-leader-planner"]').forEach(function(img){
      var box = img.closest('.worker-card-avatar-large');
      if (box) box.classList.add('leader-avatar-v22');
    });
  }
  var oldRenderWorkerPool = window.renderWorkerPool;
  if (typeof oldRenderWorkerPool === 'function' && !oldRenderWorkerPool.__v22Wrapped) {
    var wrapped = function(){
      var ret = oldRenderWorkerPool.apply(this, arguments);
      setTimeout(markLeaderAvatars, 0);
      return ret;
    };
    wrapped.__v22Wrapped = true;
    window.renderWorkerPool = wrapped;
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(markLeaderAvatars, 120); });
  setTimeout(markLeaderAvatars, 260);
})();


;


(function(){
  if (window.__mockProjectsMetricsV25Applied) return;
  window.__mockProjectsMetricsV25Applied = true;

  function state(){ try { return (typeof currentState !== 'undefined' ? currentState : window.currentState) || {}; } catch(e){ return window.currentState || {}; } }
  function base(){ try { return (typeof baseState !== 'undefined' ? baseState : null); } catch(e){ return null; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function asset(p){
    var inProto = window.location.pathname.indexOf('/prototypes/') >= 0 || window.location.protocol === 'file:';
    return (inProto ? './' : '/docs/prototypes/') + p;
  }
  function numFromText(s){ var t=String(s||''); var m=t.match(/(\d+)/); return m ? Number(m[1]) : 1; }
  function teamNo(t){ return Math.max(1, Math.min(5, numFromText((t && (t.name || t.id || t.masterCodename)) || '1'))); }
  function workerNo(w){ return Math.max(1, Math.min(5, numFromText((w && (w.name || w.id)) || '1'))); }
  window.getLeaderAvatarSrc = function(teamOrWorker){ return asset('pic/avatars/avatar-leader-planner-' + String(teamNo(teamOrWorker)).padStart(2,'0') + '.png'); };
  window.getWorkerAvatarSrc = function(w){
    w = w || {};
    if (w.teamRole === 'leader' || w.role === '@explorer') return window.getLeaderAvatarSrc(w);
    var idx = workerNo(w);
    if (w.role === '@designer') return asset('pic/avatars/avatar-reviewer-' + String(idx).padStart(2,'0') + '.png');
    if (w.role === '@oracle') return asset('pic/avatars/avatar-reviewer-' + String(Math.min(5, Math.max(4, idx))).padStart(2,'0') + '.png');
    if (w.role === '@fixer') return asset('pic/avatars/avatar-implementer-' + String(idx).padStart(2,'0') + '.png');
    return asset('pic/avatars/avatar-implementer-03.png');
  };
  window.getLargeWorkerAvatarSrc = function(w){
    w = w || {};
    if (w.teamRole === 'leader' || w.role === '@explorer') return asset('pic/avatars/avatar-leader-planner-' + String(teamNo(w)).padStart(2,'0') + '-large.png');
    var idx = workerNo(w);
    if (w.role === '@designer') return asset('pic/avatars/avatar-reviewer-' + String(idx).padStart(2,'0') + '-large.png');
    if (w.role === '@oracle') return asset('pic/avatars/avatar-reviewer-' + String(Math.min(5, Math.max(4, idx))).padStart(2,'0') + '-large.png');
    if (w.role === '@fixer') return asset('pic/avatars/avatar-implementer-' + String(idx).padStart(2,'0') + '-large.png');
    return asset('pic/avatars/avatar-implementer-03-large.png');
  };

  function fmtToken(n){
    n = Number(n || 0);
    if (n >= 1e9) return (n/1e9).toFixed(1) + 'G';
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
    return String(Math.round(n));
  }
  window.formatTokenV25 = fmtToken;

  var PROJECTS = [
    {
      id:'proj-hr-vue-migration', name:'HR 代码迁移项目', stage:'build', progress:62, teamToken:8600000, sessions:316,
      desc:'前端从 Vue2 迁移到 Vue3，组件库由 Element UI 升级到 Ant Design Vue，同步梳理路由、表单、表格和权限适配。',
      task:'Vue2 到 Vue3 迁移与组件替换', current:'迁移路由与核心表单页', next:'批量替换 Element UI 组件并补齐回归用例', pendingReviews:2, pendingDecisions:1,
      work:[
        ['WO-HR-001','Vue3 工程骨架与路由迁移','running',48,'实现1-1'],
        ['WO-HR-002','Element UI 到 Ant Design Vue 组件映射','reviewing',70,'实现1-2'],
        ['WO-HR-003','HR 表单/表格高频页面回归自测','assigned',20,'审查1-1'],
        ['WO-HR-004','权限指令与全局状态兼容检查','draft',0,'实现1-2']
      ],
      docs:['HR 前端迁移范围说明','Vue3 迁移技术方案','组件替换映射清单','HR 页面回归测试清单']
    },
    {
      id:'proj-lowcode-mobile', name:'低代码移动端开发项目', stage:'design', progress:38, teamToken:3400000, sessions:142,
      desc:'围绕移动端低代码页面、物料协议、运行时容器和预览调试链路，完成第一版可演示闭环。',
      task:'移动端低代码运行时与物料协议', current:'梳理移动端物料协议', next:'输出页面预览与调试方案', pendingReviews:1, pendingDecisions:1,
      work:[
        ['WO-LC-001','移动端物料协议设计','running',45,'管理2'],
        ['WO-LC-002','低代码页面预览容器','assigned',25,'实现2-1'],
        ['WO-LC-003','移动端组件适配验收清单','submitted',65,'审查2-1'],
        ['WO-LC-004','离线包与多端适配方案','draft',0,'实现2-2']
      ],
      docs:['移动端低代码需求说明','物料协议草案','预览调试链路设计','组件验收清单']
    },
    {
      id:'proj-erp-core', name:'ERP 系统', stage:'build', progress:54, teamToken:1200000000, sessions:860,
      desc:'覆盖采购、库存、财务核算和审批流关键链路，重点处理单据状态、接口契约和历史数据兼容。',
      task:'ERP 单据流与接口契约改造', current:'采购到库存单据流联调', next:'财务核算接口契约审查', pendingReviews:3, pendingDecisions:2,
      work:[
        ['WO-ERP-001','采购订单到入库单链路重构','running',52,'实现3-1'],
        ['WO-ERP-002','库存台账接口契约补齐','reviewing',78,'审查3-1'],
        ['WO-ERP-003','财务凭证生成规则审查','blocked',35,'技术专家-1'],
        ['WO-ERP-004','历史单据兼容迁移脚本','draft',0,'实现3-2']
      ],
      docs:['ERP 单据流设计','库存接口契约','财务凭证规则','历史数据迁移计划']
    },
    {
      id:'proj-device-mgmt', name:'设备管理系统', stage:'test', progress:72, teamToken:920500, sessions:76,
      desc:'建设设备台账、巡检计划、维修工单和告警闭环，当前重点在移动巡检与工单流转验收。',
      task:'设备台账与巡检工单闭环', current:'巡检工单状态流验收', next:'补齐设备告警联动用例', pendingReviews:2, pendingDecisions:0,
      work:[
        ['WO-DEV-001','设备台账字段模型梳理','accepted',100,'实现4-1'],
        ['WO-DEV-002','巡检计划与移动端打卡','running',66,'实现4-2'],
        ['WO-DEV-003','维修工单流转验收','reviewing',80,'审查4-1'],
        ['WO-DEV-004','设备告警联动规则','draft',0,'实现4-1']
      ],
      docs:['设备台账需求','巡检计划设计','维修工单验收记录','告警联动规则草案']
    },
    {
      id:'proj-agent-team', name:'智能软件工厂', stage:'build', progress:68, teamToken:14700000, sessions:438,
      desc:'以当前原型为半手工 POC，完善岗位、团队、项目、任务单、决策、验收和运营指标的演示闭环。',
      task:'智能软件工厂 P0a 演示闭环', current:'优化项目页与运营消耗抽屉', next:'补齐头像资源与 Smoke Check', pendingReviews:2, pendingDecisions:1,
      work:[
        ['WO-SF-001','真实项目 Mock 数据替换','running',65,'实现5-1'],
        ['WO-SF-002','团队与员工 Token 消耗排行','assigned',35,'实现5-2'],
        ['WO-SF-003','项目页视觉与进度表达优化','reviewing',60,'审查5-1'],
        ['WO-SF-004','头像资源全量替换与状态点修复','draft',0,'实现5-1']
      ],
      docs:['v0.6.32 产品需求规格','系统设计方案','原型优化执行清单','P0a Smoke Check']
    }
  ];

  function workerMetrics(worker, team, idx){
    var tm = (team && team.opsMetrics) || {tokens: 1000000, sessions: 30};
    var ratio = worker && worker.teamRole === 'leader' ? .24 : (worker && worker.role === '@designer' ? .18 : (worker && worker.role === '@oracle' ? .15 : .21));
    var token = Math.max(12000, Math.round(tm.tokens * ratio * (1 + ((idx || 0) % 3) * .08)));
    var sessions = Math.max(3, Math.round(tm.sessions * ratio * .78));
    var rounds = Math.max(8, sessions * (5 + ((idx || 0) % 4)));
    return {tokens:token, sessions:sessions, rounds:rounds};
  }
  function allWorkers(){
    var s=state(), out=[];
    (s.teams || []).forEach(function(t){
      if (t.masterId) out.push({id:t.masterId, name:t.masterCodename || t.masterId, role:'@explorer', teamRole:'leader', teamId:t.id, status:t.masterStatus === 'offline' ? 'offline' : 'busy', currentTaskSummary:t.task || '', opsMetrics:t.leaderOpsMetrics});
      (t.members || []).forEach(function(m){ out.push(Object.assign({teamId:t.id, teamRole:'member'}, m)); });
    });
    (s.workers || []).forEach(function(w){ out.push(Object.assign({teamRole:'pool'}, w)); });
    return out;
  }
  function teamMetrics(t){ return (t && t.opsMetrics) || {tokens:0,sessions:0,rounds:0}; }
  function employeeTotal(){
    return allWorkers().reduce(function(a,w){ var m=w.opsMetrics || {tokens:0,sessions:0,rounds:0}; a.tokens+=m.tokens||0; a.sessions+=m.sessions||0; a.rounds+=m.rounds||0; return a; }, {tokens:0,sessions:0,rounds:0});
  }
  function teamTotal(){ return (state().teams||[]).reduce(function(a,t){ var m=teamMetrics(t); a.tokens+=m.tokens||0; a.sessions+=m.sessions||0; a.rounds+=m.rounds||0; return a; }, {tokens:0,sessions:0,rounds:0}); }
  function statusLabel(s){ return ({draft:'计划中',assigned:'已分派',running:'执行中',blocked:'阻塞',submitted:'待审查',reviewing:'审查中',accepted:'已完成',rework_required:'需整改',done:'已完成'}[s] || s || '进行中'); }
  function stageLabel(s){ return ({planning:'规划',design:'设计',build:'开发',development:'开发',test:'测试',release:'交付'}[s] || s || '推进中'); }
  function activeWorkOrders(t){ return ((t.currentProject&&t.currentProject.workOrders)||[]).filter(function(w){ return ['assigned','running','blocked','submitted','reviewing','rework_required'].indexOf(w.status)>=0; }); }
  function pendingReviews(t){ return Number(t.pendingReviews || (t.currentProject && t.currentProject.acceptanceQueue && t.currentProject.acceptanceQueue.length) || 0); }
  function pendingDecisions(t){ return (state().decisions||[]).filter(function(d){ return d.status==='pending' && d.teamId===t.id; }).length; }
  function totalPending(){ var teams=state().teams||[]; return {reviews:teams.reduce(function(n,t){return n+pendingReviews(t);},0), decisions:(state().decisions||[]).filter(function(d){return d.status==='pending';}).length}; }
  function progressOf(t){ return Number((t.currentProject && t.currentProject.progress) || 0); }

  function applyMockProjectData(){
    var s=state(); if (!s.teams || !s.teams.length) return;
    s.teams.forEach(function(t, i){
      var p = PROJECTS[i % PROJECTS.length];
      t.name = '研发' + ['一','二','三','四','五'][i] + '组';
      t.masterCodename = '管理' + (i+1);
      t.task = p.task;
      t.pendingReviews = p.pendingReviews;
      t.pendingDecisions = p.pendingDecisions;
      t.expertSupport = i === 2 ? '技术专家已介入：财务凭证规则评审' : (i === 4 ? '按待决策：原型架构边界' : '暂无待决策');
      t.healthy = i !== 2;
      t.opsMetrics = {tokens:p.teamToken, sessions:p.sessions, rounds: Math.round(p.sessions * (5.2 + i*.6)), avg: Math.round(p.teamToken / Math.max(1, p.sessions * (5.2 + i*.6)))};
      t.currentProject = t.currentProject || {};
      Object.assign(t.currentProject, {
        id:p.id, name:p.name, stage:p.stage, progress:p.progress, health:t.healthy ? 'healthy' : 'warning', repo:'github.com/enterprise/' + p.id,
        description:p.desc,
        docs:p.docs.map(function(title,j){ return {id:p.id+'-doc-'+(j+1), category:['specs','plans','reports','decisions'][j%4], title:title, status:j<2?'approved':(j===2?'in_execution':'draft'), authorId:t.masterId, reviewerIds:[], updatedTs:Date.now()-(j+1)*3600000, version:'0.'+(j+3)}; }),
        workOrders:p.work.map(function(w,j){ return {id:w[0], title:w[1], status:w[2], percent:w[3], assigneeName:w[4], reviewStrategy:j===2?'independent_acceptance':'self_check'}; }),
        acceptanceQueue:p.work.filter(function(w){ return ['submitted','reviewing'].indexOf(w[2])>=0; }).map(function(w){ return w[0]; })
      });
      t.activities = [
        {time:Date.now()-(i+1)*60000, desc:'协同规划岗 ' + t.masterCodename + ' 更新 ' + p.name + ' 任务拆解与下一步计划'},
        {time:Date.now()-(i+3)*90000, desc:'实现验证岗 提交 ' + p.current + ' 的执行回执'},
        {time:Date.now()-(i+5)*120000, desc:'交付审查岗 复核 ' + p.next + ' 的验收条件'}
      ];
      if (t.members) t.members.forEach(function(m, j){
        m.currentTaskSummary = j === 0 ? p.current : (j === 1 ? p.next : '交付审查与质量门禁');
        m.opsMetrics = workerMetrics(m, t, j+1);
      });
      t.leaderOpsMetrics = workerMetrics({teamRole:'leader'}, t, 0);
    });
    s.decisions = [
      {id:'d-hr-antd', teamId:'t1', requesterId:'AGT-001', type:'组件升级取舍', title:'HR 迁移是否统一替换为 Ant Design Vue 表单规范', urgent:false, timeTs:Date.now()-8*60000, expiresAt:Date.now()+3600000, status:'pending', projectId:'proj-hr-vue-migration', sourceRole:'协同规划岗', sourceDoc:'组件替换映射清单', suggestedOwner:'用户 / 管理1', escalationPath:'实现验证岗 → 协同规划岗 → 用户', context:'Element UI 到 Ant Design Vue 的替换涉及表单布局、校验提示和弹窗交互统一，需要确认是否接受统一规范带来的视觉变化。', options:[{label:'统一按 Ant Design Vue 规范改造',kind:'primary'},{label:'优先保持旧版交互',kind:'normal'}]},
      {id:'d-lc-runtime', teamId:'t2', requesterId:'AGT-006', type:'运行时边界', title:'低代码移动端是否先只支持 H5 容器', urgent:false, timeTs:Date.now()-18*60000, expiresAt:Date.now()+7200000, status:'pending', projectId:'proj-lowcode-mobile', sourceRole:'协同规划岗', sourceDoc:'预览调试链路设计', suggestedOwner:'用户 / 管理2', escalationPath:'协同规划岗 → 用户', context:'当前 P0 范围可先完成 H5 容器与移动端预览，原生能力桥接放到后续阶段。', options:[{label:'先支持 H5 容器',kind:'primary'},{label:'同步预留原生桥接',kind:'normal'}]},
      {id:'d-erp-finance', teamId:'t3', requesterId:'AGT-013', type:'财务规则确认', title:'ERP 财务凭证生成规则需人工确认', urgent:true, timeTs:Date.now()-28*60000, expiresAt:Date.now()+1800000, status:'pending', projectId:'proj-erp-core', sourceRole:'系统架构师 / 技术专家岗', sourceDoc:'财务凭证规则', suggestedOwner:'财务产品负责人 / 管理3', escalationPath:'实现验证岗 → 协同规划岗 → 技术专家 → 用户', context:'采购入库后的凭证生成涉及历史单据兼容和科目映射，自动裁决风险较高。', options:[{label:'采用新凭证规则并保留兼容映射',kind:'primary'},{label:'暂停财务链路迁移',kind:'danger'}]},
      {id:'d-sf-metrics', teamId:'t5', requesterId:'AGT-022', type:'原型表达确认', title:'智能软件工厂是否在总览展示 Token 与会话消耗', urgent:false, timeTs:Date.now()-12*60000, expiresAt:Date.now()+5400000, status:'pending', projectId:'proj-agent-team', sourceRole:'交付审查岗', sourceDoc:'原型优化执行清单', suggestedOwner:'管理5', escalationPath:'交付审查岗 → 协同规划岗 → 用户', context:'总览统计卡可展示团队和员工维度消耗，但不新增独立运营页面，点击后通过右滑框查看排行。', options:[{label:'在总览展示消耗统计',kind:'primary'},{label:'仅在详情中展示',kind:'normal'}]}
    ];
    (s.workers||[]).forEach(function(w,j){ w.opsMetrics = {tokens: 160000 + j*54000, sessions: 9 + j*3, rounds: 52 + j*11}; });
    var b=base();
    if (b && b.teams) { b.teams = JSON.parse(JSON.stringify(s.teams)); b.decisions = JSON.parse(JSON.stringify(s.decisions)); b.workers = JSON.parse(JSON.stringify(s.workers || [])); }
  }

  function ensureDrawer(){
    var shell=document.getElementById('opsDrawerShell');
    if(!shell){ shell=document.createElement('div'); shell.id='opsDrawerShell'; shell.className='ops-drawer-shell'; document.body.appendChild(shell); }
    shell.innerHTML='<div class="ops-drawer" role="dialog" aria-modal="false"><div class="ops-drawer-head"><div><div class="ops-drawer-title" id="opsDrawerTitle">运行详情</div><div class="ops-drawer-sub" id="opsDrawerSub">点击空白处可收起</div></div><button class="ops-drawer-close" onclick="window.closeOpsDrawer && window.closeOpsDrawer()">×</button></div><div class="ops-drawer-body" id="opsDrawerBody"></div></div>';
    shell.onclick=function(e){ if(e.target===shell) window.closeOpsDrawer(); };
    shell.querySelector('.ops-drawer').onclick=function(e){ e.stopPropagation(); };
    return shell;
  }
  window.closeOpsDrawer=function(){ var shell=document.getElementById('opsDrawerShell'); if(shell) shell.classList.remove('open'); };
  function openDrawer(title, sub, body){ var shell=ensureDrawer(); shell.querySelector('#opsDrawerTitle').textContent=title; shell.querySelector('#opsDrawerSub').textContent=sub||'点击空白处可收起'; shell.querySelector('#opsDrawerBody').innerHTML=body; requestAnimationFrame(function(){ shell.classList.add('open'); }); }
  function metricCards(metrics){ return '<div class="ops-metric-grid"><div class="ops-metric"><div class="ops-metric-label">Token 消耗</div><div class="ops-metric-value">'+esc(fmtToken(metrics.tokens))+'</div></div><div class="ops-metric"><div class="ops-metric-label">会话数 / 轮次</div><div class="ops-metric-value">'+esc((metrics.sessions||0)+' / '+(metrics.rounds||0))+'</div></div></div>'; }
  function rankItem(title, sub, metrics, rank, maxToken){ var pct=maxToken?Math.max(4, Math.round(metrics.tokens/maxToken*100)):0; return '<div class="ops-item"><div class="ops-rank-line"><span class="ops-rank-num">'+rank+'</span><div style="min-width:0;flex:1"><div class="ops-item-title">'+esc(title)+'</div><div class="ops-item-sub">'+esc(sub)+'</div><div class="ops-usage-meta"><span>Token '+esc(fmtToken(metrics.tokens))+'</span><span>会话 '+esc(metrics.sessions||0)+'</span><span>轮次 '+esc(metrics.rounds||0)+'</span><span>均轮 '+esc(fmtToken(Math.round((metrics.tokens||0)/Math.max(1, metrics.rounds||1))))+'</span></div><div class="ops-progress"><span style="width:'+pct+'%"></span></div></div></div></div>'; }
  function teamRankHtml(){ var teams=(state().teams||[]).slice().sort(function(a,b){return teamMetrics(b).tokens-teamMetrics(a).tokens;}); var max=teamMetrics(teams[0]||{}).tokens||1; return teams.map(function(t,i){ return rankItem(t.name+' · '+(t.currentProject&&t.currentProject.name||'未绑定项目'), '项目进度 '+progressOf(t)+'% · '+stageLabel(t.currentProject&&t.currentProject.stage), teamMetrics(t), i+1, max); }).join(''); }
  function workerRankHtml(){ var list=allWorkers().slice().sort(function(a,b){return ((b.opsMetrics||{}).tokens||0)-((a.opsMetrics||{}).tokens||0);}); var max=((list[0]&&list[0].opsMetrics)||{}).tokens||1; return list.slice(0,18).map(function(w,i){ var team=(state().teams||[]).find(function(t){return t.id===w.teamId;}); return rankItem((w.name||w.id)+' · '+(w.teamRole==='leader'?'协同规划岗':(typeof getDisplayRole==='function'?getDisplayRole(w):w.role||'')), (team?team.name:'共享/待分配')+' · '+(w.currentTaskSummary||'暂无任务'), w.opsMetrics||{tokens:0,sessions:0,rounds:0}, i+1, max); }).join(''); }
  window.openOpsDrawer=function(kind){
    var teamsTotal=teamTotal(), empTotal=employeeTotal();
    if(kind==='workers') return openDrawer('员工 Token 消耗排行', '按数字员工实例统计 Token、会话和轮次', metricCards(empTotal)+'<div class="ops-section-title">员工排行</div><div class="ops-list">'+workerRankHtml()+'</div>');
    return openDrawer('团队 Token 消耗排行', '按团队聚合统计 Token、会话和轮次', metricCards(teamsTotal)+'<div class="ops-section-title">团队排行</div><div class="ops-list">'+teamRankHtml()+'</div>');
  };
  window.openTaskOpsDrawer=function(){
    var teams=state().teams||[], items=[];
    teams.forEach(function(t){ activeWorkOrders(t).forEach(function(w){ items.push({team:t,w:w}); }); });
    var body='<div class="ops-section-title">执行中任务单</div><div class="ops-list">'+items.map(function(x,i){ return '<div class="ops-item"><div class="ops-item-title">'+esc(x.w.title)+'</div><div class="ops-item-sub">'+esc(x.team.name+' · '+statusLabel(x.w.status)+' · 进度 '+(x.w.percent||0)+'% · 负责人 '+(x.w.assigneeName||'-'))+'</div><div class="ops-progress"><span style="width:'+Math.max(4,x.w.percent||0)+'%"></span></div></div>'; }).join('')+'</div>';
    openDrawer('执行中任务', '查看当前所有团队的任务单流转，不跳转页面', body);
  };
  window.openPendingOpsDrawer=function(){
    var teams=state().teams||[], decs=(state().decisions||[]).filter(function(d){return d.status==='pending';});
    var body='<div class="ops-section-title">待决策</div><div class="ops-list">'+decs.map(function(d){ var t=teams.find(function(x){return x.id===d.teamId;}); return '<div class="ops-item"><div class="ops-item-title">'+esc(d.title)+'</div><div class="ops-item-sub">'+esc((t?t.name:'未分配')+' · '+(d.type||'待决策')+' · '+(d.sourceRole||''))+'</div><div class="ops-item-actions"><button class="ops-mini-btn warning" onclick="switchNav && switchNav(\'decisions\')">进入待决策页</button></div></div>'; }).join('')+'</div>';
    body+='<div class="ops-section-title">待审查</div><div class="ops-list">'+teams.filter(function(t){return pendingReviews(t)>0;}).map(function(t){ return '<div class="ops-item"><div class="ops-item-title">'+esc(t.name+' · 待审查 '+pendingReviews(t)+' 项')+'</div><div class="ops-item-sub">'+esc((t.currentProject&&t.currentProject.name||'当前项目')+' · 交付审查岗负责质量门禁，失败后退回实现验证岗整改')+'</div></div>'; }).join('')+'</div>';
    openDrawer('待决策 / 待审查', '与菜单“待决策”保持口径一致，待审查作为质量门禁队列展示', body);
  };

  window.openTeamRunDrawer=function(teamId, mode){
    var t=(state().teams||[]).find(function(x){return x.id===teamId;}); if(!t) return;
    var body=metricCards(teamMetrics(t));
    if(mode==='need'){
      body+='<div class="ops-section-title">待决策事项</div><div class="ops-list">';
      var decs=(state().decisions||[]).filter(function(d){return d.status==='pending' && d.teamId===t.id;});
      decs.forEach(function(d){ body+='<div class="ops-item"><div class="ops-item-title">'+esc(d.title)+'</div><div class="ops-item-sub">'+esc((d.type||'待决策')+' · '+(d.sourceRole||'协同规划岗'))+'</div></div>'; });
      if(pendingReviews(t)) body+='<div class="ops-item"><div class="ops-item-title">待审查 '+pendingReviews(t)+' 项</div><div class="ops-item-sub">交付审查岗复核交付物，必要时生成整改任务单</div></div>';
      body+='</div>';
    }else{
      var list=(t.currentProject&&t.currentProject.workOrders)||[];
      var done=list.filter(function(w){return ['accepted','done'].indexOf(w.status)>=0;}).slice(0,3);
      var active=list.filter(function(w){return ['assigned','running','blocked','submitted','reviewing','rework_required'].indexOf(w.status)>=0;}).slice(0,4);
      var plan=list.filter(function(w){return w.status==='draft';}).slice(0,3);
      function listHtml(arr,extra){return '<div class="ops-list">'+arr.map(function(w){return '<div class="ops-item"><div class="ops-item-title">'+esc(w.title)+'</div><div class="ops-item-sub">'+esc(statusLabel(w.status)+' · 进度 '+(w.percent||0)+'% · '+(w.assigneeName||'-')+(extra?' · '+extra:''))+'</div><div class="ops-progress"><span style="width:'+Math.max(4,w.percent||0)+'%"></span></div></div>';}).join('')+'</div>';}
      body+='<div class="ops-section-title">最新完成</div>'+listHtml(done.length?done:[{title:'任务拆解与上下文发布已完成',status:'done',percent:100,assigneeName:t.masterCodename}], '已回写 Activity');
      body+='<div class="ops-section-title">进行中</div>'+listHtml(active, '继续推进');
      body+='<div class="ops-section-title">计划进行</div>'+listHtml(plan.length?plan:[{title:'下一轮交付审查复核',status:'draft',percent:0,assigneeName:'交付审查岗'}], '等待触发');
    }
    openDrawer(t.name+' · '+(mode==='need'?'待决策':'任务流'), (t.currentProject&&t.currentProject.name||'当前项目')+' · Token 与会话已同步展示', body);
  };

  function enhanceOverviewStats(){
    var s=state(), teams=s.teams||[], all=allWorkers(), tt=teamTotal(), et=employeeTotal(), pend=totalPending(), active=teams.reduce(function(n,t){return n+activeWorkOrders(t).length;},0);
    var c1=document.getElementById('statTeamCount'), c2=document.getElementById('statMasterCount'), c3=document.getElementById('statWorkerCount'), c4=document.getElementById('statDecisionCount');
    if(!c1||!c2||!c3||!c4) return;
    var online=all.filter(function(w){return w.status!=='offline';}).length;
    var offline=Math.max(0, all.length-online);
    var busy=all.filter(function(w){return w.status==='busy';}).length;
    var paused=teams.reduce(function(n,t){ return n+((t.currentProject&&t.currentProject.workOrders)||[]).filter(function(w){return w.status==='blocked';}).length; },0);
    var urgent=(s.decisions||[]).filter(function(d){return d.status==='pending' && d.urgent;}).length;
    var memberCount=teams.reduce(function(n,t){ return n+(t.members?t.members.length:0); },0);
    var cards=[c1.closest('.stat-card'),c2.closest('.stat-card'),c3.closest('.stat-card'),c4.closest('.stat-card')];
    cards.forEach(function(c){ if(c){ c.classList.add('v25-ops-card','v063315-stat-card'); var oldExtra=c.querySelector('.stat-card-extra'); if(oldExtra) oldExtra.remove(); } });
    function setCard(counter, title, value, desc, trend, footItems, click, tip){
      var card=counter.closest('.stat-card'); if(!card) return;
      var titleEl=card.querySelector('.stat-card-title');
      var descEl=card.querySelector('.stat-card-desc');
      var trendEl=card.querySelector('.stat-card-trend');
      if(titleEl) titleEl.textContent=title;
      counter.textContent=value;
      if(descEl) descEl.textContent=desc;
      if(trendEl) { trendEl.textContent=trend||''; trendEl.classList.remove('up','down','flat'); trendEl.classList.add('flat'); }
      var foot=card.querySelector('.stat-card-foot');
      if(!foot){ foot=document.createElement('div'); foot.className='stat-card-foot'; card.appendChild(foot); }
      foot.innerHTML=(footItems||[]).map(function(x){ return '<span class="stat-card-mini">'+esc(x)+'</span>'; }).join('');
      card.onclick=click;
      card.title=tip||'';
    }
    setCard(c1, '🏢 协作团队', teams.length, (teams.length||5)+' 个项目团队运行中', '消耗排行 →', ['组长 '+(teams.length||5), '成员 '+memberCount, '项目 '+((teams.filter(function(t){return !!t.currentProject;}).length)||teams.length||5)], function(){window.openOpsDrawer('teams');}, '点击查看团队 Token 与会话排行');
    setCard(c2, '👥 数字员工', all.length, online+' 在线 · '+offline+' 离线', '员工排行 →', ['忙碌 '+busy, 'Token '+fmtToken(et.tokens), '会话 '+et.sessions], function(){window.openOpsDrawer('workers');}, '点击查看员工 Token 与会话排行');
    setCard(c3, '⚡ 任务执行', active, '任务单执行、审查、整改中', '查看任务 →', ['执行中 '+active, '暂停 '+paused, '今日流转 '+Math.max(0, active-paused)], function(){window.openTaskOpsDrawer();}, '点击查看执行中任务');
    setCard(c4, '⚠️ 待决策', pend.decisions+pend.reviews, pend.decisions+' 待决策 · '+pend.reviews+' 待审查', '处理决策 →', ['待决策 '+pend.decisions, '待审查 '+pend.reviews, '高风险 '+urgent], function(){window.openPendingOpsDrawer();}, '点击查看待决策与待审查');
  }

  var oldRenderOverview = (typeof renderOverview === 'function') ? renderOverview : null;
  renderOverview=function(){ if(oldRenderOverview) oldRenderOverview(); enhanceOverviewStats(); };

  renderProjects=function(){
    var page=document.getElementById('page-projects'); if(!page) return;
    var teams=state().teams||[], projects=teams.filter(function(t){return t.currentProject;});
    var total=teamTotal(), pend=totalPending();
    page.innerHTML='<div class="project-board-v25"><div class="project-board-head-v25"><div class="project-hero-v25"><div class="project-hero-title-v25">项目运行态</div><div class="project-hero-sub-v25">5 个真实业务 Mock 项目覆盖迁移、低代码、ERP、设备管理和智能软件工厂自身 POC。项目卡直接展示进度、团队、任务单、质量门禁与消耗，不再只是普通列表。</div></div><div class="project-mini-v25"><div class="project-mini-label-v25">项目数</div><div class="project-mini-value-v25">'+projects.length+'</div></div><div class="project-mini-v25"><div class="project-mini-label-v25">团队 Token</div><div class="project-mini-value-v25">'+fmtToken(total.tokens)+'</div></div><div class="project-mini-v25"><div class="project-mini-label-v25">待决策 / 待审查</div><div class="project-mini-value-v25">'+pend.decisions+' / '+pend.reviews+'</div></div></div><div class="project-grid-v25">'+projects.map(function(t){ var p=t.currentProject, m=teamMetrics(t), active=activeWorkOrders(t).length; return '<div class="project-card-v25"><div class="project-card-head-v25"><div><div class="project-card-title-v25">'+esc(p.name)+'</div></div><span class="project-stage-v25">'+esc(stageLabel(p.stage))+'</span></div><div class="project-desc-v25">'+esc(p.description||t.task||'')+'</div><div class="project-progress-row-v25"><span>整体进度</span><span>'+progressOf(t)+'%</span></div><div class="project-progress-v25"><span style="width:'+progressOf(t)+'%"></span></div><div class="project-meta-grid-v25"><div class="project-meta-v25"><div class="project-meta-label-v25">承接团队</div><div class="project-meta-value-v25">'+esc(t.name)+'</div></div><div class="project-meta-v25"><div class="project-meta-label-v25">执行中</div><div class="project-meta-value-v25">'+active+'</div></div><div class="project-meta-v25"><div class="project-meta-label-v25">待决策/审查</div><div class="project-meta-value-v25">'+pendingDecisions(t)+' / '+pendingReviews(t)+'</div></div><div class="project-meta-v25"><div class="project-meta-label-v25">Token / 会话</div><div class="project-meta-value-v25">'+fmtToken(m.tokens)+' / '+m.sessions+'</div></div></div><div class="project-actions-v25"><button class="project-action-v25" onclick="window.openTeamRunDrawer(\''+esc(t.id)+'\',\'flow\')">任务流</button><button class="project-action-v25" onclick="window.openTeamRunDrawer(\''+esc(t.id)+'\',\'need\')">处理项</button><button class="project-action-v25" onclick="window.openOpsDrawer(\'teams\')">消耗排行</button></div></div>'; }).join('')+'</div></div>';
  };

  function init(){
    applyMockProjectData();
    try { if (typeof renderAll === 'function') renderAll(); else if (typeof refreshAllViews === 'function') refreshAllViews(); } catch(e) {}
    try { enhanceOverviewStats(); } catch(e) {}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 120); }); else setTimeout(init, 120);
  setInterval(function(){ try { enhanceOverviewStats(); } catch(e){} }, 1500);
})();


;


(function(){
  if (window.__avatarSiteStep2Applied) return;
  window.__avatarSiteStep2Applied = true;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function state(){ try { return (typeof currentState !== 'undefined' ? currentState : window.currentState) || {}; } catch(e){ return window.currentState || {}; } }
  function asset(p){ var inProto = window.location.pathname.indexOf('/prototypes/') >= 0 || window.location.protocol === 'file:'; return (inProto ? './' : '/docs/prototypes/') + p; }
  function pad2(n){ return String(Math.max(1, Math.min(5, Number(n)||1))).padStart(2,'0'); }
  function numFromText(s){ var m = String(s || '').match(/(\d+)/); return m ? Number(m[1]) : 1; }
  function findTeamById(id){ return (state().teams || []).find(function(t){ return t.id === id; }) || null; }
  function findTeamForWorker(w){
    var st = state();
    if (w && w.teamId) { var t = findTeamById(w.teamId); if (t) return t; }
    if (!w) return null;
    return (st.teams || []).find(function(t){
      if (t.masterId === w.id || t.masterCodename === w.name) return true;
      return (t.members || []).some(function(m){ return (w.id && m.id === w.id) || (w.name && m.name === w.name); });
    }) || null;
  }
  function teamIndex(obj){
    var t = obj && obj.members ? obj : findTeamForWorker(obj);
    if (t) {
      var idx = (state().teams || []).findIndex(function(x){ return x.id === t.id; });
      if (idx >= 0) return Math.max(1, Math.min(5, idx + 1));
      return Math.max(1, Math.min(5, numFromText(t.name || t.id || t.masterCodename)));
    }
    return Math.max(1, Math.min(5, numFromText((obj && (obj.teamName || obj.name || obj.id)) || '1')));
  }
  function avatarType(w){
    if (!w) return 'implementer';
    var role = String(w.role || '');
    var label = String((typeof getDisplayRole === 'function' ? getDisplayRole(w) : (w.projectRole || role)) || '');
    var name = String(w.name || '');
    if (w.teamRole === 'leader' || w.isLeader || role === '@explorer-leader') return 'leader-planner';
    if (role === '@fixer' || /实现|开发|建模|修复/.test(label + name)) return 'implementer';
    if (role === '@designer' || /审查|评审|设计|验收|质量/.test(label + name)) return 'reviewer';
    if (role === '@explorer' || /测试|验证/.test(label + name)) return 'implementer';
    return 'implementer';
  }
  function roleOrdinal(w, type){
    var t = findTeamForWorker(w); if (!t || !w || w.teamRole === 'leader') return 0;
    var members = t.members || [];
    var n = 0;
    for (var i=0; i<members.length; i++) {
      var m = members[i];
      if (m === w || (w.id && m.id === w.id) || (w.name && m.name === w.name)) return n;
      if (avatarType(m) === type) n++;
    }
    return 0;
  }
  function avatarIndex(w, type){
    var base = teamIndex(w);
    var ord = roleOrdinal(w, type);
    return ((base - 1 + ord) % 5) + 1;
  }
  function roleDisplay(w){
    if (!w) return '数字员工';
    if (w.teamRole === 'leader' || w.isLeader) return '协同规划岗 · 组长';
    var r = String(w.role || '');
    if (r === '@fixer' || r === '@explorer') return '实现验证岗';
    if (r === '@designer') return '交付审查岗';
    if (r === '@oracle') return '系统架构师 / 技术专家岗';
    return (typeof getDisplayRole === 'function' ? getDisplayRole(w) : (w.projectRole || w.role || '数字员工'));
  }
  function roleBadgeText(w){ return (w && (w.teamRole === 'leader' || w.isLeader)) ? '组长' : '成员'; }
  function roleClass(w){ try { return (typeof getRoleClass === 'function') ? getRoleClass(w.role) : ''; } catch(e){ return ''; } }
  function statusLabel(st){ try { return (typeof getStatusLabel === 'function') ? getStatusLabel(st) : ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线',unclaimed:'待分配'}[st] || st || '未知'); } catch(e){ return ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线',unclaimed:'待分配'}[st] || st || '未知'); } }
  function skillList(w){ try { return (typeof getSkillsForRole === 'function') ? (getSkillsForRole(w.role) || []) : []; } catch(e){ return []; } }
  function skillsCount(w){ return skillList(w).length; }
  function allWorkers(){
    var st = state(), out=[];
    (st.teams || []).forEach(function(t){
      out.push({id:t.masterId, name:t.masterCodename || t.masterId, role:'@explorer', projectRole:'协同规划岗', status:t.masterStatus === 'offline' ? 'offline' : 'busy', teamId:t.id, teamName:t.name, teamRole:'leader', isLeader:true, currentTaskSummary:t.task || '需求澄清 / 任务拆解 / 进度跟踪', session:t.sessionId || ''});
      (t.members || []).forEach(function(m){ out.push(Object.assign({}, m, {teamId:t.id, teamName:t.name, teamRole:'member'})); });
    });
    (st.workers || []).forEach(function(w){ out.push(Object.assign({}, w, {teamRole:w.teamRole || 'pool', teamName:w.teamName || ''})); });
    return out;
  }
  function findWorker(id, name){
    return allWorkers().find(function(w){ return (id && w.id === id) || (name && w.name === name); }) || null;
  }

  window.getLeaderAvatarSrc = function(teamOrWorker){ return asset('pic/avatars/avatar-leader-planner-' + pad2(teamIndex(teamOrWorker)) + '.png'); };
  window.getWorkerAvatarSrc = function(w){
    w = w || {};
    var type = avatarType(w);
    if (type === 'leader-planner') return asset('pic/avatars/avatar-leader-planner-' + pad2(avatarIndex(w, type)) + '.png');
    if (type === 'reviewer') return asset('pic/avatars/avatar-reviewer-' + pad2(avatarIndex(w, type)) + '.png');
    return asset('pic/avatars/avatar-implementer-' + pad2(avatarIndex(w, type)) + '.png');
  };
  window.getLargeWorkerAvatarSrc = function(w){
    w = w || {};
    var type = avatarType(w);
    if (type === 'leader-planner') return asset('pic/avatars/avatar-leader-planner-' + pad2(avatarIndex(w, type)) + '-large.png');
    if (type === 'reviewer') return asset('pic/avatars/avatar-reviewer-' + pad2(avatarIndex(w, type)) + '-large.png');
    return asset('pic/avatars/avatar-implementer-' + pad2(avatarIndex(w, type)) + '-large.png');
  };

  function updateStats(list){
    var set=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('statTotal', list.length);
    set('statOnline', list.filter(function(w){ return w.status !== 'offline'; }).length);
    set('statBusy', list.filter(function(w){ return w.status === 'busy'; }).length);
    var uniq={}; list.forEach(function(w){ skillList(w).forEach(function(s){ uniq[s.id || s.name] = true; }); });
    set('statSkills', Object.keys(uniq).length);
  }
  function teamText(w){ if (!w.teamId) return '共享池 / 未分配'; return (w.teamName || '团队') + ' · ' + ((w.teamRole === 'leader' || w.isLeader) ? '组长' : '成员'); }
  function focusText(w){ return w.currentTaskSummary || ((w.teamRole === 'leader' || w.isLeader) ? '任务协调 / 决策把关 / 里程碑跟踪' : '任务单执行 / 自测回执 / 状态同步'); }
  function card(w){
    var statusDot = ['idle','busy','offline'].indexOf(w.status) >= 0 ? w.status : (w.status === 'unclaimed' ? 'unclaimed' : 'idle');
    var leader = w.teamRole === 'leader' || w.isLeader;
    var focus = focusText(w);
    return '<div class="worker-card worker-card-v14 clickable ' + (w.status === 'offline' ? 'offline' : '') + '" onclick="window.openWorkerDetailV26(\'' + esc(w.id) + '\')">'
      + '<div class="worker-avatar-panel">'
      + '<span class="worker-card-avatar worker-card-avatar-large ' + (leader ? 'leader-avatar-v22' : '') + '"><img src="' + esc(window.getLargeWorkerAvatarSrc(w)) + '" alt="" loading="lazy"><span class="persona-status-dot ' + esc(statusDot) + '"></span></span>'
      + '<span class="worker-status-pill">' + esc(statusLabel(w.status)) + '</span>'
      + '</div>'
      + '<div class="worker-info-panel">'
      + '<div class="worker-title-line"><span class="worker-card-name">' + esc(w.name) + '</span><span class="role-badge ' + esc(roleClass(w)) + '">' + esc(roleBadgeText(w)) + '</span></div>'
      + '<div class="worker-role-line">' + esc(roleDisplay(w)) + '</div>'
      + '<div class="worker-focus-line" title="' + esc(focus) + '">' + esc(focus) + '</div>'
      + '<div class="worker-meta-strip">'
      + '<div class="worker-meta-chip" title="' + esc(teamText(w)) + '">所属 <strong>' + esc(teamText(w)) + '</strong></div>'
      + '<div class="worker-meta-chip">技能 <strong>' + skillsCount(w) + '</strong></div>'
      + '</div>'
      + '</div>'
      + '<div class="card-actions worker-card-actions" onclick="event.stopPropagation();"><button class="icon-btn" title="监控" onclick="event.stopPropagation(); openWorkerMonitor && openWorkerMonitor(\'' + esc(w.id) + '\')">▣</button></div>'
      + '</div>';
  }
  function group(key,title,workers,icon){
    if (!workers.length) return '';
    return '<div class="role-group" id="role-group-' + esc(key) + '"><div class="role-group-header" onclick="toggleRoleGroup && toggleRoleGroup(\'' + esc(key) + '\')"><div style="display:flex;align-items:center;gap:10px;"><span style="font-weight:600;display:flex;align-items:center;gap:6px;">' + (icon || '') + esc(title) + '</span><span class="badge" style="margin:0;background:var(--info);font-size:12px;padding:2px 8px;font-weight:normal;">' + workers.length + ' 个实例</span></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div><div class="role-group-content">' + workers.map(card).join('') + '</div></div>';
  }
  window.renderWorkerPool = function(){
    var container = document.getElementById('workerPoolContainer'); if (!container) return;
    var all = allWorkers(); updateStats(all);
    var keyword = ((document.getElementById('searchWorkerInput') || {}).value || '').toLowerCase();
    var roleFilter = (document.getElementById('roleFilter') || {}).value || 'all';
    var statusFilter = (document.getElementById('statusFilter') || {}).value || 'all';
    var filtered = all.filter(function(w){
      var text = [w.name,w.id,roleDisplay(w),statusLabel(w.status),focusText(w),w.teamName].join(' ').toLowerCase();
      return text.indexOf(keyword) >= 0 && (roleFilter === 'all' || w.role === roleFilter) && (statusFilter === 'all' || w.status === statusFilter);
    });
    var groupBy = (document.querySelector('[data-group-tab].active') || {}).dataset?.groupTab || 'team';
    var out = '';
    if (groupBy === 'status') {
      out += group('status-busy','忙碌 / 执行中', filtered.filter(function(w){return w.status==='busy';}), '🟣');
      out += group('status-idle','在线 / 空闲', filtered.filter(function(w){return w.status==='idle' || w.status==='online';}), '🟢');
      out += group('status-unclaimed','待分配', filtered.filter(function(w){return w.status==='unclaimed';}), '🟡');
      out += group('status-offline','离线', filtered.filter(function(w){return w.status==='offline';}), '⚫');
    } else {
      (state().teams || []).forEach(function(t){ out += group('team-' + t.id, t.name, filtered.filter(function(w){return w.teamId===t.id;}), '<span style="color:var(--info)">◆</span>'); });
      out += group('team-none','共享专家池 / 未分配', filtered.filter(function(w){return !w.teamId;}), '<span style="color:var(--warning)">⊘</span>');
    }
    container.innerHTML = out || '<div class="empty-state">没有找到符合条件的数字员工</div>';
  };
  window.filterWorkers = function(){ window.renderWorkerPool(); };
  window.switchWorkerGroupTab = function(tab){
    document.querySelectorAll('[data-group-tab]').forEach(function(el){ el.classList.toggle('active', el.dataset.groupTab === tab); });
    setTimeout(window.renderWorkerPool, 0);
  };

  window.openWorkerDetailV26 = function(workerId, workerName){
    var w = findWorker(workerId, workerName); if (!w) return;
    var skills = skillList(w);
    var title = document.getElementById('workerDrawerTitle');
    var body = document.getElementById('workerDrawerBody');
    var footer = document.getElementById('workerDrawerFooter');
    if (!title || !body) return;
    var skillChips = skills.length ? skills.map(function(s){ return '<span class="skill-chip-v26">🔧 ' + esc(s.name || s.id) + '</span>'; }).join('') : '<span style="color:#94a3b8;font-size:12px;">暂无岗位 Skill 绑定</span>';
    var skillCards = skills.length ? skills.map(function(s){ return '<div class="skill-desc-card-v26"><div class="skill-desc-title-v26">' + esc(s.name || s.id) + '</div><div class="skill-desc-text-v26">' + esc(s.description || s.content || '') + '</div></div>'; }).join('') : '';
    title.innerHTML = esc(w.name || '-') + '<span class="drawer-title-badge">' + esc(roleDisplay(w)) + '</span>';
    body.innerHTML = ''
      + '<div class="drawer-field"><div class="drawer-field-label">编号</div><div class="drawer-field-value" style="font-family:monospace;">' + esc(w.id || '-') + '</div></div>'
      + '<div class="drawer-field"><div class="drawer-field-label">岗位</div><div class="drawer-field-value"><span class="role-badge ' + esc(roleClass(w)) + '">' + esc(roleDisplay(w)) + '</span></div></div>'
      + '<div class="drawer-field"><div class="drawer-field-label">当前状态</div><div class="drawer-field-value">' + esc(statusLabel(w.status)) + '</div></div>'
      + '<div class="drawer-field"><div class="drawer-field-label">归属团队</div><div class="drawer-field-value">' + esc(teamText(w)) + '</div></div>'
      + '<div class="drawer-field"><div class="drawer-field-label">状态摘要</div><div class="drawer-field-value">' + esc(focusText(w)) + '</div></div>'
      + '<div class="drawer-field"><div class="drawer-field-label">Skill 名称</div><div class="drawer-field-value"><div class="skill-chip-list-v26">' + skillChips + '</div></div></div>'
      + '<div class="drawer-field"><div class="drawer-field-label">Skill 说明</div><div class="drawer-field-value"><div class="skill-desc-list-v26">' + skillCards + '</div></div></div>';
    if (footer) footer.innerHTML = '<button type="button" class="drawer-action-btn secondary" onclick="closeDrawer && closeDrawer()">关闭</button>' + (w.teamId ? '<button type="button" class="drawer-action-btn primary" onclick="closeDrawer && closeDrawer(); openTeamTab && openTeamTab(\'' + esc(w.teamId) + '\')">查看团队</button>' : '');
    var ov = document.getElementById('workerDrawerOverlay'), pn = document.getElementById('workerDrawerPanel');
    if (ov) ov.classList.add('open');
    if (pn) pn.classList.add('open');
  };
  window.openDrawer = window.openWorkerDetailV26;

  function refresh(){
    try { if (typeof renderTopology === 'function') renderTopology(); } catch(e) {}
    try { if (document.getElementById('page-pool') && document.getElementById('page-pool').classList.contains('active')) window.renderWorkerPool(); } catch(e) {}
  }
  var oldSwitchNav = window.switchNav;
  if (typeof oldSwitchNav === 'function' && !oldSwitchNav.__avatarStep2Wrapped) {
    var wrapped = function(){ var ret = oldSwitchNav.apply(this, arguments); if (arguments[0] === 'pool') setTimeout(window.renderWorkerPool, 60); else if (arguments[0] === 'overview') setTimeout(refresh, 60); return ret; };
    wrapped.__avatarStep2Wrapped = true;
    window.switchNav = wrapped;
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(refresh, 220); });
  setTimeout(refresh, 360);
})();


;


(function(){
  if (window.__v06330OverviewStabilityApplied) return;
  window.__v06330OverviewStabilityApplied = true;

  function hideRuntimeSectionLabel(){
    document.querySelectorAll('.sidebar-section-label').forEach(function(el){
      var txt = (el.textContent || '').trim();
      if (txt === '运行态') {
        el.textContent = '';
        el.setAttribute('data-v06330-hide-runtime', '1');
      }
    });
  }

  function stopLegacyOverviewRewrite(){
    ['enhanceOverviewMeta','enhanceTopologyCards','enhanceOverviewCards','fixOverviewMeta','normalizeTopologyBusyCopy'].forEach(function(name){
      if (typeof window[name] === 'function' && !window[name].__v06330Disabled) {
        var noop = function(){ return undefined; };
        noop.__v06330Disabled = true;
        window[name] = noop;
      }
    });
  }

  function cleanBusyCopyInTopology(){
    var root = document.getElementById('topologyHtml');
    if (!root) return;
    root.querySelectorAll('.topo-worker, .leader-member-mini').forEach(function(el){
      var text = el.textContent || '';
      if (!/忙碌/.test(text)) return;
      el.querySelectorAll('span, div').forEach(function(node){
        var t = (node.textContent || '').trim();
        var n = t
          .replace(/\s*[·｜|]\s*(执行中|需关注|需要处理|共享|自动处理)\s*$/g, '')
          .replace(/^(执行中|需关注|需要处理)\s*[·｜|]\s*/g, '');
        if (n !== t && /忙碌/.test(n)) node.textContent = n;
      });
    });
  }

  function run(){
    hideRuntimeSectionLabel();
    stopLegacyOverviewRewrite();
    cleanBusyCopyInTopology();
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06330Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06330Wrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','refreshAllViews','switchNav'].forEach(wrap);
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });
  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06330StabilityTimer);
      window.__v06330StabilityTimer = setTimeout(run, 80);
    }).observe(document.body, {childList:true, subtree:true, characterData:true});
  } catch(e) {}
  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06331OverviewCalmApplied) return;
  window.__v06331OverviewCalmApplied = true;

  function hideRuntimeSectionLabel(){
    document.querySelectorAll('.sidebar-section-label').forEach(function(el){
      var txt = (el.textContent || '').trim();
      if (txt === '运行态') {
        el.textContent = '';
        el.setAttribute('data-v06331-hide-runtime', '1');
      }
    });
  }

  function disableKnownLegacyRewriters(){
    /*
      只禁用会在协作全景渲染后继续二次改写结构/文案的遗留增强函数。
      不覆盖 renderTopology，不重建 DOM，不替换 .topo-card-meta。
    */
    [
      'enhanceOverviewMeta',
      'enhanceTopologyCards',
      'enhanceOverviewCards',
      'fixOverviewMeta',
      'normalizeTopologyBusyCopy'
    ].forEach(function(name){
      if (typeof window[name] === 'function' && !window[name].__v06331Disabled) {
        var noop = function(){ return undefined; };
        noop.__v06331Disabled = true;
        window[name] = noop;
      }
    });
  }

  function cleanRuntimeNoise(){
    var root = document.getElementById('topologyHtml');
    if (!root) return;
    root.querySelectorAll('.topo-worker, .leader-member-mini').forEach(function(el){
      if (!/忙碌/.test(el.textContent || '')) return;
      el.querySelectorAll('span, div').forEach(function(node){
        var t = (node.textContent || '').trim();
        var n = t
          .replace(/\s*[·｜|]\s*(执行中|需关注|需要处理|共享|自动处理)\s*$/g, '')
          .replace(/^(执行中|需关注|需要处理)\s*[·｜|]\s*/g, '');
        if (n !== t && /忙碌/.test(n)) node.textContent = n;
      });
    });
  }

  function stabilizeOverview(){
    hideRuntimeSectionLabel();
    disableKnownLegacyRewriters();
    cleanRuntimeNoise();
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06331Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(stabilizeOverview, 0);
        return ret;
      };
      wrapped.__v06331Wrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','refreshAllViews','switchNav'].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(stabilizeOverview, 0);
    setTimeout(stabilizeOverview, 300);
    setTimeout(stabilizeOverview, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06331CalmTimer);
      window.__v06331CalmTimer = setTimeout(stabilizeOverview, 80);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(stabilizeOverview, 300);
})();


;


(function(){
  if (window.__v06332CollabCopyApplied) return;
  window.__v06332CollabCopyApplied = true;

  function normalizeButtons(root){
    root = root || document;
    root.querySelectorAll('button, .btn, .topo-node-action, .leader-chat-btn').forEach(function(el){
      var txt = (el.textContent || '').replace(/\s+/g,'').trim();
      var title = el.getAttribute && (el.getAttribute('title') || '');
      var shouldChange =
        txt === '对话' ||
        txt === '💬对话' ||
        txt === '协作' ||
        txt === '💬协作' ||
        txt === '与Leader对话' ||
        /发起团队协作|发起对话|协作|协作/.test(title);

      if (!shouldChange) return;

      if (el.querySelectorAll) {
        var spans = el.querySelectorAll('span');
        if (spans.length >= 2) {
          spans[spans.length - 1].textContent = '协作';
        } else if (spans.length === 1 && /对话/.test(spans[0].textContent || '')) {
          spans[0].textContent = '协作';
        } else {
          el.textContent = '协作';
        }
      } else {
        el.textContent = '协作';
      }
      el.setAttribute('title', '发起团队协作');
      el.classList.add('v06332-collab-entry');
    });
  }

  function normalizeHeaderBadge(){
    var badge = document.querySelector('.app-header-badge');
    if (!badge) return;
    if (!/Mock 演示/.test(badge.textContent || '')) {
      badge.textContent = 'v0.6.33.45 · Mock 演示';
    }
    badge.setAttribute('data-v06332-mock','1');
    badge.setAttribute('title','当前为原型 Mock 演示，未接真实后端运行时');
  }

  function addXiaoyunHint(){
    if (document.querySelector('.xiaoyun-global-hint-v06332')) return;
    var trigger = document.querySelector('.chat-trigger, #chatTrigger, .fab-menu, .fab-bot');
    if (!trigger) return;
    var hint = document.createElement('div');
    hint.className = 'xiaoyun-global-hint-v06332';
    hint.textContent = '小云是全局助手；团队协作请进入组长协作入口';
    document.body.appendChild(hint);
    setTimeout(function(){ hint.style.display = 'none'; }, 7000);
  }

  function run(){
    normalizeButtons(document);
    normalizeHeaderBadge();
    addXiaoyunHint();
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06332Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06332Wrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','renderTeamDetail','renderTeams','switchNav','switchTab','refreshAllViews'].forEach(wrap);
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06332CopyTimer);
      window.__v06332CopyTimer = setTimeout(run, 80);
    }).observe(document.body, {childList:true, subtree:true, characterData:true});
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06333DecisionCopySummaryApplied) return;
  window.__v06333DecisionCopySummaryApplied = true;

  function normalizeDecisionCopy(root){
    root = root || document.body;
    if (!root) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','TEXTAREA','INPUT'].indexOf(p.tagName) >= 0) {
          return NodeFilter.FILTER_REJECT;
        }
        return /待决策|待决策|暂无待决策|无待决策/.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var s = node.nodeValue || '';
      var n = s
        .replace(/暂无待决策/g, '暂无待决策')
        .replace(/无待决策/g, '暂无待决策')
        .replace(/待决策/g, '待决策')
        .replace(/待决策/g, '待决策');
      if (n !== s) node.nodeValue = n;
    });
  }

  function hideOverviewSummary(){
    var root = document.getElementById('topologyHtml');
    if (!root) return;
    root.querySelectorAll('.topo-card-summary').forEach(function(el){
      el.style.display = 'none';
      el.setAttribute('data-v06333-hidden', '1');
    });
  }

  function run(){
    normalizeDecisionCopy(document.body);
    hideOverviewSummary();
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06333Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06333Wrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','renderTeams','renderTeamDetail','renderDecisions','renderDecisionDetail','switchNav','switchTab','refreshAllViews'].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06333Timer);
      window.__v06333Timer = setTimeout(run, 80);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06334OnlineDotCleanApplied) return;
  window.__v06334OnlineDotCleanApplied = true;

  function cleanOnlineLeadingDots(root){
    root = root || document;

    // Remove text-leading symbols like "● 在线" / "• 在线" / "🟢 在线".
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','TEXTAREA','INPUT'].indexOf(p.tagName) >= 0) return NodeFilter.FILTER_REJECT;
        return /^[\s●•·∙⬤🟢]+\s*(在线|空闲)\b/.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      node.nodeValue = (node.nodeValue || '').replace(/^[\s●•·∙⬤🟢]+\s*(在线|空闲)\b/, '$1');
    });

    // Remove standalone dot spans immediately before text "在线/空闲".
    root.querySelectorAll('.status-dot, .topo-summary-dot').forEach(function(dot){
      var parent = dot.parentElement;
      if (!parent) return;
      var txt = (parent.textContent || '').trim();
      if (/^(在线|空闲)$/.test(txt) || /^(在线|空闲)\s/.test(txt)) {
        dot.style.display = 'none';
        dot.setAttribute('data-v06334-hidden-online-dot', '1');
      }
    });
  }

  function run(){ cleanOnlineLeadingDots(document.body); }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06334Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06334Wrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','renderTeams','renderWorkerPool','renderTeamDetail','switchNav','switchTab','refreshAllViews'].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06334Timer);
      window.__v06334Timer = setTimeout(run, 80);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06335RulesFreezeApplied) return;
  window.__v06335RulesFreezeApplied = true;

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function hideRuntimeSectionLabel(){
    document.querySelectorAll('.sidebar-section-label').forEach(function(el){
      if ((el.textContent || '').trim() === '运行态') {
        el.textContent = '';
        el.setAttribute('data-v06335-hide-runtime', '1');
      }
    });
  }

  function normalizeVisibleCopy(root){
    root = root || document.body;
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','TEXTAREA','INPUT'].indexOf(p.tagName) >= 0) return NodeFilter.FILTER_REJECT;
        return /(团队消耗|员工消耗|需介入|需要介入|暂无需介入|无需介入|对话组长|与 Leader 对话|对话)/.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var s = node.nodeValue || '';
      var n = s
        .replace(/团队消耗/g, '团队')
        .replace(/员工消耗/g, '员工')
        .replace(/暂无需介入/g, '暂无待决策')
        .replace(/无需介入/g, '暂无待决策')
        .replace(/需要介入/g, '待决策')
        .replace(/需介入/g, '待决策')
        .replace(/与 Leader 对话/g, '协作')
        .replace(/对话组长/g, '协作');

      // 只改按钮/入口语境里的“对话”，避免误伤聊天正文说明。
      var parentText = node.parentElement ? textOf(node.parentElement) : '';
      if (/^(💬)?\s*对话$/.test(s.trim()) || /对话组长|与 Leader 对话/.test(parentText)) {
        n = n.replace(/对话/g, '协作');
      }
      if (n !== s) node.nodeValue = n;
    });
  }

  function normalizeCollabButtons(root){
    root = root || document;
    root.querySelectorAll('button, .btn, .topo-node-action, .leader-chat-btn').forEach(function(el){
      var compact = textOf(el).replace(/\s+/g, '');
      var title = el.getAttribute && (el.getAttribute('title') || '');
      var should =
        compact === '对话' ||
        compact === '💬对话' ||
        compact === '对话组长' ||
        compact === '💬对话组长' ||
        compact === '与Leader对话' ||
        /直接联系组长|发起对话|对话组长|与 Leader 对话/.test(title);

      if (!should) return;
      var spans = el.querySelectorAll ? el.querySelectorAll('span') : [];
      if (spans.length >= 2) spans[spans.length - 1].textContent = '协作';
      else if (spans.length === 1) spans[0].textContent = '协作';
      else el.textContent = '协作';
      el.setAttribute('title', '发起团队协作');
      el.classList.add('v06335-collab-entry');
    });
  }

  function hideOverviewBottomSummary(){
    var root = document.getElementById('topologyHtml');
    if (!root) return;
    root.querySelectorAll('.topo-card-summary').forEach(function(el){
      el.style.display = 'none';
      el.setAttribute('data-v06335-hidden-summary', '1');
    });
  }

  function cleanOnlineLeadingDots(){
    var root = document.getElementById('topologyHtml') || document;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','TEXTAREA','INPUT'].indexOf(p.tagName) >= 0) return NodeFilter.FILTER_REJECT;
        return /^[\s●•·∙⬤🟢]+\s*(在线|空闲)\b/.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      node.nodeValue = (node.nodeValue || '').replace(/^[\s●•·∙⬤🟢]+\s*(在线|空闲)\b/, '$1');
    });

    root.querySelectorAll('.status-dot, .topo-summary-dot').forEach(function(dot){
      var parent = dot.parentElement;
      if (!parent) return;
      var txt = textOf(parent);
      if (/^(在线|空闲)(\s|$)/.test(txt)) {
        dot.style.display = 'none';
        dot.setAttribute('data-v06335-hidden-online-dot', '1');
      }
    });
  }

  function removeArchitectFromManagementOne(){
    /*
      管理1 中先下架架构专家：隐藏 AGT/架构专家卡片与专家 meta 文案。
      只处理展示，不删除图片资源。
    */
    var root = document.getElementById('topologyHtml') || document;

    root.querySelectorAll('.topo-team-card').forEach(function(card){
      var txt = textOf(card);
      var isManagementOne = /管理1|研发一组|HR 代码迁移|管理 1/.test(txt);
      if (!isManagementOne) return;

      // Hide architect/expert member chips/cards inside Management 1 only.
      card.querySelectorAll('.topo-worker, .leader-member-mini, .role-pill, .topo-card-meta span').forEach(function(el){
        var t = textOf(el);
        if (/架构|专家|系统架构师|技术专家/.test(t)) {
          el.setAttribute('data-v06335-architect-hidden', '1');
        }
      });

      // Remove expert wording from title/summary text nodes.
      card.querySelectorAll('*').forEach(function(el){
        if (el.children.length) return;
        var t = el.textContent || '';
        var n = t
          .replace(/专家支持[：:]\s*[^｜|·\n\r]+/g, '')
          .replace(/专家[：:]\s*[^｜|·\n\r]+/g, '')
          .replace(/系统架构师\s*\/\s*技术专家岗/g, '')
          .replace(/系统架构师|技术专家|架构专家/g, '');
        if (n !== t) el.textContent = n.trim();
      });
    });
  }

  function hideArchitectRoleInRolesPage(){
    var page = document.getElementById('page-roles') || document;
    page.querySelectorAll('.card, .role-template-card, tr, .table-row, .role-card, [data-role], [data-template]').forEach(function(el){
      var t = textOf(el);
      if (/系统架构师|技术专家岗|架构专家|@oracle/.test(t)) {
        el.setAttribute('data-v06335-architect-hidden', '1');
      }
    });

    // Also remove architect option in filters/dropdowns if visible.
    page.querySelectorAll('option').forEach(function(opt){
      if (/系统架构师|技术专家|架构专家|@oracle/.test(textOf(opt))) {
        opt.setAttribute('data-v06335-architect-hidden', '1');
        opt.disabled = true;
        opt.hidden = true;
      }
    });
  }

  function normalizeHeaderCards(){
    document.querySelectorAll('.stat-card-title, .stat-card-desc, .stat-card-trend').forEach(function(el){
      var s = el.textContent || '';
      var n = s.replace(/团队消耗/g, '团队').replace(/员工消耗/g, '员工');
      if (n !== s) el.textContent = n;
    });
  }

  function run(){
    hideRuntimeSectionLabel();
    normalizeHeaderCards();
    normalizeVisibleCopy(document.body);
    normalizeCollabButtons(document);
    hideOverviewBottomSummary();
    cleanOnlineLeadingDots();
    removeArchitectFromManagementOne();
    hideArchitectRoleInRolesPage();
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06335Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06335Wrapped = true;
      window[name] = wrapped;
    }
  }

  [
    'renderOverview','renderTopology','renderTeams','renderTeamDetail',
    'renderWorkerPool','renderRoles','renderRoleTemplates','renderDecisions',
    'renderDecisionDetail','switchNav','switchTab','refreshAllViews'
  ].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06335Timer);
      window.__v06335Timer = setTimeout(run, 80);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06336OnlineInlineDotFixApplied) return;
  window.__v06336OnlineInlineDotFixApplied = true;

  function isAvatarStatusDot(el){
    return !!(el && el.classList && el.classList.contains('persona-status-dot'));
  }

  function looksLikeSmallGreenDot(el){
    if (!el || isAvatarStatusDot(el)) return false;
    var cs = getComputedStyle(el);
    var r = el.getBoundingClientRect();
    var bg = cs.backgroundColor || '';
    var cls = (el.className || '').toString();
    var isSmall = r.width > 0 && r.width <= 14 && r.height > 0 && r.height <= 14;
    var isRound = cs.borderRadius && cs.borderRadius !== '0px';
    var isGreen = /rgb\(\s*(16|22|34|52|60),\s*(185|197|211|199),\s*(129|94|102|89)\s*\)/.test(bg) || /green|success|online|idle|dot/.test(cls);
    return isSmall && isRound && isGreen;
  }

  function cleanTextLeadingDots(root){
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','TEXTAREA','INPUT'].indexOf(p.tagName) >= 0) return NodeFilter.FILTER_REJECT;
        return /^[\s●•·∙⬤🟢]+\s*(在线|空闲)\b/.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      node.nodeValue = (node.nodeValue || '').replace(/^[\s●•·∙⬤🟢]+\s*(在线|空闲)\b/, '$1');
    });
  }

  function cleanInlineElements(){
    var root = document.querySelector('#page-overview #topologyHtml');
    if (!root) return;

    cleanTextLeadingDots(root);

    root.querySelectorAll('.topo-worker').forEach(function(worker){
      // Look for the line containing "在线/空闲".
      var text = (worker.textContent || '').replace(/\s+/g, ' ').trim();
      if (!/(在线|空闲)/.test(text)) return;

      worker.querySelectorAll('span,i,em,b').forEach(function(el){
        if (isAvatarStatusDot(el)) return;

        var parentText = (el.parentElement && el.parentElement.textContent || '').replace(/\s+/g, ' ').trim();
        var selfText = (el.textContent || '').trim();

        // Hide explicit dot elements before online/idle text.
        if (
          looksLikeSmallGreenDot(el) &&
          /(在线|空闲)/.test(parentText) &&
          !/忙碌|离线/.test(parentText)
        ) {
          el.setAttribute('data-v06336-inline-online-dot', '1');
          el.style.display = 'none';
        }

        // If the element itself only contains a dot symbol.
        if (/^[●•·∙⬤🟢]$/.test(selfText) && /(在线|空闲)/.test(parentText)) {
          el.setAttribute('data-v06336-inline-online-dot', '1');
          el.style.display = 'none';
        }
      });
    });
  }

  function run(){ cleanInlineElements(); }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06336Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06336Wrapped = true;
      window[name] = wrapped;
    }
  }

  [
    'renderOverview','renderTopology','renderTeams','renderTeamDetail',
    'switchNav','switchTab','refreshAllViews'
  ].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06336Timer);
      window.__v06336Timer = setTimeout(run, 80);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06337DecisionPrefixCleanApplied) return;
  window.__v06337DecisionPrefixCleanApplied = true;

  function cleanDecisionPrefix(root){
    root = root || document.body;
    if (!root) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','TEXTAREA','INPUT'].indexOf(p.tagName) >= 0) return NodeFilter.FILTER_REJECT;
        return /决策\s*\d+\s*[：:]/.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var s = node.nodeValue || '';
      var n = s.replace(/决策\s*\d+\s*[：:]\s*/g, '');
      if (n !== s) node.nodeValue = n;
    });
  }

  function run(){
    cleanDecisionPrefix(document.body);
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06337Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06337Wrapped = true;
      window[name] = wrapped;
    }
  }

  [
    'renderOverview','renderTopology','renderDecisions','renderDecisionDetail',
    'renderTeams','renderTeamDetail','switchNav','switchTab','refreshAllViews'
  ].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06337Timer);
      window.__v06337Timer = setTimeout(run, 80);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06338DemoEntryHeaderApplied) return;
  window.__v06338DemoEntryHeaderApplied = true;

  function normalizeDemoButtonText(btn){
    if (!btn) return;
    var txt = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (!txt || /启动 P0a 演示|启动演示|P0a 演示/.test(txt)) {
      btn.textContent = '▶ P0a 演示';
    }
    btn.title = '启动 P0a 演示';
    btn.classList.add('v06338-header-demo-entry');
    btn.classList.remove('btn-primary');
    btn.removeAttribute('style');
  }

  function moveDemoButton(){
    var header = document.querySelector('.app-header');
    var mockSelect = document.getElementById('mockScenarioSelect');
    if (!header || !mockSelect) return;

    var btn = document.getElementById('p0aAutoDemoBtn');

    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'p0aAutoDemoBtn';
      btn.type = 'button';
      btn.onclick = function(){
        if (typeof window.startP0aDemo === 'function') return window.startP0aDemo();
        if (typeof window.toggleP0aDemo === 'function') return window.toggleP0aDemo();
        if (typeof window.runP0aDemo === 'function') return window.runP0aDemo();
      };
    }

    normalizeDemoButtonText(btn);

    if (btn.parentElement !== header || btn.nextElementSibling !== mockSelect) {
      header.insertBefore(btn, mockSelect);
    }

    // Hide any duplicated visual placeholder if older layout left one behind.
    document.querySelectorAll('button').forEach(function(other){
      if (other === btn) return;
      var t = (other.textContent || '').replace(/\s+/g, ' ').trim();
      if (/启动 P0a 演示|启动演示|P0a 演示/.test(t) && other.id !== 'p0aAutoDemoBtn') {
        other.classList.add('v06338-demo-entry-placeholder');
        other.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function run(){
    moveDemoButton();
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06338Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06338Wrapped = true;
      window[name] = wrapped;
    }
  }

  [
    'renderOverview','renderTopology','switchNav','switchTab',
    'refreshAllViews','renderRunner'
  ].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06338Timer);
      window.__v06338Timer = setTimeout(run, 120);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v06339OnlineDotMarkerApplied) return;
  window.__v06339OnlineDotMarkerApplied = true;

  function compactText(el){
    return (el && el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function isAvatarDot(el){
    return el && el.classList && el.classList.contains('persona-status-dot');
  }

  function markOnlineLines(){
    var root = document.querySelector('#page-overview #topologyHtml');
    if (!root) return;

    root.querySelectorAll('.topo-worker').forEach(function(worker){
      worker.querySelectorAll('span, div, i, em, b').forEach(function(el){
        if (isAvatarDot(el)) return;
        var t = compactText(el);
        if (/^在线(\s|$)/.test(t) || /^空闲(\s|$)/.test(t) || /在线\s+可接任务/.test(t)) {
          el.setAttribute('data-v06339-online-line', '1');
        }
      });

      // Hide small dot elements in the same worker text area, but never avatar status dot.
      worker.querySelectorAll('span, i, em, b').forEach(function(el){
        if (isAvatarDot(el)) return;
        var self = compactText(el);
        var parentText = compactText(el.parentElement);
        var cls = (el.className || '').toString();
        var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : {width:0,height:0};
        var style = window.getComputedStyle ? getComputedStyle(el) : null;
        var isSmall = rect.width > 0 && rect.width <= 14 && rect.height > 0 && rect.height <= 14;
        var isDotText = /^[●•·∙⬤🟢]$/.test(self);
        var looksDotClass = /dot|online|idle|status/.test(cls);
        var isRound = style && style.borderRadius && style.borderRadius !== '0px';
        if ((isDotText || (isSmall && isRound && looksDotClass)) && /(在线|空闲)/.test(parentText) && !/忙碌|离线/.test(parentText)) {
          el.setAttribute('data-v06339-online-dot', '1');
        }
      });
    });
  }

  function run(){ markOnlineLines(); }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v06339Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(run, 0);
        return ret;
      };
      wrapped.__v06339Wrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','switchNav','switchTab','refreshAllViews'].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v06339Timer);
      window.__v06339Timer = setTimeout(run, 80);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}

  setTimeout(run, 300);
})();


;


(function(){
  if (window.__v063310SummarySafeApplied) return;
  window.__v063310SummarySafeApplied = true;

  function removeSummaryOnly(){
    var root = document.getElementById('topologyHtml');
    if (!root) return;
    root.querySelectorAll('.topo-card-summary').forEach(function(el){
      el.remove();
    });
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v063310SafeWrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(removeSummaryOnly, 0);
        return ret;
      };
      wrapped.__v063310SafeWrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','switchNav','switchTab','refreshAllViews'].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(removeSummaryOnly, 0);
    setTimeout(removeSummaryOnly, 100);
    setTimeout(removeSummaryOnly, 500);
    setTimeout(removeSummaryOnly, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v063310SummarySafeTimer);
      window.__v063310SummarySafeTimer = setTimeout(removeSummaryOnly, 30);
    }).observe(document.body, { childList: true, subtree: true });
  } catch(e) {}

  setTimeout(removeSummaryOnly, 300);
})();


;


(function(){
  if (window.__v063312RolePillCleanApplied) return;
  window.__v063312RolePillCleanApplied = true;

  function textOf(el){
    return (el && el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function cleanRolePillsOnly(){
    var root = document.getElementById('topologyHtml');
    if (!root) return;

    root.querySelectorAll('.topo-card-meta').forEach(function(meta){
      var txt = textOf(meta);
      var isMainFocus =
        /待决策|进行中|处理\s*→|待确认|当前任务|任务/.test(txt) ||
        !!meta.querySelector('.team-run-summary-v21, .v06323-focus-card');

      // 主关注条要保留，不动容器。
      // 如果容器内混入旧 role-pill，只移除 role-pill 子元素。
      meta.querySelectorAll('.role-pill').forEach(function(el){
        el.remove();
      });

      // 仅当完全空了，让 CSS :empty 折叠即可，不删除 meta，避免后续脚本找不到挂载点。
    });
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn === 'function' && !fn.__v063312Wrapped) {
      var wrapped = function(){
        var ret = fn.apply(this, arguments);
        setTimeout(cleanRolePillsOnly, 0);
        return ret;
      };
      wrapped.__v063312Wrapped = true;
      window[name] = wrapped;
    }
  }

  ['renderOverview','renderTopology','switchNav','switchTab','refreshAllViews'].forEach(wrap);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(cleanRolePillsOnly, 0);
    setTimeout(cleanRolePillsOnly, 100);
    setTimeout(cleanRolePillsOnly, 500);
    setTimeout(cleanRolePillsOnly, 1200);
  });

  try {
    new MutationObserver(function(){
      clearTimeout(window.__v063312RolePillTimer);
      window.__v063312RolePillTimer = setTimeout(cleanRolePillsOnly, 30);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch(e) {}
})();


;


(function(){
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVersion);
  setTimeout(setVersion, 80);
})();


;


(function(){
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVersion);
  setTimeout(setVersion, 80);
})();


;


(function(){
  if (window.__v063317StatCardsApplied) return;
  window.__v063317StatCardsApplied = true;
  var rendering = false;
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function state(){ return (typeof currentState !== 'undefined' ? currentState : (window.currentState || {})); }
  function teams(){ return state().teams || []; }
  function allWorkers(){
    var arr=[];
    teams().forEach(function(t){
      if(t.leaderId || t.masterId || t.masterCodename){ arr.push({teamId:t.id, teamRole:'leader', status:t.masterStatus || 'busy', opsMetrics:t.leaderOpsMetrics || t.opsMetrics || {}}); }
      (t.members || []).forEach(function(m){ arr.push(m); });
    });
    var standalone = state().workers || [];
    if (standalone.length > arr.length) return standalone;
    return arr;
  }
  function tokenTotal(list){ return list.reduce(function(n,x){ return n + Number(((x.opsMetrics||{}).tokens)||0); },0); }
  function sessionTotal(list){ return list.reduce(function(n,x){ return n + Number(((x.opsMetrics||{}).sessions)||0); },0); }
  function fmtToken(n){
    n = Number(n || 0);
    if (n >= 1000000000) return (n/1000000000).toFixed(1).replace(/\.0$/,'') + 'G';
    if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,'') + 'M';
    if (n >= 1000) return (n/1000).toFixed(1).replace(/\.0$/,'') + 'K';
    return String(Math.round(n));
  }
  function activeOrders(){
    var active = new Set(['assigned','running','submitted','reviewing','rework_required','blocked']);
    var n = 0;
    teams().forEach(function(t){ ((t.currentProject||{}).workOrders || []).forEach(function(w){ if(active.has(w.status)) n++; }); });
    return n || 14;
  }
  function pausedOrders(){
    var n = 0;
    teams().forEach(function(t){ ((t.currentProject||{}).workOrders || []).forEach(function(w){ if(w.status === 'blocked') n++; }); });
    return n || 1;
  }
  function pending(){
    var decisions = 0, reviews = 0, urgent = 0;
    try { decisions = (state().decisions || []).filter(function(d){ return !d.status || d.status === 'pending'; }).length; } catch(e) {}
    teams().forEach(function(t){
      reviews += Number(t.pendingReviews || (((t.currentProject||{}).acceptanceQueue || []).length) || 0);
      decisions += Number(t.pendingDecisions || 0);
    });
    try { urgent = (state().decisions || []).filter(function(d){ return (!d.status || d.status === 'pending') && d.urgent; }).length; } catch(e) {}
    return { decisions: decisions || 4, reviews: reviews || 10, urgent: urgent || 1 };
  }
  function ensureFoot(card){
    var extra = card.querySelector('.stat-card-extra'); if(extra) extra.remove();
    var foot = card.querySelector('.stat-card-foot');
    if(!foot){ foot = document.createElement('div'); foot.className = 'stat-card-foot'; card.appendChild(foot); }
    return foot;
  }
  function setCard(counter, title, value, desc, trend, footItems, click, tip){
    var card = counter && counter.closest('.stat-card');
    if(!card) return;
    card.classList.add('v063317-stat-card','clickable');
    var titleEl = card.querySelector('.stat-card-title');
    var descEl = card.querySelector('.stat-card-desc');
    var trendEl = card.querySelector('.stat-card-trend');
    if(titleEl) titleEl.textContent = title;
    counter.textContent = value;
    if(descEl) descEl.textContent = desc;
    if(trendEl){ trendEl.textContent = trend || ''; trendEl.classList.remove('up','down'); trendEl.classList.add('flat'); }
    ensureFoot(card).innerHTML = (footItems || []).map(function(x){ return '<span class="stat-card-mini">'+esc(x)+'</span>'; }).join('');
    card.onclick = click;
    card.title = tip || '';
  }
  function apply(){
    if(rendering) return;
    var page = document.getElementById('page-overview');
    if(!page) return;
    var c1 = document.getElementById('statTeamCount');
    var c2 = document.getElementById('statMasterCount');
    var c3 = document.getElementById('statWorkerCount');
    var c4 = document.getElementById('statDecisionCount');
    if(!c1 || !c2 || !c3 || !c4) return;
    rendering = true;
    try {
      var ts = teams();
      var workers = allWorkers();
      var leaders = ts.length || 5;
      var memberCount = ts.reduce(function(n,t){ return n + ((t.members || []).length); },0) || 17;
      var projectCount = ts.filter(function(t){ return !!t.currentProject; }).length || ts.length || 5;
      var online = workers.filter(function(w){ return w.status !== 'offline'; }).length || 24;
      var offline = Math.max(0, workers.length - online) || 1;
      var busy = workers.filter(function(w){ return w.status === 'busy'; }).length || 14;
      var tt = tokenTotal(ts);
      var wt = tokenTotal(workers);
      var ws = sessionTotal(workers);
      var act = activeOrders();
      var paused = pausedOrders();
      var pd = pending();
      setCard(c1, '🏢 协作团队', ts.length || 5, (ts.length || 5) + ' 个项目团队运行中', '消耗排行 →', ['组长 ' + leaders, '成员 ' + memberCount, '项目 ' + projectCount], function(){ if(window.openOpsDrawer) window.openOpsDrawer('teams'); }, '点击查看团队 Token 与会话排行');
      setCard(c2, '👥 数字员工', workers.length || 25, online + ' 在线 · ' + offline + ' 离线', '员工排行 →', ['忙碌 ' + busy, 'Token ' + fmtToken(wt || tt || 1100000000), '会话 ' + (ws || 1282)], function(){ if(window.openOpsDrawer) window.openOpsDrawer('workers'); }, '点击查看员工 Token 与会话排行');
      setCard(c3, '⚡ 任务执行', act, '任务单执行、审查、整改中', '查看任务 →', ['执行中 ' + act, '暂停 ' + paused, '今日流转 ' + Math.max(0, act - paused)], function(){ if(window.openTaskOpsDrawer) window.openTaskOpsDrawer(); }, '点击查看执行中任务');
      setCard(c4, '⚠️ 待决策', pd.decisions + pd.reviews, pd.decisions + ' 待决策 · ' + pd.reviews + ' 待审查', '处理决策 →', ['待决策 ' + pd.decisions, '待审查 ' + pd.reviews, '高风险 ' + pd.urgent], function(){ if(window.openPendingOpsDrawer) window.openPendingOpsDrawer(); }, '点击查看待决策与待审查');
      c4.closest('.stat-card').classList.add('accent-red');
      document.querySelectorAll('#page-overview .stat-card-extra').forEach(function(x){ x.remove(); });
    } finally { rendering = false; }
  }
  function wrap(name){
    var fn = window[name];
    if(typeof fn === 'function' && !fn.__v063317Wrapped){
      var wrapped = function(){ var ret = fn.apply(this, arguments); apply(); setTimeout(apply, 0); setTimeout(apply, 80); return ret; };
      wrapped.__v063317Wrapped = true;
      window[name] = wrapped;
    }
  }
  ['renderOverview','renderAll','refreshAllViews','switchNav'].forEach(wrap);
  function boot(){ apply(); setTimeout(apply, 0); setTimeout(apply, 60); setTimeout(apply, 180); setTimeout(apply, 500); setTimeout(apply, 1200); setTimeout(apply, 1800); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  try {
    new MutationObserver(function(){ if(rendering) return; clearTimeout(window.__v063317StatCardTimer); window.__v063317StatCardTimer = setTimeout(apply, 20); }).observe(document.body, {childList:true, subtree:true, characterData:true});
  } catch(e) {}
  /* v0.6.33.45: disabled repeated stat-card polling to avoid visual jitter */
})();


;


(function(){
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVersion); else setVersion();
  setTimeout(setVersion, 80);
})();


;


(function(){
  if (window.__v063319DecisionWorkbenchApplied) return;
  window.__v063319DecisionWorkbenchApplied = true;
  var building = false;
  function esc(s){ try { return (typeof escapeHTML === 'function' ? escapeHTML(s == null ? '' : String(s)) : String(s == null ? '' : s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];})); } catch(e){ return String(s || ''); } }
  function st(){ return (typeof currentState !== 'undefined' ? currentState : (window.currentState || {})); }
  function teamName(teamId){ var t=(st().teams||[]).find(function(x){return x.id===teamId;}); return t ? t.name : (teamId === 'unassigned' ? '未分配' : (teamId || '-')); }
  function teamObj(teamId){ return (st().teams||[]).find(function(x){return x.id===teamId;}); }
  function projectName(d){ var t=teamObj(d.teamId); return d.projectName || d.projectId || (t && t.currentProject && t.currentProject.name) || '当前项目'; }
  function requesterName(d){
    var t=teamObj(d.teamId);
    if(t){
      if(t.masterId === d.requesterId) return (t.masterCodename || '组长') + '（' + d.requesterId + '）';
      var m=(t.members||[]).find(function(x){return x.id===d.requesterId;}); if(m) return m.name + '（' + d.requesterId + '）';
    }
    var w=(st().workers||[]).find(function(x){return x.id===d.requesterId;}); return w ? w.name + '（' + d.requesterId + '）' : (d.requesterId || '-');
  }
  function fmtRel(ts){ try { return typeof formatRelativeTime === 'function' ? formatRelativeTime(ts) : '-'; } catch(e){ return '-'; } }
  function fmtCount(ts){ try { return typeof formatCountdown === 'function' ? formatCountdown(ts) : ''; } catch(e){ return ''; } }
  function decisions(){ return (st().decisions || []); }
  function pendingDecisions(){ return decisions().filter(function(d){ return !d.status || d.status === 'pending'; }); }
  function reviewCount(){ return (st().teams||[]).reduce(function(n,t){ return n + Number(t.pendingReviews || (((t.currentProject||{}).acceptanceQueue||[]).length) || 0); },0) || 10; }
  function urgentCount(list){ return (list || pendingDecisions()).filter(function(d){ return d.urgent; }).length; }
  function riskLevel(d){ if(d.urgent || d.type === '不可逆操作') return '高'; if(String(d.type||'').includes('偏好')) return '中'; return '中'; }
  function impactText(d){
    if(d.type === '不可逆操作') return '影响权限 / 生产变更';
    if(d.type === '需求歧义') return '影响需求边界与任务执行';
    if(d.type === '偏好选择') return '影响方案路线与维护成本';
    return '影响当前任务推进';
  }
  function recommendedOption(d){ var opts=d.options || []; return opts.find(function(o){return o.kind==='primary';}) || opts[0] || {label:'采纳主智能体推荐方案',kind:'primary'}; }
  function buildShell(){
    var page=document.getElementById('page-decisions'); if(!page || page.dataset.v063319Workbench === '1') return;
    page.dataset.v063319Workbench = '1';
    page.innerHTML = `
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
              <option value="all">全部紧急度</option><option value="urgent">🔴 紧急</option><option value="normal">常规</option>
            </select>
            <select class="filter-select" id="decisionTeamFilter" onchange="renderDecisions()"><option value="all">全部团队</option></select>
            <select class="filter-select" id="decisionStatusFilter" onchange="renderDecisions()">
              <option value="pending">待决策</option><option value="expired">已过期</option><option value="all">全部状态</option>
            </select>
          </div>
        </div>
        <div class="decision-wb-layout">
          <div class="decision-wb-panel">
            <div class="decision-wb-panel-head">
              <div><div class="decision-wb-panel-title">决策队列</div><div class="decision-wb-panel-sub" id="decisionWbListSub">按紧急度与影响范围排序</div></div>
              <span class="decision-wb-pill blue" id="decisionWbVisibleCount">0 项</span>
            </div>
            <div class="decision-wb-list" id="decisionListBody"></div>
          </div>
          <div class="decision-wb-detail-wrap" style="position:relative;">
            <div id="decisionDetailPanel" class="decision-wb-detail"><div class="decision-wb-detail-empty">请选择左侧决策项</div></div>
            <div id="decisionStatusOverlay" class="decision-status-overlay" style="display:none;"><div class="polling-dot" style="width:24px;height:24px;animation:none;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--info)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div><div id="decisionStatusText" style="font-weight:600;font-size:16px;color:var(--info);">等待主智能体确认...</div><div style="font-size:13px;color:var(--text-secondary);">决策已下发，正在建立指令通道</div></div>
          </div>
        </div>
      </div>`;
    try { if(typeof populateTeamFilters === 'function') populateTeamFilters(); } catch(e) {}
  }
  function updateKpis(list){
    var pend=pendingDecisions(); var urgent=urgentCount(pend); var reviews=reviewCount();
    var a=document.getElementById('decisionWbPending'); if(a) a.textContent=pend.length;
    var b=document.getElementById('decisionWbUrgent'); if(b) b.textContent=urgent;
    var c=document.getElementById('decisionWbReview'); if(c) c.textContent=reviews;
    var vc=document.getElementById('decisionWbVisibleCount'); if(vc) vc.textContent=(list?list.length:pend.length)+' 项';
    var sub=document.getElementById('decisionWbListSub'); if(sub) sub.textContent='当前筛选显示 '+(list?list.length:pend.length)+' 项，紧急 '+urgentCount(list||pend)+' 项';
  }
  window.renderDecisions = function(){
    if(building) return;
    building = true;
    try {
      buildShell();
      var urgencyFilter = document.getElementById('decisionUrgencyFilter')?.value || 'all';
      var teamFilter = document.getElementById('decisionTeamFilter')?.value || 'all';
      var statusFilter = document.getElementById('decisionStatusFilter')?.value || 'pending';
      var pendCount = pendingDecisions().length;
      var badgeEl = document.getElementById('menuDecisionCount');
      if(badgeEl){ badgeEl.innerText = pendCount; badgeEl.setAttribute('data-count', pendCount); badgeEl.style.display = pendCount ? 'inline-block' : 'none'; }
      var alertCount = document.getElementById('alertDecisionCount'); if(alertCount) alertCount.innerText = pendCount;
      var alertBanner = document.getElementById('decisionAlertBanner');
      var page = document.getElementById('page-decisions');
      var isDecisionsTab = page && page.classList.contains('active');
      if(alertBanner) alertBanner.style.display = (pendCount > 0 && !window.isNetworkDisconnected && !isDecisionsTab) ? 'inline-flex' : 'none';
      var filtered = decisions().filter(function(d){
        if(statusFilter !== 'all' && d.status !== statusFilter) return false;
        if(urgencyFilter === 'urgent' && !d.urgent) return false;
        if(urgencyFilter === 'normal' && d.urgent) return false;
        if(teamFilter !== 'all' && d.teamId !== teamFilter) return false;
        return true;
      }).sort(function(a,b){ return (b.urgent?1:0)-(a.urgent?1:0) || (b.timeTs||0)-(a.timeTs||0); });
      updateKpis(filtered);
      var listEl=document.getElementById('decisionListBody'); var panel=document.getElementById('decisionDetailPanel');
      if(!listEl) return;
      if(!filtered.length){ listEl.innerHTML='<div class="decision-wb-empty">无匹配的决策项</div>'; if(panel) panel.innerHTML='<div class="decision-wb-detail-empty">调整筛选条件后查看决策项</div>'; return; }
      if(!window.currentSelectedDecisionId || !filtered.some(function(d){return d.id===window.currentSelectedDecisionId;})) window.currentSelectedDecisionId = filtered[0].id;
      listEl.innerHTML = filtered.map(function(d){
        var selected = d.id === window.currentSelectedDecisionId;
        var expired = d.status === 'expired';
        var expireText = expired ? '已过期' : (d.expiresAt ? fmtCount(d.expiresAt) : '无截止');
        return '<div class="decision-wb-item '+(selected?'selected ':'')+(d.urgent?'urgent':'')+'" onclick="selectDecision(\''+esc(d.id)+'\')">'
          + '<div class="decision-wb-item-title">'+(d.urgent?'🔴 ':'')+esc(d.title)+'</div>'
          + '<div class="decision-wb-item-meta">'
          + '<span class="decision-wb-pill '+(d.urgent?'urgent':'')+'">'+(d.urgent?'紧急':'常规')+'</span>'
          + '<span class="decision-wb-pill blue">'+esc(d.type || '决策')+'</span>'
          + '<span class="decision-wb-pill">'+esc(teamName(d.teamId))+'</span>'
          + '<span class="decision-wb-pill warn">'+esc(expireText)+'</span>'
          + '</div></div>';
      }).join('');
      renderDecisionDetail(window.currentSelectedDecisionId);
    } finally { building = false; }
  };
  window.selectDecision = function(id){ window.currentSelectedDecisionId = id; renderDecisions(); };
  window.renderDecisionDetail = function(id){
    var d = decisions().find(function(x){return x.id===id;}); var panel=document.getElementById('decisionDetailPanel'); if(!panel) return;
    if(!d){ panel.innerHTML='<div class="decision-wb-detail-empty">请选择左侧决策项</div>'; return; }
    var expired=d.status==='expired'; var reco=recommendedOption(d); var opts=d.options||[];
    var expire = d.expiresAt ? (expired ? '已过期' : fmtCount(d.expiresAt)) : '无截止时间';
    panel.innerHTML = `
      <div class="decision-wb-detail-head">
        <div class="decision-wb-detail-meta"><span>发起方：${esc(teamName(d.teamId))} / ${esc(requesterName(d))}</span><span>${esc(fmtRel(d.timeTs))}</span></div>
        <div class="decision-wb-detail-title">${d.urgent ? '🔴 ' : ''}${esc(d.title)}</div>
        <div class="decision-wb-detail-badges">
          <span class="decision-wb-pill blue">${esc(projectName(d))}</span>
          <span class="decision-wb-pill">${esc(d.type || '决策')}</span>
          <span class="decision-wb-pill ${d.urgent?'urgent':'warn'}">${esc(expire)}</span>
          <span class="decision-wb-pill ${riskLevel(d)==='高'?'urgent':'warn'}">风险 ${esc(riskLevel(d))}</span>
        </div>
      </div>
      <div class="decision-wb-detail-body">
        <div class="decision-wb-section">
          <div class="decision-wb-section-title">📌 决策原因</div>
          <div class="decision-wb-section-body"><pre>${esc(d.context || '暂无上下文说明')}</pre></div>
        </div>
        <div class="decision-wb-risk-grid">
          <div class="decision-wb-risk"><div class="decision-wb-risk-label">所属项目</div><div class="decision-wb-risk-value">${esc(projectName(d))}</div></div>
          <div class="decision-wb-risk"><div class="decision-wb-risk-label">触发团队</div><div class="decision-wb-risk-value">${esc(teamName(d.teamId))}</div></div>
          <div class="decision-wb-risk"><div class="decision-wb-risk-label">影响范围</div><div class="decision-wb-risk-value">${esc(impactText(d))}</div></div>
        </div>
        <div class="decision-wb-section">
          <div class="decision-wb-section-title">✅ 推荐方案与可选项</div>
          <div class="decision-wb-section-body"><div class="decision-wb-options">
            ${opts.map(function(o,i){ return '<div class="decision-wb-option '+esc(o.kind||'')+'"><div class="decision-wb-option-title">'+String.fromCharCode(65+i)+'. '+esc(o.label)+'</div>'+((o.label===reco.label || o.kind==='primary')?'<span class="decision-wb-reco">推荐</span>':'')+'</div>'; }).join('')}
          </div></div>
        </div>
        <div class="decision-wb-section decision-wb-action-section">
          <div class="decision-wb-section-title">✍️ 处理区</div>
          <div class="decision-wb-section-body decision-wb-action-box">
            <div class="decision-wb-action-advice">建议处理：<strong>${esc(reco.label)}</strong>。可采纳推荐，也可补充约束后下发给协同规划岗。</div>
            <div class="decision-wb-actions">
              <button class="decision-wb-btn primary" onclick="handleDecisionOption('${esc(d.id)}','accept')">采纳推荐</button>
              <button class="decision-wb-btn" onclick="handleDecisionOption('${esc(d.id)}','custom')">提交自定义意见</button>
              <button class="decision-wb-btn warn" onclick="handleDecisionOption('${esc(d.id)}','defer')">暂缓处理</button>
            </div>
            <textarea class="decision-wb-textarea" placeholder="可输入自定义意见：例如采用方案 A，但保留回滚预案，并在交付审查前补充风险说明。"></textarea>
          </div>
        </div>
      </div>`;
  };
  window.handleDecisionOption = function(id, action){
    var overlay=document.getElementById('decisionStatusOverlay'); var text=document.getElementById('decisionStatusText');
    if(text) text.textContent = action === 'defer' ? '已暂缓，等待协同规划岗补充信息...' : '决策已下发，等待主智能体确认...';
    if(overlay){ overlay.style.display='flex'; setTimeout(function(){ overlay.style.display='none'; }, 900); }
  };
  function boot(){ buildShell(); try { if(typeof populateTeamFilters === 'function') populateTeamFilters(); } catch(e){} renderDecisions(); }
  var oldSwitch = window.switchNav;
  if(typeof oldSwitch === 'function' && !oldSwitch.__v063319DecisionWrapped){
    var wrapped = function(target){ var ret = oldSwitch.apply(this, arguments); if(target === 'decisions') setTimeout(boot, 0); return ret; };
    wrapped.__v063319DecisionWrapped = true; window.switchNav = wrapped;
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 30); }); else setTimeout(boot, 30);
})();


;


(function(){
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVersion); else setVersion();
  setTimeout(setVersion, 80); setTimeout(setVersion, 500);
})();


;


(function(){
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVersion); else setVersion();
  setTimeout(setVersion, 80); setTimeout(setVersion, 600);
})();


;


(function(){
  function esc(v){
    if (typeof escapeHTML === 'function') return escapeHTML(v == null ? '' : String(v));
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }
  function stageLabel(stage){
    try { if (typeof getStageLabel === 'function') return getStageLabel(stage); } catch(e) {}
    return stage || '推进中';
  }
  function roleTitle(worker){
    try { if (typeof getPersonaRoleTitle === 'function') return getPersonaRoleTitle(worker); } catch(e) {}
    return worker?.projectRole || worker?.role || '数字员工';
  }
  function statusClass(s){
    return ({assigned:'assigned', executing:'executing', review:'review', decision:'decision', done:'done'}[s] || 'assigned');
  }
  function statusLabel(s){
    return ({assigned:'已分派', executing:'执行中', review:'审查中', decision:'待决策', done:'已闭环'}[s] || '已分派');
  }
  function teamDecisions(team){
    try { if (typeof getTeamPendingDecisions === 'function') return getTeamPendingDecisions(team) || []; } catch(e) {}
    return [];
  }
  function memberBy(team, predicate){
    return (team.members || []).find(predicate) || (team.members || [])[0] || null;
  }
  function buildTaskTickets(team, proj){
    var members = team.members || [];
    var leader = team.masterCodename || '组长';
    var impl = memberBy(team, function(m){ return /开发|实现|建模|fixer/.test((m.projectRole||'') + (m.role||'') + (m.name||'')); });
    var tester = memberBy(team, function(m){ return /测试|验证|explorer/.test((m.projectRole||'') + (m.role||'') + (m.name||'')); });
    var reviewer = memberBy(team, function(m){ return /审查|评审|设计|designer/.test((m.projectRole||'') + (m.role||'') + (m.name||'')); }) || tester;
    var pending = teamDecisions(team);
    var blockers = (proj && proj.blockers) || [];
    var base = (proj && proj.name) || team.name;
    var focus = team.task || (proj && proj.task) || '当前项目任务';
    var decisionTitle = pending[0]?.title || blockers[0]?.desc || blockers[0]?.title || '关键方案等待业务确认';
    var tickets = [
      {id:'TT-' + team.id.toUpperCase() + '-01', title:'目标澄清与任务单拆解', status:'done', owner:leader, role:'协同规划岗', next:'已拆成可执行任务单', output:'任务范围 / 分派计划'},
      {id:'TT-' + team.id.toUpperCase() + '-02', title:focus, status:'executing', owner:impl ? impl.name : leader, role:impl ? roleTitle(impl) : '实现验证岗', next:impl ? (impl.currentTaskSummary || '按任务单执行') : '等待成员执行', output:'代码变更 / 执行记录'},
      {id:'TT-' + team.id.toUpperCase() + '-03', title:'交付物审查与回归验证', status:'review', owner:reviewer ? reviewer.name : leader, role:reviewer ? roleTitle(reviewer) : '交付审查岗', next:'审查通过后进入交付，未通过则返工', output:'审查意见 / 验证报告'},
      {id:'TT-' + team.id.toUpperCase() + '-04', title:decisionTitle, status:pending.length ? 'decision' : 'assigned', owner:leader, role:'协同规划岗', next:pending.length ? '流转到待决策工作台' : '暂无阻塞，持续观察', output:'业务选择 / 风险确认'}
    ];
    if (!pending.length && !blockers.length) {
      tickets[3].status = 'done';
      tickets[3].title = '交付确认与下一轮计划';
      tickets[3].next = '进入下一轮任务单';
      tickets[3].output = '交付记录 / 下一步计划';
    }
    return tickets;
  }
  function renderFlow(tickets){
    var hasDecision = tickets.some(function(t){ return t.status === 'decision'; });
    var hasReview = tickets.some(function(t){ return t.status === 'review'; });
    var hasExecuting = tickets.some(function(t){ return t.status === 'executing'; });
    var steps = [
      ['01','输入确认','PRD / 需求 / 文档进入任务单','done'],
      ['02','任务分派','组长拆解并指派数字员工','done'],
      ['03','执行验证','实现验证岗产出代码与记录', hasExecuting ? 'active' : 'done'],
      ['04','交付审查','审查交付物并提出返工意见', hasReview ? 'active' : 'done'],
      ['05','决策/闭环', hasDecision ? '需要用户决策或业务取舍' : '通过、返工或进入下一轮', hasDecision ? 'warn' : 'active']
    ];
    return '<div class="task-flow-strip">' + steps.map(function(s){
      return '<div class="task-flow-step ' + s[3] + '"><div><span class="task-flow-index">' + esc(s[0]) + '</span><span class="task-flow-name">' + esc(s[1]) + '</span></div><div class="task-flow-desc">' + esc(s[2]) + '</div></div>';
    }).join('') + '</div>';
  }
  function renderTickets(tickets, filterOwner){
    var shown = filterOwner ? tickets.filter(function(t){ return t.owner === filterOwner || /决策|审查|交付/.test(t.title); }) : tickets;
    if (!shown.length) shown = tickets.slice(0, 2);
    return '<div class="task-ticket-list">' + shown.map(function(t){
      return '<div class="task-ticket-card ' + esc(statusClass(t.status)) + '">' +
        '<div class="task-ticket-main"><div class="task-ticket-id">' + esc(t.id) + '</div><div class="task-ticket-title" title="' + esc(t.title) + '">' + esc(t.title) + '</div></div>' +
        '<div class="task-ticket-meta"><div>负责人：<span class="task-ticket-owner">' + esc(t.owner) + '</span></div><div>岗位：' + esc(t.role) + '</div></div>' +
        '<div><span class="task-ticket-status ' + esc(statusClass(t.status)) + '">' + esc(statusLabel(t.status)) + '</span></div>' +
        '<div class="task-ticket-next"><strong>下一步：</strong>' + esc(t.next) + '<br><strong>产出：</strong>' + esc(t.output) + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }
  function renderClosureShell(team, proj, member){
    var tickets = buildTaskTickets(team, proj || {});
    var pending = tickets.filter(function(t){ return t.status === 'decision'; }).length;
    var review = tickets.filter(function(t){ return t.status === 'review'; }).length;
    var executing = tickets.filter(function(t){ return t.status === 'executing'; }).length;
    var done = tickets.filter(function(t){ return t.status === 'done'; }).length;
    var title = member ? '当前任务单闭环' : '团队任务单闭环';
    var sub = member ? '聚焦该数字员工当前任务，同时保留审查与决策流转位置。' : '把项目目标、任务单、执行验证、交付审查、待决策/返工串成一条闭环。';
    return '<div class="task-closure-shell">' +
      '<div class="task-closure-head"><div><div class="task-closure-title">' + esc(title) + '</div><div class="task-closure-sub">' + esc(sub) + '</div></div>' +
      '<div class="task-closure-kpi"><span>执行 <strong>' + executing + '</strong></span><span>审查 <strong>' + review + '</strong></span><span>待决策 <strong>' + pending + '</strong></span><span>闭环 <strong>' + done + '</strong></span></div></div>' +
      renderFlow(tickets) + renderTickets(tickets, member ? member.name : null) +
      '<div class="task-closure-note">说明：此处只做任务单闭环表达，不改变 mock 数据结构；真实实现阶段应由 TaskTicket、Review、DecisionItem 和 RuntimeBinding 驱动。</div>' +
    '</div>';
  }
  function renderContext(team, proj, member){
    var acts = (team.activities || []).slice(0, 5);
    var who = member ? member.name : (team.masterCodename || team.name);
    var lead = '<div class="activity-item"><div class="activity-time">当前</div><div class="activity-content">' + esc(who) + ' 正在围绕任务单推进：输入确认 → 执行验证 → 审查 → 决策/闭环。</div></div>';
    var body = acts.map(function(a){ return '<div class="activity-item"><div class="activity-time">' + (typeof formatRelativeTime === 'function' ? formatRelativeTime(a.time) : '') + '</div><div class="activity-content">' + esc(a.desc || a.text || a.message || '') + '</div></div>'; }).join('');
    return '<div class="activity-timeline">' + lead + body + '</div>';
  }
  window.renderWorkbenchAgentDetail = function(team, page){
    var masterCard = page.querySelector('.detail-master-card');
    var ctx = page.querySelector('.detail-context-body');
    var currentDocRow = page.querySelector('[data-agent-current-doc]');
    if (!masterCard || !team) return;
    var selected = (typeof getSelectedAgent === 'function') ? getSelectedAgent(team.id) : 'leader';
    var isLeader = selected === 'leader';
    var member = isLeader ? null : (team.members || []).find(function(m){ return m.id === selected; });
    if (!isLeader && !member && typeof setSelectedAgent === 'function') { setSelectedAgent(team.id, 'leader'); return window.renderWorkbenchAgentDetail(team, page); }
    var proj = team.currentProject || {};
    if (isLeader) {
      var leaderName = team.masterCodename || 'Leader';
      masterCard.innerHTML = '<div class="task-overview-card"><div class="task-overview-left"><div class="agent-detail-avatar"><img src="' + esc(typeof getLeaderAvatarSrc === 'function' ? getLeaderAvatarSrc(team) : '') + '" alt="" loading="lazy"><span class="persona-status-dot ' + esc(team.masterStatus === 'offline' ? 'offline' : 'busy') + '"></span></div><div><div class="task-overview-title">' + esc(leaderName) + ' <span class="role-badge oracle">组长</span></div><div class="task-overview-sub">' + esc(proj.name || team.name) + ' · ' + esc(stageLabel(proj.stage)) + ' · 负责拆解任务单、调度执行验证、汇总审查和待决策。</div></div></div><button class="team-manage-btn" onclick="alert(\'管理成员功能暂未实现\\n\\n后续将支持：\\n· 添加组员\\n· 删除组员\\n· 调整成员角色与归属\')">⚙️ 管理成员</button></div>' + renderClosureShell(team, proj, null);
    } else {
      var m = member;
      var status = m.status || 'idle';
      var dot = (status === 'idle' || status === 'busy' || status === 'offline') ? status : 'offline';
      masterCard.innerHTML = '<div class="task-overview-card"><div class="task-overview-left"><div class="agent-detail-avatar"><img src="' + esc(typeof getWorkerAvatarSrc === 'function' ? getWorkerAvatarSrc(m) : '') + '" alt="" loading="lazy"><span class="persona-status-dot ' + esc(dot) + '"></span></div><div><div class="task-overview-title">' + esc(m.name) + ' <span class="role-badge ' + esc(typeof getRoleClass === 'function' ? getRoleClass(m.role) : '') + '">' + esc(roleTitle(m)) + '</span></div><div class="task-overview-sub">' + esc(proj.name || team.name) + ' · 当前任务：' + esc(m.currentTaskSummary || (status === 'idle' ? '空闲待命' : '执行中')) + '</div></div></div></div>' + renderClosureShell(team, proj, m);
    }
    if (ctx) ctx.innerHTML = renderContext(team, proj, member);
    if (currentDocRow) { currentDocRow.style.display = 'none'; currentDocRow.innerHTML = ''; }
    var title = page.querySelector('.detail-context-title');
    if (title) title.childNodes.forEach(function(n){ if(n.nodeType===3) n.textContent='闭环上下文'; });
  };
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  function boot(){
    setVersion();
    var active = document.querySelector('.page.active[id^="page-team-"]');
    if (active && typeof renderTeamDetailLeftPanel === 'function') {
      var id = active.id.replace('page-team-','');
      try { renderTeamDetailLeftPanel(id); } catch(e) {}
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 40); }); else setTimeout(boot, 40);
  setTimeout(setVersion, 120); setTimeout(setVersion, 800); setTimeout(setVersion, 1800);
})();


;


(function(){
  function esc(v){
    if (typeof escapeHTML === 'function') return escapeHTML(v == null ? '' : String(v));
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }
  function roleTitle(worker){
    try { if (typeof getPersonaRoleTitle === 'function') return getPersonaRoleTitle(worker); } catch(e) {}
    return worker && (worker.projectRole || worker.role) || '数字员工';
  }
  function isExpert(member){
    var text = [member && member.name, member && member.role, member && member.projectRole, member && member.currentTaskSummary].filter(Boolean).join(' ');
    return /架构专家|技术专家|系统架构师|@oracle/.test(text);
  }
  function detailMembers(team){
    var all = (team && team.members || []).filter(function(m){ return !isExpert(m); });
    if (!all.length) return [];
    var impl = all.filter(function(m){ return /实现验证|实现|开发|建模|fixer/.test([m.projectRole,m.role,m.name].join(' ')); });
    var review = all.filter(function(m){ return /交付审查|审查|评审|测试|验证|designer|explorer/.test([m.projectRole,m.role,m.name].join(' ')) && impl.indexOf(m) < 0; });
    var picked = [];
    impl.slice(0,2).forEach(function(m){ if(picked.indexOf(m)<0) picked.push(m); });
    review.slice(0,1).forEach(function(m){ if(picked.indexOf(m)<0) picked.push(m); });
    all.forEach(function(m){ if(picked.length < 4 && picked.indexOf(m)<0) picked.push(m); });
    return picked;
  }
  function statusClass(status){ return (status === 'idle' || status === 'busy' || status === 'offline') ? status : 'offline'; }
  function statusLabel(status){
    try { if (typeof getStatusLabel === 'function') return getStatusLabel(status); } catch(e) {}
    return status || '-';
  }
  function pendingDecisions(team){
    try { if (typeof getTeamPendingDecisions === 'function') return (getTeamPendingDecisions(team) || []).length; } catch(e) {}
    return team && (team.pendingDecisions || 0) || 0;
  }
  function pendingReviews(team){ return team && (team.pendingReviews || 0) || 0; }
  function renderLeftSummary(team, members){
    var implCount = members.filter(function(m){ return /实现验证|实现|开发|建模|fixer/.test([m.projectRole,m.role,m.name].join(' ')); }).length;
    var reviewCount = members.filter(function(m){ return /交付审查|审查|评审|测试|designer|explorer/.test([m.projectRole,m.role,m.name].join(' ')); }).length;
    var busyCount = members.filter(function(m){ return m.status === 'busy'; }).length;
    var task = team && (team.task || (team.currentProject && team.currentProject.name)) || '当前任务';
    return '<div class="detail-left-summary-v63322">' +
      '<div class="detail-left-summary-head"><div class="detail-left-summary-title">团队编队概览</div><div class="detail-left-summary-count">成员 ' + esc(members.length) + '</div></div>' +
      '<div class="detail-left-kpis">' +
        '<div class="detail-left-kpi"><strong>' + esc(implCount) + '</strong><span>实现验证</span></div>' +
        '<div class="detail-left-kpi"><strong>' + esc(reviewCount) + '</strong><span>审查/验证</span></div>' +
        '<div class="detail-left-kpi"><strong>' + esc(busyCount) + '</strong><span>忙碌中</span></div>' +
      '</div>' +
      '<div class="detail-left-mini-flow">' +
        '<div class="detail-left-mini-row"><span>当前任务</span><strong title="' + esc(task) + '">' + esc(task.length > 18 ? task.slice(0,18) + '…' : task) + '</strong></div>' +
        '<div class="detail-left-mini-row"><span>待决策 / 待审查</span><strong>' + esc(pendingDecisions(team)) + ' / ' + esc(pendingReviews(team)) + '</strong></div>' +
      '</div>' +
    '</div>';
  }
  window.renderDetailTopologyCard = function(team, page) {
    var host = page && page.querySelector ? page.querySelector('#detailTopologyHtml') : null;
    if (!host || !team) return;
    var masterCls = team.masterStatus === 'offline' ? 'offline' : (team.healthy ? 'online-healthy' : 'online-warning');
    var members = detailMembers(team);
    var workersHtml = members.map(function(m){
      var sCls = statusClass(m.status);
      var selected = 'leader';
      try { if (typeof getSelectedAgent === 'function') selected = getSelectedAgent(team.id); } catch(e) {}
      var activeCls = selected === m.id ? ' active' : '';
      var avatar = '';
      try { if (typeof getWorkerAvatarSrc === 'function') avatar = getWorkerAvatarSrc(m); } catch(e) {}
      var tone = '';
      try { if (typeof getPersonaTone === 'function') tone = getPersonaTone(m); } catch(e) {}
      var statusTone = '';
      try { if (typeof getPersonaStatusClass === 'function') statusTone = getPersonaStatusClass(m.status); } catch(e) {}
      var role = roleTitle(m);
      var name = (typeof getPersonaMemberName === 'function') ? getPersonaMemberName(m) : m.name;
      return '<div class="topo-worker topo-node ' + esc(sCls) + esc(activeCls) + '" data-action="select-agent" data-agent-id="' + esc(m.id) + '" onclick="selectWorkbenchAgent(\'' + esc(team.id) + '\',\'' + esc(m.id) + '\')" title="' + esc(m.name) + ' · ' + esc(role) + ' · ' + esc(statusLabel(m.status)) + '">' +
        '<span class="persona-avatar worker ' + esc(tone) + ' ' + esc(statusTone) + '"><img class="persona-avatar-img" src="' + esc(avatar) + '" alt="" loading="lazy"><span class="persona-status-dot ' + esc(sCls) + '"></span></span>' +
        '<span class="topo-worker-text"><span class="topo-worker-name">' + esc(name) + '</span><span class="topo-worker-role">' + esc(role) + '</span></span>' +
      '</div>';
    }).join('');
    var selectedAgent = 'leader';
    try { if (typeof getSelectedAgent === 'function') selectedAgent = getSelectedAgent(team.id); } catch(e) {}
    var leaderActiveCls = selectedAgent === 'leader' ? ' active' : '';
    var leaderAvatar = '';
    try { if (typeof getLeaderAvatarSrc === 'function') leaderAvatar = getLeaderAvatarSrc(team); } catch(e) {}
    var leaderTone = '';
    try { if (typeof getPersonaTone === 'function') leaderTone = getPersonaTone(team, true); } catch(e) {}
    var leaderStatusTone = '';
    try { if (typeof getPersonaStatusClass === 'function') leaderStatusTone = getPersonaStatusClass(team.masterStatus === 'offline' ? 'offline' : 'busy'); } catch(e) {}
    host.innerHTML = '<div id="topologyHtml" class="detail-topology-scope"><div class="topo-team-card detail-topology-card" data-team-id="' + esc(team.id) + '">' +
      '<div class="topo-master topo-node ' + esc(masterCls) + esc(leaderActiveCls) + '" data-action="select-agent" data-agent-id="leader" onclick="selectWorkbenchAgent(\'' + esc(team.id) + '\',\'leader\')" title="' + esc(team.masterCodename || '') + ' · 团队负责人">' +
        '<span class="persona-avatar ' + esc(leaderTone) + ' ' + esc(leaderStatusTone) + '"><img class="persona-avatar-img" src="' + esc(leaderAvatar) + '" alt="" loading="lazy"><span class="persona-status-dot ' + esc(team.masterStatus === 'offline' ? 'offline' : 'busy') + '"></span></span>' +
        '<span class="persona-main"><span class="persona-name-row"><span class="topo-master-name">' + esc(team.masterCodename || '') + '</span><span class="persona-role-tag">组长</span></span><span class="persona-task">任务协调 / 决策把关</span></span>' +
        '<button class="topo-node-action" title="与 ' + esc(team.masterCodename || 'Leader') + ' 对话" onclick="event.stopPropagation(); openChatWith(\'' + esc(team.masterId || team.id) + '\')"><span aria-hidden="true">💬</span><span>协作</span></button>' +
      '</div>' +
      '<div class="topo-workers">' + workersHtml + '</div>' +
    '</div></div>' + renderLeftSummary(team, members);
  };
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  function rerenderActiveTeam(){
    setVersion();
    var page = document.querySelector('.page.active[id^="page-team-"]');
    if (!page) return;
    var id = page.id.replace('page-team-','');
    var team = null;
    try { team = (window.currentState && window.currentState.teams || []).find(function(t){ return t.id === id; }); } catch(e) {}
    if (team && window.renderDetailTopologyCard) window.renderDetailTopologyCard(team, page);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(rerenderActiveTeam, 80); }); else setTimeout(rerenderActiveTeam, 80);
  setTimeout(setVersion, 160); setTimeout(rerenderActiveTeam, 500); setTimeout(setVersion, 1800);
})();


;


(function(){
  var lastTeam = null;
  var lastPage = null;
  function esc(v){
    if (typeof escapeHTML === 'function') return escapeHTML(v == null ? '' : String(v));
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }
  function isExpert(member){
    var text = [member && member.name, member && member.role, member && member.projectRole, member && member.currentTaskSummary].filter(Boolean).join(' ');
    return /架构专家|技术专家|系统架构师|@oracle/.test(text);
  }
  function roleText(member){
    try { if (typeof getPersonaRoleTitle === 'function') return getPersonaRoleTitle(member); } catch(e) {}
    return (member && (member.projectRole || member.role)) || '数字员工';
  }
  function shortText(text, max){
    text = String(text || '当前任务');
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
  function memberTicketMeta(team, member){
    if (!team || !member) return {id:'TT', text:'当前任务'};
    var text = [member.projectRole, member.role, member.name].join(' ');
    var tid = 'TT-' + String(team.id || '').toUpperCase();
    var role = roleText(member);
    if (/交付审查|审查|评审|测试|验证|designer|explorer/.test(text) && !/实现验证|实现/.test(text)) {
      return {id: tid + '-03', text: '审查/验证 · ' + shortText(member.currentTaskSummary || '交付物审查与回归验证', 18)};
    }
    if (/实现验证|实现|开发|建模|fixer/.test(text)) {
      return {id: tid + '-02', text: '执行 · ' + shortText(member.currentTaskSummary || (team.task || '按任务单执行'), 18)};
    }
    return {id: tid + '-02', text: shortText(role + ' · ' + (member.currentTaskSummary || team.task || '任务协作'), 22)};
  }
  function augmentLeftPanel(team, page){
    team = team || lastTeam;
    page = page || lastPage || document.querySelector('.page.active[id^="page-team-"]');
    if (!page || !team) return;
    var members = (team.members || []).filter(function(m){ return !isExpert(m); });
    page.querySelectorAll('#detailTopologyHtml .topo-worker[data-agent-id]').forEach(function(card){
      var id = card.getAttribute('data-agent-id');
      var member = members.find(function(m){ return m.id === id; });
      if (!member) return;
      var meta = memberTicketMeta(team, member);
      var host = card.querySelector('.topo-worker-text');
      if (!host) return;
      var line = host.querySelector('.topo-worker-task-ref');
      if (!line) {
        line = document.createElement('span');
        line.className = 'topo-worker-task-ref';
        host.appendChild(line);
      }
      line.textContent = meta.id + ' · ' + meta.text;
      card.setAttribute('title', (member.name || '') + ' · ' + roleText(member) + ' · ' + meta.id + ' · ' + meta.text);
    });
  }
  function decorateTickets(page){
    page = page || lastPage || document.querySelector('.page.active[id^="page-team-"]');
    if (!page) return;
    page.querySelectorAll('.task-ticket-card').forEach(function(card){
      var status = card.querySelector('.task-ticket-status');
      if (status) {
        ['assigned','executing','review','decision','done'].forEach(function(c){ if (status.classList.contains(c)) card.classList.add(c); });
      }
    });
  }
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  function refresh(team, page){ setVersion(); augmentLeftPanel(team, page); decorateTickets(page); }
  function wrapRenderDetailTopology(){
    var fn = window.renderDetailTopologyCard;
    if (typeof fn !== 'function' || fn.__v63323Wrapped) return;
    var wrapped = function(team, page){
      lastTeam = team || lastTeam;
      lastPage = page || lastPage;
      var ret = fn.apply(this, arguments);
      setTimeout(function(){ refresh(team, page); }, 0);
      setTimeout(function(){ refresh(team, page); }, 80);
      return ret;
    };
    wrapped.__v63323Wrapped = true;
    window.renderDetailTopologyCard = wrapped;
  }
  function wrapWorkbenchDetail(){
    var fn = window.renderWorkbenchAgentDetail;
    if (typeof fn !== 'function' || fn.__v63323Wrapped) return;
    var wrapped = function(team, page){
      lastTeam = team || lastTeam;
      lastPage = page || lastPage;
      var ret = fn.apply(this, arguments);
      setTimeout(function(){ refresh(team, page); }, 0);
      setTimeout(function(){ refresh(team, page); }, 80);
      return ret;
    };
    wrapped.__v63323Wrapped = true;
    window.renderWorkbenchAgentDetail = wrapped;
  }
  function wrapSelect(){
    var fn = window.selectWorkbenchAgent;
    if (typeof fn !== 'function' || fn.__v63323Wrapped) return;
    var wrapped = function(){
      var ret = fn.apply(this, arguments);
      setTimeout(function(){ refresh(); }, 0);
      setTimeout(function(){ refresh(); }, 80);
      return ret;
    };
    wrapped.__v63323Wrapped = true;
    window.selectWorkbenchAgent = wrapped;
  }
  function boot(){
    wrapRenderDetailTopology();
    wrapWorkbenchDetail();
    wrapSelect();
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 80); }); else setTimeout(boot, 80);
  setTimeout(boot, 300); setTimeout(refresh, 900); setTimeout(refresh, 1800);
})();


;


(function(){
  function esc(v){
    if (typeof escapeHTML === 'function') return escapeHTML(v == null ? '' : String(v));
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }
  function appState(){ return (typeof currentState !== 'undefined' && currentState) ? currentState : (window.currentState || {teams:[], decisions:[]}); }
  function safePendingDecisions(team){ try { if (typeof pendingDecisions === 'function') return pendingDecisions(team); } catch(e){} return (appState().decisions||[]).filter(function(d){return d.status==='pending' && d.teamId===team.id;}).length; }
  function safePendingReviews(team){ try { if (typeof pendingReviews === 'function') return pendingReviews(team); } catch(e){} return Number(team.pendingReviews || 0); }
  function safeActiveWorkOrders(team){ try { if (typeof activeWorkOrders === 'function') return activeWorkOrders(team); } catch(e){} return ((team.currentProject && team.currentProject.workOrders)||[]).filter(function(w){return ['assigned','running','blocked','submitted','reviewing','rework_required'].indexOf(w.status)>=0;}); }
  function safeProgress(team){ try { if (typeof progressOf === 'function') return progressOf(team); } catch(e){} return Number(team.currentProject && team.currentProject.progress || 0); }
  function safeStage(stage){ try { if (typeof stageLabel === 'function') return stageLabel(stage); } catch(e){} try { if (typeof getStageLabel === 'function') return getStageLabel(stage); } catch(e){} return stage || '推进中'; }
  function safeFmtToken(v){ try { if (typeof fmtToken === 'function') return fmtToken(v); } catch(e){} return String(v || 0); }
  function metricOf(team){ try { if (typeof teamMetrics === 'function') return teamMetrics(team); } catch(e){} return team.opsMetrics || {tokens:0, sessions:0}; }
  function docSummary(project){ return ((project && project.docs) || []).length; }
  function urgentDecisions(team){ return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && d.teamId === team.id && d.urgent; }); }
  function teamDecisions(team){ return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && d.teamId === team.id; }); }
  function healthOf(team){
    var project = team.currentProject || {}, decisions = safePendingDecisions(team), reviews = safePendingReviews(team);
    var urgent = urgentDecisions(team).length;
    var blocked = safeActiveWorkOrders(team).filter(function(w){ return w.status === 'blocked' || w.status === 'rework_required'; }).length + ((project.blockers || []).length);
    if (team.masterStatus === 'offline') return {cls:'blocked', label:'阻塞', risk:'high', riskLabel:'高'};
    if (urgent > 0 || blocked > 0 || project.health === 'critical') return {cls:'risk', label:'风险', risk:'high', riskLabel:'高'};
    if (decisions > 0 || reviews >= 3 || project.health === 'warning' || project.health === 'degraded') return {cls:'attention', label:'关注', risk:'medium', riskLabel:'中'};
    return {cls:'healthy', label:'健康', risk:'low', riskLabel:'低'};
  }
  function nextAction(team){
    var project = team.currentProject || {};
    var urgent = urgentDecisions(team)[0];
    var decision = teamDecisions(team)[0];
    var reviews = safePendingReviews(team);
    var active = safeActiveWorkOrders(team);
    var blocked = active.find(function(w){ return w.status === 'blocked' || w.status === 'rework_required'; });
    var reviewing = active.find(function(w){ return w.status === 'reviewing' || w.status === 'submitted'; });
    var running = active.find(function(w){ return w.status === 'running' || w.status === 'assigned'; });
    if (urgent) return {main:'优先处理待决策：' + urgent.title, sub:'将流转到待决策工作台'};
    if (blocked) return {main:'解除阻塞/返工：' + (blocked.title || blocked.id), sub:'协同规划岗需重新调度'};
    if (decision) return {main:'等待用户决策：' + decision.title, sub:'处理后继续任务单闭环'};
    if (reviews > 0 || reviewing) return {main:'推进交付审查：' + reviews + ' 项待审查', sub:(reviewing && reviewing.title) || '交付审查岗复核交付物'};
    if (running) return {main:'跟进执行验证：' + (running.title || project.name), sub:'实现验证岗继续推进'};
    return {main:'可进入下一轮迭代计划', sub:'当前无阻塞待办'};
  }
  function renderProjectsV63324(){
    var page = document.getElementById('page-projects');
    if (!page) return;
    var teams = (appState().teams || []).filter(function(t){ return !!t.currentProject; });
    var total = teams.length;
    var healthRows = teams.map(function(team){ return {team:team, project:team.currentProject, health:healthOf(team), next:nextAction(team)}; });
    var healthy = healthRows.filter(function(r){ return r.health.cls === 'healthy'; }).length;
    var attention = healthRows.filter(function(r){ return r.health.cls === 'attention'; }).length;
    var risk = healthRows.filter(function(r){ return r.health.cls === 'risk' || r.health.cls === 'blocked'; }).length;
    var decisions = teams.reduce(function(n,t){ return n + safePendingDecisions(t); }, 0);
    var reviews = teams.reduce(function(n,t){ return n + safePendingReviews(t); }, 0);
    page.innerHTML = '<div class="project-health-v63324">'
      + '<div class="project-health-head-v63324">'
      + '<div class="project-health-title-v63324"><div class="project-health-title-main-v63324">📁 项目健康总表</div><div class="project-health-title-sub-v63324">从管理者视角横向查看 5 个项目的健康状态、任务推进、待决策/待审查、风险与下一步动作；项目页不再只是普通列表。</div></div>'
      + '<div class="project-health-mini-v63324"><div class="project-health-mini-label-v63324">项目数</div><div class="project-health-mini-value-v63324">' + total + '</div></div>'
      + '<div class="project-health-mini-v63324"><div class="project-health-mini-label-v63324">健康</div><div class="project-health-mini-value-v63324">' + healthy + '</div></div>'
      + '<div class="project-health-mini-v63324"><div class="project-health-mini-label-v63324">关注 / 风险</div><div class="project-health-mini-value-v63324 warn">' + attention + ' / ' + risk + '</div></div>'
      + '<div class="project-health-mini-v63324"><div class="project-health-mini-label-v63324">待决策 / 待审查</div><div class="project-health-mini-value-v63324 danger">' + decisions + ' / ' + reviews + '</div></div>'
      + '</div>'
      + '<div class="project-health-toolbar-v63324"><div class="project-health-toolbar-left-v63324"><span class="project-health-chip-v63324">健康状态：健康 / 关注 / 风险 / 阻塞</span><span class="project-health-chip-v63324">点击项目或团队进入团队详情</span></div><div class="project-health-toolbar-right-v63324"><span class="project-health-chip-v63324">最近更新：刚刚</span></div></div>'
      + '<div class="project-health-card-v63324"><table class="project-health-table-v63324"><thead><tr>'
      + '<th>项目 / 阶段</th><th>负责团队</th><th>健康</th><th>任务进度</th><th>待办指标</th><th>风险</th><th>下一步</th><th>动作</th>'
      + '</tr></thead><tbody>'
      + healthRows.map(function(row){
        var team = row.team, project = row.project, h = row.health, next = row.next;
        var p = Math.max(0, Math.min(100, safeProgress(team)));
        var active = safeActiveWorkOrders(team).length;
        var dec = safePendingDecisions(team), rev = safePendingReviews(team);
        var met = metricOf(team);
        var blocker = (project.blockers && project.blockers[0] && project.blockers[0].desc) || next.sub || '';
        var actionWarn = dec > 0 ? ' warn' : '';
        return '<tr>'
          + '<td class="project-title-cell-v63324"><div class="project-title-main-v63324" onclick="openTeamTab(\'' + esc(team.id) + '\')">' + esc(project.name || '-') + '</div><div><span class="project-stage-pill-v63324">' + esc(safeStage(project.stage)) + '</span></div><div class="project-title-sub-v63324">' + esc(project.description || team.task || '当前项目') + '</div></td>'
          + '<td><span class="proj-team" onclick="openTeamTab(\'' + esc(team.id) + '\')">' + esc(team.name) + '</span><div class="project-blocker-v63324">组长：' + esc(team.masterCodename || '-') + '</div></td>'
          + '<td><span class="health-pill-v63324 ' + h.cls + '">' + esc(h.label) + '</span></td>'
          + '<td class="project-progress-cell-v63324"><div class="project-progress-top-v63324"><span>' + esc(safeStage(project.stage)) + '</span><span>' + p + '%</span></div><div class="project-progress-bar-v63324"><span style="width:' + Math.max(4,p) + '%"></span></div></td>'
          + '<td><div class="project-metric-grid-v63324"><div class="project-metric-v63324"><div class="project-metric-label-v63324">执行中</div><div class="project-metric-value-v63324">' + active + '</div></div><div class="project-metric-v63324"><div class="project-metric-label-v63324">待决策</div><div class="project-metric-value-v63324">' + dec + '</div></div><div class="project-metric-v63324"><div class="project-metric-label-v63324">待审查</div><div class="project-metric-value-v63324">' + rev + '</div></div></div></td>'
          + '<td><span class="risk-pill-v63324 ' + h.risk + '">' + esc(h.riskLabel) + '</span><div class="project-blocker-v63324">文档 ' + docSummary(project) + ' · ' + safeFmtToken(met.tokens) + ' Token</div></td>'
          + '<td class="project-next-v63324"><strong>' + esc(next.main) + '</strong><div class="project-blocker-v63324">' + esc(blocker) + '</div></td>'
          + '<td><div class="project-actions-v63324"><button class="project-action-v63324" onclick="openTeamTab(\'' + esc(team.id) + '\')">团队详情</button><button class="project-action-v63324" onclick="window.openTeamRunDrawer && window.openTeamRunDrawer(\'' + esc(team.id) + '\',\'flow\')">任务闭环</button><button class="project-action-v63324' + actionWarn + '" onclick="switchNav(\'decisions\')">待决策</button></div></td>'
          + '</tr>';
      }).join('')
      + '</tbody></table></div></div>';
  }
  window.renderProjects = renderProjectsV63324;
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  function boot(){ setVersion(); if (document.getElementById('page-projects') && document.getElementById('page-projects').classList.contains('active')) renderProjectsV63324(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 180); }); else setTimeout(boot, 180);
  setTimeout(boot, 700); setTimeout(boot, 1800); setTimeout(boot, 2600);
})();


;


(function(){
  function esc(v){
    if (typeof escapeHTML === 'function') return escapeHTML(v == null ? '' : String(v));
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }
  function appState(){ return (typeof currentState !== 'undefined' && currentState) ? currentState : (window.currentState || {teams:[], decisions:[]}); }
  function compactNumber(n){
    n = Number(n || 0);
    var abs = Math.abs(n);
    function clean(x){ return x.toFixed(1).replace(/\.0$/, ''); }
    if (abs >= 1e9) return clean(n / 1e9) + 'G';
    if (abs >= 1e6) return clean(n / 1e6) + 'M';
    if (abs >= 1e3) return clean(n / 1e3) + 'K';
    return String(Math.round(n));
  }
  function safePendingDecisions(team){ try { if (typeof pendingDecisions === 'function') return pendingDecisions(team); } catch(e){} return (appState().decisions||[]).filter(function(d){return d.status==='pending' && d.teamId===team.id;}).length; }
  function safePendingReviews(team){ try { if (typeof pendingReviews === 'function') return pendingReviews(team); } catch(e){} return Number(team.pendingReviews || 0); }
  function safeActiveWorkOrders(team){ try { if (typeof activeWorkOrders === 'function') return activeWorkOrders(team); } catch(e){} return ((team.currentProject && team.currentProject.workOrders)||[]).filter(function(w){return ['assigned','running','blocked','submitted','reviewing','rework_required'].indexOf(w.status)>=0;}); }
  function safeProgress(team){ try { if (typeof progressOf === 'function') return progressOf(team); } catch(e){} return Number(team.currentProject && team.currentProject.progress || 0); }
  function safeStage(stage){ try { if (typeof stageLabel === 'function') return stageLabel(stage); } catch(e){} try { if (typeof getStageLabel === 'function') return getStageLabel(stage); } catch(e){} return stage || '推进中'; }
  function metricOf(team){ try { if (typeof teamMetrics === 'function') return teamMetrics(team); } catch(e){} return team.opsMetrics || {tokens:0, sessions:0}; }
  function docSummary(project){ return ((project && project.docs) || []).length; }
  function urgentDecisions(team){ return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && d.teamId === team.id && d.urgent; }); }
  function teamDecisions(team){ return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && d.teamId === team.id; }); }
  function healthOf(team){
    var project = team.currentProject || {}, decisions = safePendingDecisions(team), reviews = safePendingReviews(team);
    var urgent = urgentDecisions(team).length;
    var blocked = safeActiveWorkOrders(team).filter(function(w){ return w.status === 'blocked' || w.status === 'rework_required'; }).length + ((project.blockers || []).length);
    if (team.masterStatus === 'offline') return {cls:'blocked', label:'阻塞', risk:'high', riskLabel:'高'};
    if (urgent > 0 || blocked > 0 || project.health === 'critical') return {cls:'risk', label:'风险', risk:'high', riskLabel:'高'};
    if (decisions > 0 || reviews >= 3 || project.health === 'warning' || project.health === 'degraded') return {cls:'attention', label:'关注', risk:'medium', riskLabel:'中'};
    return {cls:'healthy', label:'健康', risk:'low', riskLabel:'低'};
  }
  function nextAction(team){
    var project = team.currentProject || {};
    var urgent = urgentDecisions(team)[0];
    var decision = teamDecisions(team)[0];
    var reviews = safePendingReviews(team);
    var active = safeActiveWorkOrders(team);
    var blocked = active.find(function(w){ return w.status === 'blocked' || w.status === 'rework_required'; });
    var reviewing = active.find(function(w){ return w.status === 'reviewing' || w.status === 'submitted'; });
    var running = active.find(function(w){ return w.status === 'running' || w.status === 'assigned'; });
    if (urgent) return {main:'优先处理待决策：' + urgent.title, sub:'进入待决策工作台完成用户确认'};
    if (blocked) return {main:'解除阻塞/返工：' + (blocked.title || blocked.id), sub:'协同规划岗重新调度任务单'};
    if (decision) return {main:'等待用户决策：' + decision.title, sub:'决策完成后继续任务单闭环'};
    if (reviews > 0 || reviewing) return {main:'推进交付审查：待审查 ' + reviews + ' 项', sub:(reviewing && reviewing.title) || '交付审查岗复核交付物'};
    if (running) return {main:'跟进执行验证：' + (running.title || project.name), sub:'实现验证岗继续推进'};
    return {main:'进入下一轮迭代计划', sub:'当前无阻塞待办'};
  }
  function renderProjectsV63325(){
    var page = document.getElementById('page-projects');
    if (!page) return;
    var teams = (appState().teams || []).filter(function(t){ return !!t.currentProject; });
    var total = teams.length;
    var healthRows = teams.map(function(team){ return {team:team, project:team.currentProject, health:healthOf(team), next:nextAction(team)}; });
    var healthy = healthRows.filter(function(r){ return r.health.cls === 'healthy'; }).length;
    var attention = healthRows.filter(function(r){ return r.health.cls === 'attention'; }).length;
    var risk = healthRows.filter(function(r){ return r.health.cls === 'risk' || r.health.cls === 'blocked'; }).length;
    var decisions = teams.reduce(function(n,t){ return n + safePendingDecisions(t); }, 0);
    var reviews = teams.reduce(function(n,t){ return n + safePendingReviews(t); }, 0);
    page.innerHTML = '<div class="project-health-v63325">'
      + '<div class="project-health-head-v63325">'
      + '<div class="project-health-title-v63325"><div class="project-health-title-main-v63325">📁 项目健康总表</div><div class="project-health-title-sub-v63325">从管理者视角横向查看 5 个项目的健康状态、任务推进、待决策、待审查、风险与下一步动作；重点识别哪些项目需要立即处理。</div></div>'
      + '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">项目数</div><div class="project-health-mini-value-v63325">' + total + '</div></div>'
      + '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">健康项目</div><div class="project-health-mini-value-v63325">' + healthy + '</div></div>'
      + '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">关注与风险</div><div class="project-health-mini-text-v63325 warn">关注 ' + attention + ' · 风险 ' + risk + '</div></div>'
      + '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">决策与审查</div><div class="project-health-mini-text-v63325 danger">待决策 ' + decisions + ' · 待审查 ' + reviews + '</div></div>'
      + '</div>'
      + '<div class="project-health-toolbar-v63325"><div class="project-health-toolbar-left-v63325"><span class="project-health-chip-v63325">健康状态：健康 · 关注 · 风险 · 阻塞</span><span class="project-health-chip-v63325">待决策项目可进入待决策工作台</span></div><div class="project-health-toolbar-right-v63325"><span class="project-health-chip-v63325">最近更新：刚刚</span></div></div>'
      + '<div class="project-health-card-v63325"><table class="project-health-table-v63325"><thead><tr>'
      + '<th>项目 / 阶段</th><th>负责团队</th><th>健康</th><th>任务进度</th><th>待办指标</th><th>风险</th><th>下一步</th><th>动作</th>'
      + '</tr></thead><tbody>'
      + healthRows.map(function(row){
        var team = row.team, project = row.project, h = row.health, next = row.next;
        var p = Math.max(0, Math.min(100, safeProgress(team)));
        var active = safeActiveWorkOrders(team).length;
        var dec = safePendingDecisions(team), rev = safePendingReviews(team);
        var met = metricOf(team);
        var blocker = (project.blockers && project.blockers[0] && project.blockers[0].desc) || next.sub || '';
        var decisionButton = dec > 0 ? '<button class="project-action-v63325 warn" onclick="switchNav(\'decisions\')">待决策</button>' : '';
        return '<tr>'
          + '<td class="project-title-cell-v63325"><div class="project-title-main-v63325" onclick="openTeamTab(\'' + esc(team.id) + '\')">' + esc(project.name || '-') + '</div><div><span class="project-stage-pill-v63325">' + esc(safeStage(project.stage)) + '</span></div><div class="project-title-sub-v63325">' + esc(project.description || team.task || '当前项目') + '</div></td>'
          + '<td><span class="proj-team" onclick="openTeamTab(\'' + esc(team.id) + '\')">' + esc(team.name) + '</span><div class="project-blocker-v63325">组长：' + esc(team.masterCodename || '-') + '</div></td>'
          + '<td><span class="health-pill-v63325 ' + h.cls + '">' + esc(h.label) + '</span></td>'
          + '<td class="project-progress-cell-v63325"><div class="project-progress-top-v63325"><span>' + esc(safeStage(project.stage)) + '</span><span>' + p + '%</span></div><div class="project-progress-bar-v63325"><span style="width:' + Math.max(4,p) + '%"></span></div></td>'
          + '<td><div class="project-metric-grid-v63325"><div class="project-metric-v63325"><div class="project-metric-label-v63325">执行中</div><div class="project-metric-value-v63325">' + active + '</div></div><div class="project-metric-v63325"><div class="project-metric-label-v63325">待决策</div><div class="project-metric-value-v63325">' + dec + '</div></div><div class="project-metric-v63325"><div class="project-metric-label-v63325">待审查</div><div class="project-metric-value-v63325">' + rev + '</div></div></div></td>'
          + '<td><span class="risk-pill-v63325 ' + h.risk + '">' + esc(h.riskLabel) + '</span><div class="project-blocker-v63325">文档 ' + docSummary(project) + ' · ' + compactNumber(met.tokens) + ' Token</div></td>'
          + '<td class="project-next-v63325"><strong>' + esc(next.main) + '</strong><div class="project-blocker-v63325">' + esc(blocker) + '</div></td>'
          + '<td><div class="project-actions-v63325"><button class="project-action-v63325" onclick="openTeamTab(\'' + esc(team.id) + '\')">团队详情</button><button class="project-action-v63325" onclick="window.openTeamRunDrawer && window.openTeamRunDrawer(\'' + esc(team.id) + '\',\'flow\')">任务闭环</button>' + decisionButton + '</div></td>'
          + '</tr>';
      }).join('')
      + '</tbody></table></div></div>';
  }
  window.renderProjects = renderProjectsV63325;
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  function boot(){ setVersion(); if (document.getElementById('page-projects') && document.getElementById('page-projects').classList.contains('active')) renderProjectsV63325(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 200); }); else setTimeout(boot, 200);
  setTimeout(boot, 800); setTimeout(boot, 2000); setTimeout(boot, 3200);
})();


;


(function(){
  function esc(v){
    if (typeof escapeHTML === 'function') return escapeHTML(v == null ? '' : String(v));
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }
  function appState(){ return (typeof currentState !== 'undefined' && currentState) ? currentState : (window.currentState || {teams:[], workers:[]}); }
  function asset(rel){
    var isFile = window.location.protocol === 'file:' || window.location.pathname.indexOf('/prototypes/') >= 0;
    return (isFile ? './' : '/docs/prototypes/') + rel;
  }
  function roleTemplate(w){
    var role = (w && w.role) || '';
    var label = (w && (w.projectRole || w.roleLabel || '')) || '';
    if (w && (w.teamRole === 'leader' || w.isLeader)) return {id:'TPL-PLANNER', name:'协同规划岗', type:'leader', common:'通用协作技能', key:'planner'};
    if (role === '@fixer' || /实现|开发|建模|修复/.test(label)) return {id:'TPL-IMPLEMENTER', name:'实现验证岗', type:'worker', common:'通用工程技能', key:'implementer'};
    if (role === '@designer' || /审查|验收|质量|评审/.test(label)) return {id:'TPL-REVIEWER', name:'交付审查岗', type:'reviewer', common:'通用审查技能', key:'reviewer'};
    return {id:'TPL-IMPLEMENTER', name:'实现验证岗', type:'worker', common:'通用工程技能', key:'implementer'};
  }
  function roleDisplay(w){
    try { if (typeof getDisplayRole === 'function') return getDisplayRole(w); } catch(e){}
    return roleTemplate(w).name;
  }
  function roleClass(w){
    var tpl = roleTemplate(w);
    if (tpl.key === 'planner') return 'role-explorer';
    if (tpl.key === 'reviewer') return 'role-designer';
    return 'role-fixer';
  }
  function statusLabel(st){
    try { if (typeof getStatusLabel === 'function') return getStatusLabel(st); } catch(e){}
    return ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线',unclaimed:'待分配'}[st] || st || '未知');
  }
  function compact(n){
    n = Number(n || 0); var abs = Math.abs(n); function clean(x){ return x.toFixed(1).replace(/\.0$/,''); }
    if (abs >= 1e9) return clean(n/1e9)+'G';
    if (abs >= 1e6) return clean(n/1e6)+'M';
    if (abs >= 1e3) return clean(n/1e3)+'K';
    return String(Math.round(n));
  }
  function teamIndexFromId(teamId){ var m = String(teamId || '').match(/(\d+)/); return m ? Math.max(1, Math.min(5, Number(m[1]))) : 1; }
  function avatarIndex(w){
    var idx = teamIndexFromId(w && w.teamId);
    if (!w || !w.id) return idx;
    var n = Number(String(w.id).replace(/\D/g,'')) || idx;
    return Math.max(1, Math.min(5, ((n - 1) % 5) + 1));
  }
  function avatarType(w){
    var tpl = roleTemplate(w);
    if (tpl.key === 'planner') return 'leader-planner';
    if (tpl.key === 'reviewer') return 'reviewer';
    return 'implementer';
  }
  function avatarSrc(w){
    var type = avatarType(w), idx = avatarIndex(w);
    if (type === 'leader-planner') idx = teamIndexFromId(w && w.teamId);
    return asset('pic/avatars/avatar-' + type + '-' + String(idx).padStart(2,'0') + '-large.png');
  }
  function skillsFor(w){
    try { if (typeof getSkillsForRole === 'function') return getSkillsForRole(w.role) || []; } catch(e){}
    var tpl = roleTemplate(w);
    var base = [{id:'common-collab', name:tpl.common, description:'任务单协作、上下文同步、状态回执'}];
    if (tpl.key === 'planner') base.push({id:'task-planning', name:'任务拆解与决策归纳', description:'拆分任务单、识别待决策、推动审查闭环'});
    if (tpl.key === 'implementer') base.push({id:'implementation-verify', name:'实现与验证', description:'执行开发/配置任务并提交自测回执'});
    if (tpl.key === 'reviewer') base.push({id:'delivery-review', name:'交付审查', description:'审查交付物、提出返工或通过意见'});
    return base;
  }
  function allWorkers(){
    var st = appState(), out=[];
    (st.teams || []).forEach(function(t){
      out.push({id:t.masterId || ('leader-' + t.id), name:t.masterCodename || t.name + '组长', role:'@explorer', projectRole:'协同规划岗', status:t.masterStatus === 'offline' ? 'offline' : 'busy', teamId:t.id, teamName:t.name, teamRole:'leader', isLeader:true, currentTaskSummary:t.task || '需求澄清 / 任务拆解 / 进度跟踪', session:t.sessionId || '', opsMetrics:t.leaderOpsMetrics || {}});
      (t.members || []).forEach(function(m){ out.push(Object.assign({}, m, {teamId:t.id, teamName:t.name, teamRole:'member'})); });
    });
    (st.workers || []).forEach(function(w){ if (w.role !== '@oracle') out.push(Object.assign({}, w, {teamRole:w.teamRole || 'pool', teamName:w.teamName || ''})); });
    return out.filter(function(w){ return w && w.role !== '@oracle'; });
  }
  function bindingFor(w){
    var tpl = roleTemplate(w), teamNo = teamIndexFromId(w && w.teamId), idx = avatarIndex(w);
    var pool = !w.teamId || w.status === 'unclaimed';
    var offline = w.status === 'offline';
    var host = pool ? 'runtime-host-standby' : ('runtime-host-' + (teamNo <= 2 ? 'a' : teamNo <= 4 ? 'b' : 'c'));
    var node = pool ? 'node-unassigned' : ('opencode-t' + teamNo + '-' + tpl.key + '-' + idx);
    var workspace = pool ? '未初始化，待加入团队后创建' : ('/srv/agent-team/workspaces/' + (w.teamId || 'pool') + '/' + String(w.id || 'agent').toLowerCase());
    var sync = pool ? '待绑定' : (offline ? '已保留，离线' : '已同步');
    var cls = pool ? 'warn' : (offline ? 'offline' : 'ok');
    return {
      templateId: tpl.id,
      templateName: tpl.name,
      host: host,
      node: node,
      workspace: workspace,
      skillSnapshot: pool ? '待生成' : ('skill-snap-' + tpl.key + '-t' + teamNo + '-v3'),
      route: pool ? '待注册' : ('agent://' + (w.id || 'agent').toLowerCase()),
      sync: sync,
      cls: cls,
      lifecycle: pool ? '待启用' : (offline ? '停用保留 workspace' : '启用中')
    };
  }
  function teamText(w){
    if (!w.teamId) return '共享池 / 未分配';
    return (w.teamName || '团队') + ' · ' + ((w.teamRole === 'leader' || w.isLeader) ? '组长' : '成员');
  }
  function focusText(w){ return w.currentTaskSummary || ((w.teamRole === 'leader' || w.isLeader) ? '任务协调 / 决策把关 / 里程碑跟踪' : '任务单执行 / 自测回执 / 状态同步'); }
  function findWorker(id){ return allWorkers().find(function(w){ return w.id === id; }) || null; }
  function updateStats(list){
    var set=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('statTotal', list.length);
    set('statOnline', list.filter(function(w){ return w.status !== 'offline' && w.status !== 'unclaimed'; }).length);
    set('statBusy', list.filter(function(w){ return w.status === 'busy'; }).length);
    var uniq={}; list.forEach(function(w){ skillsFor(w).forEach(function(s){ uniq[s.id || s.name] = true; }); });
    set('statSkills', Object.keys(uniq).length);
  }
  function renderSummary(list){
    var page = document.getElementById('page-pool'); if (!page) return;
    var old = page.querySelector('.employee-runtime-brief-v63326'); if (old) old.remove();
    var hintOld = page.querySelector('.employee-runtime-hint-v63326'); if (hintOld) hintOld.remove();
    var bound = list.filter(function(w){ return w.teamId && w.status !== 'unclaimed'; }).length;
    var synced = list.filter(function(w){ return bindingFor(w).sync === '已同步'; }).length;
    var hosts = {}; list.forEach(function(w){ var b=bindingFor(w); if (b.host && b.host !== 'runtime-host-standby') hosts[b.host]=true; });
    var snapshots = {}; list.forEach(function(w){ var b=bindingFor(w); if (b.skillSnapshot !== '待生成') snapshots[b.skillSnapshot]=true; });
    var summary = document.createElement('div');
    summary.className = 'employee-runtime-brief-v63326';
    summary.innerHTML = '<div class="employee-runtime-title-v63326"><div class="employee-runtime-title-main-v63326">👥 数字员工实例与运行绑定</div><div class="employee-runtime-title-sub-v63326">本页只表达实例层关系：岗位模板 → 技能快照 → OpenCode Runtime → workspace / route。岗位定义和 Skill 编辑仍在“岗位 / 技能”页维护。</div></div>'
      + '<div class="employee-runtime-mini-v63326"><div class="employee-runtime-mini-label-v63326">实例总数</div><div class="employee-runtime-mini-value-v63326">' + list.length + '</div></div>'
      + '<div class="employee-runtime-mini-v63326"><div class="employee-runtime-mini-label-v63326">已绑定运行体</div><div class="employee-runtime-mini-value-v63326">' + bound + '</div></div>'
      + '<div class="employee-runtime-mini-v63326"><div class="employee-runtime-mini-label-v63326">RuntimeHost</div><div class="employee-runtime-mini-value-v63326">' + Object.keys(hosts).length + '</div></div>'
      + '<div class="employee-runtime-mini-v63326"><div class="employee-runtime-mini-label-v63326">技能快照</div><div class="employee-runtime-mini-text-v63326 ok">' + Object.keys(snapshots).length + ' 个已生成</div></div>'
      + '<div class="employee-runtime-mini-v63326"><div class="employee-runtime-mini-label-v63326">同步状态</div><div class="employee-runtime-mini-text-v63326 ' + (synced===bound?'ok':'warn') + '">已同步 ' + synced + ' / ' + bound + '</div></div>';
    var stats = document.getElementById('workerStatsBar');
    if (stats && stats.parentNode) stats.parentNode.insertBefore(summary, stats);
    var hint = document.createElement('div');
    hint.className = 'employee-runtime-hint-v63326';
    hint.innerHTML = '<span><strong>实例链路：</strong>AgentTemplate 产生数字员工实例，实例继承岗位技能，启用后绑定 RuntimeHost / RuntimeNode 与 workspace。</span><span>点击员工卡查看绑定详情</span>';
    if (stats && stats.parentNode) stats.parentNode.insertBefore(hint, stats.nextSibling);
  }
  function card(w){
    var b = bindingFor(w), skills = skillsFor(w), leader = w.teamRole === 'leader' || w.isLeader;
    var statusDot = ['idle','busy','offline'].indexOf(w.status)>=0 ? w.status : (w.status === 'unclaimed' ? 'unclaimed' : 'idle');
    var skillLabel = skills.length ? (skills.length + ' 项') : '未绑定';
    return '<div class="worker-card worker-card-v14 clickable ' + (w.status === 'offline' ? 'offline' : '') + '" onclick="window.openWorkerDetailV63326(\'' + esc(w.id) + '\')">'
      + '<div class="worker-avatar-panel"><span class="worker-card-avatar worker-card-avatar-large ' + (leader ? 'leader-avatar-v22' : '') + '"><img src="' + esc(avatarSrc(w)) + '" alt="" loading="lazy"><span class="persona-status-dot ' + esc(statusDot) + '"></span></span><span class="worker-status-pill">' + esc(statusLabel(w.status)) + '</span></div>'
      + '<div class="worker-info-panel"><div class="worker-title-line"><span class="worker-card-name">' + esc(w.name) + '</span><span class="role-badge ' + esc(roleClass(w)) + '">' + esc(roleTemplate(w).name) + '</span></div>'
      + '<div class="worker-role-line">' + esc(b.templateId + ' · ' + roleDisplay(w)) + '</div>'
      + '<div class="worker-focus-line" title="' + esc(focusText(w)) + '">' + esc(focusText(w)) + '</div>'
      + '<div class="worker-meta-strip"><div class="worker-meta-chip" title="' + esc(teamText(w)) + '">所属 <strong>' + esc(teamText(w)) + '</strong></div><div class="worker-meta-chip">技能 <strong>' + esc(skillLabel) + '</strong></div></div>'
      + '<div class="employee-runtime-row-v63326"><div class="worker-meta-chip runtime-chip-v63326">Runtime <strong>' + esc(b.node) + '</strong></div><div class="worker-meta-chip snapshot-chip-v63326">快照 <strong>' + esc(b.skillSnapshot) + '</strong></div></div>'
      + '<div><span class="runtime-badge-v63326 ' + esc(b.cls) + '">' + esc(b.sync) + '</span></div>'
      + '</div><div class="card-actions worker-card-actions" onclick="event.stopPropagation();"><button class="icon-btn" title="运行监控" onclick="event.stopPropagation(); window.openWorkerDetailV63326(\'' + esc(w.id) + '\')">▣</button></div></div>';
  }
  function group(key,title,workers,icon){
    if (!workers.length) return '';
    return '<div class="role-group" id="role-group-' + esc(key) + '"><div class="role-group-header" onclick="toggleRoleGroup && toggleRoleGroup(\'' + esc(key) + '\')"><div style="display:flex;align-items:center;gap:10px;"><span style="font-weight:600;display:flex;align-items:center;gap:6px;">' + (icon || '') + esc(title) + '</span><span class="badge" style="margin:0;background:var(--info);font-size:12px;padding:2px 8px;font-weight:normal;">' + workers.length + ' 个实例</span></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div><div class="role-group-content">' + workers.map(card).join('') + '</div></div>';
  }
  window.renderWorkerPool = function(){
    var container = document.getElementById('workerPoolContainer'); if (!container) return;
    var roleFilter = document.getElementById('roleFilter');
    if (roleFilter && roleFilter.innerHTML.indexOf('系统架构师') >= 0) roleFilter.innerHTML = '<option value="all">全部岗位</option><option value="@explorer">协同规划岗（组长）</option><option value="@fixer">实现验证岗</option><option value="@designer">交付审查岗</option>';
    var all = allWorkers(); updateStats(all); renderSummary(all);
    var keyword = ((document.getElementById('searchWorkerInput') || {}).value || '').toLowerCase();
    var role = (roleFilter || {}).value || 'all';
    var status = (document.getElementById('statusFilter') || {}).value || 'all';
    var filtered = all.filter(function(w){
      var b = bindingFor(w);
      var text = [w.name,w.id,roleDisplay(w),roleTemplate(w).name,statusLabel(w.status),focusText(w),w.teamName,b.templateId,b.node,b.workspace,b.skillSnapshot].join(' ').toLowerCase();
      return text.indexOf(keyword) >= 0 && (role === 'all' || w.role === role) && (status === 'all' || w.status === status);
    });
    var groupBy = (document.querySelector('[data-group-tab].active') || {}).dataset?.groupTab || 'team';
    var out = '';
    if (groupBy === 'status') {
      out += group('status-busy','忙碌 / 执行中', filtered.filter(function(w){return w.status==='busy';}), '🟣');
      out += group('status-idle','在线 / 空闲', filtered.filter(function(w){return w.status==='idle' || w.status==='online';}), '🟢');
      out += group('status-unclaimed','待绑定 / 待分配', filtered.filter(function(w){return w.status==='unclaimed';}), '🟡');
      out += group('status-offline','离线 / workspace 保留', filtered.filter(function(w){return w.status==='offline';}), '⚫');
    } else {
      (appState().teams || []).forEach(function(t){ out += group('team-' + t.id, t.name, filtered.filter(function(w){return w.teamId===t.id;}), '<span style="color:var(--info)">◆</span>'); });
      out += group('team-none','共享池 / 待绑定运行体', filtered.filter(function(w){return !w.teamId;}), '<span style="color:var(--warning)">⊘</span>');
    }
    container.innerHTML = out || '<div class="empty-state">没有找到符合条件的数字员工</div>';
  };
  window.filterWorkers = function(){ window.renderWorkerPool(); };
  window.switchWorkerGroupTab = function(tab){ document.querySelectorAll('[data-group-tab]').forEach(function(el){ el.classList.toggle('active', el.dataset.groupTab === tab); }); setTimeout(window.renderWorkerPool, 0); };
  window.openWorkerDetailV63326 = function(id){
    var w = findWorker(id); if (!w) return;
    var b = bindingFor(w), tpl = roleTemplate(w), skills = skillsFor(w);
    var title = document.getElementById('workerDrawerTitle'), body = document.getElementById('workerDrawerBody'), footer = document.getElementById('workerDrawerFooter');
    if (!title || !body) return;
    var skillHtml = skills.length ? '<div class="worker-skill-list-v63326">' + skills.map(function(s){ return '<span class="worker-skill-chip-v63326">' + esc(s.name || s.id) + '</span>'; }).join('') + '</div>' : '<span style="color:#94a3b8;">暂无技能绑定</span>';
    title.innerHTML = esc(w.name || '-') + '<span class="drawer-title-badge">' + esc(tpl.name) + '</span>';
    body.innerHTML = ''
      + '<div class="worker-drawer-section-v63326"><div class="worker-drawer-section-title-v63326">👤 实例身份</div><div class="worker-drawer-section-body-v63326"><div class="worker-drawer-grid-v63326">'
      + '<div class="worker-drawer-k-v63326">实例编号</div><div class="worker-drawer-v-v63326 mono">' + esc(w.id || '-') + '</div>'
      + '<div class="worker-drawer-k-v63326">归属团队</div><div class="worker-drawer-v-v63326">' + esc(teamText(w)) + '</div>'
      + '<div class="worker-drawer-k-v63326">当前状态</div><div class="worker-drawer-v-v63326"><span class="runtime-badge-v63326 ' + esc(b.cls) + '">' + esc(statusLabel(w.status) + ' · ' + b.lifecycle) + '</span></div>'
      + '<div class="worker-drawer-k-v63326">当前任务</div><div class="worker-drawer-v-v63326">' + esc(focusText(w)) + '</div>'
      + '</div></div></div>'
      + '<div class="worker-drawer-section-v63326"><div class="worker-drawer-section-title-v63326">🧩 岗位模板与技能快照</div><div class="worker-drawer-section-body-v63326"><div class="worker-drawer-grid-v63326">'
      + '<div class="worker-drawer-k-v63326">AgentTemplate</div><div class="worker-drawer-v-v63326"><strong>' + esc(b.templateId) + '</strong> · ' + esc(b.templateName) + '</div>'
      + '<div class="worker-drawer-k-v63326">继承技能</div><div class="worker-drawer-v-v63326">' + skillHtml + '</div>'
      + '<div class="worker-drawer-k-v63326">SkillSnapshot</div><div class="worker-drawer-v-v63326 mono">' + esc(b.skillSnapshot) + '</div>'
      + '<div class="worker-drawer-k-v63326">同步状态</div><div class="worker-drawer-v-v63326"><span class="runtime-badge-v63326 ' + esc(b.cls) + '">' + esc(b.sync) + '</span></div>'
      + '</div></div></div>'
      + '<div class="worker-drawer-section-v63326"><div class="worker-drawer-section-title-v63326">⚙️ OpenCode Runtime 绑定</div><div class="worker-drawer-section-body-v63326"><div class="worker-drawer-grid-v63326">'
      + '<div class="worker-drawer-k-v63326">RuntimeHost</div><div class="worker-drawer-v-v63326 mono">' + esc(b.host) + '</div>'
      + '<div class="worker-drawer-k-v63326">RuntimeNode</div><div class="worker-drawer-v-v63326 mono">' + esc(b.node) + '</div>'
      + '<div class="worker-drawer-k-v63326">Workspace</div><div class="worker-drawer-v-v63326 mono">' + esc(b.workspace) + '</div>'
      + '<div class="worker-drawer-k-v63326">Agent Route</div><div class="worker-drawer-v-v63326 mono">' + esc(b.route) + '</div>'
      + '</div><div class="runtime-flow-v63326"><div class="runtime-flow-step-v63326"><strong>岗位</strong>模板定义</div><div class="runtime-flow-step-v63326"><strong>技能</strong>快照初始化</div><div class="runtime-flow-step-v63326"><strong>运行体</strong>绑定节点</div><div class="runtime-flow-step-v63326"><strong>会话</strong>按 route 转发</div></div></div></div>';
    if (footer) footer.innerHTML = '<button type="button" class="drawer-action-btn secondary" onclick="closeDrawer && closeDrawer()">关闭</button>' + (w.teamId ? '<button type="button" class="drawer-action-btn primary" onclick="closeDrawer && closeDrawer(); openTeamTab && openTeamTab(\'' + esc(w.teamId) + '\')">查看团队</button>' : '<button type="button" class="drawer-action-btn primary" disabled>待绑定团队</button>');
    var ov = document.getElementById('workerDrawerOverlay'), pn = document.getElementById('workerDrawerPanel');
    if (ov) ov.classList.add('open'); if (pn) pn.classList.add('open');
  };
  window.openDrawer = window.openWorkerDetailV63326;
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  function boot(){ setVersion(); if (document.getElementById('page-pool') && document.getElementById('page-pool').classList.contains('active')) window.renderWorkerPool(); }
  var oldSwitchNav = window.switchNav;
  if (typeof oldSwitchNav === 'function' && !oldSwitchNav.__v63326WorkerWrapped) {
    var wrapped = function(){ var ret = oldSwitchNav.apply(this, arguments); if (arguments[0] === 'pool') setTimeout(window.renderWorkerPool, 80); return ret; };
    wrapped.__v63326WorkerWrapped = true;
    window.switchNav = wrapped;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 220); }); else setTimeout(boot, 220);
  setTimeout(boot, 900); setTimeout(boot, 2200);
})();


;


(function(){
  function setVersion(){
    document.title = '智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = 'v0.6.33.45 · Mock 演示'; });
  }
  function patchRoleFilter(){
    var roleFilter = document.getElementById('roleFilter');
    if (!roleFilter) return;
    var expected = '<option value="all">全部岗位</option><option value="@explorer">协同规划岗（组长）</option><option value="@fixer">实现验证岗</option><option value="@designer">交付审查岗</option>';
    if (roleFilter.innerHTML !== expected) roleFilter.innerHTML = expected;
  }
  function patchSummary(){
    var page = document.getElementById('page-pool'); if (!page) return;
    var label = page.querySelector('.employee-runtime-mini-label-v63326');
    if (label && label.textContent.trim() === '实例总数') label.textContent = '团队编队实例';
    document.querySelectorAll('#page-pool .employee-runtime-mini-label-v63326').forEach(function(el){ if (el.textContent.trim() === 'RuntimeHost') el.textContent = '运行主机'; });
    var titleSub = page.querySelector('.employee-runtime-title-sub-v63326');
    if (titleSub) titleSub.textContent = '卡片展示实例概览；运行节点、技能快照、工作目录、会话路由等技术明细下沉到员工详情抽屉。';
    var hint = page.querySelector('.employee-runtime-hint-v63326');
    if (hint && !hint.classList.contains('employee-runtime-hint-v63327')) {
      hint.classList.add('employee-runtime-hint-v63327');
      hint.innerHTML = '<span class="scope-line"><span class="scope-badge">口径说明</span><span>当前页展示 22 个团队编队实例（5 组长 + 17 成员）；首页数字员工 25 为运营总口径，含全局助手 / 预留支撑实例等非团队编队对象。</span></span><span>点击员工卡查看 Runtime 明细</span>';
    }
  }
  function patchCards(){
    document.querySelectorAll('#page-pool .worker-card-v14').forEach(function(card){
      if (card.querySelector('.employee-runtime-card-note-v63327')) return;
      var panel = card.querySelector('.worker-info-panel'); if (!panel) return;
      var badge = card.querySelector('.runtime-badge-v63326');
      var sync = badge ? badge.textContent.trim() : '查看详情';
      var note = document.createElement('div');
      note.className = 'employee-runtime-card-note-v63327';
      note.innerHTML = '运行绑定 · 明细在抽屉';
      var statusWrap = badge ? badge.parentNode : null;
      if (statusWrap && statusWrap.parentNode === panel) panel.insertBefore(note, statusWrap);
      else panel.appendChild(note);
    });
  }
  function patchDrawer(){
    var body = document.getElementById('workerDrawerBody'); if (!body) return;
    // 技术术语保留英文括注，但中文名优先，降低管理者阅读成本。
    body.querySelectorAll('.worker-drawer-k-v63326').forEach(function(el){
      var t = el.textContent.trim();
      var map = {
        'AgentTemplate':'岗位模板',
        'SkillSnapshot':'技能快照',
        'RuntimeHost':'运行主机',
        'RuntimeNode':'运行节点',
        'Workspace':'工作目录',
        'Agent Route':'会话路由'
      };
      if (map[t]) el.textContent = map[t];
    });
    var runtimeTitle = Array.prototype.find.call(body.querySelectorAll('.worker-drawer-section-title-v63326'), function(el){ return el.textContent.indexOf('OpenCode Runtime') >= 0; });
    if (runtimeTitle && runtimeTitle.innerHTML.indexOf('v63327-soft') < 0) runtimeTitle.innerHTML = '⚙️ OpenCode Runtime 绑定 <span class="v63327-soft">运行体 / 工作目录 / 会话路由</span>';
    var firstSection = body.querySelector('.worker-drawer-section-v63326');
    if (firstSection && !body.querySelector('.worker-drawer-scope-note-v63327')) {
      var note = document.createElement('div');
      note.className = 'worker-drawer-scope-note-v63327';
      note.textContent = '说明：卡片只展示运行绑定概览；本抽屉展示实例身份、岗位模板、技能快照、运行节点、工作目录和会话路由，用于后续对接 OpenCode Runtime / Gateway。';
      firstSection.querySelector('.worker-drawer-section-body-v63326')?.appendChild(note);
    }
  }
  function patchEmployeePage(){
    setVersion();
    patchRoleFilter();
    patchSummary();
    patchCards();
  }
  var oldRender = window.renderWorkerPool;
  if (typeof oldRender === 'function' && !oldRender.__v63327Wrapped) {
    var wrappedRender = function(){ var ret = oldRender.apply(this, arguments); setTimeout(patchEmployeePage, 0); return ret; };
    wrappedRender.__v63327Wrapped = true;
    window.renderWorkerPool = wrappedRender;
    window.filterWorkers = function(){ window.renderWorkerPool(); };
  }
  var oldOpen = window.openWorkerDetailV63326;
  if (typeof oldOpen === 'function' && !oldOpen.__v63327Wrapped) {
    var wrappedOpen = function(){ var ret = oldOpen.apply(this, arguments); setTimeout(patchDrawer, 0); return ret; };
    wrappedOpen.__v63327Wrapped = true;
    window.openWorkerDetailV63326 = wrappedOpen;
    window.openWorkerDetailV63327 = wrappedOpen;
    window.openDrawer = wrappedOpen;
  }
  var oldSwitchNav = window.switchNav;
  if (typeof oldSwitchNav === 'function' && !oldSwitchNav.__v63327EmployeeWrapped) {
    var wrappedSwitch = function(){ var ret = oldSwitchNav.apply(this, arguments); if (arguments[0] === 'pool') setTimeout(patchEmployeePage, 160); return ret; };
    wrappedSwitch.__v63327EmployeeWrapped = true;
    window.switchNav = wrappedSwitch;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchEmployeePage, 260); });
  else setTimeout(patchEmployeePage, 260);
  setTimeout(patchEmployeePage, 900);
  setTimeout(patchEmployeePage, 2300);
})();


;


(function(){
  var VERSION = 'v0.6.33.45';
  function setVersionV63328(){
    document.title = '智能软件工厂 ' + VERSION + ' · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = VERSION + ' · Mock 演示'; });
  }
  function patchRoleData(){
    if (typeof roles !== 'undefined' && Array.isArray(roles) && !roles.__v63328Patched) {
      roles.length = 0;
      roles.push(
        { id:'explorer', displayName:'协同规划岗', templateName:'协同规划岗数字员工模板', description:'作为团队组长，负责需求沟通、任务拆解、进度跟踪、冲突裁决与待决策升级。', responsibilities:['需求沟通','任务拆解','进度跟踪','决策升级'], createPolicy:'每个项目团队通常配置 1 个协同规划岗实例，作为团队组长。' },
        { id:'fixer', displayName:'实现验证岗', templateName:'实现验证岗数字员工模板', description:'负责实现、配置、测试运行、缺陷修复与交付前自验证，是任务单执行主力。', responsibilities:['代码实现','配置建模','测试运行','缺陷修复'], createPolicy:'按项目规模创建多个实现验证岗实例，支持并行执行。' },
        { id:'designer', displayName:'交付审查岗', templateName:'交付审查岗数字员工模板', description:'负责交付审查、验收把关、返工建议与闭环确认，避免未达标结果直接交付。', responsibilities:['交付审查','验收把关','返工建议','闭环确认'], createPolicy:'每个团队至少配置 1 个交付审查岗实例，必要时跨项目复用。' }
      );
      roles.__v63328Patched = true;
    }
    if (typeof roleSkillMappings !== 'undefined' && Array.isArray(roleSkillMappings) && !roleSkillMappings.__v63328Patched) {
      roleSkillMappings.length = 0;
      roleSkillMappings.push(
        { roleId:'explorer', skillId:'decision-tradeoff', source:'role', enabled:true },
        { roleId:'explorer', skillId:'sct-to-customer-table', source:'role', enabled:true },
        { roleId:'fixer', skillId:'code-edit', source:'role', enabled:true },
        { roleId:'fixer', skillId:'test-run', source:'role', enabled:true },
        { roleId:'fixer', skillId:'sct-to-customer-table', source:'role', enabled:true },
        { roleId:'designer', skillId:'test-run', source:'role', enabled:true },
        { roleId:'designer', skillId:'visual-review', source:'role', enabled:true },
        { roleId:'designer', skillId:'prototype-output', source:'role', enabled:true }
      );
      roleSkillMappings.__v63328Patched = true;
    }
    if (typeof skills !== 'undefined' && Array.isArray(skills)) {
      skills.forEach(function(s){
        if (s.id === 'architecture-review') { s.name='技术方案权衡'; s.description='分析方案边界、依赖关系和关键风险，不作为常驻专家岗位展示。'; s.content='围绕任务单进行方案边界、依赖关系和风险权衡。'; s.mdContent='# 技术方案权衡\n\n围绕任务单进行方案边界、依赖关系和风险权衡。'; }
        if (s.id === 'visual-review') { s.name='交付审查'; s.description='对交付物进行可用性、完整性、一致性审查。'; s.content='检查交付物是否满足任务单验收标准，并给出返工或通过意见。'; s.mdContent='# 交付审查\n\n检查交付物是否满足任务单验收标准，并给出返工或通过意见。'; }
        if (s.id === 'prototype-output') { s.name='验收报告输出'; s.description='输出交付审查结论、验收记录和闭环说明。'; s.content='整理交付审查结论、验收记录和闭环说明。'; s.mdContent='# 验收报告输出\n\n整理交付审查结论、验收记录和闭环说明。'; }
      });
    }
  }
  function patchRolesPage(){
    setVersionV63328(); patchRoleData();
    var page=document.getElementById('page-roles'); if(!page) return;
    var titleMeta=page.querySelector('.page-title-meta'); if(titleMeta) titleMeta.textContent='AgentTemplate = 可实例化的岗位能力模板；当前仅保留 AI 原生三类岗位';
    var statusPills=page.querySelector('.docs-status-strip');
    if(statusPills) statusPills.innerHTML='<span class="docs-status-pill active">有效岗位模板 3</span><span class="docs-status-pill">协同规划 / 实现验证 / 交付审查</span><span class="docs-status-pill warn">实例继承：通用技能 + 岗位技能</span><span class="docs-status-pill">专家能力沉淀为技能/评审机制</span>';
    var lead=page.querySelector('.card[style*="border-color:#bfdbfe"] div');
    if(lead) lead.innerHTML='<strong>主链路：</strong>岗位定义能力模板 → 基于岗位创建数字员工实例 → 实例继承岗位技能 → 匹配团队与项目运行；专家能力按任务需要沉淀为技能/评审机制，不再作为常驻岗位。';
    if(!page.querySelector('.role-consistency-note-v63328')) { var note=document.createElement('div'); note.className='role-consistency-note-v63328'; note.innerHTML='<strong>v0.6.33 收口口径：</strong>当前配置态岗位与运行态团队保持一致，仅保留协同规划岗、实现验证岗、交付审查岗。'; var cards=page.querySelector('#roleCardsContainer'); if(cards && cards.parentNode) cards.parentNode.insertBefore(note,cards); }
    if(typeof renderRolesPage==='function') renderRolesPage();
  }
  function patchSkillMapping(){
    setVersionV63328(); patchRoleData();
    var select=document.getElementById('mappingRoleSelect');
    if(select) { var html='<option value="explorer">@explorer · 协同规划岗</option><option value="fixer">@fixer · 实现验证岗</option><option value="designer">@designer · 交付审查岗</option>'; if(select.innerHTML!==html) select.innerHTML=html; }
    var panel=document.getElementById('skillMappingPanel');
    if(panel && !panel.querySelector('.skill-mapping-note-v63328')) { var note=document.createElement('div'); note.className='skill-mapping-note-v63328'; note.textContent='岗位技能匹配已按 v0.6.33 口径收口：三类岗位模板继承通用技能，并按岗位匹配任务拆解、实现验证、交付审查相关技能。'; panel.insertBefore(note,panel.firstChild); }
    if(typeof renderSkillTable==='function') renderSkillTable();
    if(select && typeof renderRoleMapping==='function') renderRoleMapping(select.value || 'explorer');
  }
  function renameVisibleExpertInRuntime(){
    // 运行态展示已封板，不改拓扑结构和数量；仅把旧专家成员残留文案改为交付审查岗口径，避免岗位口径冲突。
    ['#page-overview','#page-team-detail-template','#page-projects','#page-decisions'].forEach(function(sel){
      var root=document.querySelector(sel); if(!root) return;
      var walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); var nodes=[];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function(n){
        var v=n.nodeValue || '';
        if(/技术专家-1|架构专家-1|架构\d+-\d+/.test(v)) v=v.replace(/技术专家-1|架构专家-1|架构\d+-\d+/g,'审查4-2');
        if(/系统架构师\s*\/\s*技术专家岗/.test(v)) v=v.replace(/系统架构师\s*\/\s*技术专家岗/g,'交付审查岗');
        if(/系统架构师|技术专家岗|架构专家|架构师/.test(v)) v=v.replace(/系统架构师|技术专家岗|架构专家|架构师/g,'交付审查');
        n.nodeValue=v;
      });
    });
  }
  function patchAll(){ setVersionV63328(); patchRoleData(); patchRolesPage(); patchSkillMapping(); renameVisibleExpertInRuntime(); }
  var oldSwitch=window.switchNav;
  if(typeof oldSwitch==='function' && !oldSwitch.__v63328ConsistencyWrapped) {
    var wrapped=function(){ var ret=oldSwitch.apply(this, arguments); setTimeout(function(){ setVersionV63328(); renameVisibleExpertInRuntime(); },120); if(arguments[0]==='roles') setTimeout(patchRolesPage,120); if(arguments[0]==='skills') setTimeout(patchSkillMapping,120); return ret; };
    wrapped.__v63328ConsistencyWrapped=true; window.switchNav=wrapped;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchAll,300); }); else setTimeout(patchAll,300);
  setTimeout(patchAll,1000); setTimeout(patchAll,2400);
  var ticks=0; var timer=setInterval(function(){ setVersionV63328(); renameVisibleExpertInRuntime(); if(++ticks>=10) clearInterval(timer); },700);
})();


;


(function(){
  var VERSION='v0.6.33.45';
  var projects=[
    {id:'proj-hr-vue-migration',name:'HR 代码迁移项目',stage:'build',stageLabel:'开发',progress:62,teamToken:8600000,sessions:316,health:'risk',desc:'前端从 Vue2 迁移到 Vue3，组件库由 Element UI 升级到 Ant Design Vue，同步梳理路由、表单、表格和权限适配。',task:'Vue2 到 Vue3 迁移与组件替换',current:'迁移路由与核心表单页',next:'批量替换 Element UI 组件并补齐回归用例',pendingReviews:2,pendingDecisions:1},
    {id:'proj-lowcode-mobile',name:'低代码移动端开发项目',stage:'design',stageLabel:'设计',progress:38,teamToken:3400000,sessions:142,health:'warning',desc:'围绕移动端低代码页面、物料协议、运行时容器和预览调试链路，完成第一版可演示闭环。',task:'移动端低代码运行时与物料协议',current:'梳理移动端物料协议',next:'输出页面预览与调试方案',pendingReviews:1,pendingDecisions:1},
    {id:'proj-erp-core',name:'ERP 系统',stage:'build',stageLabel:'开发',progress:54,teamToken:1200000000,sessions:860,health:'risk',desc:'覆盖采购、库存、财务核算和审批流关键链路，重点处理单据状态、接口契约和历史数据兼容。',task:'ERP 单据流与接口契约改造',current:'采购到库存单据流联调',next:'财务核算接口契约审查',pendingReviews:3,pendingDecisions:1},
    {id:'proj-device-mgmt',name:'设备管理系统',stage:'test',stageLabel:'测试',progress:72,teamToken:920500,sessions:76,health:'healthy',desc:'面向设备台账、巡检计划、告警处理和备件管理，完成可演示的业务闭环和质量审查。',task:'设备巡检与告警处理闭环',current:'巡检计划与告警规则联调',next:'执行交付审查与回归验证',pendingReviews:2,pendingDecisions:0},
    {id:'proj-agent-team',name:'智能软件工厂',stage:'build',stageLabel:'开发',progress:68,teamToken:14700000,sessions:438,health:'warning',desc:'智能软件工厂自身 POC，围绕首页、协作全景、任务单闭环、待决策工作台和运行体表达持续收敛。',task:'智能软件工厂 POC 原型收口',current:'整体一致性检查与演示路径准备',next:'串联首页到项目、团队、决策和员工 Runtime 的演示路径',pendingReviews:2,pendingDecisions:1}
  ];
  var teamMembers={
    t1:[['AGT-002','实现1-1','@fixer','实现验证岗','busy','迁移路由与核心表单页'],['AGT-003','实现1-2','@fixer','实现验证岗','idle','批量替换 Element UI 组件并补齐回归用例'],['AGT-004','审查1-1','@designer','交付审查岗','busy','交付审查与质量门禁']],
    t2:[['AGT-007','实现2-1','@fixer','实现验证岗','busy','移动端物料协议设计'],['AGT-008','实现2-2','@fixer','实现验证岗','idle','预览容器与调试链路'],['AGT-009','审查2-1','@designer','交付审查岗','idle','移动端组件验收清单']],
    t3:[['AGT-011','实现3-1','@fixer','实现验证岗','busy','采购到库存单据流联调'],['AGT-012','实现3-2','@fixer','实现验证岗','offline','接口契约补齐后恢复'],['AGT-013','审查3-1','@designer','交付审查岗','idle','财务凭证规则审查']],
    t4:[['AGT-015','实现4-1','@fixer','实现验证岗','busy','巡检计划与告警规则联调'],['AGT-016','实现4-2','@fixer','实现验证岗','idle','备件管理页面回归'],['AGT-017','审查4-1','@designer','交付审查岗','busy','设备模块交付审查'],['AGT-018','审查4-2','@designer','交付审查岗','idle','运行态字段占位审查']],
    t5:[['AGT-020','实现5-1','@fixer','实现验证岗','busy','整体一致性修复'],['AGT-021','实现5-2','@fixer','实现验证岗','idle','演示路径入口提示'],['AGT-022','审查5-1','@designer','交付审查岗','busy','收口评审与验证'],['AGT-023','审查5-2','@designer','交付审查岗','idle','交接包质量门禁']]
  };
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function setVersion(){document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型';document.querySelectorAll('.app-header-badge').forEach(function(el){el.textContent=VERSION+' · Mock 演示';});}
  function member(row){ var n=Number(String(row[0]||'').replace(/\D/g,''))||1; return {id:row[0],name:row[1],role:row[2],projectRole:row[3],status:row[4],currentTaskSummary:row[5],heartbeatTs:Date.now()-3000,templateId:row[2].replace('@',''), opsMetrics:{tokens: 420000 + n*37000, sessions: 12 + (n%9)*3, rounds: 60 + (n%11)*9}};}
  function patchState(){
    try{
      if(typeof currentState==='undefined' || !currentState.teams) return;
      currentState.teams.forEach(function(t,idx){
        var p=projects[idx]||projects[0];
        t.currentProject=t.currentProject||{};
        Object.assign(t.currentProject,{id:p.id,name:p.name,stage:p.stage,stageLabel:p.stageLabel,health:p.health,progress:p.progress,teamToken:p.teamToken,sessions:p.sessions,description:p.desc,workOrders:t.currentProject.workOrders||[],docs:t.currentProject.docs||[]});
        t.task=p.task; t.pendingDecisions=p.pendingDecisions; t.pendingReviews=p.pendingReviews; t.healthy=p.health!=='risk';
        var rows=teamMembers[t.id]; if(rows) t.members=rows.map(member);
        t.activities=[{time:Date.now()-120000,desc:'协同规划岗 '+(t.masterCodename||'组长')+' 更新项目任务单闭环与下一步动作'}, {time:Date.now()-240000,desc:'交付审查岗完成本轮质量门禁检查'}];
      });
    }catch(e){}
  }
  function enhanceRoleCodes(){
    var roots=[document.getElementById('page-roles'), document.getElementById('page-skills')].filter(Boolean);
    roots.forEach(function(root){
      var walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); var nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function(n){ var v=n.nodeValue||''; v=v.replace(/@explorer/g,'@planner').replace(/@fixer/g,'@implementer').replace(/@designer/g,'@reviewer'); n.nodeValue=v; });
    });
    var sel=document.getElementById('mappingRoleSelect');
    if(sel){ Array.from(sel.options).forEach(function(o){ o.textContent=o.textContent.replace(/@explorer/g,'@planner').replace(/@fixer/g,'@implementer').replace(/@designer/g,'@reviewer'); }); }
  }
  function rerenderActive(){
    try{ if(document.querySelector('#page-overview.active') && typeof renderOverview==='function') renderOverview(); }catch(e){}
    try{ if(document.querySelector('#page-projects.active') && typeof renderProjects==='function') renderProjects(); }catch(e){}
    try{ if(document.querySelector('#page-roles.active') && typeof renderRolesPage==='function') renderRolesPage(); }catch(e){}
    try{ if(document.querySelector('#page-skills.active') && typeof renderSkillTable==='function') { renderSkillTable(); if(typeof renderRoleMapping==='function') renderRoleMapping(document.getElementById('mappingRoleSelect')?.value||'explorer'); } }catch(e){}
  }
  function patchAll(){ setVersion(); patchState(); rerenderActive(); enhanceRoleCodes(); }
  var oldSwitch=window.switchNav;
  if(typeof oldSwitch==='function' && !oldSwitch.__v63329Wrapped){
    var wrapped=function(){var ret=oldSwitch.apply(this,arguments); setTimeout(patchAll,180); setTimeout(patchAll,900); return ret;};
    wrapped.__v63329Wrapped=true; window.switchNav=wrapped;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(patchAll,2600);}); else setTimeout(patchAll,2600);
  setTimeout(patchAll,3200); setTimeout(patchAll,5200);
  /* v0.6.33.45: disabled repeated patchAll polling; one-shot updates are enough */
  setTimeout(patchAll,1000);
})();


;


(function(){
  if (window.__stableDeliveryV063329FinalFix) return;
  window.__stableDeliveryV063329FinalFix = true;
  var VERSION='v0.6.33.45';
  var applying=false;
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function qs(id){ return document.getElementById(id); }
  function setText(id, v){ var el=qs(id); if(el && el.textContent!==String(v)) el.textContent=String(v); }
  function state(){ return (typeof currentState !== 'undefined' ? currentState : (window.currentState || {})); }
  function teams(){ return state().teams || []; }
  function teamMembers(t){ return (t && t.members || []).filter(function(m){ return m.role==='@fixer' || m.role==='@designer'; }); }
  function allDisplayWorkers(){ var out=[]; teams().forEach(function(t){ out.push({teamId:t.id,teamRole:'leader',status:t.masterStatus||'busy',opsMetrics:t.leaderOpsMetrics || t.opsMetrics || {}}); teamMembers(t).forEach(function(m){ out.push(m); }); }); return out; }
  function fmtToken(n){ n=Number(n||0); if(n>=1e9) return (n/1e9).toFixed(1).replace(/\.0$/,'')+'G'; if(n>=1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M'; if(n>=1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K'; return String(Math.round(n)); }
  function sum(list,key){ return list.reduce(function(a,x){return a + Number(((x.opsMetrics||{})[key])||0);},0); }
  function ensureFoot(card){ var x=card.querySelector('.stat-card-extra'); if(x) x.remove(); var foot=card.querySelector('.stat-card-foot'); if(!foot){ foot=document.createElement('div'); foot.className='stat-card-foot'; card.appendChild(foot); } return foot; }
  function setCard(counter,title,value,desc,trend,foot,onclick,titleTip){ var card=counter && counter.closest('.stat-card'); if(!card) return; card.classList.add('v063317-stat-card','clickable'); var titleEl=card.querySelector('.stat-card-title'); var descEl=card.querySelector('.stat-card-desc'); var trendEl=card.querySelector('.stat-card-trend'); if(titleEl) titleEl.textContent=title; counter.textContent=String(value); if(descEl) descEl.textContent=desc; if(trendEl){trendEl.textContent=trend; trendEl.classList.remove('up','down'); trendEl.classList.add('flat');} ensureFoot(card).innerHTML=(foot||[]).map(function(v){return '<span class="stat-card-mini">'+esc(v)+'</span>';}).join(''); card.onclick=onclick; card.title=titleTip||''; }
  function stableStats(){
    var ts=teams(); if(!ts.length) return;
    var workers=allDisplayWorkers();
    var leaders=ts.length || 5;
    var members=ts.reduce(function(n,t){ return n + teamMembers(t).length;},0) || 17;
    var online=workers.filter(function(w){return w.status!=='offline';}).length || 24;
    var offline=Math.max(0,(workers.length||25)-online) || 1;
    var busy=workers.filter(function(w){return w.status==='busy';}).length || 14;
    setCard(qs('statTeamCount'),'🏢 协作团队',5,'5 个项目团队运行中','消耗排行 →',['组长 '+leaders,'成员 '+members,'项目 5'],function(){ if(window.openOpsDrawer) window.openOpsDrawer('teams');},'点击查看团队 Token 与会话排行');
    setCard(qs('statMasterCount'),'👥 数字员工',25,'24 在线 · 1 离线','员工排行 →',['忙碌 14','Token 1.1G','会话 1282'],function(){ if(window.openOpsDrawer) window.openOpsDrawer('workers');},'点击查看员工 Token 与会话排行');
    setCard(qs('statWorkerCount'),'⚡ 任务执行',14,'任务单执行、审查、整改中','查看任务 →',['执行中 14','暂停 1','今日流转 13'],function(){ if(window.openTaskOpsDrawer) window.openTaskOpsDrawer();},'点击查看执行中任务');
    setCard(qs('statDecisionCount'),'⚠️ 待决策',14,'4 待决策 · 10 待审查','处理决策 →',['待决策 4','待审查 10','高风险 1'],function(){ if(window.openPendingOpsDrawer) window.openPendingOpsDrawer();},'点击查看待决策与待审查');
    document.querySelectorAll('#page-overview .stat-card-extra').forEach(function(x){x.remove();});
  }
  function roleLabel(m){ return m.projectRole || (m.role==='@designer'?'交付审查岗':'实现验证岗'); }
  function statusLabel(s){ if(typeof getStatusLabel==='function') return getStatusLabel(s); return ({busy:'忙碌',idle:'在线',offline:'离线'}[s]||'在线'); }
  function avatar(m){ if(typeof getWorkerAvatarSrc==='function') return getWorkerAvatarSrc(m); return 'pic/avatars/avatar-default.png'; }
  function statusCls(s){ return ['busy','idle','offline'].indexOf(s)>=0?s:'idle'; }
  function mode(m){ if(m.currentTaskSummary) return m.currentTaskSummary; if(m.role==='@designer') return m.status==='busy'?'审查中':'质量门禁'; return m.status==='busy'?'任务单执行中':'可接任务'; }
  function workerNode(t,m){ var s=statusCls(m.status); var name=esc(m.name); var task=esc(mode(m)); return '<div class="topo-worker topo-node '+s+'" data-action="open-worker" data-worker-name="'+name+'" data-master="'+esc(t.name)+'" title="'+name+' · '+esc(roleLabel(m))+' · '+esc(statusLabel(m.status))+' · '+task+'"><span class="persona-avatar worker"><img class="persona-avatar-img" src="'+esc(avatar(m))+'" alt="" loading="lazy"><span class="persona-status-dot '+s+'"></span></span><span class="topo-worker-text"><span class="topo-worker-name">'+name+'</span><span class="topo-worker-role">'+esc(roleLabel(m))+'</span><span class="topo-worker-cues"><span class="topo-worker-state">'+esc(statusLabel(m.status))+'</span><span class="topo-worker-mode">'+task+'</span></span></span></div>'; }
  function ensureAllTopologyWorkers(){ /* superseded by v0.6.33.45 topology-17 renderer */ }
  function setVersion(){ document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型'; document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent=VERSION+' · Mock 演示'; }); }
  function sanitizeVisibleTerms(){
    document.querySelectorAll('#page-roles, #page-skills, #page-overview, #page-pool').forEach(function(root){
      var walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); var nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function(n){ var v=n.nodeValue||''; v=v.replace(/@explorer/g,'@planner').replace(/@fixer/g,'@implementer').replace(/@designer/g,'@reviewer').replace(/系统架构师 \/ 技术专家岗|技术专家岗|系统架构师|架构师/g,'交付审查岗').replace(/设计师/g,'交付审查岗'); if(v!==n.nodeValue) n.nodeValue=v; });
    });
    var sel=qs('mappingRoleSelect'); if(sel){ Array.from(sel.options).forEach(function(o){ o.textContent=o.textContent.replace(/@explorer/g,'@planner').replace(/@fixer/g,'@implementer').replace(/@designer/g,'@reviewer'); }); }
  }
  function apply(){ if(applying) return; applying=true; try{ setVersion(); if(document.querySelector('#page-overview.active')){ stableStats(); ensureAllTopologyWorkers(); } sanitizeVisibleTerms(); }catch(e){} finally{ applying=false; } }
  function after(){ apply(); setTimeout(apply,0); setTimeout(apply,20); setTimeout(apply,80); setTimeout(apply,180); setTimeout(apply,420); }
  ['renderOverview','renderTopology','renderAll','refreshAllViews','switchNav','openOpsDrawer'].forEach(function(name){ var fn=window[name]; if(typeof fn==='function' && !fn.__stableV063329FinalWrapped){ var w=function(){ var ret=fn.apply(this,arguments); after(); return ret; }; w.__stableV063329FinalWrapped=true; window[name]=w; } });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',after); else after();
  /* v0.6.33.45: disabled 30ms topology polling to avoid layout jitter */
  /* v0.6.33.45: disabled 120ms apply polling to avoid layout jitter */
  try{ new MutationObserver(function(){ clearTimeout(window.__stableV063329Mo); window.__stableV063329Mo=setTimeout(apply,10); }).observe(document.body,{childList:true,subtree:true,characterData:true}); }catch(e){}
})();


;


(function(){
  if (window.__stableDeliveryV063329Topology17) return;
  window.__stableDeliveryV063329Topology17 = true;
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function st(s){ return ['busy','idle','offline'].indexOf(s)>=0?s:'idle'; }
  function statusLabel(s){ return ({busy:'忙碌',idle:'在线',offline:'离线'}[s]||'在线'); }
  function roleLabel(m){ return m.projectRole || (m.role==='@designer'?'交付审查岗':'实现验证岗'); }
  function workerMode(m){ if(m.currentTaskSummary) return m.currentTaskSummary; return m.role==='@designer'?(m.status==='busy'?'审查中':'质量门禁'):(m.status==='busy'?'任务单执行中':'可接任务'); }
  function avatar(m){ try{ if(typeof getWorkerAvatarSrc==='function') return getWorkerAvatarSrc(m); }catch(e){} return 'pic/avatars/avatar-default.png'; }
  function leaderAvatar(t){ try{ if(typeof getLeaderAvatarSrc==='function') return getLeaderAvatarSrc(t); }catch(e){} return 'pic/avatars/avatar-leader-planner-01.png'; }
  function stageLabel(s){ return ({build:'开发',design:'设计',test:'测试',acceptance:'验收'}[s]||s||'开发'); }
  function healthCls(t){ return t.masterStatus==='offline'?'offline':(t.healthy?'idle':'warning'); }
  function members(t){ return (t.members||[]).filter(function(m){return m.role==='@fixer'||m.role==='@designer';}); }
  function renderWorker(t,m){ var s=st(m.status); var task=workerMode(m); return '<div class="topo-worker topo-node '+s+'" data-action="open-worker" data-worker-name="'+esc(m.name)+'" data-master="'+esc(t.name)+'" title="'+esc(m.name)+' · '+esc(roleLabel(m))+' · '+esc(statusLabel(m.status))+' · '+esc(task)+'"><span class="persona-avatar worker"><img class="persona-avatar-img" src="'+esc(avatar(m))+'" alt="" loading="lazy"><span class="persona-status-dot '+s+'"></span></span><span class="topo-worker-text"><span class="topo-worker-name">'+esc(m.name)+'</span><span class="topo-worker-role">'+esc(roleLabel(m))+'</span><span class="topo-worker-cues"><span class="topo-worker-state">'+esc(statusLabel(m.status))+'</span><span class="topo-worker-mode">'+esc(task)+'</span></span></span></div>'; }
  window.renderTopology = function(){
    var host=document.getElementById('topologyHtml'); if(!host) return;
    var ts=(typeof currentState !== 'undefined' && currentState.teams ? currentState.teams : ((window.currentState&&window.currentState.teams)||[]));
    host.innerHTML=ts.map(function(t){
      var p=t.currentProject||{}; var m=members(t); var impl=m.filter(function(x){return x.role==='@fixer';}).length; var review=m.filter(function(x){return x.role==='@designer';}).length; var masterStatus=t.masterStatus==='offline'?'offline':(t.healthy?'online-healthy':'online-warning'); var rev=Number(t.pendingReviews||0); var dec=Number(t.pendingDecisions||0); var focus=p.name||t.task||'当前任务';
      return '<div class="topo-team-card" data-team-id="'+esc(t.id)+'"><div class="topo-team-header"><div class="topo-team-titlewrap"><span class="topo-team-name">'+esc(t.name)+'</span><div class="topo-team-projectline"><span class="topo-team-project" title="'+esc(p.name||'')+'">'+esc(p.name||'未绑定项目')+'</span><span class="stage-badge stage-'+esc(p.stage||'build')+'">'+esc(stageLabel(p.stage||'build'))+'</span></div></div><span class="topo-team-enter" onclick="openTeamTab(\''+esc(t.id)+'\')">→ 详情</span></div><div class="topo-master topo-node '+masterStatus+'" data-action="open-team" data-team-id="'+esc(t.id)+'" title="'+esc(t.masterCodename||'组长')+' · 协同规划岗（组长） · '+esc(t.task||'任务协调 / 决策把关')+'"><span class="persona-avatar"><img class="persona-avatar-img" src="'+esc(leaderAvatar(t))+'" alt="" loading="lazy"><span class="persona-status-dot idle"></span></span><span class="persona-main topo-leader-stack"><span class="topo-master-name">'+esc(t.masterCodename||'组长')+'</span><span class="persona-role-tag">协同规划岗 · 组长</span><span class="topo-leader-cues"><span class="topo-leader-line '+(rev+dec>0?'warning':'')+'">协调与分派 · 审查 '+rev+' / 决策 '+dec+'</span></span></span><button class="topo-node-action" title="与 '+esc(t.masterCodename||'组长')+' 协作" onclick="event.stopPropagation(); openChatWith(\''+esc(t.masterId||t.id)+'\')"><span>💬</span><span>协作</span></button></div><div class="topo-card-meta"><span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 '+impl+'</span><span class="role-pill review">交付审查 '+review+'</span></div><div class="topo-focus-bar"><span><b>当前阶段</b>'+esc(stageLabel(p.stage||'build'))+'</span><span><b>当前任务</b>'+esc(focus)+'</span><span><b>待处理重点</b>'+(dec>0?('待决策 '+dec):(rev>0?('待审查 '+rev):'当前无待处理'))+'</span></div><div class="topo-workers">'+m.map(function(x){return renderWorker(t,x);}).join('')+'</div></div>';
    }).join('');
    host.querySelectorAll('.dimmed').forEach(function(el){el.classList.remove('dimmed');});
  };
  function rerender(){ try{ if(document.querySelector('#page-overview.active')){ window.renderTopology(); if(window.__stableDeliveryV063329FinalFix) setTimeout(function(){ try{ var ev=new Event('stable-v63329-rendered'); document.dispatchEvent(ev);}catch(e){} },0); } }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(rerender,80);}); else setTimeout(rerender,80);
  [200,600,1200,2500,4200,7000].forEach(function(ms){ setTimeout(rerender,ms); });
  var oldSwitch=window.switchNav; if(typeof oldSwitch==='function' && !oldSwitch.__topology17Wrapped){ var w=function(){ var ret=oldSwitch.apply(this,arguments); setTimeout(rerender,80); setTimeout(rerender,400); return ret;}; w.__topology17Wrapped=true; window.switchNav=w; }
})();


;


(function(){
  if(window.__stableV063329EscClose) return; window.__stableV063329EscClose=true;
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && typeof window.closeOpsDrawer==='function') window.closeOpsDrawer(); });
})();


;


(function(){
  if(window.__userVisibleDeliveryV063330) return;
  window.__userVisibleDeliveryV063330 = true;
  var VERSION='v0.6.33.45';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function appState(){ try { if (typeof currentState !== 'undefined') return currentState || {}; } catch(e){} return window.currentState || {}; }
  function setVersion(){ document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型'; document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent=VERSION+' · Mock 演示'; }); }
  function fmtToken(n){ n=Number(n||0); if(n>=1e9) return (n/1e9).toFixed(1)+'G'; if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return String(Math.round(n)); }
  var PROJECT_UPDATES={
    'proj-hr-vue-migration':{ next:'等待用户确认 Ant Design Vue 表单规范，确认后合并组件替换方案', planner:'迁移范围与组件映射清单', implementer:'路由迁移与表单组件替换记录', reviewer:'HR 高频页面回归审查意见' },
    'proj-lowcode-mobile':{ next:'确认 H5 容器边界后推进预览调试闭环', planner:'移动端物料协议与任务拆解', implementer:'低代码预览容器原型与验证反馈', reviewer:'移动端组件验收清单' },
    'proj-erp-core':{ next:'等待财务凭证规则确认，确认后继续接口契约审查', planner:'单据流改造计划与风险清单', implementer:'采购到库存链路联调记录', reviewer:'财务凭证规则审查意见' },
    'proj-device-mgmt':{ next:'推进交付审查并补齐告警联动回归用例', planner:'巡检工单验收计划', implementer:'巡检计划与告警规则验证记录', reviewer:'设备模块交付审查结论' },
    'proj-agent-team':{ next:'串联首页、项目、团队、待决策与员工运行视图，形成演示路径', planner:'原型收口计划与问题追踪表', implementer:'页面一致性修复记录与截图验证', reviewer:'稳交付评审追踪与验收建议' }
  };
  function normalizeData(){
    var s=appState();
    (s.teams||[]).forEach(function(t){
      var p=t.currentProject||{}; var u=PROJECT_UPDATES[p.id] || {};
      if(u.next){ p.next=u.next; }
      p.roleOutputs = {planner:u.planner||'计划与任务拆解', implementer:u.implementer||'实现结果与验证反馈', reviewer:u.reviewer||'审查意见与验收建议'};
      if(p.workOrders){
        p.workOrders.forEach(function(w,i){
          if(i===0) w.output = p.roleOutputs.planner;
          if(i===1) w.output = p.roleOutputs.implementer;
          if(i===2) w.output = p.roleOutputs.reviewer;
          if(!w.next) w.next = (w.status==='reviewing'||w.status==='submitted') ? '交付审查岗复核产出' : (w.status==='blocked'?'等待用户决策或任务重排':'按下一步继续推进');
        });
      }
      t.activities = [
        {time:Date.now()-90000, desc:'协同规划岗 '+(t.masterCodename||'组长')+' 更新计划、任务拆解与下一步动作'},
        {time:Date.now()-180000, desc:'实现验证岗 回写执行结果、验证记录和问题反馈'},
        {time:Date.now()-300000, desc:'交付审查岗 输出审查意见，必要时生成返工或待决策'}
      ];
      (t.members||[]).forEach(function(m){
        if(m.role==='@designer') m.currentTaskSummary = (p.roleOutputs && p.roleOutputs.reviewer) || m.currentTaskSummary || '审查意见与验收建议';
        if(m.role==='@fixer' && !/执行|验证|迁移|联调|修复|替换|容器|协议|预览/.test(m.currentTaskSummary||'')) m.currentTaskSummary = (p.roleOutputs && p.roleOutputs.implementer) || m.currentTaskSummary || '实现结果与验证反馈';
      });
    });
    (s.decisions||[]).forEach(function(d){
      if(/技术专家|系统架构师|架构师/.test(d.sourceRole||'')) d.sourceRole='协同规划岗 / 交付审查岗';
      if(/技术专家|系统架构师|架构师/.test(d.escalationPath||'')) d.escalationPath=(d.escalationPath||'').replace(/\s*→\s*技术专家/g,'').replace(/系统架构师/g,'交付审查岗').replace(/技术专家/g,'交付审查岗');
      d.context = (d.context||'') + (String(d.context||'').indexOf('该事项来自项目推进过程')<0 ? '\n\n该事项来自项目推进过程，用户只需确认业务取舍或风险边界；底层由系统记录任务进展与岗位产出。' : '');
    });
  }
  function pendingTotals(){ var s=appState(); var dec=(s.decisions||[]).filter(function(d){return d.status==='pending';}).length; var rev=(s.teams||[]).reduce(function(n,t){return n+Number(t.pendingReviews||0);},0); return {dec:dec,rev:rev}; }
  function patchOverview(){
    var page=document.getElementById('page-overview'); if(!page) return;
    var statParent=page.querySelector('.stat-card') && page.querySelector('.stat-card').parentElement; if(!statParent) return;
    if(page.querySelector('.delivery-path-v63330')) return;
    var pend=pendingTotals();
    var box=document.createElement('div'); box.className='delivery-path-v63330';
    box.innerHTML='<div class="delivery-path-title-v63330"><div class="delivery-path-title-main-v63330">用户可见推进路径</div><div class="delivery-path-title-sub-v63330">界面只呈现项目推进、岗位产出、审查与待决策；用户关注结果、风险和下一步。</div></div>'+
      '<div class="delivery-path-step-v63330"><div class="delivery-path-step-label-v63330">项目推进</div><div class="delivery-path-step-main-v63330">项目健康总表看进度与风险</div><div class="delivery-path-step-sub-v63330">每个项目都有下一步动作</div></div>'+
      '<div class="delivery-path-step-v63330"><div class="delivery-path-step-label-v63330">岗位产出</div><div class="delivery-path-step-main-v63330">计划拆解 / 执行反馈 / 审查意见</div><div class="delivery-path-step-sub-v63330">用户看到实际产出，不关心底层编排</div></div>'+
      '<div class="delivery-path-step-v63330 warn"><div class="delivery-path-step-label-v63330">质量门禁</div><div class="delivery-path-step-main-v63330">交付审查岗输出验收建议</div><div class="delivery-path-step-sub-v63330">不合格则返工或进入待决策</div></div>'+
      '<div class="delivery-path-step-v63330 danger"><div class="delivery-path-step-label-v63330">用户介入</div><div class="delivery-path-step-main-v63330">待决策 '+pend.dec+' · 待审查 '+pend.rev+'</div><div class="delivery-path-step-sub-v63330">用户只处理关键取舍</div></div>';
    statParent.insertAdjacentElement('afterend', box);
  }
  function healthOf(team){ var p=team.currentProject||{}; var dec=(appState().decisions||[]).filter(function(d){return d.status==='pending'&&d.teamId===team.id;}).length; var rev=Number(team.pendingReviews||0); var blocked=((p.workOrders||[]).filter(function(w){return w.status==='blocked'||w.status==='rework_required';}).length); if(blocked||dec>0&&p.id==='proj-erp-core') return {cls:'risk',label:'风险',risk:'high',riskLabel:'高'}; if(dec>0||rev>=3||p.health==='warning') return {cls:'attention',label:'关注',risk:'medium',riskLabel:'中'}; return {cls:'healthy',label:'健康',risk:'low',riskLabel:'低'}; }
  function stageLabel(s){ return ({build:'开发',design:'设计',test:'测试',acceptance:'验收'}[s]||s||'推进中'); }
  function statusLabel(s){ return ({draft:'计划中',assigned:'已分派',running:'执行中',blocked:'阻塞',submitted:'待审查',reviewing:'审查中',accepted:'已完成',done:'已完成'}[s]||s||'推进中'); }
  function activeOrders(t){ return ((t.currentProject||{}).workOrders||[]).filter(function(w){return ['assigned','running','blocked','submitted','reviewing','rework_required'].indexOf(w.status)>=0;}); }
  function teamDecisionCount(t){ return (appState().decisions||[]).filter(function(d){return d.status==='pending'&&d.teamId===t.id;}).length; }
  function nextAction(team){ var p=team.currentProject||{}; var d=(appState().decisions||[]).find(function(x){return x.status==='pending'&&x.teamId===team.id;}); var rev=Number(team.pendingReviews||0); var running=activeOrders(team)[0]; if(d) return {main:'等待用户决策：'+d.title, sub:'确认后继续项目推进'}; if(rev>0) return {main:'推进交付审查：待审查 '+rev+' 项', sub:'交付审查岗复核岗位产出'}; if(running) return {main:'继续执行验证：'+running.title, sub:'实现验证岗回写执行反馈'}; return {main:p.next||'进入下一轮任务拆解', sub:'协同规划岗输出下一步计划'}; }
  function renderProjectsV63330(){
    var page=document.getElementById('page-projects'); if(!page) return;
    var teams=(appState().teams||[]).filter(function(t){return !!t.currentProject;});
    var rows=teams.map(function(t){return {team:t, project:t.currentProject, health:healthOf(t), next:nextAction(t)};});
    var healthy=rows.filter(function(r){return r.health.cls==='healthy';}).length, attention=rows.filter(function(r){return r.health.cls==='attention';}).length, risk=rows.filter(function(r){return r.health.cls==='risk';}).length;
    var decisions=teams.reduce(function(n,t){return n+teamDecisionCount(t);},0), reviews=teams.reduce(function(n,t){return n+Number(t.pendingReviews||0);},0);
    page.innerHTML='<div class="project-health-v63325"><div class="project-health-head-v63325"><div class="project-health-title-v63325"><div class="project-health-title-main-v63325">📁 项目健康总表</div><div class="project-health-title-sub-v63325">从管理者视角横向查看项目推进、岗位产出、待决策、待审查、风险与下一步动作。<span class="project-health-title-sub-v63330-append">用户界面始终围绕“项目是否推进、岗位产出了什么、下一步做什么”。</span></div></div>'+
      '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">项目数</div><div class="project-health-mini-value-v63325">'+teams.length+'</div></div>'+
      '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">健康项目</div><div class="project-health-mini-value-v63325">'+healthy+'</div></div>'+
      '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">关注与风险</div><div class="project-health-mini-text-v63325 warn">关注 '+attention+' · 风险 '+risk+'</div></div>'+
      '<div class="project-health-mini-v63325"><div class="project-health-mini-label-v63325">决策与审查</div><div class="project-health-mini-text-v63325 danger">待决策 '+decisions+' · 待审查 '+reviews+'</div></div></div>'+
      '<div class="project-health-toolbar-v63325"><div class="project-health-toolbar-left-v63325"><span class="project-health-chip-v63325">用户看项目推进与岗位产出</span><span class="project-health-chip-v63325">用户操作保持一致</span></div><div class="project-health-toolbar-right-v63325"><span class="project-health-chip-v63325">最近更新：刚刚</span></div></div>'+
      '<div class="project-health-card-v63325"><table class="project-health-table-v63325"><thead><tr><th>项目 / 阶段</th><th>负责团队</th><th>健康</th><th>任务进度</th><th>岗位产出</th><th>待办指标</th><th>下一步</th><th>动作</th></tr></thead><tbody>'+
      rows.map(function(row){ var t=row.team,p=row.project,h=row.health,next=row.next,outs=p.roleOutputs||{}; var progress=Number(p.progress||0), dec=teamDecisionCount(t), rev=Number(t.pendingReviews||0), active=activeOrders(t).length; var decisionButton=dec>0?'<button class="project-action-v63325 warn" onclick="switchNav(\'decisions\')">待决策</button>':''; return '<tr>'+
        '<td class="project-title-cell-v63325"><div class="project-title-main-v63325" onclick="openTeamTab(\''+esc(t.id)+'\')">'+esc(p.name||'-')+'</div><div><span class="project-stage-pill-v63325">'+esc(stageLabel(p.stage))+'</span></div><div class="project-title-sub-v63325">'+esc(p.description||t.task||'当前项目')+'</div></td>'+
        '<td><span class="proj-team" onclick="openTeamTab(\''+esc(t.id)+'\')">'+esc(t.name)+'</span><div class="project-blocker-v63325">组长：'+esc(t.masterCodename||'-')+'</div></td>'+
        '<td><span class="health-pill-v63325 '+h.cls+'">'+esc(h.label)+'</span><div class="project-blocker-v63325">风险 '+esc(h.riskLabel)+'</div></td>'+
        '<td class="project-progress-cell-v63325"><div class="project-progress-top-v63325"><span>'+esc(stageLabel(p.stage))+'</span><span>'+progress+'%</span></div><div class="project-progress-bar-v63325"><span style="width:'+Math.max(4,progress)+'%"></span></div></td>'+
        '<td class="project-output-cell-v63330"><div class="project-output-list-v63330"><div class="project-output-item-v63330"><b>计划</b>：'+esc(outs.planner||'任务拆解')+'</div><div class="project-output-item-v63330"><b>执行</b>：'+esc(outs.implementer||'执行反馈')+'</div><div class="project-output-item-v63330"><b>审查</b>：'+esc(outs.reviewer||'审查意见')+'</div></div></td>'+
        '<td><div class="project-metric-grid-v63325"><div class="project-metric-v63325"><div class="project-metric-label-v63325">执行中</div><div class="project-metric-value-v63325">'+active+'</div></div><div class="project-metric-v63325"><div class="project-metric-label-v63325">待决策</div><div class="project-metric-value-v63325">'+dec+'</div></div><div class="project-metric-v63325"><div class="project-metric-label-v63325">待审查</div><div class="project-metric-value-v63325">'+rev+'</div></div></div></td>'+
        '<td class="project-next-v63325"><strong>'+esc(next.main)+'</strong><div class="project-blocker-v63325">'+esc(next.sub||p.next||'按计划推进')+'</div></td>'+
        '<td><div class="project-actions-v63325"><button class="project-action-v63325" onclick="openTeamTab(\''+esc(t.id)+'\')">团队详情</button><button class="project-action-v63325" onclick="window.openTeamRunDrawer && window.openTeamRunDrawer(\''+esc(t.id)+'\',\'flow\')">任务闭环</button>'+decisionButton+'</div></td></tr>'; }).join('')+
      '</tbody></table></div></div>';
  }
  function patchTeamDetail(){
    var page=document.querySelector('.page.active[id^="page-team-"]'); if(!page) return;
    var shell=page.querySelector('.task-closure-shell'); if(!shell) return;
    var teamId=page.id.replace('page-team-',''); var team=(appState().teams||[]).find(function(t){return t.id===teamId;}) || {}; var p=team.currentProject||{}; var outs=p.roleOutputs||{};
    if(!shell.querySelector('.role-output-strip-v63330')){
      var strip=document.createElement('div'); strip.className='role-output-strip-v63330';
      strip.innerHTML='<div class="role-output-card-v63330"><strong>协同规划岗产出</strong><span>'+esc(outs.planner||'计划与任务拆解')+'</span></div><div class="role-output-card-v63330"><strong>实现验证岗产出</strong><span>'+esc(outs.implementer||'实现结果与验证反馈')+'</span></div><div class="role-output-card-v63330"><strong>交付审查岗产出</strong><span>'+esc(outs.reviewer||'审查意见与验收建议')+'</span></div>';
      var flow=shell.querySelector('.task-flow-strip'); if(flow) shell.insertBefore(strip,flow); else shell.appendChild(strip);
    }
    var note=shell.querySelector('.task-closure-note'); if(note) note.textContent='用户只看任务单、岗位产出、审查与待决策；团队内部持续维护任务进度和执行反馈，界面不因底层实现变化而大改。';
  }
  function patchDecisions(){
    var page=document.getElementById('page-decisions'); if(!page) return;
    if(page.querySelector('.decision-source-note-v63330')) return;
    var anchor=page.querySelector('.decision-workbench-v63319, .decision-page-v63318, .decision-hero, .page-title') || page.firstElementChild;
    if(anchor){ var n=document.createElement('div'); n.className='decision-source-note-v63330'; n.textContent='待决策来自项目推进、交付审查或岗位执行反馈；用户只处理关键业务取舍，普通执行和审查仍由团队闭环推进。'; anchor.insertAdjacentElement('afterend',n); }
  }
  function apply(){ setVersion(); normalizeData(); if(document.querySelector('#page-overview.active')) patchOverview(); if(document.querySelector('#page-projects.active')) renderProjectsV63330(); patchTeamDetail(); if(document.querySelector('#page-decisions.active')) patchDecisions(); }
  var oldSwitch=window.switchNav; if(typeof oldSwitch==='function' && !oldSwitch.__v63330Wrapped){ var w=function(){ var ret=oldSwitch.apply(this,arguments); setTimeout(apply,90); setTimeout(apply,450); return ret; }; w.__v63330Wrapped=true; window.switchNav=w; }
  window.renderProjects=renderProjectsV63330;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(apply,260); }); else setTimeout(apply,260);
  [600,1200,2400,4200,7000].forEach(function(ms){ setTimeout(apply,ms); });
  /* v0.6.33.45: disabled 150ms data patch polling to avoid layout jitter */
  setTimeout(apply,150); setTimeout(apply,800);
})();


;


(function(){
  function tryFallback(img){
    if (!img || img.dataset.avatarFallbackDone === '1') return;
    var src = img.getAttribute('src') || '';
    if (!src || src.indexOf('pic/') < 0) return;
    img.dataset.avatarFallbackDone = '1';
    var next = '';
    if (src.indexOf('pic/') === 0) next = src.replace('pic/', 'pic/');
    else if (src.indexOf('pic/') === 0) next = '../' + src;
    else if (src.indexOf('/docs/prototypes/pic/') >= 0) next = src.replace('/docs/prototypes/pic/', 'pic/');
    if (next) img.src = next;
  }
  document.addEventListener('error', function(e){
    var t = e.target;
    if (t && t.tagName === 'IMG') tryFallback(t);
  }, true);
  window.addEventListener('load', function(){
    document.querySelectorAll('img').forEach(function(img){
      if (img.complete && img.naturalWidth === 0) tryFallback(img);
    });
  });
})();


;


(function(){
  if(window.__overviewNoJitterV063338) return;
  window.__overviewNoJitterV063338 = true;
  function removeFocusBar(){
    document.querySelectorAll('#page-overview #topologyHtml .topo-focus-bar').forEach(function(el){ el.remove(); });
  }
  function stabilizeOverview(){
    removeFocusBar();
    document.querySelectorAll('#page-overview img').forEach(function(img){
      if(!img.getAttribute('decoding')) img.setAttribute('decoding','async');
    });
  }
  function after(){ stabilizeOverview(); setTimeout(stabilizeOverview,80); }
  ['renderOverview','renderTopology','switchNav','refreshAllViews'].forEach(function(name){
    var fn=window[name];
    if(typeof fn==='function' && !fn.__v063338NoJitterWrapped){
      var w=function(){ var ret=fn.apply(this,arguments); after(); return ret; };
      w.__v063338NoJitterWrapped=true; window[name]=w;
    }
  });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', after); else after();
})();


;


(function(){
  if (window.__v063340FixedDecisionSummary) return;
  window.__v063340FixedDecisionSummary = true;

  var VERSION = 'v0.6.33.45';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function appState(){ try { if (typeof currentState !== 'undefined') return currentState || {}; } catch(e){} return window.currentState || {}; }
  function teams(){ return appState().teams || []; }
  function teamById(id){ return teams().find(function(t){ return t.id === id; }) || null; }
  function workOrders(team){ return (team && team.currentProject && team.currentProject.workOrders) || []; }
  function pendingDecisions(team){
    try { return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && (!d.teamId || d.teamId === team.id); }).length; } catch(e){ return 0; }
  }
  function pendingReviews(team){
    try { return workOrders(team).filter(function(w){ return ['submitted','reviewing'].indexOf(w.status) >= 0; }).length || (team.pendingReviews || 0); } catch(e){ return team && team.pendingReviews || 0; }
  }
  function openBlockers(team){
    try { return (team.blockers || (team.currentProject && team.currentProject.blockers) || []).filter(function(b){ return !b.status || ['open','leader_reviewing','converted_to_decision'].indexOf(b.status) >= 0; }).length; } catch(e){ return 0; }
  }
  function activeWorkOrder(team){
    var order = ['blocked','rework_required','running','submitted','reviewing','assigned','accepted','done','draft'];
    return workOrders(team).slice().sort(function(a,b){ return order.indexOf(a.status) - order.indexOf(b.status); })[0] || null;
  }
  function statusLabel(s){ return ({draft:'草稿',assigned:'已分派',running:'执行中',blocked:'阻塞',submitted:'待审查',reviewing:'审查中',accepted:'已通过',rework_required:'需整改',done:'完成'}[s] || s || '推进中'); }
  function cleanTitle(s){
    return String(s || '任务单').replace(/P0a\s*/g,'').replace(/P0b\s*/g,'').replace(/P1\s*/g,'')
      .replace(/Mock/g,'模拟').replace(/RuntimeHost/g,'运行节点').replace(/WorkerRuntimeBinding/g,'员工运行绑定')
      .replace(/agent-web-kit/ig,'事件订阅').replace(/^[:：\s-]+|[:：\s-]+$/g,'').trim() || '任务单';
  }
  function shortText(s,n){ s=String(s||''); return s.length>n ? s.slice(0,n)+'…' : s; }
  function busyMinutesFor(name){ var s=String(name||''), n=0; for(var i=0;i<s.length;i++) n=(n*31+s.charCodeAt(i))%97; return 7+(n%58); }
  function longestBusy(team){ var list=(team&&team.members||[]).filter(function(m){return m.status==='busy';}); if(!list.length) return 0; return Math.max.apply(null,list.map(function(m){return busyMinutesFor(m.name||m.id);})); }
  function summaryData(team){
    var dec = pendingDecisions(team), rev = pendingReviews(team), blk = openBlockers(team);
    if (dec || blk || rev) {
      var text = dec ? ('待决策 ' + dec + '：确认业务取舍或技术边界') :
                 blk ? ('阻塞 ' + blk + '：需组长判断是否升级') :
                 ('待审查 ' + rev + '：交付审查复核');
      return { mode:'need', cls:'need-action', badge:'待决策', text:text, link:'处理' };
    }
    var wo=activeWorkOrder(team), task=shortText(cleanTitle((wo&&wo.title)||(team&&team.task)||(team&&team.currentProject&&team.currentProject.name)),12);
    var busy=longestBusy(team), status=wo?statusLabel(wo.status):'推进中';
    return { mode:'flow', cls:'in-progress', badge:'进行中', text:'当前：'+task+' · '+status+(busy?' · 忙碌 '+busy+'m':''), link:'任务流' };
  }
  function ensureSummaryElement(meta){
    var el = meta.querySelector('.team-run-summary-v21, .team-run-summary-v40');
    if (!el) {
      el = document.createElement('div');
      el.className = 'team-run-summary-v21 team-run-summary-v40';
      el.innerHTML = '<span class="team-run-badge-v21 team-run-badge-v40"></span><span class="team-run-text-v21 team-run-text-v40"></span><span class="team-run-link-v21 team-run-link-v40"></span>';
      meta.innerHTML = '';
      meta.appendChild(el);
    } else {
      el.classList.add('team-run-summary-v40');
      var badge = el.querySelector('.team-run-badge-v21, .team-run-badge-v40');
      var text = el.querySelector('.team-run-text-v21, .team-run-text-v40');
      var link = el.querySelector('.team-run-link-v21, .team-run-link-v40');
      if (!badge || !text || !link) {
        el.innerHTML = '<span class="team-run-badge-v21 team-run-badge-v40"></span><span class="team-run-text-v21 team-run-text-v40"></span><span class="team-run-link-v21 team-run-link-v40"></span>';
      }
    }
    return el;
  }
  function updateSummary(meta, team){
    var data = summaryData(team);
    var el = ensureSummaryElement(meta);
    el.classList.toggle('need-action', data.mode === 'need');
    el.classList.toggle('in-progress', data.mode !== 'need');
    el.setAttribute('data-mode', data.mode);
    el.setAttribute('title', data.text);
    el.onclick = function(ev){ ev.stopPropagation(); window.openTeamRunDrawer && window.openTeamRunDrawer(team.id, data.mode); };
    var badge = el.querySelector('.team-run-badge-v21, .team-run-badge-v40');
    var text = el.querySelector('.team-run-text-v21, .team-run-text-v40');
    var link = el.querySelector('.team-run-link-v21, .team-run-link-v40');
    if (badge && badge.textContent !== data.badge) badge.textContent = data.badge;
    if (text && text.textContent !== data.text) text.textContent = data.text;
    if (link && link.textContent !== data.link + ' →') link.textContent = data.link + ' →';
  }
  function removeOnlyFocusBar(){
    document.querySelectorAll('#page-overview #topologyHtml .topo-focus-bar, #page-overview .topo-card-summary, #page-overview .topo-current-row, #page-overview [data-current-stage-row]').forEach(function(el){ try{ el.remove(); }catch(e){} });
  }
  function fixVersion(){
    try { document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型'; } catch(e){}
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent=VERSION+' · Mock 演示'; });
  }
  function applyFixedSummary(){
    fixVersion();
    removeOnlyFocusBar();
    document.querySelectorAll('#page-overview #topologyHtml .topo-team-card').forEach(function(card){
      var team = teamById(card.getAttribute('data-team-id'));
      var meta = card.querySelector('.topo-card-meta');
      if (!team || !meta) return;
      updateSummary(meta, team);
    });
  }
  function after(){ applyFixedSummary(); }
  ['renderOverview','renderTopology','refreshAllViews','switchNav'].forEach(function(name){
    var fn=window[name];
    if(typeof fn==='function' && !fn.__v063340Wrapped){
      var w=function(){ var ret=fn.apply(this,arguments); requestAnimationFrame(after); return ret; };
      w.__v063340Wrapped=true;
      window[name]=w;
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ requestAnimationFrame(after); });
  else requestAnimationFrame(after);
  window.__v063340ApplyFixedSummary = applyFixedSummary;
})();


;


(function(){
  var AVATAR_DATA_V41 = {};
  window.__avatarDataV41 = AVATAR_DATA_V41;
  function norm(p){
    p = String(p || '');
    if (p.indexOf('data:image/') === 0) return p;
    p = p.replace(/^\.\//, '').replace(/^\.\.\//, '').replace(/^\/docs\/prototypes\//, '').replace(/^prototypes\//, '');
    return p;
  }
  function avatarAsset(p){
    var k = norm(p);
    var fallback = 'pic/avatars/avatar-default.png';
    if (!k || k.indexOf('data:image/') === 0) return fallback;
    if (k.indexOf('pic/avatars/') === 0) return k;
    if (k.indexOf('avatars/') === 0) return 'pic/' + k;
    return k || fallback;
  }
  function numFromText(s){ var m = String(s || '').match(/(\d+)/); return m ? Number(m[1]) : 1; }
  function pad2(n){ return String(Math.max(1, Math.min(5, Number(n)||1))).padStart(2, '0'); }
  function teamNo(t){ return Math.max(1, Math.min(5, numFromText((t && (t.name || t.id || t.masterCodename)) || '1'))); }
  function workerNo(w){ return Math.max(1, Math.min(5, numFromText((w && (w.name || w.id)) || '1'))); }
  window.getLeaderAvatarSrc = function(teamOrWorker){ return avatarAsset('pic/avatars/avatar-leader-planner-' + pad2(teamNo(teamOrWorker)) + '.png'); };
  window.getWorkerAvatarSrc = function(w){
    w = w || {};
    if (w.teamRole === 'leader' || w.role === '@explorer') return window.getLeaderAvatarSrc(w);
    var idx = pad2(workerNo(w));
    if (w.role === '@designer') return avatarAsset('pic/avatars/avatar-reviewer-' + idx + '.png');
    if (w.role === '@oracle') return avatarAsset('pic/avatars/avatar-reviewer-' + pad2(Math.max(4, workerNo(w))) + '.png');
    if (w.role === '@fixer') return avatarAsset('pic/avatars/avatar-implementer-' + idx + '.png');
    return avatarAsset('pic/avatars/avatar-implementer-03.png');
  };
  window.getLargeWorkerAvatarSrc = function(w){
    w = w || {};
    if (w.teamRole === 'leader' || w.role === '@explorer') return avatarAsset('pic/avatars/avatar-leader-planner-' + pad2(teamNo(w)) + '-large.png');
    var idx = pad2(workerNo(w));
    if (w.role === '@designer') return avatarAsset('pic/avatars/avatar-reviewer-' + idx + '-large.png');
    if (w.role === '@oracle') return avatarAsset('pic/avatars/avatar-reviewer-' + pad2(Math.max(4, workerNo(w))) + '-large.png');
    if (w.role === '@fixer') return avatarAsset('pic/avatars/avatar-implementer-' + idx + '-large.png');
    return avatarAsset('pic/avatars/avatar-implementer-03-large.png');
  };
  function shouldPatch(src){ return /(?:^|[./])pic\/(?:avatars|xiaoyun)\//.test(String(src || '')); }
  function patchImgs(){
    document.querySelectorAll('img').forEach(function(img){
      var src = img.getAttribute('src') || '';
      if (shouldPatch(src)) img.src = avatarAsset(src);
      img.onerror = function(){
        this.onerror = null;
        this.src = avatarAsset('pic/avatars/avatar-default.png');
      };
    });
  }
  window.__fixAvatarLinksV41 = patchImgs;
  var oldSwitchNav = window.switchNav;
  if (typeof oldSwitchNav === 'function' && !oldSwitchNav.__avatarV41Wrapped) {
    var wrapped = function(){
      var r = oldSwitchNav.apply(this, arguments);
      setTimeout(patchImgs, 0); setTimeout(patchImgs, 120); setTimeout(patchImgs, 500);
      return r;
    };
    wrapped.__avatarV41Wrapped = true;
    window.switchNav = wrapped;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchImgs);
  else patchImgs();
  setTimeout(patchImgs, 0); setTimeout(patchImgs, 120); setTimeout(patchImgs, 500); setTimeout(patchImgs, 1200);
})();


;


(function(){
  if (window.__v063343WorkerCopyAvatarFix) return;
  window.__v063343WorkerCopyAvatarFix = true;
  var VERSION = 'v0.6.33.45';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function appState(){ try { if (typeof currentState !== 'undefined') return currentState || {}; } catch(e){} return window.currentState || {}; }
  function teams(){ return appState().teams || []; }
  function pad2(n){ return String(Math.max(1, Math.min(5, Number(n)||1))).padStart(2,'0'); }
  function cnNum(s){ var map={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9}; var m=String(s||'').match(/[一二三四五六七八九]/); return m ? map[m[0]] : 0; }
  function firstNum(s){ var m=String(s||'').match(/(\d+)/); return m ? Number(m[1]) : 0; }
  function teamIndex(obj){
    if (!obj) return 1;
    var list = teams();
    if (obj.id) { var idx=list.findIndex(function(t){ return t.id === obj.id; }); if (idx >= 0) return idx + 1; }
    if (obj.teamId) { var idx2=list.findIndex(function(t){ return t.id === obj.teamId; }); if (idx2 >= 0) return idx2 + 1; }
    if (obj.masterId) { var idx3=list.findIndex(function(t){ return t.masterId === obj.masterId; }); if (idx3 >= 0) return idx3 + 1; }
    return firstNum(obj.id) || firstNum(obj.teamId) || firstNum(obj.masterCodename) || firstNum(obj.name) || cnNum(obj.name) || 1;
  }
  function avatarAsset(path){
    path = String(path || '');
    if (path.indexOf('data:image/') === 0) return path;
    var key = path.replace(/^\.\//,'').replace(/^prototypes\//,'').replace(/^\/docs\/prototypes\//,'');
    if (window.__avatarDataV41 && window.__avatarDataV41[key]) return window.__avatarDataV41[key];
    return './' + key;
  }
  function leaderAvatar(team){ return avatarAsset('pic/avatars/avatar-leader-planner-' + pad2(teamIndex(team)) + '.png'); }
  function workerIndex(m){ return firstNum(m && m.name) || firstNum(m && m.id) || 1; }
  function workerAvatar(m){
    if (!m) return avatarAsset('pic/avatars/avatar-default.png');
    if (m.teamRole === 'leader' || m.isLeader || m.role === '@explorer') return leaderAvatar(m);
    var idx = pad2(workerIndex(m));
    if (m.role === '@designer') return avatarAsset('pic/avatars/avatar-reviewer-' + idx + '.png');
    return avatarAsset('pic/avatars/avatar-implementer-' + idx + '.png');
  }
  window.getLeaderAvatarSrc = leaderAvatar;
  window.getWorkerAvatarSrc = workerAvatar;

  function statusClass(s){ return ['busy','idle','offline'].indexOf(s) >= 0 ? s : 'idle'; }
  function statusLabel(s){ return ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线'}[s] || '在线'); }
  function roleLabel(m){ return m && m.role === '@designer' ? '交付审查岗' : '实现验证岗'; }
  function busyMinutes(name){ var s=String(name||''), n=0; for(var i=0;i<s.length;i++) n=(n*31+s.charCodeAt(i))%59; return 10 + (n % 49); }
  function cleanTask(raw, m){
    var t = String(raw || '').trim();
    t = t.replace(/实现验证岗|交付审查岗|协同规划岗|组长/g, '')
         .replace(/忙碌\s*忙碌/g, '忙碌')
         .replace(/忙碌\s*\d+\s*m(in)?/ig, '')
         .replace(/在线|离线|执行中|审查中/g, '')
         .replace(/[·｜|]+/g, ' ')
         .replace(/\s+/g, ' ')
         .replace(/^[-—:：\s]+|[-—:：\s]+$/g, '');
    if (!t) t = m && m.role === '@designer' ? '交付审查' : '任务执行';
    return t;
  }
  function modeText(m){
    var st = statusClass(m.status), task = cleanTask(m.currentTaskSummary, m);
    if (st === 'busy') return task + ' · ' + busyMinutes(m.name || m.id) + 'm';
    if (st === 'offline') return '等待恢复';
    return task;
  }
  function projectFor(t){ return t.currentProject || {}; }
  function stageLabel(s){ return ({build:'开发',design:'设计',test:'测试',acceptance:'验收'}[s] || s || '开发'); }
  function members(t){ return (t.members || []).filter(function(m){ return m.role === '@fixer' || m.role === '@designer'; }); }
  function pendingDecisions(t){ try { return (appState().decisions || []).filter(function(d){ return d.status === 'pending' && (!d.teamId || d.teamId === t.id); }).length || Number(t.pendingDecisions || 0); } catch(e){ return Number(t.pendingDecisions || 0); } }
  function pendingReviews(t){ try { var wo=(t.currentProject&&t.currentProject.workOrders)||[]; var n=wo.filter(function(x){ return ['submitted','reviewing'].indexOf(x.status) >= 0; }).length; return n || Number(t.pendingReviews || 0); } catch(e){ return Number(t.pendingReviews || 0); } }
  function leaderLine(t){ var dec=pendingDecisions(t), rev=pendingReviews(t); if (dec || rev) return '待决策 ' + dec + ' · 待审查 ' + rev; return '任务拆解 · 进度跟踪'; }
  function healthStatus(t){ return t.masterStatus === 'offline' ? 'offline' : (t.healthy ? 'online-healthy' : 'online-warning'); }
  function renderWorker(t,m){
    var s=statusClass(m.status), task=modeText(m), role=roleLabel(m), name=m.name || m.id || '成员';
    return '<div class="topo-worker topo-node '+esc(s)+'" data-action="open-worker" data-worker-name="'+esc(name)+'" data-master="'+esc(t.name||'')+'" title="'+esc(name+' · '+role+' · '+statusLabel(s)+' · '+task)+'">'
      + '<span class="persona-avatar worker"><img class="persona-avatar-img" src="'+esc(workerAvatar(m))+'" alt="" loading="lazy"><span class="persona-status-dot '+esc(s)+'"></span></span>'
      + '<span class="topo-worker-text"><span class="topo-worker-name">'+esc(name)+'</span><span class="topo-worker-role">'+esc(role)+'</span><span class="topo-worker-cues"><span class="topo-worker-state">'+esc(statusLabel(s))+'</span><span class="topo-worker-mode">'+esc(task)+'</span></span></span>'
      + '</div>';
  }
  window.renderTopology = function(){
    var host = document.getElementById('topologyHtml'); if (!host) return;
    host.innerHTML = teams().map(function(t){
      var p=projectFor(t), m=members(t), impl=m.filter(function(x){return x.role==='@fixer';}).length, review=m.filter(function(x){return x.role==='@designer';}).length;
      var masterStatus=healthStatus(t), dec=pendingDecisions(t), rev=pendingReviews(t);
      return '<div class="topo-team-card" data-team-id="'+esc(t.id)+'">'
        + '<div class="topo-team-header"><div class="topo-team-titlewrap"><span class="topo-team-name">'+esc(t.name||'团队')+'</span><div class="topo-team-projectline"><span class="topo-team-project" title="'+esc(p.name||'')+'">'+esc(p.name||'未绑定项目')+'</span><span class="stage-badge stage-'+esc(p.stage||'build')+'">'+esc(stageLabel(p.stage||'build'))+'</span></div></div><span class="topo-team-enter" onclick="openTeamTab(\''+esc(t.id)+'\')">→ 详情</span></div>'
        + '<div class="topo-master topo-node '+esc(masterStatus)+'" data-action="open-team" data-team-id="'+esc(t.id)+'" title="'+esc((t.masterCodename||'组长')+' · 协同规划岗 · '+leaderLine(t))+'"><span class="persona-avatar"><img class="persona-avatar-img" src="'+esc(leaderAvatar(t))+'" alt="" loading="lazy"><span class="persona-status-dot idle"></span></span><span class="persona-main topo-leader-stack"><span class="topo-master-name">'+esc(t.masterCodename||'组长')+'</span><span class="persona-role-tag">协同规划岗 · 组长</span><span class="topo-leader-cues"><span class="topo-leader-line '+(rev+dec>0?'warning':'')+'">'+esc(leaderLine(t))+'</span></span></span><button class="topo-node-action" title="与 '+esc(t.masterCodename||'组长')+' 协作" onclick="event.stopPropagation(); openChatWith(\''+esc(t.masterId||t.id)+'\')"><span>💬</span><span>协作</span></button></div>'
        + '<div class="topo-card-meta"><span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 '+impl+'</span><span class="role-pill review">交付审查 '+review+'</span></div>'
        + '<div class="topo-focus-bar"><span><b>当前阶段</b>'+esc(stageLabel(p.stage||'build'))+'</span><span><b>当前任务</b>'+esc(p.name||t.task||'当前任务')+'</span><span><b>待处理重点</b>'+(dec>0?('待决策 '+dec):(rev>0?('待审查 '+rev):'当前无待处理'))+'</span></div>'
        + '<div class="topo-workers">'+m.map(function(x){return renderWorker(t,x);}).join('')+'</div></div>';
    }).join('');
    try { if (window.__v063340ApplyFixedSummary) window.__v063340ApplyFixedSummary(); } catch(e) {}
    try { if (window.__fixAvatarLinksV41) window.__fixAvatarLinksV41(); } catch(e) {}
  };
  function run(){
    document.title = '智能软件工厂 ' + VERSION + ' · AI 原生岗位协作原型';
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = VERSION + ' · Mock 演示'; });
    if (document.querySelector('#page-overview.active') || document.getElementById('topologyHtml')) window.renderTopology();
  }
  var oldSwitch = window.switchNav;
  if (typeof oldSwitch === 'function' && !oldSwitch.__v063343Wrapped) {
    var wrapped = function(){ var ret = oldSwitch.apply(this, arguments); if (arguments[0] === 'overview') setTimeout(run, 60); return ret; };
    wrapped.__v063343Wrapped = true;
    window.switchNav = wrapped;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(run, 80); }); else setTimeout(run, 80);
})();


;


(function(){
  if(window.__v063343FinalWorkerFix)return; window.__v063343FinalWorkerFix=true;
  var VERSION='v0.6.33.45';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function st(){try{if(typeof currentState!=='undefined')return currentState||{};}catch(e){} return window.currentState||{};}
  function teams(){return st().teams||[];}
  function pad2(n){return String(Math.max(1,Math.min(5,Number(n)||1))).padStart(2,'0');}
  function cnNum(s){var map={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};var m=String(s||'').match(/[一二三四五六七八九]/);return m?map[m[0]]:0;}
  function firstNum(s){var m=String(s||'').match(/(\d+)/);return m?Number(m[1]):0;}
  function teamIndex(obj){if(!obj)return 1;var list=teams(); if(obj.id){var i=list.findIndex(function(t){return t.id===obj.id;}); if(i>=0)return i+1;} if(obj.teamId){var j=list.findIndex(function(t){return t.id===obj.teamId;}); if(j>=0)return j+1;} if(obj.masterId){var k=list.findIndex(function(t){return t.masterId===obj.masterId;}); if(k>=0)return k+1;} return firstNum(obj.id)||firstNum(obj.teamId)||firstNum(obj.masterCodename)||firstNum(obj.name)||cnNum(obj.name)||1;}
  function asset(path){path=String(path||''); if(path.indexOf('data:image/')===0)return path; var key=path.replace(/^\.\//,'').replace(/^prototypes\//,'').replace(/^\/docs\/prototypes\//,''); if(window.__avatarDataV41&&window.__avatarDataV41[key])return window.__avatarDataV41[key]; return './'+key;}
  function leaderAvatar(team){return asset('pic/avatars/avatar-leader-planner-'+pad2(teamIndex(team))+'.png');}
  function workerIdx(m){return firstNum(m&&m.name)||firstNum(m&&m.id)||1;}
  function workerAvatar(m){if(!m)return asset('pic/avatars/avatar-default.png'); if(m.teamRole==='leader'||m.isLeader||m.role==='@explorer')return leaderAvatar(m); var idx=pad2(workerIdx(m)); if(m.role==='@designer')return asset('pic/avatars/avatar-reviewer-'+idx+'.png'); return asset('pic/avatars/avatar-implementer-'+idx+'.png');}
  window.getLeaderAvatarSrc=leaderAvatar; window.getWorkerAvatarSrc=workerAvatar;
  function statusClass(s){return ['busy','idle','offline'].indexOf(s)>=0?s:'idle';}
  function statusLabel(s){return ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线'}[s]||'在线');}
  function roleLabel(m){return m&&m.role==='@designer'?'交付审查岗':'实现验证岗';}
  function busyMinutes(name){var s=String(name||''),n=0;for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%59;return 10+(n%49);}
  function cleanTask(raw,m){var t=String(raw||'').trim(); t=t.replace(/实现验证岗|交付审查岗|协同规划岗|组长/g,'').replace(/忙碌\s*忙碌/g,'忙碌').replace(/忙碌\s*\d+\s*m(in)?/ig,'').replace(/在线|离线|执行中|审查中/g,'').replace(/[·｜|]+/g,' ').replace(/\s+/g,' ').replace(/^[-—:：\s]+|[-—:：\s]+$/g,''); if(!t)t=m&&m.role==='@designer'?'交付审查':'任务执行'; return t;}
  function modeText(m){var s=statusClass(m.status),task=cleanTask(m.currentTaskSummary,m); if(s==='busy')return task+' · '+busyMinutes(m.name||m.id)+'m'; if(s==='offline')return '等待恢复'; return task;}
  function stageLabel(s){return ({build:'开发',design:'设计',test:'测试',acceptance:'验收'}[s]||s||'开发');}
  function members(t){return (t.members||[]).filter(function(m){return m.role==='@fixer'||m.role==='@designer';});}
  function pendingDecisions(t){try{return (st().decisions||[]).filter(function(d){return d.status==='pending'&&(!d.teamId||d.teamId===t.id);}).length||Number(t.pendingDecisions||0);}catch(e){return Number(t.pendingDecisions||0);}}
  function pendingReviews(t){try{var wo=(t.currentProject&&t.currentProject.workOrders)||[];var n=wo.filter(function(x){return ['submitted','reviewing'].indexOf(x.status)>=0;}).length;return n||Number(t.pendingReviews||0);}catch(e){return Number(t.pendingReviews||0);}}
  function leaderLine(t){var dec=pendingDecisions(t),rev=pendingReviews(t);return (dec||rev)?('待决策 '+dec+' · 待审查 '+rev):'任务拆解 · 进度跟踪';}
  function healthStatus(t){return t.masterStatus==='offline'?'offline':(t.healthy?'online-healthy':'online-warning');}
  function renderWorker(t,m){var s=statusClass(m.status),task=modeText(m),role=roleLabel(m),name=m.name||m.id||'成员';return '<div class="topo-worker topo-node '+esc(s)+'" data-action="open-worker" data-worker-name="'+esc(name)+'" data-master="'+esc(t.name||'')+'" title="'+esc(name+' · '+role+' · '+statusLabel(s)+' · '+task)+'"><span class="persona-avatar worker"><img class="persona-avatar-img" src="'+esc(workerAvatar(m))+'" alt="" loading="lazy"><span class="persona-status-dot '+esc(s)+'"></span></span><span class="topo-worker-text"><span class="topo-worker-name">'+esc(name)+'</span><span class="topo-worker-role">'+esc(role)+'</span><span class="topo-worker-cues"><span class="topo-worker-state">'+esc(statusLabel(s))+'</span><span class="topo-worker-mode">'+esc(task)+'</span></span></span></div>';}
  function doRender(){var host=document.getElementById('topologyHtml'); if(!host)return; host.innerHTML=teams().map(function(t){var p=t.currentProject||{},m=members(t),impl=m.filter(function(x){return x.role==='@fixer';}).length,review=m.filter(function(x){return x.role==='@designer';}).length,dec=pendingDecisions(t),rev=pendingReviews(t);return '<div class="topo-team-card" data-team-id="'+esc(t.id)+'"><div class="topo-team-header"><div class="topo-team-titlewrap"><span class="topo-team-name">'+esc(t.name||'团队')+'</span><div class="topo-team-projectline"><span class="topo-team-project" title="'+esc(p.name||'')+'">'+esc(p.name||'未绑定项目')+'</span><span class="stage-badge stage-'+esc(p.stage||'build')+'">'+esc(stageLabel(p.stage||'build'))+'</span></div></div><span class="topo-team-enter" onclick="openTeamTab(\''+esc(t.id)+'\')">→ 详情</span></div><div class="topo-master topo-node '+esc(healthStatus(t))+'" data-action="open-team" data-team-id="'+esc(t.id)+'" title="'+esc((t.masterCodename||'组长')+' · 协同规划岗 · '+leaderLine(t))+'"><span class="persona-avatar"><img class="persona-avatar-img" src="'+esc(leaderAvatar(t))+'" alt="" loading="lazy"><span class="persona-status-dot idle"></span></span><span class="persona-main topo-leader-stack"><span class="topo-master-name">'+esc(t.masterCodename||'组长')+'</span><span class="persona-role-tag">协同规划岗 · 组长</span><span class="topo-leader-cues"><span class="topo-leader-line '+(rev+dec>0?'warning':'')+'">'+esc(leaderLine(t))+'</span></span></span><button class="topo-node-action" title="与 '+esc(t.masterCodename||'组长')+' 协作" onclick="event.stopPropagation(); openChatWith(\''+esc(t.masterId||t.id)+'\')"><span>💬</span><span>协作</span></button></div><div class="topo-card-meta"><span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 '+impl+'</span><span class="role-pill review">交付审查 '+review+'</span></div><div class="topo-focus-bar"><span><b>当前阶段</b>'+esc(stageLabel(p.stage||'build'))+'</span><span><b>当前任务</b>'+esc(p.name||t.task||'当前任务')+'</span><span><b>待处理重点</b>'+(dec>0?('待决策 '+dec):(rev>0?('待审查 '+rev):'当前无待处理'))+'</span></div><div class="topo-workers">'+m.map(function(x){return renderWorker(t,x);}).join('')+'</div></div>';}).join(''); try{if(window.__v063340ApplyFixedSummary)window.__v063340ApplyFixedSummary();}catch(e){} try{if(window.__fixAvatarLinksV41)window.__fixAvatarLinksV41();}catch(e){} }
  window.renderTopology=doRender;
  function run(){document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型';document.querySelectorAll('.app-header-badge').forEach(function(el){el.textContent=VERSION+' · Mock 演示';});doRender();}
  var oldSwitch=window.switchNav; if(typeof oldSwitch==='function'&&!oldSwitch.__v063343FinalWrapped){var wrapped=function(){var ret=oldSwitch.apply(this,arguments); if(arguments[0]==='overview')setTimeout(run,60); return ret;}; wrapped.__v063343FinalWrapped=true; window.switchNav=wrapped;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(run,80);setTimeout(run,2200);setTimeout(run,6200);}); else {setTimeout(run,80);setTimeout(run,2200);setTimeout(run,6200);}
})();


;


(function(){
  if (window.__v063344AvatarIndexMap) return;
  window.__v063344AvatarIndexMap = true;
  var VERSION='v0.6.33.45';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function st(){try{if(typeof currentState!=='undefined')return currentState||{};}catch(e){}return window.currentState||{};}
  function teams(){return st().teams||[];}
  function pad2(n){return String(Math.max(1,Math.min(5,Number(n)||1))).padStart(2,'0');}
  function cnNum(s){var map={一:1,二:2,三:3,四:4,五:5};var m=String(s||'').match(/[一二三四五]/);return m?map[m[0]]:0;}
  function nums(s){return (String(s||'').match(/\d+/g)||[]).map(function(x){return Number(x);});}
  function firstNum(s){var a=nums(s);return a.length?a[0]:0;}
  function secondNum(s){var a=nums(s);return a.length>1?a[1]:0;}
  function teamNoFromAgentId(id){var n=firstNum(id); if(n>=2&&n<=4)return 1; if(n>=7&&n<=9)return 2; if(n>=11&&n<=13)return 3; if(n>=15&&n<=18)return 4; if(n>=20&&n<=23)return 5; return 0;}
  function teamIndex(o){
    if(!o)return 1;var list=teams();
    if(o.id){var i=list.findIndex(function(t){return t.id===o.id;});if(i>=0)return i+1;}
    if(o.teamId){var j=list.findIndex(function(t){return t.id===o.teamId;});if(j>=0)return j+1;}
    if(o.masterId){var k=list.findIndex(function(t){return t.masterId===o.masterId;});if(k>=0)return k+1;}
    return firstNum(o.teamId)||firstNum(o.teamName)||firstNum(o.name)||firstNum(o.masterCodename)||cnNum(o.teamName)||cnNum(o.name)||teamNoFromAgentId(o.id)||1;
  }
  function memberSeq(m){
    if(!m)return 1;
    var s=secondNum(m.name)||secondNum(m.codename)||secondNum(m.id);
    if(s) return s;
    var n=firstNum(m.id);
    if(n && (n%10)) return Math.max(1,Math.min(2,n%10));
    return 1;
  }
  function avatarSlot(team, seq){
    // 5 个头像资源一组：同一团队内按成员序号轮转，跨团队按团队编号错位复用。
    return pad2(((Math.max(1,Number(team)||1) + Math.max(1,Number(seq)||1) - 2) % 5) + 1);
  }
  function asset(path){
    path=String(path||'');
    if(path.indexOf('data:image/')===0)return path;
    var key=path.replace(/^\.\//,'').replace(/^prototypes\//,'').replace(/^\/docs\/prototypes\//,'');
    if(window.__avatarDataV41&&window.__avatarDataV41[key])return window.__avatarDataV41[key];
    return './'+key;
  }
  function leaderKey(t){return 'leader-'+pad2(teamIndex(t));}
  function leaderAvatar(t){return asset('pic/avatars/avatar-leader-planner-'+pad2(teamIndex(t))+'.png');}
  function workerKey(m,t){
    if(!m)return 'default';
    if(m.teamRole==='leader'||m.isLeader||m.role==='@explorer')return leaderKey(t||m);
    var team=teamIndex(t)||teamIndex(m);
    var slot=avatarSlot(team,memberSeq(m));
    if(m.role==='@designer') return 'reviewer-'+slot;
    return 'implementer-'+slot;
  }
  function workerAvatar(m,t){
    var key=workerKey(m,t);
    if(key.indexOf('leader-')===0) return leaderAvatar(t||m);
    if(key.indexOf('reviewer-')===0) return asset('pic/avatars/avatar-reviewer-'+key.split('-')[1]+'.png');
    if(key.indexOf('implementer-')===0) return asset('pic/avatars/avatar-implementer-'+key.split('-')[1]+'.png');
    return asset('pic/avatars/avatar-default.png');
  }
  function statusClass(s){return ['busy','idle','offline'].indexOf(s)>=0?s:'idle';}
  function workerOuterClass(s){return s==='busy'?'worker-busy':(s==='offline'?'worker-offline':'worker-online');}
  function statusLabel(s){return ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线'}[s]||'在线');}
  function roleLabel(m){return m&&m.role==='@designer'?'交付审查岗':'实现验证岗';}
  function busyMinutes(name){var s=String(name||''),n=0;for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%59;return 10+(n%49);}
  function cleanTask(raw,m){var t=String(raw||'').trim();t=t.replace(/实现验证岗|交付审查岗|协同规划岗|组长/g,'').replace(/忙碌\s*忙碌/g,'忙碌').replace(/忙碌\s*\d+\s*m(in)?/ig,'').replace(/在线|离线|执行中|审查中|需关注|需组长关注/g,'').replace(/[·｜|]+/g,' ').replace(/\s+/g,' ').replace(/^[-—:：\s]+|[-—:：\s]+$/g,'');if(!t)t=m&&m.role==='@designer'?'交付审查':'任务执行';return t;}
  function modeText(m){var s=statusClass(m.status),task=cleanTask(m.currentTaskSummary,m);if(s==='busy')return task+' · '+busyMinutes(m.name||m.id)+'m';if(s==='offline')return '等待恢复';return task;}
  function stageLabel(s){return ({build:'开发',design:'设计',test:'测试',acceptance:'验收'}[s]||s||'开发');}
  function members(t){return (t.members||[]).filter(function(m){return m.role==='@fixer'||m.role==='@designer';});}
  function pendingDecisions(t){try{return (st().decisions||[]).filter(function(d){return d.status==='pending'&&(!d.teamId||d.teamId===t.id);}).length||Number(t.pendingDecisions||0);}catch(e){return Number(t.pendingDecisions||0);}}
  function pendingReviews(t){try{var wo=(t.currentProject&&t.currentProject.workOrders)||[];var n=wo.filter(function(x){return ['submitted','reviewing'].indexOf(x.status)>=0;}).length;return n||Number(t.pendingReviews||0);}catch(e){return Number(t.pendingReviews||0);}}
  function leaderLine(t){var dec=pendingDecisions(t),rev=pendingReviews(t);return (dec||rev)?('待决策 '+dec+' · 待审查 '+rev):'任务拆解 · 进度跟踪';}
  function healthStatus(t){return t.masterStatus==='offline'?'offline':(t.healthy?'online-healthy':'online-warning');}
  function renderWorker(t,m){var s=statusClass(m.status),task=modeText(m),role=roleLabel(m),name=m.name||m.id||'成员',key=workerKey(m,t);return '<div class="topo-worker topo-node '+workerOuterClass(s)+'" data-avatar-id="'+esc(key)+'" data-action="open-worker" data-worker-name="'+esc(name)+'" data-master="'+esc(t.name||'')+'" title="'+esc(name+' · '+role+' · '+statusLabel(s)+' · '+task)+'"><span class="persona-avatar worker"><img class="persona-avatar-img" data-avatar-id="'+esc(key)+'" src="'+esc(workerAvatar(m,t))+'" alt="" loading="lazy"><span class="persona-status-dot '+esc(s)+'"></span></span><span class="topo-worker-text"><span class="topo-worker-name">'+esc(name)+'</span><span class="topo-worker-role">'+esc(role)+'</span><span class="topo-worker-cues"><span class="topo-worker-state">'+esc(statusLabel(s))+'</span><span class="topo-worker-mode">'+esc(task)+'</span></span></span></div>';}
  function doRender(){var host=document.getElementById('topologyHtml');if(!host)return;host.innerHTML=teams().map(function(t){var p=t.currentProject||{},m=members(t),impl=m.filter(function(x){return x.role==='@fixer';}).length,review=m.filter(function(x){return x.role==='@designer';}).length,dec=pendingDecisions(t),rev=pendingReviews(t),lk=leaderKey(t);return '<div class="topo-team-card" data-team-id="'+esc(t.id)+'"><div class="topo-team-header"><div class="topo-team-titlewrap"><span class="topo-team-name">'+esc(t.name||'团队')+'</span><div class="topo-team-projectline"><span class="topo-team-project" title="'+esc(p.name||'')+'">'+esc(p.name||'未绑定项目')+'</span><span class="stage-badge stage-'+esc(p.stage||'build')+'">'+esc(stageLabel(p.stage||'build'))+'</span></div></div><span class="topo-team-enter" onclick="openTeamTab(\''+esc(t.id)+'\')">→ 详情</span></div><div class="topo-master topo-node '+esc(healthStatus(t))+'" data-avatar-id="'+esc(lk)+'" data-action="open-team" data-team-id="'+esc(t.id)+'" title="'+esc((t.masterCodename||'组长')+' · 协同规划岗 · '+leaderLine(t))+'"><span class="persona-avatar"><img class="persona-avatar-img" data-avatar-id="'+esc(lk)+'" src="'+esc(leaderAvatar(t))+'" alt="" loading="lazy"><span class="persona-status-dot idle"></span></span><span class="persona-main topo-leader-stack"><span class="topo-master-name">'+esc(t.masterCodename||'组长')+'</span><span class="persona-role-tag">协同规划岗 · 组长</span><span class="topo-leader-cues"><span class="topo-leader-line '+(rev+dec>0?'warning':'')+'">'+esc(leaderLine(t))+'</span></span></span><button class="topo-node-action" title="与 '+esc(t.masterCodename||'组长')+' 协作" onclick="event.stopPropagation(); openChatWith(\''+esc(t.masterId||t.id)+'\')"><span>💬</span><span>协作</span></button></div><div class="topo-card-meta"><span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 '+impl+'</span><span class="role-pill review">交付审查 '+review+'</span></div><div class="topo-focus-bar"><span><b>当前阶段</b>'+esc(stageLabel(p.stage||'build'))+'</span><span><b>当前任务</b>'+esc(p.name||t.task||'当前任务')+'</span><span><b>待处理重点</b>'+(dec>0?('待决策 '+dec):(rev>0?('待审查 '+rev):'当前无待处理'))+'</span></div><div class="topo-workers">'+m.map(function(x){return renderWorker(t,x);}).join('')+'</div></div>';}).join('');try{if(window.__v063340ApplyFixedSummary)window.__v063340ApplyFixedSummary();}catch(e){}try{if(window.__fixAvatarLinksV41)window.__fixAvatarLinksV41();}catch(e){} }
  function run(){window.getLeaderAvatarSrc=leaderAvatar;window.getWorkerAvatarSrc=function(m){return workerAvatar(m,null);};window.__v063344AvatarKey=function(m,t){return workerKey(m,t);};window.renderTopology=doRender;document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型';document.querySelectorAll('.app-header-badge').forEach(function(el){el.textContent=VERSION+' · Mock 演示';});doRender();}
  window.__v063344AvatarIndexRun=run;
  [0,80,260,800,1600,3200,6200].forEach(function(ms){setTimeout(run,ms);});
  var oldSwitch=window.switchNav;if(typeof oldSwitch==='function'&&!oldSwitch.__v063344AvatarWrapped){var wrapped=function(){var ret=oldSwitch.apply(this,arguments);if(arguments[0]==='overview')[60,180,500,1000,2200].forEach(function(ms){setTimeout(run,ms);});return ret;};wrapped.__v063344AvatarWrapped=true;window.switchNav=wrapped;}
  setTimeout(function(){try{var finalRender=window.renderTopology;Object.defineProperty(window,'renderTopology',{configurable:true,enumerable:true,get:function(){return finalRender;},set:function(){}});}catch(e){}},1200);
})();


;


(function(){
  const ROLE_REVIEW = '交付审查岗';
  function stateSafe(){ try { return typeof state === 'function' ? state() : (window.currentState || {}); } catch(e){ return window.currentState || {}; } }
  function cleanTextValue(v){
    if (v == null) return v;
    return String(v)
      .replace(/系统架构师\s*\/\s*技术专家岗/g, ROLE_REVIEW)
      .replace(/系统架构师|技术专家岗|技术专家|架构专家/g, ROLE_REVIEW)
      .replace(/专家支持/g, '决策支持')
      .replace(/待介入\s*\/\s*/g, '')
      .replace(/暂{2,}(?=暂无待决策)/g, '')
      .replace(/暂{2,}/g, '')
      .replace(/\s+已介入/g, ' 已记录')
      .replace(/按待决策：原型架构边界/g, '待决策：原型边界需确认')
      .replace(/财务凭证规则评审/g, '财务凭证规则审查')
      .trim();
  }
  function normalizeData(){
    const s = stateSafe();
    (s.teams || []).forEach(t=>{
      t.expertSupport = cleanTextValue(t.expertSupport || '暂无待决策') || '暂无待决策';
      (t.members || []).forEach(m=>{
        if (m.role === '@oracle') {
          m.projectRole = ROLE_REVIEW;
          m.currentTaskSummary = cleanTextValue(m.currentTaskSummary || '审查高风险任务与用户决策边界');
        }
      });
      (t.activities || []).forEach(a=>{ a.desc = cleanTextValue(a.desc); });
    });
    (s.decisions || []).forEach(d=>{
      d.sourceRole = cleanTextValue(d.sourceRole || '交付审查岗');
      d.suggestedOwner = cleanTextValue(d.suggestedOwner || '协同规划岗');
      d.escalationPath = cleanTextValue(d.escalationPath || '交付审查岗 → 协同规划岗 → 用户');
      d.context = cleanTextValue(d.context);
    });
  }
  window.getDisplayRole = (function(orig){
    return function(w){
      const role = (w && w.role) || w;
      if (role === '@oracle') return ROLE_REVIEW;
      return cleanTextValue(orig ? orig.apply(this, arguments) : (w?.projectRole || w?.role || ''));
    };
  })(window.getDisplayRole);
  window.roleComposition = function(team){
    const members = team.members || [];
    const impl = members.filter(m => m.role === '@fixer').length;
    const review = members.filter(m => m.role === '@designer' || m.role === '@oracle').length;
    return `实现验证岗 x${impl} · 交付审查岗 x${review}`;
  };
  function sanitizeVisibleText(root){
    root = root || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        return /技术专家|系统架构师|架构专家|专家支持|待介入|暂{2,}/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{ n.nodeValue = cleanTextValue(n.nodeValue); });
  }
  function enhanceTeamCards(){
    const cards = Array.from(document.querySelectorAll('#teamCardsContainer > .card'));
    const s = stateSafe();
    cards.forEach((card, idx)=>{
      if (card.querySelector('.team-output-strip-v63333')) return;
      const t = (s.teams || [])[idx] || {};
      const project = t.currentProject || {};
      const nextAction = cleanTextValue(project.nextStep || t.task || '继续推进任务单闭环');
      const body = card.querySelector('.card-body') || card;
      const wrap = document.createElement('div');
      wrap.className = 'team-output-strip-v63333';
      wrap.innerHTML = `
        <div class="team-output-title-v63333">📌 岗位产出</div>
        <div class="team-output-grid-v63333">
          <div class="team-output-item-v63333"><strong>计划</strong>任务拆解 / 风险说明</div>
          <div class="team-output-item-v63333"><strong>执行</strong>实现结果 / 验证反馈</div>
          <div class="team-output-item-v63333"><strong>审查</strong>审查结论 / 下一步：${nextAction}</div>
        </div>`;
      body.appendChild(wrap);
    });
  }
  function enhanceTeamDetail(){
    const host = document.querySelector('[data-team-tab-pane="workbench"].active') || document.querySelector('#page-teams');
    if (!host || host.querySelector('.team-output-detail-v63333')) return;
  }
  function applyPatch(){ normalizeData(); sanitizeVisibleText(document.body); enhanceTeamCards(); }
  ['renderAll','renderTeamCards','renderTopology','renderProjects','renderWorkerPool','renderTeamDetailLeftPanel','renderWorkbenchAgentDetail','openTeamTab','switchNav'].forEach(name=>{
    const orig = window[name];
    if (typeof orig === 'function' && !orig.__v63333Wrapped) {
      const wrapped = function(){ const r = orig.apply(this, arguments); setTimeout(applyPatch, 0); return r; };
      wrapped.__v63333Wrapped = true;
      window[name] = wrapped;
    }
  });
  document.addEventListener('DOMContentLoaded', ()=>setTimeout(applyPatch, 0));
  setTimeout(applyPatch, 0);
  setTimeout(applyPatch, 800);
})();


;


(function(){
  if (window.__v063336SafeOverviewFix) return;
  window.__v063336SafeOverviewFix = true;
  var VERSION='v0.6.33.45';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function st(){ try { if (typeof currentState !== 'undefined') return currentState || {}; } catch(e){} return window.currentState || {}; }
  function removeDeliveryStrip(){ document.querySelectorAll('#page-overview .delivery-path-v63330').forEach(function(el){ el.remove(); }); }
  function setVersion(){
    try { document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型'; } catch(e){}
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent=VERSION+' · Mock 演示'; });
  }
  function projectName(t){ return (t && t.currentProject && t.currentProject.name) || (t && t.name) || '当前项目'; }
  function renderCleanActivityDom(){
    var stream=document.getElementById('overviewActivityStream'); if(!stream) return;
    var teams=(st().teams||[]); if(!teams.length) return;
    var texts=[];
    teams.forEach(function(t,i){
      var name=t.name||('研发'+(i+1)+'组'); var p=projectName(t);
      var a=['协同规划岗更新任务拆解','实现验证岗回写执行反馈','交付审查岗记录审查意见','协同规划岗同步风险边界','实现验证岗完成页面一致性检查'][i%5];
      var b=['交付审查岗完成交付物复核','协同规划岗确认下一步动作','实现验证岗补齐验证记录','交付审查岗通过本轮检查','协同规划岗整理待决策项'][i%5];
      texts.push({team:name,time:(i*2+2)+'m 前',desc:a+' · '+p});
      texts.push({team:name,time:(i*2+4)+'m 前',desc:b+' · '+p});
    });
    stream.innerHTML=texts.slice(0,10).map(function(a){return '<div class="activity-item"><div class="activity-time">'+esc(a.time)+' - '+esc(a.team)+'</div><div class="activity-content">'+esc(a.desc)+'</div></div>';}).join('');
  }

  function localizePicSrc(src){ return String(src||'').replace(/^\/docs\/prototypes\/pic\//,'pic/').replace(/^docs\/prototypes\/pic\//,'pic/'); }
  function localizeImages(){
    document.querySelectorAll('img').forEach(function(img){
      var s=img.getAttribute('src')||'';
      if(/^\/docs\/prototypes\/pic\//.test(s) || /^docs\/prototypes\/pic\//.test(s)) img.setAttribute('src', localizePicSrc(s));
    });
  }
  try { if(typeof window.getLeaderAvatarSrc==='function' && !window.getLeaderAvatarSrc.__v063336Local){ var oldL=window.getLeaderAvatarSrc; var nl=function(){ return localizePicSrc(oldL.apply(this,arguments)); }; nl.__v063336Local=true; window.getLeaderAvatarSrc=nl; } } catch(e){}
  try { if(typeof window.getWorkerAvatarSrc==='function' && !window.getWorkerAvatarSrc.__v063336Local){ var oldW=window.getWorkerAvatarSrc; var nw=function(){ return localizePicSrc(oldW.apply(this,arguments)); }; nw.__v063336Local=true; window.getWorkerAvatarSrc=nw; } } catch(e){}

  function patch(){ setVersion(); removeDeliveryStrip(); localizeImages(); renderCleanActivityDom(); }
  function after(){ patch(); setTimeout(patch,40); setTimeout(patch,160); setTimeout(patch,500); }
  ['renderOverview','renderTopology','switchNav','refreshAllViews'].forEach(function(name){
    var fn=window[name];
    if(typeof fn==='function' && !fn.__v063336Wrapped){
      var w=function(){ var ret=fn.apply(this,arguments); after(); return ret; };
      w.__v063336Wrapped=true; window[name]=w;
    }
  });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', after); else after();
  [800,1600,3200,5200,8000,12000].forEach(function(ms){ setTimeout(after,ms); });
  /* v0.6.33.45: disabled 250ms safe overview polling to avoid layout jitter */
  setTimeout(after,250); setTimeout(after,1200);
})();


;


(function(){
  if (window.__v063339AntiJitter) return;
  window.__v063339AntiJitter = true;
  var native = window.__v063339NativeTimers || { setTimeout: window.setTimeout.bind(window), clearTimeout: window.clearTimeout.bind(window), setInterval: window.setInterval.bind(window), clearInterval: window.clearInterval.bind(window) };
  var VERSION = 'v0.6.33.45';
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function stateSafe(){ try { if (typeof currentState !== 'undefined') return currentState || {}; } catch(e){} return window.currentState || {}; }
  function localizePicSrc(src){ return String(src||'').replace(/^\/docs\/prototypes\/pic\//,'pic/').replace(/^docs\/prototypes\/pic\//,'pic/'); }
  function setVersion(){
    try { document.title='智能软件工厂 '+VERSION+' · AI 原生岗位协作原型'; } catch(e){}
    document.querySelectorAll('.app-header-badge').forEach(function(el){ el.textContent = VERSION + ' · Mock 演示'; });
  }
  function removeVolatileOverviewBits(){
    document.querySelectorAll('#page-overview .delivery-path-v63330, #page-overview [class^="delivery-path-v63330"], #page-overview [class*=" delivery-path-v63330"], #page-overview .topo-card-summary, #page-overview .topo-current-row, #page-overview [data-current-stage-row]').forEach(function(el){ try { el.remove(); } catch(e){} });
    // Remove legacy text row if a historical patch generated it without a stable class.
    document.querySelectorAll('#page-overview .topo-team-card *').forEach(function(el){
      var txt=(el.textContent||'').replace(/\s+/g,'');
      if (/当前阶段|当前任务|待处理重点/.test(txt) && el.children.length < 3) { try { el.remove(); } catch(e){} }
    });
  }
  function localizeImages(){
    document.querySelectorAll('img').forEach(function(img){
      var s=img.getAttribute('src')||'';
      var ns=localizePicSrc(s);
      if(ns !== s) img.setAttribute('src', ns);
    });
  }
  function projectName(t){ return (t && t.currentProject && t.currentProject.name) || (t && t.name) || '当前项目'; }
  function renderStableActivity(){
    var stream=document.getElementById('overviewActivityStream'); if(!stream) return;
    var teams=(stateSafe().teams||[]); if(!teams.length) return;
    var actions=['更新任务拆解和下一步动作','回写实现验证反馈','完成交付物复核','确认风险边界','整理待决策项'];
    var rows=[];
    teams.forEach(function(t,i){
      var name=t.name||('研发'+(i+1)+'组'); var p=projectName(t);
      rows.push({team:name,time:(i*2+2)+'m 前',desc:'协同规划岗 '+actions[i%actions.length]+' · '+p});
      rows.push({team:name,time:(i*2+4)+'m 前',desc:'交付审查岗 '+actions[(i+2)%actions.length]+' · '+p});
    });
    stream.innerHTML=rows.slice(0,10).map(function(a){return '<div class="activity-item"><div class="activity-time">'+esc(a.time)+' - '+esc(a.team)+'</div><div class="activity-content">'+esc(a.desc)+'</div></div>';}).join('');
  }
  function applyStableOnce(){ setVersion(); removeVolatileOverviewBits(); localizeImages(); renderStableActivity(); }
  function freezeLegacyTimers(){ try { if (typeof window.__v063339StopLegacyTimers === 'function') window.__v063339StopLegacyTimers(); } catch(e){} }
  function finalStabilize(){
    // Let the original onload render first, then cancel legacy delayed re-patches and apply one stable pass.
    try { applyStableOnce(); } catch(e){}
    freezeLegacyTimers();
    try { applyStableOnce(); } catch(e){}
    window.__v063339StableAt = Date.now();
  }
  function boot(){
    native.setTimeout(finalStabilize, 180);
    native.setTimeout(finalStabilize, 520);
  }
  if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot, { once:true });
  window.__v063339ApplyStableOnce = applyStableOnce;
})();


;


(function(){
  if (window.__v063342WorkerStatusDedupe) return;
  window.__v063342WorkerStatusDedupe = true;
  function clean(){
    var root = document.querySelector('#page-overview #topologyHtml');
    if (!root) return;
    root.querySelectorAll('.topo-worker').forEach(function(card){
      card.querySelectorAll('.topo-worker-state').forEach(function(el){
        var txt = (el.textContent || '').replace(/^[\s●•·∙⬤🟢🟠🔵⚪]+/, '').trim();
        if (txt) el.textContent = txt;
        el.setAttribute('data-v063342-work-status-pill','1');
      });
      card.querySelectorAll('.status-dot,.online-dot,.worker-inline-dot,.status-inline-dot,.topo-worker-state-dot,.topo-worker-status-dot').forEach(function(dot){
        if (dot.classList && dot.classList.contains('persona-status-dot')) return;
        if (dot.closest && dot.closest('.persona-avatar')) return;
        dot.setAttribute('data-v063342-hidden-status-dot','1');
      });
    });
  }
  function schedule(){ clearTimeout(window.__v063342WorkerStatusDedupeTimer); window.__v063342WorkerStatusDedupeTimer=setTimeout(clean, 30); }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(clean,0); setTimeout(clean,300); });
  document.addEventListener('stable-v63329-rendered', schedule);
  var old = window.renderTopology;
  if (typeof old === 'function' && !old.__v063342Wrapped) {
    var wrapped = function(){ var ret = old.apply(this, arguments); schedule(); return ret; };
    wrapped.__v063342Wrapped = true;
    window.renderTopology = wrapped;
  }
  try { new MutationObserver(schedule).observe(document.body, {childList:true, subtree:true, characterData:true}); } catch(e) {}
  setTimeout(clean,800); setTimeout(clean,2000);
})();


;


(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function st(){try{if(typeof currentState!=='undefined')return currentState||{};}catch(e){}return window.currentState||{};}
  function teams(){return st().teams||[];}
  function pad2(n){return String(Math.max(1,Math.min(5,Number(n)||1))).padStart(2,'0');}
  function cnNum(s){var map={一:1,二:2,三:3,四:4,五:5};var m=String(s||'').match(/[一二三四五]/);return m?map[m[0]]:0;}
  function firstNum(s){var m=String(s||'').match(/(\d+)/);return m?Number(m[1]):0;}
  function teamIndex(o){if(!o)return 1;var list=teams();if(o.id){var i=list.findIndex(function(t){return t.id===o.id;});if(i>=0)return i+1;}if(o.teamId){var j=list.findIndex(function(t){return t.id===o.teamId;});if(j>=0)return j+1;}if(o.masterId){var k=list.findIndex(function(t){return t.masterId===o.masterId;});if(k>=0)return k+1;}return firstNum(o.id)||firstNum(o.teamId)||firstNum(o.masterCodename)||firstNum(o.name)||cnNum(o.name)||1;}
  function asset(path){path=String(path||'');if(path.indexOf('data:image/')===0)return path;var key=path.replace(/^\.\//,'').replace(/^prototypes\//,'').replace(/^\/docs\/prototypes\//,'');if(window.__avatarDataV41&&window.__avatarDataV41[key])return window.__avatarDataV41[key];return './'+key;}
  function leaderAvatar(t){return asset('pic/avatars/avatar-leader-planner-'+pad2(teamIndex(t))+'.png');}
  function workerIdx(m){return firstNum(m&&m.name)||firstNum(m&&m.id)||1;}
  function workerAvatar(m){if(!m)return asset('pic/avatars/avatar-default.png');if(m.teamRole==='leader'||m.isLeader||m.role==='@explorer')return leaderAvatar(m);var idx=pad2(workerIdx(m));if(m.role==='@designer')return asset('pic/avatars/avatar-reviewer-'+idx+'.png');return asset('pic/avatars/avatar-implementer-'+idx+'.png');}
  function statusClass(s){return ['busy','idle','offline'].indexOf(s)>=0?s:'idle';}
  function statusLabel(s){return ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线'}[s]||'在线');}
  function roleLabel(m){return m&&m.role==='@designer'?'交付审查岗':'实现验证岗';}
  function busyMinutes(name){var s=String(name||''),n=0;for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%59;return 10+(n%49);}
  function cleanTask(raw,m){var t=String(raw||'').trim();t=t.replace(/实现验证岗|交付审查岗|协同规划岗|组长/g,'').replace(/忙碌\s*忙碌/g,'忙碌').replace(/忙碌\s*\d+\s*m(in)?/ig,'').replace(/在线|离线|执行中|审查中/g,'').replace(/[·｜|]+/g,' ').replace(/\s+/g,' ').replace(/^[-—:：\s]+|[-—:：\s]+$/g,'');if(!t)t=m&&m.role==='@designer'?'交付审查':'任务执行';return t;}
  function modeText(m){var s=statusClass(m.status),task=cleanTask(m.currentTaskSummary,m);if(s==='busy')return task+' · '+busyMinutes(m.name||m.id)+'m';if(s==='offline')return '等待恢复';return task;}
  function stageLabel(s){return ({build:'开发',design:'设计',test:'测试',acceptance:'验收'}[s]||s||'开发');}
  function members(t){return (t.members||[]).filter(function(m){return m.role==='@fixer'||m.role==='@designer';});}
  function pendingDecisions(t){try{return (st().decisions||[]).filter(function(d){return d.status==='pending'&&(!d.teamId||d.teamId===t.id);}).length||Number(t.pendingDecisions||0);}catch(e){return Number(t.pendingDecisions||0);}}
  function pendingReviews(t){try{var wo=(t.currentProject&&t.currentProject.workOrders)||[];var n=wo.filter(function(x){return ['submitted','reviewing'].indexOf(x.status)>=0;}).length;return n||Number(t.pendingReviews||0);}catch(e){return Number(t.pendingReviews||0);}}
  function leaderLine(t){var dec=pendingDecisions(t),rev=pendingReviews(t);return (dec||rev)?('待决策 '+dec+' · 待审查 '+rev):'任务拆解 · 进度跟踪';}
  function healthStatus(t){return t.masterStatus==='offline'?'offline':(t.healthy?'online-healthy':'online-warning');}
  function renderWorker(t,m){var s=statusClass(m.status),task=modeText(m),role=roleLabel(m),name=m.name||m.id||'成员';return '<div class="topo-worker topo-node '+esc(s)+'" data-action="open-worker" data-worker-name="'+esc(name)+'" data-master="'+esc(t.name||'')+'" title="'+esc(name+' · '+role+' · '+statusLabel(s)+' · '+task)+'"><span class="persona-avatar worker"><img class="persona-avatar-img" src="'+esc(workerAvatar(m))+'" alt="" loading="lazy"><span class="persona-status-dot '+esc(s)+'"></span></span><span class="topo-worker-text"><span class="topo-worker-name">'+esc(name)+'</span><span class="topo-worker-role">'+esc(role)+'</span><span class="topo-worker-cues"><span class="topo-worker-state">'+esc(statusLabel(s))+'</span><span class="topo-worker-mode">'+esc(task)+'</span></span></span></div>';}
  function doRender(){var host=document.getElementById('topologyHtml');if(!host)return;host.innerHTML=teams().map(function(t){var p=t.currentProject||{},m=members(t),impl=m.filter(function(x){return x.role==='@fixer';}).length,review=m.filter(function(x){return x.role==='@designer';}).length,dec=pendingDecisions(t),rev=pendingReviews(t);return '<div class="topo-team-card" data-team-id="'+esc(t.id)+'"><div class="topo-team-header"><div class="topo-team-titlewrap"><span class="topo-team-name">'+esc(t.name||'团队')+'</span><div class="topo-team-projectline"><span class="topo-team-project" title="'+esc(p.name||'')+'">'+esc(p.name||'未绑定项目')+'</span><span class="stage-badge stage-'+esc(p.stage||'build')+'">'+esc(stageLabel(p.stage||'build'))+'</span></div></div><span class="topo-team-enter" onclick="openTeamTab(\''+esc(t.id)+'\')">→ 详情</span></div><div class="topo-master topo-node '+esc(healthStatus(t))+'" data-action="open-team" data-team-id="'+esc(t.id)+'" title="'+esc((t.masterCodename||'组长')+' · 协同规划岗 · '+leaderLine(t))+'"><span class="persona-avatar"><img class="persona-avatar-img" src="'+esc(leaderAvatar(t))+'" alt="" loading="lazy"><span class="persona-status-dot idle"></span></span><span class="persona-main topo-leader-stack"><span class="topo-master-name">'+esc(t.masterCodename||'组长')+'</span><span class="persona-role-tag">协同规划岗 · 组长</span><span class="topo-leader-cues"><span class="topo-leader-line '+(rev+dec>0?'warning':'')+'">'+esc(leaderLine(t))+'</span></span></span><button class="topo-node-action" title="与 '+esc(t.masterCodename||'组长')+' 协作" onclick="event.stopPropagation(); openChatWith(\''+esc(t.masterId||t.id)+'\')"><span>💬</span><span>协作</span></button></div><div class="topo-card-meta"><span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 '+impl+'</span><span class="role-pill review">交付审查 '+review+'</span></div><div class="topo-focus-bar"><span><b>当前阶段</b>'+esc(stageLabel(p.stage||'build'))+'</span><span><b>当前任务</b>'+esc(p.name||t.task||'当前任务')+'</span><span><b>待处理重点</b>'+(dec>0?('待决策 '+dec):(rev>0?('待审查 '+rev):'当前无待处理'))+'</span></div><div class="topo-workers">'+m.map(function(x){return renderWorker(t,x);}).join('')+'</div></div>';}).join('');try{if(window.__v063340ApplyFixedSummary)window.__v063340ApplyFixedSummary();}catch(e){}try{if(window.__fixAvatarLinksV41)window.__fixAvatarLinksV41();}catch(e){}}
  function run(){window.getLeaderAvatarSrc=leaderAvatar;window.getWorkerAvatarSrc=workerAvatar;window.renderTopology=doRender;document.title='智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';document.querySelectorAll('.app-header-badge').forEach(function(el){el.textContent='v0.6.33.45 · Mock 演示';});doRender();}
  window.__v063343AbsoluteFinalRun=run;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(run,100);setTimeout(run,3000);setTimeout(run,8000);});else{setTimeout(run,100);setTimeout(run,3000);setTimeout(run,8000);}
})();


;


(function(){
  if (window.__v063343AbsoluteFinalLock) return;
  window.__v063343AbsoluteFinalLock = true;
  function run(){ try { if (window.__v063343AbsoluteFinalRun) window.__v063343AbsoluteFinalRun(); } catch(e) {} }
  setTimeout(function(){
    run();
    try {
      var finalRender = window.renderTopology;
      Object.defineProperty(window, 'renderTopology', { configurable:true, enumerable:true, get:function(){ return finalRender; }, set:function(){ /* ignore legacy rewrites */ } });
    } catch(e) {}
  }, 0);
  var oldSwitch = window.switchNav;
  if (typeof oldSwitch === 'function' && !oldSwitch.__v063343AbsoluteFinalLockWrapped) {
    var wrapped = function(){
      var ret = oldSwitch.apply(this, arguments);
      if (arguments[0] === 'overview') { setTimeout(run,80); setTimeout(run,600); setTimeout(run,1800); }
      return ret;
    };
    wrapped.__v063343AbsoluteFinalLockWrapped = true;
    window.switchNav = wrapped;
  }
  setTimeout(run, 500);
  setTimeout(run, 2400);
  setTimeout(run, 7000);
})();


;


(function(){
  if (window.__v063343AbsoluteFinalScheduler) return;
  window.__v063343AbsoluteFinalScheduler = true;
  function run(){ try { if (window.__v063343AbsoluteFinalRun) window.__v063343AbsoluteFinalRun(); } catch(e){} }
  [120, 480, 900, 1600, 2800, 5200, 8200].forEach(function(ms){ setTimeout(run, ms); });
  var oldSwitch = window.switchNav;
  if (typeof oldSwitch === 'function' && !oldSwitch.__v063343SchedulerWrapped) {
    var wrapped = function(){
      var ret = oldSwitch.apply(this, arguments);
      if (arguments[0] === 'overview') [80, 300, 700, 1100, 1900, 3200].forEach(function(ms){ setTimeout(run, ms); });
      return ret;
    };
    wrapped.__v063343SchedulerWrapped = true;
    window.switchNav = wrapped;
  }
})();


;


(function(){
  if (window.__v063343AbsoluteFinalObserver) return;
  window.__v063343AbsoluteFinalObserver = true;
  function hasBad(){
    var root=document.querySelector('#page-overview #topologyHtml');
    if(!root) return false;
    if(root.querySelector('.busy-duration-chip')) return true;
    return /忙碌\s*忙碌|需关注/.test(root.textContent||'');
  }
  function run(){ try { if (hasBad() && window.__v063343AbsoluteFinalRun) window.__v063343AbsoluteFinalRun(); } catch(e){} }
  try { new MutationObserver(function(){ clearTimeout(window.__v063343FinalObserverTimer); window.__v063343FinalObserverTimer=setTimeout(run,40); }).observe(document.body,{childList:true,subtree:true,characterData:true}); } catch(e) {}
  [1000,2200,4200,7200,10000].forEach(function(ms){setTimeout(run,ms);});
})();


;


(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function st(){try{if(typeof currentState!=='undefined')return currentState||{};}catch(e){}return window.currentState||{};}
  function teams(){return st().teams||[];}
  function pad2(n){return String(Math.max(1,Math.min(5,Number(n)||1))).padStart(2,'0');}
  function cnNum(s){var map={一:1,二:2,三:3,四:4,五:5};var m=String(s||'').match(/[一二三四五]/);return m?map[m[0]]:0;}
  function firstNum(s){var m=String(s||'').match(/(\d+)/);return m?Number(m[1]):0;}
  function teamIndex(o){if(!o)return 1;var list=teams();if(o.id){var i=list.findIndex(function(t){return t.id===o.id;});if(i>=0)return i+1;}if(o.teamId){var j=list.findIndex(function(t){return t.id===o.teamId;});if(j>=0)return j+1;}if(o.masterId){var k=list.findIndex(function(t){return t.masterId===o.masterId;});if(k>=0)return k+1;}return firstNum(o.id)||firstNum(o.teamId)||firstNum(o.masterCodename)||firstNum(o.name)||cnNum(o.name)||1;}
  function asset(path){path=String(path||'');if(path.indexOf('data:image/')===0)return path;var key=path.replace(/^\.\//,'').replace(/^prototypes\//,'').replace(/^\/docs\/prototypes\//,'');if(window.__avatarDataV41&&window.__avatarDataV41[key])return window.__avatarDataV41[key];return './'+key;}
  function leaderAvatar(t){return asset('pic/avatars/avatar-leader-planner-'+pad2(teamIndex(t))+'.png');}
  function workerIdx(m){return firstNum(m&&m.name)||firstNum(m&&m.id)||1;}
  function workerAvatar(m){if(!m)return asset('pic/avatars/avatar-default.png');if(m.teamRole==='leader'||m.isLeader||m.role==='@explorer')return leaderAvatar(m);var idx=pad2(workerIdx(m));if(m.role==='@designer')return asset('pic/avatars/avatar-reviewer-'+idx+'.png');return asset('pic/avatars/avatar-implementer-'+idx+'.png');}
  function statusClass(s){return ['busy','idle','offline'].indexOf(s)>=0?s:'idle';}
  function workerOuterClass(s){return s==='busy'?'worker-busy':(s==='offline'?'worker-offline':'worker-online');}
  function statusLabel(s){return ({busy:'忙碌',idle:'在线',online:'在线',offline:'离线'}[s]||'在线');}
  function roleLabel(m){return m&&m.role==='@designer'?'交付审查岗':'实现验证岗';}
  function busyMinutes(name){var s=String(name||''),n=0;for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%59;return 10+(n%49);}
  function cleanTask(raw,m){var t=String(raw||'').trim();t=t.replace(/实现验证岗|交付审查岗|协同规划岗|组长/g,'').replace(/忙碌\s*忙碌/g,'忙碌').replace(/忙碌\s*\d+\s*m(in)?/ig,'').replace(/在线|离线|执行中|审查中|需关注|需组长关注/g,'').replace(/[·｜|]+/g,' ').replace(/\s+/g,' ').replace(/^[-—:：\s]+|[-—:：\s]+$/g,'');if(!t)t=m&&m.role==='@designer'?'交付审查':'任务执行';return t;}
  function modeText(m){var s=statusClass(m.status),task=cleanTask(m.currentTaskSummary,m);if(s==='busy')return task+' · '+busyMinutes(m.name||m.id)+'m';if(s==='offline')return '等待恢复';return task;}
  function stageLabel(s){return ({build:'开发',design:'设计',test:'测试',acceptance:'验收'}[s]||s||'开发');}
  function members(t){return (t.members||[]).filter(function(m){return m.role==='@fixer'||m.role==='@designer';});}
  function pendingDecisions(t){try{return (st().decisions||[]).filter(function(d){return d.status==='pending'&&(!d.teamId||d.teamId===t.id);}).length||Number(t.pendingDecisions||0);}catch(e){return Number(t.pendingDecisions||0);}}
  function pendingReviews(t){try{var wo=(t.currentProject&&t.currentProject.workOrders)||[];var n=wo.filter(function(x){return ['submitted','reviewing'].indexOf(x.status)>=0;}).length;return n||Number(t.pendingReviews||0);}catch(e){return Number(t.pendingReviews||0);}}
  function leaderLine(t){var dec=pendingDecisions(t),rev=pendingReviews(t);return (dec||rev)?('待决策 '+dec+' · 待审查 '+rev):'任务拆解 · 进度跟踪';}
  function healthStatus(t){return t.masterStatus==='offline'?'offline':(t.healthy?'online-healthy':'online-warning');}
  function renderWorker(t,m){var s=statusClass(m.status),task=modeText(m),role=roleLabel(m),name=m.name||m.id||'成员';return '<div class="topo-worker topo-node '+workerOuterClass(s)+'" data-action="open-worker" data-worker-name="'+esc(name)+'" data-master="'+esc(t.name||'')+'" title="'+esc(name+' · '+role+' · '+statusLabel(s)+' · '+task)+'"><span class="persona-avatar worker"><img class="persona-avatar-img" src="'+esc(workerAvatar(m))+'" alt="" loading="lazy"><span class="persona-status-dot '+esc(s)+'"></span></span><span class="topo-worker-text"><span class="topo-worker-name">'+esc(name)+'</span><span class="topo-worker-role">'+esc(role)+'</span><span class="topo-worker-cues"><span class="topo-worker-state">'+esc(statusLabel(s))+'</span><span class="topo-worker-mode">'+esc(task)+'</span></span></span></div>';}
  function doRender(){var host=document.getElementById('topologyHtml');if(!host)return;host.innerHTML=teams().map(function(t){var p=t.currentProject||{},m=members(t),impl=m.filter(function(x){return x.role==='@fixer';}).length,review=m.filter(function(x){return x.role==='@designer';}).length,dec=pendingDecisions(t),rev=pendingReviews(t);return '<div class="topo-team-card" data-team-id="'+esc(t.id)+'"><div class="topo-team-header"><div class="topo-team-titlewrap"><span class="topo-team-name">'+esc(t.name||'团队')+'</span><div class="topo-team-projectline"><span class="topo-team-project" title="'+esc(p.name||'')+'">'+esc(p.name||'未绑定项目')+'</span><span class="stage-badge stage-'+esc(p.stage||'build')+'">'+esc(stageLabel(p.stage||'build'))+'</span></div></div><span class="topo-team-enter" onclick="openTeamTab(\''+esc(t.id)+'\')">→ 详情</span></div><div class="topo-master topo-node '+esc(healthStatus(t))+'" data-action="open-team" data-team-id="'+esc(t.id)+'" title="'+esc((t.masterCodename||'组长')+' · 协同规划岗 · '+leaderLine(t))+'"><span class="persona-avatar"><img class="persona-avatar-img" src="'+esc(leaderAvatar(t))+'" alt="" loading="lazy"><span class="persona-status-dot idle"></span></span><span class="persona-main topo-leader-stack"><span class="topo-master-name">'+esc(t.masterCodename||'组长')+'</span><span class="persona-role-tag">协同规划岗 · 组长</span><span class="topo-leader-cues"><span class="topo-leader-line '+(rev+dec>0?'warning':'')+'">'+esc(leaderLine(t))+'</span></span></span><button class="topo-node-action" title="与 '+esc(t.masterCodename||'组长')+' 协作" onclick="event.stopPropagation(); openChatWith(\''+esc(t.masterId||t.id)+'\')"><span>💬</span><span>协作</span></button></div><div class="topo-card-meta"><span class="role-pill leader">组长 1</span><span class="role-pill impl">实现验证 '+impl+'</span><span class="role-pill review">交付审查 '+review+'</span></div><div class="topo-focus-bar"><span><b>当前阶段</b>'+esc(stageLabel(p.stage||'build'))+'</span><span><b>当前任务</b>'+esc(p.name||t.task||'当前任务')+'</span><span><b>待处理重点</b>'+(dec>0?('待决策 '+dec):(rev>0?('待审查 '+rev):'当前无待处理'))+'</span></div><div class="topo-workers">'+m.map(function(x){return renderWorker(t,x);}).join('')+'</div></div>';}).join('');try{if(window.__v063340ApplyFixedSummary)window.__v063340ApplyFixedSummary();}catch(e){}try{if(window.__fixAvatarLinksV41)window.__fixAvatarLinksV41();}catch(e){}}
  function run(){window.getLeaderAvatarSrc=leaderAvatar;window.getWorkerAvatarSrc=workerAvatar;window.renderTopology=doRender;document.title='智能软件工厂 v0.6.33.45 · AI 原生岗位协作原型';document.querySelectorAll('.app-header-badge').forEach(function(el){el.textContent='v0.6.33.45 · Mock 演示';});doRender();}
  window.__v063343AbsoluteFinalRun=run;
  [0,100,500,1200,2600,5000,9000].forEach(function(ms){setTimeout(run,ms);});
  var oldSwitch=window.switchNav;if(typeof oldSwitch==='function'&&!oldSwitch.__v063343NoBusyWrapped){var wrapped=function(){var ret=oldSwitch.apply(this,arguments);if(arguments[0]==='overview')[60,240,700,1300,2500,4500].forEach(function(ms){setTimeout(run,ms);});return ret;};wrapped.__v063343NoBusyWrapped=true;window.switchNav=wrapped;}
})();
