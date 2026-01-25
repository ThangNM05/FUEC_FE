import { useState, useEffect } from 'react';
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

import { useUpdateRoomMutation } from '@/api/roomsApi';
import { Building, RoomStatus, RoomType, type Room } from '@/types/room.types';

interface EditRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room | null;
}

export default function EditRoomModal({ isOpen, onClose, room }: EditRoomModalProps) {
    const [formData, setFormData] = useState({
        roomName: '',
        building: Building.Alpha.toString(),
        type: RoomType.Classroom.toString(),
        status: RoomStatus.Available.toString()
    });

    const [updateRoom, { isLoading }] = useUpdateRoomMutation();

    useEffect(() => {
        if (room) {
            setFormData({
                roomName: room.roomName,
                building: room.building.toString(),
                type: room.type.toString(),
                status: room.status.toString()
            });
        }
    }, [room]);

    const handleClose = () => {
        onClose();
        // Optional: Reset form to room values or keep as is until next open?
        // Usually better to sync with room on open or useEffect change
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!room) return;

        if (!formData.roomName.trim()) {
            toast.error('Room name cannot be empty');
            return;
        }

        try {
            await updateRoom({
                id: room.id,
                roomName: formData.roomName.trim(),
                building: parseInt(formData.building),
                type: parseInt(formData.type),
                status: parseInt(formData.status)
            }).unwrap();

            toast.success(`Room updated successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to update room:', err);
            toast.error(err?.data?.message || 'Failed to update room. Please try again.');
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
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>
                        Update details for {room?.roomName}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-roomName">
                            Room Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-roomName"
                            name="roomName"
                            value={formData.roomName}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-building">Building</Label>
                            <select
                                id="edit-building"
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
                            <Label htmlFor="edit-type">Type</Label>
                            <select
                                id="edit-type"
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
                        <Label htmlFor="edit-status">Status</Label>
                        <select
                            id="edit-status"
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
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
