import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { store } from './redux/store';
import { initializeTheme } from './redux/slices/themeSlice';
import './assets/styles/global.css';
import './assets/styles/variables.css';

// Clear old service workers that might be caching routes
// This fixes 404 errors on page refresh when using React Router
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    // Only unregister if PWA is not explicitly enabled
    if (import.meta.env.VITE_ENABLE_PWA !== 'true') {
      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Old service worker unregistered successfully');
          }
        });
      });
    }
  }).catch((err) => {
    console.error('Service worker unregistration failed:', err);
  });
}

// Initialize theme on app load
store.dispatch(initializeTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </LocalizationProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
