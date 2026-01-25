import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button } from 'antd';

import { Label } from '@/components/ui/label';

import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '@/api/departmentsApi';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types/department.types';

interface EditDepartmentModalProps {
    department: Department | null; // If null, we are adding new
    isOpen: boolean;
    onClose: () => void;
}

export default function EditDepartmentModal({ department, isOpen, onClose }: EditDepartmentModalProps) {
    const isEditing = !!department;
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
    });

    const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
    const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (department) {
            setFormData({
                code: department.code || '',
                name: department.name || '',
                description: department.description || '',
            });
        } else {
            setFormData({
                code: '',
                name: '',
                description: '',
            });
        }
    }, [department, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.code.trim()) {
            toast.error('Department code is required');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Department name is required');
            return;
        }

        try {
            if (isEditing && department) {
                const updatePayload: UpdateDepartmentRequest = {
                    id: department.id,
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                };
                await updateDepartment(updatePayload).unwrap();
                toast.success(`Department "${formData.name}" updated successfully!`);
            } else {
                const createPayload: CreateDepartmentRequest = {
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                };
                await createDepartment(createPayload).unwrap();
                toast.success(`Department "${formData.name}" created successfully!`);
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
            title={isEditing ? 'Edit Department' : 'Add New Department'}
            width={600}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                >
                    {isEditing ? 'Save' : 'Create'}
                </Button>
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Label htmlFor="code" className="text-right font-semibold text-gray-700">
                        Department Code
                    </Label>
                    <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className="col-span-1"
                        disabled={isLoading}
                        placeholder="e.g. SE, AI, IB..."
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Label htmlFor="name" className="text-right font-semibold text-gray-700">
                        Department Name
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="col-span-1"
                        disabled={isLoading}
                        placeholder="e.g. Software Engineering"
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Label htmlFor="description" className="text-right font-semibold text-gray-700">
                        Description
                    </Label>
                    <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="col-span-1"
                        disabled={isLoading}
                        placeholder="Brief description of the department"
                        size="large"
                    />
                </div>
            </div>
        </Modal>
    );
}
