import { useState, useMemo, useEffect } from 'react';

/**
 * Hook hỗ trợ phân trang cho mảng dữ liệu ngay trên Frontend (Client-side)
 * @param {Array} data - Mảng dữ liệu gốc (sau khi đã được filter/search)
 * @param {number} itemsPerPage - Số phần tử trên mỗi trang (mặc định 10)
 * @param {number} initialPage - Trang bắt đầu (mặc định 1)
 * @param {string} sortDirection - Hướng sắp xếp theo thời gian ('desc' hoặc 'asc', mặc định 'desc')
 */
export function useClientPagination(data = [], itemsPerPage = 10, initialPage = 1, sortDirection = 'desc') {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  // Đảm bảo currentPage không bị vượt quá totalPages khi filter làm data bị ngắn lại
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const currentDataOnPage = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    // Tự động sắp xếp dữ liệu theo thời gian mới nhất lên đầu
    const sortedData = [...data].sort((a, b) => {
      const timeA = a?.createdAt || a?.created_at || a?.updatedAt || a?.releaseDate;
      const timeB = b?.createdAt || b?.created_at || b?.updatedAt || b?.releaseDate;
      
      if (timeA && timeB) {
        if (sortDirection === 'asc') {
          return new Date(timeA) - new Date(timeB); // Cũ nhất lên đầu
        } else {
          return new Date(timeB) - new Date(timeA); // Mới nhất lên đầu
        }
      }
      return 0;
    });

    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
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
