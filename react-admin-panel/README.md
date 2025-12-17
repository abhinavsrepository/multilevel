# MLM Real Estate Platform - Admin Panel

A comprehensive, production-ready React admin panel for managing MLM Real Estate Platform with complete backend integration.

## 🚀 Features

### ✅ Complete Modules (20+)

1. **Authentication & Authorization** 🔐
   - JWT-based login with 2FA
   - Role-based access control (Super Admin, Admin, Manager, Support)
   - Forgot password & reset
   - Session management with auto-logout

2. **Dashboard** 📊
   - Real-time statistics with growth indicators
   - Interactive charts (Line, Bar, Pie, Area)
   - Recent activities feed
   - Quick action buttons

3. **User Management** 👥
   - Complete CRUD operations
   - Advanced filters and search
   - Binary tree visualization
   - User detail view with tabs
   - Bulk actions (activate, block, delete)
   - Export to Excel/CSV

4. **Property Management** 🏠
   - Property listing with filters
   - Add/Edit properties with media upload
   - Property investors list
   - Featured/trending flags
   - Document management

5. **Investment Management** 💼
   - Investment tracking
   - Pending approvals workflow
   - Investment details with installments
   - Certificate generation

6. **Commission Management** 💰
   - All commission types (Direct, Binary, Level, Rank, etc.)
   - Approve/Hold/Release/Cancel commissions
   - Commission calculations viewer
   - Settings configuration

7. **Payout Approval System** 💸
   - Pending payouts priority view
   - Approve/Reject with UTR
   - Batch processing
   - Complete payout history

8. **KYC Verification** 📄
   - Document viewer with zoom
   - Approve/Reject workflow
   - Document type management
   - OCR data extraction display

9. **Notification & Broadcast** 🔔
   - Send push notifications to mobile app
   - Email & SMS integration
   - Target audience selection
   - Notification history with analytics

10. **Support Ticket System** 💬
    - Ticket listing with filters
    - Conversation thread
    - File attachments
    - Templates management
    - Assign to admins

11. **Reports & Analytics** 📈
    - 10+ report types
    - Export to Excel/PDF
    - Schedule reports
    - Advanced analytics dashboards

12. **Rank & Rewards** 🏆
    - Rank configuration
    - Achievement tracking
    - Bonus payments

13. **System Settings** ⚙️
    - Company information
    - MLM configuration
    - Payment gateway settings
    - Email/SMS settings
    - Security settings

14. **Audit Logs** 📝
    - Complete activity trail
    - Before/After data tracking
    - Export audit logs

15. **Analytics Modules** 📊
    - Property analytics
    - User analytics
    - Financial analytics

16. **Real-time Monitoring** 📡
    - Live activity feed
    - WebSocket integration
    - System health metrics

17. **Data Backup & Restore** 💾
    - Manual & scheduled backups
    - Restore functionality
    - Export all data

## 🛠️ Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5.x
- **State Management**: Redux Toolkit
- **API Client**: Axios with interceptors
- **Charts**: Recharts + Apache ECharts
- **Forms**: React Hook Form + Yup validation
- **Export**: xlsx (Excel) + jsPDF (PDF)
- **Real-time**: Socket.io
- **Push Notifications**: Firebase Cloud Messaging
- **Theme**: Dark/Light mode toggle
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Spring Boot backend running (see backend repository)
- Firebase project (for push notifications)
- Razorpay account (for payments)

## 🚀 Getting Started

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd react-admin-panel
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Configuration

