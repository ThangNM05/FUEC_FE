import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import {
    useGetExamFormatsQuery,
    useDeleteExamFormatMutation
} from '@/api/examFormatsApi';
import type { ExamFormat } from '@/types/examFormat.types';
import { CreateExamFormatModal, EditExamFormatModal } from '@/components/modals/ExamFormatModals';

function AdminExamTypes() {
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedExamFormat, setSelectedExamFormat] = useState<ExamFormat | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [examFormatToDelete, setExamFormatToDelete] = useState<ExamFormat | null>(null);

    // Pagination/Search/Sort State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // API
    const { data: examFormatsData, isLoading } = useGetExamFormatsQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [deleteExamFormat, { isLoading: isDeleting }] = useDeleteExamFormatMutation();

    const examFormats = examFormatsData?.items || [];
    const totalItems = examFormatsData?.totalItemCount || 0;

    const handleSortChange = (column: keyof ExamFormat, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    const handleEdit = (examFormat: ExamFormat) => {
        setSelectedExamFormat(examFormat);
        setIsEditModalOpen(true);
    };

    const handleDelete = (examFormat: ExamFormat) => {
        setExamFormatToDelete(examFormat);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!examFormatToDelete) return;
        try {
            await deleteExamFormat(examFormatToDelete.id).unwrap();
            toast.success(`Exam format "${examFormatToDelete.code}" deleted successfully!`);
            setExamFormatToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error('Delete failed', err);
            toast.error(err?.data?.message || 'Failed to delete exam format');
        }
    };

    const columns = [
        {
            header: 'Exam Type',
            accessor: 'code' as keyof ExamFormat,
            sortable: true,
            filterable: true,
            render: (item: ExamFormat) => (
                <span className="font-semibold text-[#0A1B3C]">
                    {item.code}
                </span>
            )
        },
        {
            header: 'Type Name',
            accessor: 'typeName' as keyof ExamFormat,
            sortable: true,
            filterable: true,
            render: (item: ExamFormat) => (
                <span className="text-gray-600 font-medium">
                    {item.typeName || '-'}
                </span>
            )
        },
        {
            header: 'Duration (min)',
            accessor: 'durations' as keyof ExamFormat,
            sortable: true,
            align: 'center' as const,
            render: (item: ExamFormat) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.durations}</span>
            )
        },
        {
            header: 'Weight (%)',
            accessor: 'weight' as keyof ExamFormat,
            sortable: true,
            align: 'center' as const,
            render: (item: ExamFormat) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.weight}%</span>
            )
        },
        {
            header: 'Description',
            accessor: 'description' as keyof ExamFormat,
            sortable: false,
            render: (item: ExamFormat) => (
                <div className="max-w-[300px] truncate" title={item.description}>
                    {item.description || '-'}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'isActive' as keyof ExamFormat,
            sortable: true,
            align: 'center' as const,
            render: (item: ExamFormat) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof ExamFormat,
            align: 'center' as const,
            render: (item: ExamFormat) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(item)}
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Exam Type Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading exam types..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Exam Type Management</h1>
            </div>

            <DataTable
                title={`All Exam Types (${totalItems})`}
                data={examFormats}
                columns={columns}
                onCreate={() => setIsCreateModalOpen(true)}
                createLabel="Create Exam Type"
                selectable={true}
                manualPagination={true}
                totalItems={totalItems}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
            />

            <CreateExamFormatModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {selectedExamFormat && (
                <EditExamFormatModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedExamFormat(null);
                    }}
                    data={selectedExamFormat}
                />
            )}

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Exam Type"
                message={`Are you sure you want to delete exam type "${examFormatToDelete?.code}"?`}
                itemName={examFormatToDelete?.code}
            />
        </div>
    );
}

export default AdminExamTypes;
