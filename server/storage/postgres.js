function create() {
  let pg
  try { pg = require('pg') } catch (e) { throw new Error('Install pg to use Postgres adapter') }
  const url = process.env.DATABASE_URL || ''
  const pool = new pg.Pool({ connectionString: url })
  async function ensure() {
    await pool.query('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, appId TEXT, ts BIGINT, name TEXT, type TEXT, payload JSONB)')
  }
  ensure()
  async function insert(event) {
    const { id, appId, ts, name, type, payload } = normalize(event)
    await pool.query('INSERT INTO events (id, appId, ts, name, type, payload) VALUES ($1,$2,$3,$4,$5,$6)', [id, appId, ts, name, type, JSON.stringify(payload)])
  }
  async function insertBatch(events) { for (const e of events) await insert(e) }
  async function query({ appId, limit = 100, offset = 0 }) {
    const { rows } = await pool.query('SELECT * FROM events WHERE ($1::text IS NULL OR appId=$1) ORDER BY ts DESC LIMIT $2 OFFSET $3', [appId || null, limit, offset])
    return rows.map(denormalize)
  }
  return { insert, insertBatch, query }
}
function normalize(e) { return { id: e.id, appId: e.appId, ts: e.ts, name: e.name || null, type: e.type || null, payload: e.payload || e } }
function denormalize(r) { return { id: r.id, appId: r.appId, ts: Number(r.ts), name: r.name, type: r.type, payload: r.payload } }
module.exports = { create }