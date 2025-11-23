import React, { useState, useMemo, useCallback } from 'react';
import styles from './Table.module.css';

const Table = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortConfig,
  pagination = {},
  className = '',
  ariaLabel = 'Data table',
  testId = 'data-table'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(pagination.itemsPerPage || 10);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex]);

  // Handle page changes
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Handle sort
  const handleSort = useCallback((columnKey) => {
    if (onSort && columns.find(col => col.key === columnKey)?.sortable !== false) {
      onSort(columnKey);
    }
  }, [onSort, columns]);

  // Render sortable header
  const renderHeader = useCallback((column) => {
    const isSortable = column.sortable !== false && onSort;
    const isSorted = sortConfig?.key === column.key;
    const sortDirection = isSorted ? sortConfig.direction : null;

    return (
      <th
        key={column.key}
        className={`${styles.headerCell} ${isSortable ? styles.sortable : ''} ${isSorted ? styles.sorted : ''}`}
        role="columnheader"
        aria-sort={isSorted ? sortDirection : 'none'}
      >
        <div className={styles.headerContent}>
          <span className={styles.headerText}>{column.title}</span>
          {isSortable && (
            <button
              type="button"
              className={styles.sortButton}
              onClick={() => handleSort(column.key)}
              aria-label={`Sort by ${column.title}`}
              aria-describedby={`sort-${column.key}`}
            >
              <span
                className={`${styles.sortIcon} ${
                  sortDirection === 'asc' ? styles.ascending : 
                  sortDirection === 'desc' ? styles.descending : ''
                }`}
                id={`sort-${column.key}`}
              >
                ↕️
              </span>
            </button>
          )}
        </div>
      </th>
    );
  }, [onSort, sortConfig, handleSort]);

  // Render table rows
  const renderRows = useCallback(() => {
    return currentData.map((item, index) => (
      <tr 
        key={item.id || index} 
        className={styles.tableRow}
        role="row"
      >
        {columns.map(column => (
          <td 
            key={column.key} 
            className={styles.cell}
            role="gridcell"
          >
            {column.render ? column.render(item[column.key], item) : item[column.key]}
          </td>
        ))}
      </tr>
    ));
  }, [currentData, columns]);

  // Loading state
  const LoadingSpinner = () => (
    <tr className={styles.loadingRow}>
      <td colSpan={columns.length} className={styles.loadingCell}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <span>Loading...</span>
        </div>
      </td>
    </tr>
  );

  // Empty state
  const EmptyState = () => (
    <tr className={styles.emptyRow}>
      <td colSpan={columns.length} className={styles.emptyCell}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📋</div>
          <p className={styles.emptyText}>{emptyMessage}</p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className={`${styles.tableWrapper} ${className}`} role="region" aria-label={ariaLabel} data-testid={testId}>
      <div className={styles.tableContainer}>
        <table className={styles.table} role="table" aria-label={ariaLabel}>
          <thead className={styles.header}>
            <tr role="row">
              {columns.map(renderHeader)}
            </tr>
          </thead>
          <tbody className={styles.body}>
            {loading ? <LoadingSpinner /> : 
             currentData.length === 0 ? <EmptyState /> : 
             renderRows()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination} role="navigation" aria-label="Table pagination">
          <button
            type="button"
            className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>

          <div className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
            <span className={styles.paginationCount}>
              ({data.length} total items)
            </span>
          </div>

          <button
            type="button"
            className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;