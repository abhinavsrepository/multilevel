# MLM Platform Deployment Guide for Render

This guide walks you through deploying the MLM Real Estate Platform to Render.com.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployments](#frontend-deployments)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A [Render.com](https://render.com) account
- Git repository with your code (GitHub, GitLab, or Bitbucket)
- Domain name (optional, but recommended)

---

## Database Setup

### 1. Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configure the database:
   - **Name**: `mlm-platform-db`
   - **Database**: `mlm_platform`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free or Starter (minimum 1GB RAM recommended for production)

3. Click **Create Database**

4. Once created, note down the connection details:
   - **Internal Database URL** (for backend connection)
   - **External Database URL** (for external tools)
   - **Host**, **Port**, **Database**, **Username**, **Password**

### 2. Initialize Database Schema

After the backend is deployed, the database will automatically sync on first startup. The backend uses Sequelize's `sync()` method to create tables automatically.

**Note:** For production environments, it's recommended to use migrations instead of auto-sync to have better control over schema changes.

---

## Backend Deployment

### 1. Create Backend Web Service

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your Git repository
3. Configure the service:

   **Basic Settings:**
   - **Name**: `mlm-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `backend-node`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Instance Settings:**
   - **Plan**: Starter or higher (minimum 512MB RAM)
   - **Environment**: `Node`

### 2. Configure Environment Variables

Click **Advanced** → **Add Environment Variable** and add the following:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
# DATABASE_URL will be automatically provided by Render when you link the database
DATABASE_URL=<will-be-auto-populated-from-database>

# JWT Configuration
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRE=7d

# Universal Sponsor
UNIVERSAL_SPONSOR_CODE=ADMIN001

# Cloudinary Configuration (required for file uploads)
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

# CORS Origins (add your frontend URLs after deployment)
CORS_ORIGINS=https://your-admin-domain.com,https://your-user-domain.com
```

**Important Notes:**
- The `DATABASE_URL` will be automatically linked when you connect your PostgreSQL database to the backend service
- To link the database: Go to **Environment** → **Add Environment Variable** → **Add from Database** → Select your database → Choose "Connection String"

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Deploy Backend

1. Click **Create Web Service**
2. Wait for the build and deployment to complete
3. Note the backend URL: `https://mlm-backend.onrender.com`

### 4. Verify Backend Deployment

Visit: `https://mlm-backend.onrender.com/api/v1/health` (create this endpoint if needed)

Check logs for successful database connection.

---

## Frontend Deployments

You'll deploy two separate frontend applications:
1. **Admin Panel** (react-admin-panel)
2. **User Panel** (react-user-panel)

### Admin Panel Deployment

#### 1. Create Static Site

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect your Git repository
3. Configure:

   **Basic Settings:**
   - **Name**: `mlm-admin-panel`
   - **Branch**: `main`
   - **Root Directory**: `react-admin-panel`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### 2. Environment Variables

Add environment variables (click **Advanced**):

```bash
VITE_API_URL=https://mlm-backend.onrender.com/api/v1
```

#### 3. Add Redirect Rules

Create a file `react-admin-panel/public/_redirects`:

```bash
/*    /index.html   200
```

This ensures React Router works properly.

#### 4. Deploy

Click **Create Static Site** and wait for deployment.

Your admin panel will be available at: `https://mlm-admin-panel.onrender.com`

---

### User Panel Deployment

#### 1. Create Static Site

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect your Git repository
3. Configure:

   **Basic Settings:**
   - **Name**: `mlm-user-panel`
   - **Branch**: `main`
   - **Root Directory**: `react-user-panel`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### 2. Environment Variables

```bash
VITE_API_URL=https://mlm-backend.onrender.com/api/v1
```

#### 3. Add Redirect Rules

Create a file `react-user-panel/public/_redirects`:

```bash
/*    /index.html   200
```

#### 4. Deploy

Click **Create Static Site** and wait for deployment.

Your user panel will be available at: `https://mlm-user-panel.onrender.com`

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | `64-char-random-string` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `UNIVERSAL_SPONSOR_CODE` | Default sponsor code | `ADMIN001` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `CORS_ORIGINS` | Allowed frontend URLs | `https://admin.example.com,https://app.example.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://mlm-backend.onrender.com/api/v1` |

---

## Post-Deployment Steps

### 1. Update Backend CORS

After frontends are deployed, update backend environment variables:

```bash
CORS_ORIGINS=https://mlm-admin-panel.onrender.com,https://mlm-user-panel.onrender.com
```

### 2. Create Admin User

Connect to your backend via SSH or use a database client:

```bash
# Option 1: Create via API endpoint (implement /api/v1/seed/admin)
curl -X POST https://mlm-backend.onrender.com/api/v1/seed/admin

# Option 2: Use your existing script
# Connect to backend shell and run:
node create-admin-user.js
```

Or use the script in `backend-node/create-admin-user.js`:

```javascript
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const adminExists = await User.findOne({ where: { email: 'admin@mlm.com' } });
    if (adminExists) {
      console.log('Admin already exists');
      return;
    }

    await User.create({
      username: 'admin',
      email: 'admin@mlm.com',
      password: 'Admin@123', // Will be hashed
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      referralCode: 'ADMIN001'
    });

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();
```

### 3. Test the Application

1. Visit Admin Panel: `https://mlm-admin-panel.onrender.com`
2. Login with admin credentials
3. Visit User Panel: `https://mlm-user-panel.onrender.com`
4. Test registration flow

### 4. Setup Custom Domains (Optional)

#### For Backend:
1. Go to your backend service → **Settings** → **Custom Domain**
2. Add: `api.yourdomain.com`
3. Configure DNS with provided CNAME

#### For Admin Panel:
1. Go to admin panel service → **Settings** → **Custom Domain**
2. Add: `admin.yourdomain.com`
3. Configure DNS with provided CNAME

#### For User Panel:
1. Go to user panel service → **Settings** → **Custom Domain**
2. Add: `app.yourdomain.com` or `www.yourdomain.com`
3. Configure DNS with provided CNAME

### 5. Update Environment Variables for Custom Domains

After setting up custom domains, update:

**Backend:**
```bash
CORS_ORIGINS=https://admin.yourdomain.com,https://app.yourdomain.com
```

**Frontend (both panels):**
```bash
VITE_API_URL=https://api.yourdomain.com/api/v1
```

---

## Database Management

### Accessing Database

**Via Render Dashboard:**
- Go to your database → **Info** → Use the connection string

**Via psql CLI:**
```bash
psql "postgresql://user:password@host:port/database"
```

**Via pgAdmin or TablePlus:**
- Use the External Database URL from Render

### Backup Database

Render automatically backs up PostgreSQL databases on paid plans.

**Manual Backup:**
```bash
pg_dump "postgresql://user:password@host:port/database" > backup.sql
```

### Restore Database

```bash
psql "postgresql://user:password@host:port/database" < backup.sql
```

---

## Monitoring and Logs

### View Logs

1. Go to your service in Render Dashboard
2. Click **Logs** tab
3. View real-time logs

### Setup Health Checks

Render automatically monitors your services. For custom health checks:

1. Create `/api/v1/health` endpoint in backend:

```javascript
// backend-node/src/routes/health.routes.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

router.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
```

2. Add to `app.js`:
```javascript
app.use('/api/v1/health', require('./routes/health.routes'));
```

---

## Scaling and Performance

### Backend Scaling

1. **Vertical Scaling**: Upgrade to a higher plan with more RAM/CPU
2. **Horizontal Scaling**: Render Pro plans support auto-scaling

### Database Scaling

1. Upgrade to a higher PostgreSQL plan
2. Consider connection pooling:

```javascript
// backend-node/src/config/database.js
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  }
});
```

### Frontend Optimization

- Ensure build optimization is enabled
- Use CDN for static assets
- Enable Brotli compression (automatic on Render)

---

## Troubleshooting

### Backend Not Starting

**Check Logs:**
```bash
# In Render Dashboard → Backend Service → Logs
```

**Common Issues:**
1. Database connection failed (`ECONNREFUSED`)
   - Verify `DATABASE_URL` is properly linked to your PostgreSQL instance
   - Go to Backend Service → Environment → Verify DATABASE_URL is connected to database
   - Check if database is running (Render Dashboard → Database Service)
   - Ensure you're using the Internal Connection String (Render auto-configures SSL)
   - Check server logs for SSL/TLS errors - the database config now handles SSL automatically

2. Port binding error
   - Ensure `PORT` environment variable is set to `5000`
   - Backend should listen on `process.env.PORT` (already configured)

3. Module not found
   - Check `package.json` has all dependencies
   - Ensure `npm install` runs in build command

4. SSL/TLS connection errors
   - The updated database config automatically handles SSL for production
   - Verify `NODE_ENV=production` is set in environment variables

### Frontend Not Loading API

**Check:**
1. `VITE_API_URL` is correctly set
2. Backend CORS allows frontend domain
3. Backend is running and accessible

**Test API:**
```bash
curl https://mlm-backend.onrender.com/api/v1/health
```

### Database Connection Issues

**Verify:**
1. Database is running (check Render Dashboard → Database Service)
2. `DATABASE_URL` environment variable is properly linked:
   - Go to Backend Service → Environment tab
   - Look for `DATABASE_URL` variable
   - It should show "Linked from mlm-database"
   - If missing, add it: "Add Environment Variable" → "Add from Database" → Select your database → "Connection String"
3. Database and backend are in the same region (reduces latency)
4. Check logs for specific connection errors
5. SSL is automatically configured for production (no manual setup needed)

### CORS Errors

Update backend environment variable:
```bash
CORS_ORIGINS=https://frontend1.com,https://frontend2.com
```

Ensure backend CORS middleware uses this variable:
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

### 404 on Frontend Routes

Ensure `_redirects` file exists in `public` folder:
```bash
/*    /index.html   200
```

### Build Failures

**Check:**
1. Build command is correct
2. All dependencies in `package.json`
3. TypeScript errors (if using TS)
4. Environment variables are set

**View Build Logs:**
- Render Dashboard → Service → Events → Click on deployment

---

## Security Best Practices

1. **Use Strong JWT Secret**
   - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

2. **Enable HTTPS**
   - Automatic on Render with free SSL certificates

3. **Secure Environment Variables**
   - Never commit `.env` files
   - Use Render's environment variable management

4. **Database Security**
   - Use strong passwords
   - Restrict database access
   - Regular backups

5. **Rate Limiting**
   - Implement in backend to prevent abuse

6. **SQL Injection Prevention**
   - Use Sequelize ORM (already implemented)
   - Never use raw queries with user input

---

## Cost Optimization

### Free Tier Limitations
- Backend: Spins down after 15 minutes of inactivity (cold starts)
- Database: 90 days retention, then deleted
- Static sites: Always on

### Recommendations
- **Development**: Use free tier
- **Production**:
  - Backend: Starter ($7/month)
  - Database: Starter ($7/month)
  - Static Sites: Free

### Reduce Costs
1. Use single backend for both frontends
2. Optimize build sizes
3. Use CDN for assets
4. Implement caching

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [Static Site Deployment](https://render.com/docs/deploy-create-react-app)
- [PostgreSQL Documentation](https://render.com/docs/databases)

---

## Quick Reference Commands

### Deploy from CLI
```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy service
render deploy
```

### Database Commands
```bash
# Connect to database
psql <EXTERNAL_DATABASE_URL>

# List tables
\dt

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### Update Service
```bash
# Trigger manual deploy
# In Render Dashboard → Service → Manual Deploy → Deploy latest commit

# Or push to branch
git push origin main
```

---

## Support

For issues specific to this application:
- Check logs in Render Dashboard
- Review this documentation
- Contact your development team

For Render platform issues:
- [Render Support](https://render.com/docs/support)
- [Community Forum](https://community.render.com)

---

**Last Updated**: 2025-12-15
**Version**: 1.0.0
