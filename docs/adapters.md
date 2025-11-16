# Database Adapters & Configuration

## Selection
- Set `DB_TYPE` to one of: `file`, `mysql`, `postgres`, `sqlite`, `mongo`

## Drivers
- Install only the driver you need:
  - MySQL: `npm install mysql2`
  - PostgreSQL: `npm install pg`
  - SQLite: `npm install sqlite3`
  - MongoDB: `npm install mongodb`

## Connection
- `DATABASE_URL`:
  - MySQL: `mysql://user:pass@host:3306/dbname`
  - PostgreSQL: `postgres://user:pass@host:5432/dbname`
  - MongoDB: `mongodb://host:27017`
- `MONGO_DB`: Mongo database name (default `analytics`)

## Schemas
- Common fields: `id`, `appId`, `ts`, `name`, `type`, `payload`
- MySQL: table `events (id VARCHAR(36) PK, appId VARCHAR(128), ts BIGINT, name VARCHAR(128), type VARCHAR(64), payload JSON)`
- PostgreSQL: table `events (id TEXT PK, appId TEXT, ts BIGINT, name TEXT, type TEXT, payload JSONB)`
- SQLite: table `events (id TEXT PK, appId TEXT, ts INTEGER, name TEXT, type TEXT, payload TEXT)`
- MongoDB: collection `events` with index `{ appId: 1, ts: -1 }`
- File: newline-delimited JSON at `data/events.jsonl`

## Indexing
- Recommended: index on `(appId, ts DESC)` for query performance

## Configuration Examples
```
# File
DB_TYPE=file

# PostgreSQL
DB_TYPE=postgres
DATABASE_URL=postgres://user:pass@host:5432/dbname

# MySQL
DB_TYPE=mysql
DATABASE_URL=mysql://user:pass@host:3306/dbname

# SQLite
DB_TYPE=sqlite

# Mongo
DB_TYPE=mongo
DATABASE_URL=mongodb://localhost:27017
MONGO_DB=analytics
```