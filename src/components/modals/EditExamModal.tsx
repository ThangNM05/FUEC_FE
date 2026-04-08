import { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Switch, Input, InputNumber, Select, Button } from 'antd';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useUpdateExamMutation } from '@/api/examsApi';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';
import type { Exam } from '@/types/exam.types';

interface EditExamModalProps {
    exam: Exam | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditExamModal({ exam, isOpen, onClose }: EditExamModalProps) {
    const [form] = Form.useForm();
    const [updateExam, { isLoading }] = useUpdateExamMutation();

    const { data: studentsData } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: exam?.classSubjectId || '' },
        { skip: !exam?.classSubjectId }
    );
    const students = studentsData?.items || [];

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
                enableAiProctoring: exam.enableAiProctoring ?? true,
                proctoringExemptStudentClassIds: exam.proctoringExemptStudentClassIds || [],
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
            width="min(96vw, 640px)"
            destroyOnClose
            styles={{ body: { padding: '16px 0 0' } }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    securityMode: 1,
                    codeDuration: 240,
                    isPublicGrade: true,
                    requireIpCheck: false,
                    displayName: '',
                    enableAiProctoring: true,
                    proctoringExemptStudentClassIds: [],
                }}
            >
                <Form.Item
                    name="displayName"
                    label="Exam Title / Display Name"
                    rules={[{ required: true, message: 'Please enter exam title' }]}
                >
                    <Input placeholder="e.g. Progress Test 1" />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
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

                <Form.Item name="securityMode" label="Security Mode">
                    <Select options={[
                        { value: 1, label: 'Static Access Code' },
                        { value: 2, label: 'Dynamic Access Code' }
                    ]} />
                </Form.Item>

                <Form.Item name="allowedIpRanges" label="Allowed IP Ranges (comma separated)">
                    <Input placeholder="Leave empty for any IP" />
                </Form.Item>

                {/* Toggle switches — stacked on mobile, row on desktop */}
                <div className="grid grid-cols-3 gap-4 mb-2">
                    <Form.Item name="isPublicGrade" label="Public Grade" valuePropName="checked" className="!mb-0">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="requireIpCheck" label="Require IP Check" valuePropName="checked" className="!mb-0">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="enableAiProctoring" label="AI Proctoring" valuePropName="checked" className="!mb-0">
                        <Switch />
                    </Form.Item>
                </div>

                {/* Exemption list — shown only when AI Proctoring is ON */}
                <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) => prev.enableAiProctoring !== cur.enableAiProctoring}
                >
                    {({ getFieldValue }) =>
                        getFieldValue('enableAiProctoring') ? (
                            <Form.Item
                                name="proctoringExemptStudentClassIds"
                                label="Camera Exemptions"
                                extra="Students selected here will bypass AI proctoring (e.g. broken camera)"
                                className="mt-3"
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="Select students to exempt..."
                                    options={students.map((s) => ({
                                        label: `${s.studentCode} – ${s.studentName}`,
                                        value: s.id,
                                    }))}
                                />
                            </Form.Item>
                        ) : null
                    }
                </Form.Item>
            </Form>
        </Modal>
    );
}
