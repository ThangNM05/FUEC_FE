import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Select, Button } from 'antd';

import { useCreateRoomMutation } from '@/api/roomsApi';
import { Building, RoomStatus, RoomType } from '@/types/room.types';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
    const [formData, setFormData] = useState<{
        roomName: string;
        building?: string;
        type?: string;
        status?: string;
    }>({
        roomName: '',
        building: undefined,
        type: undefined,
        status: undefined
    });

    const [createRoom, { isLoading }] = useCreateRoomMutation();

    const resetForm = () => {
        setFormData({
            roomName: '',
            building: undefined,
            type: undefined,
            status: undefined
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.roomName.trim()) {
            toast.error('Room name cannot be empty');
            return;
        }

        try {
            await createRoom({
                roomName: formData.roomName.trim(),
                building: parseInt(formData.building || Building.Alpha.toString()),
                type: parseInt(formData.type || RoomType.Classroom.toString()),
                status: parseInt(formData.status || RoomStatus.Available.toString())
            }).unwrap();

            toast.success(`Room "${formData.roomName}" created successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to create room:', err);
            toast.error(err?.data?.message || 'Failed to create room. Please try again.');
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
            open={isOpen}
            onCancel={handleClose}
            title="Create New Room"
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
                    Create
                </Button>
            ]}
        >
            <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                    <span className="block text-sm font-semibold text-gray-700 mb-1">
                        Room Name <span className="text-red-500">*</span>
                    </span>
                    <Input
                        id="roomName"
                        name="roomName"
                        value={formData.roomName}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Ex: A-101"
                        size="large"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">Building</span>
                        <Select
                            id="building"
                            value={formData.building}
                            onChange={(value) => handleSelectChange('building', value)}
                            disabled={isLoading}
                            size="large"
                            placeholder="Select building"
                            options={getOptions(Building)}
                            className="w-full"
                        />
                    </div>
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">Type</span>
                        <Select
                            id="type"
                            value={formData.type}
                            onChange={(value) => handleSelectChange('type', value)}
                            disabled={isLoading}
                            size="large"
                            placeholder="Select room type"
                            options={getOptions(RoomType, true)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid gap-1">
                    <span className="block text-sm font-semibold text-gray-700 mb-1">Status</span>
                    <Select
                        id="status"
                        value={formData.status}
                        onChange={(value) => handleSelectChange('status', value)}
                        disabled={isLoading}
                        size="large"
                        placeholder="Select status"
                        options={getOptions(RoomStatus)}
                        className="w-full"
                    />
                </div>
            </div>
        </Modal>
    );
}
