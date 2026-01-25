import { useState } from 'react';
import { Edit, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ImportResultModal from '@/components/shared/ImportResultModal';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import EditTeacherModal from '@/components/modals/EditTeacherModal';
import CreateTeacherModal from '@/components/modals/CreateTeacherModal';

import { validateFileUpload } from '@/config/appConfig';
import {
  useGetTeachersQuery,
  useDeleteTeacherMutation,
  useImportTeachersMutation,
  useUpdateTeacherMutation,
} from '@/api/teachersApi';
import type { Teacher, ImportTeachersResponse } from '@/types/teacher.types.ts';

function AdminTeachers() {
  // Import Result Modal State
  const [importResult, setImportResult] = useState<ImportTeachersResponse | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Edit Teacher Modal State
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // RTK Query hooks
  const { data: teachersData, isLoading, error } = useGetTeachersQuery({
    page,
    pageSize,
    sortColumn,
    sortDirection,
    searchTerm
  });

  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
  const [importTeachers, { isLoading: isImporting }] = useImportTeachersMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  // Extract data from PaginatedResponse
  const teachers = teachersData?.items || [];
  const totalTeachers = teachersData?.totalItemCount || 0;

  // Debug log to verify data flow


  // Handle API Error with Toast
  if (error) {

  }

  // Handle Sort Change
  const handleSortChange = (column: keyof Teacher, direction: 'asc' | 'desc') => {
    setSortColumn(column as string);
    setSortDirection(direction);
  };

  // Handle Search Change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Handle soft delete / toggle status
  const handleStatusChange = (item: Teacher) => {
    setTeacherToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!teacherToDelete) return;

    try {
      await deleteTeacher(teacherToDelete.id).unwrap();
      const action = teacherToDelete.isActive ? 'deactivated' : 'activated';
      toast.success(`Successfully ${action}!`);
      setTeacherToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      const action = teacherToDelete.isActive ? 'deactivate' : 'activate';
      toast.error(`Failed to ${action}! ` + ((err as any)?.data?.message || (err as any)?.message || ''));
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
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
      const result = await importTeachers(file).unwrap();
      setImportResult(result);
      setIsImportExcelModalOpen(false); // Close the entry modal
      setIsImportModalOpen(true); // Open the result modal
      toast.success('Import completed. Please check the results.');
    } catch (err) {

      toast.error('Import failed! Please check the file or try again later.');
    }
  };

  const handleImportClick = () => {
    setIsImportExcelModalOpen(true);
  };



  // Table columns configuration
  const columns = [
    {
      header: 'Teacher Code',
      accessor: 'teacherCode' as keyof Teacher,
      sortable: true,
      filterable: true,
      className: 'w-[15%]',
    },
    {
      header: 'Name',
      accessor: 'accountFullName' as keyof Teacher,
      sortable: true,
      filterable: true,
      className: 'w-[25%]',
    },
    {
      header: 'Department',
      accessor: 'departmentCode' as keyof Teacher,
      sortable: false,
      filterable: true,
      render: (item: Teacher) => item.departmentCode || 'N/A',
      className: 'w-[20%]',
    },
    {
      header: 'Email',
      accessor: 'accountEmail' as keyof Teacher,
      sortable: true,
      filterable: true,
      className: 'w-[25%]',
      render: (item: Teacher) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          {item.accountEmail}
        </div>
      ),
    },
    {
      header: 'Card ID',
      accessor: 'cardId' as keyof Teacher,
      align: 'center' as const,
      hideOnMobile: true,
      className: 'w-[150px]',
      render: (item: Teacher) => item.cardId || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'isActive' as keyof Teacher,
      align: 'center' as const,
      className: 'w-[100px]',
      render: (item: Teacher) => (
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
      accessor: 'id' as keyof Teacher,
      align: 'center' as const,
      className: 'w-[100px]',
      render: (item: Teacher) => (
        <div className="flex gap-2 justify-center">
          <button
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
            onClick={() => handleEdit(item)}
            title="Edit Teacher"
          >
            <Edit className="w-4 h-4 text-[#F37022]" />
          </button>

          {item.isActive ? (
            <button
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              onClick={() => handleStatusChange(item)}
              disabled={isDeleting}
              title="Deactivate Teacher"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          ) : (
            <button
              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
              onClick={() => handleStatusChange(item)}
              disabled={isDeleting}
              title="Activate Teacher"
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

  // Loading state
  if (isLoading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Teacher Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Spin indicator={antIcon} tip="Loading teachers..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Teacher Management</h1>
        <p className="text-gray-600 mt-1">Manage your teacher list</p>
      </div>

      <DataTable
        title={`All Teachers (${totalTeachers})`}
        data={teachers}
        columns={columns}
        onCreate={() => setIsCreateModalOpen(true)}
        createLabel="Add Teacher"
        onImport={handleImportClick}
        importLabel={isImporting ? 'Importing...' : 'Import Excel'}
        selectable={true}

        // Manual Pagination
        manualPagination={true}
        totalItems={totalTeachers}
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
        title="Import Teachers"
        description="Please use the standard template to import teacher data"
        templateUrl="/templates/teacher_import_template.xlsx"
      />

      <ImportResultModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        result={importResult} // Use cast or ensures compatible structure
        entityName="teachers"
      />

      <EditTeacherModal
        teacher={selectedTeacher}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmStatusChange}
        title={teacherToDelete?.isActive ? "Confirm Deactivation" : "Confirm Activation"}
        message={`Are you sure you want to ${teacherToDelete?.isActive ? 'deactivate' : 'activate'} teacher "${teacherToDelete?.accountFullName}"?`}
        itemName={teacherToDelete?.accountFullName}
        confirmButtonLabel={teacherToDelete?.isActive ? "Deactivate" : "Activate"}
        confirmButtonVariant={teacherToDelete?.isActive ? "danger" : "success"}
      />

      <CreateTeacherModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default AdminTeachers;
