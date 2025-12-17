/**
 * LocalStorage Helper Functions
 * Provides type-safe localStorage operations with error handling
 */

import { STORAGE_KEYS } from './constants';

/**
 * Storage utility class
 */
class Storage {
  /**
   * Set item in localStorage
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item from localStorage for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Get item from localStorage with default value
   */
  getItemWithDefault<T>(key: string, defaultValue: T): T {
    const value = this.getItem<T>(key);
    return value !== null ? value : defaultValue;
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  }

  /**
   * Check if key exists in localStorage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   */
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting all keys from localStorage', error);
      return [];
    }
  }

  /**
   * Get localStorage size in bytes
   */
  getSize(): number {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
      return size;
    } catch (error) {
      console.error('Error getting localStorage size', error);
      return 0;
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const storageInstance = new Storage();

// Export instance methods
export const setItem = storageInstance.setItem.bind(storageInstance);
export const getItem = storageInstance.getItem.bind(storageInstance);
export const getItemWithDefault = storageInstance.getItemWithDefault.bind(storageInstance);
export const removeItem = storageInstance.removeItem.bind(storageInstance);
export const clear = storageInstance.clear.bind(storageInstance);
export const hasItem = storageInstance.hasItem.bind(storageInstance);
export const getAllKeys = storageInstance.getAllKeys.bind(storageInstance);
export const getSize = storageInstance.getSize.bind(storageInstance);
export const isAvailable = storageInstance.isAvailable.bind(storageInstance);

/**
 * Typed storage helpers for specific data
 */

// Auth Token
export const setAuthToken = (token: string): boolean => {
  return setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getAuthToken = (): string | null => {
  return getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
};

export const removeAuthToken = (): boolean => {
  return removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const hasAuthToken = (): boolean => {
  return hasItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Refresh Token
export const setRefreshToken = (token: string): boolean => {
  return setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const getRefreshToken = (): string | null => {
  return getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
};

export const removeRefreshToken = (): boolean => {
  return removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// User Data
export interface StoredUser {
  id: string;
  email: string;
  name: string;
  mobile?: string;
  avatar?: string;
  role?: string;
  status?: string;
  referralCode?: string;
}

export const setUser = (user: StoredUser): boolean => {
  return setItem(STORAGE_KEYS.USER, user);
};

export const getUser = (): StoredUser | null => {
  return getItem<StoredUser>(STORAGE_KEYS.USER);
};

export const removeUser = (): boolean => {
  return removeItem(STORAGE_KEYS.USER);
};

export const hasUser = (): boolean => {
  return hasItem(STORAGE_KEYS.USER);
};

// Theme
export type Theme = 'light' | 'dark';

export const setTheme = (theme: Theme): boolean => {
  return setItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = (): Theme => {
  return getItemWithDefault<Theme>(STORAGE_KEYS.THEME, 'light');
};

export const removeTheme = (): boolean => {
  return removeItem(STORAGE_KEYS.THEME);
};

// Language
export type Language = 'en' | 'hi';

export const setLanguage = (language: Language): boolean => {
  return setItem(STORAGE_KEYS.LANGUAGE, language);
};

export const getLanguage = (): Language => {
  return getItemWithDefault<Language>(STORAGE_KEYS.LANGUAGE, 'en');
};

export const removeLanguage = (): boolean => {
  return removeItem(STORAGE_KEYS.LANGUAGE);
};

// Sidebar Collapsed State
export const setSidebarCollapsed = (collapsed: boolean): boolean => {
  return setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
};

export const getSidebarCollapsed = (): boolean => {
  return getItemWithDefault<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
};

export const removeSidebarCollapsed = (): boolean => {
  return removeItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
};

// Remember Me
export interface RememberMeData {
  email: string;
  remember: boolean;
}

export const setRememberMe = (data: RememberMeData): boolean => {
  return setItem(STORAGE_KEYS.REMEMBER_ME, data);
};

export const getRememberMe = (): RememberMeData | null => {
  return getItem<RememberMeData>(STORAGE_KEYS.REMEMBER_ME);
};

export const removeRememberMe = (): boolean => {
  return removeItem(STORAGE_KEYS.REMEMBER_ME);
};

/**
 * Clear all authentication related data
 */
export const clearAuthData = (): boolean => {
  const results = [
    removeAuthToken(),
    removeRefreshToken(),
    removeUser(),
  ];

  return results.every(result => result === true);
};

/**
 * Clear all user preferences
 */
export const clearUserPreferences = (): boolean => {
  const results = [
    removeTheme(),
    removeLanguage(),
    removeSidebarCollapsed(),
  ];

  return results.every(result => result === true);
};

/**
 * Clear all app data (auth + preferences)
 */
export const clearAllAppData = (): boolean => {
  const results = [
    clearAuthData(),
    clearUserPreferences(),
    removeRememberMe(),
  ];

  return results.every(result => result === true);
};

/**
 * SessionStorage utility class
 */
class SessionStorageUtil {
  /**
   * Set item in sessionStorage
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error setting item in sessionStorage for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Get item from sessionStorage
   */
  getItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item from sessionStorage for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Get item from sessionStorage with default value
   */
  getItemWithDefault<T>(key: string, defaultValue: T): T {
    const value = this.getItem<T>(key);
    return value !== null ? value : defaultValue;
  }

  /**
   * Remove item from sessionStorage
   */
  removeItem(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from sessionStorage for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items from sessionStorage
   */
  clear(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
      return false;
    }
  }

  /**
   * Check if key exists in sessionStorage
   */
  hasItem(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }

  /**
   * Check if sessionStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance for sessionStorage
const sessionStorageInstance = new SessionStorageUtil();

// Export sessionStorage methods with prefix
export const sessionStorage_setItem = sessionStorageInstance.setItem.bind(sessionStorageInstance);
export const sessionStorage_getItem = sessionStorageInstance.getItem.bind(sessionStorageInstance);
export const sessionStorage_getItemWithDefault = sessionStorageInstance.getItemWithDefault.bind(sessionStorageInstance);
export const sessionStorage_removeItem = sessionStorageInstance.removeItem.bind(sessionStorageInstance);
export const sessionStorage_clear = sessionStorageInstance.clear.bind(sessionStorageInstance);
export const sessionStorage_hasItem = sessionStorageInstance.hasItem.bind(sessionStorageInstance);
export const sessionStorage_isAvailable = sessionStorageInstance.isAvailable.bind(sessionStorageInstance);

/**
 * Cookie utility functions
 */

export interface CookieOptions {
  expires?: number | Date; // Days or Date
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  try {
    const {
      expires,
      path = '/',
      domain,
      secure = false,
      sameSite = 'lax',
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
      let expiresDate: Date;
      if (typeof expires === 'number') {
        expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + expires * 24 * 60 * 60 * 1000);
      } else {
        expiresDate = expires;
      }
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }

    if (path) {
      cookieString += `; path=${path}`;
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += '; secure';
    }

    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }

    document.cookie = cookieString;
  } catch (error) {
    console.error(`Error setting cookie: ${name}`, error);
  }
};

export const getCookie = (name: string): string | null => {
  try {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting cookie: ${name}`, error);
    return null;
  }
};

export const removeCookie = (name: string, options: Omit<CookieOptions, 'expires'> = {}): void => {
  setCookie(name, '', { ...options, expires: -1 });
};

export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Export default storage object
 */
const storage = {
  // LocalStorage
  local: {
    setItem,
    getItem,
    getItemWithDefault,
    removeItem,
    clear,
    hasItem,
    getAllKeys,
    getSize,
    isAvailable,
  },
  // SessionStorage
  session: {
    setItem: sessionStorage_setItem,
    getItem: sessionStorage_getItem,
    getItemWithDefault: sessionStorage_getItemWithDefault,
    removeItem: sessionStorage_removeItem,
    clear: sessionStorage_clear,
    hasItem: sessionStorage_hasItem,
    isAvailable: sessionStorage_isAvailable,
  },
  // Cookies
  cookie: {
    set: setCookie,
    get: getCookie,
    remove: removeCookie,
    has: hasCookie,
  },
  // Auth helpers
  auth: {
    setToken: setAuthToken,
    getToken: getAuthToken,
    removeToken: removeAuthToken,
    hasToken: hasAuthToken,
    setRefreshToken,
    getRefreshToken,
    removeRefreshToken,
    setUser,
    getUser,
    removeUser,
    hasUser,
    clearAuthData,
  },
  // Preference helpers
  preferences: {
    setTheme,
    getTheme,
    removeTheme,
    setLanguage,
    getLanguage,
    removeLanguage,
    setSidebarCollapsed,
    getSidebarCollapsed,
    removeSidebarCollapsed,
    setRememberMe,
    getRememberMe,
    removeRememberMe,
    clearUserPreferences,
  },
  // Clear all
  clearAll: clearAllAppData,
};

export default storage;
