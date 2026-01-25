import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useUpdateSyllabusMutation } from '@/api/syllabusApi';
import { useGetSubjectsQuery } from '@/api/subjectsApi';
import type { Syllabus } from '@/types/syllabus.types';
import type { Subject } from '@/types/subject.types';

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

    // Subject search state
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [updateSyllabus, { isLoading }] = useUpdateSyllabusMutation();

    // Search subjects (only when user types at least 2 characters)
    const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery({
        page: 1,
        pageSize: 20,
        searchTerm: subjectSearch
    }, {
        skip: !isOpen || subjectSearch.length < 2
    });

    const subjectsList = subjectsData?.items || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load existing syllabus data when modal opens
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
            // Set search field to show existing subject
            if (syllabus.subjectCode && syllabus.subjectName) {
                setSubjectSearch(`${syllabus.subjectCode} - ${syllabus.subjectName}`);
                setSelectedSubject({ id: syllabus.subjectId, code: syllabus.subjectCode, name: syllabus.subjectName } as Subject);
            }
        } else if (!isOpen) {
            // Reset when modal closes
            setSubjectSearch('');
            setSelectedSubject(null);
            setShowDropdown(false);
        }
    }, [isOpen, syllabus]);

    // Handle subject selection from dropdown
    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        setFormData(prev => ({ ...prev, subjectId: subject.id }));
        setSubjectSearch(`${subject.code} - ${subject.name}`);
        setShowDropdown(false);
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSubjectSearch(value);
        setShowDropdown(value.length >= 2);
        if (value !== `${selectedSubject?.code} - ${selectedSubject?.name}`) {
            setSelectedSubject(null);
            setFormData(prev => ({ ...prev, subjectId: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!syllabus) return;
        if (!formData.subjectId) {
            toast.error('Please select a subject');
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                name === 'scoringScale' ? Number(value) : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Syllabus</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Subject Search Autocomplete */}
                        <div className="col-span-1 md:col-span-2" ref={searchRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={subjectSearch}
                                    onChange={handleSearchChange}
                                    onFocus={() => subjectSearch.length >= 2 && setShowDropdown(true)}
                                    placeholder="Type to search subjects (min 2 chars)..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F37022]"
                                    required={!selectedSubject}
                                />

                                {/* Dropdown results */}
                                {showDropdown && subjectSearch.length >= 2 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {isLoadingSubjects ? (
                                            <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                                        ) : subjectsList.length > 0 ? (
                                            subjectsList.map((subject) => (
                                                <button
                                                    key={subject.id}
                                                    type="button"
                                                    onClick={() => handleSubjectSelect(subject)}
                                                    className="w-full text-left px-3 py-2 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-medium text-gray-900">{subject.code}</div>
                                                    <div className="text-sm text-gray-600">{subject.name}</div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-gray-500">No subjects found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {selectedSubject && (
                                <p className="text-xs text-green-600 mt-1">
                                    ✓ Selected: {selectedSubject.code} - {selectedSubject.name}
                                </p>
                            )}
                        </div>

                        {/* Names */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus Name</label>
                            <input
                                type="text"
                                name="syllabusName"
                                value={formData.syllabusName}
                                onChange={handleChange}
                                maxLength={200}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F37022]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                            <input
                                type="text"
                                name="syllabusEnglish"
                                value={formData.syllabusEnglish}
                                onChange={handleChange}
                                maxLength={200}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F37022]"
                                required
                            />
                        </div>

                        {/* Student Tasks */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Tasks</label>
                            <textarea
                                name="studentTasks"
                                value={formData.studentTasks}
                                onChange={handleChange}
                                maxLength={2000}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F37022]"
                                required
                            />
                        </div>

                        {/* Tools */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tools</label>
                            <textarea
                                name="tools"
                                value={formData.tools}
                                onChange={handleChange}
                                maxLength={1000}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F37022]"
                                required
                            />
                        </div>

                        {/* Scale & IsApproved */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Scoring Scale</label>
                            <input
                                type="number"
                                name="scoringScale"
                                value={formData.scoringScale}
                                onChange={handleChange}
                                min={1}
                                max={100}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F37022]"
                                required
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <input
                                type="checkbox"
                                name="isApproved"
                                id="editIsApproved"
                                checked={formData.isApproved}
                                onChange={handleChange}
                                className="h-4 w-4 text-[#F37022] focus:ring-[#F37022] border-gray-300 rounded"
                            />
                            <label htmlFor="editIsApproved" className="ml-2 block text-sm text-gray-900">
                                Is Approved?
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 option-transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#F37022] rounded-md hover:bg-[#E56011] option-transition disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
