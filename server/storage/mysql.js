function create() {
  let mysql
  try { mysql = require('mysql2/promise') } catch (e) { throw new Error('Install mysql2 to use MySQL adapter') }
  const url = process.env.DATABASE_URL || ''
  const pool = mysql.createPool(url)
  async function ensure() {
    await pool.query('CREATE TABLE IF NOT EXISTS events (id VARCHAR(36) PRIMARY KEY, appId VARCHAR(128), ts BIGINT, name VARCHAR(128), type VARCHAR(64), payload JSON)')
  }
  ensure()
  async function insert(event) {
    const { id, appId, ts, name, type, payload } = normalize(event)
    await pool.query('INSERT INTO events (id, appId, ts, name, type, payload) VALUES (?,?,?,?,?,?)', [id, appId, ts, name, type, JSON.stringify(payload)])
  }
  async function insertBatch(events) { for (const e of events) await insert(e) }
  async function query({ appId, limit = 100, offset = 0 }) {
    const [rows] = await pool.query('SELECT * FROM events WHERE (? IS NULL OR appId=?) ORDER BY ts DESC LIMIT ? OFFSET ?', [appId || null, appId || null, limit, offset])
    return rows.map(denormalize)
  }
  return { insert, insertBatch, query }
}
function normalize(e) { return { id: e.id, appId: e.appId, ts: e.ts, name: e.name || null, type: e.type || null, payload: e.payload || e } }
function denormalize(r) { return { id: r.id, appId: r.appId, ts: Number(r.ts), name: r.name, type: r.type, payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload } }
module.exports = { create }