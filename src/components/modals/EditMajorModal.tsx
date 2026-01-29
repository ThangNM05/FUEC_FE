import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button } from 'antd';

import { useCreateMajorMutation, useUpdateMajorMutation } from '@/api/majorsApi';
import type { Major, CreateMajorRequest, UpdateMajorRequest } from '@/types/major.types';

interface EditMajorModalProps {
    major: Major | null; // If null, we are adding new
    isOpen: boolean;
    onClose: () => void;
}

export default function EditMajorModal({ major, isOpen, onClose }: EditMajorModalProps) {
    const isEditing = !!major;
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
    });

    const [createMajor, { isLoading: isCreating }] = useCreateMajorMutation();
    const [updateMajor, { isLoading: isUpdating }] = useUpdateMajorMutation();
    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (major) {
            setFormData({
                code: major.code || '',
                name: major.name || '',
                description: major.description || '',
            });
        } else {
            setFormData({
                code: '',
                name: '',
                description: '',
            });
        }
    }, [major, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.code.trim()) {
            toast.error('Major code is required');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Major name is required');
            return;
        }

        try {
            if (isEditing && major) {
                const updatePayload: UpdateMajorRequest = {
                    id: major.id,
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                };
                await updateMajor(updatePayload).unwrap();
                toast.success(`Major "${formData.name}" updated successfully!`);
            } else {
                const createPayload: CreateMajorRequest = {
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                };
                await createMajor(createPayload).unwrap();
                toast.success(`Major "${formData.name}" created successfully!`);
            }
            onClose();
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.message;
            toast.error(errorMessage ? `${isEditing ? 'Update' : 'Create'} failed: ${errorMessage}` : 'An error occurred. Please try again later.');
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={isEditing ? 'Edit Major' : 'Add New Major'}
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
                    {isEditing ? 'Save' : 'Create'}
                </Button>
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Major Code
                    </span>
                    <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="e.g. SE, AI, IB..."
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Major Name
                    </span>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="e.g. Software Engineering"
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Description
                    </span>
                    <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Brief description of the major"
                        size="large"
                    />
                </div>
            </div>
        </Modal>
    );
}
