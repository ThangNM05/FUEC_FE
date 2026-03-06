import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import EditMajorModal from '@/components/modals/EditMajorModal';
import SubMajorDrawer from './SubMajorDrawer';

import {
    useGetMajorsQuery,
    useDeleteMajorMutation,
} from '@/api/majorsApi';
import type { Major } from '@/types/major.types';
import { useState } from 'react';

export default function MajorList() {
    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [majorToDelete, setMajorToDelete] = useState<Major | null>(null);

    // Edit/Create Modal State
    const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // RTK Query hooks
    const { data: majorsData, isLoading, error } = useGetMajorsQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [deleteMajor, { isLoading: isDeleting }] = useDeleteMajorMutation();

    // Extract data from PaginatedResponse
    const majors = majorsData?.items || [];
    const totalMajors = majorsData?.totalItemCount || 0;

    // Handle Delete
    const handleDelete = (major: Major) => {
        setMajorToDelete(major);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!majorToDelete) return;

        try {
            await deleteMajor(majorToDelete.id).unwrap();
            toast.success(`Major "${majorToDelete.name}" deleted successfully!`);
            setMajorToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error('Deletion failed! ' + ((err as any)?.data?.message || (err as any)?.message || 'Unknown error'));
        }
    };

    // Handle Edit
    const handleEdit = (major: Major) => {
        setSelectedMajor(major);
        setIsEditModalOpen(true);
    };

    // Handle Create
    const handleCreate = () => {
        setSelectedMajor(null);
        setIsEditModalOpen(true);
    };

    // Handle Sort Change
    const handleSortChange = (column: keyof Major, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    // Handle Search Change
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    const handleRowClick = (major: Major) => {
        setSelectedMajor(major);
        setIsDrawerOpen(true);
    };

    const columns = [
        {
            header: 'Code',
            accessor: 'code' as keyof Major,
            sortable: true,
            filterable: true,
            className: 'w-[15%] px-4',
            render: (item: Major) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">
                    {item.code}
                </span>
            )
        },
        {
            header: 'Major Name',
            accessor: 'name' as keyof Major,
            sortable: true,
            filterable: true,
            className: 'w-[45%] px-4',
        },

        {
            header: 'Description',
            accessor: 'description' as keyof Major,
            sortable: false,
            className: 'w-[25%] px-4',
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Major,
            align: 'center' as const,
            className: 'w-[15%] text-center px-4',
            render: (item: Major) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        title="Edit Major"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                        disabled={isDeleting}
                        title="Delete Major"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )
        }
    ];

    if (error) {
        toast.error('Failed to load majors.');
    }

    if (isLoading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="flex items-center justify-center h-64">
                <Spin indicator={antIcon} tip="Loading majors..." />
            </div>
        );
    }

    return (
        <div className="mt-4">
            <DataTable
                title={`All Majors (${totalMajors})`}
                data={majors}
                columns={columns}
                onCreate={handleCreate}
                createLabel="Add Major"
                selectable={true}
                manualPagination={true}
                totalItems={totalMajors}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
                onRowClick={handleRowClick}
            />

            <SubMajorDrawer
                major={selectedMajor}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            <EditMajorModal
                major={isDrawerOpen ? null : selectedMajor}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete major "${majorToDelete?.name}"?`}
                itemName={majorToDelete?.name}
            />

        </div>
    );
}
