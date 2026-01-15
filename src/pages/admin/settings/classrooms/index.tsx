import { Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Classroom {
    id: number;
    name: string;
    code: string;
    building: string;
    capacity: number;
    type: string;
    status: string;
}

function AdminClassrooms() {
    const classrooms: Classroom[] = [
        {
            id: 1,
            name: 'Room A101',
            code: 'A101',
            building: 'Building A',
            capacity: 50,
            type: 'Lecture Hall',
            status: 'Available'
        },
        {
            id: 2,
            name: 'Lab B203',
            code: 'B203',
            building: 'Building B',
            capacity: 30,
            type: 'Computer Lab',
            status: 'In Use'
        },
        {
            id: 3,
            name: 'Room C305',
            code: 'C305',
            building: 'Building C',
            capacity: 40,
            type: 'Classroom',
            status: 'Available'
        }
    ];

    const columns = [
        { header: 'Classroom Name', accessor: 'name' as keyof Classroom, sortable: true, filterable: true },
        {
            header: 'Code',
            accessor: 'code' as keyof Classroom,
            sortable: true,
            filterable: true,
            render: (item: Classroom) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#cefafe', color: '#0e7490' }}>
                    {item.code}
                </span>
            )
        },
        { header: 'Building', accessor: 'building' as keyof Classroom, sortable: true, filterable: true },
        {
            header: 'Capacity',
            accessor: 'capacity' as keyof Classroom,
            sortable: true,
            align: 'center' as const,
            render: (item: Classroom) => (
                <span className="font-semibold" style={{ color: '#0A1B3C' }}>{item.capacity}</span>
            )
        },
        { header: 'Type', accessor: 'type' as keyof Classroom, sortable: true, align: 'center' as const },
        {
            header: 'Status',
            accessor: 'status' as keyof Classroom,
            sortable: true,
            align: 'center' as const,
            render: (item: Classroom) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Classroom,
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
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Classroom Management</h1>

            </div>

            <DataTable
                title="All Classrooms"
                data={classrooms}
                columns={columns}
                onCreate={() => alert('Create Classroom clicked')}
                createLabel="Create Classroom"
                onImport={() => alert('Import Excel clicked')}
                selectable={true}
            />
        </div>
    );
}

export default AdminClassrooms;
