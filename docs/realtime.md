# Realtime Streaming

## WebSocket Endpoint
- `ws://<host>:<port>/ws`
- Messages: `{ "type": "event", "data": { ...event... } }`

## Example Dashboard Client
```
const ws = new WebSocket('ws://localhost:3000/ws')
ws.onmessage = (msg) => {
  const evt = JSON.parse(msg.data)
  if (evt.type === 'event') {
    // update charts
    console.log('event', evt.data)
  }
}
```

## Use Cases
- Realtime counters (EPS)
- Live feed of events
- Stream processing into in-memory aggregations

## Notes
- WebSocket broadcast is best-effort; persist authoritative data in DB via the HTTP ingestion