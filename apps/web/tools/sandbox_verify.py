from pathlib import Path
from urllib.parse import urlparse, unquote
import mimetypes, json, re, sys, base64
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'qa'
SCREEN = OUT / 'screenshots'
SCREEN.mkdir(parents=True, exist_ok=True)
VIRTUAL_ORIGIN = 'https://agent-team.local/'

def mime_for(path: Path):
    if path.suffix == '.js': return 'text/javascript'
    if path.suffix == '.css': return 'text/css'
    if path.suffix == '.svg': return 'image/svg+xml'
    if path.suffix == '.png': return 'image/png'
    if path.suffix == '.html': return 'text/html'
    return mimetypes.guess_type(str(path))[0] or 'application/octet-stream'

def resolve_virtual(url: str) -> Path:
    parsed = urlparse(url)
    rel = unquote(parsed.path.lstrip('/'))
    # Compatibility for old prototype references kept during P0 migration.
    # Some late-rendered detail views still point to docs/prototypes/pic/...
    # while the current P0a/P0b static baseline keeps pic/ next to index.html.
    if rel.startswith('docs/prototypes/pic/'):
        rel = rel.replace('docs/prototypes/pic/', 'pic/', 1)
    if not rel:
        rel = 'index.html'
    p = (ROOT / rel).resolve()
    if not str(p).startswith(str(ROOT.resolve())):
        raise RuntimeError('blocked path traversal')
    return p

