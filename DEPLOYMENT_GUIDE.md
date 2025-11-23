# Cloud Deployment Guide

## Comparison of Cloud Services for Your Food Log App

### Quick Comparison Table

| Service | Free Tier | Ease of Use | Best For | Database | Notes |
|---------|-----------|-------------|----------|----------|-------|
| **Render.com** ⭐ | ✅ Yes | ⭐⭐⭐⭐⭐ | Full-stack apps | PostgreSQL (free) | **RECOMMENDED** - Easiest, best free tier |
| **Railway.app** | ✅ Yes ($5 credit/month) | ⭐⭐⭐⭐⭐ | Full-stack apps | PostgreSQL (free) | Very easy, but credit expires |
| **Fly.io** | ✅ Yes | ⭐⭐⭐⭐ | Global deployment | PostgreSQL (paid) | Good performance, more complex |
| **Vercel** | ✅ Yes | ⭐⭐⭐⭐ | Frontend only | Separate service needed | Great for frontend, backend needs separate service |
| **Heroku** | ❌ No | ⭐⭐⭐⭐ | Full-stack apps | PostgreSQL (paid) | Used to be free, now $5/month minimum |

## Recommendation: **Render.com** ⭐

### Why Render.com is Best for You:

1. **Truly Free Tier:**
   - Free web service (spins down after 15 min inactivity, but free)
   - Free PostgreSQL database
   - Free SSL certificate
   - No credit card required

2. **Perfect for Your App:**
   - Supports Node.js backend
   - Supports React frontend
   - Can deploy both together or separately
   - Auto-deploys from GitHub

3. **Easy to Use:**
   - Simple web interface
   - One-click deployments
   - Automatic HTTPS
   - Good documentation

4. **Limitations (Free Tier):**
   - Service spins down after 15 minutes of inactivity (wakes up on first request)
   - 750 hours/month free (enough for personal use)
   - Database: 90 days data retention (upgrade to keep longer)

### Alternative: Railway.app

**Pros:**
- Even simpler interface
- $5 free credit/month (usually enough for small apps)
- Never spins down

**Cons:**
- Credit expires if not used
- May need to add payment method (though free tier should work)

## What You'll Need to Deploy

1. **GitHub Account** (free) - to store your code
2. **Render.com Account** (free)
3. **USDA API Key** (free) - you already need this

## Deployment Steps Overview

1. Push your code to GitHub
2. Connect GitHub to Render
3. Create a PostgreSQL database on Render
4. Update code to use PostgreSQL instead of SQLite
5. Deploy backend service
6. Deploy frontend service
7. Set environment variables (API keys)
8. Done! Get a public URL

## Estimated Time: 30-45 minutes

Would you like me to:
1. **Prepare the code** for cloud deployment (update database, add deployment configs)?
2. **Create step-by-step instructions** for Render.com?
3. **Do both** - prepare everything and guide you through it?


