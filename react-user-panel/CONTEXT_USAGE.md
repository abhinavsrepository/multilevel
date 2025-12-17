# Context Providers & Global Styles - Usage Guide

This guide explains how to use the global styles and context providers in the React User Panel.

## Table of Contents

1. [Global Styles Setup](#global-styles-setup)
2. [Context Providers Setup](#context-providers-setup)
3. [Using AuthContext](#using-authcontext)
4. [Using ThemeContext](#using-themecontext)
5. [Complete App.tsx Example](#complete-apptsx-example)

---

## Global Styles Setup

### File Structure

```
src/assets/styles/
├── variables.css     # CSS custom properties (colors, spacing, etc.)
├── global.css        # Global styles, Tailwind imports, animations
└── index.ts          # Style imports entry point
```

### Import in main.tsx or App.tsx

```tsx
// In src/main.tsx or src/App.tsx
import './assets/styles/index';
// or
import './assets/styles/variables.css';
import './assets/styles/global.css';
```

### Available CSS Variables

The `variables.css` file provides extensive CSS custom properties:

- **Colors**: Primary, secondary, semantic colors (success, warning, error, info)
- **Spacing**: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- **Typography**: Font families, sizes, weights, line heights
- **Borders**: Border radius variants
- **Shadows**: xs, sm, md, lg, xl, 2xl
- **Layout**: Container widths, sidebar dimensions, header/footer heights
- **Z-indices**: For layering modals, tooltips, etc.

### Theme Support

Variables automatically adjust based on:
- `data-theme="light"` or `data-theme="dark"`
- `data-color-scheme="default|blue|green|purple|orange"`
- `data-font-size="small|medium|large"`
- `data-compact="true|false"`
- `data-high-contrast="true|false"`
- `data-animations="true|false"`

---

## Context Providers Setup

### File Structure

```
src/context/
├── AuthContext.tsx    # Authentication context
├── ThemeContext.tsx   # Theme & Material-UI integration
└── index.ts           # Context exports
```

### Provider Hierarchy

Wrap your app with providers in the correct order:

```tsx
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider, ThemeProvider } from './context';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          {/* Your app components */}
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
```

**Order matters:**
1. Redux Provider (outermost)
2. ThemeProvider (provides Material-UI theme)
3. AuthProvider (consumes theme, provides auth)
4. Your app components (innermost)

---

## Using AuthContext

### Basic Usage

```tsx
import { useAuthContext } from '../context';

function MyComponent() {
  const {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error
  } = useAuthContext();

  const handleLogin = async () => {
    try {
      await login({
        emailOrMobile: 'user@example.com',
        password: 'password123',
        rememberMe: true
      });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.fullName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Available Auth Methods

```tsx
const {
  // State
  isAuthenticated,      // boolean
  user,                 // AuthUser | null
  token,                // string | null
  loading,              // boolean
  error,                // string | null

  // Actions
  login,                // (credentials: LoginRequest) => Promise<void>
  register,             // (data: RegisterRequest) => Promise<void>
  logout,               // () => Promise<void>
  refreshToken,         // () => Promise<void>
  verifyToken,          // () => Promise<void>
  setUser,              // (user: AuthUser) => void
  updateUser,           // (userData: Partial<AuthUser>) => void
  clearError,           // () => void
  resetAuth,            // () => void

  // Utility functions
  hasRole,              // (role: string) => boolean
  hasPermission,        // (permission: string) => boolean
  isKYCVerified,        // () => boolean
  isEmailVerified,      // () => boolean
  isMobileVerified,     // () => boolean
} = useAuthContext();
```

### HOCs (Higher-Order Components)

#### Require Authentication

```tsx
import { withAuth } from '../context';

const ProtectedComponent = () => {
  return <div>This is only visible to authenticated users</div>;
};

export default withAuth(ProtectedComponent);
```

#### Require Specific Role

```tsx
import { withRole } from '../context';

const AdminComponent = () => {
  return <div>Admin only content</div>;
};

export default withRole(AdminComponent, 'ADMIN');
```

#### Require KYC Verification

```tsx
import { withKYC } from '../context';

const KYCRequiredComponent = () => {
  return <div>KYC verified users only</div>;
};

export default withKYC(KYCRequiredComponent);
```

### Registration Example

```tsx
const handleRegister = async () => {
  try {
    await register({
      fullName: 'John Doe',
      email: 'john@example.com',
      mobile: '+1234567890',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
      sponsorId: 'SPONSOR123',
      placement: 'LEFT',
      termsAccepted: true,
      privacyAccepted: true
    });
  } catch (err) {
    console.error('Registration failed:', err);
  }
};
```

---

## Using ThemeContext

### Basic Usage

```tsx
import { useThemeContext } from '../context';

function ThemeToggle() {
  const {
    effectiveMode,
    toggleThemeMode,
    colorScheme,
    setColorScheme
  } = useThemeContext();

  return (
    <div>
      <p>Current theme: {effectiveMode}</p>
      <button onClick={toggleThemeMode}>
        Toggle Theme
      </button>
      <button onClick={() => setColorScheme('green')}>
        Use Green Theme
      </button>
    </div>
  );
}
```

### Available Theme Methods

```tsx
const {
  // State
  mode,                    // 'light' | 'dark' | 'system'
  effectiveMode,           // 'light' | 'dark' (resolved from system)
  colorScheme,             // 'default' | 'blue' | 'green' | 'purple' | 'orange'
  fontSize,                // 'small' | 'medium' | 'large'
  sidebarCollapsed,        // boolean
  compactMode,             // boolean
  animationsEnabled,       // boolean
  highContrast,            // boolean

  // Material-UI theme
  muiTheme,                // Theme object for Material-UI

  // Actions
  setThemeMode,            // (mode: ThemeMode) => void
  toggleThemeMode,         // () => void
  setColorScheme,          // (scheme: ColorScheme) => void
  setFontSize,             // (size: FontSize) => void
  toggleSidebar,           // () => void
  setSidebarCollapsed,     // (collapsed: boolean) => void
  setCompactMode,          // (compact: boolean) => void
  toggleCompactMode,       // () => void
  setAnimationsEnabled,    // (enabled: boolean) => void
  toggleAnimations,        // () => void
  setHighContrast,         // (enabled: boolean) => void
  toggleHighContrast,      // () => void
  resetThemeSettings,      // () => void

  // Utility functions
  isDarkMode,              // () => boolean
  isLightMode,             // () => boolean
} = useThemeContext();
```

### Settings Panel Example

```tsx
import { useThemeContext } from '../context';

function SettingsPanel() {
  const {
    mode,
    setThemeMode,
    colorScheme,
    setColorScheme,
    fontSize,
    setFontSize,
    compactMode,
    toggleCompactMode,
    animationsEnabled,
    toggleAnimations,
    highContrast,
    toggleHighContrast
  } = useThemeContext();

  return (
    <div>
      <h3>Appearance Settings</h3>

      {/* Theme Mode */}
      <div>
        <label>Theme Mode</label>
        <select value={mode} onChange={(e) => setThemeMode(e.target.value as any)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Color Scheme */}
      <div>
        <label>Color Scheme</label>
        <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value as any)}>
          <option value="default">Default Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="orange">Orange</option>
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label>Font Size</label>
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value as any)}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Toggles */}
      <label>
        <input
          type="checkbox"
          checked={compactMode}
          onChange={toggleCompactMode}
        />
        Compact Mode
      </label>

      <label>
        <input
          type="checkbox"
          checked={animationsEnabled}
          onChange={toggleAnimations}
        />
        Enable Animations
      </label>

      <label>
        <input
          type="checkbox"
          checked={highContrast}
          onChange={toggleHighContrast}
        />
        High Contrast
      </label>
    </div>
  );
}
```

### Using Material-UI Theme

The ThemeContext automatically provides a Material-UI theme based on Redux state:

```tsx
import { Box, Typography, Button } from '@mui/material';
import { useThemeContext } from '../context';

