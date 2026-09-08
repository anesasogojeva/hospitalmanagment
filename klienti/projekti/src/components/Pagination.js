import React from 'react';

// Reusable server-side pagination control. Expects 1-based `page`.
const Pagination = ({ page, totalPages, totalCount, pageSize, onPageChange, onPageSizeChange }) => {
  if (!totalCount) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pageNumbers = [];
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const hasMultiplePages = totalPages > 1;

  return (
    <div className="dt-pagination">
      <span className="dt-pagination__summary">
        Showing {from}-{to} of {totalCount}
      </span>

      {hasMultiplePages && (
        <div className="dt-pagination__controls">
          <button
            type="button"
            className="dt-pagination__btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          {start > 1 && <span className="dt-pagination__ellipsis">…</span>}
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              className={`dt-pagination__btn ${p === page ? 'dt-pagination__btn--active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
          {end < totalPages && <span className="dt-pagination__ellipsis">…</span>}
          <button
            type="button"
            className="dt-pagination__btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {onPageSizeChange && (
        <select
          className="dt-pagination__page-size form-select form-select-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default Pagination;
