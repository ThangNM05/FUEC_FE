import { useState, useEffect } from 'react';
import { Edit, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/shared/DataTable';
import ImportResultModal from '@/components/shared/ImportResultModal';
import { validateFileUpload } from '@/config/appConfig';
import {
  useGetStudentsQuery,
  useDeleteStudentMutation,
  useImportStudentsMutation,
} from '@/features/student-management/services/studentsApi';
import type { Student, ImportStudentsResponse } from '@/features/student-management/types/student.types';
import EditStudentModal from '@/features/student-management/components/EditStudentModal';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';

function AdminStudents() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Import Result Modal State
  const [importResult, setImportResult] = useState<ImportStudentsResponse | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

  // Edit Student Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // RTK Query hooks
  const { data: studentsData, isLoading, error } = useGetStudentsQuery({
    page,
    pageSize,
    sortColumn,
    sortDirection,
    searchTerm
  });
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [importStudents, { isLoading: isImporting }] = useImportStudentsMutation();

  // Extract data from PaginatedResponse
  const students = studentsData?.items || [];
  const totalStudents = studentsData?.totalItemCount || 0;

  // Handle API Error with Toast
  useEffect(() => {
    if (error) {
      console.error('Students API Error:', error);
      toast.error('Failed to fetch students');
    }
  }, [error]);

  // Handle soft delete (Deactivate student)
  const handleDelete = (item: Student) => {
    setStudentToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.id).unwrap();
      toast.success('Successfully deleted/deactivated!');
      setStudentToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to deactivate! ' + ((err as any)?.data?.message || (err as any)?.message || ''));
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  // Handle Sort Change
  const handleSortChange = (column: keyof Student, direction: 'asc' | 'desc') => {
    setSortColumn(column as string);
    setSortDirection(direction);
  };

  // Handle Search Change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
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
      const result = await importStudents(file).unwrap();
      setImportResult(result);
      setIsImportExcelModalOpen(false); // Close the entry modal
      setIsImportModalOpen(true); // Open the result modal
      toast.success('Import completed. Please check the results.');
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Import failed! Please check the file or try again later.');
    }
  };

  const handleImportClick = () => {
    setIsImportExcelModalOpen(true);
  };

  // Table columns configuration
  const columns = [
    {
      header: 'Student Code',
      accessor: 'studentCode' as keyof Student,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Name',
      accessor: 'studentName' as keyof Student,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Email',
      accessor: 'accountEmail' as keyof Student,
      sortable: true,
      filterable: true,
      render: (item: Student) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          {item.accountEmail}
        </div>
      ),
    },
    {
      header: 'Card ID',
      accessor: 'cardId' as keyof Student,
      align: 'center' as const,
      hideOnMobile: true,
      render: (item: Student) => item.cardId || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'isActive' as keyof Student,
      align: 'center' as const,
      render: (item: Student) => (
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
      header: 'Joined',
      accessor: 'createdAt' as keyof Student,
      sortable: true,
      align: 'center' as const,
      hideOnMobile: true,
      render: (item: Student) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          : 'N/A',
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Student,
      align: 'center' as const,
      render: (item: Student) => (
        <div className="flex gap-2 justify-center">
          <button
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
            onClick={() => handleEdit(item)}
            title="Edit Student"
          >
            <Edit className="w-4 h-4 text-[#F37022]" />
          </button>
          <button
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => handleDelete(item)}
            disabled={isDeleting}
            title="Deactivate Student"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Student Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F37022] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle API Error with Toast - Moved to useEffect above

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Student Management</h1>
        <p className="text-gray-600 mt-1">Manage your student list</p>
      </div>

      <DataTable
        title={`All Students (${totalStudents})`}
        data={students} // Only current page items
        columns={columns}
        onCreate={() => toast.info('Add student feature not implemented.')}
        createLabel="Add Student"
        onImport={handleImportClick}
        importLabel={isImporting ? 'Importing...' : 'Import Excel'}
        selectable={true}

        // Manual Pagination
        manualPagination={true}
        totalItems={totalStudents}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={handleSortChange as any}
        onSearchChange={handleSearchChange}
        searchTerm={searchTerm}
      />

      {/* Modal Import Excel (Input) */}
      <ImportExcelModal
        isOpen={isImportExcelModalOpen}
        onClose={() => setIsImportExcelModalOpen(false)}
        onConfirm={handleConfirmImport}
        title="Import Students"
        description="Please use the standard template to import student data"
        templateUrl="/templates/student_import_template.xlsx"
      />

      <ImportResultModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        result={importResult}
      />

      <EditStudentModal
        student={selectedStudent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deactivation"
        message={`Are you sure you want to deactivate student "${studentToDelete?.studentName}"? This action will hide the student from the active list.`}
        itemName={studentToDelete?.studentName}
      />
    </div>
  );
}

export default AdminStudents;
