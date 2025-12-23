# Customer Portal (User Panel) Deployment Guide for Render

This guide walks you through deploying the React User Panel to Render.

## Overview

- **Location**: `react-user-panel/`
- **Technology**: React + TypeScript + Vite + Material-UI
- **Backend API**: https://mlm-backend-ljan.onrender.com/api/v1
- **Build Output**: `dist/`

---

## Prerequisites

✅ Backend already deployed at: https://mlm-backend-ljan.onrender.com
✅ GitHub repository with latest code pushed

---

## Deployment Methods

### Method 1: Using Render Blueprint (Recommended)

Your project already has a `render.yaml` file configured. Render can automatically deploy all services.

#### Steps:

1. **Go to Render Dashboard**
   Visit: https://dashboard.render.com

2. **Create New Blueprint**
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically

3. **Review Services**
   The blueprint will create:
   - ✅ `mlm-database` (PostgreSQL)
   - ✅ `mlm-backend` (Node.js)
   - ✅ `mlm-admin-panel` (Static Site)
   - ✅ `mlm-user-panel` (Static Site) ← **Customer Portal**

4. **Apply Blueprint**
   - Click **"Apply"**
   - Render will deploy all services

---

### Method 2: Manual Deployment (Alternative)

If you prefer manual control:

#### Step 1: Create New Static Site

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository

#### Step 2: Configure Build Settings

```yaml
Name: mlm-user-panel
Branch: main
Root Directory: react-user-panel
Build Command: npm run render-build
Publish Directory: dist
```

#### Step 3: Add Environment Variables

```env
VITE_API_URL=https://mlm-backend-ljan.onrender.com/api/v1
```

#### Step 4: Configure Rewrites (SPA Support)

Add this rewrite rule to handle React Router:

```
Source: /*
Destination: /index.html
Type: Rewrite
```

#### Step 5: Deploy

- Click **"Create Static Site"**
- Render will build and deploy automatically

---

## Build Configuration

### Build Script

The `render-build` script in `package.json`:

```json
{
  "scripts": {
    "render-build": "rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && vite build"
  }
}
```

This script:
1. Cleans `node_modules` and lock file
2. Reinstalls dependencies with `--legacy-peer-deps`
3. Builds the production bundle

### Build Output

- **Directory**: `dist/`
- **Size**: ~3-5 MB (optimized chunks)
- **Chunks**:
  - `vendor-react.js` - React core
  - `vendor-mui.js` - Material-UI components
  - `vendor-redux.js` - State management
  - `vendor-charts.js` - Chart libraries
  - `vendor-utils.js` - Axios, Lodash, etc.

---

## API Configuration

The user portal connects to the backend via `src/api/config/axiosConfig.ts`:

```typescript
const getBaseUrl = () => {
  // Local development
  if (window.location.hostname === 'localhost') {
    return '/api/v1';  // Uses Vite proxy
  }

  // Production
  return 'https://mlm-backend-ljan.onrender.com/api/v1';
};
```

### Local Development Proxy

In development, API requests are proxied to `http://localhost:5000`:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

---

## Post-Deployment Steps

### 1. Verify Deployment

Once deployed, Render provides a URL like:
```
https://mlm-user-panel.onrender.com
```

Visit the URL and verify:
- ✅ Page loads correctly
- ✅ Login page is accessible
- ✅ No console errors

### 2. Test Backend Connection

1. Try to log in with test credentials
2. Check browser console for API calls
3. Verify data loads from backend

### 3. Update CORS in Backend

Add your frontend URL to allowed origins:

**In Render Backend Environment Variables:**
```env
CORS_ORIGINS=https://mlm-user-panel.onrender.com,https://mlm-admin-panel.onrender.com
```

**Or update `backend-node/src/app.js`:**
```javascript
app.use(cors({
    origin: [
        'https://mlm-user-panel.onrender.com',
        'https://mlm-admin-panel.onrender.com'
    ],
    credentials: true
}));
```

### 4. Custom Domain (Optional)

To use a custom domain:

