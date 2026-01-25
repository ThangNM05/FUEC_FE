import { useState } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import EditDepartmentModal from '@/components/modals/EditDepartmentModal';

import {
    useGetDepartmentsQuery,
    useDeleteDepartmentMutation,
} from '@/api/departmentsApi';
import type { Department } from '@/types/department.types';

function AdminDepartments() {
    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

    // Edit/Create Modal State
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // RTK Query hooks

    const { data: departmentsData, isLoading, error } = useGetDepartmentsQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();

    // Extract data from PaginatedResponse
    const departments = departmentsData?.items || [];
    const totalDepartments = departmentsData?.totalItemCount || 0;

    // Handle Delete
    const handleDelete = (department: Department) => {
        setDepartmentToDelete(department);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!departmentToDelete) return;

        try {
            await deleteDepartment(departmentToDelete.id).unwrap();
            toast.success(`Department "${departmentToDelete.name}" deleted successfully!`);
            setDepartmentToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {

            toast.error('Deletion failed! ' + ((err as any)?.data?.message || (err as any)?.message || 'Unknown error'));
        }
    };

    // Handle Edit
    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setIsEditModalOpen(true);
    };

    // Handle Create
    const handleCreate = () => {
        setSelectedDepartment(null); // Clear selection for create mode
        setIsEditModalOpen(true);
    };

    // Handle Sort Change
    const handleSortChange = (column: keyof Department, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    // Handle Search Change
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    // Placeholder for Import
    const handleImportClick = () => {
        // toast.info("Import feature coming soon!");
        // User requested a button "like students/teachers". 
        // Since we don't have the backend for it yet, we just show a toast or open a dummy modal if we had one.
        // For now, simple toast as per request guidance "create placeholder".
        toast.info("Import feature for Departments is under development.");
    };

    const columns = [
        {
            header: 'Code',
            accessor: 'code' as keyof Department,
            sortable: true,
            filterable: true,
            className: 'w-[15%]',
            render: (item: Department) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        {
            header: 'Department Name',
            accessor: 'name' as keyof Department,
            sortable: true,
            filterable: true,
            className: 'w-[30%]',
        },
        {
            header: 'Teachers',
            accessor: 'teacherCount' as keyof Department,
            align: 'center' as const,
            sortable: true,
            className: 'w-[15%] text-center',
            render: (item: Department) => (
                <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{item.teacherCount || 0}</span>
                </div>
            )
        },
        {
            header: 'Description',
            accessor: 'description' as keyof Department,
            sortable: false,
            filterable: false,
            className: 'w-[25%]',
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Department,
            align: 'center' as const,
            className: 'w-[15%] text-center',
            render: (item: Department) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(item)}
                        title="Edit Department"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        title="Delete Department"
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
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Department Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading departments..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Department Management</h1>
                <p className="text-gray-600 mt-1">Manage academic departments</p>
            </div>

            <DataTable
                title={`All Departments (${totalDepartments})`}
                data={departments}
                columns={columns}

                onCreate={handleCreate}
                createLabel="Add Department"

                onImport={handleImportClick}
                importLabel="Import Excel"

                selectable={true}

                // Manual Pagination
                manualPagination={true}
                totalItems={totalDepartments}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
            />

            <EditDepartmentModal
                department={selectedDepartment}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete department "${departmentToDelete?.name}"? This action cannot be undone.`}
                itemName={departmentToDelete?.name}
            />
        </div>
    );
}

export default AdminDepartments;
