import { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import EditClassModal from '@/components/modals/EditClassModal';
import ClassSubjectDetailModal from '@/components/modals/ClassSubjectDetailModal';
import AutoAssignClassModal from '@/components/modals/AutoAssignClassModal';
import type { Subject } from '@/types/class.types';

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

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // Auto Assign Modal State
    const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);

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

    const handleSubjectClick = (classItem: Class, subject: Subject) => {
        setSelectedClass(classItem);
        setSelectedSubject(subject);
        setIsDetailModalOpen(true);
    };

    const handleImportClasses = () => {
        toast.info("Import feature coming soon!");
    }

     const handleAutoAssign = () => {
        setIsAutoAssignModalOpen(true);
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
            header: 'Subjects',
            accessor: 'subjects' as keyof Class,
            sortable: false,
            filterable: false,
            className: 'w-[45%] px-4',
            render: (item: Class) => (
                <div className="flex flex-wrap gap-1">
                    {item.subjects && item.subjects.length > 0 ? (
                        item.subjects.map((subject, idx) => (
                            <span 
                                key={idx}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium cursor-pointer hover:bg-blue-200 hover:ring-1 hover:ring-blue-300 transition-all select-none"
                                title={`Manage ${subject.name}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubjectClick(item, subject);
                                }}
                            >
                                {subject.code}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">No subjects</span>
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
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    {item.semesterName || '-'}
                </span>
            )
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

    // Show error toast only once
    const hasShownError = useRef(false);
    useEffect(() => {
        if (error && !hasShownError.current) {
            toast.error('Failed to load classes.');
            hasShownError.current = true;
        }
        if (!error) {
            hasShownError.current = false;
        }
    }, [error]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Class Management</h1>
                    <p className="text-gray-600 mt-1">Manage all classes in the system</p>
                </div>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div 
                        className="w-12 h-12 border-4 border-[#F37022] border-t-transparent rounded-full"
                        style={{ animation: 'spin 1s linear infinite' }}
                    />
                    <p className="text-gray-500">Loading classes...</p>
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
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
                onImport={undefined}
                importLabel={undefined}
                onSecondaryAction={handleAutoAssign}
                secondaryActionLabel="Auto Generate"
                secondaryActionIcon={<Wand2 className="w-4 h-4" />}
            />

            <EditClassModal
                classData={selectedClass}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ClassSubjectDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                classData={selectedClass}
                subject={selectedSubject}
            />

            <AutoAssignClassModal
                isOpen={isAutoAssignModalOpen}
                onClose={() => setIsAutoAssignModalOpen(false)}
                onSuccess={() => {
                    // Refetch data handles it automatically via tags invalidation? 
                    // RTK Query handles it if invalidatesTags is set correctly.
                    setIsAutoAssignModalOpen(false);
                }}
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
