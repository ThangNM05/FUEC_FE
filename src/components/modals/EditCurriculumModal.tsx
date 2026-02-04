import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, InputNumber } from 'antd';

import { useUpdateCurriculumMutation } from '@/api/curriculumsApi';
import type { Curriculum, UpdateCurriculumRequest } from '@/types/curriculum.types';

interface EditCurriculumModalProps {
    curriculum: Curriculum | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditCurriculumModal({ curriculum, isOpen, onClose }: EditCurriculumModalProps) {
    const [formData, setFormData] = useState<UpdateCurriculumRequest>({
        id: '',
        name: '',
        cohort: '',
        totalTerms: 9,
        description: '',
    });

    const [updateCurriculum, { isLoading }] = useUpdateCurriculumMutation();

    // Populate form when curriculum changes
    useEffect(() => {
        if (curriculum) {
            setFormData({
                id: curriculum.id,
                name: curriculum.name,
                cohort: curriculum.cohort || '',
                totalTerms: curriculum.totalTerms,
                description: curriculum.description || '',
            });
        }
    }, [curriculum]);

    const handleClose = () => {
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name?.trim()) {
            toast.error('Curriculum name is required');
            return;
        }

        try {
            await updateCurriculum({
                id: formData.id,
                name: formData.name?.trim(),
                cohort: formData.cohort?.trim() || undefined,
                totalTerms: formData.totalTerms,
                description: formData.description?.trim() || undefined,
            }).unwrap();

            toast.success(`Curriculum "${formData.name}" updated successfully!`);
            handleClose();
        } catch (err: any) {
            const errorMsg = err?.data?.message || err?.data?.result || err?.message || 'Update failed';
            toast.error(errorMsg);
        }
    };

    if (!curriculum) return null;

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title={`Edit Curriculum: ${curriculum.code}`}
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
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none"
                >
                    Save Changes
                </Button>
            ]}
        >
            <div className="grid gap-6 py-4">
                {/* Read-only info */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                        <span className="text-xs text-gray-500">Specialization</span>
                        <p className="font-medium">{curriculum.subMajorName || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500">Start Year</span>
                        <p className="font-medium">{curriculum.startYear}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="mb-1 block text-sm font-semibold text-gray-700">
                            Cohort
                        </span>
                        <Input
                            name="cohort"
                            value={formData.cohort}
                            onChange={handleChange}
                            placeholder="Ex: K20"
                            size="large"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="mb-1 block text-sm font-semibold text-gray-700">
                            Total Terms
                        </span>
                        <InputNumber
                            min={1}
                            max={12}
                            value={formData.totalTerms}
                            onChange={(value) => setFormData(prev => ({ ...prev, totalTerms: value || 9 }))}
                            size="large"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Curriculum Name <span className="text-red-500">*</span>
                    </span>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Software Engineering K20 - .NET Track"
                        size="large"
                    />
                </div>

                <div className="grid gap-2">
                    <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Description
                    </span>
                    <Input.TextArea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter curriculum description..."
                        rows={3}
                    />
                </div>
            </div>
        </Modal>
    );
}
