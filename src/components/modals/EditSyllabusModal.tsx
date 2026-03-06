import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, Button, Select, Switch, InputNumber } from 'antd';
import { useUpdateSyllabusMutation } from '@/api/syllabusApi';
import { useGetSubjectsQuery } from '@/api/subjectsApi';
import type { Syllabus } from '@/types/syllabus.types';

const { TextArea } = Input;

interface EditSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    syllabus: Syllabus | null;
}

export default function EditSyllabusModal({ isOpen, onClose, syllabus }: EditSyllabusModalProps) {
    const [formData, setFormData] = useState({
        subjectId: '',
        syllabusName: '',
        syllabusEnglish: '',
        studentTasks: '',
        tools: '',
        scoringScale: 10,
        isApproved: false
    });

    const [subjectSearch, setSubjectSearch] = useState('');
    const [updateSyllabus, { isLoading }] = useUpdateSyllabusMutation();

    const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery({
        page: 1,
        pageSize: 50,
        searchTerm: subjectSearch
    }, {
        skip: !isOpen || (subjectSearch.length < 2 && !formData.subjectId)
    });

    const subjectsList = subjectsData?.items || [];

    useEffect(() => {
        if (isOpen && syllabus) {
            setFormData({
                subjectId: syllabus.subjectId,
                syllabusName: syllabus.syllabusName,
                syllabusEnglish: syllabus.syllabusEnglish,
                studentTasks: syllabus.studentTasks,
                tools: syllabus.tools,
                scoringScale: syllabus.scoringScale,
                isApproved: syllabus.isApproved
            });
            if (syllabus.subjectCode && syllabus.subjectName) {
                // Ensure the initial subject is in the list if search results are empty or haven't loaded
                setSubjectSearch(syllabus.subjectCode);
            }
        }
    }, [isOpen, syllabus]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectSubject = (value: string) => {
        setFormData(prev => ({ ...prev, subjectId: value }));
    };

    const handleSearchSubject = (value: string) => {
        setSubjectSearch(value);
    };

    const handleScaleChange = (value: number | null) => {
        setFormData(prev => ({ ...prev, scoringScale: value || 0 }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isApproved: checked }));
    };

    const handleSubmit = async () => {
        if (!syllabus) return;
        if (!formData.subjectId) {
            toast.error('Please select a subject');
            return;
        }

        if (formData.scoringScale > 10) {
            toast.error('Scoring Scale cannot exceed 10');
            return;
        }

        try {
            await updateSyllabus({
                id: syllabus.id,
                ...formData
            }).unwrap();
            toast.success('Syllabus updated successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to update syllabus: ' + ((error as any)?.data?.message || (error as any)?.message));
        }
    };

    // Prepare options for Select, ensuring the current subject is included
    const selectOptions = subjectsList.map((s) => ({
        label: `${s.code} - ${s.name}`,
        value: s.id,
    }));

    // If we have an existing syllabus subject but it's not in the search results, add it
    if (syllabus && !selectOptions.find(o => o.value === syllabus.subjectId)) {
        selectOptions.unshift({
            label: `${syllabus.subjectCode} - ${syllabus.subjectName}`,
            value: syllabus.subjectId
        });
    }

    return (
        <Modal
            title="Edit Syllabus"
            open={isOpen}
            onCancel={onClose}
            width={1000}
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
                    Save Changes
                </Button>
            ]}
        >
            <div className="grid gap-6 py-6">
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Subject *</span>
                        <Select
                            showSearch
                            value={formData.subjectId}
                            placeholder="Type to search subjects (min 2 chars)..."
                            defaultActiveFirstOption={false}
                            showArrow={false}
                            filterOption={false}
                            onSearch={handleSearchSubject}
                            onChange={handleSelectSubject}
                            notFoundContent={isLoadingSubjects ? 'Searching...' : 'No subjects found'}
                            size="large"
                            className="w-full"
                            options={selectOptions}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Syllabus Name *</span>
                        <Input
                            id="syllabusName"
                            name="syllabusName"
                            value={formData.syllabusName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            size="large"
                            maxLength={200}
                        />
                    </div>
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">English Name *</span>
                        <Input
                            id="syllabusEnglish"
                            name="syllabusEnglish"
                            value={formData.syllabusEnglish}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            size="large"
                            maxLength={200}
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <span className="block text-sm font-semibold text-gray-700">Student Tasks *</span>
                    <TextArea
                        id="studentTasks"
                        name="studentTasks"
                        value={formData.studentTasks}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        rows={3}
                        maxLength={2000}
                    />
                </div>

                <div className="grid gap-2">
                    <span className="block text-sm font-semibold text-gray-700">Tools *</span>
                    <TextArea
                        id="tools"
                        name="tools"
                        value={formData.tools}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        rows={2}
                        maxLength={1000}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="grid gap-2">
                        <span className="block text-sm font-semibold text-gray-700">Scoring Scale *</span>
                        <InputNumber
                            id="scoringScale"
                            value={formData.scoringScale}
                            onChange={handleScaleChange}
                            min={1}
                            max={10}
                            size="large"
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                        <Switch
                            id="isApproved"
                            checked={formData.isApproved}
                            onChange={handleSwitchChange}
                            disabled={isLoading}
                        />
                        <span className="cursor-pointer text-sm font-semibold text-gray-700">Is Approved?</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
