/**
 * useWindowSize Hook
 * Custom hook for tracking window dimensions
 */

import { useState, useEffect, useCallback } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export interface UseWindowSizeReturn extends WindowSize {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isExtraLargeScreen: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * Breakpoints (following common responsive design patterns)
 */
const BREAKPOINTS = {
  mobile: 640,      // sm
  tablet: 768,      // md
  desktop: 1024,    // lg
  large: 1280,      // xl
  extraLarge: 1536, // 2xl
};

/**
 * Custom hook to track window size
 */
export function useWindowSize(): UseWindowSizeReturn {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    // Handler to call on window resize
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Calculate device type based on width
  const isMobile = windowSize.width < BREAKPOINTS.mobile;
  const isTablet = windowSize.width >= BREAKPOINTS.mobile && windowSize.width < BREAKPOINTS.desktop;
  const isDesktop = windowSize.width >= BREAKPOINTS.desktop;

  // Calculate screen size categories
  const isSmallScreen = windowSize.width < BREAKPOINTS.tablet;
  const isMediumScreen = windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop;
  const isLargeScreen = windowSize.width >= BREAKPOINTS.desktop && windowSize.width < BREAKPOINTS.large;
  const isExtraLargeScreen = windowSize.width >= BREAKPOINTS.extraLarge;

  // Calculate orientation
  const orientation: 'portrait' | 'landscape' = windowSize.height > windowSize.width ? 'portrait' : 'landscape';

  return {
    ...windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreen,
    orientation,
  };
}

/**
 * Hook for checking specific breakpoint
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  const { width } = useWindowSize();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Hook for checking if width is within a range
 */
export function useWidthRange(min: number, max: number): boolean {
  const { width } = useWindowSize();
  return width >= min && width <= max;
}

/**
 * Hook for checking media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    // Try modern API first, fall back to deprecated API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook for checking dark mode preference
 */
export function useDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook for checking reduced motion preference
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook for checking touch device
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();

    // Some devices might change touch capability dynamically
    window.addEventListener('touchstart', checkTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return isTouch;
}

/**
 * Hook for viewport dimensions (excluding scrollbars)
 */
export function useViewport(): WindowSize {
  const [viewport, setViewport] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? document.documentElement.clientWidth : 0,
    height: typeof window !== 'undefined' ? document.documentElement.clientHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * Hook for window scroll position
 */
export interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: typeof window !== 'undefined' ? window.pageXOffset : 0,
    y: typeof window !== 'undefined' ? window.pageYOffset : 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}

/**
 * Hook for detecting scroll direction
 */
export type ScrollDirection = 'up' | 'down' | 'left' | 'right' | null;

export function useScrollDirection(): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [lastScrollPosition, setLastScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      const currentScrollX = window.pageXOffset;

      if (currentScrollY > lastScrollPosition.y) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollPosition.y) {
        setScrollDirection('up');
      } else if (currentScrollX > lastScrollPosition.x) {
        setScrollDirection('right');
      } else if (currentScrollX < lastScrollPosition.x) {
        setScrollDirection('left');
      }

      setLastScrollPosition({
        x: currentScrollX,
        y: currentScrollY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition]);

  return scrollDirection;
}

/**
 * Hook for checking if element is in viewport
 */
export function useInViewport(ref: React.RefObject<HTMLElement>): boolean {
  const [isInViewport, setIsInViewport] = useState<boolean>(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Element is considered visible when 10% is in viewport
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);

  return isInViewport;
}

/**
 * Hook for window focus state
 */
export function useWindowFocus(): boolean {
  const [isFocused, setIsFocused] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.hasFocus();
    }
    return true;
  });

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
}

/**
 * Hook for online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useWindowSize;
