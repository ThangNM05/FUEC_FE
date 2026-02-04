import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ImportResultModal from '@/components/shared/ImportResultModal';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { validateFileUpload } from '@/config/appConfig';

import {
    useGetRoomsQuery,
    useImportRoomsMutation,
    useDeleteRoomMutation
} from '@/api/roomsApi';
import type { ImportRoomsResponse, Room } from '@/types/room.types';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import EditRoomModal from '@/components/modals/EditRoomModal';

// Helper maps for Enums
const BUILDING_MAP: Record<number, string> = {
    0: 'Alpha',
    1: 'Beta',
    2: 'Gamma'
};

const ROOM_TYPE_MAP: Record<number, string> = {
    0: 'Classroom',
    1: 'Lecture Hall',
    2: 'Computer Lab',
    3: 'Laboratory',
    4: 'Meeting Room'
};

const ROOM_STATUS_MAP: Record<number, string> = {
    0: 'Available',
    1: 'In Use',
    2: 'Maintenance',
    3: 'Closed'
};

function AdminClassrooms() {
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

    // Import Result State
    const [importResult, setImportResult] = useState<ImportRoomsResponse | null>(null);
    const [isImportResultModalOpen, setIsImportResultModalOpen] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // API Query & Mutations
    const { data: roomsData, isLoading } = useGetRoomsQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [importRooms, { isLoading: isImporting }] = useImportRoomsMutation();
    const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

    const rooms = roomsData?.items || [];
    const totalRooms = roomsData?.totalItemCount || 0;

    const handleSortChange = (column: keyof Room, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    // Edit/Delete Handlers
    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setIsEditModalOpen(true);
    };

    const handleDelete = (room: Room) => {
        setRoomToDelete(room);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!roomToDelete) return;

        try {
            await deleteRoom(roomToDelete.id).unwrap();
            toast.success(`Room "${roomToDelete.roomName}" deleted successfully!`);
            setRoomToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            console.error('Delete failed', err);
            toast.error(err?.data?.message || 'Failed to delete room.');
        }
    };

    // Import Handlers
    const handleImportClick = () => {
        setIsImportExcelModalOpen(true);
    };

    const handleConfirmImport = async (file: File) => {
        const validation = validateFileUpload(file);
        if (!validation.isValid) {
            toast.error(validation.errors.join('\n'));
            return;
        }

        toast.info('Processing import...');

        try {
            const result = await importRooms(file).unwrap();
            setImportResult(result);
            setIsImportExcelModalOpen(false);
            setIsImportResultModalOpen(true);
            toast.success('Import completed. Please check the results.');
        } catch (err) {
            console.error('Import failed', err);
            toast.error('Import failed! Please check the file or try again later.');
        }
    };

    const columns = [
        {
            header: 'Room Name',
            accessor: 'roomName' as keyof Room, // Changed from 'name' to 'roomName'
            sortable: true,
            filterable: true
        },
        {
            header: 'Building',
            accessor: 'building' as keyof Room,
            sortable: true,
            render: (item: Room) => (
                <span>{BUILDING_MAP[item.building] || `Building ${item.building}`}</span>
            )
        },
        {
            header: 'Type',
            accessor: 'type' as keyof Room,
            sortable: true,
            align: 'center' as const,
            render: (item: Room) => (
                <span>{ROOM_TYPE_MAP[item.type] || `Type ${item.type}`}</span>
            )
        },
        {
            header: 'Status',
            accessor: 'status' as keyof Room,
            sortable: true,
            align: 'center' as const,
            render: (item: Room) => {
                const statusText = ROOM_STATUS_MAP[item.status] || 'Unknown';
                const colorClass = item.status === 0
                    ? 'bg-green-100 text-green-700'
                    : item.status === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Room,
            align: 'center' as const,
            render: (item: Room) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(item)}
                        title="Edit Room"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        title="Delete Room"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Classroom Management</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Spin indicator={antIcon} tip="Loading classrooms..." />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Classroom Management</h1>
                <p className="text-gray-600 mt-1">Manage all classrooms</p>
            </div>

            <DataTable
                title={`All Classrooms (${totalRooms})`}
                data={rooms}
                columns={columns}
                onCreate={() => setIsCreateModalOpen(true)}
                createLabel="Create Classroom"
                onImport={handleImportClick}
                importLabel={isImporting ? 'Importing...' : 'Import Excel'}
                selectable={true}
                manualPagination={true}
                totalItems={totalRooms}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
            />

            {/* Modals */}
            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditRoomModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                room={selectedRoom}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Room"
                message={`Are you sure you want to delete room "${roomToDelete?.roomName}"? This action cannot be undone.`}
                itemName={roomToDelete?.roomName}
            />

            <ImportExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onConfirm={handleConfirmImport}
                title="Import Rooms"
                description="Please use the standard template to import room data"
                templateUrl="/templates/room_import_template.xlsx"
            />

            <ImportResultModal
                isOpen={isImportResultModalOpen}
                onClose={() => setIsImportResultModalOpen(false)}
                result={importResult}
                entityName="rooms"
            />
        </div>
    );
}

export default AdminClassrooms;
