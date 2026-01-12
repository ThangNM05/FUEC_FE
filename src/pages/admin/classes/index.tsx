import { useState } from 'react';
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
  const [semester, setSemester] = useState('SPRING2025');

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
        <span className="px-3 py-1 bg-orange-100 text-[#F37022] rounded-full text-xs font-semibold">
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
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Class Management</h1>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
          >
            <option value="SPRING2025">Spring 2025</option>
            <option value="FALL2024">Fall 2024</option>
            <option value="SUMMER2024">Summer 2024</option>
          </select>
        </div>
        <p className="text-sm md:text-base text-gray-600">Manage classes and schedules.</p>
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
