import { createRuntimeGatewayPageModule, mountRuntimeGatewayPage } from './page.js'

export const runtimeGatewayFeature = Object.freeze({
  id: 'runtime-gateway',
  label: '运行网关',
  title: '运行网关监控',
  groupId: 'runtime',
  groupLabel: '运行态',
  order: 45,
  pageElementId: 'page-runtime-gateway',
  legacy: false,
  mount: mountRuntimeGatewayPage,
  createPageModule: createRuntimeGatewayPageModule,
})

export default runtimeGatewayFeature
