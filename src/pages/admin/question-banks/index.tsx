import { Database, Edit2, Shield, FolderOpen, ChevronRight } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import DataTable from '@/components/shared/DataTable';
import ManageQuestionBankPermissionsModal from '@/components/modals/ManageQuestionBankPermissionsModal';
import { useGetAdminQuestionBanksQuery } from '@/api/questionBanksApi';
import type { QuestionBank } from '@/types/questionBank.types';

function AdminQuestionBanks() {
  const navigate = useNavigate();

  // Filter & sort state
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Two-level filter state
  const [selectedMajor, setSelectedMajor] = useState<string>('All');
  const [selectedSubMajor, setSelectedSubMajor] = useState<string>('All');

  // Modal state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);

  // Fetch ALL banks once – filter client-side (no re-fetch on tab change)
  const { data: qbData, isLoading, error } = useGetAdminQuestionBanksQuery({
    page: 1,
    pageSize: 1000,
    sortColumn,
    sortDirection,
  });

  const allBanks: QuestionBank[] = qbData?.items || [];

  // Derive unique Majors from data
  const majors = useMemo(() => {
    const unique = Array.from(new Set(allBanks.flatMap(b => b.majors || []))).sort();
    return ['All', ...unique];
  }, [allBanks]);

  // Derive SubMajors available for the selected Major
  const subMajors = useMemo(() => {
    if (selectedMajor === 'All') return [];
    const forMajor = allBanks.filter(b => b.majors?.includes(selectedMajor));
    const unique = Array.from(new Set(forMajor.flatMap(b => b.subMajorNames || []))).sort();
    return ['All', ...unique];
  }, [allBanks, selectedMajor]);

  // Reset sub-major tab when major changes
  const handleSelectMajor = (major: string) => {
    setSelectedMajor(major);
    setSelectedSubMajor('All');
    setPage(1);
  };

  // Client-side filtering: Major → SubMajor → searchTerm
  const filteredBanks = useMemo(() => {
    let result = allBanks;
    if (selectedMajor !== 'All') result = result.filter(b => b.majors?.includes(selectedMajor));
    if (selectedSubMajor !== 'All') result = result.filter(b => b.subMajorNames?.includes(selectedSubMajor));
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.subjectCode.toLowerCase().includes(q) ||
        b.subjectName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allBanks, selectedMajor, selectedSubMajor, searchTerm]);

  // Manual pagination
  const totalItemCount = filteredBanks.length;
  const pagedBanks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBanks.slice(start, start + pageSize);
  }, [filteredBanks, page, pageSize]);

  const columns = [
    {
      header: 'Subject Code',
      accessor: 'subjectCode' as keyof QuestionBank,
      sortable: true,
      render: (item: QuestionBank) => (
        <div className="flex items-center gap-2 font-medium">
          <Database className="w-4 h-4 text-orange-500" />
          {item.subjectCode}
        </div>
      )
    },
    { header: 'Subject Name', accessor: 'subjectName' as keyof QuestionBank, sortable: true },
    {
      header: 'Questions',
      accessor: 'totalQuestions' as keyof QuestionBank,
      align: 'center' as const,
    },
    {
      header: 'Teachers',
      accessor: 'assignedTeachers' as keyof QuestionBank,
      align: 'center' as const,
      render: (item: QuestionBank) => (
        <div className="flex items-center justify-center gap-1.5 text-blue-600 font-medium">
          {item.assignedTeachers}
        </div>
      )
    },
    {
      header: 'Last Updated',
      accessor: 'lastUpdated' as keyof QuestionBank,
      sortable: true,
      render: (item: QuestionBank) => item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '-'
    },
    {
      header: 'Status',
      accessor: 'status' as keyof QuestionBank,
      align: 'center' as const,
      render: (item: QuestionBank) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof QuestionBank,
      align: 'center' as const,
      render: (item: QuestionBank) => (
        <div className="flex gap-2 justify-center">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title="Manage Permissions"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBank(item);
              setIsManageModalOpen(true);
            }}
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/question-banks/${item.subjectCode}`);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600"
            title="Edit Bank"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const hasShownError = useRef(false);
  useEffect(() => {
    if (error && !hasShownError.current) {
      toast.error('Failed to load question banks.');
      hasShownError.current = true;
    }
    if (!error) hasShownError.current = false;
  }, [error]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-2">Question Bank Management</h1>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-[#F37022] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Question Bank Management</h1>
      </div>

      {/* Row 1: Major tabs */}
      <div className="flex overflow-x-auto pb-1 mb-2 gap-2 hide-scrollbar">
        {majors.map(major => {
          const count = major === 'All'
            ? allBanks.length
            : allBanks.filter(b => b.majors?.includes(major)).length;
          const isActive = selectedMajor === major;
          return (
            <button
              key={major}
              onClick={() => handleSelectMajor(major)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${isActive
                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {major === 'All' && <FolderOpen className="w-4 h-4" />}
              {major}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 2: SubMajor tabs – only shown when a Major is selected */}
      {selectedMajor !== 'All' && subMajors.length > 1 && (
        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 hide-scrollbar pl-2 items-center">
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {subMajors.map(sm => {
            const count = sm === 'All'
              ? allBanks.filter(b => b.majors?.includes(selectedMajor)).length
              : allBanks.filter(b => b.majors?.includes(selectedMajor) && b.subMajorNames?.includes(sm)).length;
            const isActive = selectedSubMajor === sm;
            return (
              <button
                key={sm}
                onClick={() => { setSelectedSubMajor(sm); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {sm}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <DataTable
        title={`All Question Banks (${totalItemCount})`}
        data={pagedBanks}
        columns={columns}
        selectable={true}
        manualPagination={true}
        totalItems={totalItemCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSortChange={handleSortChange as any}
        onSearchChange={(t) => { setSearchTerm(t); setPage(1); }}
        searchTerm={searchTerm}
        onRowClick={(item: QuestionBank) => navigate(`/admin/question-banks/${item.subjectCode}`)}
      />

      <ManageQuestionBankPermissionsModal
        isOpen={isManageModalOpen}
        onClose={() => { setIsManageModalOpen(false); setSelectedBank(null); }}
        subjectId={selectedBank?.id || null}
        subjectCode={selectedBank?.subjectCode || ''}
        subjectName={selectedBank?.subjectName || ''}
      />
    </div>
  );

  function handleSortChange(column: keyof QuestionBank, direction: 'asc' | 'desc') {
    setSortColumn(column as string);
    setSortDirection(direction);
  }
}

export default AdminQuestionBanks;
