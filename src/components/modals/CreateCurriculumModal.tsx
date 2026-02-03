import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select, InputNumber } from 'antd';

import { useCreateCurriculumMutation } from '@/api/curriculumsApi';
import { useGetSubMajorsQuery } from '@/api/subMajorsApi';
import type { CreateCurriculumRequest } from '@/types/curriculum.types';

interface CreateCurriculumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateCurriculumModal({ isOpen, onClose }: CreateCurriculumModalProps) {
    const [formData, setFormData] = useState<CreateCurriculumRequest>({
        subMajorId: '',
        code: '',
        name: '',
        startYear: new Date().getFullYear(),
        cohort: '',
        totalTerms: 9,
        description: '',
    });

    const [createCurriculum, { isLoading }] = useCreateCurriculumMutation();
    const { data: subMajorsData, isLoading: isLoadingSubMajors } = useGetSubMajorsQuery({
        page: 1,
        pageSize: 100,
    });

    const subMajors = subMajorsData?.items || [];

    const resetForm = () => {
        setFormData({
            subMajorId: '',
            code: '',
            name: '',
            startYear: new Date().getFullYear(),
            cohort: '',
            totalTerms: 9,
            description: '',
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.subMajorId) {
            toast.error('Please select a specialization');
            return;
        }
        if (!formData.code.trim()) {
            toast.error('Curriculum code is required');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Curriculum name is required');
            return;
        }
        if (!formData.startYear) {
            toast.error('Start year is required');
            return;
        }

        try {
            await createCurriculum({
                ...formData,
                code: formData.code.trim(),
                name: formData.name.trim(),
                cohort: formData.cohort?.trim() || undefined,
                description: formData.description?.trim() || undefined,
            }).unwrap();

            toast.success(`Curriculum "${formData.name}" created successfully!`);
            handleClose();
        } catch (err: any) {
            const errorMsg = err?.data?.message || err?.data?.result || err?.message || 'Creation failed';
            toast.error(errorMsg);
        }
    };

    // Auto-generate code and cohort when subMajor and startYear change
    useEffect(() => {
        if (formData.subMajorId && formData.startYear) {
            const selectedSubMajor = subMajors.find((sm: any) => sm.id === formData.subMajorId);
            if (selectedSubMajor) {
                const cohortYear = formData.startYear % 100;
                const newCode = `${selectedSubMajor.code}_K${cohortYear}`;
                const newCohort = `K${cohortYear}`;
                setFormData(prev => ({
                    ...prev,
                    code: newCode,
                    cohort: newCohort,
                }));
            }
        }
    }, [formData.subMajorId, formData.startYear, subMajors]);

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title="Create New Curriculum"
            width={700}
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
                <div className="grid gap-2">
                    <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Specialization <span className="text-red-500">*</span>
                    </span>
                    <Select
                        placeholder="Select specialization"
                        loading={isLoadingSubMajors}
                        value={formData.subMajorId || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, subMajorId: value }))}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {subMajors.map((sm: any) => (
                            <Select.Option key={sm.id} value={sm.id}>
                                {sm.code} - {sm.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="mb-1 block text-sm font-semibold text-gray-700">
                            Start Year <span className="text-red-500">*</span>
                        </span>
                        <InputNumber
                            min={2000}
                            max={2100}
                            value={formData.startYear}
                            onChange={(value) => setFormData(prev => ({ ...prev, startYear: value || 2024 }))}
                            size="large"
                            className="w-full"
                        />
                    </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="mb-1 block text-sm font-semibold text-gray-700">
                            Curriculum Code <span className="text-red-500">*</span>
                        </span>
                        <Input
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Ex: BIT_SE_K20"
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
