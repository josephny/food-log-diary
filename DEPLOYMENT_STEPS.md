# Step-by-Step Deployment Guide for Render.com

## Prerequisites

1. **GitHub Account** (free) - https://github.com
2. **Render.com Account** (free) - https://render.com
3. **USDA API Key** (free) - https://fdc.nal.usda.gov/api-guide.html

## Step 1: Get Your USDA API Key

1. Go to https://fdc.nal.usda.gov/api-guide.html
2. Click "Get an API Key"
3. Fill out the form (it's free, no credit card needed)
4. Copy your API key - you'll need it in Step 6

## Step 2: Push Code to GitHub

1. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Name it: `food-log-diary` (or any name you like)
   - Make it **Private** (recommended) or Public
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   # In your project directory
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/food-log-diary.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `food-log-db`
   - **Database**: `food_log`
   - **User**: `food_log_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click "Create Database"
5. **Important**: Copy the "Internal Database URL" - you'll need this

## Step 4: Deploy Backend Service

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `food-log-diary` repository
4. Configure:
   - **Name**: `food-log-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty (or set to `server` if needed)

5. **Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add these:
     ```
     NODE_ENV = production
     PORT = 3001
     DATABASE_URL = (paste the Internal Database URL from Step 3)
     USDA_API_KEY = (paste your API key from Step 1)
     ```

6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. **Copy the service URL** (e.g., `https://food-log-backend.onrender.com`)

## Step 5: Deploy Frontend Service

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository (same one)
3. Configure:
   - **Name**: `food-log-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. **Environment Variables:**
   - `VITE_API_URL` = (paste your backend URL from Step 4, e.g., `https://food-log-backend.onrender.com`)

5. Click "Create Static Site"
6. Wait for deployment (2-3 minutes)
7. **Copy the frontend URL** (e.g., `https://food-log-frontend.onrender.com`)

## Step 6: Test Your Deployment

1. Open your frontend URL in a browser
2. Try adding a food entry
3. Check that it saves correctly

## Troubleshooting

### Backend won't start
- Check the logs in Render dashboard
- Make sure `DATABASE_URL` is set correctly
- Verify `USDA_API_KEY` is set

### Frontend can't connect to backend
- Check that `VITE_API_URL` in frontend matches your backend URL
- Make sure backend URL doesn't have `/api` at the end
- Check browser console for CORS errors

### Database connection errors
- Verify `DATABASE_URL` uses the "Internal Database URL" from Render
- Make sure database is running (check Render dashboard)

## Important Notes

1. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds (wake-up time)
   - Database: 90 days data retention on free tier

2. **Upgrading (Optional):**
   - $7/month for always-on backend
   - $7/month for persistent database storage
   - Not required for personal use!

3. **Custom Domain (Optional):**
   - You can add a custom domain in Render settings
   - Free SSL certificate included

## Success!

Your app is now live and accessible from anywhere! Share the frontend URL with yourself to access from your iPhone.


