import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const port = Number(process.env.PORT || 5173)

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
])

function safeResolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0])
  let target = path.resolve(root, clean.replace(/^\/+/, ''))
  if (!target.startsWith(root)) return null
  if (existsSync(target) && statSync(target).isDirectory()) target = path.join(target, 'index.html')
  if (!existsSync(target)) target = path.join(root, 'index.html')
  return target
}

const server = http.createServer(async (req, res) => {
  try {
    const file = safeResolve(req.url || '/')
    if (!file || !existsSync(file)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }
    const ext = path.extname(file).toLowerCase()
    const body = await readFile(file)
    res.writeHead(200, {
      'content-type': types.get(ext) || 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(String(error?.stack || error))
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`agent-team web is running: http://127.0.0.1:${port}`)
  console.log(`root: ${root}`)
})
