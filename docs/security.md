# Security & Privacy

## Transport
- HTTPS for all endpoints
- WebSocket over WSS

## Authentication
- Add token-based auth to ingestion/query endpoints
- Example design:
  - Header: `Authorization: Bearer <token>`
  - Token mapped to `appId`
  - Reject requests missing/invalid tokens

## Domain Whitelisting
- Maintain allowed origins per `appId`
- Validate `Origin` header at server

## PII Handling
- Avoid collecting sensitive fields
- `input` collector records length only, skips passwords
- Use `optOut` to disable tracking

## Consent
- Integrate with site consent management (GDPR/CCPA)
- Only enable SDK after user consent

## Data Retention
- Configure DB retention policies
- Archive old events into cold storage

## Compliance
- Provide data export and deletion per user/session
- Anonymize IPs and identifiers where possible