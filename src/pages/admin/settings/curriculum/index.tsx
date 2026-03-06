import { useState, useEffect } from 'react';
import { Edit, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Spin, Tag } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import {
    useGetCurriculumsQuery,
    useDeleteCurriculumMutation,
} from '@/api/curriculumsApi';
import type { Curriculum } from '@/types/curriculum.types';
import CreateCurriculumModal from '@/components/modals/CreateCurriculumModal';
import EditCurriculumModal from '@/components/modals/EditCurriculumModal';

function AdminCurriculum() {
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [curriculumToDelete, setCurriculumToDelete] = useState<Curriculum | null>(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // RTK Query hooks
    const { data: curriculumsData, isLoading, error } = useGetCurriculumsQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });
    const [deleteCurriculum, { isLoading: isDeleting }] = useDeleteCurriculumMutation();

    // Extract data
    const curriculums = curriculumsData?.items || [];
    const totalCurriculums = curriculumsData?.totalItemCount || 0;

    // Handle API Error
    useEffect(() => {
        if (error) {
            toast.error('Failed to load curriculums');
        }
    }, [error]);

    // Handlers
    const handleEdit = (curriculum: Curriculum) => {
        setSelectedCurriculum(curriculum);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (curriculum: Curriculum) => {
        setCurriculumToDelete(curriculum);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!curriculumToDelete) return;

        try {
            await deleteCurriculum(curriculumToDelete.id).unwrap();
            toast.success('Curriculum deleted successfully!');
            setCurriculumToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error('Failed to delete curriculum: ' + ((err as any)?.data?.message || (err as any)?.message || ''));
        }
    };

    const handleSortChange = (column: keyof Curriculum, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    // Table columns
    const columns = [
        {
            header: 'Code',
            accessor: 'code' as keyof Curriculum,
            sortable: true,
            filterable: true,
            className: 'w-[15%]',
            render: (item: Curriculum) => (
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{item.code}</span>
                </div>
            ),
        },
        {
            header: 'Name',
            accessor: 'name' as keyof Curriculum,
            sortable: true,
            filterable: true,
            className: 'w-[25%]',
        },
        {
            header: 'Specialization',
            accessor: 'subMajorName' as keyof Curriculum,
            sortable: true,
            className: 'w-[20%]',
            render: (item: Curriculum) => (
                <div>
                    {item.subMajorName ? (
                        <span>{item.subMajorName}</span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Cohort',
            accessor: 'cohort' as keyof Curriculum,
            align: 'center' as const,
            className: 'w-[10%]',
            render: (item: Curriculum) => (
                <Tag color="blue">{item.cohort || `K${item.startYear % 100}`}</Tag>
            ),
        },
        {
            header: 'Terms',
            accessor: 'totalTerms' as keyof Curriculum,
            align: 'center' as const,
            className: 'w-[8%]',
        },
        {
            header: 'Subjects',
            accessor: 'subjectCount' as keyof Curriculum,
            align: 'center' as const,
            className: 'w-[10%]',
            render: (item: Curriculum) => (
                <Tag color="green">{item.subjectCount}</Tag>
            ),
        },
        {
            header: 'Status',
            accessor: 'isActive' as keyof Curriculum,
            align: 'center' as const,
            className: 'w-[10%]',
            render: (item: Curriculum) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isActive
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                        }`}
                >
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Curriculum,
            align: 'center' as const,
            className: 'w-[100px]',
            render: (item: Curriculum) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(item)}
                        title="Edit Curriculum"
                    >
                        <Edit className="w-4 h-4 text-[#F37022]" />
                    </button>
                    <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDeleteClick(item)}
                        disabled={isDeleting}
                        title="Delete Curriculum"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            ),
        },
    ];

    // Loading state
    if (isLoading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Curriculum Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading curriculums..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Curriculum Management</h1>
            </div>

            <DataTable
                title={`All Curriculums (${totalCurriculums})`}
                data={curriculums}
                columns={columns}
                onCreate={() => setIsCreateModalOpen(true)}
                createLabel="Add Curriculum"
                selectable={true}

                // Manual Pagination
                manualPagination={true}
                totalItems={totalCurriculums}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
            />

            <CreateCurriculumModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditCurriculumModal
                curriculum={selectedCurriculum}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Delete"
                message={`Are you sure you want to delete curriculum "${curriculumToDelete?.name}"?`}
                itemName={curriculumToDelete?.name}
                confirmButtonLabel="Delete"
                confirmButtonVariant="danger"
            />
        </div>
    );
}

export default AdminCurriculum;
