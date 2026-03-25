import { useState, useMemo } from 'react';
import { Edit, Trash2, CheckCircle2, XCircle, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Spin } from 'antd';
import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import { useGetSemestersQuery, useDeleteSemesterMutation } from '@/api/semestersApi';
import type { Semester } from '@/types/semester.types';
import CreateSemesterModal from '@/components/modals/CreateSemesterModal';
import EditSemesterModal from '@/components/modals/EditSemesterModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import SetDefaultSemesterModal from '@/components/modals/SetDefaultSemesterModal';

export default function AdminSemesters() {
    // State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSetDefaultModalOpen, setIsSetDefaultModalOpen] = useState(false);
    const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // API
    const { data, isLoading, isFetching } = useGetSemestersQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [deleteSemester] = useDeleteSemesterMutation();

    const semesters = data?.items || [];
    const totalItems = data?.totalItemCount || 0;

    // Prioritize Default Semester (Sticky at top)
    const prioritizedSemesters = useMemo(() => {
        if (!semesters.length) return [];
        return [...semesters].sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });
    }, [semesters]);

    // Handlers
    const handleSort = (column: keyof Semester, direction: 'asc' | 'desc') => {
        setSortColumn(column);
        setSortDirection(direction);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteSemester(deletingId).unwrap();
            toast.success('Semester deleted successfully');
            setDeletingId(null);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to delete semester');
        }
    };

    // Columns
    const columns = [
        {
            header: 'Code',
            accessor: 'semesterCode' as keyof Semester,
            sortable: true,
            render: (item: Semester) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{item.semesterCode}</span>
                    {item.isDefault && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200">
                            Default
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Start Date',
            accessor: 'startDate' as keyof Semester,
            sortable: true,
            render: (item: Semester) => new Date(item.startDate).toLocaleDateString()
        },
        {
            header: 'End Date',
            accessor: 'endDate' as keyof Semester,
            sortable: true,
            render: (item: Semester) => new Date(item.endDate).toLocaleDateString()
        },
        {
            header: 'Status',
            accessor: 'isActive' as keyof Semester,
            sortable: true,
            align: 'center' as const,
            render: (item: Semester) => (
                <div className="flex justify-center">
                    {item.isActive ? (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-700 hover:bg-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200">
                            <XCircle className="w-3 h-3 mr-1" /> Inactive
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Semester,
            align: 'center' as const,
            render: (item: Semester) => (
                <div className="flex gap-2 justify-center text-[#F37022]">
                    <Button
                        type="text"
                        size="small"
                        icon={<Edit className="w-4 h-4" />}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setEditingSemester(item)}
                    />
                    <Button
                        type="text"
                        size="small"
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletingId(item.id)}
                    />
                </div>
            )
        }
    ];

    if (isLoading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Semester Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading semesters..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Semester Management</h1>
                    <p className="text-muted-foreground mt-1">Manage academic semesters and periods</p>
                </div>
            </div>

            <DataTable
                title="All Semesters"
                data={prioritizedSemesters}
                columns={columns}

                // Pagination
                manualPagination={true}
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}

                // Sorting & Search
                onSortChange={handleSort}
                onSearchChange={handleSearch}
                searchTerm={searchTerm}

                // Actions
                onCreate={() => setIsCreateModalOpen(true)}
                createLabel="Create Semester"
                onImport={() => toast.info('Import feature coming soon')}
                onSecondaryAction={() => setIsSetDefaultModalOpen(true)}
                secondaryActionLabel="Set Semester"
                secondaryActionIcon={<CalendarCheck className="w-4 h-4" />}
            />

            {/* Modals */}
            <SetDefaultSemesterModal
                isOpen={isSetDefaultModalOpen}
                onClose={() => setIsSetDefaultModalOpen(false)}
            />
            <CreateSemesterModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {editingSemester && (
                <EditSemesterModal
                    semester={editingSemester}
                    isOpen={!!editingSemester}
                    onClose={() => setEditingSemester(null)}
                />
            )}

            <ConfirmDeleteModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete Semester"
                message="Are you sure you want to delete this semester? This action cannot be undone."
                itemName={prioritizedSemesters.find(s => s.id === deletingId)?.semesterCode}
            />
        </div>
    );
}
