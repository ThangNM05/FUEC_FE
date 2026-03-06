import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';
import { toast } from 'sonner';
import { useCreateExamFormatMutation, useUpdateExamFormatMutation } from '@/api/examFormatsApi';
import type { ExamFormat } from '@/types/examFormat.types';

interface ExamFormatModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: ExamFormat;
}

export function CreateExamFormatModal({ isOpen, onClose }: ExamFormatModalProps) {
    const [form] = Form.useForm();
    const [createExamFormat, { isLoading }] = useCreateExamFormatMutation();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await createExamFormat(values).unwrap();
            toast.success('Exam format created successfully');
            form.resetFields();
            onClose();
        } catch (error: any) {
            console.error('Failed to create exam format:', error);
            toast.error(error?.data?.message || 'Failed to create exam format');
        }
    };

    return (
        <Modal
            title="Add New Exam Type"
            open={isOpen}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            confirmLoading={isLoading}
            okText="Create"
            width={800}
            okButtonProps={{ className: 'bg-[#F37022] hover:bg-[#d95f19] border-none font-bold h-10 px-6' }}
            cancelButtonProps={{ className: 'font-bold h-10 px-6' }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ durations: 0, weight: 0 }}
                className="mt-4"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="code"
                        label="Exam Code"
                        rules={[{ required: true, message: 'Please enter exam code' }]}
                    >
                        <Input placeholder="Ex: Quiz, Midterm, Final" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="typeName"
                        label="Type Name"
                    >
                        <Input placeholder="Ex: Trắc nghiệm, Tự luận" size="large" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="durations"
                        label="Duration (min)"
                        rules={[{ required: true, message: 'Please enter duration' }]}
                    >
                        <InputNumber min={0} max={180} className="w-full" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="weight"
                        label="Weight (%)"
                        rules={[{ required: true, message: 'Please enter weight' }]}
                    >
                        <InputNumber min={0} max={100} className="w-full" size="large" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} placeholder="Enter description" size="large" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export function EditExamFormatModal({ isOpen, onClose, data }: ExamFormatModalProps) {
    const [form] = Form.useForm();
    const [updateExamFormat, { isLoading }] = useUpdateExamFormatMutation();

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                code: data.code,
                typeName: data.typeName,
                durations: data.durations,
                weight: data.weight,
                description: data.description,
            });
        }
    }, [data, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!data?.id) return;

            await updateExamFormat({ id: data.id, ...values }).unwrap();
            toast.success('Exam format updated successfully');
            onClose();
        } catch (error: any) {
            console.error('Failed to update exam format:', error);
            toast.error(error?.data?.message || 'Failed to update exam format');
        }
    };

    return (
        <Modal
            title="Edit Exam Type"
            open={isOpen}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={isLoading}
            okText="Update"
            width={800}
            okButtonProps={{ className: 'bg-[#F37022] hover:bg-[#d95f19] border-none font-bold h-10 px-6' }}
            cancelButtonProps={{ className: 'font-bold h-10 px-6' }}
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="code"
                        label="Exam Code"
                        rules={[{ required: true, message: 'Please enter exam code' }]}
                    >
                        <Input placeholder="Ex: Quiz, Midterm, Final" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="typeName"
                        label="Type Name"
                    >
                        <Input placeholder="Ex: Trắc nghiệm, Tự luận" size="large" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="durations"
                        label="Duration (min)"
                        rules={[{ required: true, message: 'Please enter duration' }]}
                    >
                        <InputNumber min={0} max={180} className="w-full" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="weight"
                        label="Weight (%)"
                        rules={[{ required: true, message: 'Please enter weight' }]}
                    >
                        <InputNumber min={0} max={100} className="w-full" size="large" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} placeholder="Enter description" size="large" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
