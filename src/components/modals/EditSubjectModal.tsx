import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, InputNumber } from 'antd';

import { useUpdateSubjectMutation } from '@/api/subjectsApi';
import type { Subject } from '@/types/subject.types';

const { TextArea } = Input;

interface EditSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: Subject | null;
}

export default function EditSubjectModal({ isOpen, onClose, subject }: EditSubjectModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        credits: 0,
        terms: 0,
        timeAllocation: '',
        description: '',
        minAvgMarkToPass: 0,
        isActive: true
    });

    const [updateSubject, { isLoading }] = useUpdateSubjectMutation();

    useEffect(() => {
        if (subject) {
            setFormData({
                code: subject.code,
                name: subject.name,
                credits: subject.credits,
                terms: subject.terms,
                timeAllocation: subject.timeAllocation || '',
                description: subject.description || '',
                minAvgMarkToPass: subject.minAvgMarkToPass,
                isActive: subject.isActive
            });
        }
    }, [subject, isOpen]);

    const handleClose = () => {
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setFormData(prev => ({ ...prev, [name]: value || 0 }));
    };

    const handleSubmit = async () => {
        if (!subject) return;

        if (!formData.code || !formData.name) {
            toast.error('Code and Name are required');
            return;
        }

        if (formData.credits > 10) {
            toast.error('Credits cannot exceed 10');
            return;
        }

        if (formData.terms > 9) {
            toast.error('Terms cannot exceed 9');
            return;
        }

        try {
            await updateSubject({
                id: subject.id,
                ...formData
            }).unwrap();

            toast.success(`Subject "${formData.name}" updated successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to update subject', err);
            toast.error(err?.data?.message || 'Failed to update subject');
        }
    };

    return (
        <Modal
            title="Edit Subject"
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
                    Save Changes
                </Button>
            ]}
        >
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Code <span className="text-red-500">*</span></span>
                        <Input
                            id="edit-code"
                            value={formData.code}
                            disabled={true}
                            size="large"
                            className="bg-gray-50"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></span>
                        <Input
                            id="edit-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            size="large"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Credits</span>
                        <InputNumber
                            id="edit-credits"
                            min={0}
                            max={10}
                            value={formData.credits}
                            onChange={(val) => handleNumberChange('credits', val)}
                            disabled={isLoading}
                            size="large"
                            className="w-full"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Terms</span>
                        <InputNumber
                            id="edit-terms"
                            min={1}
                            max={9}
                            value={formData.terms}
                            onChange={(val) => handleNumberChange('terms', val)}
                            disabled={isLoading}
                            size="large"
                            className="w-full"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Pass Mark</span>
                        <InputNumber
                            id="edit-minAvgMarkToPass"
                            min={0}
                            max={10}
                            step={0.1}
                            value={formData.minAvgMarkToPass}
                            onChange={(val) => handleNumberChange('minAvgMarkToPass', val)}
                            disabled={isLoading}
                            size="large"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <span className="block text-sm font-semibold text-gray-700">Time Allocation</span>
                    <Input
                        id="edit-timeAllocation"
                        name="timeAllocation"
                        value={formData.timeAllocation}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        size="large"
                    />
                </div>

                <div className="grid gap-2">
                    <span className="block text-sm font-semibold text-gray-700">Description</span>
                    <TextArea
                        id="edit-description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        rows={4}
                    />
                </div>
            </div>
        </Modal>
    );
}
