const http = require('http')
const url = require('url')
const { WebSocketServer } = require('ws')
const { v4: uuidv4 } = require('uuid')
const Storage = require('./storage')

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const storage = Storage.create()

function parseCsv(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : [] }
const ALLOWED_ORIGINS = parseCsv(process.env.CORS_ORIGINS)
const ALLOWED_IPS = parseCsv(process.env.IP_ALLOWLIST)
const CORS_METHODS = 'GET,POST,OPTIONS'
const CORS_HEADERS = 'Content-Type,Authorization,X-App-Id'

function normalizeIp(ip) {
  if (!ip) return ''
  const v = ip.toLowerCase()
  return v.startsWith('::ffff:') ? v.slice(7) : v
}

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for']
  if (xf && typeof xf === 'string' && xf.length > 0) return normalizeIp(xf.split(',')[0].trim())
  const xr = req.headers['x-real-ip']
  if (xr && typeof xr === 'string' && xr.length > 0) return normalizeIp(xr.trim())
  return normalizeIp(req.socket && req.socket.remoteAddress)
}

function isIpAllowed(ip) {
  if (ALLOWED_IPS.length === 0) return true
  const n = normalizeIp(ip)
  return ALLOWED_IPS.includes(n)
}

function isOriginAllowed(origin) {
  if (ALLOWED_ORIGINS.length === 0) return true
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

function applyCors(res, origin) {
  const allowAll = ALLOWED_ORIGINS.length === 0
  const okOrigin = allowAll ? '*' : (origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'null')
  res.setHeader('Access-Control-Allow-Origin', okOrigin)
  res.setHeader('Access-Control-Allow-Methods', CORS_METHODS)
  res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS)
}

const subscribers = new Set()

function broadcast(event) {
  const payload = JSON.stringify({ type: 'event', data: event })
  for (const ws of subscribers) {
    if (ws.readyState === ws.OPEN) ws.send(payload)
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try {
        const json = data ? JSON.parse(data) : {}
        resolve(json)
      } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  const method = req.method || 'GET'
  const origin = req.headers && req.headers.origin
  const ip = getClientIp(req)
  if (!isIpAllowed(ip)) { res.writeHead(403); res.end(JSON.stringify({ error: 'ip_not_allowed' })); return }
  if (!isOriginAllowed(origin)) { res.writeHead(403); res.end(JSON.stringify({ error: 'origin_not_allowed' })); return }
  applyCors(res, origin)
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (method === 'POST' && parsed.pathname === '/events') {
    try {
      const body = await parseBody(req)
      const appId = req.headers['x-app-id'] || (body && body.appId)
      if (!appId) { res.writeHead(400); res.end(JSON.stringify({ error: 'missing appId' })); return }
      const event = { id: uuidv4(), appId, ts: Date.now(), ...body }
      await storage.insert(event)
      broadcast(event)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, id: event.id }))
    } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'invalid_json' })) }
    return
  }
  if (method === 'POST' && parsed.pathname === '/events/batch') {
    try {
      const body = await parseBody(req)
      if (!Array.isArray(body)) { res.writeHead(400); res.end(JSON.stringify({ error: 'expected_array' })); return }
      const enriched = body.map(e => ({ id: uuidv4(), ts: Date.now(), ...e }))
      await storage.insertBatch(enriched)
      for (const ev of enriched) broadcast(ev)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, count: enriched.length }))
    } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'invalid_json' })) }
    return
  }
  if (method === 'GET' && parsed.pathname === '/events') {
    const { appId, limit, offset } = parsed.query
    const l = limit ? parseInt(limit, 10) : 100
    const o = offset ? parseInt(offset, 10) : 0
    const rows = await storage.query({ appId, limit: l, offset: o })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, events: rows }))
    return
  }
  res.writeHead(404)
  res.end(JSON.stringify({ error: 'not_found' }))
})

const wss = new WebSocketServer({ noServer: true })
wss.on('connection', ws => {
  subscribers.add(ws)
  ws.on('close', () => subscribers.delete(ws))
})

server.on('upgrade', (req, socket, head) => {
  const { pathname } = url.parse(req.url)
  if (pathname === '/ws') {
    const origin = req.headers && req.headers.origin
    const ip = getClientIp(req)
    if (!isIpAllowed(ip)) { socket.destroy(); return }
    if (!isOriginAllowed(origin)) { socket.destroy(); return }
    wss.handleUpgrade(req, socket, head, ws => { wss.emit('connection', ws, req) })
  } else { socket.destroy() }
})

server.listen(PORT, () => {})