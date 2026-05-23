/* P0b.4 Menu Config - browser-native ESM */
export const MENU_GROUPS = Object.freeze([
  {
    id: 'runtime',
    label: '运行态',
    items: [
      { id: 'overview', label: '总览', title: '总览' },
      { id: 'teams', label: '团队', title: '团队运行态' },
      { id: 'projects', label: '项目', title: '项目运行态' },
      { id: 'decisions', label: '待决策', title: '待决策' },
    ],
  },
  {
    id: 'config',
    label: '工厂配置',
    items: [
      { id: 'roles', label: '岗位', title: '数字员工模板（岗位）' },
      { id: 'pool', label: '员工', title: '数字员工实例' },
      { id: 'skills', label: '技能', title: '技能资产 / SKILL.md' },
      { id: 'settings', label: '设置', title: '只读运行信息' },
    ],
  },
])

export const MENU_ITEMS = Object.freeze(MENU_GROUPS.flatMap((group) =>
  group.items.map((item) => Object.freeze({ ...item, groupId: group.id }))
))

export function findMenuItem(pageId) {
  return MENU_ITEMS.find((item) => item.id === pageId) || null
}

export function listMenuPageIds() {
  return MENU_ITEMS.map((item) => item.id)
}
