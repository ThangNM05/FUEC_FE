import type { ChangeEvent, MouseEvent, ReactNode } from 'react';
import { useState, useMemo, Fragment } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, Download, Plus,
  ArrowUp, ArrowDown, FileSpreadsheet, ChevronDown, ChevronRight as ChevronRightIcon
} from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onImport?: () => void;
  onDownloadTemplate?: () => void;
  importLabel?: string;
  downloadTemplateLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: ReactNode;
  onCreate?: () => void;
  createLabel?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;

  // Manual Pagination Props
  manualPagination?: boolean;
  totalItems?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onSearchChange?: (term: string) => void;
  searchTerm?: string; // Controlled search term for manual pagination
  onRowClick?: (item: T) => void;
  renderExpandedRow?: (item: T) => ReactNode;
}

function DataTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  onImport,
  onDownloadTemplate,
  importLabel = 'Import Excel',
  downloadTemplateLabel = 'Template',
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onCreate,
  createLabel = 'Create New',
  selectable = false,
  onSelectionChange,

  // Pagination default props
  manualPagination = false,
  totalItems = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearchChange,
  searchTerm: controlledSearchTerm,
  onRowClick,
  renderExpandedRow
}: DataTableProps<T>) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  // Internal state for client-side pagination
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(10);

  // Use either controlled or internal state
  const currentPage = manualPagination ? page : internalPage;
  const itemsPerPage = manualPagination ? pageSize : internalPageSize;
  const searchTerm = manualPagination ? (controlledSearchTerm || '') : internalSearchTerm;

  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  });
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  // Filter and Search
  const filteredData = useMemo(() => {
    // If manual pagination, filtering is usually done on server, so we just return data. 
    // Or we filter the *current page* only if requested. 
    // For now, assuming server-side filtering is separate, we apply client-side search only if NOT manual or if manual but we want to filter visible items
    // But typically manual pagination implies server-side search. Here we keep it simple: 
    // If manual, we display what we got.
    if (manualPagination) return data;

    return data.filter(item =>
      Object.values(item as Record<string, any>).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, manualPagination]);

  // Sorting
  const sortedData = useMemo(() => {
    // If manual pagination, sorting is typically server-side.
    if (manualPagination) return filteredData;

    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig, manualPagination]);

  // Pagination Logic
  const totalCount = manualPagination ? totalItems : sortedData.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // For manual, currentData is just sortedData (which acts as the page data)
  const currentData = manualPagination
    ? sortedData
    : sortedData.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage);



  const startIndex = (currentPage - 1) * itemsPerPage;

  const handlePageChange = (newPage: number) => {
    if (manualPagination) {
      onPageChange?.(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (iframeSize: number) => {
    if (manualPagination) {
      onPageSizeChange?.(iframeSize);
    } else {
      setInternalPageSize(iframeSize);
      setInternalPage(1); // Reset to page 1 on size change
    }
  };

  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    if (manualPagination) {
      onSortChange?.(key, direction);
      // Reset to page 1 optional? Usually good UX
      if (onPageChange) onPageChange(1);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (manualPagination) {
      onSearchChange?.(value);
      // Reset page to 1
      if (onPageChange) onPageChange(1);
    } else {
      setInternalSearchTerm(value);
    }
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = currentData.map(item => item.id);
      setSelectedItems(allIds);
      onSelectionChange?.(allIds);
    } else {
      setSelectedItems([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelect = (e: MouseEvent | ChangeEvent, id: string | number) => {
    e.stopPropagation();
    let newSelected: (string | number)[];
    if (selectedItems.includes(id)) {
      newSelected = selectedItems.filter(item => item !== id);
    } else {
      newSelected = [...selectedItems, id];
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  const toggleRowExpansion = (e: MouseEvent | null, id: string | number) => {
    e?.stopPropagation();
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-transparent outline-none text-sm w-full sm:w-48 md:w-64"
              />
            </div>
            {selectable && (
              <span className="text-xs sm:text-sm text-gray-500">
                Selected {selectedItems.length} of {sortedData.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {onDownloadTemplate && (
            <button
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-50 transition-colors"
              onClick={onDownloadTemplate}
              title="Download Import Template"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{downloadTemplateLabel}</span>
              <span className="sm:hidden">Template</span>
            </button>
          )}
          {onImport && (
            <button
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 border-[#F37022] text-[#F37022] rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-50 transition-colors"
              onClick={onImport}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{importLabel}</span>
              <span className="sm:hidden">Import</span>
            </button>
          )}
          {onSecondaryAction && (
            <button
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-[#F37022] text-[#F37022] rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-50 transition-all active:scale-95 shadow-sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionIcon || <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span>{secondaryActionLabel || 'Action'}</span>
            </button>
          )}
          {onCreate && (
            <button
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#F37022] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#d95f19] transition-all active:scale-95 shadow-md shadow-orange-200"
              onClick={onCreate}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{createLabel}</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[52vh] overflow-y-auto border border-gray-200 rounded-lg -mx-4 md:mx-0 relative">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
              {selectable && (
                <th className="p-2 md:p-3 w-10">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={currentData.length > 0 && selectedItems.length === currentData.length}
                      className="custom-checkbox"
                    />
                  </div>
                </th>
              )}
              {renderExpandedRow && (
                <th className="p-2 md:p-3 w-10"></th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{ width: col.width }}
                  className={`p-2 md:p-3 text-${col.align || 'left'} text-[10px] md:text-xs font-bold text-[#0A1B3C] ${col.sortable ? 'cursor-pointer select-none' : ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable && requestSort(col.accessor)}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col">
                        <ArrowUp
                          className={`w-2 h-2 ${sortConfig.key === col.accessor && sortConfig.direction === 'asc' ? 'text-[#F37022]' : 'text-gray-400'}`}
                        />
                        <ArrowDown
                          className={`w-2 h-2 ${sortConfig.key === col.accessor && sortConfig.direction === 'desc' ? 'text-[#F37022]' : 'text-gray-400'}`}
                        />
                      </div>
                    )}
                    {col.filterable && <Filter className="w-3 h-3 text-gray-400 hidden md:block" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, rowIndex) => (
                <Fragment key={item.id || rowIndex}>
                  <tr
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${renderExpandedRow && expandedRows.has(item.id) ? 'bg-orange-50/30' : ''} ${renderExpandedRow || onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={(e) => {
                      if (renderExpandedRow) {
                        toggleRowExpansion(e, item.id);
                      } else if (onRowClick) {
                        onRowClick(item);
                      }
                    }}
                  >
                    {selectable && (
                      <td className="p-2 md:p-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => handleSelect(e, item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="custom-checkbox"
                          />
                        </div>
                      </td>
                    )}
                    {renderExpandedRow && (
                      <td className="p-2 md:p-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={(e) => toggleRowExpansion(e, item.id)}
                            className={`p-1 hover:bg-orange-100 rounded-md transition-all duration-200 ${expandedRows.has(item.id) ? 'rotate-180' : ''}`}
                          >
                            <ChevronDown className={`w-4 h-4 ${expandedRows.has(item.id) ? 'text-[#F37022]' : 'text-gray-400'}`} />
                          </button>
                        </div>
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={`p-2 md:p-3 text-${col.align || 'left'} text-xs md:text-sm text-[#0A1B3C] ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className || ''}`}>
                        {col.render ? col.render(item) : String(item[col.accessor])}
                      </td>
                    ))}
                  </tr>
                  {renderExpandedRow && expandedRows.has(item.id) && (
                    <tr className="bg-gray-50/50" onClick={(e) => e.stopPropagation()}>
                      <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="p-0 border-b border-gray-100">
                        <div className="p-4 bg-gray-50/30 animate-in slide-in-from-top-2 duration-200">
                          {renderExpandedRow(item)}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-6 md:p-8 text-center text-gray-500 text-sm">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <span className="hidden sm:inline">Rows per page:</span>
          <span className="sm:hidden">Per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            {totalCount > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount}
          </span>
        </div>

        <div className="flex gap-1">
          <button
            className="px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            // Check if we have too many pages, do a sliding window or something simple
            // For now, simpler logic: Show up to 5 pages around current
            let startPage = Math.max(1, currentPage - 2);
            if (startPage + 4 > totalPages) {
              startPage = Math.max(1, totalPages - 4);
            }
            const page = startPage + i;
            if (page > totalPages) return null;

            return (
              <button
                key={page}
                className={`px-2.5 sm:px-3 py-1.5 rounded min-w-[28px] sm:min-w-[32px] text-xs sm:text-sm ${currentPage === page
                  ? 'bg-[#F37022] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            );
          })}
          <button
            className="px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