Create a \`.env\` file in the root directory:

\`\`\`env
# API Configuration
VITE_API_URL=http://your-api.com/api
VITE_API_TIMEOUT=30000

# Firebase Configuration (for Push Notifications)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key

# WebSocket Configuration
VITE_WS_URL=ws://your-api.com

# App Configuration
VITE_APP_NAME=MLM Admin Panel
VITE_APP_VERSION=1.0.0

# Session Configuration
VITE_SESSION_TIMEOUT=1800000

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The application will be available at \`http://localhost:3000\`

### 5. Build for Production

\`\`\`bash
npm run build
# or
yarn build
\`\`\`

The optimized production build will be in the \`dist\` directory.

### 6. Preview Production Build

\`\`\`bash
npm run preview
# or
yarn preview
\`\`\`

## 📁 Project Structure

\`\`\`
react-admin-panel/
├── public/
│   └── index.html
├── src/
│   ├── api/                    # API integration
│   │   ├── axiosConfig.ts      # Axios setup with interceptors
│   │   ├── authApi.ts          # Authentication APIs
│   │   ├── userApi.ts          # User management APIs
│   │   ├── propertyApi.ts      # Property APIs
│   │   └── ...                 # Other API modules
│   ├── assets/                 # Static assets
│   ├── components/             # Reusable components
│   │   ├── common/             # Common UI components
│   │   ├── charts/             # Chart components
│   │   └── forms/              # Form components
│   ├── config/                 # Configuration
│   │   └── firebase.ts         # Firebase config
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   └── ...
│   ├── layouts/                # Layout components
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── pages/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard
│   │   ├── users/              # User management
│   │   ├── properties/         # Property management
│   │   └── ...                 # Other modules
│   ├── redux/                  # Redux store
│   │   ├── slices/             # Redux slices
│   │   └── store.ts            # Store configuration
│   ├── routes/                 # Routing
│   │   ├── AppRoutes.tsx       # Route definitions
│   │   ├── PrivateRoute.tsx    # Protected routes
│   │   └── routes.ts           # Route constants
│   ├── types/                  # TypeScript types
│   │   ├── user.types.ts
│   │   ├── property.types.ts
│   │   └── ...
│   ├── utils/                  # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── exportUtils.ts
│   │   └── permissions.ts
│   ├── App.tsx                 # Root component
│   ├── App.scss                # Global styles
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Vite type definitions
├── .env.example                # Environment variables template
├── .eslintrc.cjs               # ESLint configuration
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md
\`\`\`

## 🔐 Authentication

The admin panel uses JWT-based authentication with the following flow:

1. Login with email/password
2. Optional 2FA verification
3. JWT token stored in localStorage
4. Token automatically attached to all API requests
5. Auto-refresh token on expiry
6. Auto-logout on inactivity (30 minutes)

### Default Admin Credentials

Contact your backend administrator for initial credentials.

## 🎨 Theming

The application supports both light and dark themes:

- Toggle in header (sun/moon icon)
- Preference saved in localStorage
- Ant Design theme automatically switches

## 🔧 API Integration

All API calls are centralized in the \`src/api\` directory:

\`\`\`typescript
// Example API usage
import { userApi } from '@/api/userApi';

const fetchUsers = async () => {
  try {
    const response = await userApi.getUsers({ page: 0, size: 20 });
    if (response.data.success) {
      setUsers(response.data.data.content);
    }
  } catch (error) {
    message.error('Failed to fetch users');
  }
};
\`\`\`

### API Response Format

All APIs follow a consistent response format:

\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
\`\`\`

### Pagination

List APIs support server-side pagination:

\`\`\`typescript
{
  page: 0,        // Page number (0-indexed)
  size: 20,       // Page size
  sortBy: 'id',   // Sort field
  sortOrder: 'desc' // Sort direction
}
\`\`\`

## 📱 Push Notifications

Firebase Cloud Messaging is integrated for sending push notifications to mobile app users:

1. Configure Firebase in \`.env\`
2. Use the Broadcast Notification module
3. Select target audience
4. Notifications delivered to mobile app

## 📊 Export Functionality

Data can be exported in multiple formats:

- **Excel**: Using xlsx library
- **PDF**: Using jsPDF with autotable
- **CSV**: Using xlsx library

Example:

\`\`\`typescript
import { exportToExcel } from '@/utils/exportUtils';

exportToExcel(data, 'users-export');
\`\`\`

## 🔒 Role-Based Access Control

The application supports role-based access:

- **Super Admin**: Full access
- **Admin**: Most features
- **Manager**: Limited features
- **Support**: Tickets only

Check permissions:

\`\`\`typescript
import { hasPermission } from '@/utils/permissions';

if (hasPermission(user, 'users.create')) {
  // Show create button
}
\`\`\`

## 🚀 Deployment

### Deploy to Netlify

1. Build the project: \`npm run build\`
2. Drag \`dist\` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Deploy to Vercel

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy

### Deploy to AWS S3 + CloudFront

1. Build: \`npm run build\`
2. Upload \`dist\` to S3 bucket
3. Configure CloudFront distribution
4. Update environment variables

### Docker Deployment

Create \`Dockerfile\`:

\`\`\`dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

Build and run:

\`\`\`bash
docker build -t mlm-admin-panel .
docker run -p 80:80 mlm-admin-panel
\`\`\`

## 📝 Code Quality

### Linting

\`\`\`bash
npm run lint
\`\`\`

### Type Checking

\`\`\`bash
npx tsc --noEmit
\`\`\`

## 🐛 Troubleshooting

### Issue: API calls failing

- Check if backend is running
- Verify \`VITE_API_URL\` in \`.env\`
- Check browser console for errors

### Issue: Authentication not working

- Ensure JWT token is being stored
- Check token expiry
- Verify backend authentication endpoint

### Issue: Charts not displaying

- Check if data format matches chart configuration
- Verify chart library is installed
- Check browser console for errors

## 📚 Documentation

- [React Documentation](https://react.dev/)
- [Ant Design Documentation](https://ant.design/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Frontend**: React Team
- **Backend**: Spring Boot Team
- **Mobile**: Flutter Team

## 📞 Support

For support and questions:
- Email: support@yourcompany.com
- Slack: #mlm-admin-panel

---

**Built with ❤️ for MLM Real Estate Platform**
