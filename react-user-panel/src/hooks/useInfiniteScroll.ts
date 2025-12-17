/**
 * useInfiniteScroll Hook
 * Custom hook for implementing infinite scroll functionality
 */

import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  initialPage?: number;
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  page: number;
  isLoading: boolean;
  hasMore: boolean;
  setIsLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  reset: () => void;
  loadMore: () => void;
}

/**
 * Hook for infinite scroll with Intersection Observer
 */
export function useInfiniteScroll(
  onLoadMore: (page: number) => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    initialPage = 1,
    enabled = true,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setIsLoading(true);

    try {
      await onLoadMore(page);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, enabled, onLoadMore]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
  }, [initialPage]);

  return {
    page,
    isLoading,
    hasMore,
    setIsLoading,
    setHasMore,
    reset,
    loadMore,
  };
}

/**
 * Hook for infinite scroll with ref to trigger element
 */
export function useInfiniteScrollRef(
  onLoadMore: (page: number) => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): [RefObject<HTMLDivElement>, UseInfiniteScrollReturn] {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    initialPage = 1,
    enabled = true,
  } = options;

  const triggerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setIsLoading(true);

    try {
      await onLoadMore(page);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, enabled, onLoadMore]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
  }, [initialPage]);

  useEffect(() => {
    if (!enabled || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = triggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [enabled, hasMore, isLoading, loadMore, threshold, rootMargin]);

  return [
    triggerRef,
    {
      page,
      isLoading,
      hasMore,
      setIsLoading,
      setHasMore,
      reset,
      loadMore,
    },
  ];
}

/**
 * Hook for infinite scroll with scroll position
 */
export interface UseInfiniteScrollScrollOptions extends UseInfiniteScrollOptions {
  scrollThreshold?: number; // Distance from bottom in pixels
}

export function useInfiniteScrollScroll(
  onLoadMore: (page: number) => Promise<void> | void,
  options: UseInfiniteScrollScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    scrollThreshold = 300,
    initialPage = 1,
    enabled = true,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setIsLoading(true);

    try {
      await onLoadMore(page);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, enabled, onLoadMore]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
  }, [initialPage]);

  useEffect(() => {
    if (!enabled || !hasMore) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < scrollThreshold && !isLoading) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, hasMore, isLoading, loadMore, scrollThreshold]);

  return {
    page,
    isLoading,
    hasMore,
    setIsLoading,
    setHasMore,
    reset,
    loadMore,
  };
}

/**
 * Hook for infinite scroll with container ref (for scrollable containers)
 */
export function useInfiniteScrollContainer(
  containerRef: RefObject<HTMLElement>,
  onLoadMore: (page: number) => Promise<void> | void,
  options: UseInfiniteScrollScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    scrollThreshold = 300,
    initialPage = 1,
    enabled = true,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setIsLoading(true);

    try {
      await onLoadMore(page);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, enabled, onLoadMore]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
  }, [initialPage]);

  useEffect(() => {
    if (!enabled || !hasMore || !containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      const scrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < scrollThreshold && !isLoading) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, hasMore, isLoading, loadMore, scrollThreshold, containerRef]);

  return {
    page,
    isLoading,
    hasMore,
    setIsLoading,
    setHasMore,
    reset,
    loadMore,
  };
}

/**
 * Hook for paginated data with infinite scroll
 */
export interface UsePaginatedDataOptions<T> {
  fetchData: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  initialPage?: number;
  enabled?: boolean;
  scrollThreshold?: number;
}

export interface UsePaginatedDataReturn<T> {
  data: T[];
  page: number;
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
  reset: () => void;
  refresh: () => void;
}

export function usePaginatedData<T>(
  options: UsePaginatedDataOptions<T>
): UsePaginatedDataReturn<T> {
  const {
    fetchData,
    initialPage = 1,
    enabled = true,
    scrollThreshold = 300,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData(page);
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, enabled, fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
    setError(null);
  }, [initialPage]);

  const refresh = useCallback(async () => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setIsLoading(true);

    try {
      const result = await fetchData(initialPage);
      setData(result.data);
      setHasMore(result.hasMore);
      setPage(initialPage + 1);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [initialPage, fetchData]);

  // Auto-load on mount
  useEffect(() => {
    if (enabled && data.length === 0 && !isLoading) {
      loadMore();
    }
  }, [enabled]); // Only run on mount

  // Scroll handler
  useEffect(() => {
    if (!enabled || !hasMore) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < scrollThreshold && !isLoading) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, hasMore, isLoading, loadMore, scrollThreshold]);

  return {
    data,
    page,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh,
  };
}

/**
 * Hook for cursor-based pagination (for APIs that use cursors instead of page numbers)
 */
export interface UseCursorPaginationOptions<T> {
  fetchData: (cursor: string | null) => Promise<{ data: T[]; nextCursor: string | null }>;
  enabled?: boolean;
  scrollThreshold?: number;
}

export interface UseCursorPaginationReturn<T> {
  data: T[];
  cursor: string | null;
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
  reset: () => void;
  refresh: () => void;
}

export function useCursorPagination<T>(
  options: UseCursorPaginationOptions<T>
): UseCursorPaginationReturn<T> {
  const {
    fetchData,
    enabled = true,
    scrollThreshold = 300,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData(cursor);
      setData((prev) => [...prev, ...result.data]);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading, hasMore, enabled, fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setCursor(null);
    setHasMore(true);
    setIsLoading(false);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    setData([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
    setIsLoading(true);

    try {
      const result = await fetchData(null);
      setData(result.data);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  // Auto-load on mount
  useEffect(() => {
    if (enabled && data.length === 0 && !isLoading) {
      loadMore();
    }
  }, [enabled]); // Only run on mount

  // Scroll handler
  useEffect(() => {
    if (!enabled || !hasMore) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < scrollThreshold && !isLoading) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, hasMore, isLoading, loadMore, scrollThreshold]);

  return {
    data,
    cursor,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh,
  };
}

export default useInfiniteScroll;
