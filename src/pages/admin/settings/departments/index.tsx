import { useState } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import EditDepartmentModal from '@/features/department-management/components/EditDepartmentModal';

import {
    useGetDepartmentsQuery,
    useDeleteDepartmentMutation,
} from '@/features/department-management/services/departmentsApi';
import type { Department } from '@/features/department-management/types/department.types';

function AdminDepartments() {
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

    // Edit/Create Modal State
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // RTK Query hooks
    const { data: departments = [], isLoading, error } = useGetDepartmentsQuery();
    const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();

    // Handle Delete
    const handleDelete = (department: Department) => {
        setDepartmentToDelete(department);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!departmentToDelete) return;

        try {
            await deleteDepartment(departmentToDelete.id).unwrap();
            toast.success(`Đã xóa bộ môn "${departmentToDelete.name}" thành công!`);
            setDepartmentToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Xóa thất bại! ' + ((err as any)?.data?.message || (err as any)?.message || 'Lỗi không xác định'));
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

    const columns = [
        {
            header: 'Code',
            accessor: 'code' as keyof Department,
            sortable: true,
            filterable: true,
            render: (item: Department) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        { header: 'Department Name', accessor: 'name' as keyof Department, sortable: true, filterable: true },
        {
            header: 'Teachers',
            accessor: 'teacherCount' as keyof Department,
            align: 'center' as const,
            sortable: true,
            render: (item: Department) => (
                <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{item.teacherCount || 0}</span>
                </div>
            )
        },
        { header: 'Description', accessor: 'description' as keyof Department, sortable: false, filterable: false },
        {
            header: 'Actions',
            accessor: 'id' as keyof Department,
            align: 'center' as const,
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
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Department Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F37022] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách bộ môn...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Department Management</h1>
                <p className="text-gray-600 mt-1">Quản lý danh sách bộ môn, khoa, viện</p>
            </div>

            <DataTable
                title={`All Departments (${departments.length})`}
                data={departments}
                columns={columns}
                onCreate={handleCreate}
                createLabel="Create Department"
                // Import skipped as per request
                selectable={true}
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
                title="Xác nhận xóa bộ môn"
                message={`Bạn có chắc muốn xóa bộ môn "${departmentToDelete?.name}"? Hành động này không thể hoàn tác.`}
                itemName={departmentToDelete?.name}
            />
        </div>
    );
}

export default AdminDepartments;
