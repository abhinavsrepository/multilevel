# 🏠 MLM Real Estate User Panel

> **Complete Production-Ready React User Dashboard for MLM Real Estate Platform**

A comprehensive, feature-rich web application built with React 18, TypeScript, Material-UI, and Redux Toolkit for managing MLM real estate investments, commissions, team management, and more.

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Material-UI](https://img.shields.io/badge/MUI-5.15-blue?logo=mui)
![Redux](https://img.shields.io/badge/Redux-Toolkit-purple?logo=redux)
![Vite](https://img.shields.io/badge/Vite-5.0-yellow?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Building for Production](#-building-for-production)
- [Module Overview](#-module-overview)
- [API Integration](#-api-integration)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Code Style](#-code-style)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 **15 Complete Modules**

1. **Authentication** - Login, Register (Multi-step), OTP Verification, Password Reset
2. **Dashboard** - Stats cards, Charts, Recent activities, Announcements
3. **Profile Management** - View/Edit profile, Digital ID Card, KYC, Bank accounts
4. **Properties Marketplace** - Browse, Search, Filter, Property details
5. **Investments** - My investments, Portfolio, Investment details, Installments
6. **Wallet** - Multiple wallets, Transactions, Withdrawal, Bank management
7. **Commissions** - Overview, History, Type-wise breakdown
8. **Team & Genealogy** - Binary/Unilevel trees, Direct referrals, Team reports
9. **Rank & Achievements** - Current rank, Progress tracking, All ranks, Rewards
10. **Referral Tools** - Referral code, QR code, Share tools, Link tracking
11. **KYC Documents** - Document upload, Verification status, KYC levels
12. **Support** - Tickets, Chat, FAQ, Help center
13. **Reports** - Monthly statements, Tax reports, Commission reports
14. **Notifications** - Real-time notifications, Announcements, Settings
15. **Settings** - Account, Security, Notifications, Theme, Accessibility

### 🎨 **UI/UX Features**

- ✅ **Fully Responsive** - Mobile, Tablet, Desktop optimized
- ✅ **Dark/Light Mode** - Complete theme switching with system preference
- ✅ **Material-UI v5** - Modern, accessible component library
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ **Framer Motion** - Smooth animations and transitions
- ✅ **Progressive Web App (PWA)** - Offline support, installable
- ✅ **Multi-language Support** - English, Hindi, Marathi (ready)
- ✅ **Accessibility** - WCAG 2.1 Level AA compliant

### 🚀 **Technical Features**

- ✅ **TypeScript** - 100% type-safe codebase
- ✅ **Redux Toolkit** - Centralized state management
- ✅ **RTK Query** - Efficient API calls with caching
- ✅ **React Hook Form** - Performant form handling
- ✅ **Yup Validation** - Schema-based form validation
- ✅ **Code Splitting** - Lazy loading for optimal performance
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Service Worker** - PWA support with caching

### 📊 **Data Visualization**

- 📈 Line charts (Earnings trends, Portfolio growth)
- 🥧 Pie charts (Commission breakdown, Asset allocation)
- 📊 Bar charts (Team growth, Performance)
- 🍩 Donut charts (Investment distribution)
- 🌳 Tree visualizations (Binary/Unilevel genealogy)

### 🔐 **Security Features**

- 🔒 JWT-based authentication with auto-refresh
- 🔐 Transaction PIN for withdrawals
- 🛡️ Two-Factor Authentication (2FA)
- 👁️ Session management
- 🚨 Login history tracking
- 🔑 Secure password handling

---

## 🛠️ Tech Stack

### **Core**
- **React** 18.2 - UI library
- **TypeScript** 5.3 - Type safety
- **Vite** 5.0 - Build tool & dev server

### **UI Framework**
- **Material-UI (MUI)** 5.15 - Component library
- **Tailwind CSS** 3.4 - Utility-first CSS
- **Framer Motion** 10.16 - Animations
- **React Icons** 4.12 - Icon library

### **State Management**
- **Redux Toolkit** 2.0 - State management
- **RTK Query** - API & caching

### **Forms & Validation**
- **React Hook Form** 7.49 - Form handling
- **Yup** 1.3 - Schema validation

### **Charts & Data Viz**
- **Recharts** 2.10 - Charts library
- **Chart.js** 4.4 - Advanced charts
- **react-d3-tree** 3.6 - Tree visualization

### **Utilities**
- **Axios** 1.6 - HTTP client
- **Day.js** 1.11 - Date manipulation
- **Lodash** 4.17 - Utility functions
- **jsPDF** 2.5 - PDF generation
- **html2canvas** 1.4 - Canvas rendering

### **Additional**
- **React Router** 6.20 - Routing
- **React Toastify** 9.1 - Notifications
- **SweetAlert2** 11.10 - Dialogs
- **React Dropzone** 14.2 - File uploads
- **QRCode.react** 3.1 - QR code generation
- **Razorpay** 2.9 - Payment gateway

---

## 📁 Project Structure

```
react-user-panel/
├── public/                      # Static assets
│   ├── assets/
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── api/                     # API service layer
│   │   ├── config/
│   │   │   └── axiosConfig.ts   # Axios configuration & interceptors
│   │   ├── auth.api.ts          # Authentication APIs
│   │   ├── user.api.ts          # User profile APIs
│   │   ├── property.api.ts      # Property APIs
│   │   ├── investment.api.ts    # Investment APIs
│   │   ├── wallet.api.ts        # Wallet APIs
│   │   ├── commission.api.ts    # Commission APIs
│   │   ├── payout.api.ts        # Payout APIs
│   │   ├── team.api.ts          # Team & genealogy APIs
│   │   ├── notification.api.ts  # Notification APIs
│   │   ├── ticket.api.ts        # Support ticket APIs
│   │   └── report.api.ts        # Reports APIs
│   ├── assets/                  # Styles, images, icons
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── global.css       # Global styles
│   │       └── variables.css    # CSS variables
│   ├── components/              # Reusable components
│   │   ├── common/              # Common components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ...
│   │   ├── cards/               # Card components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── InvestmentCard.tsx
│   │   │   ├── CommissionCard.tsx
│   │   │   ├── WalletCard.tsx
│   │   │   └── UserCard.tsx
│   │   ├── charts/              # Chart components
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   └── AreaChart.tsx
│   │   ├── forms/               # Form components
│   │   │   ├── InputField.tsx
│   │   │   ├── SelectField.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── PasswordStrength.tsx
│   │   ├── modals/              # Modal components
│   │   │   ├── InvestmentModal.tsx
│   │   │   ├── WithdrawalModal.tsx
│   │   │   ├── ProfileEditModal.tsx
│   │   │   └── ConfirmModal.tsx
│   │   └── tree/                # Tree components
│   │       ├── BinaryTree.tsx
│   │       ├── UnilevelTree.tsx
│   │       └── TreeNode.tsx
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useWindowSize.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── useNotification.ts
│   ├── layouts/                 # Layout components
│   │   ├── AuthLayout.tsx       # Auth pages layout
│   │   ├── DashboardLayout.tsx  # Dashboard layout
│   │   └── BlankLayout.tsx      # Minimal layout
│   ├── pages/                   # Page components
│   │   ├── auth/                # Authentication pages
│   │   ├── dashboard/           # Dashboard page
│   │   ├── profile/             # Profile pages
│   │   ├── properties/          # Property pages
│   │   ├── investments/         # Investment pages
│   │   ├── wallet/              # Wallet pages
│   │   ├── commissions/         # Commission pages
│   │   ├── team/                # Team pages
│   │   ├── rank/                # Rank pages
│   │   ├── referral/            # Referral pages
│   │   ├── kyc/                 # KYC pages
│   │   ├── support/             # Support pages
│   │   ├── reports/             # Reports pages
│   │   ├── notifications/       # Notifications pages
│   │   └── settings/            # Settings pages
│   ├── redux/                   # Redux store
│   │   ├── slices/              # Redux slices
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── propertySlice.ts
│   │   │   ├── walletSlice.ts
│   │   │   ├── notificationSlice.ts
│   │   │   └── themeSlice.ts
│   │   ├── services/            # RTK Query services
│   │   │   ├── authService.ts
│   │   │   ├── propertyService.ts
│   │   │   └── walletService.ts
│   │   └── store.ts             # Redux store configuration
│   ├── routes/                  # Routing configuration
│   │   ├── AppRoutes.tsx        # Main routes component
│   │   ├── PrivateRoute.tsx     # Protected route wrapper
│   │   └── routes.config.ts     # Route definitions
│   ├── types/                   # TypeScript types
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── property.types.ts
│   │   ├── investment.types.ts
│   │   ├── wallet.types.ts
│   │   ├── commission.types.ts
│   │   ├── team.types.ts
│   │   ├── notification.types.ts
│   │   ├── support.types.ts
│   │   └── ...
│   ├── utils/                   # Utility functions
│   │   ├── constants.ts         # App constants
│   │   ├── helpers.ts           # Helper functions
│   │   ├── validators.ts        # Validation functions
│   │   ├── formatters.ts        # Format functions
│   │   ├── storage.ts           # LocalStorage helpers
│   │   └── exportPDF.ts         # PDF export utilities
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite types
├── .env.example                 # Environment variables example
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript config for Node
├── vite.config.ts               # Vite configuration
└── README.md                    # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git** >= 2.30.0

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mlm-react-user-panel.git
cd mlm-react-user-panel/react-user-panel
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://your-api.com/api
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=MLM Real Estate User Panel
VITE_APP_VERSION=1.0.0

# Razorpay Configuration (Payment Gateway)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Google Maps API (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_SOCIAL_LOGIN=false

# Environment
VITE_ENV=development
```

---

## 🔧 Configuration

### API Base URL

Update the API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Razorpay Payment Gateway

To enable payments, add your Razorpay key:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

### Google Maps (Optional)

For location features:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The app will be available at: **http://localhost:3000**

### Features in Development Mode:
- ⚡ Hot Module Replacement (HMR)
- 🔍 Redux DevTools enabled
- 📝 Source maps for debugging
- 🚨 Error overlay

---

## 🏗️ Building for Production

### Build

```bash
npm run build
# or
yarn build
```

This will:
- ✅ Type-check with TypeScript
- ✅ Optimize assets (minify, compress)
- ✅ Generate production build in `dist/`
- ✅ Code split for optimal loading
- ✅ Generate service worker for PWA

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

Serves the production build at: **http://localhost:4173**

---

## 📱 Module Overview

### 1. **Authentication Module**
- **Login** - Email/Mobile + Password, Social login
- **Register** - Multi-step form with sponsor validation
- **OTP Verification** - 6-digit OTP with resend
- **Password Reset** - Forgot & reset password flow

### 2. **Dashboard**
- 8 stats cards with trends
- 4 interactive charts
- Recent activities feed
- Announcements carousel
- Quick action cards

### 3. **Profile Management**
- **Profile View** - 6 tabs (Personal, MLM, Financial, Bank, KYC, Security)
- **Edit Profile** - Update personal information
- **Digital ID Card** - Download as PNG/PDF, share

### 4. **Properties**
- **Marketplace** - Browse properties with advanced filters
- **Property Details** - Complete property information with investment calculator
- **Investment Modal** - Multi-step investment process with Razorpay

### 5. **Investments**
- **My Investments** - List with filters & stats
- **Investment Details** - Comprehensive details with installment tracking
- **Portfolio** - Performance charts & analytics

### 6. **Wallet**
- **Overview** - 4 wallet types (Commission, Investment, Rental, ROI)
- **Transactions** - Advanced filtering & export
- **Withdrawal** - Request withdrawal with bank/UPI
- **Bank Accounts** - Manage bank accounts

### 7. **Commissions**
- **Overview** - Total earnings with type breakdown
- **History** - Detailed commission history with filters

### 8. **Team & Genealogy**
- **Overview** - Team statistics
- **Binary Tree** - Interactive binary tree visualization
- **Unilevel Tree** - Unilevel structure
- **Direct Referrals** - List of direct team members
- **Team Report** - Comprehensive team analytics

### 9. **Rank & Achievements**
- **My Rank** - Current rank with benefits
- **Progress** - Track progress to next rank
- **All Ranks** - View all rank requirements
- **Achievements** - Unlock achievements & rewards

### 10. **Referral Tools**
- Referral code with QR code
- Share on social media
- Link tracking & analytics
- My referrals list

### 11. **KYC Documents**
- Upload documents (PAN, Aadhaar, Address, Bank, Selfie)
- Track verification status
- KYC levels (Basic, Full, Premium)

### 12. **Support**
- **Tickets** - Create & manage support tickets
- **Ticket Details** - Chat-like conversation
- **FAQ** - Searchable knowledge base

### 13. **Reports**
- Monthly statements
- Tax reports
- Commission reports
- Investment reports
- Team reports
- Export as PDF/Excel

### 14. **Notifications**
- Real-time notifications
- Category filters
- Mark as read/unread
- Notification preferences

### 15. **Settings**
- Account settings
- Security (2FA, sessions)
- Notification preferences
- Theme & accessibility
- About & legal

---

## 🔌 API Integration

### Backend Requirements

The React app expects a Spring Boot backend with the following endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Send reset link
- `POST /api/auth/reset-password` - Reset password

#### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/rank-status` - Get rank progress
- `GET /api/users/team-count` - Get team statistics

#### Properties
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/{id}` - Get property details
- `POST /api/properties/{id}/view` - Track property view

#### Investments
- `POST /api/investments` - Create investment
- `GET /api/investments/my-investments` - List user investments
- `GET /api/investments/{id}` - Get investment details
- `GET /api/investments/portfolio` - Get portfolio summary

#### Wallet
- `GET /api/wallet/balance` - Get wallet balances
- `GET /api/wallet/transactions` - Get transactions
- `POST /api/wallet/add-money` - Add money to wallet

#### Payouts
- `POST /api/payouts/request` - Request withdrawal
- `GET /api/payouts/history` - Get withdrawal history
- `GET /api/payouts/rules` - Get withdrawal rules

#### Commissions
- `GET /api/commissions/summary` - Get commission summary
- `GET /api/commissions` - Get commission history

#### Team
- `GET /api/team/stats` - Get team statistics
- `GET /api/team/binary-tree` - Get binary tree data
- `GET /api/team/unilevel-tree` - Get unilevel tree data
- `GET /api/team/direct-referrals` - Get direct referrals

#### KYC
- `GET /api/kyc/documents` - Get KYC documents
- `POST /api/kyc/upload` - Upload KYC document

#### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark as read

#### Support
- `GET /api/tickets` - Get support tickets
- `POST /api/tickets` - Create ticket
- `POST /api/tickets/{id}/reply` - Reply to ticket

#### Reports
- `GET /api/reports/{reportType}` - Generate report

### API Response Format

Expected API response format:

```typescript
// Success Response
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Error message",
  "error": "Error details",
  "errors": {
    "field": ["Error message"]
  }
}

// Paginated Response
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "pageSize": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Type Checking
npm run type-check   # TypeScript type checking

# Linting
npm run lint         # Run ESLint
```

---

## 🌍 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080/api` | Yes |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` | No |
| `VITE_APP_NAME` | Application name | `MLM Real Estate User Panel` | No |
| `VITE_APP_VERSION` | Application version | `1.0.0` | No |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key for payments | - | For payments |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | - | For maps |
| `VITE_ENABLE_PWA` | Enable PWA features | `true` | No |
| `VITE_ENABLE_SOCIAL_LOGIN` | Enable social login | `false` | No |
| `VITE_ENV` | Environment (development/production) | `development` | No |

---

## 📝 Code Style

This project follows:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** (recommended) - Code formatting
- **TypeScript Strict Mode** - Maximum type safety

### Code Conventions

- **Components**: PascalCase (e.g., `UserCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Types**: PascalCase with `.types.ts` suffix
- **Constants**: UPPER_SNAKE_CASE
- **Functions**: camelCase
- **CSS Classes**: kebab-case (BEM methodology)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Support

For support, email: support@mlm-realestate.com

Or create an issue in the repository.

---

## 🙏 Acknowledgments

- **Material-UI** - Component library
- **Recharts** - Chart library
- **Redux Toolkit** - State management
- **Vite** - Build tool

---

## 📊 Project Stats

- **Total Files**: 250+
- **Total Lines of Code**: 50,000+
- **Components**: 80+
- **Pages**: 40+
- **API Endpoints**: 50+
- **TypeScript Coverage**: 100%

---

**Built with ❤️ for MLM Real Estate Platform**

**Version**: 1.0.0
**Last Updated**: November 2025

---

## 🚀 Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Copy `.env.example` to `.env`
- [ ] Configure API base URL
- [ ] Configure Razorpay key (for payments)
- [ ] Run development server (`npm run dev`)
- [ ] Open http://localhost:3000
- [ ] Login with demo credentials or register

---

## 📞 Contact

**Project Maintainer**: MLM Real Estate Team
**Email**: dev@mlm-realestate.com
**Website**: https://mlm-realestate.com

---

*Ready to revolutionize your MLM real estate business? Let's get started!* 🚀
