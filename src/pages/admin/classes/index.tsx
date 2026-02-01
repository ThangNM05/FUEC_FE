import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import EditClassModal from '@/components/modals/EditClassModal';

import {
    useGetClassesQuery,
    useDeleteClassMutation,
} from '@/api/classesApi';
import type { Class } from '@/types/class.types';

function AdminClasses() {
    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<Class | null>(null);

    // Edit/Create Modal State
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // RTK Query hooks
    const { data: classesData, isLoading, error } = useGetClassesQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

    // Extract data from PaginatedResponse
    const classes = classesData?.items || [];
    const totalClasses = classesData?.totalItemCount || 0;

    // Handle Delete
    const handleDelete = (classItem: Class) => {
        setClassToDelete(classItem);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!classToDelete) return;

        try {
            await deleteClass(classToDelete.id).unwrap();
            toast.success(`Class "${classToDelete.classCode}" deleted successfully!`);
            setClassToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error('Deletion failed! ' + ((err as any)?.data?.message || (err as any)?.message || 'Unknown error'));
        }
    };

    // Handle Edit
    const handleEdit = (classItem: Class) => {
        setSelectedClass(classItem);
        setIsEditModalOpen(true);
    };

    // Handle Create
    const handleCreate = () => {
        setSelectedClass(null);
        setIsEditModalOpen(true);
    };

    // Handle Sort Change
    const handleSortChange = (column: keyof Class, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    // Handle Search Change
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setPage(1); // Reset to first page on search
    };

    const columns = [
        {
            header: 'Class Code',
            accessor: 'classCode' as keyof Class,
            sortable: true,
            filterable: true,
            className: 'w-[15%] px-4',
            render: (item: Class) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {item.classCode}
                </span>
            )
        },
        {
            header: 'Subject',
            accessor: 'subjectName' as keyof Class,
            sortable: true,
            filterable: true,
            className: 'w-[25%] px-4',
            render: (item: Class) => (
                <div>
                    <div className="font-medium">{item.subjectName || '-'}</div>
                    {item.subjectCode && (
                        <div className="text-xs text-gray-500">{item.subjectCode}</div>
                    )}
                </div>
            )
        },
        {
            header: 'Semester',
            accessor: 'semesterName' as keyof Class,
            sortable: true,
            className: 'w-[15%] px-4',
            render: (item: Class) => (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {item.semesterName || '-'}
                </span>
            )
        },
        {
            header: 'Teacher',
            accessor: 'teacherName' as keyof Class,
            sortable: true,
            className: 'w-[20%] px-4',
        },
        {
            header: 'Status',
            accessor: 'isActive' as keyof Class,
            sortable: true,
            align: 'center' as const,
            className: 'w-[10%] px-4',
            render: (item: Class) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Class,
            align: 'center' as const,
            className: 'w-[15%] text-center px-4',
            render: (item: Class) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        title="Edit Class"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                        disabled={isDeleting}
                        title="Delete Class"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )
        }
    ];

    if (error) {
        toast.error('Failed to load classes.');
    }

    if (isLoading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Class Management</h1>
                    <p className="text-gray-600 mt-1">Manage all classes in the system</p>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading classes..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Class Management</h1>
                <p className="text-gray-600 mt-1">Manage all classes in the system</p>
            </div>

            <DataTable
                title={`All Classes (${totalClasses})`}
                data={classes}
                columns={columns}
                onCreate={handleCreate}
                createLabel="Add Class"
                selectable={true}
                manualPagination={true}
                totalItems={totalClasses}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
            />

            <EditClassModal
                classData={selectedClass}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete class "${classToDelete?.classCode}"?`}
                itemName={classToDelete?.classCode}
            />
        </div>
    );
}

export default AdminClasses;
