# Quick Fix Guide: Database Connection Error on Render

## Problem
Your backend is failing to connect to the PostgreSQL database with error:
```
SequelizeConnectionRefusedError: ECONNREFUSED
```

## Root Cause
The `render.yaml` configuration had an invalid database service definition, and the database configuration wasn't properly set up to use Render's `DATABASE_URL` connection string.

## What Was Fixed

### 1. Updated `render.yaml`
- Fixed the PostgreSQL service definition syntax
- Changed environment variables to use `DATABASE_URL` instead of individual DB variables
- Added Cloudinary environment variable placeholders

### 2. Updated `backend-node/src/config/database.js`
- Added support for `DATABASE_URL` connection string (Render's standard)
- Automatically parses the connection string in production
- Configures SSL automatically for production environments
- Falls back to individual environment variables for local development

### 3. Updated `backend-node/.env.example`
- Added documentation for both `DATABASE_URL` and individual variables
- Clarified when to use each option

## Steps to Fix Your Render Deployment

### Option 1: Using the Blueprint (Recommended - Fresh Start)

1. **Delete existing services on Render** (if they exist):
   - Go to each service → Settings → Delete Service

2. **Push the updated code to GitHub**:
   ```bash
   git add .
   git commit -m "Fix database configuration for Render deployment"
   git push origin main
   ```

3. **Deploy using the Blueprint**:
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your repository
   - Select your repository
   - Render will automatically create all services from `render.yaml`
   - Wait for all services to be created

4. **Set Manual Environment Variables**:
   - Go to `mlm-backend` service → Environment
   - Set the following variables (marked as `sync: false` in the blueprint):
     ```
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```
   - After frontends are deployed, update:
     ```
     CORS_ORIGINS=https://mlm-admin-panel.onrender.com,https://mlm-user-panel.onrender.com
     ```

5. **Set Frontend Environment Variables**:
   - Go to `mlm-admin-panel` → Environment
     ```
     VITE_API_URL=https://mlm-backend.onrender.com/api/v1
     ```
   - Go to `mlm-user-panel` → Environment
     ```
     VITE_API_URL=https://mlm-backend.onrender.com/api/v1
     ```

### Option 2: Manual Fix (Existing Services)

If you want to keep your existing services:

1. **Push the updated code**:
   ```bash
   git add .
   git commit -m "Fix database configuration for Render deployment"
   git push origin main
   ```

2. **Fix Backend Environment Variables**:
   - Go to Render Dashboard → Your Backend Service → Environment
   - **Remove** these variables if they exist:
     - `DB_HOST`
     - `DB_PORT`
     - `DB_NAME`
     - `DB_USER`
     - `DB_PASS`

   - **Add** the database connection:
     - Click "Add Environment Variable"
     - Click "Add from Database"
     - Select your PostgreSQL database
     - Choose "Connection String" (this creates `DATABASE_URL`)

   - **Ensure these exist**:
     ```
     NODE_ENV=production
     PORT=5000
     JWT_SECRET=<your-generated-secret>
     JWT_EXPIRE=7d
     UNIVERSAL_SPONSOR_CODE=ADMIN001
     CLOUDINARY_CLOUD_NAME=<your-value>
     CLOUDINARY_API_KEY=<your-value>
     CLOUDINARY_API_SECRET=<your-value>
     ```

3. **Verify Database is Running**:
   - Go to Render Dashboard → Your Database Service
   - Ensure status is "Available"
   - Check that it's in the same region as your backend

4. **Trigger Redeploy**:
   - Go to Backend Service → Manual Deploy → "Deploy latest commit"
   - Watch the logs for successful database connection

## How to Verify It's Working

1. **Check Backend Logs**:
   - Go to Backend Service → Logs
   - Look for these messages:
     ```
     ✓ Database connection established successfully
     ✓ Database synchronized successfully
     ✓ Server is running on port 5000
     ```

2. **Test Health Endpoint**:
   - Visit: `https://your-backend-url.onrender.com/api/v1/health`
   - Should return:
     ```json
     {
       "status": "healthy",
       "database": "connected",
       "timestamp": "2025-12-17T..."
     }
     ```

3. **Check Environment Variables**:
   - Backend Service → Environment tab
   - Verify `DATABASE_URL` shows "Linked from mlm-database"
   - Should look like: `postgresql://user:pass@host/db`

## Common Issues After Fix

### Issue: Still getting ECONNREFUSED

**Solution:**
1. Verify `DATABASE_URL` is correctly linked
2. Check database is running and in "Available" status
3. Ensure database and backend are in the same region
4. Check if there's a typo in the service name linkage

### Issue: SSL/TLS Connection Error

**Solution:**
- Verify `NODE_ENV=production` is set
- The updated config automatically handles SSL
- Redeploy if you updated the code after setting env vars

### Issue: Tables not created

**Solution:**
- Check logs during startup
- The app auto-creates tables on first successful connection
- If needed, you can force sync by temporarily changing in `server.js`:
  ```javascript
  await sequelize.sync({ force: false, alter: true });
  ```

## Next Steps After Successful Deployment

1. **Set up Cloudinary** (for image uploads):
   - Create account at cloudinary.com
   - Get your credentials
   - Add to backend environment variables

2. **Update CORS Origins**:
   - After frontends deploy, update backend:
   ```
   CORS_ORIGINS=https://your-admin.onrender.com,https://your-user.onrender.com
   ```

3. **Create Admin User**:
   - Connect to your database or use an API seed endpoint
   - Create the first admin user with code `ADMIN001`

4. **Set up Custom Domains** (optional):
   - Backend: `api.yourdomain.com`
   - Admin: `admin.yourdomain.com`
   - User: `app.yourdomain.com` or `www.yourdomain.com`

## Cost Estimate

**Free Tier:**
- Backend: Free (spins down after 15 min inactivity)
- Database: Free (90-day limit, then deleted)
- Frontends: Free (always on)

**Recommended for Production:**
- Backend: Starter ($7/month) - No spin down
- Database: Starter ($7/month) - Persistent
- Frontends: Free
- **Total: ~$14/month**

## Support Resources

- **Render Documentation**: https://render.com/docs
- **Full Deployment Guide**: See `DEPLOYMENT_RENDER.md` in this repo
- **Render Community**: https://community.render.com

---

**Last Updated**: 2025-12-17
**Issue**: Database connection refused
**Status**: ✅ Fixed - Code updated, awaiting redeployment
