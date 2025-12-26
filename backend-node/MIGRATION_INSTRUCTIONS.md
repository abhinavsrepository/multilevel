# Database Migration Instructions

## Running the Proclaim Sale Migration on Render.com

The property sales feature requires database schema changes that haven't been applied to production yet.

### Error:
```
error: column "actual_direct_incentive" does not exist
```

### Solution - Run Migration on Render:

#### Option 1: Using Render Shell (Recommended)

1. Go to your Render Dashboard
2. Select the `mlm-backend` service
3. Click on **Shell** tab
4. Run the following command:
   ```bash
   npm run migrate:proclaim-sale
   ```

#### Option 2: Using Render Console

1. Go to your Render Dashboard
2. Select the `mlm-backend` service  
3. Go to the **Console** tab
4. Click **New Console**
5. Run:
   ```bash
   node run-migration.js
   ```

#### Option 3: Temporary Build Command

1. Go to your Render Dashboard
2. Select the `mlm-backend` service
3. Go to **Settings**
4. Find **Build Command** and temporarily change it to:
   ```bash
   npm install && npm run migrate:proclaim-sale
   ```
5. Click **Save Changes**
6. Wait for the service to redeploy
7. After successful deployment, change the Build Command back to:
   ```bash
   npm install
   ```

### What the Migration Does:

The migration adds the following columns to `property_sales` table:
- `sale_type` - Type of sale (PRIMARY_BOOKING or FULL_PAYMENT)
- `plot_size` - Plot size in square feet
- `price_per_sq_ft` - Price per square foot
- `is_self_code` - Whether this is a self-code sale
- `projected_direct_incentive` - Pre-calculated 5% direct incentive
- `projected_tsb` - Pre-calculated Team Sales Bonus
- `actual_direct_incentive` - Actual direct incentive paid
- `actual_tsb` - Actual TSB distributed
- `distribution_month` - Month of distribution
- `is_distributed` - Whether commission has been distributed
- `distributed_at` - When commission was distributed

### After Migration:

The following endpoints will work correctly:
- `/api/v1/property-sales/my-sales`
- `/api/v1/property-sales/stats`
- `/api/v1/property-sales/*` (all property sales endpoints)

### Verification:

After running the migration, you should see:
```
Migration completed successfully: Proclaim Sale fields added to property_sales table
```

Then restart the backend service and the errors should be resolved.
