const fs = require('fs')
const path = require('path')
function create(baseDir) {
  let sqlite3
  try { sqlite3 = require('sqlite3').verbose() } catch (e) { throw new Error('Install sqlite3 to use SQLite adapter') }
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true })
  const dbPath = path.join(baseDir, 'events.sqlite')
  const db = new sqlite3.Database(dbPath)
  db.run('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, appId TEXT, ts INTEGER, name TEXT, type TEXT, payload TEXT)')
  function insert(event) {
    const { id, appId, ts, name, type, payload } = normalize(event)
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO events (id, appId, ts, name, type, payload) VALUES (?,?,?,?,?,?)', [id, appId, ts, name, type, JSON.stringify(payload)], err => { if (err) reject(err); else resolve() })
    })
  }
  async function insertBatch(events) { for (const e of events) await insert(e) }
  function query({ appId, limit = 100, offset = 0 }) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM events WHERE (? IS NULL OR appId=?) ORDER BY ts DESC LIMIT ? OFFSET ?', [appId || null, appId || null, limit, offset], (err, rows) => {
        if (err) { reject(err); return }
        resolve(rows.map(denormalize))
      })
    })
  }
  return { insert, insertBatch, query }
}
function normalize(e) { return { id: e.id, appId: e.appId, ts: e.ts, name: e.name || null, type: e.type || null, payload: e.payload || e } }
function denormalize(r) { return { id: r.id, appId: r.appId, ts: Number(r.ts), name: r.name, type: r.type, payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload } }
module.exports = { create }