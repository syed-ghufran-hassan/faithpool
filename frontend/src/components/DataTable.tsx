import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  header: string | ReactNode;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  sortable?: boolean;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortable = true,
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className,
  striped = false,
  bordered = false,
  hoverable = true,
  compact = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({
    key: '',
    direction: null,
  });

  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key || !sortConfig.direction) return data;
    
    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortConfig.key];
      const bValue = (b as Record<string, unknown>)[sortConfig.key];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig, sortable]);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !sortable) return;
    
    let direction: SortDirection = 'asc';
    if (sortConfig.key === column.key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : sortConfig.direction === 'desc' ? null : 'asc';
    }
    
    setSortConfig({ key: column.key, direction });
    onSort?.(column.key, direction);
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable || !sortable) return null;
    
    if (sortConfig.key !== column.key || !sortConfig.direction) {
      return <ChevronsUpDown size={14} className="datatable__sort-icon" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="datatable__sort-icon datatable__sort-icon--active" />
      : <ChevronDown size={14} className="datatable__sort-icon datatable__sort-icon--active" />;
  };

  const allSelected = data.length > 0 && data.every(row => selectedRows.has(keyExtractor(row)));

  return (
    <div className={clsx('datatable__wrapper', className)}>
      <table className={clsx('datatable', {
        'datatable--bordered': bordered,
        'datatable--striped': striped,
        'datatable--compact': compact,
      })}>
        <thead className="datatable__head">
          <tr className="datatable__row datatable__row--header">
            {selectable && (
              <th className="datatable__cell datatable__cell--checkbox">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="datatable__checkbox"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx('datatable__cell', 'datatable__cell--header', {
                  'datatable__cell--sortable': column.sortable && sortable,
                  'datatable__cell--sorted': sortConfig.key === column.key,
                  [`datatable__cell--align-${column.align || 'left'}`]: true,
                })}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
              >
                <span className="datatable__header-content">
                  {column.header}
                  {getSortIcon(column)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="datatable__body">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="datatable__empty">
                Loading...
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="datatable__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => {
              const rowId = keyExtractor(row);
              return (
                <tr
                  key={rowId}
                  className={clsx('datatable__row', {
                    'datatable__row--striped': striped && index % 2 === 1,
                    'datatable__row--hoverable': hoverable,
                    'datatable__row--selected': selectedRows.has(rowId),
                  })}
                >
                  {selectable && (
                    <td className="datatable__cell datatable__cell--checkbox">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowId)}
                        onChange={(e) => onSelectRow?.(rowId, e.target.checked)}
                        className="datatable__checkbox"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={clsx('datatable__cell', {
                        [`datatable__cell--align-${column.align || 'left'}`]: true,
                      })}
                    >
                      {column.render 
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? '')
                      }
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
