# Examples

## Basic HTML Integration
```
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Analytics Demo</title>
    <script src="/dist/analytics.js"></script>
  </head>
  <body>
    <button id="signup">Sign Up</button>
    <button class="track-purchase" data-analytics-props="plan=pro;currency=USD">Buy Pro</button>
    <button data-analytics="contact_submit" data-analytics-on="click" data-analytics-props='{"via":"footer"}'>Contact</button>
    <script>
      const analytics = window.AnalyticsSDK.create({
        appId: 'demo-app',
        endpoint: 'http://localhost:3000/events',
        batchEndpoint: 'http://localhost:3000/events/batch'
      })
      document.getElementById('signup').addEventListener('click', () => {
        analytics.track('signup_clicked', { plan: 'pro' })
      })
    </script>
  </body>
</html>
```

## WebSocket Listener
```
const ws = new WebSocket('ws://localhost:3000/ws')
ws.onmessage = (msg) => {
  const evt = JSON.parse(msg.data)
  if (evt.type === 'event') console.log('Realtime:', evt.data)
}
```

## cURL Tests
```
# Single event
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -H 'X-App-Id: demo-app' \
  -d '{"type":"custom","name":"test_event","payload":{"foo":"bar"}}'

# Query
curl "http://localhost:3000/events?appId=demo-app&limit=5"
```