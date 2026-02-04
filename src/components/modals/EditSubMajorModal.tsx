import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select } from 'antd';

import { useCreateSubMajorMutation, useUpdateSubMajorMutation } from '@/api/subMajorsApi';
import { useGetMajorsQuery } from '@/api/majorsApi';
import type { SubMajor, CreateSubMajorRequest, UpdateSubMajorRequest } from '@/types/subMajor.types';

interface EditSubMajorModalProps {
    subMajor: SubMajor | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditSubMajorModal({ subMajor, isOpen, onClose }: EditSubMajorModalProps) {
    const isEditing = !!subMajor;
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        majorId: '',
    });

    const [createSubMajor, { isLoading: isCreating }] = useCreateSubMajorMutation();
    const [updateSubMajor, { isLoading: isUpdating }] = useUpdateSubMajorMutation();
    const { data: majorsData, isLoading: isLoadingMajors } = useGetMajorsQuery({
        page: 1,
        pageSize: 1000,
        sortColumn: 'name',
        sortDirection: 'asc'
    });

    const isLoading = isCreating || isUpdating;
    const majors = majorsData?.items || [];

    useEffect(() => {
        if (subMajor) {
            setFormData({
                code: subMajor.code || '',
                name: subMajor.name || '',
                description: subMajor.description || '',
                majorId: subMajor.majorId || '',
            });
        } else {
            setFormData({
                code: '',
                name: '',
                description: '',
                majorId: '',
            });
        }
    }, [subMajor, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, majorId: value }));
    };

    const handleSubmit = async () => {
        if (!formData.code.trim()) {
            toast.error('Code is required');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }
        if (!formData.majorId) {
            toast.error('Parent Major is required');
            return;
        }

        try {
            if (isEditing && subMajor) {
                const updatePayload: UpdateSubMajorRequest = {
                    id: subMajor.id,
                    code: formData.code.trim(),
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    majorId: formData.majorId,
                };
                await updateSubMajor(updatePayload).unwrap();
                toast.success(`Sub-Major "${formData.name}" updated successfully!`);
            } else {
                const createPayload: CreateSubMajorRequest = {
                    code: formData.code.trim(),
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    majorId: formData.majorId,
                };
                await createSubMajor(createPayload).unwrap();
                toast.success(`Sub-Major "${formData.name}" created successfully!`);
            }
            onClose();
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.message;
            toast.error(errorMessage ? `Action failed: ${errorMessage}` : 'An error occurred.');
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={isEditing ? 'Edit Sub-Major' : 'Add New Sub-Major'}
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
                        Code <span className="text-red-500">*</span>
                    </span>
                    <Input
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="e.g. SE, AI"
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Name <span className="text-red-500">*</span>
                    </span>
                    <Input
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
                        Major <span className="text-red-500">*</span>
                    </span>
                    <Select
                        value={formData.majorId}
                        onChange={handleSelectChange}
                        disabled={isLoading || isLoadingMajors}
                        size="large"
                        placeholder="Select Major"
                        className="w-full"
                        options={majors.map(m => ({ label: `${m.code} - ${m.name}`, value: m.id }))}
                    />
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Description
                    </span>
                    <Input
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Optional description"
                        size="large"
                    />
                </div>
            </div>
        </Modal>
    );
}
