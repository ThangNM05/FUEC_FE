import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Semester {
    id: number;
    name: string;
    code: string;
    year: string;
    startDate: string;
    endDate: string;
    status: string;
}

function AdminSemesters() {
    const semesters: Semester[] = [
        {
            id: 1,
            name: 'Fall 2024',
            code: 'FA24',
            year: '2024',
            startDate: '2024-09-01',
            endDate: '2024-12-31',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Spring 2025',
            code: 'SP25',
            year: '2025',
            startDate: '2025-01-15',
            endDate: '2025-05-15',
            status: 'Upcoming'
        },
        {
            id: 3,
            name: 'Summer 2024',
            code: 'SU24',
            year: '2024',
            startDate: '2024-06-01',
            endDate: '2024-08-31',
            status: 'Completed'
        }
    ];

    const columns = [
        { header: 'Semester Name', accessor: 'name' as keyof Semester, sortable: true, filterable: true },
        {
            header: 'Code',
            accessor: 'code' as keyof Semester,
            sortable: true,
            filterable: true,
            render: (item: Semester) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        { header: 'Year', accessor: 'year' as keyof Semester, sortable: true, align: 'center' as const },
        { header: 'Start Date', accessor: 'startDate' as keyof Semester, sortable: true, align: 'center' as const },
        { header: 'End Date', accessor: 'endDate' as keyof Semester, sortable: true, align: 'center' as const },
        {
            header: 'Status',
            accessor: 'status' as keyof Semester,
            sortable: true,
            align: 'center' as const,
            render: (item: Semester) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Active' ? 'bg-green-100 text-green-700' :
                    item.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Semester,
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
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Semester Management</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage semesters and academic periods.</p>
            </div>

            <DataTable
                title="All Semesters"
                data={semesters}
                columns={columns}
                onCreate={() => alert('Create Semester clicked')}
                createLabel="Create Semester"
                onImport={() => alert('Import Excel clicked')}
                selectable={true}
            />
        </div>
    );
}

export default AdminSemesters;
