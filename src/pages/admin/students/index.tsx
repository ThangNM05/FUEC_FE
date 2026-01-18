import { useState } from 'react';
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

  // RTK Query hooks
  const { data: students = [], isLoading, error } = useGetStudentsQuery();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [importStudents, { isLoading: isImporting }] = useImportStudentsMutation();

  // Handle soft delete (Deactivate student)
  const handleDelete = (item: Student) => {
    setStudentToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.id).unwrap();
      toast.success('Đã xóa/vô hiệu hóa thành công!');
      setStudentToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Vô hiệu hóa thất bại! ' + ((err as any)?.data?.message || (err as any)?.message || ''));
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  // Handle Download Template
  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/student_import_template.xlsx';
    link.download = 'Import_Student_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Đang tải xuống template...');
  };

  // Handle Excel import confirm
  const handleConfirmImport = async (file: File) => {
    // Validate file
    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      toast.error(validation.errors.join('\n'));
      return;
    }

    toast.info('Đang xử lý import...');

    try {
      const result = await importStudents(file).unwrap();
      setImportResult(result);
      setIsImportExcelModalOpen(false); // Close the entry modal
      setIsImportModalOpen(true); // Open the result modal
      toast.success('Import hoàn tất. Vui lòng kiểm tra kết quả.');
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Import thất bại! Vui lòng kiểm tra lại file hoặc thử lại sau.');
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
            <p className="mt-4 text-gray-600">Đang tải danh sách sinh viên...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('Students API Error:', error);
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Student Management</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          <p className="font-semibold">Lỗi khi tải dữ liệu sinh viên</p>
          <p className="text-sm mt-1">
            {(error as any)?.data?.message || (error as any)?.message || 'Vui lòng kiểm tra kết nối API'}
          </p>
          <details className="mt-4 text-xs bg-white p-2 rounded border border-red-100">
            <summary className="cursor-pointer font-medium mb-1">Chi tiết lỗi (Debug)</summary>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Student Management</h1>
        <p className="text-gray-600 mt-1">Quản lý danh sách sinh viên</p>
      </div>

      <DataTable
        title={`All Students (${students.length})`}
        data={students}
        columns={columns}
        onCreate={() => toast.info('Chức năng thêm sinh viên chưa được implement.')}
        createLabel="Add Student"
        onImport={handleImportClick}
        importLabel={isImporting ? 'Importing...' : 'Import Excel'}
        onDownloadTemplate={handleDownloadTemplate}
        downloadTemplateLabel="Template"
        selectable={true}
      />

      {/* Modal Import Excel (Input) */}
      <ImportExcelModal
        isOpen={isImportExcelModalOpen}
        onClose={() => setIsImportExcelModalOpen(false)}
        onConfirm={handleConfirmImport}
        title="Import Students"
        description="Vui lòng sử dụng template chuẩn để import dữ liệu sinh viên"
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
        title="Xác nhận vô hiệu hóa"
        message={`Bạn có chắc muốn vô hiệu hóa sinh viên "${studentToDelete?.studentName}"? Hành động này sẽ ẩn sinh viên khỏi danh sách hoạt động.`}
        itemName={studentToDelete?.studentName}
      />
    </div>
  );
}

export default AdminStudents;
