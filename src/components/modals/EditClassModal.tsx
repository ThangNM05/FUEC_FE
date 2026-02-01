import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select } from 'antd';

import { useCreateClassMutation, useUpdateClassMutation } from '@/api/classesApi';
import { useGetTeachersQuery } from '@/api/teachersApi';
import { useGetSubjectsQuery } from '@/api/subjectsApi';
import { useGetSemestersQuery } from '@/api/semestersApi';
import type { Class, CreateClassRequest, UpdateClassRequest } from '@/types/class.types';

interface EditClassModalProps {
    classData: Class | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditClassModal({ classData, isOpen, onClose }: EditClassModalProps) {
    const isEditing = !!classData;
    const [formData, setFormData] = useState({
        classCode: '',
        subjectId: undefined as string | undefined,
        semesterId: undefined as string | undefined,
        teacherId: '',
    });

    // Fetch dropdown data
    const { data: teachersData } = useGetTeachersQuery({ page: 1, pageSize: 100 });
    const { data: subjectsData } = useGetSubjectsQuery({ page: 1, pageSize: 100 });
    const { data: semestersData } = useGetSemestersQuery({ page: 1, pageSize: 100 });

    const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
    const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (classData) {
            setFormData({
                classCode: classData.classCode || '',
                subjectId: classData.subjectId,
                semesterId: classData.semesterId,
                teacherId: classData.teacherId || '',
            });
        } else {
            setFormData({
                classCode: '',
                subjectId: undefined,
                semesterId: undefined,
                teacherId: '',
            });
        }
    }, [classData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string, value: string | undefined) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.classCode.trim()) {
            toast.error('Class code is required');
            return;
        }
        if (!formData.teacherId) {
            toast.error('Teacher is required');
            return;
        }

        try {
            if (isEditing && classData) {
                const updatePayload: UpdateClassRequest = {
                    id: classData.id,
                    classCode: formData.classCode,
                    subjectId: formData.subjectId,
                    semesterId: formData.semesterId,
                    teacherId: formData.teacherId,
                };
                await updateClass(updatePayload).unwrap();
                toast.success(`Class "${formData.classCode}" updated successfully!`);
            } else {
                const createPayload: CreateClassRequest = {
                    classCode: formData.classCode,
                    subjectId: formData.subjectId,
                    semesterId: formData.semesterId,
                    teacherId: formData.teacherId,
                };
                await createClass(createPayload).unwrap();
                toast.success(`Class "${formData.classCode}" created successfully!`);
            }
            onClose();
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.message;
            toast.error(errorMessage ? `${isEditing ? 'Update' : 'Create'} failed: ${errorMessage}` : 'An error occurred. Please try again later.');
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={isEditing ? 'Edit Class' : 'Add New Class'}
            width={800}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none"
                >
                    {isEditing ? 'Save' : 'Create'}
                </Button>
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Class Code <span className="text-red-500">*</span>
                    </span>
                    <Input
                        id="classCode"
                        name="classCode"
                        value={formData.classCode}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="e.g. SE18B04, AI19A01..."
                        size="large"
                    />
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Subject
                    </span>
                    <Select
                        value={formData.subjectId}
                        onChange={(value) => handleSelectChange('subjectId', value)}
                        disabled={isLoading}
                        placeholder="Select subject"
                        size="large"
                        className="w-full"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {subjectsData?.items?.map((subject) => (
                            <Select.Option key={subject.id} value={subject.id}>
                                {subject.code} - {subject.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Semester
                    </span>
                    <Select
                        value={formData.semesterId}
                        onChange={(value) => handleSelectChange('semesterId', value)}
                        disabled={isLoading}
                        placeholder="Select semester"
                        size="large"
                        className="w-full"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {semestersData?.items?.map((semester) => (
                            <Select.Option key={semester.id} value={semester.id}>
                                {semester.semesterCode}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <span className="text-right font-semibold text-gray-700">
                        Teacher <span className="text-red-500">*</span>
                    </span>
                    <Select
                        value={formData.teacherId || undefined}
                        onChange={(value) => handleSelectChange('teacherId', value)}
                        disabled={isLoading}
                        placeholder="Select teacher"
                        size="large"
                        className="w-full"
                        showSearch
                        optionFilterProp="children"
                    >
                        {teachersData?.items?.map((teacher) => (
                            <Select.Option key={teacher.id} value={teacher.id}>
                                {teacher.teacherCode} - {teacher.accountFullName}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>
        </Modal>
    );
}