function StyledComponent() {
  const { muiTheme, isDarkMode } = useThemeContext();

  return (
    <Box
      sx={{
        backgroundColor: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary,
        padding: muiTheme.spacing(3),
        borderRadius: muiTheme.shape.borderRadius,
      }}
    >
      <Typography variant="h4" color="primary">
        This uses the Material-UI theme
      </Typography>
      <Button variant="contained" color="primary">
        Primary Button
      </Button>
      <p>Dark mode: {isDarkMode() ? 'Yes' : 'No'}</p>
    </Box>
  );
}
```

---

## Complete App.tsx Example

Here's a complete example of how to set up your app:

```tsx
// src/App.tsx
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Redux store
import { store } from './redux/store';

// Context providers
import { AuthProvider, ThemeProvider } from './context';

// Global styles
import './assets/styles/index';

// Components
import AppRoutes from './routes';
import { useAuthContext } from './context';

/**
 * Auth Initializer
 * Verifies token on app mount
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, verifyToken } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated) {
      verifyToken().catch((err) => {
        console.error('Token verification failed:', err);
      });
    }
  }, []); // Run only on mount

  return <>{children}</>;
}

/**
 * Main App Component
 */
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <AuthInitializer>
            <BrowserRouter>
              <AppRoutes />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </BrowserRouter>
          </AuthInitializer>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
