import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button } from 'antd';

import { useUpdateStudentMutation } from '@/api/studentsApi';
import { useUpdateAccountMutation } from '@/api/accountsApi';
import type { Student, UpdateStudentRequest } from '@/types/student.types';

interface EditStudentModalProps {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditStudentModal({ student, isOpen, onClose }: EditStudentModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        cardId: '',
    });

    const [updateStudent, { isLoading: isUpdatingStudent }] = useUpdateStudentMutation();
    const [updateAccount, { isLoading: isUpdatingAccount }] = useUpdateAccountMutation();

    const isLoading = isUpdatingStudent || isUpdatingAccount;

    useEffect(() => {
        if (student) {
            setFormData({
                fullName: student.accountFullName || student.studentName || '',
                email: student.accountEmail || student.email || '',
                cardId: student.cardId || '',
            });
        }
    }, [student, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!student) return;

        if (!formData.fullName.trim()) {
            toast.error('Student name cannot be empty');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Email cannot be empty');
            return;
        }

        try {
            // Update Account Name and Email
            if (student.userId) {
                await updateAccount({
                    id: student.userId,
                    fullName: formData.fullName,
                    email: formData.email,
                    role: 2 // Student Role
                }).unwrap();
            }

            // Update Student Details
            const updatePayload: UpdateStudentRequest = {
                id: student.id,
                fullName: formData.fullName,
                email: formData.email,
                cardId: formData.cardId,
            };

            await updateStudent(updatePayload).unwrap();

            toast.success(`Updated student "${formData.fullName}" successfully!`);
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
            title="Edit Student"
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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="example@fpt.edu.vn"
                        size="large"
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
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Enter Card ID..."
                        size="large"
                    />
                </div>
            </div>
        </Modal>
    );
}
