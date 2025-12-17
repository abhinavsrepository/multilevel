import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppSelector, useAppDispatch } from '../redux/store';
import {
  selectThemeSettings,
  selectThemeMode,
  selectEffectiveThemeMode,
  selectColorScheme,
  selectFontSize,
  selectSidebarCollapsed,
  selectCompactMode,
  selectAnimationsEnabled,
  selectHighContrast,
  setThemeMode,
  toggleThemeMode,
  setColorScheme,
  setFontSize,
  toggleSidebar,
  setSidebarCollapsed,
  setCompactMode,
  toggleCompactMode,
  setAnimationsEnabled,
  toggleAnimations,
  setHighContrast,
  toggleHighContrast,
  resetThemeSettings,
  initializeTheme,
  ThemeMode,
  ColorScheme,
  FontSize,
} from '../redux/slices/themeSlice';

/**
 * Theme Context Type Definition
 */
interface ThemeContextType {
  // Theme state
  mode: ThemeMode;
  effectiveMode: 'light' | 'dark';
  colorScheme: ColorScheme;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;

  // Material-UI theme object
  muiTheme: Theme;

  // Theme actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: FontSize) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  toggleCompactMode: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  toggleAnimations: () => void;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  resetThemeSettings: () => void;

  // Utility functions
  isDarkMode: () => boolean;
  isLightMode: () => boolean;
}

/**
 * Create Theme Context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Context Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Get primary color based on color scheme
 */
const getPrimaryColor = (scheme: ColorScheme, isDark: boolean) => {
  const colorSchemes = {
    default: {
      light: { main: '#2563eb', light: '#60a5fa', dark: '#1e40af' },
      dark: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    },
    blue: {
      light: { main: '#2563eb', light: '#60a5fa', dark: '#1e40af' },
      dark: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    },
    green: {
      light: { main: '#059669', light: '#34d399', dark: '#047857' },
      dark: { main: '#10b981', light: '#34d399', dark: '#059669' },
    },
    purple: {
      light: { main: '#7c3aed', light: '#a78bfa', dark: '#6d28d9' },
      dark: { main: '#a855f7', light: '#c084fc', dark: '#9333ea' },
    },
    orange: {
      light: { main: '#ea580c', light: '#fb923c', dark: '#c2410c' },
      dark: { main: '#f97316', light: '#fb923c', dark: '#ea580c' },
    },
  };

  const schemeKey = scheme === 'default' ? 'blue' : scheme;
  const modeKey = isDark ? 'dark' : 'light';
  return colorSchemes[schemeKey][modeKey];
};

