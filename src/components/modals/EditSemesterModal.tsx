import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateSemesterMutation } from '@/api/semestersApi';
import type { Semester, UpdateSemesterRequest } from '@/types/semester.types';

interface EditSemesterModalProps {
    semester: Semester | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditSemesterModal({ semester, isOpen, onClose }: EditSemesterModalProps) {
    const [formData, setFormData] = useState<UpdateSemesterRequest>({
        id: '',
        semesterCode: '',
        startDate: '',
        endDate: '',
        isDefault: false,
        isActive: true,
    });

    const [updateSemester, { isLoading }] = useUpdateSemesterMutation();

    useEffect(() => {
        if (semester) {
            setFormData({
                id: semester.id,
                semesterCode: semester.semesterCode,
                startDate: semester.startDate,
                endDate: semester.endDate,
                isDefault: semester.isDefault,
                isActive: semester.isActive,
            });
        }
    }, [semester]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setFormData((prev) => ({ ...prev, isDefault: checked }));
    };

    const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setFormData((prev) => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!semester) return;

        if (!formData.semesterCode || !formData.startDate || !formData.endDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await updateSemester(formData).unwrap();
            toast.success('Semester updated successfully');
            onClose();
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.message || 'Failed to update semester';
            toast.error(errorMessage);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Semester</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-semesterCode" className="text-right">
                            Code
                        </Label>
                        <Input
                            id="edit-semesterCode"
                            name="semesterCode"
                            value={formData.semesterCode}
                            onChange={handleChange}
                            className="col-span-3"
                            placeholder="e.g. FALL26"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-startDate" className="text-right">
                            Start Date
                        </Label>
                        <Input
                            id="edit-startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-endDate" className="text-right">
                            End Date
                        </Label>
                        <Input
                            id="edit-endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-isDefault" className="text-right">
                            Default
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isDefault"
                                checked={formData.isDefault}
                                onChange={handleCheckboxChange}
                                disabled={isLoading}
                                className="h-4 w-4 rounded border-gray-300 text-[#F37022] focus:ring-[#F37022]"
                            />
                            <label
                                htmlFor="edit-isDefault"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Set as default semester
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-isActive" className="text-right">
                            Active
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isActive"
                                checked={formData.isActive}
                                onChange={handleActiveChange}
                                disabled={isLoading}
                                className="h-4 w-4 rounded border-gray-300 text-[#F37022] focus:ring-[#F37022]"
                            />
                            <label
                                htmlFor="edit-isActive"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Is Active
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#F37022] hover:bg-[#d95f19] text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
