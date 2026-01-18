import { useState } from 'react';
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

import { useCreateTeacherMutation } from '@/features/teacher-management/services/teachersApi';
import { useGetDepartmentsQuery } from '@/features/department-management/services/departmentsApi';
import type { CreateTeacherRequest } from '@/features/teacher-management/types/teacher.types.ts';

interface CreateTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTeacherModal({ isOpen, onClose }: CreateTeacherModalProps) {
    const [formData, setFormData] = useState({
        teacherCode: '',
        teacherName: '',
        email: '',
        departmentId: '',
    });

    const [createTeacher, { isLoading }] = useCreateTeacherMutation();
    const { data: departments = [], isLoading: isLoadingDepartments } = useGetDepartmentsQuery();

    const resetForm = () => {
        setFormData({
            teacherCode: '',
            teacherName: '',
            email: '',
            departmentId: '',
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

        if (!formData.teacherCode.trim()) {
            toast.error('Mã giảng viên không được để trống');
            return;
        }
        if (!formData.teacherName.trim()) {
            toast.error('Tên giảng viên không được để trống');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('Email không được để trống');
            return;
        }
        if (!formData.departmentId) {
            toast.error('Vui lòng chọn bộ môn');
            return;
        }

        try {
            const createPayload: CreateTeacherRequest = {
                teacherCode: formData.teacherCode.trim(),
                teacherName: formData.teacherName.trim(),
                email: formData.email.trim(),
                departmentId: formData.departmentId,
            };

            await createTeacher(createPayload).unwrap();

            toast.success(`Đã thêm giảng viên "${formData.teacherName}" thành công!`);
            handleClose();
        } catch (err) {
            console.error('Create teacher error:', err);
            toast.error('Thêm mới thất bại: ' + ((err as any)?.data?.message || (err as any)?.message || 'Lỗi không xác định'));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm giảng viên mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="teacherCode" className="text-right">
                            Mã GV <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="teacherCode"
                            name="teacherCode"
                            value={formData.teacherCode}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                            placeholder="VD: GV001"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="teacherName" className="text-right">
                            Tên GV <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="teacherName"
                            name="teacherName"
                            value={formData.teacherName}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                            placeholder="VD: Nguyễn Văn A"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isLoading}
                            placeholder="VD: example@fe.edu.vn"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="departmentId" className="text-right">
                            Bộ môn <span className="text-red-500">*</span>
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Thêm mới
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
