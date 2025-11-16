# Deployment

## Environment
- `PORT`: server port (default `3000`)
- `DB_TYPE`: `file|mysql|postgres|sqlite|mongo`
- `DATABASE_URL`: connection string for mysql/postgres/mongo
- `MONGO_DB`: mongo database name

## CORS
- Default `Access-Control-Allow-Origin: *`
- Restrict origins in production by setting a proxy or modifying server headers

## CDN for SDK
- Host `dist/analytics.js` via your CDN
- Version and cache aggressively; SDK is small and self-contained

## Scaling
- Horizontal scale behind a load balancer
- Use a shared database or message queue for multi-instance ingestion if needed
- Consider adding a queue (Kafka/Redis) for spikes

## Logging & Monitoring
- Capture server access logs at the reverse proxy
- Monitor EPS, latency, error rates, DB health

## Security
- Add token authentication at ingestion endpoints
- Enforce domain whitelisting per `appId`
- Rate-limit per `appId/IP`

## Deployment Steps
- Build SDK: `npm run build-sdk`
- Configure env vars
- Run server: `npm start`
- Validate ingestion and query