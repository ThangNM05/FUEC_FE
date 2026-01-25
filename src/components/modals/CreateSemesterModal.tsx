import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Checkbox, DatePicker, Button } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

import { Label } from '@/components/ui/label';
import { useCreateSemesterMutation } from '@/api/semestersApi';
import type { CreateSemesterRequest } from '@/types/semester.types';

interface CreateSemesterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateSemesterModal({ isOpen, onClose }: CreateSemesterModalProps) {
    const [formData, setFormData] = useState<CreateSemesterRequest>({
        semesterCode: '',
        startDate: '',
        endDate: '',
        isDefault: false,
    });

    const [createSemester, { isLoading }] = useCreateSemesterMutation();

    const resetForm = () => {
        setFormData({
            semesterCode: '',
            startDate: '',
            endDate: '',
            isDefault: false,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isDefault: checked }));
    };

    const handleDateChange = (field: 'startDate' | 'endDate', date: Dayjs | null) => {
        const dateString = date ? date.format('YYYY-MM-DD') : '';
        setFormData((prev) => ({ ...prev, [field]: dateString }));
    };

    const handleSubmit = async () => {
        if (!formData.semesterCode || !formData.startDate || !formData.endDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await createSemester(formData).unwrap();
            toast.success('Semester created successfully');
            resetForm();
            onClose();
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.message || 'Failed to create semester';
            toast.error(errorMessage);
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleCancel}
            title="Create New Semester"
            width={500}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={isLoading}>
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
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="semesterCode" className="text-right">
                        Code
                    </Label>
                    <Input
                        id="semesterCode"
                        name="semesterCode"
                        value={formData.semesterCode}
                        onChange={handleChange}
                        className="col-span-3"
                        placeholder="e.g. FALL26"
                        disabled={isLoading}
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                        Start Date
                    </Label>
                    <DatePicker
                        id="startDate"
                        value={formData.startDate ? dayjs(formData.startDate) : null}
                        onChange={(date) => handleDateChange('startDate', date)}
                        className="col-span-3"
                        disabled={isLoading}
                        size="large"
                        format="YYYY-MM-DD"
                        placeholder="Select start date"
                        style={{ width: '100%' }}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                        End Date
                    </Label>
                    <DatePicker
                        id="endDate"
                        value={formData.endDate ? dayjs(formData.endDate) : null}
                        onChange={(date) => handleDateChange('endDate', date)}
                        className="col-span-3"
                        disabled={isLoading}
                        size="large"
                        format="YYYY-MM-DD"
                        placeholder="Select end date"
                        style={{ width: '100%' }}
                        disabledDate={(current) => {
                            // Disable dates before start date
                            if (!formData.startDate) return false;
                            return current && current.isBefore(dayjs(formData.startDate), 'day');
                        }}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isDefault" className="text-right">
                        Default
                    </Label>
                    <div className="col-span-3">
                        <Checkbox
                            id="isDefault"
                            checked={formData.isDefault}
                            onChange={(e) => handleCheckboxChange(e.target.checked)}
                            disabled={isLoading}
                        >
                            Set as default semester
                        </Checkbox>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
