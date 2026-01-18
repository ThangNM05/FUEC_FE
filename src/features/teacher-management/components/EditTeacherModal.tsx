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

import { useUpdateTeacherMutation } from '@/features/teacher-management/services/teachersApi';
import { useGetDepartmentsQuery } from '@/features/department-management/services/departmentsApi';
import type { Teacher, UpdateTeacherRequest } from '@/features/teacher-management/types/teacher.types.ts';

interface EditTeacherModalProps {
    teacher: Teacher | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditTeacherModal({ teacher, isOpen, onClose }: EditTeacherModalProps) {
    const [formData, setFormData] = useState({
        teacherName: '',
        cardId: '',
        departmentId: '',
        isActive: true,
    });

    const [updateTeacher, { isLoading }] = useUpdateTeacherMutation();
    const { data: departments = [], isLoading: isLoadingDepartments } = useGetDepartmentsQuery();

    useEffect(() => {
        if (teacher) {
            setFormData({
                teacherName: teacher.teacherName || '',
                cardId: teacher.cardId || '',
                departmentId: teacher.departmentId || '',
                isActive: teacher.isActive ?? true,
            });
        }
    }, [teacher]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacher) return;

        if (!formData.teacherName.trim()) {
            toast.error('Tên giảng viên không được để trống');
            return;
        }

        if (!formData.departmentId) {
            toast.error('Vui lòng chọn bộ môn');
            return;
        }

        try {
            const updatePayload: UpdateTeacherRequest = {
                id: teacher.id,
                teacherName: formData.teacherName,
                cardId: formData.cardId,
                departmentId: formData.departmentId,
                isActive: formData.isActive,
            };

            await updateTeacher(updatePayload).unwrap();

            toast.success(`Cập nhật giảng viên "${formData.teacherName}" thành công!`);
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
                    <DialogTitle>Chỉnh sửa giảng viên</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="teacherName" className="text-right">
                            Tên
                        </Label>
                        <Input
                            id="teacherName"
                            name="teacherName"
                            value={formData.teacherName}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="departmentId" className="text-right">
                            Bộ môn
                        </Label>
                        <div className="col-span-3">
                            <select
                                id="departmentId"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                disabled={isLoading || isLoadingDepartments}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>Chọn bộ môn</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
