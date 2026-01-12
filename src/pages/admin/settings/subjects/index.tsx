import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Subject {
    id: number;
    name: string;
    code: string;
    credits: number;
    department: string;
    instructor: string;
    status: string;
}

function AdminSubjects() {
    const subjects: Subject[] = [
        {
            id: 1,
            name: 'Data Structures & Algorithms',
            code: 'DSA301',
            credits: 4,
            department: 'Computer Science',
            instructor: 'Prof. Nguyen Van A',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Object-Oriented Programming',
            code: 'OOP202',
            credits: 3,
            department: 'Software Engineering',
            instructor: 'Prof. Tran Thi B',
            status: 'Active'
        },
        {
            id: 3,
            name: 'Machine Learning',
            code: 'ML401',
            credits: 4,
            department: 'Computer Science',
            instructor: 'Prof. Le Van C',
            status: 'Active'
        }
    ];

    const columns = [
        { header: 'Subject Name', accessor: 'name' as keyof Subject, sortable: true, filterable: true },
        {
            header: 'Code',
            accessor: 'code' as keyof Subject,
            sortable: true,
            filterable: true,
            render: (item: Subject) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        {
            header: 'Credits',
            accessor: 'credits' as keyof Subject,
            sortable: true,
            align: 'center' as const,
            render: (item: Subject) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.credits}</span>
            )
        },
        { header: 'Department', accessor: 'department' as keyof Subject, sortable: true, filterable: true },
        { header: 'Instructor', accessor: 'instructor' as keyof Subject, sortable: true, filterable: true },
        {
            header: 'Status',
            accessor: 'status' as keyof Subject,
            sortable: true,
            align: 'center' as const,
            render: (item: Subject) => (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Subject,
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
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Subject Management</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage subjects, credits, and instructors.</p>
            </div>

            <DataTable
                title="All Subjects"
                data={subjects}
                columns={columns}
                onCreate={() => alert('Create Subject clicked')}
                createLabel="Create Subject"
                onImport={() => alert('Import Excel clicked')}
                selectable={true}
            />
        </div>
    );
}

export default AdminSubjects;
