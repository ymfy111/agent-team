import { createSettingsPageModule, mountSettingsPage } from './page.js'

export const settingsFeature = Object.freeze({
  id: 'settings',
  label: '设置',
  title: '只读运行信息',
  groupId: 'config',
  groupLabel: '工厂配置',
  order: 140,
  pageElementId: 'page-settings',
  legacy: false,
  mount: mountSettingsPage,
  createPageModule: createSettingsPageModule,
})

export default settingsFeature
