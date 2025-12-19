# How to Seed Database on Render

## Method 1: Via Render Shell (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com
2. Navigate to your backend service
3. Click on the "Shell" tab in the left sidebar
4. Run the following command in the shell:
   ```bash
   npm run seed:user
   ```
5. You should see output showing:
   ```
   DB Connected
   Creating new user...
   User created with ID: [number]
   LOGIN CREDENTIALS:
   Email: userpanel@test.com
   Password: UserPanel@123
   ```

## Method 2: Add to Render Build Command

Alternatively, you can add the seed command to run automatically on every deployment:

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to "Settings"
4. Find "Build Command" and update it to:
   ```bash
   npm install && npm run seed:user
   ```

## Method 3: Create a One-Time Job

1. In Render dashboard, click "New +"
2. Select "Background Worker"
3. Connect your repository
4. Set the command to: `npm run seed:user`
5. Deploy once to seed the database

## After Seeding

Use these credentials to log in:
- **Email**: userpanel@test.com
- **Password**: UserPanel@123

## Troubleshooting

If you get a database connection error:
1. Check that your DATABASE_URL environment variable is set correctly in Render
2. Ensure your database is running and accessible
3. Check the Render logs for detailed error messages
