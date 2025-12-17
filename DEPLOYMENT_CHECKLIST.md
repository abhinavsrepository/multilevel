# Deployment Checklist for Render

Use this checklist to ensure you've completed all necessary steps before and after deploying to Render.

## Pre-Deployment

### Code Preparation
- [ ] All code committed and pushed to Git repository (GitHub, GitLab, or Bitbucket)
- [ ] Remove any sensitive data from code (API keys, passwords, etc.)
- [ ] Ensure `.gitignore` excludes:
  - [ ] `node_modules/`
  - [ ] `.env` files
  - [ ] `dist/` or `build/` folders
  - [ ] Log files
  - [ ] Database files

### Environment Configuration
- [ ] Create `.env.example` files with placeholder values
- [ ] Document all required environment variables
- [ ] Generate strong JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Backend Preparation
- [ ] Health check endpoint implemented (`/api/v1/health`)
- [ ] CORS configured to accept frontend domains
- [ ] Database connection uses environment variables
- [ ] File uploads configured for production storage
- [ ] Logging configured for production
- [ ] Error handling implemented

### Frontend Preparation
- [ ] `_redirects` file created in `public/` folder
- [ ] API URL uses environment variable (`VITE_API_URL`)
- [ ] Build command tested locally: `npm run build`
- [ ] Production build optimized

### Database Preparation
- [ ] Database schema documented
- [ ] Migration scripts ready (if applicable)
- [ ] Seed data scripts ready for admin user
- [ ] Backup strategy planned

---

## Deployment Steps

### 1. Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Note down connection details:
  - [ ] Host
  - [ ] Port
  - [ ] Database name
  - [ ] Username
  - [ ] Password
  - [ ] Internal Database URL

### 2. Backend Deployment
- [ ] Create Web Service on Render
- [ ] Configure repository and branch
- [ ] Set root directory to `backend-node`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `DB_HOST`
  - [ ] `DB_PORT`
  - [ ] `DB_NAME`
  - [ ] `DB_USER`
  - [ ] `DB_PASS`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_EXPIRE`
  - [ ] `UNIVERSAL_SPONSOR_CODE`
- [ ] Deploy backend
- [ ] Verify deployment successful
- [ ] Test health endpoint: `https://your-backend.onrender.com/api/v1/health`
- [ ] Check logs for errors

### 3. Admin Panel Deployment
- [ ] Create Static Site on Render
- [ ] Configure repository and branch
- [ ] Set root directory to `react-admin-panel`
- [ ] Set build command: `npm install && npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=https://your-backend.onrender.com/api/v1`
- [ ] Verify `_redirects` file exists
- [ ] Deploy admin panel
- [ ] Verify deployment successful
- [ ] Test admin panel loads: `https://your-admin.onrender.com`

### 4. User Panel Deployment
- [ ] Create Static Site on Render
- [ ] Configure repository and branch
- [ ] Set root directory to `react-user-panel`
- [ ] Set build command: `npm install && npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=https://your-backend.onrender.com/api/v1`
- [ ] Verify `_redirects` file exists
- [ ] Deploy user panel
- [ ] Verify deployment successful
- [ ] Test user panel loads: `https://your-user.onrender.com`

---

## Post-Deployment

### Backend Configuration
- [ ] Update CORS origins with deployed frontend URLs
  ```
  CORS_ORIGINS=https://admin.onrender.com,https://user.onrender.com
  ```
- [ ] Verify database connection in logs
- [ ] Check for any startup errors

### Database Initialization
- [ ] Verify tables are created (auto-sync should handle this)
- [ ] Create admin user:
  - [ ] Run seed script or
  - [ ] Use create-admin-user.js
- [ ] Verify admin user can login

### Testing
- [ ] Test admin login at admin panel
- [ ] Test user registration at user panel
- [ ] Test API endpoints:
  - [ ] Authentication
  - [ ] User CRUD operations
  - [ ] Property listing
  - [ ] Investment creation
- [ ] Test file uploads (if applicable)
- [ ] Verify email sending (if configured)

### Security & Performance
- [ ] Verify HTTPS is enabled (automatic on Render)
- [ ] Test CORS from both frontend domains
- [ ] Review logs for errors or warnings
- [ ] Check response times
- [ ] Monitor memory usage

---

## Optional: Custom Domains

### Backend Domain
- [ ] Add custom domain in Render: `api.yourdomain.com`
- [ ] Configure DNS with CNAME record
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify SSL certificate issued
- [ ] Update frontend environment variables with new API URL

### Admin Panel Domain
- [ ] Add custom domain in Render: `admin.yourdomain.com`
- [ ] Configure DNS with CNAME record
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate issued
- [ ] Update backend CORS with new domain

### User Panel Domain
- [ ] Add custom domain in Render: `app.yourdomain.com` or `www.yourdomain.com`
- [ ] Configure DNS with CNAME record
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate issued
- [ ] Update backend CORS with new domain

---

## Monitoring Setup

### Health Checks
- [ ] Configure health check endpoint in Render
- [ ] Set up alerts for service downtime
- [ ] Monitor database connection health

### Logging
- [ ] Review application logs regularly
- [ ] Set up log retention policy
- [ ] Consider external logging service (optional)

### Performance Monitoring
- [ ] Monitor response times
- [ ] Check database query performance
- [ ] Monitor memory and CPU usage
- [ ] Set up alerts for high resource usage

---

## Troubleshooting Verification

If any issues occur, verify:
- [ ] All environment variables are set correctly
- [ ] Database is accessible from backend
- [ ] Frontend can reach backend API
- [ ] CORS is properly configured
- [ ] Build logs show no errors
- [ ] Runtime logs show no errors

---

## Documentation

- [ ] Document all environment variables
- [ ] Update README with deployment info
- [ ] Document custom domain setup (if used)
- [ ] Document admin credentials (securely)
- [ ] Create runbook for common operations:
  - [ ] Database backup/restore
  - [ ] Scaling services
  - [ ] Troubleshooting common issues

---

## Backup & Recovery

- [ ] Verify database backups are enabled (automatic on paid plans)
- [ ] Test database restore procedure
- [ ] Document backup strategy
- [ ] Keep local backup of production database

---

## Final Verification

- [ ] All services are running (green status in Render dashboard)
- [ ] Admin can login and access all features
- [ ] Users can register and login
- [ ] Core features working:
  - [ ] User registration
  - [ ] Login/logout
  - [ ] Property listing
  - [ ] Investment creation
  - [ ] Commission calculation
  - [ ] Wallet operations
- [ ] No errors in logs
- [ ] Performance is acceptable
- [ ] Security measures in place

---

## Deployment Complete! 🎉

**Deployed URLs:**
- Backend: `https://_______________`
- Admin Panel: `https://_______________`
- User Panel: `https://_______________`

**Admin Credentials:**
- Email: `_______________`
- Password: `_______________` (change after first login!)

**Database:**
- Host: `_______________`
- Database: `_______________`

**Next Steps:**
1. Monitor logs for the first 24 hours
2. Test all critical user flows
3. Share URLs with stakeholders
4. Plan for production data migration (if applicable)
5. Set up monitoring and alerting
6. Create disaster recovery plan

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Notes:**
_____________________________________________________
_____________________________________________________
_____________________________________________________
