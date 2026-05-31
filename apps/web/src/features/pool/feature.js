import { createPoolPageModule, mountPoolPage } from './page.js'

export const poolFeature = Object.freeze({
  id: 'pool',
  label: '员工',
  title: '数字员工实例',
  groupId: 'config',
  groupLabel: '工厂配置',
  order: 120,
  pageElementId: 'page-pool',
  legacy: false,
  mount: mountPoolPage,
  createPageModule: createPoolPageModule,
})

export default poolFeature
