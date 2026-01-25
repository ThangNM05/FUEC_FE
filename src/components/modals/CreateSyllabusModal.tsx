import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal, Input, InputNumber, AutoComplete, Button } from 'antd';

const { TextArea } = Input;

import { useCreateSyllabusMutation } from '@/api/syllabusApi';
import { useGetSubjectsQuery } from '@/api/subjectsApi';
import type { Subject } from '@/types/subject.types';
import { Label } from '@/components/ui/label';

interface CreateSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateSyllabusModal({ isOpen, onClose }: CreateSyllabusModalProps) {
    const [formData, setFormData] = useState({
        subjectId: '',
        syllabusName: '',
        syllabusEnglish: '',
        studentTasks: '',
        tools: '',
        scoringScale: 10
    });

    // Subject search state
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    const [createSyllabus, { isLoading }] = useCreateSyllabusMutation();

    // Search subjects (only when user types at least 2 characters)
    const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery({
        page: 1,
        pageSize: 20,
        searchTerm: subjectSearch
    }, {
        skip: !isOpen || subjectSearch.length < 2
    });

    const subjectsList = subjectsData?.items || [];

    // Reset form and search when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                subjectId: '',
                syllabusName: '',
                syllabusEnglish: '',
                studentTasks: '',
                tools: '',
                scoringScale: 10
            });
            setSubjectSearch('');
            setSelectedSubject(null);
        }
    }, [isOpen]);

    // Handle subject selection from autocomplete
    const handleSubjectSelect = (value: string, option: any) => {
        const subject = option.subject;
        setSelectedSubject(subject);
        setFormData(prev => ({ ...prev, subjectId: subject.id }));
        setSubjectSearch(value);
    };

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSubjectSearch(value);
        if (value !== `${selectedSubject?.code} - ${selectedSubject?.name}`) {
            setSelectedSubject(null);
            setFormData(prev => ({ ...prev, subjectId: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.subjectId) {
            toast.error('Please select a subject');
            return;
        }

        if (!formData.syllabusName || !formData.syllabusEnglish || !formData.studentTasks || !formData.tools) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await createSyllabus({ ...formData, isApproved: false } as any).unwrap();
            toast.success('Syllabus created successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to create syllabus: ' + ((error as any)?.data?.message || (error as any)?.message));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (value: number | null) => {
        setFormData(prev => ({
            ...prev,
            scoringScale: value || 10
        }));
    };

    // Prepare autocomplete options
    const autocompleteOptions = subjectsList.map((subject) => ({
        value: `${subject.code} - ${subject.name}`,
        label: (
            <div>
                <div className="font-medium">{subject.code}</div>
                <div className="text-sm text-gray-600">{subject.name}</div>
            </div>
        ),
        subject: subject
    }));

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title="Add New Syllabus"
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
                >
                    Create Syllabus
                </Button>
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Subject Search Autocomplete */}
                <div className="col-span-1 md:col-span-2">
                    <Label className="mb-2 block">Subject <span className="text-red-500">*</span></Label>
                    <AutoComplete
                        value={subjectSearch}
                        onChange={handleSearchChange}
                        onSelect={handleSubjectSelect}
                        options={autocompleteOptions}
                        placeholder="Type to search subjects (min 2 chars)..."
                        size="large"
                        className="w-full"
                        notFoundContent={
                            isLoadingSubjects ? 'Searching...' :
                                subjectSearch.length < 2 ? 'Type at least 2 characters' :
                                    'No subjects found'
                        }
                    />
                    {selectedSubject && (
                        <p className="text-xs text-green-600 mt-1">
                            ✓ Selected: {selectedSubject.code} - {selectedSubject.name}
                        </p>
                    )}
                </div>

                {/* Names */}
                <div>
                    <Label className="mb-2 block">Syllabus Name <span className="text-red-500">*</span></Label>
                    <Input
                        name="syllabusName"
                        value={formData.syllabusName}
                        onChange={handleChange}
                        maxLength={200}
                        size="large"
                        placeholder="Enter syllabus name"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">English Name <span className="text-red-500">*</span></Label>
                    <Input
                        name="syllabusEnglish"
                        value={formData.syllabusEnglish}
                        onChange={handleChange}
                        maxLength={200}
                        size="large"
                        placeholder="Enter English name"
                    />
                </div>

                {/* Student Tasks */}
                <div className="col-span-1 md:col-span-2">
                    <Label className="mb-2 block">Student Tasks <span className="text-red-500">*</span></Label>
                    <TextArea
                        name="studentTasks"
                        value={formData.studentTasks}
                        onChange={handleChange}
                        maxLength={2000}
                        rows={3}
                        size="large"
                        placeholder="Describe student tasks..."
                    />
                </div>

                {/* Tools */}
                <div className="col-span-1 md:col-span-2">
                    <Label className="mb-2 block">Tools <span className="text-red-500">*</span></Label>
                    <TextArea
                        name="tools"
                        value={formData.tools}
                        onChange={handleChange}
                        maxLength={1000}
                        rows={2}
                        size="large"
                        placeholder="List required tools..."
                    />
                </div>

                {/* Scoring Scale */}
                <div>
                    <Label className="mb-2 block">Scoring Scale (1-100)</Label>
                    <InputNumber
                        value={formData.scoringScale}
                        onChange={handleNumberChange}
                        min={1}
                        max={100}
                        size="large"
                        className="w-full"
                    />
                </div>
            </div>
        </Modal>
    );
}
