import { createOverviewPageModule, mountOverviewPage } from './page.js'

export const overviewFeature = Object.freeze({
  id: 'overview',
  label: '总览',
  title: '总览',
  groupId: 'runtime',
  groupLabel: '运行态',
  order: 10,
  pageElementId: 'page-overview',
  legacy: false,
  mount: mountOverviewPage,
  createPageModule: createOverviewPageModule,
})

export default overviewFeature