def run():
    index = (ROOT / 'index.html').read_text(encoding='utf-8')
    # Inject a virtual origin before relative resources are parsed.
    index = index.replace('<head>', f'<head>\n  <base href="{VIRTUAL_ORIGIN}">', 1)
    console=[]
    page_errors=[]
    http_errors=[]
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=[
            '--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-gpu-sandbox','--no-zygote','--single-process',
            '--disable-features=VizDisplayCompositor,Crashpad','--disable-crash-reporter','--disable-crashpad'
        ])
        context = browser.new_context(viewport={'width':1440,'height':980}, device_scale_factor=1)
        page = context.new_page()
        page.on('console', lambda msg: console.append({'type': msg.type, 'text': msg.text[:500]}))
        page.on('pageerror', lambda exc: page_errors.append(str(exc)[:1000]))
        page.on('response', lambda response: http_errors.append({'status': response.status, 'url': response.url}) if response.status >= 400 else None)
        def handler(route):
            url = route.request.url
            try:
                path = resolve_virtual(url)
                if path.exists() and path.is_file():
                    body = path.read_bytes()
                    route.fulfill(status=200, body=body, headers={'content-type': mime_for(path)})
                else:
                    route.fulfill(status=404, body=f'Not found: {path}'.encode(), headers={'content-type':'text/plain'})
            except Exception as e:
                route.fulfill(status=500, body=str(e).encode(), headers={'content-type':'text/plain'})
        page.route(VIRTUAL_ORIGIN + '**', handler)
        page.set_content(index, wait_until='domcontentloaded')
        # Wait for original render functions to complete.
        page.wait_for_timeout(1500)
        try:
            page.evaluate("""() => Promise.race([
              window.__AGENT_TEAM_FACTORY_API_READY__ || Promise.resolve({ status: 'missing' }),
              new Promise((resolve) => setTimeout(() => resolve({ status: 'timeout' }), 1500)),
            ])""")
            page.wait_for_timeout(300)
        except Exception as e:
            console.append({'type':'factory-api-ready-error','text':str(e)[:500]})
        # invoke overview explicitly, mirroring prior QA pattern
        try:
            page.evaluate("() => { if (typeof window.switchNav === 'function') window.switchNav('overview'); }")
            page.wait_for_timeout(800)
        except Exception as e:
            console.append({'type':'eval-error','text':str(e)[:500]})
        page.screenshot(path=str(SCREEN/'01-overview.png'), full_page=True)
        metrics = page.evaluate("""() => {
          const imgs = Array.from(document.images);
          return {
            appShell: document.documentElement.dataset.appShell || null,
            routerDataset: document.documentElement.dataset.router || null,
            currentPageDataset: document.documentElement.dataset.currentPage || null,
            appEnv: window.__AGENT_TEAM_APP__ || null,
            appShellState: window.__AGENT_TEAM_APP_SHELL__ || null,
            routerStatus: window.__AGENT_TEAM_ROUTER__ && window.__AGENT_TEAM_ROUTER__.createRouterStatus ? window.__AGENT_TEAM_ROUTER__.createRouterStatus() : null,
            prototypeStore: window.__agentTeamPrototypeStore ? { version: window.__agentTeamPrototypeStore.version, kind: window.__agentTeamPrototypeStore.kind, hasState: !!window.__agentTeamPrototypeStore.getState() } : null,
            factoryApi: window.__AGENT_TEAM_APP__ && window.__AGENT_TEAM_APP__.factoryApi || null,
            title: document.title,
            topology: !!document.querySelector('#topologyHtml'),
            teamCards: document.querySelectorAll('#topologyHtml .topo-team-card').length,
            masters: document.querySelectorAll('#topologyHtml .topo-master').length,
            workers: document.querySelectorAll('#topologyHtml .topo-worker').length,
            pages: Array.from(document.querySelectorAll('.page')).map(p => p.id).filter(Boolean).slice(0,20),
            brokenImages: imgs.filter(img => { const src = img.getAttribute('src') || ''; return !src.startsWith('data:') && img.complete && img.naturalWidth === 0; }).map(img => img.getAttribute('src')).slice(0,20),
            textHasUndefined: document.body.innerText.includes('undefined') || document.body.innerText.includes('null'),
            duplicateBusyText: document.body.innerText.includes('忙碌忙碌'),
            topBannerMounted: document.documentElement.dataset.topBannerTemplate || null,
            networkErrorBannerExists: !!document.querySelector('#networkErrorBanner.top-banner.network-error'),
          }
        }""")
        # switch all primary menu pages through switchNav -> router bridge.
        nav_results = []
        for name, file in [('teams','02-teams.png'), ('pool','03-workers.png'), ('decisions','04-decisions.png'), ('projects','05-projects.png'), ('roles','06-roles.png'), ('skills','07-skills.png'), ('runtime-gateway','08-runtime-gateway.png'), ('settings','09-settings.png')]:
            try:
                page.evaluate(f"() => {{ if (typeof window.switchNav === 'function') window.switchNav('{name}'); }}")
                page.wait_for_timeout(500)
                nav_metric = page.evaluate("""(name) => ({
                  requested: name,
                  currentPage: document.documentElement.dataset.currentPage || null,
                  activeNav: document.querySelector('.nav-item.active[data-target]')?.dataset.target || null,
                  activePage: Array.from(document.querySelectorAll('.page.active')).map(p => p.id),
                })""", name)
                nav_results.append(nav_metric)
                page.screenshot(path=str(SCREEN/file), full_page=True)
            except Exception as e:
                console.append({'type':'nav-error','text':f'{name}: {e}'[:500]})
                nav_results.append({'requested': name, 'error': str(e)[:500]})
        browser.close()
    nav_ok = all((r.get('requested') == r.get('activeNav') and ('page-' + r.get('requested', '')) in r.get('activePage', [])) for r in locals().get('nav_results', []))
    result = {'ok': bool(metrics.get('teamCards')) and not metrics.get('brokenImages') and not page_errors and (metrics.get('factoryApi') or {}).get('status') == 'ready' and metrics.get('appShell') in ('p0b.4','p0b.6') and metrics.get('routerDataset') in ('p0b.4','p0b.6') and (metrics.get('prototypeStore') or {}).get('version') == 'p0b.3' and nav_ok,
              'metrics': metrics, 'navResults': locals().get('nav_results', []), 'pageErrors': page_errors, 'console': console[-30:],
              'httpErrors': http_errors[-30:],
              'mode': 'python-playwright-route-virtual-origin'}
    (OUT/'sandbox-verify-result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not result['ok']:
        sys.exit(1)

if __name__ == '__main__':
    run()
