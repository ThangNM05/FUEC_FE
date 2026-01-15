import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface ExamType {
    id: number;
    name: string;
    code: string;
    duration: number;
    weight: number;
    description: string;
    status: string;
}

function AdminExamTypes() {
    const examTypes: ExamType[] = [
        {
            id: 1,
            name: 'Midterm Exam',
            code: 'MIDTERM',
            duration: 90,
            weight: 30,
            description: 'Mid-semester examination',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Final Exam',
            code: 'FINAL',
            duration: 120,
            weight: 40,
            description: 'End-of-semester examination',
            status: 'Active'
        },
        {
            id: 3,
            name: 'Quiz',
            code: 'QUIZ',
            duration: 30,
            weight: 10,
            description: 'Short assessment quiz',
            status: 'Active'
        },
        {
            id: 4,
            name: 'Practical Exam',
            code: 'PRACTICAL',
            duration: 90,
            weight: 20,
            description: 'Hands-on practical examination',
            status: 'Active'
        }
    ];

    const columns = [
        { header: 'Exam Type', accessor: 'name' as keyof ExamType, sortable: true, filterable: true },
        {
            header: 'Code',
            accessor: 'code' as keyof ExamType,
            sortable: true,
            filterable: true,
            render: (item: ExamType) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        {
            header: 'Duration (min)',
            accessor: 'duration' as keyof ExamType,
            sortable: true,
            align: 'center' as const,
            render: (item: ExamType) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.duration}</span>
            )
        },
        {
            header: 'Weight (%)',
            accessor: 'weight' as keyof ExamType,
            sortable: true,
            align: 'center' as const,
            render: (item: ExamType) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.weight}%</span>
            )
        },
        { header: 'Description', accessor: 'description' as keyof ExamType, sortable: false },
        {
            header: 'Status',
            accessor: 'status' as keyof ExamType,
            sortable: true,
            align: 'center' as const,
            render: (item: ExamType) => (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof ExamType,
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
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Exam Type Management</h1>

            </div>

            <DataTable
                title="All Exam Types"
                data={examTypes}
                columns={columns}
                onCreate={() => alert('Create Exam Type clicked')}
                createLabel="Create Exam Type"
                onImport={() => alert('Import Excel clicked')}
                selectable={true}
            />
        </div>
    );
}

export default AdminExamTypes;
