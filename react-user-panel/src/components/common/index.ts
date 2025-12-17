// Common Components Exports

// Layout Components
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as Footer } from './Footer';
export { default as Navbar } from './Navbar';
export { default as Breadcrumb } from './Breadcrumb';

// UI Components
export { default as StatsCard } from './StatsCard';
export type { StatsCardProps } from './StatsCard';

export { default as LoadingSpinner } from './LoadingSpinner';
export type { LoadingVariant } from './LoadingSpinner';

export { default as EmptyState } from './EmptyState';
export type { EmptyStateVariant } from './EmptyState';

export { default as ErrorBoundary } from './ErrorBoundary';

export { default as ConfirmDialog, useConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogOptions } from './ConfirmDialog';

export { default as PageLoader } from './PageLoader';
export type { PageLoaderVariant } from './PageLoader';
