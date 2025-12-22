import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Lazy load pages
const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const TwoFactorAuth = lazy(() => import('@/pages/auth/TwoFactorAuth'));

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

const UsersList = lazy(() => import('@/pages/users/UsersList'));
const UserDetail = lazy(() => import('@/pages/users/UserDetail'));
const AddEditUser = lazy(() => import('@/pages/users/AddEditUser'));
const GenealogyTree = lazy(() => import('@/pages/users/GenealogyTree'));

const RegistrationManagement = lazy(() => import('@/pages/registrations/RegistrationManagement'));

const PropertiesList = lazy(() => import('@/pages/properties/PropertiesList'));
const PropertyDetail = lazy(() => import('@/pages/properties/PropertyDetail'));
const AddEditProperty = lazy(() => import('@/pages/properties/AddEditProperty'));
const PropertyInvestors = lazy(() => import('@/pages/properties/PropertyInvestors'));

const InvestmentsList = lazy(() => import('@/pages/investments/InvestmentsList'));
const InvestmentDetail = lazy(() => import('@/pages/investments/InvestmentDetail'));
const PendingApprovals = lazy(() => import('@/pages/investments/PendingApprovals'));

const CommissionsList = lazy(() => import('@/pages/commissions/CommissionsList'));
const CommissionDetail = lazy(() => import('@/pages/commissions/CommissionDetail'));
const CommissionSettings = lazy(() => import('@/pages/commissions/CommissionSettings'));

const DirectBonus = lazy(() => import('@/pages/incomes/DirectBonus'));
const LevelBonus = lazy(() => import('@/pages/incomes/LevelBonus'));
const MatchingBonus = lazy(() => import('@/pages/incomes/MatchingBonus'));
const ROIBonus = lazy(() => import('@/pages/incomes/ROIBonus'));
const RewardStatus = lazy(() => import('@/pages/incomes/RewardStatus'));
const IncomeSummary = lazy(() => import('@/pages/incomes/IncomeSummary'));

const TreeView = lazy(() => import('@/pages/team/TreeView'));
const TeamLevelTreeView = lazy(() => import('@/pages/team/TeamLevelTreeView'));
const DirectReferral = lazy(() => import('@/pages/team/DirectReferral'));
const TotalDownline = lazy(() => import('@/pages/team/TotalDownline'));
const TeamLevelDownline = lazy(() => import('@/pages/team/TeamLevelDownline'));
const DownlineBusiness = lazy(() => import('@/pages/team/DownlineBusiness'));
const TeamDetail = lazy(() => import('@/pages/team/TeamDetail'));

const PendingPayouts = lazy(() => import('@/pages/payouts/PendingPayouts'));
const AllPayouts = lazy(() => import('@/pages/payouts/AllPayouts'));
const PayoutDetail = lazy(() => import('@/pages/payouts/PayoutDetail'));

const PendingKYC = lazy(() => import('@/pages/kyc/PendingKYC'));
const AllKYC = lazy(() => import('@/pages/kyc/AllKYC'));

const SendBroadcast = lazy(() => import('@/pages/notifications/SendBroadcast'));
const NotificationHistory = lazy(() => import('@/pages/notifications/NotificationHistory'));

const TicketsList = lazy(() => import('@/pages/support/TicketsList'));
const TicketDetail = lazy(() => import('@/pages/support/TicketDetail'));

const ReportsDashboard = lazy(() => import('@/pages/reports/ReportsDashboard'));

const RankSettings = lazy(() => import('@/pages/ranks/RankSettings'));
const RankAchievements = lazy(() => import('@/pages/ranks/RankAchievements'));

const GeneralSettings = lazy(() => import('@/pages/settings/GeneralSettings'));
const AdminUsers = lazy(() => import('@/pages/settings/AdminUsers'));
const PlanSettings = lazy(() => import('@/pages/settings/PlanSettings'));

const AuditLogs = lazy(() => import('@/pages/audit/AuditLogs'));

const DepositManagement = lazy(() => import('@/pages/deposits/DepositManagement'));
const WithdrawalManagement = lazy(() => import('@/pages/withdrawals/WithdrawalManagement'));
const EPinManagement = lazy(() => import('@/pages/epins/EPinManagement'));

const BonanzaManagement = lazy(() => import('@/pages/bonanza/BonanzaManagement'));
const BonanzaForm = lazy(() => import('@/pages/bonanza/BonanzaForm'));
const BonanzaDashboard = lazy(() => import('@/pages/bonanza/BonanzaDashboard'));

