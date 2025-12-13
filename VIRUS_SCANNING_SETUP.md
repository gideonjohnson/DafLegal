# Virus Scanning Setup with ClamAV

## Overview

DafLegal now includes **comprehensive virus scanning** for all file uploads using ClamAV, an open-source antivirus engine. This feature protects against malware in uploaded contracts, documents, and legal files.

## Features

✅ **Real-time Virus Scanning** - All uploaded files are scanned before processing
✅ **Multi-endpoint Coverage** - Integrated into all file upload endpoints:
- Contract analysis (`/api/v1/contracts/analyze`)
- Instant document analysis (`/api/v1/instant-analysis/analyze`)
- Timeline document uploads (`/api/v1/timeline/matters/{id}/documents`)

✅ **Automatic Rejection** - Infected files are rejected with clear error messages
✅ **Configurable** - Can be enabled/disabled via environment variables
✅ **Production-Ready** - Graceful degradation in development mode
✅ **Docker Integration** - ClamAV runs as a service in docker-compose

## Architecture

```
┌─────────────────┐
│  File Upload    │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI        │
│  Endpoint       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Virus Scanner  │ ◄───► ┌──────────────┐
│   (Python)      │       │   ClamAV     │
└────────┬────────┘       │   Daemon     │
         │                └──────────────┘
         │ (if clean)
         ▼
┌─────────────────┐
│  Document       │
│  Processing     │
└─────────────────┘
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# ClamAV Virus Scanning
CLAMAV_ENABLED=true                           # Enable/disable virus scanning
CLAMAV_HOST=clamav                            # ClamAV daemon hostname
CLAMAV_PORT=3310                              # ClamAV daemon port
CLAMAV_USE_TCP=true                           # Use TCP (true) or Unix socket (false)
CLAMAV_SOCKET_PATH=/var/run/clamav/clamd.sock # Unix socket path (if USE_TCP=false)
CLAMAV_TIMEOUT=30                             # Scan timeout in seconds
```

### Default Settings

- **Enabled by default** in all environments
- **TCP connection** to ClamAV daemon on port 3310
- **30-second timeout** for scan operations
- **Graceful degradation** in development mode if ClamAV unavailable

## Docker Deployment

### docker-compose.yml

The ClamAV service is pre-configured:

```yaml
clamav:
  image: clamav/clamav:latest
  ports:
    - "3310:3310"
  volumes:
    - clamav_data:/var/lib/clamav
  healthcheck:
    test: ["CMD", "clamdscan", "--ping", "1"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 120s  # ClamAV needs time to download virus definitions
```

**Note**: ClamAV requires ~2-3 minutes on first startup to download virus definitions (~200MB).

### Starting the Services

```bash
# Start all services including ClamAV
docker-compose up -d

# Check ClamAV status
docker-compose logs clamav

# Wait for "Virus database is up to date" message
docker-compose logs -f clamav | grep "database is up to date"
```

## Local Development (Non-Docker)

### Install ClamAV

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install clamav clamav-daemon
sudo freshclam  # Update virus definitions
sudo systemctl start clamav-daemon
```

**macOS:**
```bash
brew install clamav
freshclam  # Update virus definitions
clamd  # Start daemon
```

**Windows:**
```bash
# Download ClamAV from https://www.clamav.net/downloads
# Or use Docker Desktop with docker-compose
```

### Configure for Local Development

In your `.env`:
```bash
CLAMAV_ENABLED=true
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
CLAMAV_USE_TCP=true
```

## Testing

### Test Virus Detection

ClamAV includes a test file called EICAR that safely triggers virus detection:

```bash
# Create EICAR test file (harmless virus signature)
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt

# Try uploading via API (should be rejected)
curl -X POST http://localhost:8000/api/v1/contracts/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@eicar.txt"

# Expected response:
# {"detail": "File rejected: Virus detected - Eicar-Signature"}
```

### Test Clean File Upload

```bash
# Upload a clean PDF
curl -X POST http://localhost:8000/api/v1/contracts/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@clean_contract.pdf"

# Expected: Normal processing continues
```

### Check ClamAV Version

```python
from app.services.virus_scanner import get_virus_scanner

scanner = get_virus_scanner()
version = scanner.get_version()
print(version)  # Should print ClamAV version info
```

## API Behavior

### Clean File

```json
// Request: POST /api/v1/contracts/analyze
// File: clean_contract.pdf

// Response: 202 Accepted
{
  "contract_id": "ctr_abc123",
  "filename": "clean_contract.pdf",
  "status": "uploaded",
  "eta_seconds": 15
}
```

### Infected File

```json
// Request: POST /api/v1/contracts/analyze
// File: malware.pdf

