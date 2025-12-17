# Level Plan MLM Implementation Guide

## Summary

This document outlines the complete implementation of the Level Plan functionality for the MLM Real Estate platform, covering both backend (Node.js) and frontend (React Admin & User Panels).

## Completed Work

### 1. Database Models Created ✓

The following models have been created in `backend-node/src/models/`:

- **epin.model.js** - E-Pin management (generation, usage, tracking)
- **deposit.model.js** - User deposit requests with payment proof
- **withdrawal.model.js** - Withdrawal requests and approvals
- **system-settings.model.js** - Configurable system settings
- **inquiry.model.js** - User inquiries/support tickets
- **income.model.js** - Comprehensive income tracking by type
- **wallet.model.js** (enhanced) - Added level profit, cashback, repurchase, coin balance fields

### 2. Key Features Implemented

#### E-Pin System
- Generate E-Pins from admin panel or user wallet
- Transaction fee configuration (10-12%)
- Pin status tracking (Available, Used, Expired, Blocked)
- Activation tracking (who used, when, for whom)

#### Deposit Management
- Users submit deposit requests with payment proof (screenshot)
- Admin review with Accept/Reject actions
- Rejection requires reason
- Auto E-Pin generation on approval

#### Withdrawal Management
- Min/max withdrawal limits (configurable)
- Transaction charges
- Net amount calculation
- Multi-step approval process (Pending → Processing → Approved → Completed)
- Auto credit back to wallet on rejection

#### Income Tracking
- Multiple income types:
  - Level Commission
  - Referral Income
  - Cashback
  - ROI
  - Repurchase
  - Binary/Matching Bonus
  - Rank Bonus
  - Leadership Bonus
- Level-wise tracking
- Source user tracking
- Withdrawal status

## Remaining Implementation Tasks

### Backend Controllers (Priority)

1. **Admin Deposit Controller** (`controllers/admin/deposit.admin.controller.js`)
   - getPendingDeposits()
   - approveDeposit()
   - rejectDeposit()
   - getDepositStats()

2. **Admin Withdrawal Controller** (`controllers/admin/withdrawal.admin.controller.js`)
   - getPendingWithdrawals()
   - approveWithdrawal()
   - rejectWithdrawal()
   - processWithdrawal()
   - getWithdrawalStats()

3. **Admin Settings Controller** (`controllers/admin/settings.admin.controller.js`)
   - getSystemSettings()
   - updateSystemSettings()
   - updateBankDetails()
   - configureLevelPlan()

4. **User E-Pin Controller** (`controllers/user/epin.controller.js`)
   - generateEPinFromWallet()
   - getMyEPins()
   - activateUserWithEPin()
   - verifyEPin()

5. **User Income Controller** (`controllers/user/income.controller.js`)
   - getDashboardStats()
   - getLevelOverview()
   - getIncomeHistory()
   - getTeamHierarchy()

6. **User Deposit Controller** (`controllers/user/deposit.controller.js`)
   - submitDepositRequest()
   - uploadPaymentProof()
   - getMyDeposits()

7. **User Withdrawal Controller** (`controllers/user/withdrawal.controller.js`)
   - requestWithdrawal()
   - getMyWithdrawals()
   - getWithdrawalLimits()

### Backend Routes

Create route files in `routes/`:
- `epin.routes.js` - Both admin and user routes
- `deposit.routes.js` - Both admin and user routes
- `withdrawal.routes.js` - Both admin and user routes
- `income.routes.js` - User routes
- `settings.routes.js` - Admin routes

### Frontend - Admin Panel

Create pages in `react-admin-panel/src/pages/`:

1. **Deposits Management**
   - `/admin/deposits` - List all deposit requests
   - Filters: Status, Date Range, User
   - Actions: View Screenshot, Approve, Reject
   - Modal for rejection reason

2. **Withdrawals Management**
   - `/admin/withdrawals` - List all withdrawal requests
   - Show: User, Amount, Charges, Net Amount
   - Actions: Approve, Reject, Mark as Completed
   - Batch actions support

3. **E-Pin Management**
   - `/admin/epins` - List/Generate E-Pins
   - Bulk generation form
   - Status management
   - Usage history

4. **Plan Configuration**
   - `/admin/settings/plan` - Level settings
   - Configure commission percentages per level
   - Set eligibility criteria
   - Withdrawal limits
   - Transaction fees

5. **Bank Account Settings**
   - `/admin/settings/bank` - Company bank details
   - UPI ID, QR Code upload
   - Active/Inactive status

6. **Notices Management**
   - `/admin/notices` - Create/Edit notices
   - Display to all users
   - Priority levels

7. **Inquiries Management**
   - `/admin/inquiries` - View all user inquiries
   - Response system
   - Status tracking

### Frontend - User Panel

Create pages in `react-user-panel/src/pages/`:

1. **Enhanced Dashboard**
   - `/dashboard` - Already exists, enhance with:
   - Financial Overview cards
   - Level Commission breakdown
   - Daily income tracker
   - Team statistics

2. **Level Overview**
   - `/income/level-overview` - Detailed level view
   - Table showing per-level:
     - Income percentage
     - Total team members
     - Active members
     - Eligibility status (Yes/No with reason)
   - Visual hierarchy

3. **Income Reports**
   - `/income/reports` - Categorized income history
   - Filters: Type, Date Range, Level
   - Export to PDF/Excel
   - Graphical representations