const NewTopup = lazy(() => import('@/pages/topup/NewTopup'));
const TopupHistory = lazy(() => import('@/pages/topup/TopupHistory'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter basename="/admin" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="2fa" element={<TwoFactorAuth />} />
          </Route>

          {/* Dashboard Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />

            {/* Users */}
            <Route path="users" element={<UsersList />} />
            <Route path="users/add" element={<AddEditUser />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="users/edit/:id" element={<AddEditUser />} />
            <Route path="users/tree/:id" element={<GenealogyTree />} />

            {/* Registrations */}
            <Route path="registrations" element={<RegistrationManagement />} />

            {/* Properties */}
            <Route path="properties" element={<PropertiesList />} />
            <Route path="properties/add" element={<AddEditProperty />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="properties/edit/:id" element={<AddEditProperty />} />
            <Route path="properties/:id/investors" element={<PropertyInvestors />} />

            {/* Investments */}
            <Route path="investments" element={<InvestmentsList />} />
            <Route path="investments/pending" element={<PendingApprovals />} />
            <Route path="investments/:id" element={<InvestmentDetail />} />

            {/* Commissions */}
            <Route path="commissions" element={<CommissionsList />} />
            <Route path="commissions/settings" element={<CommissionSettings />} />
            <Route path="commissions/:id" element={<CommissionDetail />} />

            {/* Incomes */}
            <Route path="incomes/direct-bonus" element={<DirectBonus />} />
            <Route path="incomes/level-bonus" element={<LevelBonus />} />
            <Route path="incomes/matching-bonus" element={<MatchingBonus />} />
            <Route path="incomes/roi-bonus" element={<ROIBonus />} />
            <Route path="incomes/reward-status" element={<RewardStatus />} />
            <Route path="incomes/summary" element={<IncomeSummary />} />

            {/* Team */}
            <Route path="team/tree-view" element={<TreeView />} />
            <Route path="team/level-tree-view" element={<TeamLevelTreeView />} />
            <Route path="team/direct-referral" element={<DirectReferral />} />
            <Route path="team/total-downline" element={<TotalDownline />} />
            <Route path="team/level-downline" element={<TeamLevelDownline />} />
            <Route path="team/downline-business" element={<DownlineBusiness />} />
            <Route path="team/detail/:id" element={<TeamDetail />} />

            {/* Payouts */}
            <Route path="payouts" element={<AllPayouts />} />
            <Route path="payouts/pending" element={<PendingPayouts />} />
            <Route path="payouts/:id" element={<PayoutDetail />} />

            {/* KYC */}
            <Route path="kyc" element={<AllKYC />} />
            <Route path="kyc/pending" element={<PendingKYC />} />

            {/* Notifications */}
            <Route path="notifications" element={<NotificationHistory />} />
            <Route path="notifications/send" element={<SendBroadcast />} />
            <Route path="notifications/history" element={<NotificationHistory />} />

            {/* Support */}
            <Route path="support" element={<TicketsList />} />
            <Route path="support/:id" element={<TicketDetail />} />

            {/* Reports */}
            <Route path="reports" element={<ReportsDashboard />} />

            {/* Ranks */}
            <Route path="ranks" element={<RankSettings />} />
            <Route path="ranks/settings" element={<RankSettings />} />
            <Route path="ranks/achievements" element={<RankAchievements />} />

            {/* Settings */}
            <Route path="settings" element={<GeneralSettings />} />
            <Route path="settings/general" element={<GeneralSettings />} />
            <Route path="settings/admins" element={<AdminUsers />} />
            <Route path="settings/plan" element={<PlanSettings />} />

            {/* Audit */}
            <Route path="audit-logs" element={<AuditLogs />} />

            {/* Deposits */}
            <Route path="deposits" element={<DepositManagement />} />

            {/* Withdrawals */}
            <Route path="withdrawals" element={<WithdrawalManagement />} />

            {/* E-Pins */}
            <Route path="epins" element={<EPinManagement />} />

            {/* Bonanza */}
            <Route path="bonanza" element={<BonanzaManagement />} />
            <Route path="bonanza/create" element={<BonanzaForm />} />
            <Route path="bonanza/:id" element={<BonanzaForm />} />
            <Route path="bonanza/:id/edit" element={<BonanzaForm />} />
            <Route path="bonanza/:id/dashboard" element={<BonanzaDashboard />} />

            {/* Topup */}
            <Route path="topup/new" element={<NewTopup />} />
            <Route path="topup/history" element={<TopupHistory />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
