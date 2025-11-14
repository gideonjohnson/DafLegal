# DafLegal Startup Checklist 🚀

**Use this checklist after installing Docker or restarting your system**

---

## ✅ Step-by-Step Startup Guide

### Step 1: Verify Docker Installation

```bash
docker --version
docker compose version
```

**Expected output:**
```
Docker version 24.x.x or higher
Docker Compose version v2.x.x or higher
```

✅ **If you see versions, Docker is installed correctly!**

❌ **If command not found:**
- Restart your terminal/Git Bash
- On Windows: Make sure Docker Desktop is running
- Check Docker Desktop icon in system tray

---

### Step 2: Navigate to Project Directory

```bash
cd C:/Users/Administrator/daflegal
```

Verify you're in the right place:
```bash
ls
```

You should see:
- `docker-compose.yml`
- `backend/`
- `frontend/`
- `README.md`

---

### Step 3: Start All Services

```bash
docker compose up -d
```

**What this does:**
- `-d` = detached mode (runs in background)
- Starts 5 services: backend, frontend, worker, database, redis

**First time:** Takes 2-5 minutes (downloading images)
**Subsequent times:** Takes 30-60 seconds

**Expected output:**
```
[+] Running 5/5
✔ Container daflegal-db-1       Started
✔ Container daflegal-redis-1    Started
✔ Container daflegal-backend-1  Started
✔ Container daflegal-worker-1   Started
✔ Container daflegal-frontend-1 Started
```

---

### Step 4: Verify All Containers Running

```bash
docker compose ps
```

**Expected output:**
```
NAME                  STATUS              PORTS
daflegal-backend-1    Up                  0.0.0.0:8000->8000/tcp
daflegal-db-1         Up                  0.0.0.0:5432->5432/tcp
daflegal-frontend-1   Up                  0.0.0.0:3000->3000/tcp
daflegal-redis-1      Up                  0.0.0.0:6379->6379/tcp
daflegal-worker-1     Up
```

✅ **All should show "Up" status**

❌ **If any show "Exit" or "Restarting":**
```bash
# Check logs for that service
docker compose logs backend
docker compose logs frontend
docker compose logs worker
```

---

### Step 5: Test Backend API

**Wait 10-15 seconds** for backend to fully start, then:

```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

✅ **Backend is working!**

❌ **If connection refused:**
```bash
# Check backend logs
docker compose logs -f backend

# Wait 30 seconds more, backend might still be starting
```

---

### Step 6: Test Frontend

**Open browser and visit:**
- http://localhost:3000

**Expected:** DafLegal landing page loads

✅ **Frontend is working!**

❌ **If "This site can't be reached":**
```bash
# Check frontend logs
docker compose logs -f frontend

# Restart frontend
docker compose restart frontend
```

---

### Step 7: Verify Database Tables

```bash
docker compose exec db psql -U daflegal -d daflegal
```

**In PostgreSQL shell, run:**
```sql
\dt
```

**Expected:** List of 15+ tables including:
- users
- contracts
- contract_comparisons (Phase 1)
- clauses (Phase 2)
- playbooks (Phase 3)
- compliance_rules (Phase 3)
- compliance_checks (Phase 3)

**Exit PostgreSQL:**
```sql
\q
```

✅ **Database is initialized!**

---

### Step 8: Check Worker Status

```bash
docker compose logs worker | grep -i "ready"
```

**Expected output includes:**
```
celery@worker ready
```

✅ **Worker is ready to process jobs!**

---

### Step 9: Access API Documentation

**Open browser:**
- http://localhost:8000/docs

**Expected:** Swagger UI with all API endpoints

You should see endpoint groups:
- `/api/v1/users` - User management
- `/api/v1/contracts` - Contract analysis
- `/api/v1/comparisons` - Phase 1
- `/api/v1/clauses` - Phase 2
- `/api/v1/compliance` - Phase 3

✅ **API documentation is accessible!**

---

### Step 10: Quick Smoke Test

**Run the automated test script:**
```bash
./test-api.sh
```

**Expected:** All tests pass (takes 1-2 minutes)

✅ **System is fully operational!**

---

## 🎯 Quick Access URLs

| Service | URL | What It Is |
|---------|-----|------------|
| **Frontend** | http://localhost:3000 | Main web app |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **API** | http://localhost:8000 | REST API endpoints |
| **Health** | http://localhost:8000/health | API health check |

---

## 🔍 Common Issues & Fixes

### Issue: "Cannot connect to Docker daemon"

**Cause:** Docker Desktop isn't running

**Fix:**
1. Start Docker Desktop from Windows Start menu
2. Wait for Docker icon to appear in system tray
3. Retry: `docker compose up -d`

---

### Issue: "Port 8000 already in use"

**Cause:** Another service using port 8000

**Fix:**
```bash
# Find process using port 8000
netstat -ano | grep 8000

