import { createRolesPageModule, mountRolesPage } from './page.js'

export const rolesFeature = Object.freeze({
  id: 'roles',
  label: '岗位',
  title: '数字员工模板（岗位）',
  groupId: 'config',
  groupLabel: '工厂配置',
  order: 110,
  pageElementId: 'page-roles',
  legacy: false,
  mount: mountRolesPage,
  createPageModule: createRolesPageModule,
})

export default rolesFeature