/**
 * Theme Context Provider Component
 *
 * Integrates Redux theme state with Material-UI ThemeProvider.
 * Provides theme state, actions, and Material-UI theme object.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Select theme state from Redux
  const themeSettings = useAppSelector(selectThemeSettings);
  const mode = useAppSelector(selectThemeMode);
  const effectiveMode = useAppSelector(selectEffectiveThemeMode);
  const colorScheme = useAppSelector(selectColorScheme);
  const fontSize = useAppSelector(selectFontSize);
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed);
  const compactMode = useAppSelector(selectCompactMode);
  const animationsEnabled = useAppSelector(selectAnimationsEnabled);
  const highContrast = useAppSelector(selectHighContrast);

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      dispatch(initializeTheme());
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [mode, dispatch]);

  /**
   * Theme action handlers
   */
  const handleSetThemeMode = useCallback(
    (themeMode: ThemeMode) => {
      dispatch(setThemeMode(themeMode));
    },
    [dispatch]
  );

  const handleToggleThemeMode = useCallback(() => {
    dispatch(toggleThemeMode());
  }, [dispatch]);

  const handleSetColorScheme = useCallback(
    (scheme: ColorScheme) => {
      dispatch(setColorScheme(scheme));
    },
    [dispatch]
  );

  const handleSetFontSize = useCallback(
    (size: FontSize) => {
      dispatch(setFontSize(size));
    },
    [dispatch]
  );

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleSetSidebarCollapsed = useCallback(
    (collapsed: boolean) => {
      dispatch(setSidebarCollapsed(collapsed));
    },
    [dispatch]
  );

  const handleSetCompactMode = useCallback(
    (compact: boolean) => {
      dispatch(setCompactMode(compact));
    },
    [dispatch]
  );

  const handleToggleCompactMode = useCallback(() => {
    dispatch(toggleCompactMode());
  }, [dispatch]);

  const handleSetAnimationsEnabled = useCallback(
    (enabled: boolean) => {
      dispatch(setAnimationsEnabled(enabled));
    },
    [dispatch]
  );

  const handleToggleAnimations = useCallback(() => {
    dispatch(toggleAnimations());
  }, [dispatch]);

  const handleSetHighContrast = useCallback(
    (enabled: boolean) => {
      dispatch(setHighContrast(enabled));
    },
    [dispatch]
  );

  const handleToggleHighContrast = useCallback(() => {
    dispatch(toggleHighContrast());
  }, [dispatch]);

  const handleResetThemeSettings = useCallback(() => {
    dispatch(resetThemeSettings());
  }, [dispatch]);

  /**
   * Utility functions
   */
  const isDarkMode = useCallback(() => {
    return effectiveMode === 'dark';
  }, [effectiveMode]);

  const isLightMode = useCallback(() => {
    return effectiveMode === 'light';
  }, [effectiveMode]);

  /**
   * Create Material-UI theme
   */
  const muiTheme = useMemo(() => {
    const isDark = effectiveMode === 'dark';
    const primaryColor = getPrimaryColor(colorScheme, isDark);

    return createTheme({
      palette: {
        mode: effectiveMode,
        primary: {
          main: primaryColor.main,
          light: primaryColor.light,
          dark: primaryColor.dark,
          contrastText: '#ffffff',
        },
        secondary: {
          main: isDark ? '#64748b' : '#64748b',
          light: isDark ? '#94a3b8' : '#94a3b8',
          dark: isDark ? '#475569' : '#475569',
          contrastText: '#ffffff',
        },
        success: {
          main: isDark ? '#22c55e' : '#10b981',
          light: isDark ? '#86efac' : '#d1fae5',
          dark: isDark ? '#16a34a' : '#047857',
        },
        warning: {
          main: isDark ? '#fbbf24' : '#f59e0b',
          light: isDark ? '#fde68a' : '#fef3c7',
          dark: isDark ? '#f59e0b' : '#d97706',
        },
        error: {
          main: isDark ? '#f87171' : '#ef4444',
          light: isDark ? '#fecaca' : '#fee2e2',
          dark: isDark ? '#dc2626' : '#dc2626',
        },
        info: {
          main: isDark ? '#60a5fa' : '#3b82f6',
          light: isDark ? '#bfdbfe' : '#dbeafe',
          dark: isDark ? '#3b82f6' : '#2563eb',
        },
        background: {
          default: isDark ? '#0f172a' : '#f9fafb',
          paper: isDark ? '#1e293b' : '#ffffff',
        },
        text: {
          primary: isDark ? '#f1f5f9' : '#111827',
          secondary: isDark ? '#cbd5e1' : '#6b7280',
          disabled: isDark ? '#475569' : '#d1d5db',
        },
        divider: isDark ? '#334155' : '#e5e7eb',
      },
      typography: {
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        fontSize: fontSize === 'small' ? 14 : fontSize === 'large' ? 18 : 16,
        h1: {
          fontWeight: 700,
          fontSize: compactMode ? '2rem' : '2.5rem',
          lineHeight: 1.2,
        },
        h2: {
          fontWeight: 700,
          fontSize: compactMode ? '1.75rem' : '2rem',
          lineHeight: 1.2,
        },
        h3: {
          fontWeight: 600,
          fontSize: compactMode ? '1.5rem' : '1.75rem',
          lineHeight: 1.2,
        },
        h4: {
          fontWeight: 600,
          fontSize: compactMode ? '1.25rem' : '1.5rem',
          lineHeight: 1.3,
        },
        h5: {
          fontWeight: 600,
          fontSize: compactMode ? '1.125rem' : '1.25rem',
          lineHeight: 1.4,
        },
        h6: {
          fontWeight: 600,
          fontSize: compactMode ? '1rem' : '1.125rem',
          lineHeight: 1.4,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 8,
      },
      spacing: compactMode ? 6 : 8,
      shadows: isDark
        ? [
            'none',
            '0px 1px 2px 0px rgba(0,0,0,0.3)',
            '0px 1px 3px 0px rgba(0,0,0,0.4), 0px 1px 2px -1px rgba(0,0,0,0.4)',
            '0px 4px 6px -1px rgba(0,0,0,0.4), 0px 2px 4px -2px rgba(0,0,0,0.4)',
            '0px 10px 15px -3px rgba(0,0,0,0.4), 0px 4px 6px -4px rgba(0,0,0,0.4)',
            '0px 20px 25px -5px rgba(0,0,0,0.4), 0px 8px 10px -6px rgba(0,0,0,0.4)',
            '0px 25px 50px -12px rgba(0,0,0,0.5)',
            '0px 1px 3px 0px rgba(0,0,0,0.4), 0px 1px 2px -1px rgba(0,0,0,0.4)',
            '0px 4px 6px -1px rgba(0,0,0,0.4), 0px 2px 4px -2px rgba(0,0,0,0.4)',
            '0px 10px 15px -3px rgba(0,0,0,0.4), 0px 4px 6px -4px rgba(0,0,0,0.4)',
            '0px 20px 25px -5px rgba(0,0,0,0.4), 0px 8px 10px -6px rgba(0,0,0,0.4)',
            '0px 25px 50px -12px rgba(0,0,0,0.5)',
            '0px 1px 3px 0px rgba(0,0,0,0.4), 0px 1px 2px -1px rgba(0,0,0,0.4)',
            '0px 4px 6px -1px rgba(0,0,0,0.4), 0px 2px 4px -2px rgba(0,0,0,0.4)',
            '0px 10px 15px -3px rgba(0,0,0,0.4), 0px 4px 6px -4px rgba(0,0,0,0.4)',
            '0px 20px 25px -5px rgba(0,0,0,0.4), 0px 8px 10px -6px rgba(0,0,0,0.4)',
            '0px 25px 50px -12px rgba(0,0,0,0.5)',
            '0px 1px 3px 0px rgba(0,0,0,0.4), 0px 1px 2px -1px rgba(0,0,0,0.4)',
            '0px 4px 6px -1px rgba(0,0,0,0.4), 0px 2px 4px -2px rgba(0,0,0,0.4)',
            '0px 10px 15px -3px rgba(0,0,0,0.4), 0px 4px 6px -4px rgba(0,0,0,0.4)',
            '0px 20px 25px -5px rgba(0,0,0,0.4), 0px 8px 10px -6px rgba(0,0,0,0.4)',
            '0px 25px 50px -12px rgba(0,0,0,0.5)',
            '0px 1px 3px 0px rgba(0,0,0,0.4), 0px 1px 2px -1px rgba(0,0,0,0.4)',
            '0px 4px 6px -1px rgba(0,0,0,0.4), 0px 2px 4px -2px rgba(0,0,0,0.4)',
            '0px 10px 15px -3px rgba(0,0,0,0.4), 0px 4px 6px -4px rgba(0,0,0,0.4)',
          ]
        : [
            'none',
            '0px 1px 2px 0px rgba(0,0,0,0.05)',
            '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
            '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
            '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            '0px 25px 50px -12px rgba(0,0,0,0.25)',
            '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
            '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
            '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            '0px 25px 50px -12px rgba(0,0,0,0.25)',
            '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
            '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
            '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            '0px 25px 50px -12px rgba(0,0,0,0.25)',
            '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
            '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
            '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            '0px 25px 50px -12px rgba(0,0,0,0.25)',
            '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
            '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
          ],
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarColor: isDark ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9',
              '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                width: 12,
                height: 12,
              },
              '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                borderRadius: 8,
                backgroundColor: isDark ? '#475569' : '#cbd5e1',
                border: isDark ? '2px solid #1e293b' : '2px solid #f1f5f9',
              },
              '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                backgroundColor: isDark ? '#64748b' : '#94a3b8',
              },
              '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                borderRadius: 8,
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 8,
              padding: '8px 16px',
              transition: animationsEnabled
                ? 'all 0.2s ease'
                : 'none',
            },
            containedPrimary: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: isDark
                  ? '0 4px 6px -1px rgba(0,0,0,0.4)'
                  : '0 4px 6px -1px rgba(0,0,0,0.1)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: isDark
                ? '0 1px 3px 0 rgba(0,0,0,0.4)'
                : '0 1px 3px 0 rgba(0,0,0,0.1)',
              transition: animationsEnabled
                ? 'box-shadow 0.2s ease, transform 0.2s ease'
                : 'none',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
            elevation1: {
              boxShadow: isDark
                ? '0 1px 3px 0 rgba(0,0,0,0.4)'
                : '0 1px 3px 0 rgba(0,0,0,0.1)',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: isDark ? '#334155' : '#1f2937',
              fontSize: '0.875rem',
              padding: '8px 12px',
              borderRadius: 6,
            },
            arrow: {
              color: isDark ? '#334155' : '#1f2937',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: isDark
                ? '0 1px 3px 0 rgba(0,0,0,0.4)'
                : '0 1px 3px 0 rgba(0,0,0,0.1)',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
            },
          },
        },
      },
      transitions: {
        duration: {
          shortest: animationsEnabled ? 150 : 0,
          shorter: animationsEnabled ? 200 : 0,
          short: animationsEnabled ? 250 : 0,
          standard: animationsEnabled ? 300 : 0,
          complex: animationsEnabled ? 375 : 0,
          enteringScreen: animationsEnabled ? 225 : 0,
          leavingScreen: animationsEnabled ? 195 : 0,
        },
      },
    });
  }, [effectiveMode, colorScheme, fontSize, compactMode, animationsEnabled, highContrast]);

  /**
   * Memoize context value
   */
  const contextValue = useMemo(
    () => ({
      // Theme state
      mode,
      effectiveMode,
      colorScheme,
      fontSize,
      sidebarCollapsed,
      compactMode,
      animationsEnabled,
      highContrast,

      // Material-UI theme
      muiTheme,

      // Theme actions
      setThemeMode: handleSetThemeMode,
      toggleThemeMode: handleToggleThemeMode,
      setColorScheme: handleSetColorScheme,
      setFontSize: handleSetFontSize,
      toggleSidebar: handleToggleSidebar,
      setSidebarCollapsed: handleSetSidebarCollapsed,
      setCompactMode: handleSetCompactMode,
      toggleCompactMode: handleToggleCompactMode,
      setAnimationsEnabled: handleSetAnimationsEnabled,
      toggleAnimations: handleToggleAnimations,
      setHighContrast: handleSetHighContrast,
      toggleHighContrast: handleToggleHighContrast,
      resetThemeSettings: handleResetThemeSettings,

      // Utility functions
      isDarkMode,
      isLightMode,
    }),
    [
      mode,
      effectiveMode,
      colorScheme,
      fontSize,
      sidebarCollapsed,
      compactMode,
      animationsEnabled,
      highContrast,
      muiTheme,
      handleSetThemeMode,
      handleToggleThemeMode,
      handleSetColorScheme,
      handleSetFontSize,
      handleToggleSidebar,
      handleSetSidebarCollapsed,
      handleSetCompactMode,
      handleToggleCompactMode,
      handleSetAnimationsEnabled,
      handleToggleAnimations,
      handleSetHighContrast,
      handleToggleHighContrast,
      handleResetThemeSettings,
      isDarkMode,
      isLightMode,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use Theme Context
 *
 * @throws Error if used outside ThemeProvider
 * @returns ThemeContextType
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
};

// Export context for advanced usage
export { ThemeContext };

// Default export
export default ThemeProvider;
