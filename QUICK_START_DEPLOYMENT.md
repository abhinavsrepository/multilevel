# Quick Start: Deploy to Render in 10 Minutes

This is a streamlined guide to get your MLM platform deployed to Render quickly.

## Prerequisites
- [ ] Git repository with code pushed
- [ ] Render account created
- [ ] 10 minutes of your time

---

## Step 1: Create Database (2 minutes)

1. Login to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - Name: `mlm-database`
   - Database: `mlm_platform`
   - Region: Choose closest to you
   - Plan: **Free** (for testing) or **Starter** (for production)
4. Click **Create Database**
5. **Save these details** (you'll need them in Step 2):
   - Internal Database URL
   - Host, Port, Database, User, Password

---

## Step 2: Deploy Backend (3 minutes)

1. Click **New +** → **Web Service**
2. Connect your repository
3. Fill in:
   - Name: `mlm-backend`
   - Region: Same as database
   - Root Directory: `backend-node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Starter** ($7/month) or **Free** (with cold starts)

4. Click **Advanced** and add Environment Variables:

   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<paste from database>
   DB_PORT=5432
   DB_NAME=mlm_platform
   DB_USER=<paste from database>
   DB_PASS=<paste from database>
   JWT_SECRET=<generate random string>
   JWT_EXPIRE=7d
   UNIVERSAL_SPONSOR_CODE=ADMIN001
   ```

   **Generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. Click **Create Web Service**
6. Wait for deployment (~2-3 minutes)
7. **Copy your backend URL**: `https://mlm-backend-xxx.onrender.com`

---

## Step 3: Deploy Admin Panel (2 minutes)

1. Click **New +** → **Static Site**
2. Connect your repository
3. Fill in:
   - Name: `mlm-admin-panel`
   - Root Directory: `react-admin-panel`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. Click **Advanced** and add Environment Variable:
   ```
   VITE_API_URL=<your-backend-url>/api/v1
   ```
   Example: `https://mlm-backend-xxx.onrender.com/api/v1`

5. Click **Create Static Site**
6. Wait for deployment (~2-3 minutes)
7. **Copy your admin URL**: `https://mlm-admin-panel-xxx.onrender.com`

---

## Step 4: Deploy User Panel (2 minutes)

1. Click **New +** → **Static Site**
2. Connect your repository
3. Fill in:
   - Name: `mlm-user-panel`
   - Root Directory: `react-user-panel`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. Click **Advanced** and add Environment Variable:
   ```
   VITE_API_URL=<your-backend-url>/api/v1
   ```
   Example: `https://mlm-backend-xxx.onrender.com/api/v1`

5. Click **Create Static Site**
6. Wait for deployment (~2-3 minutes)
7. **Copy your user URL**: `https://mlm-user-panel-xxx.onrender.com`

---

## Step 5: Final Configuration (1 minute)

### Update Backend CORS

1. Go to your **Backend Service** → **Environment**
2. Add/Update:
   ```
   CORS_ORIGINS=<admin-url>,<user-url>
   ```
   Example: `https://mlm-admin-panel-xxx.onrender.com,https://mlm-user-panel-xxx.onrender.com`
3. Click **Save Changes**
4. Wait for backend to redeploy

---

## Step 6: Create Admin User

### Option A: Via Database Script

1. In Render Dashboard, go to your **Backend Service**
2. Click **Shell** (if available on your plan)
3. Run:
   ```bash
   node create-admin-user.js
   ```

### Option B: Via Database Client

1. Connect to your PostgreSQL database using the External URL
2. Run this SQL:
   ```sql
   INSERT INTO users (
     username, email, password, first_name, last_name,
     role, status, email_verified, referral_code
   ) VALUES (
     'admin',
     'admin@mlm.com',
     '$2a$10$your-hashed-password-here',
     'Admin',
     'User',
     'ADMIN',
     'ACTIVE',
     true,
     'ADMIN001'
   );
   ```

### Option C: Use Registration + Manually Update Role

1. Go to User Panel and register normally
2. Connect to database
3. Update the user's role to 'ADMIN':
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'youremail@example.com';
   ```

---

## Step 7: Test Everything

1. **Test Backend Health:**
   ```
   https://mlm-backend-xxx.onrender.com/api/v1/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Test Admin Panel:**
   - Visit: `https://mlm-admin-panel-xxx.onrender.com`
   - Login with admin credentials
   - Should load the admin dashboard

3. **Test User Panel:**
   - Visit: `https://mlm-user-panel-xxx.onrender.com`
   - Try registering a new user
   - Should work without errors

---

## 🎉 Deployment Complete!

**Your URLs:**
- Backend API: `https://mlm-backend-xxx.onrender.com`
- Admin Panel: `https://mlm-admin-panel-xxx.onrender.com`
- User Panel: `https://mlm-user-panel-xxx.onrender.com`

---

## Common Issues

### Backend won't start
- **Check logs** in Render Dashboard
- Verify database credentials are correct
- Ensure PORT is set to 5000

### Frontend shows API errors
- Verify `VITE_API_URL` is set correctly
- Check backend CORS includes frontend URLs
- Test backend health endpoint

### Database connection failed
- Verify you're using **Internal Database URL** in backend
- Check DB credentials match
- Ensure database is running

### 404 on frontend routes
- Ensure `_redirects` file exists in `react-admin-panel/public/` and `react-user-panel/public/`
- File should contain: `/*    /index.html   200`

---

## Next Steps

1. **Setup Custom Domains** (optional)
   - See full deployment guide: `DEPLOYMENT_RENDER.md`

2. **Configure Email** (optional)
   - Add SMTP settings to backend environment

3. **Monitor Your App**
   - Check logs regularly
   - Set up alerts for downtime

4. **Backup Database**
   - Automatic on paid plans
   - Manual backup: `pg_dump`

---

## Need More Details?

See the complete guide: **DEPLOYMENT_RENDER.md**

## Troubleshooting?

See the checklist: **DEPLOYMENT_CHECKLIST.md**

---

**Estimated Time to Deploy:** 10-15 minutes
**Cost:** Free tier available, or ~$21/month for production (Starter plans)
