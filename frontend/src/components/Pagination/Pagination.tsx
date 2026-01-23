import { memo, useCallback, useMemo, forwardRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  siblingCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type PageItem = number | 'ellipsis';

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function generatePages(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PageItem[] {
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...range(1, leftItemCount), 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [1, 'ellipsis', ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  return [
    1,
    'ellipsis',
    ...range(leftSiblingIndex, rightSiblingIndex),
    'ellipsis',
    totalPages,
  ];
}

export const Pagination = memo(forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      currentPage,
      totalPages,
      onPageChange,
      showFirstLast = true,
      siblingCount = 1,
      size = 'md',
      className,
    },
    ref
  ) {
    const pages = useMemo(
      () => generatePages(currentPage, totalPages, siblingCount),
      [currentPage, totalPages, siblingCount]
    );

    const handlePrevious = useCallback(() => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }, [currentPage, onPageChange]);

    const handleNext = useCallback(() => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    }, [currentPage, totalPages, onPageChange]);

    const handleFirst = useCallback(() => {
      onPageChange(1);
    }, [onPageChange]);

    const handleLast = useCallback(() => {
      onPageChange(totalPages);
    }, [onPageChange, totalPages]);

    const handlePageClick = useCallback(
      (page: number) => () => {
        onPageChange(page);
      },
      [onPageChange]
    );

    if (totalPages <= 1) return null;

    return (
      <nav
        ref={ref}
        className={clsx('pagination', size !== 'md' && `pagination--${size}`, className)}
        aria-label="Pagination"
      >
        {showFirstLast && (
          <button
            type="button"
            className="pagination__btn pagination__btn--first"
            onClick={handleFirst}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        <button
          type="button"
          className="pagination__btn pagination__btn--prev"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="pagination__pages">
          {pages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="pagination__ellipsis">
                  ...
                </span>
              );
            }

            return (
              <button
                type="button"
                key={page}
                className={clsx(
                  'pagination__page',
                  currentPage === page && 'pagination__page--active'
                )}
                onClick={handlePageClick(page)}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="pagination__btn pagination__btn--next"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {showFirstLast && (
          <button
            type="button"
            className="pagination__btn pagination__btn--last"
            onClick={handleLast}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </nav>
    );
  }
));

export default Pagination;
