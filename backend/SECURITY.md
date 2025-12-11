# Security Features

DafLegal implements multiple layers of security to protect the API and user data.

## Rate Limiting

### Global Rate Limits (IP-based)

All requests are rate-limited based on the client's IP address:

- **Default limit**: 100 requests/minute per IP
- Applies to all endpoints
- Uses Redis for distributed rate limiting (falls back to in-memory if Redis unavailable)

### User-Specific Rate Limits (Plan-based)

Authenticated requests have additional rate limits based on the user's plan:

| Plan        | Per Minute | Per Hour | Per Day  |
|-------------|------------|----------|----------|
| Free Trial  | 10         | 100      | 500      |
| Starter     | 30         | 500      | 2,000    |
| Pro         | 60         | 2,000    | 10,000   |
| Team        | 120        | 5,000    | 50,000   |

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

### Rate Limit Exceeded Response

When rate limit is exceeded (429 status):

```json
{
  "detail": "Rate limit exceeded. Please try again later.",
  "retry_after": 60,
  "limit": "100 per 1 minute",
  "message": "You have sent too many requests. Please wait before trying again."
}
```

Headers include:
- `Retry-After`: Seconds until rate limit resets

---

## Security Headers

All responses include the following security headers:

### Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
- Forces HTTPS for 1 year
- Includes all subdomains
- Protects against SSL stripping attacks

### Content-Security-Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
```
- Restricts resource loading to prevent XSS
- Only allows scripts/styles from same origin
- Allows connections to OpenAI and Stripe APIs
- Prevents iframe embedding (`frame-ancestors 'none'`)

### X-Frame-Options
```
X-Frame-Options: DENY
```
- Prevents clickjacking attacks
- Blocks all framing/embedding

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- Prevents MIME type sniffing
- Forces browsers to respect Content-Type header

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- Legacy XSS protection for older browsers
- Blocks page if XSS detected

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Only sends origin (not full URL) when navigating cross-origin
- Protects user privacy

### Permissions-Policy
```
Permissions-Policy: geolocation=(), microphone=(), camera=(), ...
```
- Disables unnecessary browser features:
  - Geolocation
  - Microphone/Camera
  - Payment
  - USB
  - Sensors (magnetometer, gyroscope, accelerometer)

---

## Request Size Limits

- **Maximum request size**: 100MB
- Enforced before processing to prevent DoS attacks
- Returns 413 (Request Entity Too Large) if exceeded:

```json
{
  "detail": "Request body too large. Maximum size: 100.0MB"
}
```

---

## CORS (Cross-Origin Resource Sharing)

### Allowed Origins
- `http://localhost:3000` (development)
- `https://daflegal.com`
- `https://www.daflegal.com`

### Configuration
- Credentials: Allowed
- Methods: All (`*`)
- Headers: All (`*`)
- Preflight cache: 1 hour

---

## Authentication & Authorization

### API Key Authentication

All protected endpoints require a valid API key:

```
Authorization: Bearer dfk_xxxxxxxxxxxxx
```

### API Key Format
- Prefix: `dfk_`
- Length: 44+ characters
- Generated using cryptographically secure random tokens

### API Key Limits
- Maximum 10 active keys per user
- Keys can be revoked (not deleted) for audit trail
- Last used timestamp tracked

### Password Security
- Hashed using bcrypt
- Minimum 8 characters required
- Current password verification required for changes

---

## Input Validation

### Email Validation
- Uses `email-validator` library
- Checks format and DNS records

### SQL Injection Protection
- SQLModel ORM parameterized queries
- No raw SQL execution

### XSS Protection
- Automatic HTML escaping in responses
- CSP headers prevent inline script execution

---

## Error Monitoring

### Sentry Integration
- Automatic error tracking
- 10% sample rate in production
- 100% sample rate in development
- Environment-specific tracking

---

## Database Security

### Connection Security
- SSL/TLS encrypted connections (production)
- Connection pooling with limits
- Automatic connection cleanup

### User Data Isolation
- All queries filtered by `user_id`
- Row-level security through ORM
- No cross-user data access

---

## File Upload Security

### Allowed File Types
- PDF (`.pdf`)
- Word (`.docx`, `.doc`)
- Maximum size: 100MB

### File Processing
- Virus scanning (TODO: integrate ClamAV)
- Content-type verification
- Secure temporary storage
- Cloudinary upload with transformation

---

## Environment Variables

Critical security settings in `.env`:

```bash
# Encryption
SECRET_KEY=<strong-random-key>

# Database (use SSL in production)
DATABASE_URL=postgresql://...?sslmode=require

# API Keys
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...

# Monitoring
SENTRY_DSN=https://...

# Redis (for rate limiting)
REDIS_URL=redis://...
```

**Never commit `.env` to version control!**

---

## Security Best Practices

### For Production Deployment

1. **Environment Variables**
   - Use strong SECRET_KEY (32+ random chars)
   - Enable database SSL (`?sslmode=require`)
   - Use production API keys

2. **HTTPS**
   - Always use HTTPS in production
   - HSTS header enforces this

3. **Redis**
   - Use Redis for distributed rate limiting
   - Secure Redis with password
   - Use SSL/TLS for Redis connection

4. **Monitoring**
   - Configure Sentry for error tracking
   - Set up log aggregation (e.g., ELK stack)
   - Monitor rate limit violations

5. **Backups**
   - Regular database backups
   - Encrypted backup storage
   - Test restoration procedures

6. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

---

## Penetration Testing

Regular security audits recommended:

- SQL injection testing
- XSS vulnerability scanning
- CSRF protection verification
- Authentication bypass attempts
- Rate limit effectiveness
- File upload exploits

---

## Incident Response

If a security issue is discovered:

1. **Do not** disclose publicly immediately
2. Email security@daflegal.com with details
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

We will respond within 48 hours.

---

## Compliance

DafLegal implements security controls for:

- **GDPR**: User data protection, right to deletion
- **SOC 2**: Security monitoring, access controls
- **HIPAA** (future): If handling medical data in contracts

---

## Future Enhancements

Planned security improvements:

- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth2 support
- [ ] IP whitelisting for enterprise
- [ ] Advanced DDoS protection (Cloudflare)
- [ ] Automated security scanning in CI/CD
- [ ] Regular penetration testing
- [ ] SOC 2 Type II certification
- [ ] GDPR compliance tooling
- [ ] Audit logging for all user actions
- [ ] Encrypted backups
