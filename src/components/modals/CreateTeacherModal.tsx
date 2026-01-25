import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select } from 'antd';

import { useCreateTeacherMutation } from '@/api/teachersApi';
import { useGetDepartmentsQuery } from '@/api/departmentsApi';
import { useCreateAccountMutation } from '@/api/accountsApi';
import type { CreateTeacherRequest } from '@/types/teacher.types';
import { Role, type CreateAccountRequest } from '@/types/account.types';

interface CreateTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTeacherModal({ isOpen, onClose }: CreateTeacherModalProps) {
    const [formData, setFormData] = useState({
        teacherCode: '',
        teacherName: '',
        userName: '',
        cardId: '',
        email: '',
        departmentId: '',
    });

    const [createTeacher, { isLoading: isCreatingTeacher }] = useCreateTeacherMutation();
    const [createAccount, { isLoading: isCreatingAccount }] = useCreateAccountMutation();
    const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery({
        page: 1,
        pageSize: 1000,
        sortColumn: 'name',
        sortDirection: 'asc'
    });
    const departments = departmentsData?.items || [];

    const isLoading = isCreatingTeacher || isCreatingAccount;

    const resetForm = () => {
        setFormData({
            teacherCode: '',
            teacherName: '',
            userName: '',
            cardId: '',
            email: '',
            departmentId: '',
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, departmentId: value }));
    };

    const handleSubmit = async () => {
        if (!formData.teacherCode.trim()) {
            toast.error('Teacher code cannot be empty');
            return;
        }
        if (!formData.teacherName.trim()) {
            toast.error('Teacher name cannot be empty');
            return;
        }
        if (!formData.userName.trim()) {
            toast.error('Account Username cannot be empty');
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
            // Step 1: Create Account
            const accountPayload: CreateAccountRequest = {
                userName: formData.userName.trim(),
                email: formData.email.trim(),
                fullName: formData.teacherName.trim(),
                role: Role.Teacher,
                password: 'Password@123',
                confirmPassword: 'Password@123',
                emailConfirmed: false,
                phoneNumberConfirmed: false,
                twoFactorEnabled: false,
                lockoutEnabled: false,
            };

            const accountData = await createAccount(accountPayload).unwrap();
            const accountId = accountData.id;

            if (!accountId) {
                throw new Error('Failed to retrieve Account ID after creation.');
            }

            // Step 2: Create Teacher using Account ID
            const teacherPayload: CreateTeacherRequest = {
                userId: accountId,
                teacherCode: formData.teacherCode.trim(),
                teacherName: formData.teacherName.trim(),
                email: formData.email.trim(),
                departmentId: formData.departmentId,
                cardId: formData.cardId.trim() || undefined,
            };

            await createTeacher(teacherPayload).unwrap();

            toast.success(`Teacher "${formData.teacherName}" added successfully!`);
            handleClose();
        } catch (err: any) {
            let errorMessage = 'Creation failed';

            if (err?.status === 'PARSING_ERROR' && typeof err?.data === 'string') {
                if (err.data.includes('FluentValidation.ValidationException')) {
                    const match = err.data.match(/Validation failed: -- (.*?)\s+Severity:/s);
                    if (match && match[1]) {
                        errorMessage = 'Server Validation Error:\n' + match[1];
                    } else {
                        errorMessage = 'Server Validation Error: ' + err.data.substring(0, 300);
                    }
                } else {
                    errorMessage = `Server Error: ${err.data.substring(0, 200)}...`;
                }
            } else if (err?.data?.errors) {
                const validationErrors = Object.values(err.data.errors).flat().join('\n');
                errorMessage += `:\n${validationErrors}`;
            } else if (err?.data?.result && typeof err.data.result === 'string') {
                errorMessage = `Server Error: ${err.data.result}`;
            } else if (err?.data?.message) {
                let msg = err.data.message;
                if (msg.includes("is already registered")) {
                    msg = msg.replace(/Email '.*?'/, 'Email');
                }
                errorMessage += `: ${msg}`;
            } else if (err?.data?.title) {
                errorMessage += `: ${err.data.title}`;
            } else {
                errorMessage += ': Unknown error';
            }

            if (errorMessage.includes("is already registered")) {
                errorMessage = errorMessage.replace(/Email '.*?'/, 'Email');
            }

            toast.error(errorMessage);
        }
    };

    return (
        <Modal
            title="Add New Teacher"
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
                    Create
                </Button>
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">
                            Teacher Code <span className="text-red-500">*</span>
                        </span>
                        <Input
                            id="teacherCode"
                            name="teacherCode"
                            value={formData.teacherCode}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Ex: T001"
                            size="large"
                        />
                    </div>
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">
                            UserName <span className="text-red-500">*</span>
                        </span>
                        <Input
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Ex: johndoe (No spaces)"
                            size="large"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <span className="block text-sm font-semibold text-gray-700 mb-1">
                        Teacher Name <span className="text-red-500">*</span>
                    </span>
                    <Input
                        id="teacherName"
                        name="teacherName"
                        value={formData.teacherName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        placeholder="Ex: John Doe"
                        size="large"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </span>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Ex: example@fe.edu.vn"
                            size="large"
                        />
                    </div>
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700 mb-1">
                            Card ID
                        </span>
                        <Input
                            id="cardId"
                            name="cardId"
                            value={formData.cardId}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Ex: 001099000001"
                            size="large"
                        />
                    </div>
                </div>

                <div className="grid gap-1">
                    <span className="block text-sm font-semibold text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
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
            </div>
        </Modal>
    );
}
