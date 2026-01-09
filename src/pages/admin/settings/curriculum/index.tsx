import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Curriculum {
    id: number;
    name: string;
    code: string;
    department: string;
    version: string;
    totalCredits: number;
    status: string;
}

function AdminCurriculum() {
    const curriculum: Curriculum[] = [
        {
            id: 1,
            name: 'Software Engineering 2024',
            code: 'SE2024',
            department: 'Software Engineering',
            version: 'v2.0',
            totalCredits: 140,
            status: 'Active'
        },
        {
            id: 2,
            name: 'Computer Science 2024',
            code: 'CS2024',
            department: 'Computer Science',
            version: 'v1.5',
            totalCredits: 145,
            status: 'Active'
        },
        {
            id: 3,
            name: 'Information Systems 2023',
            code: 'IS2023',
            department: 'Information Systems',
            version: 'v1.0',
            totalCredits: 135,
            status: 'Archived'
        }
    ];

    const columns = [
        { header: 'Curriculum Name', accessor: 'name' as keyof Curriculum, sortable: true, filterable: true },
        {
            header: 'Code',
            accessor: 'code' as keyof Curriculum,
            sortable: true,
            filterable: true,
            render: (item: Curriculum) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        { header: 'Department', accessor: 'department' as keyof Curriculum, sortable: true, filterable: true },
        { header: 'Version', accessor: 'version' as keyof Curriculum, sortable: true, align: 'center' as const },
        {
            header: 'Total Credits',
            accessor: 'totalCredits' as keyof Curriculum,
            sortable: true,
            align: 'center' as const,
            render: (item: Curriculum) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.totalCredits}</span>
            )
        },
        {
            header: 'Status',
            accessor: 'status' as keyof Curriculum,
            sortable: true,
            align: 'center' as const,
            render: (item: Curriculum) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Curriculum,
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Curriculum Management</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage curriculum and program requirements.</p>
            </div>

            <DataTable
                title="All Curriculum"
                data={curriculum}
                columns={columns}
                onCreate={() => alert('Create Curriculum clicked')}
                createLabel="Create Curriculum"
                onImport={() => alert('Import Excel clicked')}
                selectable={true}
            />
        </div>
    );
}

export default AdminCurriculum;
