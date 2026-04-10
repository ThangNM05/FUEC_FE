import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Checkbox, DatePicker, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';

import { useCreateSemesterMutation, useAutoCreateSemesterMutation } from '@/api/semestersApi';
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
    const [autoCreateSemester, { isLoading: isAutoLoading }] = useAutoCreateSemesterMutation();

    const anyLoading = isLoading || isAutoLoading;

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

        const start = dayjs(formData.startDate);
        const end = dayjs(formData.endDate);

        if (start.isAfter(end)) {
            toast.error('Start Date cannot be after End Date');
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

    const handleAutoCreate = async () => {
        try {
            const result = await autoCreateSemester().unwrap();
            const res = (result as any)?.result ?? result;
            if (res.wasCreated && res.semester) {
                setFormData({
                    semesterCode: res.semester.semesterCode,
                    startDate: res.semester.startDate,
                    endDate: res.semester.endDate,
                    isDefault: res.semester.isDefault ?? false,
                });
                toast.success(res.message || 'Semester auto-generated successfully');
            } else {
                toast.info(res.message || 'Semester already exists for next period');
            }
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.message || 'Auto create failed';
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
            width={800}
        footer={[
                <Button key="cancel" onClick={handleCancel} disabled={anyLoading}>
                    Cancel
                </Button>,
                <Button
                    key="auto-create"
                    icon={<SyncOutlined spin={isAutoLoading} />}
                    loading={isAutoLoading}
                    disabled={anyLoading}
                    onClick={handleAutoCreate}
                    style={{
                        borderColor: '#F37022',
                        color: '#F37022',
                    }}
                >
                    Auto Create
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    disabled={anyLoading}
                    onClick={handleSubmit}
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none"
                >
                    Create
                </Button>,
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Code
                    </span>
                    <Input
                        id="semesterCode"
                        name="semesterCode"
                        value={formData.semesterCode}
                        onChange={handleChange}
                        placeholder="e.g. FALL26"
                        disabled={isLoading}
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Start Date
                    </span>
                    <DatePicker
                        id="startDate"
                        value={formData.startDate ? dayjs(formData.startDate) : null}
                        onChange={(date) => handleDateChange('startDate', date)}
                        disabled={isLoading}
                        size="large"
                        format="YYYY-MM-DD"
                        placeholder="Select start date"
                        className="w-full"
                        disabledDate={(current) => {
                            if (!formData.endDate) return false;
                            return current && current.isAfter(dayjs(formData.endDate), 'day');
                        }}
                    />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        End Date
                    </span>
                    <DatePicker
                        id="endDate"
                        value={formData.endDate ? dayjs(formData.endDate) : null}
                        onChange={(date) => handleDateChange('endDate', date)}
                        disabled={isLoading}
                        size="large"
                        format="YYYY-MM-DD"
                        placeholder="Select end date"
                        className="w-full"
                        disabledDate={(current) => {
                            if (!formData.startDate) return false;
                            return current && current.isBefore(dayjs(formData.startDate), 'day');
                        }}
                    />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Default
                    </span>
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
        </Modal>
    );
}
