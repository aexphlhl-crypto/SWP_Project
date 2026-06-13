import { useState, useMemo, useEffect } from 'react';

/**
 * Hook hỗ trợ phân trang cho mảng dữ liệu ngay trên Frontend (Client-side)
 * @param {Array} data - Mảng dữ liệu gốc (sau khi đã được filter/search)
 * @param {number} itemsPerPage - Số phần tử trên mỗi trang (mặc định 10)
 * @param {number} initialPage - Trang bắt đầu (mặc định 1)
 */
export function useClientPagination(data = [], itemsPerPage = 10, initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  // Đảm bảo currentPage không bị vượt quá totalPages khi filter làm data bị ngắn lại
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const currentDataOnPage = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, safeCurrentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Nếu safeCurrentPage khác currentPage, tự động cập nhật lại state để đồng bộ
  useEffect(() => {
    if (safeCurrentPage !== currentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [safeCurrentPage, currentPage]);

  return {
    currentDataOnPage,
    currentPage: safeCurrentPage,
    totalPages,
    handlePageChange,
    totalItems: data.length,
    startIndex: (safeCurrentPage - 1) * itemsPerPage,
    endIndex: Math.min(safeCurrentPage * itemsPerPage, data.length)
  };
}
