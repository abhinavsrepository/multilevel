import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Color scheme type
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange';

// Font size type
export type FontSize = 'small' | 'medium' | 'large';

// State interface
interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
}

// Get initial theme from localStorage or system preference
const getInitialTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
  if (savedTheme) {
    return savedTheme;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

// Get initial settings from localStorage
const getInitialColorScheme = (): ColorScheme => {
  return (localStorage.getItem('colorScheme') as ColorScheme) || 'default';
};

const getInitialFontSize = (): FontSize => {
  return (localStorage.getItem('fontSize') as FontSize) || 'medium';
};

const getInitialSidebarState = (): boolean => {
  const saved = localStorage.getItem('sidebarCollapsed');
  return saved ? JSON.parse(saved) : false;
};

const getInitialCompactMode = (): boolean => {
  const saved = localStorage.getItem('compactMode');
  return saved ? JSON.parse(saved) : false;
};

const getInitialAnimationsEnabled = (): boolean => {
  const saved = localStorage.getItem('animationsEnabled');
  return saved ? JSON.parse(saved) : true;
};

const getInitialHighContrast = (): boolean => {
  const saved = localStorage.getItem('highContrast');
  return saved ? JSON.parse(saved) : false;
};

// Initial state
const initialState: ThemeState = {
  mode: getInitialTheme(),
  colorScheme: getInitialColorScheme(),
  fontSize: getInitialFontSize(),
  sidebarCollapsed: getInitialSidebarState(),
  compactMode: getInitialCompactMode(),
  animationsEnabled: getInitialAnimationsEnabled(),
  highContrast: getInitialHighContrast(),
};

// Theme slice
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      localStorage.setItem('themeMode', action.payload);

      // Apply theme to document
      if (action.payload === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },
    toggleThemeMode: (state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      localStorage.setItem('themeMode', newMode);
      document.documentElement.setAttribute('data-theme', newMode);
    },
    setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      state.colorScheme = action.payload;
      localStorage.setItem('colorScheme', action.payload);
      document.documentElement.setAttribute('data-color-scheme', action.payload);
    },
    setFontSize: (state, action: PayloadAction<FontSize>) => {
      state.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
      document.documentElement.setAttribute('data-font-size', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(action.payload));
    },
    setCompactMode: (state, action: PayloadAction<boolean>) => {
      state.compactMode = action.payload;
      localStorage.setItem('compactMode', JSON.stringify(action.payload));
      document.documentElement.setAttribute('data-compact', action.payload.toString());
    },
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode;
      localStorage.setItem('compactMode', JSON.stringify(state.compactMode));
      document.documentElement.setAttribute('data-compact', state.compactMode.toString());
    },
    setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationsEnabled = action.payload;
      localStorage.setItem('animationsEnabled', JSON.stringify(action.payload));
      document.documentElement.setAttribute('data-animations', action.payload.toString());
    },
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
      localStorage.setItem('animationsEnabled', JSON.stringify(state.animationsEnabled));
      document.documentElement.setAttribute('data-animations', state.animationsEnabled.toString());
    },
    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.highContrast = action.payload;
      localStorage.setItem('highContrast', JSON.stringify(action.payload));
      document.documentElement.setAttribute('data-high-contrast', action.payload.toString());
    },
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
      localStorage.setItem('highContrast', JSON.stringify(state.highContrast));
      document.documentElement.setAttribute('data-high-contrast', state.highContrast.toString());
    },
    resetThemeSettings: (state) => {
      state.mode = 'light';
      state.colorScheme = 'default';
      state.fontSize = 'medium';
      state.sidebarCollapsed = false;
      state.compactMode = false;
      state.animationsEnabled = true;
      state.highContrast = false;

      localStorage.setItem('themeMode', 'light');
      localStorage.setItem('colorScheme', 'default');
      localStorage.setItem('fontSize', 'medium');
      localStorage.setItem('sidebarCollapsed', 'false');
      localStorage.setItem('compactMode', 'false');
      localStorage.setItem('animationsEnabled', 'true');
      localStorage.setItem('highContrast', 'false');

      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-color-scheme', 'default');
      document.documentElement.setAttribute('data-font-size', 'medium');
      document.documentElement.setAttribute('data-compact', 'false');
      document.documentElement.setAttribute('data-animations', 'true');
      document.documentElement.setAttribute('data-high-contrast', 'false');
    },
    initializeTheme: (state) => {
      // Apply all theme settings to document on initialization
      const effectiveMode =
        state.mode === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : state.mode;

      document.documentElement.setAttribute('data-theme', effectiveMode);
      document.documentElement.setAttribute('data-color-scheme', state.colorScheme);
      document.documentElement.setAttribute('data-font-size', state.fontSize);
      document.documentElement.setAttribute('data-compact', state.compactMode.toString());
      document.documentElement.setAttribute('data-animations', state.animationsEnabled.toString());
      document.documentElement.setAttribute('data-high-contrast', state.highContrast.toString());
    },
  },
});

// Actions
export const {
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
} = themeSlice.actions;

// Selectors
export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode;
export const selectEffectiveThemeMode = (state: { theme: ThemeState }) => {
  if (state.theme.mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return state.theme.mode;
};
export const selectColorScheme = (state: { theme: ThemeState }) => state.theme.colorScheme;
export const selectFontSize = (state: { theme: ThemeState }) => state.theme.fontSize;
export const selectSidebarCollapsed = (state: { theme: ThemeState }) => state.theme.sidebarCollapsed;
export const selectCompactMode = (state: { theme: ThemeState }) => state.theme.compactMode;
export const selectAnimationsEnabled = (state: { theme: ThemeState }) =>
  state.theme.animationsEnabled;
export const selectHighContrast = (state: { theme: ThemeState }) => state.theme.highContrast;
export const selectThemeSettings = (state: { theme: ThemeState }) => state.theme;

// Reducer
export default themeSlice.reducer;
