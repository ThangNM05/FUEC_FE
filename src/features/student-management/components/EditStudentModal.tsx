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
import { Input } from '@/components/ui/input'; // Assuming this exists or I'll use standard input
import { Label } from '@/components/ui/label';   // Assuming this exists

import { useUpdateStudentMutation } from '@/features/student-management/services/studentsApi';
import type { Student, UpdateStudentRequest } from '@/features/student-management/types/student.types';

interface EditStudentModalProps {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditStudentModal({ student, isOpen, onClose }: EditStudentModalProps) {
    const [formData, setFormData] = useState({
        studentName: '',
        cardId: '',
    });

    const [updateStudent, { isLoading }] = useUpdateStudentMutation();

    useEffect(() => {
        if (student) {
            setFormData({
                studentName: student.accountFullName || student.studentName || '',
                cardId: student.cardId || '',
            });
        }
    }, [student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        if (!formData.studentName.trim()) {
            toast.error('Student name cannot be empty');
            return;
        }

        try {
            const updatePayload: UpdateStudentRequest = {
                id: student.id,
                studentName: formData.studentName,
                cardId: formData.cardId,
                // Preserve other fields if needed, or API handles partial updates
                // For now, only sending what's editable as per user request
            };

            await updateStudent(updatePayload).unwrap();

            toast.success(`Updated student "${formData.studentName}" successfully!`);
            onClose();
        } catch (err: any) {
            let errorMessage = err?.data?.message || err?.message;
            if (errorMessage && errorMessage.includes("is already registered")) {
                errorMessage = errorMessage.replace(/Email '.*?'/, 'Email');
            }
            toast.error(errorMessage ? `Update failed: ${errorMessage}` : 'An error occurred. Please try again later.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="studentName" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="studentName"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cardId" className="text-right">
                            Card ID
                        </Label>
                        <Input
                            id="cardId"
                            name="cardId"
                            value={formData.cardId}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                            placeholder="Enter Card ID..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#F37022] hover:bg-[#d95f19] text-white font-medium">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
