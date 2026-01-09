import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import toast from '@/lib/toast';

interface Department {
    id: number;
    name: string;
    code: string;
    head: string;
    staff: number;
    students: number;
    status: string;
}

function AdminDepartments() {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

    const departments: Department[] = [
        {
            id: 1,
            name: 'Software Engineering',
            code: 'SE',
            head: 'Prof. Nguyen Van A',
            staff: 25,
            students: 450,
            status: 'Active'
        },
        {
            id: 2,
            name: 'Information Systems',
            code: 'IS',
            head: 'Prof. Tran Thi B',
            staff: 20,
            students: 380,
            status: 'Active'
        },
        {
            id: 3,
            name: 'Computer Science',
            code: 'CS',
            head: 'Prof. Le Van C',
            staff: 30,
            students: 520,
            status: 'Active'
        }
    ];

    const columns = [
        { header: 'Department Name', accessor: 'name' as keyof Department, sortable: true, filterable: true },
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
        { header: 'Department Head', accessor: 'head' as keyof Department, sortable: true, filterable: true },
        {
            header: 'Staff',
            accessor: 'staff' as keyof Department,
            sortable: true,
            align: 'center' as const,
            render: (item: Department) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.staff}</span>
            )
        },
        {
            header: 'Students',
            accessor: 'students' as keyof Department,
            sortable: true,
            align: 'center' as const,
            render: (item: Department) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.students}</span>
            )
        },
        {
            header: 'Status',
            accessor: 'status' as keyof Department,
            sortable: true,
            align: 'center' as const,
            render: (item: Department) => (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Department,
            align: 'center' as const,
            render: (item: Department) => (
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
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )
        }
    ];

    const handleEdit = (department: Department) => {
        toast.warning(`Function edit ${department.name} is not implemented yet`);
    };

    const handleDelete = (department: Department) => {
        setDepartmentToDelete(department);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (departmentToDelete) {
            // Simulate delete error - department has students
            if (departmentToDelete.students > 0) {
                toast.error(`Cannot delete ${departmentToDelete.name}! Still has ${departmentToDelete.students} students.`);
            } else {
                toast.success(`Successfully deleted ${departmentToDelete.name}!`);
            }
            setDepartmentToDelete(null);
        }
    };

    const handleImport = () => {
        setIsImportModalOpen(true);
    };

    const handleImportConfirm = (file: File) => {
        // Simulate file upload
        toast.success(`Đang tải lên file: ${file.name}`);
        // In real implementation, you would upload the file to the server here
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Department Management</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage departments, heads, and staff.</p>
            </div>

            <DataTable
                title="All Departments"
                data={departments}
                columns={columns}
                onCreate={() => toast.success('Create department successfully!')}
                createLabel="Create Department"
                onImport={handleImport}
                selectable={true}
            />

            {/* Import Excel Modal */}
            <ImportExcelModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onConfirm={handleImportConfirm}
            />

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Are you sure you want to delete this department?"
                message="This action cannot be undone. This will permanently delete the department from the system."
                itemName={departmentToDelete?.name}
            />
        </div>
    );
}

export default AdminDepartments;
