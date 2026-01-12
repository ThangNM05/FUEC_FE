import { Edit, Trash2, Mail } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Teacher {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedDate: string;
  lastActive: string;
}

function AdminTeachers() {
  const teachers: Teacher[] = [
    {
      id: 2,
      name: 'Prof. Tran Thi B',
      email: 'tranthib@fpt.edu.vn',
      role: 'Teacher',
      status: 'Active',
      joinedDate: '2020-01-15',
      lastActive: '1 hour ago'
    },
    {
      id: 5,
      name: 'Prof. Le Van E',
      email: 'levane@fpt.edu.vn',
      role: 'Teacher',
      status: 'Active',
      joinedDate: '2021-03-20',
      lastActive: '3 hours ago'
    }
  ];

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Teacher, sortable: true, filterable: true },
    {
      header: 'Email',
      accessor: 'email' as keyof Teacher,
      sortable: true,
      filterable: true,
      render: (item: Teacher) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          {item.email}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Teacher,
      sortable: true,
      align: 'center' as const,
      render: (item: Teacher) => (
        <span className="px-3 py-1 bg-orange-100 text-[#F37022] rounded-full text-xs font-semibold">
          {item.status}
        </span>
      )
    },
    {
      header: 'Joined',
      accessor: 'joinedDate' as keyof Teacher,
      sortable: true,
      align: 'center' as const,
      render: (item: Teacher) => new Date(item.joinedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    },
    { header: 'Last Active', accessor: 'lastActive' as keyof Teacher, align: 'center' as const },
    {
      header: 'Actions',
      accessor: 'id' as keyof Teacher,
      align: 'center' as const,
      render: () => (
        <div className="flex gap-2 justify-center">
          <button className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4 text-[#F37022]" />
          </button>
          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Teacher Management</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage teachers and assignments.</p>
      </div>

      <DataTable
        title="All Teachers"
        data={teachers}
        columns={columns}
        onCreate={() => alert('Add Teacher clicked')}
        createLabel="Add Teacher"
        onImport={() => alert('Import Excel clicked')}
        selectable={true}
      />
    </div>
  );
}

export default AdminTeachers;