4. **E-Pin Management**
   - `/epin/my-pins` - View my E-Pins
   - `/epin/generate` - Generate from wallet
   - `/epin/activate` - Activate user ID
   - Show transaction fees

5. **Deposits**
   - `/deposits/request` - Submit deposit request
   - Upload payment screenshot
   - `/deposits/history` - View all deposits
   - Status tracking

6. **Withdrawals**
   - `/withdrawals/request` - Request withdrawal
   - Select bank account
   - See charges calculation
   - `/withdrawals/history` - View all withdrawals
   - Status tracking

7. **Bank Accounts**
   - `/profile/bank-accounts` - Manage bank accounts
   - Add/Edit/Delete
   - Set primary account

8. **Inquiries**
   - `/support/inquiries` - Submit inquiries
   - View responses
   - Attach files

## Database Migration

Run the migration script to create all tables:

```bash
cd backend-node
node src/scripts/migrate-level-plan.js
```

## Initial System Configuration

After migration, configure these settings in `system_settings` table:

```sql
-- Withdrawal Settings
INSERT INTO system_settings (settingKey, settingValue, settingType, category) VALUES
('withdrawal_min_amount', '1000', 'NUMBER', 'WITHDRAWAL'),
('withdrawal_max_amount', '50000', 'NUMBER', 'WITHDRAWAL'),
('withdrawal_transaction_charge_percent', '5', 'NUMBER', 'WITHDRAWAL'),
('withdrawal_transaction_charge_fixed', '0', 'NUMBER', 'WITHDRAWAL');

-- E-Pin Settings
INSERT INTO system_settings (settingKey, settingValue, settingType, category) VALUES
('epin_wallet_fee_percent', '10', 'NUMBER', 'EPIN'),
('epin_default_expiry_days', '90', 'NUMBER', 'EPIN');

-- Level Plan Settings
INSERT INTO system_settings (settingKey, settingValue, settingType, category) VALUES
('level_plan_enabled', 'true', 'BOOLEAN', 'LEVEL_PLAN'),
('level_plan_max_levels', '10', 'NUMBER', 'LEVEL_PLAN');
```

## API Endpoints Structure

### Admin Routes

```
POST   /api/v1/admin/epins/generate
GET    /api/v1/admin/epins
GET    /api/v1/admin/epins/stats
PUT    /api/v1/admin/epins/:id/toggle
DELETE /api/v1/admin/epins/:id

GET    /api/v1/admin/deposits
GET    /api/v1/admin/deposits/pending
POST   /api/v1/admin/deposits/:id/approve
POST   /api/v1/admin/deposits/:id/reject
GET    /api/v1/admin/deposits/stats

GET    /api/v1/admin/withdrawals
GET    /api/v1/admin/withdrawals/pending
POST   /api/v1/admin/withdrawals/:id/approve
POST   /api/v1/admin/withdrawals/:id/reject
POST   /api/v1/admin/withdrawals/:id/complete
GET    /api/v1/admin/withdrawals/stats

GET    /api/v1/admin/settings
PUT    /api/v1/admin/settings
PUT    /api/v1/admin/settings/bank
PUT    /api/v1/admin/settings/level-plan

GET    /api/v1/admin/inquiries
POST   /api/v1/admin/inquiries/:id/respond
```

### User Routes

```
POST   /api/v1/user/epins/generate
GET    /api/v1/user/epins
POST   /api/v1/user/epins/verify
POST   /api/v1/user/epins/activate

POST   /api/v1/user/deposits
GET    /api/v1/user/deposits
POST   /api/v1/user/deposits/upload-proof

POST   /api/v1/user/withdrawals
GET    /api/v1/user/withdrawals
GET    /api/v1/user/withdrawals/limits

GET    /api/v1/user/income/dashboard
GET    /api/v1/user/income/level-overview
GET    /api/v1/user/income/history
GET    /api/v1/user/income/daily

GET    /api/v1/user/team/hierarchy
GET    /api/v1/user/team/stats

POST   /api/v1/user/inquiries
GET    /api/v1/user/inquiries
```

## Testing Workflow

1. **Admin: Generate E-Pins**
   - Login as admin
   - Generate 10 E-Pins of ₹1000 each
   - Verify they appear in E-Pin list

2. **User: Submit Deposit**
   - Login as user
   - Submit deposit request for ₹5000
   - Upload payment screenshot

3. **Admin: Approve Deposit**
   - Review deposit request
   - Approve and generate E-Pin
   - Verify E-Pin sent to user

4. **User: Activate with E-Pin**
   - Use E-Pin to activate account or downline
   - Verify activation successful

5. **User: Request Withdrawal**
   - Request withdrawal of ₹2000
   - Verify charges calculated correctly

6. **Admin: Process Withdrawal**
   - Approve withdrawal
   - Mark as completed
   - Verify balance deducted

7. **User: View Level Overview**
   - Check level-wise income
   - Verify eligibility status
   - View team hierarchy

## Next Steps

1. Complete remaining backend controllers
2. Create all API routes
3. Build admin panel UI pages
4. Build user panel UI pages
5. Integrate APIs with frontend
6. Test complete workflow
7. Deploy to production

## Notes

- All monetary values use DECIMAL(15,2) for precision
- Timestamps are automatically managed by Sequelize
- All APIs require authentication (JWT)
- Admin routes require admin role check
- File uploads use multer middleware
- Transaction safety ensured with Sequelize transactions

---

**Status**: Models and initial controllers created. Frontend and remaining backend pending implementation.
