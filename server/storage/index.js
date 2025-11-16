const path = require('path')
function create() {
  const type = (process.env.DB_TYPE || 'file').toLowerCase()
  if (type === 'file') return require('./file').create(path.join(process.cwd(), 'data'))
  if (type === 'plaintext') return require('./plaintext').create(path.join(process.cwd(), 'data'))
  if (type === 'mysql') return require('./mysql').create()
  if (type === 'postgres') return require('./postgres').create()
  if (type === 'sqlite') return require('./sqlite').create(path.join(process.cwd(), 'data'))
  if (type === 'mongo') return require('./mongo').create()
  return require('./file').create(path.join(process.cwd(), 'data'))
}
module.exports = { create }