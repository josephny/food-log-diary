# Quick Start: Deploy to Render.com

Follow these steps in order. Estimated time: 30-45 minutes.

## Prerequisites Checklist

- ✅ Render.com account (you have this!)
- ✅ GitHub account (you have this!)
- ⏳ USDA API key (get this in Step 1)

---

## Step 1: Get Your USDA API Key (5 minutes)

1. Go to: https://fdc.nal.usda.gov/api-guide.html
2. Click **"Get an API Key"** button
3. Fill out the form:
   - Name, email, organization (can be "Personal")
   - Purpose: "Personal food tracking application"
4. Submit the form
5. **Copy your API key** - you'll need it in Step 6
   - It looks like: `abc123def456ghi789...`

**Note:** You can proceed with other steps while waiting for the API key email (usually instant).

---

## Step 2: Push Your Code to GitHub (10 minutes)

### 2.1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `food-log-diary` (or any name you like)
3. Description: "Food log diary with nutrition tracking"
4. Choose: **Private** (recommended) or Public
5. **DO NOT** check "Initialize with README" (we already have files)
6. Click **"Create repository"**

### 2.2: Push Your Code

Open PowerShell or Command Prompt in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Food log diary app"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/food-log-diary.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

**If you get authentication errors:**
- GitHub may ask for username/password
- Use a **Personal Access Token** instead of password
- Create one at: https://github.com/settings/tokens
- Select scope: `repo` (full control)

---

## Step 3: Create PostgreSQL Database on Render (5 minutes)

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name**: `food-log-db`
   - **Database**: `food_log`
   - **User**: `food_log_user`
   - **Region**: Choose closest to you (e.g., "Oregon (US West)")
   - **PostgreSQL Version**: 15 (or latest)
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **Wait 2-3 minutes** for database to be created
6. **Important:** Click on the database, then copy the **"Internal Database URL"**
   - It looks like: `postgresql://food_log_user:password@dpg-xxxxx-a/food_log`
   - **Save this!** You'll need it in Step 5

---

## Step 4: Deploy Backend Service (10 minutes)

### 4.1: Create Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect account"** if prompted (connect GitHub)
3. Select your repository: `food-log-diary` (or whatever you named it)
4. Click **"Connect"**

### 4.2: Configure Backend

Fill in the form:

- **Name**: `food-log-backend`
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: Leave **empty** (or type `server` if it doesn't work)
- **Environment**: **Node**
- **Build Command**: 
  ```
  cd server && npm install && npm run build
  ```
- **Start Command**: 
  ```
  cd server && npm start
  ```

### 4.3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **4 variables**:

1. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

2. **PORT**
   - Key: `PORT`
   - Value: `3001`

3. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: Paste the **Internal Database URL** from Step 3

4. **USDA_API_KEY**
   - Key: `USDA_API_KEY`
   - Value: Paste your API key from Step 1

### 4.4: Deploy

1. Scroll down
2. Click **"Create Web Service"**
3. **Wait 3-5 minutes** for deployment
4. Watch the logs - it should show "Build successful" and "Your service is live"
5. **Copy the service URL** (e.g., `https://food-log-backend.onrender.com`)
   - **Save this!** You'll need it in Step 5

**Note:** First deployment takes longer. Subsequent deployments are faster.

---

## Step 5: Deploy Frontend Service (10 minutes)

### 5.1: Create Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select your repository: `food-log-diary`
3. Click **"Connect"**

### 5.2: Configure Frontend

Fill in the form:

- **Name**: `food-log-frontend`
- **Branch**: `main`
- **Root Directory**: Leave **empty**
- **Build Command**: 
  ```
  cd client && npm install && npm run build
  ```
- **Publish Directory**: 
  ```
  client/dist
  ```

### 5.3: Add Environment Variable

Click **"Add Environment Variable"**:

- **Key**: `VITE_API_URL`
- **Value**: Your backend URL from Step 4
  - Example: `https://food-log-backend.onrender.com`
  - **Important:** No trailing slash, no `/api` at the end!

### 5.4: Deploy

1. Click **"Create Static Site"**
2. **Wait 3-5 minutes** for deployment
3. **Copy the frontend URL** (e.g., `https://food-log-frontend.onrender.com`)

---

## Step 6: Test Your App! (5 minutes)

1. Open your **frontend URL** in a browser
2. You should see the Food Log Diary interface
3. Try adding a food entry:
   - Go to "Add Food" tab
   - Search for "apple"
   - Select a result
   - Enter amount: `100`, unit: `g`
   - Click "Add Food Entry"
4. Check the Dashboard to see your entry

**If it works:** 🎉 **Congratulations! Your app is live!**

---

## Troubleshooting

### Backend won't start

**Check logs in Render dashboard:**
- Look for error messages
- Common issues:
  - Missing environment variables → Check Step 4.3
  - Build failed → Check build command is correct
  - Database connection error → Check DATABASE_URL is correct

### Frontend can't connect to backend

**Symptoms:** Food search doesn't work, entries don't save

**Fix:**
1. Check `VITE_API_URL` in frontend environment variables
2. Should be: `https://food-log-backend.onrender.com` (no `/api`)
3. Rebuild frontend after changing environment variable

### Database connection errors

**Fix:**
1. Make sure you used **Internal Database URL** (not External)
2. Check database is running (green status in Render)
3. Verify DATABASE_URL environment variable is set correctly

### Build errors

**Common fixes:**
- Make sure Root Directory is correct (empty or `server` for backend)
- Check build commands are exactly as shown
- Check that all files were pushed to GitHub

---

## Success Checklist

- ✅ Backend service is running (green status)
- ✅ Frontend site is live
- ✅ Can search for foods
- ✅ Can add food entries
- ✅ Can view dashboard
- ✅ Data persists (refresh page, data still there)

---

## Next Steps

1. **Bookmark your frontend URL** - This is your app!
2. **Access from iPhone:**
   - Open Safari
   - Go to your frontend URL
   - Add to Home Screen (Share → Add to Home Screen)
3. **Optional:** Set up custom domain in Render settings

---

## Need Help?

If you get stuck:
1. Check the logs in Render dashboard (click on your service)
2. Look for error messages
3. Common issues are listed above

**You're almost there!** 🚀


