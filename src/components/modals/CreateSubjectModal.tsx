import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Input, InputNumber, Button } from 'antd';

const { TextArea } = Input;


import { useCreateSubjectMutation } from '@/api/subjectsApi';

interface CreateSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateSubjectModal({ isOpen, onClose }: CreateSubjectModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        credits: 3,
        timeAllocation: '',
        description: '',
        minAvgMarkToPass: 5,
        isActive: true
    });

    const [createSubject, { isLoading }] = useCreateSubjectMutation();

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            credits: 3,
            timeAllocation: '',
            description: '',
            minAvgMarkToPass: 5,
            isActive: true
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setFormData(prev => ({
            ...prev,
            [name]: value || 0
        }));
    };

    const handleSubmit = async () => {
        if (!formData.code || !formData.name) {
            toast.error('Code and Name are required');
            return;
        }

        // Validate ranges
        if (formData.credits < 0 || formData.credits > 10) {
            toast.error('Credits must be between 0 and 10');
            return;
        }
        if (formData.minAvgMarkToPass < 0 || formData.minAvgMarkToPass > 10) {
            toast.error('Pass Mark must be between 0 and 10');
            return;
        }

        try {
            await createSubject(formData).unwrap();
            toast.success(`Subject "${formData.name}" created successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to create subject', err);
            toast.error(err?.data?.message || 'Failed to create subject');
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title="Create New Subject"
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
                    Create Subject
                </Button>
            ]}
        >
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Code <span className="text-red-500">*</span></span>
                        <Input
                            id="code"
                            name="code"
                            placeholder="e.g. SWE201"
                            value={formData.code}
                            onChange={handleChange}
                            disabled={isLoading}
                            size="large"
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></span>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Software Engineering"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isLoading}
                            size="large"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700">Credits (0-10)</span>
                        <InputNumber
                            id="credits"
                            value={formData.credits}
                            onChange={(value) => handleNumberChange('credits', value)}
                            min={0}
                            max={10}
                            disabled={isLoading}
                            size="large"
                            className="w-full"
                        />
                    </div>
                    <div className="grid gap-1">
                        <span className="block text-sm font-semibold text-gray-700">Pass Mark (0-10)</span>
                        <InputNumber
                            id="minAvgMarkToPass"
                            value={formData.minAvgMarkToPass}
                            onChange={(value) => handleNumberChange('minAvgMarkToPass', value)}
                            min={0}
                            max={10}
                            step={0.1}
                            disabled={isLoading}
                            size="large"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid gap-1">
                    <span className="block text-sm font-semibold text-gray-700">Time Allocation</span>
                    <Input
                        id="timeAllocation"
                        name="timeAllocation"
                        placeholder="e.g. 45h Theory, 30h Lab"
                        value={formData.timeAllocation}
                        onChange={handleChange}
                        disabled={isLoading}
                        size="large"
                    />
                </div>

                <div className="grid gap-1">
                    <span className="block text-sm font-semibold text-gray-700">Description</span>
                    <TextArea
                        id="description"
                        name="description"
                        placeholder="Subject description..."
                        value={formData.description}
                        onChange={handleChange}
                        disabled={isLoading}
                        rows={4}
                        size="large"
                    />
                </div>
            </div>
        </Modal>
    );
}
