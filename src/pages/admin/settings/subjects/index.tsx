import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ImportResultModal from '@/components/shared/ImportResultModal';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { validateFileUpload } from '@/config/appConfig';

import {
    useGetSubjectsQuery,
    useImportSubjectsMutation,
    useDeleteSubjectMutation
} from '@/api/subjectsApi';
import type { ImportSubjectsResponse, Subject } from '@/types/subject.types';

import CreateSubjectModal from '@/components/modals/CreateSubjectModal';
import EditSubjectModal from '@/components/modals/EditSubjectModal';
import ViewSubjectModal from '@/components/modals/ViewSubjectModal';

function AdminSubjects() {
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewSubject, setViewSubject] = useState<Subject | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

    const [importResult, setImportResult] = useState<ImportSubjectsResponse | null>(null);
    const [isImportResultModalOpen, setIsImportResultModalOpen] = useState(false);

    // Pagination/Search/Sort State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // API
    const { data: subjectsData, isLoading } = useGetSubjectsQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [importSubjects, { isLoading: isImporting }] = useImportSubjectsMutation();
    const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

    const subjects = subjectsData?.items || [];
    const totalSubjects = subjectsData?.totalItemCount || 0;

    const handleSortChange = (column: keyof Subject, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    // Actions
    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject);
        setIsEditModalOpen(true);
    };

    const handleView = (subject: Subject) => {
        setViewSubject(subject);
        setIsViewModalOpen(true);
    };

    const handleDelete = (subject: Subject) => {
        setSubjectToDelete(subject);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!subjectToDelete) return;
        try {
            await deleteSubject(subjectToDelete.id).unwrap();
            toast.success(`Subject "${subjectToDelete.name}" deleted successfully!`);
            setSubjectToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error('Delete failed', err);
            toast.error(err?.data?.message || 'Failed to delete subject');
        }
    };

    const handleImportClick = () => {
        setIsImportExcelModalOpen(true);
    };

    const handleConfirmImport = async (file: File) => {
        const validation = validateFileUpload(file);
        if (!validation.isValid) {
            toast.error(validation.errors.join('\n'));
            return;
        }
        toast.info('Processing import...');
        try {
            const result = await importSubjects(file).unwrap();
            setImportResult(result);
            setIsImportExcelModalOpen(false);
            setIsImportResultModalOpen(true);
            toast.success('Import completed. Please check the results.');
        } catch (err) {
            console.error('Import failed', err);
            toast.error('Import failed! Please check the file or try again later.');
        }
    };

    const columns = [
        { header: 'Code', accessor: 'code' as keyof Subject, sortable: true, filterable: true, width: '150px' },
        { header: 'Name', accessor: 'name' as keyof Subject, sortable: true, filterable: true, render: (item: Subject) => <div className="max-w-[300px] truncate" title={item.name}>{item.name}</div> },
        {
            header: 'Credits',
            accessor: 'credits' as keyof Subject,
            sortable: true,
            align: 'center' as const
        },
        {
            header: 'Terms',
            accessor: 'terms' as keyof Subject,
            sortable: true,
            align: 'center' as const
        },
        {
            header: 'Pass Mark',
            accessor: 'minAvgMarkToPass' as keyof Subject,
            sortable: true,
            align: 'center' as const
        },
        {
            header: 'Time Allocation',
            accessor: 'timeAllocation' as keyof Subject,
            sortable: true,
            render: (item: Subject) => (
                <div className="max-w-[150px] truncate" title={item.timeAllocation}>
                    {item.timeAllocation || '-'}
                </div>
            )
        },
        {
            header: 'Description',
            accessor: 'description' as keyof Subject,
            sortable: true,
            render: (item: Subject) => (
                <div className="max-w-[200px] truncate" title={item.description}>
                    {item.description || '-'}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'isActive' as keyof Subject,
            sortable: true,
            align: 'center' as const,
            render: (item: Subject) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Subject,
            align: 'center' as const,
            render: (item: Subject) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => handleView(item)}
                        title="View Details"
                    >
                        <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        title="Delete"
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
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Subject Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading subjects..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Subject Management</h1>
                <p className="text-gray-600 mt-1">Manage curriculum subjects</p>
            </div>

            <DataTable
                title={`All Subjects (${totalSubjects})`}
                data={subjects}
                columns={columns}
                onCreate={() => setIsCreateModalOpen(true)}
                createLabel="Create Subject"
                onImport={handleImportClick}
                importLabel={isImporting ? 'Importing...' : 'Import Excel'}
                selectable={true}
                manualPagination={true}
                totalItems={totalSubjects}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
            />

            <CreateSubjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditSubjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                subject={selectedSubject}
            />

            <ViewSubjectModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                subject={viewSubject}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Subject"
                message={`Are you sure you want to delete subject "${subjectToDelete?.name}"?`}
                itemName={subjectToDelete?.name}
            />

            <ImportExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onConfirm={handleConfirmImport}
                title="Import Subjects"
                description="Use template to import subjects"
                templateUrl="/templates/subject_import_template.xlsx"
            />

            <ImportResultModal
                isOpen={isImportResultModalOpen}
                onClose={() => setIsImportResultModalOpen(false)}
                result={importResult}
                entityName="subjects"
            />
        </div>
    );
}

export default AdminSubjects;
