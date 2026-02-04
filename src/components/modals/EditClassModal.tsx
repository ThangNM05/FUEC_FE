import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

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
        subjectIds: [] as string[],  // Changed to array for multiple subjects
        semesterId: undefined as string | undefined,
    });
    const [subjectSearch, setSubjectSearch] = useState('');  // Search term for subjects

    // Fetch dropdown data - use large pageSize to get all items
    // Fetch dropdown data - use large pageSize to get all items
    const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery({ page: 1, pageSize: 500 });
    const { data: semestersData } = useGetSemestersQuery({ page: 1, pageSize: 100 });



    // Get current/default semester
    const currentSemester = useMemo(() => {
        return semestersData?.items?.find(s => s.isDefault) || semestersData?.items?.[0];
    }, [semestersData]);

    // Get text representation of selected subjects
    const selectedSubjectsText = useMemo(() => {
        if (!subjectsData?.items || formData.subjectIds.length === 0) return '';
        return subjectsData.items
            .filter(s => formData.subjectIds.includes(s.id))
            .map(s => s.code)
            .join(', ');
    }, [subjectsData, formData.subjectIds]);

    const [createClassMutation, { isLoading: isCreating }] = useCreateClassMutation();
    const [updateClassMutation, { isLoading: isUpdating }] = useUpdateClassMutation();
    const [isLoading, setIsLoading] = useState(false); // Local loading state for form submission
    const toastShownRef = useRef(false); // Ref to prevent multiple toasts

    useEffect(() => {
        if (isEditing && classData) {
            setFormData({
                classCode: classData.classCode || '',
                subjectIds: classData.subjects?.map(s => s.id) || [],  // Map subjects to IDs
                semesterId: classData.semesterId,
            });
        } else if (!isEditing && currentSemester) {
            setFormData({
                classCode: '',
                subjectIds: [],
                semesterId: currentSemester.id,
            });
        }
    }, [classData, isEditing, currentSemester]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string, value: string | string[] | undefined) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.classCode || formData.subjectIds.length === 0) {
            toast.error('Please fill in all required fields and select at least one subject');
            return;
        }

        setIsLoading(true);
        toastShownRef.current = false; // Reset toast ref for new submission attempt
        try {
            const payload = {
                classCode: formData.classCode,
                subjectIds: formData.subjectIds,  // Send array of subject IDs
                semesterId: formData.semesterId || currentSemester?.id,
            };

            if (isEditing && classData) {
                await updateClassMutation({ id: classData.id, ...payload }).unwrap();
                toast.success('Class updated successfully');
            } else {
                await createClassMutation(payload).unwrap();
                toast.success('Class created successfully');
            }
            onClose();
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to save class';
            if (!toastShownRef.current) {
                toast.error(errorMessage);
                toastShownRef.current = true;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-3">
                    <span>{isEditing ? 'Edit Class' : 'Add New Class'}</span>
                    {currentSemester && (
                        <Tag 
                            icon={<CalendarOutlined />} 
                            color="orange"
                            className="text-sm font-normal"
                        >
                            {currentSemester.semesterCode}
                        </Tag>
                    )}
                </div>
            }
            width={700}
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
                    {isEditing ? 'Save Changes' : 'Create Class'}
                </Button>
            ]}
        >
            <div className="space-y-5 py-4">
                {/* Current Semester Banner */}
                {!isEditing && currentSemester && (
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <CalendarOutlined className="text-orange-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Current Semester</p>
                            <p className="font-semibold text-orange-700 text-lg">{currentSemester.semesterCode}</p>
                        </div>
                    </div>
                )}

                {/* Class Code */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Class Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="classCode"
                        name="classCode"
                        value={formData.classCode}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="e.g. SE18B04, AI19A01..."
                        size="large"
                        className="rounded-lg"
                    />
                </div>

                {/* Subjects - Checkbox List with Search */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Subjects <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Selected subjects preview */}
                    <div className="relative">
                         <input
                            type="text"
                            readOnly
                            value={selectedSubjectsText}
                            placeholder="No subjects selected"
                            className="w-full px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 font-medium focus:outline-none mb-2"
                        />
                    </div>

                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                    />
                    {/* Checkbox list */}
                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                        {isLoadingSubjects ? (
                            <p className="text-sm text-gray-500">Loading subjects...</p>
                        ) : (
                            <div className="space-y-2">
                                {subjectsData?.items
                                    ?.filter(subject => 
                                        subject.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
                                        subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
                                    )
                                    .map((subject) => (
                                        <label
                                            key={subject.id}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                value={subject.id}
                                                checked={formData.subjectIds.includes(subject.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const newSubjectIds = checked
                                                        ? [...formData.subjectIds, subject.id]
                                                        : formData.subjectIds.filter(id => id !== subject.id);
                                                    handleSelectChange('subjectIds', newSubjectIds);
                                                }}
                                                disabled={isLoading}
                                                className="w-5 h-5 cursor-pointer appearance-none border-2 border-gray-300 rounded checked:bg-orange-600 checked:border-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none relative
                                                before:content-['✓'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-white before:text-sm before:font-bold before:opacity-0 checked:before:opacity-100"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                {subject.code}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                - {subject.name}
                                            </span>
                                        </label>
                                    ))}
                                {subjectsData?.items?.filter(subject => 
                                    subject.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
                                    subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
                                ).length === 0 && (
                                    <p className="text-sm text-gray-500">No subjects found</p>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        {formData.subjectIds.length} subject(s) selected
                    </p>
                </div>
            </div>
        </Modal>
    );
}
