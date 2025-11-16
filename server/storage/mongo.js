function create() {
  let mongodb
  try { mongodb = require('mongodb') } catch (e) { throw new Error('Install mongodb to use Mongo adapter') }
  const url = process.env.DATABASE_URL || 'mongodb://localhost:27017'
  const dbName = process.env.MONGO_DB || 'analytics'
  const client = new mongodb.MongoClient(url)
  let collection
  async function ensure() {
    await client.connect()
    const db = client.db(dbName)
    collection = db.collection('events')
    await collection.createIndex({ appId: 1, ts: -1 })
  }
  const ready = ensure()
  async function insert(event) { await ready; await collection.insertOne(normalize(event)) }
  async function insertBatch(events) { await ready; await collection.insertMany(events.map(normalize)) }
  async function query({ appId, limit = 100, offset = 0 }) {
    await ready
    const cursor = collection.find(appId ? { appId } : {}).sort({ ts: -1 }).skip(offset).limit(limit)
    const rows = await cursor.toArray()
    return rows.map(denormalize)
  }
  return { insert, insertBatch, query }
}
function normalize(e) { return { id: e.id, appId: e.appId, ts: e.ts, name: e.name || null, type: e.type || null, payload: e.payload || e } }
function denormalize(r) { return { id: r.id, appId: r.appId, ts: Number(r.ts), name: r.name, type: r.type, payload: r.payload } }
module.exports = { create }