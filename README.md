# Real Estate MLM Platform

A complete, production-ready Multi-Level Marketing platform for Real Estate investments built with Spring Boot and React.

## 🚀 Features Added

### Authentication & User Management
- ✅ User registration with sponsor referral system
- ✅ Email & mobile OTP verification
- ✅ JWT-based authentication with refresh tokens
- ✅ Password reset functionality
- ✅ Role-based access control (Admin, Member, Manager, Franchise)
- ✅ User profile management with avatar upload
- ✅ KYC document upload and verification (PAN, Aadhaar, Bank proof)
- ✅ Multi-level KYC status (Basic, Full, Premium)

### MLM Binary Tree System
- ✅ Automatic binary tree placement (LEFT/RIGHT/AUTO)
- ✅ Sponsor and placement tracking
- ✅ Tree visualization with react-d3-tree
- ✅ Business Volume (BV) calculation and propagation
- ✅ Left/Right leg team counting
- ✅ Carry forward logic for unmatched BV
- ✅ Genealogy tree view with unlimited depth
- ✅ Team statistics and analytics

### Commission System
- ✅ Direct Referral Bonus - 2% of investment amount
- ✅ Binary Pairing Bonus - ₹100 per 10,000 BV matched
- ✅ Level Commission - Up to 10 levels (3%, 2%, 1.5%, 1%, 1%, 0.5%...)
- ✅ Rental Income Commission - Share in property rental income
- ✅ Property Appreciation Bonus - Share in property value increase
- ✅ Rank Achievement Bonus - One-time bonuses on rank promotion
- ✅ Daily commission capping (₹25,000/day)
- ✅ Weekly commission capping (₹150,000/week)
- ✅ Commission history and reports

### Real Estate Property Management
- ✅ Property listing with complete details
- ✅ Property search and advanced filters
- ✅ Featured properties showcase
- ✅ Property image gallery
- ✅ Property documents management
- ✅ Property appreciation tracking
- ✅ Investment slots tracking

### Investment Management
- ✅ Property investment with full/partial payment
- ✅ Installment-based payment plans
- ✅ Installment payment tracking and reminders
- ✅ Investment portfolio dashboard
- ✅ ROI calculation and tracking
- ✅ Investment exit/resale requests
- ✅ Lock-in period management (12 months)
- ✅ Nominee registration
- ✅ Investment certificates

### Wallet & Payout System
- ✅ Multiple wallets (Commission, Investment, Rental, ROI)
- ✅ Wallet balance tracking
- ✅ Transaction history with filters
- ✅ Withdrawal requests (min ₹1,000)
- ✅ TDS auto-calculation (10%)
- ✅ Bank account management
- ✅ Payout approval workflow
- ✅ Razorpay integration ready

### Admin Panel
- ✅ User management (activate, block, delete)
- ✅ Property management (CRUD operations)
- ✅ Payout approval/rejection
- ✅ KYC verification
- ✅ Commission management
- ✅ System settings configuration
- ✅ Reports generation

### Additional Features
- ✅ Support ticket system
- ✅ In-app notifications
- ✅ Email notifications
- ✅ Scheduled jobs (commissions, payouts, reminders)
- ✅ Rank system with 7 ranks
- ✅ Audit logging
- ✅ Responsive design
- ✅ Charts and analytics

---

## 🚀 How to Start the Project

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.6+

### 1. Database Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE mlm_platform;
\q

# Run schema
psql -U postgres -d mlm_platform -f database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Update application.yml with your credentials:
# - Database: username, password
# - JWT: secret key
# - Email: SMTP settings

# Build and run
mvn clean install
mvn spring-boot:run

# Backend starts on: http://localhost:8080
# API docs: http://localhost:8080/swagger-ui.html
```

**Default Admin:**
- Email: `admin@mlmplatform.com`
- Password: `Admin@123`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env:
VITE_API_BASE_URL=http://localhost:8080/api

# Start dev server
npm run dev

# Frontend starts on: http://localhost:3000
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger Docs: http://localhost:8080/swagger-ui.html

---

## 📦 Project Structure

```
mlm/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/realestate/mlm/
│   │       ├── controller/  # REST APIs (12)
│   │       ├── service/     # Business logic (12+)
│   │       ├── model/       # Entities (15+)
│   │       ├── repository/  # JPA repos (15)
│   │       ├── security/    # JWT & Auth
│   │       ├── scheduler/   # Cron jobs (3)
│   │       └── util/        # Utilities (7)
│   └── pom.xml
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api/           # API layer (8)
│   │   ├── components/    # Components
│   │   ├── pages/         # Pages (15+)
│   │   ├── store/         # Redux store
│   │   └── routes/        # Routing
│   └── package.json
│
└── database/
    └── schema.sql         # Database schema
```

---

## 🔑 Key Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/users/dashboard` - Dashboard
- `GET /api/properties` - Get properties
- `POST /api/investments` - Create investment
- `GET /api/wallet/balance` - Get balance
- `POST /api/payouts/request` - Withdraw
- `GET /api/admin/users` - Admin: Users

---

## 🛠️ Tech Stack

**Backend:** Spring Boot 3.2, Java 17, PostgreSQL, JWT, Redis
**Frontend:** React 18, TypeScript, Redux, Material-UI, Vite
**Charts:** Recharts
**Tree:** React D3 Tree

---

**Built with ❤️ using Spring Boot and React**
