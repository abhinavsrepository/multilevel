# Environment Variables for Render Deployment

Complete list of environment variables needed for each service on Render.

---

## 1. Backend API (mlm-backend)

**Service Type**: Web Service
**Root Directory**: `backend-node`

### Required Environment Variables

```env
NODE_ENV=production
PORT=5000

# Database (Auto-injected if you link PostgreSQL)
DATABASE_URL=(auto-injected from linked database)

# JWT Authentication
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRE=7d

# Default Sponsor Code
UNIVERSAL_SPONSOR_CODE=ADMIN001

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=dxbvjvtoz
CLOUDINARY_API_KEY=377754216812516
CLOUDINARY_API_SECRET=DTcmDBX-ya5z08nfuSZhK3auRGA

# CORS (Add after frontend deployment)
CORS_ORIGINS=https://mlm-admin-panel.onrender.com,https://mlm-user-panel.onrender.com
```

### Optional Environment Variables

```env
# Email Service (if using email notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Payment Gateway
# RAZORPAY_KEY_ID=your_key_id
# RAZORPAY_KEY_SECRET=your_key_secret

# Logging
# LOG_LEVEL=info
```

---

## 2. Admin Panel (mlm-admin-panel)

**Service Type**: Static Site
**Root Directory**: `react-admin-panel`

### Required Environment Variables

```env
VITE_API_URL=https://mlm-backend-ljan.onrender.com/api/v1
```

### Optional Environment Variables

```env
VITE_APP_NAME=MLM Admin Panel
VITE_APP_VERSION=1.0.0
VITE_ENV=production
```

---

## 3. User Portal (mlm-user-panel)

**Service Type**: Static Site
**Root Directory**: `react-user-panel`

### Required Environment Variables

```env
VITE_API_BASE_URL=https://mlm-backend-ljan.onrender.com/api/v1
VITE_API_TIMEOUT=30000
```

### Optional Environment Variables

```env
# App Configuration
VITE_APP_NAME=MLM Real Estate User Panel
VITE_APP_VERSION=1.0.0
VITE_ENV=production

# Payment Gateway (for user deposits)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Google Maps (for property locations)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Feature Flags
VITE_ENABLE_PWA=false
VITE_ENABLE_SOCIAL_LOGIN=false
```

---

## 4. PostgreSQL Database (mlm-database)

**Service Type**: PostgreSQL
**Plan**: Starter ($7/month) or Free (90 days)

### Auto-Generated

Render automatically creates:
- `DATABASE_URL` - Full connection string
- Database credentials

### Access Info

Will be available in Render Dashboard → Database → Connection Info

---

## How to Add Environment Variables in Render

### For Each Service:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com

2. **Select Your Service**
   - Click on the service name (e.g., `mlm-backend`)

3. **Go to Environment Tab**
   - Click **"Environment"** in the left sidebar

4. **Add Variables**
   - Click **"Add Environment Variable"**
   - Enter **Key** and **Value**
   - Click **"Save Changes"**

5. **Redeploy (if needed)**
   - Service will auto-redeploy when you save
   - Or click **"Manual Deploy"**

---

## Environment Variable Priority

### Backend (Node.js)

1. Render Environment Variables (Highest priority)
2. `.env` file (Not recommended for production)
3. Default values in code

### Frontend (React)

1. Build-time variables from Render
2. `.env` file (Only during build)
3. Hardcoded values in `axiosConfig.ts`

**Important**: Frontend env vars are baked into the build, so you need to redeploy after changing them.

---

## Security Best Practices

### ✅ DO:
- Use strong, unique secrets for `JWT_SECRET`
- Store sensitive values in Render Environment (not in code)
- Use different secrets for dev/staging/production
- Rotate secrets periodically

### ❌ DON'T:
- Commit `.env` files to git
- Hardcode secrets in source code
- Share secrets via email/chat
- Use default/example secrets in production

---

## Testing Environment Variables

### Test Backend Variables

```bash
# Check if backend picks up env vars
curl https://mlm-backend-ljan.onrender.com/api/v1/health

# Check logs in Render Dashboard
# Should show: "Environment: production"
```

### Test Frontend Variables

```javascript
// Open browser console on deployed site
console.log(import.meta.env.VITE_API_BASE_URL)
// Should show: https://mlm-backend-ljan.onrender.com/api/v1
```

---

## Common Issues

### Issue 1: Backend can't connect to database

**Symptom**: `FATAL ERROR - Failed to start server`

**Fix**: Ensure `DATABASE_URL` is linked from PostgreSQL service

### Issue 2: CORS errors

**Symptom**: Browser console shows CORS policy errors

**Fix**: Set `CORS_ORIGINS` in backend to include frontend URLs

### Issue 3: Frontend can't reach API

**Symptom**: Network errors, 404s

**Fix**: Verify `VITE_API_BASE_URL` is correct and rebuild

### Issue 4: Cloudinary uploads fail

**Symptom**: 500 errors on image upload

**Fix**: Check Cloudinary credentials in backend env vars

---

## Quick Copy-Paste for Render

### Backend (mlm-backend)

```
NODE_ENV=production
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRE=7d
UNIVERSAL_SPONSOR_CODE=ADMIN001
CLOUDINARY_CLOUD_NAME=dxbvjvtoz
CLOUDINARY_API_KEY=377754216812516
CLOUDINARY_API_SECRET=DTcmDBX-ya5z08nfuSZhK3auRGA
```

### Admin Panel (mlm-admin-panel)

```
VITE_API_URL=https://mlm-backend-ljan.onrender.com/api/v1
```

### User Portal (mlm-user-panel)

```
VITE_API_BASE_URL=https://mlm-backend-ljan.onrender.com/api/v1
VITE_API_TIMEOUT=30000
VITE_APP_NAME=MLM Real Estate User Panel
VITE_ENV=production
```

---

## Verification Checklist

After setting environment variables:

### Backend
- [ ] `NODE_ENV` = production
- [ ] `JWT_SECRET` is set and unique
- [ ] `DATABASE_URL` is linked
- [ ] Cloudinary credentials are set
- [ ] `CORS_ORIGINS` includes frontend URLs
- [ ] Service redeployed successfully
- [ ] Health check passing

### Admin Panel
- [ ] `VITE_API_URL` is correct
- [ ] Build successful
- [ ] Can login to admin panel
- [ ] API calls work

### User Portal
- [ ] `VITE_API_BASE_URL` is correct
- [ ] Build successful
- [ ] Can register/login
- [ ] API calls work
- [ ] Images upload correctly

---

**All environment variables are now documented and ready for Render deployment!** 🎉
