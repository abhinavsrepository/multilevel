# Hostinger VPS Deployment Guide

Complete guide to deploy the MLM Platform on Hostinger VPS.

## Prerequisites

- Hostinger VPS (minimum 2GB RAM, 2 vCPU recommended)
- Domain name(s) configured in Hostinger DNS panel
- SSH access to your VPS
- Basic Linux command knowledge

## Step 1: Initial VPS Setup

### 1.1 Connect to VPS via SSH

```bash
ssh root@your-vps-ip
```

### 1.2 Update System Packages

```bash
apt update && apt upgrade -y
```

### 1.3 Create Non-Root User (Recommended)

```bash
adduser mlmadmin
usermod -aG sudo mlmadmin
su - mlmadmin
```

## Step 2: Install Required Software

### 2.1 Install Node.js (v18 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify installation
npm --version
```

### 2.2 Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.3 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 2.5 Install Git

```bash
sudo apt install git -y
```

## Step 3: Configure PostgreSQL Database

### 3.1 Create Database and User

```bash
sudo -u postgres psql
```

Inside PostgreSQL shell:

```sql
-- Create database
CREATE DATABASE mlm_platform;

-- Create user with password
CREATE USER mlm_user WITH PASSWORD 'your_strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mlm_platform TO mlm_user;

-- Exit PostgreSQL
\q
```

### 3.2 Configure PostgreSQL for Remote Access (if needed)

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Find and update:
```
listen_addresses = 'localhost'
```

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Add:
```
local   all             mlm_user                                md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Step 4: Deploy Application Code

### 4.1 Clone Repository

```bash
cd /home/mlmadmin
git clone https://github.com/yourusername/mlm-platform.git
# Or upload via SFTP/SCP
```

If uploading manually:
```bash
# From your local machine
scp -r C:\Users\surya\OneDrive\Desktop\mlmecogram\mlm mlmadmin@your-vps-ip:/home/mlmadmin/
```

### 4.2 Set Proper Permissions

```bash
cd /home/mlmadmin/mlm
sudo chown -R mlmadmin:mlmadmin .
```

## Step 5: Configure Backend (Node.js)

### 5.1 Navigate to Backend Directory

```bash
cd /home/mlmadmin/mlm/backend-node
```

### 5.2 Create Production Environment File

```bash
nano .env
```

Add the following (update with your actual values):

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mlm_platform
DB_USER=mlm_user
DB_PASS=your_strong_password_here

# JWT
JWT_SECRET=your_very_long_random_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# File Upload
UPLOAD_DIR=/home/mlmadmin/mlm/backend-node/uploads
MAX_FILE_SIZE=5242880

# CORS (update with your domains)
CORS_ORIGIN=https://admin.yourdomain.com,https://app.yourdomain.com
```

### 5.3 Install Backend Dependencies

```bash
npm install --production
```

### 5.4 Create Uploads Directory

```bash
mkdir -p uploads
chmod 755 uploads
```

### 5.5 Initialize Database

```bash
# Run database sync/migrations
node sync_db.js

# Create admin user (if you have a script)
node scripts/create-admin.js
```

### 5.6 Test Backend

```bash
npm start
```

If it starts successfully, press Ctrl+C and proceed.

## Step 6: Configure Frontend Applications

### 6.1 Build Admin Panel

```bash
cd /home/mlmadmin/mlm/react-admin-panel
```

Create `.env.production`:
```bash
nano .env.production
```

Add:
```env
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
REACT_APP_ENV=production
```

Build:
```bash
npm install
npm run build
```

### 6.2 Build User Panel

```bash
cd /home/mlmadmin/mlm/react-user-panel
```

Create `.env.production`:
```bash
nano .env.production
```

Add:
```env
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
REACT_APP_ENV=production
```

Build:
```bash
npm install
npm run build
```

## Step 7: Configure Nginx

### 7.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/mlm-platform
```

Add the following configuration:

```nginx
# API Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Uploads
    location /uploads {
        alias /home/mlmadmin/mlm/backend-node/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}

# Admin Panel
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /home/mlmadmin/mlm/react-admin-panel/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}

# User Panel
server {
    listen 80;
    server_name app.yourdomain.com www.yourdomain.com yourdomain.com;
    root /home/mlmadmin/mlm/react-user-panel/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

### 7.2 Enable Site and Test Configuration

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mlm-platform /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 8: Configure Domain DNS

In your Hostinger control panel:

1. Go to DNS/Name Servers
2. Add A records:
   - `api.yourdomain.com` → Your VPS IP
   - `admin.yourdomain.com` → Your VPS IP
   - `app.yourdomain.com` → Your VPS IP
   - `yourdomain.com` → Your VPS IP

Wait 5-15 minutes for DNS propagation.

## Step 9: Setup SSL with Let's Encrypt

### 9.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 9.2 Obtain SSL Certificates

```bash
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com -d app.yourdomain.com -d yourdomain.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

