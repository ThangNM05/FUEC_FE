import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Course {
  id: number;
  name: string;
  code: string;
  instructor: string;
  students: number;
  sections: number;
  semester: string;
  status: string;
}

function AdminCourses() {
  const courses: Course[] = [
    {
      id: 1,
      name: 'Software Engineering',
      code: 'SWE101',
      instructor: 'Prof. Nguyen Van A',
      students: 145,
      sections: 3,
      semester: 'Fall 2024',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Database Systems',
      code: 'DBS202',
      instructor: 'Prof. Tran Thi B',
      students: 128,
      sections: 3,
      semester: 'Fall 2024',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Web Development',
      code: 'WEB301',
      instructor: 'Prof. Le Van C',
      students: 112,
      sections: 2,
      semester: 'Fall 2024',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Mobile App Development',
      code: 'MAD401',
      instructor: 'Prof. Pham Thi D',
      students: 95,
      sections: 2,
      semester: 'Fall 2024',
      status: 'Active'
    }
  ];

  const columns = [
    { header: 'Course Name', accessor: 'name' as keyof Course, sortable: true, filterable: true },
    {
      header: 'Code',
      accessor: 'code' as keyof Course,
      sortable: true,
      filterable: true,
      render: (item: Course) => (
        <span className="px-3 py-1 bg-orange-100 text-[#F37022] rounded-full text-xs font-semibold">
          {item.code}
        </span>
      )
    },
    { header: 'Instructor', accessor: 'instructor' as keyof Course, sortable: true, filterable: true },
    {
      header: 'Students',
      accessor: 'students' as keyof Course,
      sortable: true,
      align: 'center' as const,
      render: (item: Course) => (
        <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.students}</span>
      )
    },
    { header: 'Sections', accessor: 'sections' as keyof Course, sortable: true, align: 'center' as const },
    { header: 'Semester', accessor: 'semester' as keyof Course, sortable: true, align: 'center' as const },
    {
      header: 'Status',
      accessor: 'status' as keyof Course,
      sortable: true,
      align: 'center' as const,
      render: (item: Course) => (
        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold">
          {item.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Course,
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
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Course Management</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage courses, instructors, and enrollments.</p>
      </div>

      <DataTable
        title="All Courses"
        data={courses}
        columns={columns}
        onCreate={() => alert('Create Course clicked')}
        createLabel="Create Course"
        onImport={() => alert('Import Excel clicked')}
        selectable={true}
      />
    </div>
  );
}

export default AdminCourses;
