# Realtime Analytics SDK

A JavaScript-based tracking SDK and Node.js server for real-time user interaction analytics. Works with multiple databases (File/JSONL, MySQL, PostgreSQL, SQLite, MongoDB), streams events over WebSocket, and provides batched HTTP ingestion.

## Features
- Auto-capture events: pageview, click, scroll, input (length only), navigation, error, unhandledrejection
- Custom events via `track(name, properties)`
- Batching with `sendBeacon` fallback to `fetch`
- Offline queue and flush when online
- Session and user ID management
- Pluggable storage adapters selected by `DB_TYPE`
- Real-time broadcast via `/ws`
- Declarative tracking via `data-analytics` attributes or `track-*` classes

## Quickstart
- `npm install`
- Optional DB drivers: install only what's needed
  - MySQL: `npm install mysql2`
  - PostgreSQL: `npm install pg`
  - SQLite: `npm install sqlite3`
  - MongoDB: `npm install mongodb`
- Build SDK bundle: `npm run build-sdk`
- Configure environment:
  - `DB_TYPE=file|mysql|postgres|sqlite|mongo`
  - `DATABASE_URL` for mysql/postgres/mongo
  - `MONGO_DB` for mongo (default `analytics`)
  - `PORT` (default `3000`)
- Start server: `npm start`

## Include SDK in Web App
- Serve `dist/analytics.js` and include it:
  - `<script src="/dist/analytics.js"></script>`
  - `const analytics = window.AnalyticsSDK.create({ appId: 'your-app', endpoint: 'http://localhost:3000/events', batchEndpoint: 'http://localhost:3000/events/batch' })`
  - `analytics.track('signup_clicked', { plan: 'pro' })`
 - No-code element tagging:
   - `<button class="track-signup">Sign Up</button>`
   - `<button data-analytics="purchase" data-analytics-props="plan=pro;currency=USD">Buy</button>`

## HTTP APIs
- `POST /events`: ingest single event
- `POST /events/batch`: ingest array of events
- `GET /events?appId=<id>&limit=<n>&offset=<n>`: query events
- WebSocket `/ws`: stream real-time events `{ type: 'event', data: <event> }`

## Repository
- Server: `server/index.js`
- Storage adapters: `server/storage/*`
- SDK source: `sdk/analytics.js`; build output: `dist/analytics.js`

## Documentation
- Getting Started: `docs/getting-started.md`
- API Spec: `docs/api.md`
- SDK Usage: `docs/sdk.md`
- Database Adapters: `docs/adapters.md`
- Realtime Streaming: `docs/realtime.md`
- Deployment: `docs/deployment.md`
- Security & Privacy: `docs/security.md`
- Examples: `docs/examples.md`