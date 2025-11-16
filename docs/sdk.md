# SDK Usage

## Installation
- Use the built bundle `dist/analytics.js` in your web app
- Global: `window.AnalyticsSDK.create(opts)`
- CommonJS: `require('dist/analytics.js')` returns `{ create }`

## Options
```
{
  appId: 'app',
  endpoint: 'http://host/events',
  batchEndpoint: 'http://host/events/batch',
  batchSize: 20,
  flushInterval: 2000,
  maxPerSecond: 50,
  useBeacon: true,
  optOut: false,
  sessionTimeout: 1800000,
  attrName: 'data-analytics',
  attrProps: 'data-analytics-props',
  attrOn: 'data-analytics-on',
  autoIdTracking: true
}
```

## Auto-captured Events
- `pageview` on load
- `click` on DOM clicks
- `scroll` (throttled)
- `input` (length only, no values; skips `password`)
- `navigation` (`popstate`, `hashchange`)
- `error` and `unhandledrejection`

## API Methods
- `track(name, properties)`
- `capture(type, payload)`
- `start()` / `stop()`
- `flushStored()`

## Example
```
const analytics = window.AnalyticsSDK.create({
  appId: 'your-app',
  endpoint: 'http://localhost:3000/events',
  batchEndpoint: 'http://localhost:3000/events/batch'
})
analytics.track('signup_clicked', { plan: 'pro' })
```

## Offline Handling
- Events queued in `localStorage` when offline
- Flushed automatically on `online` event or via `flushStored()`

## Privacy
- Set `optOut: true` to disable tracking
- `input` collector records length only and skips password fields

## Declarative Tracking
- Add attributes to elements to trigger custom events without code:
  - `data-analytics="<eventName>"`
  - `data-analytics-props="key=value;foo=bar"` or JSON
  - `data-analytics-on="click|input"` to target event type
- Or use class naming:
  - `class="track-signup"` or `class="analytics-purchase"`
- If `autoIdTracking` is `true`, clicks on elements with an `id` will emit a custom event named by the `id`.