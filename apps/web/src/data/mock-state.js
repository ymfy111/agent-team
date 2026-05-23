/*
 * P0b.1 mock state provider.
 *
 * The legacy prototype no longer owns the initial mock data object.
 * This file is a classic browser script on purpose, loaded before
 * src/legacy/prototype-runtime.js, so the old runtime can consume it
 * without introducing TypeScript/Vite/pnpm or changing UI behavior.
 */
(function () {
  if (window.__agentTeamDataProvider) return

  function clone(value) {
    return JSON.parse(JSON.stringify(value))
  }

  function createBaseState(context) {
    var tsNow = context && context.tsNow ? context.tsNow : Date.now()
    var baseState = {
      teams: [
        { id: 't1', name: '研发一组', masterStatus: 'online', healthy: true, masterId: 'AGT-001', masterCodename: '管理1', task: '前端界面重构', pendingDecisions: 1, uptime: '2h 15m', sessionId: 'sess-alpha-001', endpoint: 'localhost:8081',
          lastActivity: tsNow - 60000,
          members: [
            {id:'AGT-002', name:'测试1-1', role:'@explorer', projectRole:'测试工程师', status:'busy', currentTaskSummary: '分析依赖树', heartbeatTs: tsNow - 2000},
            {id:'AGT-003', name:'开发1-1', role:'@fixer', projectRole:'定制开发', status:'offline', currentTaskSummary: '离线效果预览', heartbeatTs: tsNow - 1000},
            {id:'AGT-026', name:'设计1-1', role:'@designer', projectRole:'设计师', status:'busy', currentTaskSummary: '生成组件视觉规范', heartbeatTs: tsNow - 3000},
            {id:'AGT-027', name:'架构1-1', role:'@oracle', projectRole:'架构师', status:'idle', currentTaskSummary: '', heartbeatTs: tsNow - 4000},
            {id:'AGT-028', name:'测试1-2', role:'@explorer', projectRole:'测试工程师', status:'busy', currentTaskSummary: '排查路由跳转死锁', heartbeatTs: tsNow - 6000}
          ],
          activities: [
            {time: tsNow - 60000, desc: '测试1-1 上报：NLU SDK v3.2 在多轮追问场景下返回空 intent，等待架构确认降级策略'},
            {time: tsNow - 240000, desc: '开发1-1 修复坐席工作台消息重放导致的会话状态覆盖问题，已触发对话回归'},
            {time: tsNow - 480000, desc: '架构1-1 更新 ADR-009：RAG 检索结果缓存改走 Redis Streams，避免灰度期间重复召回'},
            {time: tsNow - 720000, desc: '设计1-1 补齐转人工弹窗的异常态标注，覆盖 NLU 置信度低于 0.62 的场景'}
          ],
          currentProject: {
            id:'p1', name:'智能客服平台', stage:'build', health:'healthy',
            startedAt: tsNow - 30 * 86400000,
            codeRepo: { url:'gitlab.corp/cs-platform', branch:'master', commits:142, lastCommitTs: tsNow - 3600000, provider:'gitlab' },
            modelRepo: { url:'lcdp.corp/customer-service-flow', version:'v2.3', lastUpdateTs: tsNow - 7200000 },
            docs: [
              { id:'doc-p1-1', category:'specs', title:'智能客服平台需求规格 v1.2', status:'approved', authorId:'AGT-002', reviewerIds:['AGT-027'], updatedTs: tsNow - 86400000, version:'1.2' },
              { id:'doc-p1-2', category:'specs', title:'对话引擎技术方案', status:'in_execution', authorId:'AGT-027', reviewerIds:['AGT-027'], updatedTs: tsNow - 43200000, version:'2.0' },
              { id:'doc-p1-3', category:'specs', title:'多轮对话上下文管理设计', status:'in_review', authorId:'AGT-028', reviewerIds:['AGT-027','AGT-002'], updatedTs: tsNow - 21600000, version:'0.3' },
              { id:'doc-p1-4', category:'specs', title:'坐席工作台 UI 规格', status:'approved', authorId:'AGT-026', reviewerIds:['AGT-026'], updatedTs: tsNow - 172800000, version:'1.0' },
              { id:'doc-p1-5', category:'specs', title:'NLU 意图识别能力清单', status:'draft', authorId:'AGT-002', reviewerIds:[], updatedTs: tsNow - 5400000, version:'0.1' },
              { id:'doc-p1-6', category:'plans', title:'M2 迭代实施计划（4 周）', status:'in_execution', authorId:'AGT-001', reviewerIds:['AGT-027'], updatedTs: tsNow - 7 * 86400000, version:'1.1' },
              { id:'doc-p1-7', category:'plans', title:'灰度发布计划（5% → 100%）', status:'approved', authorId:'AGT-001', reviewerIds:['AGT-027'], updatedTs: tsNow - 2 * 86400000, version:'1.0' },
              { id:'doc-p1-8', category:'decisions', title:'ADR-007：选用 RAG 而非 fine-tune', status:'approved', authorId:'AGT-027', reviewerIds:['AGT-001'], updatedTs: tsNow - 14 * 86400000, version:'final' },
              { id:'doc-p1-9', category:'decisions', title:'ADR-009：会话存储改用 Redis Streams', status:'in_review', authorId:'AGT-027', reviewerIds:['AGT-001','AGT-003'], updatedTs: tsNow - 18000000, version:'0.2' },
              { id:'doc-p1-10', category:'reports', title:'M1 验收报告', status:'done', authorId:'AGT-026', reviewerIds:['AGT-001'], updatedTs: tsNow - 10 * 86400000, version:'final' },
              { id:'doc-p1-11', category:'notes', title:'NLU SDK 兼容性踩坑记录', status:'draft', authorId:'AGT-028', reviewerIds:[], updatedTs: tsNow - 9000000, version:'-' }
            ],
            blockers: [
              { id:'blk-p1-1', desc:'对话引擎依赖的 NLU SDK 版本未定，等待架构评审', since: tsNow - 7200000, severity:'high' }
            ]
          }
        },
        { id: 't2', name: '研发二组', masterStatus: 'online', healthy: true, masterId: 'AGT-004', masterCodename: '管理2', task: '数据库索引优化', pendingDecisions: 1, uptime: '5h 10m', sessionId: 'sess-beta-002', endpoint: 'localhost:8082',
          lastActivity: tsNow - 180000,
          members: [
            {id:'AGT-005', name:'架构2-1', role:'@oracle', projectRole:'架构师', status:'busy', currentTaskSummary: '对比方案A与B', heartbeatTs: tsNow - 5000},
            {id:'AGT-029', name:'建模2-1', role:'@fixer', projectRole:'建模师', status:'busy', currentTaskSummary: '应用索引重建脚本', heartbeatTs: tsNow - 1500},
            {id:'AGT-030', name:'测试2-1', role:'@explorer', projectRole:'测试工程师', status:'idle', currentTaskSummary: '', heartbeatTs: tsNow - 9000},
            {id:'AGT-031', name:'设计2-1', role:'@designer', projectRole:'设计师', status:'busy', currentTaskSummary: '绘制慢查询热力图', heartbeatTs: tsNow - 2500}
          ],
          activities: [
            {time: tsNow - 180000, desc: '架构2-1 请求人工裁决：Atlas 与 DataHub 接入成本仍无法量化，需确认 POC 范围'},
            {time: tsNow - 540000, desc: '建模2-1 调整 Neo4j 血缘边索引，解决三跳查询超过 2s 的慢查询'},
            {time: tsNow - 900000, desc: '测试2-1 发现元数据采集器对 Hive 分区表漏采 owner 字段，已补充复现样本'},
            {time: tsNow - 1260000, desc: '设计2-1 输出数据质量规则热力图草稿，标注异常规则命中率和责任域'}
          ],
          currentProject: {
            id:'p2', name:'数据治理中台', stage:'design', health:'warning',
            startedAt: tsNow - 12 * 86400000,
            codeRepo: { url:'gitlab.corp/data-gov', branch:'develop', commits:23, lastCommitTs: tsNow - 18000000, provider:'gitlab' },
            modelRepo: null,
            docs: [
              { id:'doc-p2-1', category:'specs', title:'数据治理中台总体需求', status:'in_review', authorId:'AGT-030', reviewerIds:['AGT-005','AGT-004'], updatedTs: tsNow - 86400000, version:'0.4' },
              { id:'doc-p2-2', category:'specs', title:'元数据采集器规格', status:'approved', authorId:'AGT-030', reviewerIds:['AGT-005'], updatedTs: tsNow - 3 * 86400000, version:'1.0' },
              { id:'doc-p2-3', category:'specs', title:'数据血缘可视化 UI 设计', status:'draft', authorId:'AGT-031', reviewerIds:[], updatedTs: tsNow - 10800000, version:'0.1' },
              { id:'doc-p2-4', category:'specs', title:'数据质量规则引擎方案', status:'in_review', authorId:'AGT-005', reviewerIds:['AGT-004'], updatedTs: tsNow - 36000000, version:'0.5' },
              { id:'doc-p2-5', category:'decisions', title:'ADR-002：选型 Apache Atlas vs DataHub', status:'in_review', authorId:'AGT-005', reviewerIds:['AGT-004','AGT-006'], updatedTs: tsNow - 7200000, version:'0.3' },
              { id:'doc-p2-6', category:'decisions', title:'ADR-003：血缘存储采用 Neo4j', status:'approved', authorId:'AGT-005', reviewerIds:['AGT-004'], updatedTs: tsNow - 5 * 86400000, version:'final' },
              { id:'doc-p2-7', category:'plans', title:'POC 阶段 2 周计划', status:'in_execution', authorId:'AGT-004', reviewerIds:['AGT-005'], updatedTs: tsNow - 4 * 86400000, version:'1.0' },
              { id:'doc-p2-8', category:'notes', title:'与数据中台团队对齐纪要', status:'draft', authorId:'AGT-006', reviewerIds:[], updatedTs: tsNow - 28800000, version:'-' }
            ],
            blockers: [
              { id:'blk-p2-1', desc:'选型 ADR 评审延期：Atlas 与 DataHub 对接成本难以量化', since: tsNow - 86400000, severity:'medium' }
            ]
          }
        },
        { id: 't3', name: '研发三组', masterStatus: 'online', healthy: true, masterId: 'AGT-011', masterCodename: '管理3', task: 'API 网关治理', pendingDecisions: 1, uptime: '1h 30m', sessionId: 'sess-gamma-003', endpoint: 'localhost:8083',
          lastActivity: tsNow - 90000,
          members: [
            {id:'AGT-012', name:'测试3-1', role:'@explorer', projectRole:'测试工程师', status:'busy', currentTaskSummary: '扫描未文档化端点', heartbeatTs: tsNow - 1200},
            {id:'AGT-013', name:'开发3-1', role:'@fixer', projectRole:'定制开发', status:'busy', currentTaskSummary: '补齐 OpenAPI schema', heartbeatTs: tsNow - 800},
            {id:'AGT-014', name:'架构3-1', role:'@oracle', projectRole:'架构师', status:'idle', currentTaskSummary: '', heartbeatTs: tsNow - 4500},
            {id:'AGT-032', name:'设计3-1', role:'@designer', projectRole:'设计师', status:'busy', currentTaskSummary: '修订 API 文档站样式', heartbeatTs: tsNow - 2000}
          ],
          activities: [
            {time: tsNow - 90000, desc: '测试3-1 扫描出 12 个未文档化端点，其中 4 个 /internal/* 需确认是否纳入网关监控'},
            {time: tsNow - 360000, desc: '开发3-1 修复 OpenAPI schema 中 4 个 nullable 字段不一致，冒烟回归已排队'},
            {time: tsNow - 660000, desc: '架构3-1 复核 Envoy 限流配置，发现灰度路由在 header 缺失时会落到默认集群'},
            {time: tsNow - 960000, desc: '设计3-1 修订 API 文档站错误码展示，补充熔断与重试策略说明'}
          ],
          currentProject: {
            id:'p3', name:'API 网关重构', stage:'test', health:'healthy',
            startedAt: tsNow - 60 * 86400000,
            codeRepo: { url:'gitlab.corp/api-gateway-v2', branch:'release/2.0', commits:287, lastCommitTs: tsNow - 1800000, provider:'gitlab' },
            modelRepo: null,
            docs: [
              { id:'doc-p3-1', category:'specs', title:'API 网关 v2 需求规格', status:'approved', authorId:'AGT-012', reviewerIds:['AGT-014'], updatedTs: tsNow - 50 * 86400000, version:'2.0' },
              { id:'doc-p3-2', category:'specs', title:'限流熔断策略设计', status:'approved', authorId:'AGT-014', reviewerIds:['AGT-011'], updatedTs: tsNow - 30 * 86400000, version:'1.3' },
              { id:'doc-p3-3', category:'specs', title:'OpenAPI 文档站规格', status:'in_execution', authorId:'AGT-015', reviewerIds:['AGT-032'], updatedTs: tsNow - 4 * 86400000, version:'1.1' },
              { id:'doc-p3-4', category:'specs', title:'灰度路由规则规格', status:'approved', authorId:'AGT-014', reviewerIds:['AGT-011'], updatedTs: tsNow - 12 * 86400000, version:'1.0' },
              { id:'doc-p3-5', category:'plans', title:'回归测试计划', status:'in_execution', authorId:'AGT-013', reviewerIds:['AGT-011'], updatedTs: tsNow - 2 * 86400000, version:'1.2' },
              { id:'doc-p3-6', category:'plans', title:'切流上线计划（含回滚）', status:'in_review', authorId:'AGT-011', reviewerIds:['AGT-014'], updatedTs: tsNow - 14400000, version:'0.5' },
              { id:'doc-p3-7', category:'decisions', title:'ADR-011：抛弃 OpenResty 改用 Envoy', status:'approved', authorId:'AGT-014', reviewerIds:['AGT-011'], updatedTs: tsNow - 45 * 86400000, version:'final' },
              { id:'doc-p3-8', category:'reports', title:'压测报告 R1 (2k QPS)', status:'done', authorId:'AGT-013', reviewerIds:['AGT-014'], updatedTs: tsNow - 8 * 86400000, version:'final' },
              { id:'doc-p3-9', category:'reports', title:'压测报告 R2 (5k QPS)', status:'done', authorId:'AGT-013', reviewerIds:['AGT-014'], updatedTs: tsNow - 5 * 86400000, version:'final' },
              { id:'doc-p3-10', category:'reports', title:'安全扫描报告', status:'done', authorId:'AGT-012', reviewerIds:['AGT-014'], updatedTs: tsNow - 3 * 86400000, version:'final' },
              { id:'doc-p3-11', category:'reports', title:'冒烟回归报告 R3', status:'in_review', authorId:'AGT-013', reviewerIds:['AGT-011'], updatedTs: tsNow - 7200000, version:'0.1' },
              { id:'doc-p3-12', category:'notes', title:'未文档化端点清单', status:'draft', authorId:'AGT-012', reviewerIds:[], updatedTs: tsNow - 5400000, version:'-' }
            ],
            blockers: []
          }
        },
        { id: 't4', name: '研发四组', masterStatus: 'online', healthy: true, masterId: 'AGT-016', masterCodename: '管理4', task: 'HR代码迁移', pendingDecisions: 1, uptime: '3h 40m', sessionId: 'sess-delta-004', endpoint: 'localhost:8084',
          lastActivity: tsNow - 30000,
          members: [
            {id:'AGT-017', name:'测试4-1', role:'@explorer', projectRole:'测试工程师', status:'busy', currentTaskSummary: '采集压测数据', heartbeatTs: tsNow - 900},
            {id:'AGT-018', name:'建模4-1', role:'@fixer', projectRole:'建模师', status:'idle', currentTaskSummary: '', heartbeatTs: tsNow - 3500},
            {id:'AGT-019', name:'架构4-1', role:'@oracle', projectRole:'架构师', status:'busy', currentTaskSummary: '权衡方案A与B', heartbeatTs: tsNow - 1100},
            {id:'AGT-033', name:'设计4-1', role:'@designer', projectRole:'设计师', status:'idle', currentTaskSummary: '', heartbeatTs: tsNow - 7000}
          ],
          activities: [
            {time: tsNow - 30000, desc: '架构4-1 提交决策请求：事件驱动与同步直连方案性能差异<5%，但维护成本差异明显'},
            {time: tsNow - 420000, desc: '测试4-1 完成 Oracle→PostgreSQL 第三批薪资表数据校验，发现 17 条精度舍入差异'},
            {time: tsNow - 720000, desc: '建模4-1 调整接口兼容层字段映射，兼容旧 HR 客户端的 departmentCode 空值'},
            {time: tsNow - 1020000, desc: '设计4-1 补充迁移回滚确认页，强调不可逆数据清洗操作的二次确认'}
          ],
          currentProject: {
            id:'p4', name:'HR系统代码迁移', stage:'build', health:'healthy',
            startedAt: tsNow - 14 * 86400000,
            codeRepo: { url:'gitlab.corp/hr-migration', branch:'main', commits:89, lastCommitTs: tsNow - 3600000, provider:'gitlab' },
            modelRepo: null,
            docs: [
              { id:'doc-p4-1', category:'specs', title:'HR遗留系统现状分析 v1.0', status:'approved', authorId:'AGT-017', reviewerIds:['AGT-019','AGT-016'], updatedTs: tsNow - 7 * 86400000, version:'1.0' },
              { id:'doc-p4-2', category:'specs', title:'数据库迁移方案（Oracle→PostgreSQL）', status:'in_execution', authorId:'AGT-019', reviewerIds:['AGT-016'], updatedTs: tsNow - 3 * 86400000, version:'1.2' },
              { id:'doc-p4-3', category:'specs', title:'接口兼容层设计', status:'in_review', authorId:'AGT-018', reviewerIds:['AGT-019'], updatedTs: tsNow - 86400000, version:'0.5' },
              { id:'doc-p4-4', category:'plans', title:'分批迁移计划（6周）', status:'in_execution', authorId:'AGT-016', reviewerIds:['AGT-019'], updatedTs: tsNow - 5 * 86400000, version:'1.1' },
              { id:'doc-p4-5', category:'decisions', title:'ADR-001：存量数据清洗策略', status:'approved', authorId:'AGT-019', reviewerIds:['AGT-016'], updatedTs: tsNow - 10 * 86400000, version:'1.0' },
              { id:'doc-p4-6', category:'notes', title:'第三批模块迁移验收记录', status:'draft', authorId:'AGT-020', reviewerIds:[], updatedTs: tsNow - 86400000, version:'-' }
            ],
            blockers: []
          }
        },

        { id: 't5', name: '研发五组', masterStatus: 'online', healthy: true, masterId: 'AGT-021', masterCodename: '管理5', task: '权限与配置巡检', pendingDecisions: 1, uptime: '6h 05m', sessionId: 'sess-epsilon-005', endpoint: 'localhost:8085',
          lastActivity: tsNow - 200000,
          members: [
            {id:'AGT-022', name:'测试5-1', role:'@explorer', projectRole:'测试工程师', status:'busy', currentTaskSummary: '权限路径全量扫描', heartbeatTs: tsNow - 700},
            {id:'AGT-023', name:'开发5-1', role:'@fixer', projectRole:'定制开发', status:'busy', currentTaskSummary: '修复配置漂移', heartbeatTs: tsNow - 1300},
            {id:'AGT-024', name:'架构5-1', role:'@oracle', projectRole:'架构师', status:'idle', currentTaskSummary: '', heartbeatTs: tsNow - 5500},
            {id:'AGT-034', name:'设计5-1', role:'@designer', projectRole:'设计师', status:'idle', currentTaskSummary: '', heartbeatTs: tsNow - 9500}
          ],
          activities: [
            {time: tsNow - 200000, desc: '测试5-1 上报：platform-infra 仓库 read 权限不足，无法核对生产灰度切流脚本'},
            {time: tsNow - 520000, desc: '开发5-1 修复 OPA 策略热更新后本地缓存未失效的问题，已补充回归用例'},
            {time: tsNow - 820000, desc: '架构5-1 复核审计日志 ClickHouse 分区策略，建议按 tenantId + eventDate 双键写入'},
            {time: tsNow - 1100000, desc: '测试5-1 完成首批客户接入回归，发现 2 个 ABAC 条件在跨租户场景下误拒绝'}
          ],
          currentProject: {
            id:'p5', name:'权限中心 v2', stage:'release', health:'healthy',
            startedAt: tsNow - 90 * 86400000,
            codeRepo: { url:'gitlab.corp/iam-center', branch:'release/2.1', commits:421, lastCommitTs: tsNow - 5400000, provider:'gitlab' },
            modelRepo: null,
            docs: [
              { id:'doc-p5-1', category:'specs', title:'权限中心 v2 总体需求', status:'approved', authorId:'AGT-022', reviewerIds:['AGT-024'], updatedTs: tsNow - 80 * 86400000, version:'2.0' },
              { id:'doc-p5-2', category:'specs', title:'RBAC + ABAC 混合模型设计', status:'approved', authorId:'AGT-024', reviewerIds:['AGT-021'], updatedTs: tsNow - 60 * 86400000, version:'1.4' },
              { id:'doc-p5-3', category:'specs', title:'对外 OpenAPI 规格 v2', status:'approved', authorId:'AGT-025', reviewerIds:['AGT-024'], updatedTs: tsNow - 20 * 86400000, version:'2.0' },
              { id:'doc-p5-4', category:'plans', title:'生产灰度切流计划', status:'in_execution', authorId:'AGT-021', reviewerIds:['AGT-024'], updatedTs: tsNow - 86400000, version:'1.1' },
              { id:'doc-p5-5', category:'plans', title:'回滚预案（演练版）', status:'approved', authorId:'AGT-021', reviewerIds:['AGT-024'], updatedTs: tsNow - 4 * 86400000, version:'1.0' },
              { id:'doc-p5-6', category:'decisions', title:'ADR-014：策略评估走 OPA', status:'approved', authorId:'AGT-024', reviewerIds:['AGT-021'], updatedTs: tsNow - 70 * 86400000, version:'final' },
              { id:'doc-p5-7', category:'decisions', title:'ADR-018：审计日志写入 ClickHouse', status:'approved', authorId:'AGT-024', reviewerIds:['AGT-021'], updatedTs: tsNow - 40 * 86400000, version:'final' },
              { id:'doc-p5-8', category:'reports', title:'安全合规自查报告', status:'done', authorId:'AGT-025', reviewerIds:['AGT-021'], updatedTs: tsNow - 10 * 86400000, version:'final' },
              { id:'doc-p5-9', category:'reports', title:'生产灰度首日观察报告', status:'done', authorId:'AGT-022', reviewerIds:['AGT-021'], updatedTs: tsNow - 86400000, version:'final' },
              { id:'doc-p5-10', category:'reports', title:'首批客户接入回归报告', status:'in_review', authorId:'AGT-023', reviewerIds:['AGT-021'], updatedTs: tsNow - 18000000, version:'0.2' }
            ],
            blockers: []
          }
        }
      ],
      workers: [
        { id:'AGT-007', name:'开发', role:'@fixer', projectRole:'', status:'unclaimed', session:'sess-901', heartbeatTs: tsNow - 2000, currentTaskSummary: '' },
        { id:'AGT-008', name:'测试', role:'@explorer', projectRole:'', status:'unclaimed', session:'sess-902', heartbeatTs: tsNow - 5000, currentTaskSummary: '' },
        { id:'AGT-009', name:'架构', role:'@oracle', projectRole:'', status:'unclaimed', session:'sess-903', heartbeatTs: tsNow - 1000, currentTaskSummary: '' },
        { id:'AGT-035', name:'设计', role:'@designer', projectRole:'', status:'unclaimed', session:'sess-905', heartbeatTs: tsNow - 3000, currentTaskSummary: '' }
      ],
      decisions: [
        { id: 'd1', teamId: 't1', requesterId: 'AGT-002', type: '需求歧义', title: '依赖树发现循环引用，需确认处理策略', urgent: true, timeTs: tsNow - 60000, expiresAt: tsNow + 300000, status: 'pending',
          context: `在解析模块依赖树时，检测到 user-service 与 auth-service 互相引用。\n\n是否对该循环依赖进行自动拆解？拆解策略涉及接口下沉，影响范围 5 个模块。`,
          options: [
            { label: '自动拆解并下沉公共接口', kind: 'primary' },
            { label: '保留现状并加注释告警', kind: 'normal' },
            { label: '终止任务并升级到人工架构评审', kind: 'danger' }
          ]
        },
        { id: 'd2', teamId: 't2', requesterId: 'AGT-005', type: '偏好选择', title: '方案A与B评分接近，需人工裁决', urgent: false, timeTs: tsNow - 180000, expiresAt: tsNow + 86400000, status: 'pending',
          context: `两个索引方案在 oracle 评分中差距 < 3%。\n\n方案A：复合索引覆盖率高，写入开销 +8%。\n方案B：拆分索引，读放大 +5%。`,
          options: [
            { label: '采用方案A（复合索引）', kind: 'primary' },
            { label: '采用方案B（拆分索引）', kind: 'normal' }
          ]
        },
        { id: 'd3', teamId: 't3', requesterId: 'AGT-012', type: '需求歧义', title: '发现未文档化的 API 端点，是否纳入监控', urgent: false, timeTs: tsNow - 90000, expiresAt: tsNow + 7200000, status: 'pending',
          context: `共扫描出 12 个未在 OpenAPI 中声明的端点，其中 4 个位于 /internal/* 路径。\n\n是否将其全量纳入运行时监控并补充文档？`,
          options: [
            { label: '全量纳入并自动补文档', kind: 'primary' },
            { label: '仅纳入监控不动文档', kind: 'normal' },
            { label: '忽略，由 owner 后续决定', kind: 'normal' }
          ]
        },
        { id: 'd4', teamId: 't4', requesterId: 'AGT-019', type: '偏好选择', title: '两架构方案性能差异<5%但维护成本差异大', urgent: false, timeTs: tsNow - 30000, expiresAt: tsNow + 86400000, status: 'pending',
          context: `方案A（事件驱动）：吞吐 +4%，但需引入 Kafka 与 schema registry。\n方案B（同步直连）：吞吐略低，维护栈不变。`,
          options: [
            { label: '采用方案A（性能优先）', kind: 'primary' },
            { label: '采用方案B（维护优先）', kind: 'normal' }
          ]
        },
        { id: 'd5', teamId: 't5', requesterId: 'AGT-022', type: '不可逆操作', title: '目标仓库访问权限不足，需人工授权', urgent: true, timeTs: tsNow - 200000, expiresAt: tsNow + 600000, status: 'pending',
          context: `研发五组在巡检过程中需要读取 platform-infra 仓库的 deploy 配置，但当前 token 无 read 权限。\n\n是否临时授予只读权限以完成本轮巡检？`,
          options: [
            { label: '授予只读权限（4 小时有效）', kind: 'primary' },
            { label: '拒绝并跳过该仓库', kind: 'normal' }
          ]
        },
        { id: 'd6', teamId: 'unassigned', requesterId: 'AGT-007', type: '不可逆操作', title: '检测到生产环境配置漂移，需确认是否回滚', urgent: true, timeTs: tsNow - 420000, expiresAt: tsNow + 1800000, status: 'pending',
          context: `未认领 worker 开发-1 在闲时巡检中发现 prod-cluster-01 的 8 项配置与基线漂移。\n\n是否一键回滚到上一已知良好版本？回滚将引发 30s 级别的服务抖动。`,
          options: [
            { label: '立即回滚到基线版本', kind: 'danger' },
            { label: '保留漂移并冻结变更', kind: 'normal' },
            { label: '升级到 SRE 人工处置', kind: 'primary' }
          ]
        }
      ]
    }
    return baseState
  }

  window.__agentTeamDataProvider = Object.freeze({
    version: 'p0b.1',
    kind: 'classic-script-data-provider',
    createBaseState: createBaseState,
    cloneState: clone,
    listEntityCounts: function (state) {
      state = state || createBaseState({ tsNow: Date.now() })
      return {
        teams: (state.teams || []).length,
        workers: (state.workers || []).length,
        decisions: (state.decisions || []).length,
        teamMembers: (state.teams || []).reduce(function (sum, team) { return sum + ((team.members || []).length) }, 0)
      }
    }
  })
})()
