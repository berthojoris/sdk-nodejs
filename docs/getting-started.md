# Getting Started

## Prerequisites
- Node.js 18+
- Optional database drivers depending on `DB_TYPE`

## Install
- `npm install`
- Install optional drivers:
  - MySQL: `npm install mysql2`
  - PostgreSQL: `npm install pg`
  - SQLite: `npm install sqlite3`
  - MongoDB: `npm install mongodb`

## Configure
- Environment variables:
  - `DB_TYPE=file|mysql|postgres|sqlite|mongo`
  - `DATABASE_URL` for mysql/postgres/mongo
  - `MONGO_DB` for mongo (default `analytics`)
  - `PORT` (default `3000`)

## Build SDK
- `npm run build-sdk`
- Outputs `dist/analytics.js`

## Run Server
- `npm start`
- Server listens on `http://localhost:3000`

## Integrate SDK
- Include bundle in your app:
```
<script src="/dist/analytics.js"></script>
<script>
  const analytics = window.AnalyticsSDK.create({
    appId: 'your-app',
    endpoint: 'http://localhost:3000/events',
    batchEndpoint: 'http://localhost:3000/events/batch',
    batchSize: 20,
    flushInterval: 2000,
    useBeacon: true
  })
  analytics.track('signup_clicked', { plan: 'pro' })
</script>
```

### Declarative Tracking (no JS changes)
- Mark elements and the SDK will auto-track on interaction:
```
<button class="track-signup">Sign Up</button>
<button data-analytics="purchase" data-analytics-props="plan=pro;currency=USD">Buy</button>
<input data-analytics="search" data-analytics-on="input" placeholder="Search" />
```

## Verify
- Single event:
```
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -H 'X-App-Id: your-app' \
  -d '{"type":"custom","name":"test","payload":{"k":"v"}}'
```
- Query events:
```
curl "http://localhost:3000/events?appId=your-app&limit=10"
```