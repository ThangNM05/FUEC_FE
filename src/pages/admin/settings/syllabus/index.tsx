import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Syllabus {
    id: number;
    subject: string;
    code: string;
    instructor: string;
    semester: string;
    version: string;
    lastUpdated: string;
    status: string;
}

function AdminSyllabus() {
    const syllabi: Syllabus[] = [
        {
            id: 1,
            subject: 'Data Structures & Algorithms',
            code: 'DSA301',
            instructor: 'Prof. Nguyen Van A',
            semester: 'Fall 2024',
            version: 'v2.1',
            lastUpdated: '2024-08-15',
            status: 'Approved'
        },
        {
            id: 2,
            subject: 'Object-Oriented Programming',
            code: 'OOP202',
            instructor: 'Prof. Tran Thi B',
            semester: 'Fall 2024',
            version: 'v1.8',
            lastUpdated: '2024-08-20',
            status: 'Approved'
        },
        {
            id: 3,
            subject: 'Machine Learning',
            code: 'ML401',
            instructor: 'Prof. Le Van C',
            semester: 'Spring 2025',
            version: 'v1.0',
            lastUpdated: '2024-12-10',
            status: 'Draft'
        }
    ];

    const columns = [
        { header: 'Subject', accessor: 'subject' as keyof Syllabus, sortable: true, filterable: true },
        {
            header: 'Code',
            accessor: 'code' as keyof Syllabus,
            sortable: true,
            filterable: true,
            render: (item: Syllabus) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        { header: 'Instructor', accessor: 'instructor' as keyof Syllabus, sortable: true, filterable: true },
        { header: 'Semester', accessor: 'semester' as keyof Syllabus, sortable: true, align: 'center' as const },
        { header: 'Version', accessor: 'version' as keyof Syllabus, sortable: true, align: 'center' as const },
        { header: 'Last Updated', accessor: 'lastUpdated' as keyof Syllabus, sortable: true, align: 'center' as const },
        {
            header: 'Status',
            accessor: 'status' as keyof Syllabus,
            sortable: true,
            align: 'center' as const,
            render: (item: Syllabus) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Approved'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Syllabus,
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
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Syllabus Management</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage course syllabi and learning outcomes.</p>
            </div>

            <DataTable
                title="All Syllabi"
                data={syllabi}
                columns={columns}
                onCreate={() => alert('Create Syllabus clicked')}
                createLabel="Create Syllabus"
                onImport={() => alert('Import Excel clicked')}
                selectable={true}
            />
        </div>
    );
}

export default AdminSyllabus;
