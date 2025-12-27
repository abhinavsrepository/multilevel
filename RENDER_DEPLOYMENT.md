# Render Deployment Guide

## 🚀 Quick Fix for Current Deployment Issues

### Issue 1: Frontend Files Not Found (404 Errors)

**Problem:** Backend can't find `react-user-panel/dist/index.html` and `react-admin-panel/dist/index.html`

**Solution:** The frontend builds are now automated via `postinstall` script in `backend-node/package.json`

### Issue 2: Property Sales API 500 Error

**Problem:** `property_sales` table doesn't exist in production database

**Solution:** Run the database sync script after deployment

---

## 📋 Render Configuration

### Build Command
```bash
cd backend-node && npm install
```

### Start Command
```bash
cd backend-node && npm start
```

### Environment Variables
Make sure these are set in your Render dashboard:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV=production`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- All other required environment variables from your `.env`

---

## 🔧 Post-Deployment Steps

### Step 1: Sync Database (Create Missing Tables)

After your Render deployment completes, run this command via Render Shell:

```bash
cd backend-node && npm run sync:db:production
```

This will:
- ✅ Create the `property_sales` table
- ✅ Update any existing tables with new columns
- ✅ Fix the 500 error on `/api/v1/property-sales/my-sales`

### Step 2: Verify Deployment

1. **Check Frontend Loads:**
   - Visit: `https://mlm-backend-ljan.onrender.com/`
   - Should see: User Panel (React app)
   - Visit: `https://mlm-backend-ljan.onrender.com/admin/`
   - Should see: Admin Panel (React app)

2. **Check API Works:**
   - Visit: `https://mlm-backend-ljan.onrender.com/api/v1/health`
   - Should see: `{"status":"ok"}`

3. **Check Property Sales API:**
   - After database sync, test: `/api/v1/property-sales/my-sales?page=1&limit=50`
   - Should return: `{"success":true,"data":[],...}` (or actual data)

---

## 🛠️ How It Works

### Frontend Build Process

The `postinstall` script in `backend-node/package.json` automatically:

1. **Navigates to `react-user-panel`**
   - Runs `npm install`
   - Runs `npm run build`
   - Creates `react-user-panel/dist/` folder

2. **Navigates to `react-admin-panel`**
   - Runs `npm install`
   - Runs `npm run build`
   - Creates `react-admin-panel/dist/` folder

3. **Backend serves these dist folders:**
   - User Panel: `http://localhost:10000/` → serves `react-user-panel/dist/index.html`
   - Admin Panel: `http://localhost:10000/admin/` → serves `react-admin-panel/dist/index.html`

### Database Sync

The `sync:db:production` script:
- Uses Sequelize's `sync({ alter: true })` method
- Creates missing tables (like `property_sales`)
- Adds missing columns to existing tables
- **Does NOT drop or lose data** (safe to run)

---

## 🚨 Troubleshooting

### "Frontend build failed, continuing..."

If you see this warning during Render build:
1. Check Render build logs for npm errors
2. Ensure both frontend folders have valid `package.json`
3. Check if there are missing dependencies

### Database Connection Errors

If database sync fails:
1. Verify `DATABASE_URL` is set correctly in Render
2. Check PostgreSQL service is running
3. Ensure database allows connections from Render IP

### 404 on Refresh

If you get 404 when refreshing `/admin/*` or other routes:
1. Verify `vite.config.ts` in `react-admin-panel` has `base: '/admin/'`
2. Ensure backend `app.js` serves correct index.html for `/admin` routes
3. Check that dist folders were built correctly

---

## 📝 Manual Deployment (If Needed)

If automatic build doesn't work, you can manually deploy:

### 1. Build Locally
```bash
# In react-user-panel
npm install
npm run build

# In react-admin-panel
npm install
npm run build
```

### 2. Commit dist folders
```bash
git add react-user-panel/dist react-admin-panel/dist
git commit -m "Add production builds"
git push
```

### 3. Trigger Render Redeploy
- Go to Render Dashboard
- Click "Manual Deploy" → "Deploy latest commit"

---

## ✅ Verification Checklist

- [ ] Render build completes successfully
- [ ] No "ENOENT: no such file or directory" errors in logs
- [ ] User Panel loads at root URL
- [ ] Admin Panel loads at `/admin/` URL
- [ ] SPA routing works (no 404 on refresh)
- [ ] Database sync completed without errors
- [ ] Property Sales API returns 200 (not 500)
- [ ] All API endpoints working correctly

---

## 🔄 Future Deployments

For future deployments:
1. Make code changes
2. Commit and push to Git
3. Render will automatically:
   - Install backend dependencies
   - Run `postinstall` → builds both frontends
   - Start the server
4. If database schema changed, run: `npm run sync:db:production`

---

## 📞 Need Help?

If issues persist:
1. Check Render deployment logs
2. Check Render runtime logs
3. Use Render Shell to inspect file system: `ls -la react-user-panel/dist`
4. Verify environment variables are set correctly
