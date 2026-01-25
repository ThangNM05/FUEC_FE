import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select } from 'antd';

import { useUpdateRoomMutation } from '@/api/roomsApi';
import {
    Building,
    RoomStatus,
    RoomType,
    type Room,
    type BuildingType,
    type RoomStatusType,
    type RoomTypeType
} from '@/types/room.types';

interface EditRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room | null;
}

export default function EditRoomModal({ isOpen, onClose, room }: EditRoomModalProps) {
    const [formData, setFormData] = useState<{
        roomName: string;
        building: BuildingType;
        type: RoomTypeType;
        status: RoomStatusType;
    }>({
        roomName: '',
        building: Building.Alpha,
        type: RoomType.Classroom,
        status: RoomStatus.Available
    });

    const [updateRoom, { isLoading }] = useUpdateRoomMutation();

    useEffect(() => {
        if (room) {
            setFormData({
                roomName: room.roomName,
                building: room.building as BuildingType,
                type: room.type as RoomTypeType,
                status: room.status as RoomStatusType
            });
        }
    }, [room, isOpen]);

    const handleClose = () => {
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, roomName: value }));
    };

    const handleSelectChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!room) return;

        if (!formData.roomName.trim()) {
            toast.error('Room name cannot be empty');
            return;
        }

        try {
            await updateRoom({
                id: room.id,
                roomName: formData.roomName.trim(),
                building: formData.building,
                type: formData.type,
                status: formData.status
            }).unwrap();

            toast.success(`Room updated successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to update room:', err);
            toast.error(err?.data?.message || 'Failed to update room. Please try again.');
        }
    };

    // Helper to generate options from Enum/Const Objects
    const getOptions = (obj: any, snakeCase?: boolean) => {
        return Object.entries(obj)
            .filter(([key]) => isNaN(Number(key))) // Filter out numeric keys from TS enums
            .map(([key, value]) => ({
                label: snakeCase ? key.replace(/([A-Z])/g, ' $1').trim() : key,
                value: value as string | number
            }));
    };

    return (
        <Modal
            title="Edit Room"
            open={isOpen}
            onCancel={handleClose}
            width={800}
            footer={[
                <Button key="cancel" onClick={handleClose} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none"
                >
                    Save Changes
                </Button>
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                    <span className="block text-sm font-semibold text-gray-700 mb-1">
                        Room Name <span className="text-red-500">*</span>
                    </span>
                    <Input
                        id="edit-roomName"
                        value={formData.roomName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        size="large"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">Building</span>
                        <Select
                            id="edit-building"
                            value={formData.building}
                            onChange={(val) => handleSelectChange('building', val)}
                            disabled={isLoading}
                            size="large"
                            className="w-full"
                            options={getOptions(Building)}
                        />
                    </div>
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">Type</span>
                        <Select
                            id="edit-type"
                            value={formData.type}
                            onChange={(val) => handleSelectChange('type', val)}
                            disabled={isLoading}
                            size="large"
                            className="w-full"
                            options={getOptions(RoomType, true)}
                        />
                    </div>
                </div>

                <div className="grid gap-1">
                    <span className="block text-sm font-semibold text-gray-700 mb-1">Status</span>
                    <Select
                        id="edit-status"
                        value={formData.status}
                        onChange={(val) => handleSelectChange('status', val)}
                        disabled={isLoading}
                        size="large"
                        className="w-full"
                        options={getOptions(RoomStatus)}
                    />
                </div>
            </div>
        </Modal>
    );
}
