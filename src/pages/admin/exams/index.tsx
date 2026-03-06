import { Edit, Trash2, Clock, Calendar } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Exam {
  id: number;
  name: string;
  course: string;
  date: string;
  duration: string;
  status: string;
}

function AdminExams() {
  const exams: Exam[] = [
    {
      id: 1,
      name: 'Mid-term Exam',
      course: 'Software Engineering',
      date: '2023-10-15',
      duration: '90 mins',
      status: 'Scheduled'
    },
    {
      id: 2,
      name: 'Final Exam',
      course: 'Web Development',
      date: '2023-12-20',
      duration: '120 mins',
      status: 'Draft'
    },
    {
      id: 3,
      name: 'Quiz 1',
      course: 'Introduction to AI',
      date: '2023-09-30',
      duration: '45 mins',
      status: 'Completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      Scheduled: 'bg-blue-100 text-blue-700',
      Completed: 'bg-green-100 text-green-700',
      Draft: 'bg-orange-100 text-orange-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const columns = [
    { header: 'Exam Name', accessor: 'name' as keyof Exam, sortable: true, filterable: true },
    { header: 'Course', accessor: 'course' as keyof Exam, sortable: true, filterable: true },
    {
      header: 'Date',
      accessor: 'date' as keyof Exam,
      sortable: true,
      align: 'center' as const,
      render: (item: Exam) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          {new Date(item.date).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Duration',
      accessor: 'duration' as keyof Exam,
      align: 'center' as const,
      render: (item: Exam) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          {item.duration}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Exam,
      sortable: true,
      align: 'center' as const,
      render: (item: Exam) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Exam,
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
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Exam Management</h1>

      </div>

      <DataTable
        title="All Exams"
        data={exams}
        columns={columns}
        onCreate={() => alert('Create Exam clicked')}
        createLabel="Schedule Exam"
        onImport={() => alert('Import Excel clicked')}
        selectable={true}
      />
    </div>
  );
}

export default AdminExams;
