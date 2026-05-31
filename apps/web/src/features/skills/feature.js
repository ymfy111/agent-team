import { createSkillsPageModule, mountSkillsPage } from './page.js'

export const skillsFeature = Object.freeze({
  id: 'skills',
  label: '技能',
  title: '技能资产 / SKILL.md',
  groupId: 'config',
  groupLabel: '工厂配置',
  order: 130,
  pageElementId: 'page-skills',
  legacy: false,
  mount: mountSkillsPage,
  createPageModule: createSkillsPageModule,
})

export default skillsFeature
