# Migration Guide: Render.com → VPS

## Good News: **Zero Code Changes Needed!** 🎉

Your app is already designed to be **100% portable**. Here's why and how to migrate.

## Why No Rewriting is Needed

### ✅ **Already Portable Features:**

1. **Environment Variables** - All configuration uses `process.env`
   - Database: `DATABASE_URL`
   - Port: `PORT`
   - API Keys: `USDA_API_KEY`
   - No hardcoded values!

2. **Database Abstraction** - Automatically detects database type
   - Works with PostgreSQL (Render) or PostgreSQL (VPS)
   - Same code, different connection string

3. **No Platform-Specific Code**
   - No Render.com-specific APIs
   - Standard Node.js/Express
   - Works anywhere Node.js runs

4. **Frontend is Static**
   - Just HTML/CSS/JS files
   - Works with any web server (Nginx, Apache, etc.)

## Migration Steps (30-60 minutes)

### Step 1: Export Data from Render (5 min)

```bash
# Connect to Render PostgreSQL and export
pg_dump $DATABASE_URL > backup.sql
```

Or use Render's dashboard to export the database.

### Step 2: Set Up VPS (20-30 min)

1. Install Node.js, PostgreSQL, Nginx
2. Clone your GitHub repository
3. Install dependencies: `npm install`

### Step 3: Configure Environment Variables (5 min)

Create `.env` file on VPS:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/food_log
USDA_API_KEY=your_api_key_here
```

### Step 4: Import Data (5 min)

```bash
# Import your data
psql $DATABASE_URL < backup.sql
```

### Step 5: Start Services (5 min)

```bash
# Build and start
cd server && npm run build && npm start

# Or use PM2 for process management
pm2 start dist/index.js --name food-log
```

### Step 6: Configure Nginx (5 min)

Point Nginx to your frontend and backend. Done!

## What Changes? (Just Configuration)

| Item | Render.com | VPS | Change Needed? |
|------|------------|-----|----------------|
| **Database** | PostgreSQL (managed) | PostgreSQL (self-hosted) | ✅ Just connection string |
| **Backend** | Auto-deployed | Manual/PM2 | ✅ Just deployment method |
| **Frontend** | Static hosting | Nginx | ✅ Just web server config |
| **Code** | Same | Same | ❌ **No changes!** |
| **Environment** | Dashboard | `.env` file | ✅ Just where you set it |

## Code Comparison

### Render.com Setup:
```bash
# Environment variables set in Render dashboard
DATABASE_URL=postgresql://... (from Render)
USDA_API_KEY=your_key
```

### VPS Setup:
```bash
# Same environment variables, just in .env file
DATABASE_URL=postgresql://user:pass@localhost:5432/food_log
USDA_API_KEY=your_key
```

**The code is identical!** Just where you store the config changes.

## Database Migration

### Option 1: pg_dump (Recommended)
```bash
# From Render
pg_dump $RENDER_DATABASE_URL > backup.sql

# To VPS
psql $VPS_DATABASE_URL < backup.sql
```

### Option 2: Render Dashboard
1. Export database from Render dashboard
2. Import to VPS PostgreSQL
3. Done!

## Frontend Migration

### Render.com:
- Built automatically
- Served by Render's CDN

### VPS:
```bash
cd client
npm install
npm run build
# Copy dist/ to Nginx web root
```

**Same build process, just different hosting!**

## Backend Migration

### Render.com:
- Auto-deploys from GitHub
- Managed by Render

### VPS:
```bash
cd server
npm install
npm run build
npm start
# Or use PM2: pm2 start dist/index.js
```

**Same code, just different process manager!**

## Testing After Migration

1. ✅ Check backend health: `curl http://your-vps-ip:3001/api/health`
2. ✅ Test food entry
3. ✅ Test blood sugar entry
4. ✅ Verify data imported correctly
5. ✅ Check frontend loads

## Rollback Plan

If something goes wrong:
1. Keep Render.com running during migration
2. Test VPS thoroughly
3. Only switch DNS/domain after testing
4. Can always rollback to Render.com

## Time Estimate

- **Data export**: 5 minutes
- **VPS setup**: 20-30 minutes
- **Configuration**: 10 minutes
- **Testing**: 10 minutes
- **Total**: ~45-60 minutes

**Much faster than rewriting!**

## What Makes Your App Portable

### ✅ Good Practices Already in Place:

1. **Environment Variables**
   ```typescript
   const DATABASE_URL = process.env.DATABASE_URL;
   const PORT = process.env.PORT || 3001;
   ```

2. **Database Abstraction**
   ```typescript
   // Automatically uses PostgreSQL when DATABASE_URL is set
   const USE_POSTGRES = !!DATABASE_URL;
   ```

3. **No Hardcoded URLs**
   ```typescript
   // Frontend uses environment variable
   const API_BASE = import.meta.env.VITE_API_URL || '/api';
   ```

4. **Standard Technologies**
   - Node.js (works everywhere)
   - Express (standard framework)
   - PostgreSQL (standard database)
   - React (standard frontend)

## Comparison: Rewriting vs Migration

### If You Had to Rewrite:
- ❌ Change database code
- ❌ Update connection strings
- ❌ Modify deployment configs
- ❌ Test everything again
- ⏱️ **4-8 hours of work**

### With Current Design:
- ✅ Just change environment variables
- ✅ Export/import database
- ✅ Deploy to new server
- ⏱️ **45-60 minutes**

## Bottom Line

**Your app is already portable!** 

- ✅ No code changes needed
- ✅ Just configuration changes
- ✅ Easy migration process
- ✅ Can switch anytime

**Start with Render.com, migrate to VPS later when/if needed. Zero risk!**

## Need Help?

I can create:
1. **VPS setup guide** (step-by-step)
2. **Migration script** (automated data transfer)
3. **PM2 configuration** (process management)
4. **Nginx configuration** (web server setup)

Just ask! 🚀


