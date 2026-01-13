import { useState, useMemo } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, Download, Plus,
  ArrowUp, ArrowDown
} from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onImport?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  importLabel?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

function DataTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  onImport,
  onCreate,
  createLabel = 'Create New',
  importLabel = 'Import Excel',
  selectable = false,
  onSelectionChange
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  });
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

  // Filter and Search
  const filteredData = useMemo(() => {
    return data.filter(item =>
      Object.values(item as Record<string, any>).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
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
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = currentData.map(item => item.id);
      setSelectedItems(allIds);
      onSelectionChange?.(allIds);
    } else {
      setSelectedItems([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelect = (id: string | number) => {
    let newSelected: (string | number)[];
    if (selectedItems.includes(id)) {
      newSelected = selectedItems.filter(item => item !== id);
    } else {
      newSelected = [...selectedItems, id];
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 md:mb-6">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-[#0A1B3C] mb-2">{title}</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          {onImport && (
            <button
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 border-[#F37022] text-[#F37022] rounded-lg text-xs sm:text-sm font-medium"
              onClick={onImport}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{importLabel}</span>
              <span className="sm:hidden">Import</span>
            </button>
          )}
          {onCreate && (
            <button
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#F37022] text-white rounded-lg text-xs sm:text-sm font-medium"
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
      <div className="overflow-x-auto border border-gray-200 rounded-lg -mx-4 md:mx-0">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
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
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-2 md:p-3 text-${col.align || 'left'} text-[10px] md:text-xs font-bold text-[#0A1B3C] ${col.sortable ? 'cursor-pointer select-none' : ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
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
                <tr key={item.id || rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                  {selectable && (
                    <td className="p-2 md:p-3">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                          className="custom-checkbox"
                        />
                      </div>
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`p-2 md:p-3 text-${col.align || 'left'} text-xs md:text-sm text-[#0A1B3C] ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}>
                      {col.render ? col.render(item) : String(item[col.accessor])}
                    </td>
                  ))}
                </tr>
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
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length}
          </span>
        </div>

        <div className="flex gap-1">
          <button
            className="px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                className={`px-2.5 sm:px-3 py-1.5 rounded min-w-[28px] sm:min-w-[32px] text-xs sm:text-sm ${currentPage === page
                  ? 'bg-[#F37022] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}
          <button
            className="px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
