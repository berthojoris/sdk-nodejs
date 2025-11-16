# API Specification

## Headers
- `Content-Type: application/json`
- `X-App-Id: <appId>` (optional if provided in body)

## POST /events
- Description: Ingest a single event
- Body:
```
{
  "appId": "your-app",           // optional if header provided
  "type": "click|scroll|input|navigation|error|custom",
  "name": "optional name for custom",
  "payload": { ... },             // event data
  "userId": "optional override",
  "sessionId": "optional override"
}
```
- Response:
```
{ "ok": true, "id": "<uuid>" }
```
- Errors: `400 { error: "missing_appId|invalid_json" }`

## POST /events/batch
- Description: Ingest an array of events
- Body:
```
[
  { "appId": "your-app", "type": "custom", "name": "action", "payload": { ... } },
  ...
]
```
- Response:
```
{ "ok": true, "count": <n> }
```
- Errors: `400 { error: "invalid_json|expected_array" }`

## GET /events
- Description: Query events
- Query params:
  - `appId`: filter by application id
  - `limit`: default `100`
  - `offset`: default `0`
- Response:
```
{ "ok": true, "events": [ { "id": "...", "appId": "...", "ts": 123, "type": "...", "name": "...", "payload": { ... } } ] }
```

## WebSocket /ws
- Description: Real-time event broadcast channel
- Message format:
```
{ "type": "event", "data": { ...event... } }
```
- Usage:
```
const ws = new WebSocket('ws://localhost:3000/ws')
ws.onmessage = (msg) => {
  const evt = JSON.parse(msg.data)
  if (evt.type === 'event') {
    // update charts
  }
}
```

## Status Codes
- `200 OK`, `204 No Content (OPTIONS)`, `400 Bad Request`, `404 Not Found`

## Rate Limits
- Client-side rate limit enforced by SDK via `maxPerSecond` option
- Server-side limits: implement per `appId/IP` behind proxy/gateway as needed