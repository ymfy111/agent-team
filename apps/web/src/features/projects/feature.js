import { createProjectsPageModule, mountProjectsPage } from './page.js'

export const projectsFeature = Object.freeze({
  id: 'projects',
  label: '项目',
  title: '项目运行态',
  groupId: 'runtime',
  groupLabel: '运行态',
  order: 30,
  pageElementId: 'page-projects',
  legacy: false,
  mount: mountProjectsPage,
  createPageModule: createProjectsPageModule,
})

export default projectsFeature