# Kill the process (use PID from above)
taskkill /PID <process_id> /F

# Or change port in docker-compose.yml
```

---

### Issue: "Backend container keeps restarting"

**Cause:** Database not ready or missing environment variables

**Fix:**
```bash
# Check .env file exists
ls .env

# Check backend logs
docker compose logs backend

# Restart all services
docker compose down
docker compose up -d
```

---

### Issue: "Database connection failed"

**Cause:** PostgreSQL container not ready

**Fix:**
```bash
# Check DB container
docker compose ps db

# Wait 30 seconds for DB to initialize
# Then restart backend
docker compose restart backend
```

---

### Issue: "Frontend shows 'Cannot connect to API'"

**Cause:** Backend not running or wrong API URL

**Fix:**
```bash
# Check backend is running
curl http://localhost:8000/health

# Restart frontend
docker compose restart frontend

# Verify NEXT_PUBLIC_API_URL in .env
```

---

## 📊 View Live Logs

**All services:**
```bash
docker compose logs -f
```

**Specific service:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f worker
```

**Press Ctrl+C to exit logs**

---

## 🛑 Stop Services

**Stop all (keeps data):**
```bash
docker compose down
```

**Stop and remove data (fresh start):**
```bash
docker compose down -v
# WARNING: This deletes all database data!
```

**Restart specific service:**
```bash
docker compose restart backend
docker compose restart frontend
docker compose restart worker
```

---

## 🔄 Restart Services

**Full restart:**
```bash
docker compose down
docker compose up -d
```

**Quick restart (keeps containers):**
```bash
docker compose restart
```

---

## 📈 Monitor Resource Usage

```bash
docker stats
```

**Shows:**
- CPU usage per container
- Memory usage
- Network I/O
- Disk I/O

**Press Ctrl+C to exit**

---

## ✅ Success Checklist

After startup, verify all these:

- [ ] Docker Desktop is running
- [ ] 5 containers show "Up" status
- [ ] Backend health check returns `{"status":"healthy"}`
- [ ] Frontend loads at http://localhost:3000
- [ ] API docs load at http://localhost:8000/docs
- [ ] Database has 15+ tables
- [ ] Worker shows "ready" in logs
- [ ] Can register new user
- [ ] Can upload test contract

**If all checked → System is ready! 🎉**

---

## 🚀 Next Steps After Startup

### For First-Time Setup:

1. **Register account:**
   - Go to http://localhost:3000/register
   - Create account

2. **Get API key:**
   - Login
   - Go to API Keys section
   - Create new key

3. **Test contract analysis:**
   - Upload a test PDF/DOCX
   - Wait for analysis (15-30 sec)
   - View results

4. **Create compliance playbook:**
   - Go to http://localhost:3000/compliance/playbooks
   - Create playbook
   - Add some rules
   - Run compliance check

### For Development:

1. **View logs:**
   ```bash
   docker compose logs -f backend
   ```

2. **Make code changes:**
   - Backend: Hot-reload enabled
   - Frontend: Hot-reload enabled
   - Just edit files and refresh

3. **Restart after major changes:**
   ```bash
   docker compose restart backend
   ```

---

## 📞 Need Help?

**Check these resources:**
1. `DEPLOYMENT_GUIDE.md` - Full deployment guide
2. `QUICK_REFERENCE.md` - Common commands
3. `STATUS.md` - System status
4. http://localhost:8000/docs - API documentation

**Common commands:**
```bash
# View all logs
docker compose logs -f

# Restart everything
docker compose restart

# Stop everything
docker compose down

# Fresh start (deletes data!)
docker compose down -v && docker compose up -d
```

---

## 🎯 Verification Commands

**Quick health check:**
```bash
# 1. Check containers
docker compose ps

# 2. Check backend
curl http://localhost:8000/health

# 3. Check database
docker compose exec db psql -U daflegal -d daflegal -c "SELECT COUNT(*) FROM users;"

# 4. Check worker
docker compose logs worker | tail -5
```

---

**Startup Checklist v1.0**
**Last Updated:** 2025-10-18

---

## ⏱️ Typical Startup Timeline

| Time | What's Happening |
|------|------------------|
| 0s | `docker compose up -d` command run |
| 5s | Containers created and starting |
| 10s | PostgreSQL initializing |
| 15s | Redis ready |
| 20s | Database tables created |
| 25s | Backend API starting |
| 30s | Backend ready (health check works) |
| 35s | Frontend compiling |
| 45s | Frontend ready |
| 60s | Worker connected and ready |

**First time:** Add 2-5 minutes for image downloads

---

**🎉 You're ready to use DafLegal!**

**Bookmark these URLs:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