```

### Main.tsx Setup

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Best Practices

### 1. Always Use Context Hooks

```tsx
// ✅ Good
const { user } = useAuthContext();

// ❌ Bad - Don't use Redux hooks directly in components
const user = useAppSelector(selectUser);
```

### 2. Memoize Expensive Computations

```tsx
const { user } = useAuthContext();

const userFullName = useMemo(() => {
  return user ? `${user.fullName} (${user.rank})` : 'Guest';
}, [user]);
```

### 3. Handle Errors Gracefully

```tsx
const { login, error, clearError } = useAuthContext();

useEffect(() => {
  if (error) {
    toast.error(error);
    clearError(); // Clear error after showing
  }
}, [error, clearError]);
```

### 4. Use CSS Variables in Styled Components

```tsx
import styled from '@emotion/styled';

const StyledCard = styled.div`
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  transition: box-shadow var(--transition-base) var(--transition-ease);

  &:hover {
    box-shadow: var(--shadow-lg);
  }
`;
```

### 5. Responsive to Theme Changes

```tsx
const { effectiveMode } = useThemeContext();

useEffect(() => {
  // Update chart colors when theme changes
  updateChartTheme(effectiveMode);
}, [effectiveMode]);
```

---

## TypeScript Support

All context providers are fully typed. TypeScript will provide autocomplete and type checking:

```tsx
import { useAuthContext, useThemeContext } from '../context';
import type { AuthUser, ThemeMode } from '../context';

// Fully typed
const { user } = useAuthContext(); // user: AuthUser | null
const { mode } = useThemeContext(); // mode: ThemeMode
```

---

## Testing

### Mocking Context in Tests

```tsx
import { render } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </Provider>
  );
};

test('renders user name', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText(/welcome/i)).toBeInTheDocument();
});
```

---

## Troubleshooting

### Context Not Available Error

**Error:** `useAuthContext must be used within an AuthProvider`

**Solution:** Ensure your component is wrapped in the provider:

```tsx
// ✅ Correct
<AuthProvider>
  <MyComponent />
</AuthProvider>

// ❌ Incorrect
<MyComponent /> // No provider!
```

### Theme Not Applying

**Issue:** Theme changes not visible

**Solution:** Ensure ThemeProvider is wrapping your app and global styles are imported:

```tsx
import './assets/styles/index';

<ThemeProvider>
  <App />
</ThemeProvider>
```

### Redux State Not Syncing

**Issue:** Context state not updating

**Solution:** Ensure Redux Provider is the outermost wrapper:

```tsx
<Provider store={store}>
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
</Provider>
```

---

## Summary

You now have:

1. **Global Styles** (`global.css`, `variables.css`) - Production-ready CSS with Tailwind integration
2. **AuthContext** - Easy access to authentication state and actions
3. **ThemeContext** - Material-UI theme integration with Redux theme state
4. **HOCs** - withAuth, withRole, withKYC for protecting components
5. **TypeScript Support** - Full type safety and autocomplete

All components integrate seamlessly with Redux while providing a cleaner, more convenient API for consuming state and actions in your components.
