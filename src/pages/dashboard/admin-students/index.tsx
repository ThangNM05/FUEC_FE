import { Edit, Trash2, Mail } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Student {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedDate: string;
  lastActive: string;
}

function AdminStudents() {
  const students: Student[] = [
    {
      id: 1,
      name: 'Nguyen Van A',
      email: 'nguyenvana@fpt.edu.vn',
      role: 'Student',
      status: 'Active',
      joinedDate: '2023-09-01',
      lastActive: '2 hours ago'
    },
    {
      id: 3,
      name: 'Le Van C',
      email: 'levanc@fpt.edu.vn',
      role: 'Student',
      status: 'Active',
      joinedDate: '2023-09-01',
      lastActive: '5 hours ago'
    }
  ];

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Student, sortable: true, filterable: true },
    {
      header: 'Email',
      accessor: 'email' as keyof Student,
      sortable: true,
      filterable: true,
      render: (item: Student) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          {item.email}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Student,
      sortable: true,
      align: 'center' as const,
      render: (item: Student) => (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          {item.status}
        </span>
      )
    },
    {
      header: 'Joined',
      accessor: 'joinedDate' as keyof Student,
      sortable: true,
      align: 'center' as const,
      render: (item: Student) => new Date(item.joinedDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    },
    { header: 'Last Active', accessor: 'lastActive' as keyof Student, align: 'center' as const },
    {
      header: 'Actions',
      accessor: 'id' as keyof Student,
      align: 'center' as const,
      render: () => (
        <div className="flex gap-2 justify-center">
          <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-2">Manage students.</p>
      </div>

      <DataTable
        title="All Students"
        data={students}
        columns={columns}
        onCreate={() => alert('Add Student clicked')}
        createLabel="Add Student"
        onImport={() => alert('Import Excel clicked')}
        selectable={true}
      />
    </div>
  );
}

export default AdminStudents;
