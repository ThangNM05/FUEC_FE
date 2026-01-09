import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Class {
  id: number;
  name: string;
  course: string;
  students: number;
  teacher: string;
  status: string;
}

function AdminClasses() {
  const classes: Class[] = [
    {
      id: 1,
      name: 'SE18B04',
      course: 'Software Engineering',
      students: 30,
      teacher: 'Tran Thi B',
      status: 'Active'
    },
    {
      id: 2,
      name: 'SE18B05',
      course: 'Web Development',
      students: 28,
      teacher: 'Prof. Nguyen Van A',
      status: 'Active'
    }
  ];

  const columns = [
    { header: 'Class Name', accessor: 'name' as keyof Class, sortable: true, filterable: true },
    { header: 'Course', accessor: 'course' as keyof Class, sortable: true, filterable: true },
    { header: 'Students', accessor: 'students' as keyof Class, sortable: true, align: 'center' as const },
    { header: 'Teacher', accessor: 'teacher' as keyof Class, sortable: true },
    {
      header: 'Status',
      accessor: 'status' as keyof Class,
      sortable: true,
      align: 'center' as const,
      render: (item: Class) => (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          {item.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Class,
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
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Class Management</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage classes and schedules.</p>
      </div>

      <DataTable
        title="All Classes"
        data={classes}
        columns={columns}
        onCreate={() => alert('Add Class clicked')}
        createLabel="Add Class"
        onImport={() => alert('Import Excel clicked')}
        selectable={true}
      />
    </div>
  );
}

export default AdminClasses;
