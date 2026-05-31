import { createDecisionsPageModule, mountDecisionsPage } from './page.js'

export const decisionsFeature = Object.freeze({
  id: 'decisions',
  label: '待决策',
  title: '待决策',
  groupId: 'runtime',
  groupLabel: '运行态',
  order: 40,
  pageElementId: 'page-decisions',
  legacy: false,
  mount: mountDecisionsPage,
  createPageModule: createDecisionsPageModule,
})

export default decisionsFeature
