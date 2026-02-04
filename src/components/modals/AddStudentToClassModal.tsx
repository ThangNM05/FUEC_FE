import { useState, useCallback, useMemo } from 'react';
import { Modal, Button } from 'antd';
import { toast } from 'sonner';
import { useAddStudentClassMutation, useGetIneligibleStudentIdsQuery } from '@/api/classDetailsApi';
import { useGetStudentsQuery } from '@/api/studentsApi';

interface AddStudentToClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    classCode?: string;
}

const AddStudentToClassModal = ({ isOpen, onClose, classId, classCode }: AddStudentToClassModalProps) => {
    const [searchTerm, setSearchTerm] = useState(''); // API Search
    const [inputValue, setInputValue] = useState(''); // UI Input
    const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
    
    // API Hooks
    const [addStudent, { isLoading: isSubmitting }] = useAddStudentClassMutation();
    const { data: studentsData, isFetching: isLoadingStudents } = useGetStudentsQuery({ 
        page: 1, 
        pageSize: 50,
        searchTerm: searchTerm
    });
    
    // Fetch ineligible student IDs from backend
    const { data: ineligibleIds = [] } = useGetIneligibleStudentIdsQuery(classId, {
        skip: !classId || !isOpen
    });

    const filteredStudents = useMemo(() => {
        if (!studentsData?.items) return [];
        return studentsData.items.filter((s: any) => !ineligibleIds.includes(s.id));
    }, [studentsData, ineligibleIds]);

    // Simple debounce for search API
    const debounce = (func: (val: string) => void, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (val: string) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(val), wait);
        };
    };

    const triggerApiSearch = useCallback(debounce((val: string) => setSearchTerm(val), 500), []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        triggerApiSearch(val);
    };

    const selectedStudentText = useMemo(() => {
        if (!selectedStudentId || !filteredStudents) return '';
        const student = filteredStudents.find((s: any) => s.id === selectedStudentId);
        // If not found in current list (pagination), keep ID or empty? 
        // For now, if searching changes list, selection might disappear from view but ID is kept.
        // We can try to look it up, but without persistent "all students" it's hard. 
        // Assuming user selects from current view.
        return student ? `${student.studentCode} - ${student.accountFullName || student.fullName || 'No Name'}` : 'Selected (Hidden)';
    }, [selectedStudentId, filteredStudents]);

    const handleSubmit = async () => {
        if (!selectedStudentId) {
            toast.error('Please select a student');
            return;
        }

        try {
            await addStudent({
                classId,
                studentId: selectedStudentId
            }).unwrap();
            
            toast.success('Student added successfully');
            setSelectedStudentId(undefined);
            onClose();
        } catch (error: any) {
             const errorMsg = error?.data?.result || error?.data?.message || 'Failed to add student';
            toast.error(errorMsg);
        }
    };

    return (
        <Modal
            open={isOpen}
            title={`Add Student to ${classCode || 'Class'}`}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} loading={isSubmitting} disabled={!selectedStudentId}>
                    Add Student
                </Button>
            ]}
        >
             <div className="space-y-4 py-2">
                {/* Custom List UI mimicking Subject Selection */}
                <div className="space-y-2">
                    {/* Selected Preview */}
                    <div className="relative">
                            <input
                            type="text"
                            readOnly
                            value={selectedStudentText !== 'Selected (Hidden)' ? selectedStudentText : (selectedStudentId ? 'Student selected' : '')}
                            placeholder="No student selected"
                            className="w-full px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 font-medium focus:outline-none"
                        />
                    </div>

                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={inputValue}
                        onChange={handleSearchChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                    />

                    {/* Checkbox/Radio List */}
                    <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto bg-white">
                        {isLoadingStudents && filteredStudents.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Loading students...</p>
                        ) : (
                            <div className="space-y-2">
                                {filteredStudents.map((s: any) => (
                                    <label
                                        key={s.id}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentId === s.id}
                                            onChange={() => setSelectedStudentId(s.id)}
                                            className="w-5 h-5 cursor-pointer appearance-none border-2 border-gray-300 rounded checked:bg-orange-600 checked:border-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none relative
                                            before:content-['✓'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-white before:text-sm before:font-bold before:opacity-0 checked:before:opacity-100"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {s.studentCode}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            - {s.accountFullName || s.fullName || 'No Name'}
                                        </span>
                                        {/* Status Tag if needed */}
                                        {/* <Tag color={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Tag> */}
                                    </label>
                                ))}
                                
                                {(!studentsData?.items || studentsData.items.length === 0) && (
                                    <p className="text-sm text-gray-500 text-center py-4">No students found</p>
                                )}
                            </div>
                        )}
                    </div>
                     <p className="text-xs text-gray-500 text-right">
                        Showing top {studentsData?.items?.length || 0} results
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default AddStudentToClassModal;
