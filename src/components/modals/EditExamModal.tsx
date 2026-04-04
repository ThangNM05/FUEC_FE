import { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Switch, Input, InputNumber, Select, Button } from 'antd';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useUpdateExamMutation } from '@/api/examsApi';
import type { Exam } from '@/types/exam.types';

interface EditExamModalProps {
    exam: Exam | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditExamModal({ exam, isOpen, onClose }: EditExamModalProps) {
    const [form] = Form.useForm();
    const [updateExam, { isLoading }] = useUpdateExamMutation();

    useEffect(() => {
        if (exam && isOpen) {
            form.setFieldsValue({
                startTime: dayjs(exam.startTime),
                endTime: dayjs(exam.endTime),
                isPublicGrade: exam.isPublicGrade,
                requireIpCheck: exam.requireIpCheck,
                allowedIpRanges: exam.allowedIpRanges,
                codeDuration: 240,
                securityMode: exam.securityMode,
                displayName: exam.displayName,
            });
        }
    }, [exam, isOpen, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!exam) return;

            await updateExam({
                id: exam.id,
                ...values,
                startTime: values.startTime.toISOString(),
                endTime: values.endTime.toISOString(),
                codeDuration: 240,
            }).unwrap();

            toast.success('Exam updated successfully');
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;
            toast.error(error?.data?.message || 'Failed to update exam');
        }
    };

    return (
        <Modal
            title="Edit Exam"
            open={isOpen}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={isLoading}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
                initialValues={{
                    securityMode: 1,
                    codeDuration: 240,
                    isPublicGrade: true,
                    requireIpCheck: false,
                    displayName: ''
                }}
            >
                <Form.Item
                    name="displayName"
                    label="Exam Title / Display Name"
                    rules={[{ required: true, message: 'Please enter exam title' }]}
                >
                    <Input placeholder="e.g. Progress Test 1" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="startTime"
                        label="Start Time"
                        rules={[{ required: true, message: 'Please select start time' }]}
                    >
                        <DatePicker showTime className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label="End Time"
                        rules={[{ required: true, message: 'Please select end time' }]}
                    >
                        <DatePicker showTime className="w-full" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="securityMode" label="Security Mode">
                        <Select options={[
                            { value: 1, label: 'Static Access Code' },
                            { value: 2, label: 'Dynamic Access Code' }
                        ]} />
                    </Form.Item>

                    {/* Code duration is hardcoded to 240s */}
                </div>

                <Form.Item name="allowedIpRanges" label="Allowed IP Ranges (comma separated)">
                    <Input placeholder="Leave empty for any IP" />
                </Form.Item>

                <div className="flex gap-8">
                    <Form.Item name="isPublicGrade" label="Public Grade" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="requireIpCheck" label="Require IP Check" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
}