1. Go to your Render service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS records as instructed
4. Render provides free SSL certificates

---

## Features Included in User Portal

- 📊 **Dashboard**: Overview of investments, earnings, team
- 💰 **Wallet**: Transaction history, withdrawals, deposits
- 🏘️ **Properties**: Browse and invest in properties
- 👥 **Team**: View downline, genealogy tree
- 💵 **Income**: Track commissions and bonuses
- 🎯 **E-Pins**: Purchase and manage e-pins
- 📈 **Reports**: Detailed income and investment reports
- 👤 **Profile**: KYC, settings, referral links

---

## Troubleshooting

### Build Failures

**Error**: `npm install` fails
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

**Error**: Out of memory during build
```bash
# Solution: Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 vite build
```

### API Connection Issues

**Error**: CORS errors in browser console

**Solution**: Update backend CORS configuration (see step 3 above)

**Error**: 401 Unauthorized

**Solution**: Check token handling in `axiosConfig.ts`

### Routing Issues

**Error**: 404 on page refresh

**Solution**: Ensure rewrite rule is configured:
```
Source: /*
Destination: /index.html
```

---

## Monitoring and Logs

### View Build Logs

1. Go to Render Dashboard
2. Select **mlm-user-panel**
3. Click **"Logs"** tab
4. Filter by **"Build"**

### View Runtime Logs

For static sites, there are no runtime logs. Check:
- Browser console for client-side errors
- Backend logs for API issues

---

## Performance Optimization

### Already Configured

✅ **Code Splitting**: Separate vendor chunks
✅ **Tree Shaking**: Unused code removed
✅ **Minification**: CSS and JS compressed
✅ **Lazy Loading**: Route-based code splitting
✅ **PWA Support**: Can be enabled via `VITE_ENABLE_PWA=true`

### Enable PWA (Optional)

To enable Progressive Web App features:

```env
VITE_ENABLE_PWA=true
```

This adds:
- Offline support
- Install to home screen
- Push notifications (requires setup)

---

## Costs

### Render Free Tier

- ✅ **Static Sites**: **FREE** (Unlimited)
- ✅ **Bandwidth**: 100 GB/month free
- ✅ **Build Minutes**: Unlimited

### Paid Plans (Optional)

- **Starter**: $7/month - Custom domains, more bandwidth
- **Standard**: $25/month - Advanced features

---

## Update Deployment

### Automatic Updates

Render automatically rebuilds when you push to GitHub:

```bash
git add .
git commit -m "Update user portal"
git push origin main
```

### Manual Redeploy

1. Go to Render Dashboard
2. Select **mlm-user-panel**
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Security Considerations

### Already Implemented

✅ **HTTPS**: Automatic SSL certificates
✅ **Token Storage**: Secure localStorage handling
✅ **Token Refresh**: Auto-refresh expired tokens
✅ **CORS**: Backend validates origins
✅ **XSS Protection**: React auto-escapes content

### Best Practices

- ⚠️ Never commit `.env` files with secrets
- ✅ Use environment variables for API URLs
- ✅ Regularly update dependencies
- ✅ Monitor for security vulnerabilities

---

## Complete Deployment Checklist

- [ ] Backend deployed and running
- [ ] Database connected to backend
- [ ] Environment variables set in backend
- [ ] User portal deployed to Render
- [ ] Rewrite rules configured
- [ ] CORS origins updated in backend
- [ ] Test login functionality
- [ ] Test API connections
- [ ] Verify all pages load
- [ ] Check mobile responsiveness
- [ ] Test payment integrations (if any)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

---

## Support and Resources

- **Render Docs**: https://render.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Material-UI**: https://mui.com

---

## Summary

Your customer portal is production-ready and configured for Render deployment. The `render.yaml` file already includes all necessary configuration. Simply apply the blueprint or follow the manual steps, and your user panel will be live!

**Expected Deployment URL**: `https://mlm-user-panel.onrender.com`

**Backend API**: Already deployed at `https://mlm-backend-ljan.onrender.com`
