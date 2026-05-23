const TOP_BANNER_CONTAINER_ID = 'topBannersContainer'

export function mountTopBannerTemplate() {
  const container = document.getElementById(TOP_BANNER_CONTAINER_ID)
  if (!container) {
    document.documentElement.dataset.topBannerTemplate = 'p0b.4:missing-container'
    return { mounted: false, reason: 'missing-container' }
  }

  let banner = document.getElementById('networkErrorBanner')
  if (!banner) {
    banner = document.createElement('div')
    banner.id = 'networkErrorBanner'
    banner.className = 'top-banner network-error'
    banner.textContent = '网络连接断开，正在尝试重连...'
    container.appendChild(banner)
  }

  document.documentElement.dataset.topBannerTemplate = 'p0b.4'
  return { mounted: true, containerId: TOP_BANNER_CONTAINER_ID, bannerId: banner.id }
}
