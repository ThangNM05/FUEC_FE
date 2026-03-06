import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select } from 'antd';

import { useCreateStudentMutation } from '@/api/studentsApi';
import { useCreateAccountMutation } from '@/api/accountsApi';
import { useGetSubMajorsQuery } from '@/api/subMajorsApi';
import { useGetCurriculumsQuery } from '@/api/curriculumsApi';
import type { CreateStudentRequest } from '@/types/student.types';
import { Role, type CreateAccountRequest } from '@/types/account.types';

interface CreateStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateStudentModal({ isOpen, onClose }: CreateStudentModalProps) {
    const [formData, setFormData] = useState({
        studentCode: '',
        studentName: '',
        userName: '',
        cardId: '',
        email: '',
        cohort: '',
        subMajorId: '',
        curriculumId: '',
    });

    const { data: subMajorsData, isLoading: isLoadingSubMajors } = useGetSubMajorsQuery({ page: 1, pageSize: 100 });
    const { data: curriculumsData, isLoading: isLoadingCurriculums } = useGetCurriculumsQuery({ page: 1, pageSize: 100 });

    const subMajors = subMajorsData?.items || [];
    const curriculums = curriculumsData?.items || [];

    const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();
    const [createAccount, { isLoading: isCreatingAccount }] = useCreateAccountMutation();

    const isLoading = isCreatingStudent || isCreatingAccount;

    const resetForm = () => {
        setFormData({
            studentCode: '',
            studentName: '',
            userName: '',
            cardId: '',
            email: '',
            cohort: '',
            subMajorId: '',
            curriculumId: '',
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

    const handleSubmit = async () => {
        if (!formData.studentCode.trim()) {
            toast.error('Student code cannot be empty');
            return;
        }
        if (!formData.studentName.trim()) {
            toast.error('Student name cannot be empty');
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

        try {
            // Step 1: Create Account
            const accountPayload: CreateAccountRequest = {
                userName: formData.userName.trim(),
                email: formData.email.trim(),
                fullName: formData.studentName.trim(),
                role: Role.Student, // Role 2
                password: 'Password@123',
                confirmPassword: 'Password@123',
                emailConfirmed: false,
                phoneNumberConfirmed: false,
                twoFactorEnabled: false,
                lockoutEnabled: false,
                phoneNumber: undefined,
                gender: undefined,
            };

            const accountData = await createAccount(accountPayload).unwrap();
            const accountId = accountData.id;

            if (!accountId) {
                throw new Error('Failed to retrieve Account ID after creation.');
            }

            // Step 2: Create Student using Account ID
            const studentPayload: CreateStudentRequest = {
                userId: accountId,
                cardId: formData.cardId.trim() || undefined,
                cohort: formData.cohort.trim() || undefined,
                subMajorId: formData.subMajorId || undefined,
                curriculumId: formData.curriculumId || undefined,
            };

            await createStudent(studentPayload).unwrap();

            toast.success(`Student "${formData.studentName}" added successfully!`);
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

            // Final safety check for any other path that might have included the email
            if (errorMessage.includes("is already registered")) {
                errorMessage = errorMessage.replace(/Email '.*?'/, 'Email');
            }

            toast.error(errorMessage);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title="Add New Student"
            width={850}
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">
                            Student Code <span className="text-red-500">*</span>
                        </span>
                        <Input
                            id="studentCode"
                            name="studentCode"
                            value={formData.studentCode}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: DE180145"
                            size="large"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">
                            UserName <span className="text-red-500">*</span>
                        </span>
                        <Input
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: thangnm11"
                            size="large"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                        Student Name <span className="text-red-500">*</span>
                    </span>
                    <Input
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Ex: Nguyen Minh Thang"
                        size="large"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">
                            Cohort
                        </span>
                        <Input
                            id="cohort"
                            name="cohort"
                            value={formData.cohort}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: K17"
                            size="large"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">
                            Sub Major
                        </span>
                        <Select
                            id="subMajorId"
                            value={formData.subMajorId || undefined}
                            onChange={(val) => setFormData(prev => ({ ...prev, subMajorId: val }))}
                            disabled={isLoading || isLoadingSubMajors}
                            placeholder="Select Sub Major"
                            size="large"
                            className="w-full"
                        >
                            {subMajors.map(sm => (
                                <Select.Option key={sm.id} value={sm.id}>
                                    {sm.name} ({sm.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="grid gap-2">
                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                        Curriculum
                    </span>
                    <Select
                        id="curriculumId"
                        value={formData.curriculumId || undefined}
                        onChange={(val) => setFormData(prev => ({ ...prev, curriculumId: val }))}
                        disabled={isLoading || isLoadingCurriculums}
                        placeholder="Select Curriculum"
                        size="large"
                        className="w-full"
                        popupMatchSelectWidth={false}
                        dropdownStyle={{ maxWidth: '600px', whiteSpace: 'normal' }}
                    >
                        {curriculums.map(curr => (
                            <Select.Option key={curr.id} value={curr.id}>
                                <div className="break-words whitespace-normal leading-tight py-1">
                                    {curr.name} <span className="text-gray-500">({curr.code})</span>
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </span>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            size="large"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">
                            Card ID
                        </span>
                        <Input
                            id="cardId"
                            name="cardId"
                            value={formData.cardId}
                            onChange={handleChange}
                            disabled={isLoading}
                            size="large"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
