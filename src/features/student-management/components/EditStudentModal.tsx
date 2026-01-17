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
                studentName: student.studentName || '',
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
            toast.error('Tên sinh viên không được để trống');
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

            toast.success(`Cập nhật sinh viên "${formData.studentName}" thành công!`);
            onClose();
        } catch (err) {
            console.error('Update error:', err);
            // @ts-ignore
            toast.error('Cập nhật thất bại: ' + (err?.data?.message || err?.message || 'Lỗi không xác định'));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa sinh viên</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="studentName" className="text-right">
                            Tên
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
                            placeholder="Nhập mã thẻ..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
