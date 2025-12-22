# Quick Deployment Guide - All Services

Complete deployment guide for the MLM Real Estate Platform on Render.

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Deploy Everything with Blueprint (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to Render**
   - Visit: https://dashboard.render.com
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Click **"Apply"**

3. **Done!** Render will deploy:
   - PostgreSQL Database
   - Backend API
   - Admin Panel
   - User Portal

---

## 📦 What Gets Deployed

| Service | Type | URL Example | Status |
|---------|------|-------------|--------|
| **Database** | PostgreSQL | Internal only | ✅ Ready |
| **Backend** | Node.js API | `mlm-backend-ljan.onrender.com` | ✅ Deployed |
| **Admin Panel** | React Static | `mlm-admin-panel.onrender.com` | ⏳ Pending |
| **User Portal** | React Static | `mlm-user-panel.onrender.com` | ⏳ Pending |

---

## 🔧 Manual Deployment (If Needed)

### 1. Backend API (Already Deployed)

**Current Status**: ✅ Running at `https://mlm-backend-ljan.onrender.com`

**Environment Variables Needed**:
```env
NODE_ENV=production
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRE=7d
UNIVERSAL_SPONSOR_CODE=ADMIN001
CLOUDINARY_CLOUD_NAME=dxbvjvtoz
CLOUDINARY_API_KEY=377754216812516
CLOUDINARY_API_SECRET=DTcmDBX-ya5z08nfuSZhK3auRGA
DATABASE_URL=(auto-injected by Render)
```

### 2. Admin Panel Deployment

**Steps**:
1. New Static Site
2. Root Directory: `react-admin-panel`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add Rewrite Rule: `/* → /index.html`

**Environment Variables**:
```env
VITE_API_URL=https://mlm-backend-ljan.onrender.com/api/v1
```

### 3. User Portal Deployment

**Steps**:
1. New Static Site
2. Root Directory: `react-user-panel`
3. Build Command: `npm run render-build`
4. Publish Directory: `dist`
5. Add Rewrite Rule: `/* → /index.html`

**Environment Variables**:
```env
VITE_API_URL=https://mlm-backend-ljan.onrender.com/api/v1
```

---

## ⚙️ Post-Deployment Configuration

### Step 1: Update CORS in Backend

Once frontends are deployed, update backend CORS:

**In Render Backend → Environment**:
```env
CORS_ORIGINS=https://mlm-admin-panel.onrender.com,https://mlm-user-panel.onrender.com
```

Or edit `backend-node/src/app.js`:
```javascript
app.use(cors({
    origin: [
        'https://mlm-admin-panel.onrender.com',
        'https://mlm-user-panel.onrender.com'
    ],
    credentials: true
}));
```

### Step 2: Test All Services

**Backend Health Check**:
```bash
curl https://mlm-backend-ljan.onrender.com/api/v1/health
```

**Admin Panel**:
1. Visit: `https://mlm-admin-panel.onrender.com`
2. Login with admin credentials
3. Check dashboard loads

**User Portal**:
1. Visit: `https://mlm-user-panel.onrender.com`
2. Try registration/login
3. Verify API calls work

---

## 🐛 Common Issues & Fixes

### Issue 1: Build Fails with Dependency Errors

**Error**: `npm install` fails or peer dependency conflicts

**Fix**:
```json
// Use render-build script in package.json
"render-build": "rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build"
```

### Issue 2: 404 on Page Refresh

**Error**: SPA routes return 404

**Fix**: Add rewrite rule in Render:
```
Source: /*
Destination: /index.html
Type: Rewrite
```

### Issue 3: CORS Errors

**Error**: Browser console shows CORS policy errors

**Fix**: Update backend CORS origins (see Step 1 above)

### Issue 4: API Calls Fail

**Error**: Network errors or 500 errors

**Fix**:
1. Check backend environment variables are set
2. Verify DATABASE_URL is connected
3. Check backend logs for errors

### Issue 5: Images Not Loading (Cloudinary)

**Error**: Property/user images broken

**Fix**: Verify Cloudinary credentials in backend env:
```env
CLOUDINARY_CLOUD_NAME=dxbvjvtoz
CLOUDINARY_API_KEY=377754216812516
CLOUDINARY_API_SECRET=DTcmDBX-ya5z08nfuSZhK3auRGA
```

---

## 📊 Monitoring

### Check Service Status

**Render Dashboard** → Each service shows:
- 🟢 Green: Running
- 🟡 Yellow: Building
- 🔴 Red: Failed

### View Logs

1. Select service in Render dashboard
2. Click **"Logs"** tab
3. Filter by time/search

### Backend Logs
```bash
# Shows server startup, API calls, errors
Render Dashboard → mlm-backend → Logs
```

### Build Logs
```bash
# Shows npm install, build process
Render Dashboard → [service] → Logs → Filter: Build
```

---

## 💰 Costs Summary

### Free Tier (Current)

- ✅ **PostgreSQL**: Free tier (expires after 90 days, then $7/month)
- ✅ **Backend**: Free tier (spins down after 15 min inactivity)
- ✅ **Admin Panel**: FREE (static sites always free)
- ✅ **User Portal**: FREE (static sites always free)

### Recommended Paid Plans

**For Production**:
- **PostgreSQL**: $7/month (Starter)
- **Backend**: $7/month (Starter - no spin down)
- **Total**: ~$14/month

### Free Tier Limitations

- Backend spins down after 15 minutes (50 sec cold start)
- Database limited to 256MB storage
- 100GB bandwidth/month

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Database has strong password
- [ ] CORS origins properly configured
- [ ] HTTPS enabled (automatic on Render)
- [ ] Environment variables not in code
- [ ] `.env` files in `.gitignore`
- [ ] API rate limiting configured
- [ ] Input validation on backend
- [ ] SQL injection prevention (Sequelize ORM)
- [ ] XSS protection (React auto-escape)

---

## 🔄 Update/Redeploy

### Auto Deploy (Recommended)

Render auto-deploys on git push:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploy

1. Render Dashboard → Service
2. **"Manual Deploy"** → **"Deploy latest commit"**

### Rollback

1. Render Dashboard → Service → **"Events"**
2. Find previous deployment
3. Click **"Redeploy"**

---

## 🎯 Production Checklist

Before going live:

### Backend
- [ ] Environment variables set
- [ ] Database connected
- [ ] Health check passing
- [ ] Cloudinary configured
- [ ] CORS configured

### Frontend (Admin + User)
- [ ] Build successful
- [ ] Rewrite rules configured
- [ ] API URL correct
- [ ] Login works
- [ ] All pages load
- [ ] Images upload to Cloudinary

### Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] Properties display
- [ ] Investment flow works
- [ ] Commission calculation correct
- [ ] Withdrawals work
- [ ] Mobile responsive

### Performance
- [ ] Backend response time < 500ms
- [ ] Frontend load time < 3s
- [ ] Images optimized
- [ ] Caching configured

---

## 📝 Quick Reference

### Render Dashboard
https://dashboard.render.com

### Current Services

| Service | URL |
|---------|-----|
| Backend API | https://mlm-backend-ljan.onrender.com |
| Admin Panel | (To be deployed) |
| User Portal | (To be deployed) |

### GitHub Repository
Your repository should have:
- `render.yaml` - Blueprint configuration
- All code pushed to main branch
- `.gitignore` excludes `.env` files

---

## 🆘 Getting Help

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com
- Support: Email from dashboard

### Project Issues
- Check backend logs first
- Verify environment variables
- Test API endpoints directly
- Check browser console for frontend errors

---

## 🎉 Next Steps

After deployment:
1. ✅ Test all functionality
2. ✅ Add custom domains (optional)
3. ✅ Set up monitoring/alerts
4. ✅ Configure backups
5. ✅ Train admin users
6. ✅ Launch to users!

---

**Your platform is ready for deployment!** 🚀

Follow the steps above, and you'll have a fully functional MLM Real Estate platform running on Render in minutes.
