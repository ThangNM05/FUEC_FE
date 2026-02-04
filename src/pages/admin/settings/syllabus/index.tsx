import { useState } from 'react';
import { Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'; // Added icons for status
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ImportResultModal from '@/components/shared/ImportResultModal';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import EditSyllabusModal from '@/components/modals/EditSyllabusModal';
import CreateSyllabusModal from '@/components/modals/CreateSyllabusModal';
import type { ImportSyllabusesResponse, Syllabus } from '@/types/syllabus.types';
import { useDeleteSyllabusMutation, useGetSyllabusesQuery, useImportSyllabusesMutation } from '@/api/syllabusApi';
import { validateFileUpload } from '@/config/appConfig';


function AdminSyllabuses() {
    // Import Result Modal State
    const [importResult, setImportResult] = useState<ImportSyllabusesResponse | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Modals State
    const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [syllabusToDelete, setSyllabusToDelete] = useState<Syllabus | null>(null);

    // RTK Query hooks
    const { data: syllabusesData, isLoading, error } = useGetSyllabusesQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [deleteSyllabus, { isLoading: isDeleting }] = useDeleteSyllabusMutation();
    const [importSyllabuses, { isLoading: isImporting }] = useImportSyllabusesMutation();

    // Extract data from PaginatedResponse
    const syllabuses = syllabusesData?.items || [];
    const totalSyllabuses = syllabusesData?.totalItemCount || 0;

    // Handle API Error with Toast
    if (error) {
        console.error('Error fetching syllabuses:', error);
        toast.error('Failed to load syllabuses data. Please check connection.');
    }

    // Handle Sort Change
    const handleSortChange = (column: keyof Syllabus, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    // Handle Search Change
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    // Handle soft delete / toggle status
    const handleStatusChange = (item: Syllabus) => {
        setSyllabusToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmStatusChange = async () => {
        if (!syllabusToDelete) return;

        try {
            await deleteSyllabus(syllabusToDelete.id).unwrap();
            const action = syllabusToDelete.isActive ? 'deactivated' : 'activated';
            toast.success(`Successfully ${action}!`);
            setSyllabusToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {
            const action = syllabusToDelete.isActive ? 'deactivate' : 'activate';
            toast.error(`Failed to ${action}! ` + ((err as any)?.data?.message || (err as any)?.message || ''));
        }
    };

    const handleEdit = (syllabus: Syllabus) => {
        setSelectedSyllabus(syllabus);
        setIsEditModalOpen(true);
    };

    // Handle Excel import confirm
    const handleConfirmImport = async (file: File) => {
        // Validate file
        const validation = validateFileUpload(file);
        if (!validation.isValid) {
            toast.error(validation.errors.join('\n'));
            return;
        }

        toast.info('Processing import...');

        try {
            const result = await importSyllabuses(file).unwrap();
            setImportResult(result);
            setIsImportExcelModalOpen(false);
            setIsImportModalOpen(true);
            toast.success('Import completed. Please check the results.');
        } catch (err) {
            toast.error('Import failed! Please check the file or try again later.');
        }
    };

    // Table columns configuration
    const columns = [
        {
            header: 'Subject Code',
            accessor: 'subjectCode' as keyof Syllabus,
            sortable: true,
            filterable: true,
            className: 'w-[15%]',
            render: (item: Syllabus) => item.subjectCode || 'N/A',
        },
        {
            header: 'Syllabus Name',
            accessor: 'syllabusName' as keyof Syllabus,
            sortable: true,
            filterable: true,
            className: 'w-[25%]',
        },
        {
            header: 'English Name',
            accessor: 'syllabusEnglish' as keyof Syllabus,
            sortable: true,
            filterable: true,
            className: 'w-[20%]',
            hideOnMobile: true,
        },
        {
            header: 'Scale',
            accessor: 'scoringScale' as keyof Syllabus,
            align: 'center' as const,
            className: 'w-[100px]',
            render: (item: Syllabus) => item.scoringScale?.toString() || '10',
        },
        {
            header: 'Approved',
            accessor: 'isApproved' as keyof Syllabus,
            align: 'center' as const,
            className: 'w-[100px]',
            render: (item: Syllabus) => (
                item.isApproved ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
            )
        },
        {
            header: 'Status',
            accessor: 'isActive' as keyof Syllabus,
            align: 'center' as const,
            className: 'w-[100px]',
            render: (item: Syllabus) => (
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
            accessor: 'id' as keyof Syllabus,
            align: 'center' as const,
            className: 'w-[100px]',
            render: (item: Syllabus) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(item)}
                        title="Edit Syllabus"
                    >
                        <Edit className="w-4 h-4 text-[#F37022]" />
                    </button>

                    {item.isActive ? (
                        <button
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleStatusChange(item)}
                            disabled={isDeleting}
                            title="Deactivate Syllabus"
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                    ) : (
                        <button
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => handleStatusChange(item)}
                            disabled={isDeleting}
                            title="Activate Syllabus"
                        >
                            <div className="w-4 h-4 text-green-600 font-bold flex items-center justify-center">
                                ↺
                            </div>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    if (isLoading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Syllabus Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading syllabuses..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Syllabus Management</h1>
                <p className="text-gray-600 mt-1">Manage your syllabus list</p>
            </div>

            <DataTable
                title={`All Syllabuses (${totalSyllabuses})`}
                data={syllabuses}
                columns={columns}
                onCreate={() => setIsCreateModalOpen(true)}
                createLabel="Add Syllabus"
                onImport={() => setIsImportExcelModalOpen(true)}
                importLabel={isImporting ? 'Importing...' : 'Import Excel'}
                selectable={true}

                // Manual Pagination
                manualPagination={true}
                totalItems={totalSyllabuses}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
            />

            <ImportExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onConfirm={handleConfirmImport}
                title="Import Syllabuses"
                description="Please use the standard template to import syllabus data"
                templateUrl="/templates/syllabus_import_template.xlsx"
            />

            <ImportResultModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                result={importResult}
                entityName="syllabuses"
            />

            <CreateSyllabusModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditSyllabusModal
                syllabus={selectedSyllabus}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmStatusChange}
                title={syllabusToDelete?.isActive ? "Confirm Deactivation" : "Confirm Activation"}
                message={`Are you sure you want to ${syllabusToDelete?.isActive ? 'deactivate' : 'activate'} syllabus "${syllabusToDelete?.syllabusName}"?`}
                itemName={syllabusToDelete?.syllabusName}
            />
        </div>
    );
}

export default AdminSyllabuses;
