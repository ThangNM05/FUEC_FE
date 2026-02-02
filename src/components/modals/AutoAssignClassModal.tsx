import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Alert, List, Tag } from 'antd';
import { Wand2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetSubMajorsQuery } from '@/api/subMajorsApi';
import { useAutoAssignClassMutation } from '@/api/studentsApi';
import type { AutoAssignClassResult } from '@/types/student.types';

interface AutoAssignClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // To refresh class list
}

const AutoAssignClassModal = ({ isOpen, onClose, onSuccess }: AutoAssignClassModalProps) => {
    const [form] = Form.useForm();
    const [step, setStep] = useState<'input' | 'confirm' | 'result'>('input');
    const [previewData, setPreviewData] = useState<any>(null);
    const [resultData, setResultData] = useState<AutoAssignClassResult | null>(null);
    
    // Search state for SubMajor (custom list logic)
    const [selectedSubMajorId, setSelectedSubMajorId] = useState<string | null>(null);

    // APIs
    const { data: subMajorsData, isLoading: isLoadingSubMajors } = useGetSubMajorsQuery({ page: 1, pageSize: 100 });
    const [autoAssign, { isLoading: isAssigning }] = useAutoAssignClassMutation();

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedSubMajorId) {
                toast.error('Please select a SubMajor');
                return;
            }

            setPreviewData({
                ...values,
                subMajorId: selectedSubMajorId
            });
            setStep('confirm');
        } catch (error) {
            // Form validation failed
        }
    };

    const handleConfirm = async () => {
        if (!previewData) return;

        try {
            // Call API
            const result = await autoAssign({
                subMajorId: previewData.subMajorId,
                cohort: previewData.cohort,
                maxStudentsPerClass: previewData.maxStudentsPerClass
            }).unwrap();

            setResultData(result);
            setStep('result');
            toast.success('Auto-assignment completed successfully!');
            onSuccess(); // Refresh parent table
        } catch (error: any) {
            toast.error('Failed to auto-assign: ' + (error?.data?.message || error.message));
        }
    };

    const handleClose = () => {
        form.resetFields();
        setStep('input');
        setPreviewData(null);
        setResultData(null);
        setSelectedSubMajorId(null);
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title={
                <div className="flex items-center gap-2 text-orange-600">
                    <Wand2 size={24} />
                    <span className="text-xl font-bold">Auto Assign Classes</span>
                </div>
            }
            footer={null}
            width={600}
            maskClosable={false}
        >
            {step === 'input' && (
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ maxStudentsPerClass: 30 }}
                    className="mt-4"
                >


                    {/* SubMajor Custom List Selection */}
                    <div className="space-y-2 mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Sub Major <span className="text-red-500">*</span>
                        </label>
                        
                        {/* Radio list */}
                        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                            {isLoadingSubMajors ? (
                                <p className="text-sm text-gray-500">Loading sub-majors...</p>
                            ) : (
                                <div className="space-y-2">
                                    {subMajorsData?.items
                                        ?.map((sm) => (
                                            <label
                                                key={sm.id}
                                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="subMajorSelect"
                                                    value={sm.id}
                                                    checked={selectedSubMajorId === sm.id}
                                                    onChange={() => setSelectedSubMajorId(sm.id)}
                                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {sm.code}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    - {sm.name}
                                                </span>
                                            </label>
                                        ))}
                                </div>
                            )}
                        </div>
                        {selectedSubMajorId && (
                            <p className="text-xs text-green-600 font-medium">Selected: {subMajorsData?.items?.find(s => s.id === selectedSubMajorId)?.code}</p>
                        )}
                    </div>

                    <Form.Item
                        name="cohort"
                        label="Cohort"
                        rules={[{ required: true, message: 'Please enter Cohort' }]}
                    >
                        <Input placeholder="e.g. 18 (K18), 19 (K19)" />
                    </Form.Item>

                    <Form.Item
                        name="maxStudentsPerClass"
                        label="Max Students"
                        rules={[{ required: true, message: 'Please enter class size' }]}
                    >
                        <InputNumber min={10} max={100} className="w-full" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="primary" onClick={handleNext} className="bg-orange-500 hover:bg-orange-600">
                            Next
                        </Button>
                    </div>
                </Form>
            )}

            {step === 'confirm' && (
                <div className="mt-4 space-y-4">
                    <Alert
                        message="Warning: Irreversible Action"
                        description="This action will create multiple classes and database records. Please verify the parameters below."
                        type="warning"
                        showIcon
                        icon={<AlertTriangle />}
                        className="border-orange-200 bg-orange-50"
                    />

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Sub Major:</span>
                            <span className="font-medium">
                                {subMajorsData?.items?.find(s => s.id === previewData.subMajorId)?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cohort:</span>
                            <span className="font-medium">{previewData.cohort}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Max Students:</span>
                            <span className="font-medium">{previewData.maxStudentsPerClass}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setStep('input')}>Back</Button>
                        <Button 
                            type="primary" 
                            danger 
                            onClick={handleConfirm} 
                            loading={isAssigning}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Confirm & Generate
                        </Button>
                    </div>
                </div>
            )}

            {step === 'result' && resultData && (
                <div className="mt-4 text-center space-y-6">
                    <div className="flex flex-col items-center justify-center text-green-600 space-y-2">
                        <CheckCircle size={64} />
                        <h3 className="text-2xl font-bold">Success!</h3>
                        <p className="text-gray-600">{resultData.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{resultData.totalClassesCreated}</div>
                            <div className="text-sm text-gray-500">Classes Created</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{resultData.totalStudentsAssigned}</div>
                            <div className="text-sm text-gray-500">Students Assigned</div>
                        </div>
                    </div>

                    {resultData.classSummaries?.length > 0 && (
                        <div className="text-left mt-4">
                            <h4 className="font-medium mb-2 text-gray-700">Generated Classes:</h4>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                                <List
                                    size="small"
                                    dataSource={resultData.classSummaries}
                                    renderItem={item => (
                                        <List.Item>
                                            <div className="flex justify-between w-full">
                                                <span className="font-bold text-blue-600">{item.classCode}</span>
                                                <div className="flex gap-2">
                                                    <Tag>{item.subMajorCode}</Tag>
                                                    <Tag color="orange">K{item.cohort}</Tag>
                                                    <span className="text-gray-500">{item.studentCount} students</span>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <Button type="primary" onClick={handleClose} className="w-full mt-4">
                        Close
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default AutoAssignClassModal;