### 9.3 Auto-Renewal Setup

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

## Step 10: Setup PM2 for Backend

### 10.1 Start Backend with PM2

```bash
cd /home/mlmadmin/mlm/backend-node
pm2 start src/server.js --name mlm-api
```

### 10.2 Configure PM2 Startup

```bash
pm2 startup
# Run the command that PM2 outputs

pm2 save
```

### 10.3 Useful PM2 Commands

```bash
pm2 status              # Check status
pm2 logs mlm-api        # View logs
pm2 restart mlm-api     # Restart app
pm2 stop mlm-api        # Stop app
pm2 monit               # Monitor resources
```

## Step 11: Configure Firewall

```bash
# Install UFW if not already installed
sudo apt install ufw -y

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 12: Additional Security (Recommended)

### 12.1 Disable Root SSH Login

```bash
sudo nano /etc/ssh/sshd_config
```

Find and change:
```
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only
```

```bash
sudo systemctl restart sshd
```

### 12.2 Setup Fail2Ban

```bash
sudo apt install fail2ban -y
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 12.3 Regular Updates

```bash
# Create update script
nano ~/update.sh
```

Add:
```bash
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

```bash
chmod +x ~/update.sh
```

## Step 13: Backup Strategy

### 13.1 Database Backup Script

```bash
nano ~/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/mlmadmin/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD='your_strong_password_here' pg_dump -h localhost -U mlm_user mlm_platform > $BACKUP_DIR/mlm_db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "mlm_db_*.sql" -mtime +7 -delete

echo "Backup completed: mlm_db_$DATE.sql"
```

```bash
chmod +x ~/backup-db.sh
```

### 13.2 Schedule Daily Backups with Cron

```bash
crontab -e
```

Add:
```
# Daily backup at 2 AM
0 2 * * * /home/mlmadmin/backup-db.sh >> /home/mlmadmin/backup.log 2>&1
```

## Step 14: Monitoring and Logs

### 14.1 View Application Logs

```bash
# PM2 logs
pm2 logs mlm-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### 14.2 Monitor System Resources

```bash
# Real-time monitoring
pm2 monit

# System resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

## Step 15: Deployment Updates

### 15.1 Update Backend

```bash
cd /home/mlmadmin/mlm/backend-node
git pull  # or upload new files
npm install --production
pm2 restart mlm-api
```

### 15.2 Update Frontend

```bash
# Admin Panel
cd /home/mlmadmin/mlm/react-admin-panel
git pull
npm install
npm run build

# User Panel
cd /home/mlmadmin/mlm/react-user-panel
git pull
npm install
npm run build

# No restart needed for static files
```

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs mlm-api --lines 100

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Test database connection
cd /home/mlmadmin/mlm/backend-node
node -e "require('./src/models').sequelize.authenticate().then(() => console.log('DB OK')).catch(err => console.error(err))"
```

### Frontend Not Loading

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify build directory exists
ls -la /home/mlmadmin/mlm/react-admin-panel/build
ls -la /home/mlmadmin/mlm/react-user-panel/build
```

### SSL Issues

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if PostgreSQL is listening
sudo netstat -tulpn | grep 5432

# Test connection
psql -h localhost -U mlm_user -d mlm_platform
```

## Performance Optimization

### Enable HTTP/2 in Nginx

Edit `/etc/nginx/sites-available/mlm-platform`, change:
```nginx
listen 443 ssl;
```
to:
```nginx
listen 443 ssl http2;
```

### Enable Nginx Caching

Add to nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
```

## Useful Commands Reference

```bash
# Restart all services
sudo systemctl restart nginx
sudo systemctl restart postgresql
pm2 restart all

# View all logs
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h

# Check running processes
ps aux | grep node

# Database backup manually
./backup-db.sh
```

## Support

If you encounter issues:
1. Check application logs: `pm2 logs mlm-api`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all services are running: `sudo systemctl status nginx postgresql`
4. Check PM2 status: `pm2 status`

## Next Steps

After deployment:
1. Test all functionality thoroughly
2. Set up monitoring (e.g., UptimeRobot, Pingdom)
3. Configure regular backups
4. Set up email notifications for errors
5. Consider CDN for static assets (Cloudflare)
6. Set up staging environment for testing updates

---

**Important URLs After Deployment:**
- API: https://api.yourdomain.com
- Admin Panel: https://admin.yourdomain.com
- User Panel: https://app.yourdomain.com

Replace `yourdomain.com` with your actual domain name.
