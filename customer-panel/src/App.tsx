import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import { store } from './redux/store';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { PropertyDirectory } from './pages/PropertyDirectory';
import ProtectedRoute from './routes/ProtectedRoute';

// Import other pages (create simple placeholders for now)
import { Clients } from './pages/Clients';
import { Tasks } from './pages/Tasks';
import { SiteVisits } from './pages/SiteVisits';
import { Documents } from './pages/Documents';
import { Commissions } from './pages/Commissions';
import { EMITracking } from './pages/EMITracking';
import { Profile } from './pages/Profile';
import { MyBookings } from './pages/MyBookings';
import { Notifications } from './pages/Notifications';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <AntdApp>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/properties" element={<PropertyDirectory />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/site-visits" element={<SiteVisits />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/commissions" element={<Commissions />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/emi-tracking" element={<EMITracking />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
