import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

export const usePagination = (initialPage: number = 0, initialSize: number = DEFAULT_PAGE_SIZE) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0); // Reset to first page
  };

  const reset = () => {
    setPage(0);
    setPageSize(initialSize);
  };

  return {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    reset,
  };
};
