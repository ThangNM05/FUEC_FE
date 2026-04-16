import { Database, FolderOpen } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import DataTable from '@/components/shared/DataTable';
import { useGetMyQuestionBanksQuery } from '@/api/questionBanksApi';
import { useGetQuestionByIdQuery } from '@/api/questionsApi';
import type { SubjectQuestionBankManager } from '@/types/questionBank.types';

function TeacherQuestionBanks() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reportedQuestionId = searchParams.get('questionId');

    // If we have a questionId from a notification, look up the question to find its subject
    const { data: reportedQuestion } = useGetQuestionByIdQuery(reportedQuestionId!, {
        skip: !reportedQuestionId,
    });

    // Redirect to the question bank detail page when we resolve the subject
    useEffect(() => {
        if (reportedQuestion?.subjectCode && reportedQuestionId) {
            navigate(
                `/teacher/question-banks/${reportedQuestion.subjectCode}?questionId=${reportedQuestionId}`,
                { replace: true }
            );
        }
    }, [reportedQuestion, reportedQuestionId, navigate]);

    // Filter & sort state
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const { data: allSubjects = [], isLoading, error } = useGetMyQuestionBanksQuery();

    // Client-side filtering: searchTerm
    const filteredSubjects = useMemo(() => {
        let result = allSubjects;
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.subjectCode.toLowerCase().includes(q) ||
                s.subjectName.toLowerCase().includes(q)
            );
        }

        // sorting
        if (sortColumn) {
            result = [...result].sort((a, b) => {
                const aVal = a[sortColumn as keyof SubjectQuestionBankManager];
                const bVal = b[sortColumn as keyof SubjectQuestionBankManager];
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? (aVal - bVal) : (bVal - aVal);
                }
                return 0;
            });
        }

        return result;
    }, [allSubjects, searchTerm, sortColumn, sortDirection]);

    // Manual pagination
    const totalItemCount = filteredSubjects.length;
    const pagedSubjects = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredSubjects.slice(start, start + pageSize);
    }, [filteredSubjects, page, pageSize]);

    const columns = [
        {
            header: 'Subject Code',
            accessor: 'subjectCode' as keyof SubjectQuestionBankManager,
            sortable: true,
            render: (item: SubjectQuestionBankManager) => (
                <div className="flex items-center gap-2 font-medium">
                    <Database className="w-4 h-4 text-orange-500" />
                    {item.subjectCode}
                </div>
            )
        },
        { header: 'Subject Name', accessor: 'subjectName' as keyof SubjectQuestionBankManager, sortable: true },
        {
            header: 'Actions',
            accessor: 'subjectId' as keyof SubjectQuestionBankManager,
            align: 'center' as const,
            render: (item: SubjectQuestionBankManager) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teacher/question-banks/${item.subjectCode}`);
                        }}
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-600"
                        title="Open Bank"
                    >
                        <FolderOpen className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const hasShownError = useRef(false);
    useEffect(() => {
        if (error && !hasShownError.current) {
            toast.error('Failed to load teaching subjects.');
            hasShownError.current = true;
        }
        if (!error) hasShownError.current = false;
    }, [error]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-2">My Question Banks</h1>
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
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Question Banks</h1>
            </div>

            {/* Table */}
            <DataTable
                title={`My Subjects (${totalItemCount})`}
                data={pagedSubjects}
                columns={columns as any}
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
                onRowClick={(item: SubjectQuestionBankManager) => navigate(`/teacher/question-banks/${item.subjectCode}`)}
            />
        </div>
    );

    function handleSortChange(column: keyof SubjectQuestionBankManager, direction: 'asc' | 'desc') {
        setSortColumn(column as string);
        setSortDirection(direction);
    }
}

export default TeacherQuestionBanks;
