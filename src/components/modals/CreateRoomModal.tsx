import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCreateRoomMutation } from '@/api/roomsApi';
import { Building, RoomStatus, RoomType } from '@/types/room.types';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
    const [formData, setFormData] = useState({
        roomName: '',
        building: Building.Alpha.toString(),
        type: RoomType.Classroom.toString(),
        status: RoomStatus.Available.toString()
    });

    const [createRoom, { isLoading }] = useCreateRoomMutation();

    const resetForm = () => {
        setFormData({
            roomName: '',
            building: Building.Alpha.toString(),
            type: RoomType.Classroom.toString(),
            status: RoomStatus.Available.toString()
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.roomName.trim()) {
            toast.error('Room name cannot be empty');
            return;
        }

        try {
            await createRoom({
                roomName: formData.roomName.trim(),
                building: parseInt(formData.building),
                type: parseInt(formData.type),
                status: parseInt(formData.status)
            }).unwrap();

            toast.success(`Room "${formData.roomName}" created successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to create room:', err);
            toast.error(err?.data?.message || 'Failed to create room. Please try again.');
        }
    };

    // Helper to generate options from Enum/Const Objects
    const getOptions = (obj: any) => {
        return Object.entries(obj).map(([key, value]) => ({
            label: key,
            value: value as string | number
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                    <DialogDescription>
                        Enter room details to create a new classroom.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="roomName">
                            Room Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="roomName"
                            name="roomName"
                            value={formData.roomName}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: A-101"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="building">Building</Label>
                            <select
                                id="building"
                                name="building"
                                value={formData.building}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {getOptions(Building).map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {getOptions(RoomType).map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label.replace(/([A-Z])/g, ' $1').trim()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {getOptions(RoomStatus).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#F37022] hover:bg-[#d95f19] text-white font-medium">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
