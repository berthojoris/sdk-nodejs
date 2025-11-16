const fs = require('fs')
const path = require('path')
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }
function create(baseDir) {
  ensureDir(baseDir)
  const file = path.join(baseDir, 'events.jsonl')
  function insert(event) {
    return new Promise((resolve, reject) => {
      fs.appendFile(file, JSON.stringify(event) + '\n', err => { if (err) reject(err); else resolve() })
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
          try {
            const obj = JSON.parse(lines[i])
            if (appId && obj.appId !== appId) continue
            items.push(obj)
          } catch {}
        }
        const sliced = items.slice(offset, offset + limit)
        resolve(sliced)
      })
    })
  }
  return { insert, insertBatch, query }
}
module.exports = { create }