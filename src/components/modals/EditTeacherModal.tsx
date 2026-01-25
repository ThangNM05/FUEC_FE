import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select, Switch } from 'antd';

import { useUpdateTeacherMutation } from '@/api/teachersApi';
import { useUpdateAccountMutation } from '@/api/accountsApi';
import { useGetDepartmentsQuery } from '@/api/departmentsApi';
import type { Teacher, UpdateTeacherRequest } from '@/types/teacher.types.ts';

interface EditTeacherModalProps {
    teacher: Teacher | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditTeacherModal({ teacher, isOpen, onClose }: EditTeacherModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        cardId: '',
        departmentId: '',
        isActive: true,
    });

    const [updateTeacher, { isLoading: isUpdatingTeacher }] = useUpdateTeacherMutation();
    const [updateAccount, { isLoading: isUpdatingAccount }] = useUpdateAccountMutation();

    const isLoading = isUpdatingTeacher || isUpdatingAccount;

    const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery({
        page: 1,
        pageSize: 1000,
        sortColumn: 'name',
        sortDirection: 'asc'
    });
    const departments = departmentsData?.items || [];

    useEffect(() => {
        if (teacher) {
            setFormData({
                fullName: teacher.accountFullName || teacher.teacherName || '',
                email: teacher.accountEmail || '',
                cardId: teacher.cardId || '',
                departmentId: teacher.departmentId || '',
                isActive: teacher.isActive ?? true,
            });
        }
    }, [teacher, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, departmentId: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = async () => {
        if (!teacher) return;

        if (!formData.fullName.trim()) {
            toast.error('Teacher name cannot be empty');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Email cannot be empty');
            return;
        }

        if (!formData.departmentId) {
            toast.error('Please select a department');
            return;
        }

        try {
            // Update Account Name and Email
            if (teacher.userId) {
                await updateAccount({
                    id: teacher.userId,
                    fullName: formData.fullName,
                    email: formData.email,
                    role: 1 // Teacher Role
                }).unwrap();
            }

            const updatePayload: UpdateTeacherRequest = {
                id: teacher.id,
                fullName: formData.fullName,
                email: formData.email,
                cardId: formData.cardId,
                departmentId: formData.departmentId,
                isActive: formData.isActive,
            };

            await updateTeacher(updatePayload).unwrap();

            toast.success(`Teacher "${formData.fullName}" updated successfully!`);
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
        <Modal
            title="Edit Teacher"
            open={isOpen}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none"
                >
                    Save
                </Button>
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Name
                    </span>
                    <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Email
                    </span>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        placeholder="example@fpt.edu.vn"
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Department
                    </span>
                    <Select
                        id="departmentId"
                        value={formData.departmentId}
                        onChange={handleSelectChange}
                        disabled={isLoading || isLoadingDepartments}
                        size="large"
                        placeholder="Select Department"
                        className="w-full"
                        options={departments.map(dept => ({ label: dept.code, value: dept.id }))}
                    />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Card ID
                    </span>
                    <Input
                        id="cardId"
                        name="cardId"
                        value={formData.cardId}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        placeholder="Enter Card ID..."
                        size="large"
                    />
                </div>
            </div>
        </Modal>
    );
}
