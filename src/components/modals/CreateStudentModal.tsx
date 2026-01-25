import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button } from 'antd';

import { Label } from '@/components/ui/label';

import { useCreateStudentMutation } from '@/api/studentsApi';
import { useCreateAccountMutation } from '@/api/accountsApi';
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
    });

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
                studentCode: formData.studentCode.trim(),
                studentName: formData.studentName.trim(),
                email: formData.email.trim(),
                cardId: formData.cardId.trim() || undefined,
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
            width={600}
            footer={[
                <Button key="cancel" onClick={handleClose} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                >
                    Create
                </Button>
            ]}
        >
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="studentCode" className="mb-2 block">
                            Student Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="studentCode"
                            name="studentCode"
                            value={formData.studentCode}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: S001"
                            size="large"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="userName" className="mb-2 block">
                            UserName <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: johndoe (No spaces)"
                            size="large"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="studentName" className="mb-2 block">
                        Student Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Ex: Jane Doe"
                        size="large"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="mb-2 block">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: student@fe.edu.vn"
                            size="large"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cardId" className="mb-2 block">
                            Card ID
                        </Label>
                        <Input
                            id="cardId"
                            name="cardId"
                            value={formData.cardId}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: 001099000001"
                            size="large"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