// Response: 400 Bad Request
{
  "detail": "File rejected: Virus detected - Win.Trojan.Generic"
}
```

### ClamAV Unavailable (Development)

In development mode, if ClamAV is unavailable:
- Files are **allowed** with a warning logged
- Upload proceeds normally
- Console shows: "ClamAV disabled due to connection failure (development mode)"

In production mode, if ClamAV is unavailable:
- Files are **rejected** with error
- Upload fails
- Error: "Virus scanning service unavailable"

## Monitoring

### Logs

Virus scanning events are logged:

```python
# Clean file
INFO: File scanned clean: contract.pdf

# Infected file
WARNING: Virus detected in malware.pdf: Win.Trojan.Generic

# ClamAV connection error
ERROR: ClamAV connection error while scanning file.pdf
```

### Metrics

Track virus scanning in your monitoring:
- Files scanned per day
- Viruses detected
- Scan failures
- Average scan time

### Healthcheck

Check ClamAV health:

```bash
# Inside container
docker exec daflegal-clamav clamdscan --ping

# From Python
from app.services.virus_scanner import get_virus_scanner
scanner = get_virus_scanner()
print(scanner.get_version())  # Returns version if healthy
```

## Performance

### Scan Times

- **Small files** (<1MB): ~50-200ms
- **Medium files** (1-10MB): ~200-500ms
- **Large files** (10-25MB): ~500-1500ms

### Resource Usage

- **Memory**: ~300-500MB (ClamAV daemon + virus DB)
- **CPU**: Minimal when idle, burst during scans
- **Disk**: ~200MB for virus definitions

### Optimization Tips

1. **Use TCP connection** (faster than Unix socket in Docker)
2. **Adjust timeout** based on max file size
3. **Monitor scan times** and adjust rate limits if needed
4. **Update virus DB daily** (automatic with official Docker image)

## Security Best Practices

1. ✅ **Always enable in production** - Set `CLAMAV_ENABLED=true`
2. ✅ **Keep definitions updated** - Automatic with Docker image
3. ✅ **Monitor rejected files** - Track virus detections
4. ✅ **Set appropriate timeouts** - Balance speed vs thoroughness
5. ✅ **Combine with other validations** - File type, size, content checks
6. ✅ **Log all events** - Audit trail for security incidents

## Troubleshooting

### ClamAV Container Not Starting

```bash
# Check logs
docker-compose logs clamav

# Common issue: Virus DB download failed
# Solution: Wait longer (2-3 minutes) or check internet connection

# Restart ClamAV
docker-compose restart clamav
```

### "Couldn't find ClamAV" Error

```bash
# Check if ClamAV is running
docker-compose ps clamav

# Check health
docker exec daflegal-clamav clamdscan --ping

# Verify environment variables
docker-compose exec backend env | grep CLAMAV
```

### Slow Scan Times

- Increase `CLAMAV_TIMEOUT` in environment variables
- Check ClamAV daemon logs for errors
- Ensure ClamAV has enough resources (memory)

### All Files Allowed in Production

- Check `CLAMAV_ENABLED=true` in production environment
- Verify ClamAV service is running
- Check backend logs for connection errors

## Deployment Checklist

Before deploying to production:

- [ ] ClamAV service added to docker-compose
- [ ] Environment variables configured
- [ ] ClamAV volume persisted for virus definitions
- [ ] Healthcheck configured
- [ ] Startup timeout set to 120s+
- [ ] Test EICAR file rejection works
- [ ] Monitoring/logging configured
- [ ] Alerts set up for scan failures
- [ ] Documentation updated

## Maintenance

### Update Virus Definitions

Automatic with official Docker image (updates every few hours).

Manual update:
```bash
docker exec daflegal-clamav freshclam
```

### Reload Virus Database

```bash
# Reload without restarting
docker exec daflegal-clamav clamdscan --reload
```

### Check Database Version

```bash
docker exec daflegal-clamav sigtool --info /var/lib/clamav/main.cvd
```

## Cost Considerations

**ClamAV is 100% free and open-source!**

- No licensing costs
- No API usage fees
- No per-scan charges
- Community-maintained virus definitions

**Infrastructure costs:**
- ~300-500MB RAM (included in existing server resources)
- ~200MB disk space for virus definitions
- Minimal CPU overhead

## Migration from Previous Setup

If you're upgrading from a version without virus scanning:

1. Pull latest code with ClamAV integration
2. Add `clamav` service to docker-compose
3. Add environment variables to `.env`
4. Run `docker-compose up -d`
5. Wait 2-3 minutes for virus DB download
6. Test with EICAR file
7. Monitor logs for first 24 hours

No database migrations required!

## Support

### Official Documentation
- [ClamAV Official Docs](https://docs.clamav.net/)
- [ClamAV Docker Hub](https://hub.docker.com/r/clamav/clamav)
- [Python clamd Library](https://pypi.org/project/clamd/)

### Getting Help
- Check logs: `docker-compose logs clamav`
- Test connection: `docker exec daflegal-clamav clamdscan --ping`
- Verify config: `docker-compose exec backend env | grep CLAMAV`

---

**Last Updated**: December 13, 2025
**Status**: ✅ Production Ready
