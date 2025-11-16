const fs = require('fs')
const path = require('path')
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }
function serialize(e) {
  const name = e.name || ''
  const type = e.type || ''
  const userId = e.userId || ''
  const sessionId = e.sessionId || ''
  const payload = JSON.stringify(e.payload || e)
  const appId = e.appId || ''
  const id = e.id
  const ts = e.ts
  return `ts=${ts} appId=${appId} id=${id} type=${type} name=${name} userId=${userId} sessionId=${sessionId} payload=${payload}`
}
function parse(line) {
  const obj = {}
  const idx = line.indexOf(' payload=')
  let head = line
  let payloadStr = null
  if (idx !== -1) { head = line.slice(0, idx); payloadStr = line.slice(idx + 9) }
  const parts = head.split(/\s+/).filter(Boolean)
  for (let i = 0; i < parts.length; i++) {
    const kv = parts[i]
    const j = kv.indexOf('=')
    if (j === -1) continue
    const k = kv.slice(0, j)
    const v = kv.slice(j + 1)
    obj[k] = v
  }
  if (payloadStr) {
    try { obj.payload = JSON.parse(payloadStr) } catch (e) { obj.payload = { raw: payloadStr } }
  }
  obj.ts = obj.ts ? Number(obj.ts) : Date.now()
  return { id: obj.id, appId: obj.appId, ts: obj.ts, name: obj.name || null, type: obj.type || null, payload: obj.payload, userId: obj.userId || null, sessionId: obj.sessionId || null }
}
function create(baseDir) {
  ensureDir(baseDir)
  const file = path.join(baseDir, 'events.txt')
  function insert(event) {
    return new Promise((resolve, reject) => {
      fs.appendFile(file, serialize(event) + '\n', err => { if (err) reject(err); else resolve() })
    })
  }
  async function insertBatch(events) { for (const e of events) await insert(e) }
  function query({ appId, limit = 100, offset = 0 }) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') { resolve([]); return }
        if (err) { reject(err); return }
        const lines = data.split('\n').filter(Boolean)
        const items = []
        for (let i = 0; i < lines.length; i++) {
          const obj = parse(lines[i])
          if (appId && obj.appId !== appId) continue
          items.push(obj)
        }
        const sliced = items.slice(offset, offset + limit)
        resolve(sliced)
      })
    })
  }
  return { insert, insertBatch, query }
}
module.exports = { create }