const SKILLS_HTML = String.raw`
          <div class="page-title">
            <div class="page-title-text">技能 <span class="page-title-meta">Skill 配置、SKILL.md、岗位技能匹配与发布生效</span></div>
          </div>
          <div class="card" style="margin-bottom:12px; padding:12px 16px; border-color:#e9d5ff; background:linear-gradient(135deg,#faf5ff,#fff);">
            <div style="font-size:13px; color:#334155; line-height:1.6;">
              <strong>Skill 工作台：</strong>左侧保持项目文件树，右侧编辑 SKILL.md；保存草稿不影响运行，发布生效后才更新岗位模板和数字员工实例的生效技能版本。
            </div>
          </div>
          <div class="settings-section">
            <div class="skill-tabs" style="display:flex; gap:8px; margin-bottom:12px;">
              <button class="skill-tab active" data-skill-tab="studio" onclick="switchSkillTab('studio')">Skill 配置</button>
              <button class="skill-tab" data-skill-tab="assets" onclick="switchSkillTab('assets')">技能资产</button>
              <button class="skill-tab" data-skill-tab="mapping" onclick="switchSkillTab('mapping')">岗位技能匹配</button>
            </div>

            <div id="skillStudioPanel">
              <div class="skill-workbench">
                <aside class="skill-file-sidebar">
                  <div class="skill-file-section">
                    <div class="skill-file-title"><span>项目文件</span><span style="font-size:11px;color:#94a3b8;">+ ⟳</span></div>
                    <div class="skill-file-tree">
                      <div class="skill-file-item active">▣ SKILL.md</div>
                      <div class="skill-file-item">▸ scripts</div>
                      <div class="skill-file-item">▸ resources</div>
                    </div>
                  </div>
                  <div class="skill-file-section" style="border-bottom:0; flex:1;">
                    <div class="skill-file-title"><span>能力引用</span><span style="color:#1677ff;">+ 添加</span></div>
                    <div class="skill-reference-empty">暂时没有数据哦~<br>可在后续引用工具、脚本、资源包或其他 Skill。</div>
                  </div>
                </aside>

                <section class="skill-editor-main">
                  <div class="skill-meta-card">
                    <div class="skill-meta-row"><label>* Skill 名称</label><input id="skillStudioName" class="skill-meta-input" value="sct-to-customer-table" oninput="syncSkillStudioYaml()"></div>
                    <div class="skill-meta-row"><label>Skill 描述</label><input id="skillStudioDesc" class="skill-meta-input desc" value="将 SCT/BOM 明细转换为客户化报价配置表。" oninput="syncSkillStudioYaml()"></div>
                  </div>
                  <pre id="skillStudioYaml" class="skill-yaml-preview"></pre>
                  <div class="skill-editor-hint">ℹ️ 使用 <strong>Cmd + Alt + /</strong>、<strong>Ctrl + Alt + /</strong> 可插入命令。保存草稿不影响 Agent，发布后才刷新数字员工模板和数字员工实例的生效技能版本。</div>
                  <div class="skill-md-card">
                    <div class="skill-md-toolbar"><span>SKILL.md</span><span id="skillStudioVersion">draft · v0.1.0</span></div>
                    <div class="skill-md-body">
                      <div id="skillLineNums" class="skill-line-nums">1</div>
                      <textarea id="skillStudioMd" class="skill-md-textarea" spellcheck="false" oninput="syncSkillLineNums()"></textarea>
                    </div>
                  </div>
                  <div class="skill-action-bar">
                    <span class="skill-impact-chip" id="skillStudioImpact">影响 0 个数字员工模板、0 个数字员工实例</span>
                    <div style="display:flex; gap:8px;">
                      <button class="btn btn-secondary" onclick="alert('校验 SKILL.md 结构（占位）')">校验</button>
                      <button class="btn btn-secondary" onclick="alert('已保存草稿（原型占位）')">保存草稿</button>
                      <button class="btn btn-primary" onclick="alert('已发布生效（原型占位）：数字员工模板与数字员工实例将在下一次技能刷新时读取此版本')">发布生效</button>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div id="skillAssetsPanel" style="display:none;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:12px;">
                <input type="text" placeholder="搜索技能名称或描述..." style="padding:6px 12px; border:1px solid #ddd; border-radius:4px; width:260px;" oninput="filterSkills(this.value)">
                <button class="btn-primary" onclick="selectSkill(null); switchSkillTab('studio')">+ 新建技能</button>
              </div>
              <table class="skill-table" id="skillTable"><thead><tr><th>技能名称</th><th>描述</th><th>作用范围</th><th>引用实例</th><th>版本/状态</th><th>操作</th></tr></thead><tbody id="skillTableBody"></tbody></table>
            </div>

            <div id="skillMappingPanel" style="display:none;">
              <div style="margin-bottom:12px; display:flex; align-items:center; gap:8px;"><label style="font-size:13px;">选择数字员工模板：</label>
                <select id="mappingRoleSelect" onchange="renderRoleMapping(this.value)" style="padding:4px 8px;border:1px solid #ddd;border-radius:4px;">
                  <option value="explorer">@explorer · 测试工程师</option><option value="fixer">@fixer · 定制开发/建模</option><option value="oracle">@oracle · 架构师</option><option value="designer">@designer · 设计师</option>
                </select>
                <span style="font-size:12px;color:var(--text-muted);">最终生效技能 = 通用技能 + 岗位匹配技能；数字员工实例自动继承。</span>
              </div>
              <div id="roleMappingList"></div>
              <button class="btn-secondary" onclick="alert('关联已有技能（占位）：后续选择一个技能并写入 TemplateSkillMapping')" style="margin-top:12px;">+ 关联已有技能</button>
            </div>
          </div>
        
`

export function mountSkillsPage() {
  const page = document.getElementById('page-skills')
  if (!page) return false
  if (page.dataset.featureMounted === 'skills') return true
  page.innerHTML = SKILLS_HTML
  page.dataset.featureMounted = 'skills'
  return true
}

export function createSkillsPageModule(feature) {
  return Object.freeze({
    id: feature.id,
    title: feature.title,
    pageElementId: feature.pageElementId,
    version: 'ui-arch-07',
    beforeEnter() {
      document.documentElement.dataset.pageModule = 'ui-arch-07'
      document.documentElement.dataset.enteringPage = feature.id
      mountSkillsPage()
    },
    afterEnter() {
      mountSkillsPage()
      if (typeof window.renderSkillTable === 'function') window.renderSkillTable()
      const select = document.getElementById('mappingRoleSelect')
      if (typeof window.renderRoleMapping === 'function') window.renderRoleMapping(select?.value || 'explorer')
      document.documentElement.dataset.currentPageModule = feature.id
      document.documentElement.dataset.enteringPage = ''
    },
  })
}
