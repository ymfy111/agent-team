import { createTeamsPageModule, mountTeamsPage } from './page.js'

export const teamsFeature = Object.freeze({
  id: 'teams',
  label: '团队',
  title: '团队运行态',
  groupId: 'runtime',
  groupLabel: '运行态',
  order: 20,
  pageElementId: 'page-teams',
  legacy: false,
  mount: mountTeamsPage,
  createPageModule: createTeamsPageModule,
})

export default teamsFeature
