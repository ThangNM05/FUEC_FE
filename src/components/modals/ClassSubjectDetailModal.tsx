import { useState, useEffect } from 'react';
import { Modal, Tabs, Button, Select, Table, Tag, Space, Popconfirm } from 'antd';
import { UserPlus, UserMinus, Trash2, ShieldCheck, FileSpreadsheet, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
    useGetClassSubjectsQuery, 
    useGetClassSubjectTeachersQuery,
    useAddClassSubjectTeacherMutation,
    useDeleteClassSubjectTeacherMutation,
    useGetStudentClassesQuery,
    // useAddStudentClassMutation,
    useRemoveStudentClassMutation
} from '@/api/classDetailsApi';
import { useGetTeachersQuery } from '@/api/teachersApi';
import AddStudentToClassModal from './AddStudentToClassModal';
import type { Class, Subject } from '@/types/class.types';

interface ClassSubjectDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    classData: Class | null;
    subject: Subject | null; // The clicked subject
}

const { TabPane } = Tabs;
const { Option } = Select;

const ClassSubjectDetailModal = ({ isOpen, onClose, classData, subject }: ClassSubjectDetailModalProps) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
    
    // 1. Get ClassSubject ID
    const { data: classSubjectData } = useGetClassSubjectsQuery(
        { classId: classData?.id, subjectId: subject?.id },
        { skip: !classData || !subject }
    );
    const classSubjectId = classSubjectData?.items?.[0]?.id;

    // 2. Get Assigned Teachers
    const { data: teachersAssignedData, refetch: refetchTeachers } = useGetClassSubjectTeachersQuery(
        { classSubjectId },
        { skip: !classSubjectId }
    );

    // 3. Get All Teachers (for dropdown)
    const { data: allTeachersData } = useGetTeachersQuery({ page: 1, pageSize: 100 });

    // 4. Get Students in Class
    const { data: studentsData } = useGetStudentClassesQuery(
        { classId: classData?.id || '' },
        { skip: !classData }
    );

    // Mutations
    const [addTeacher, { isLoading: isAddingTeacher }] = useAddClassSubjectTeacherMutation();
    const [deleteTeacher, { isLoading: isDeletingTeacher }] = useDeleteClassSubjectTeacherMutation();
    const [removeStudent, { isLoading: isRemovingStudent }] = useRemoveStudentClassMutation();

    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState('');

    // Selected teacher text functionality
    const selectedTeacherText = (() => {
        if (!selectedTeacherId || !allTeachersData?.items) return '';
        const teacher = allTeachersData.items.find(t => t.id === selectedTeacherId);
        return teacher ? `${teacher.teacherCode} - ${teacher.accountFullName || teacher.teacherName}` : '';
    })();



    // Handlers
    const handleAddTeacher = async () => {
        if (!classSubjectId || !selectedTeacherId) return;
        try {
            await addTeacher({
                classSubjectId,
                teacherId: selectedTeacherId,
                isPrimary: false // Default
            }).unwrap();
            toast.success('Teacher assigned successfully');
            setSelectedTeacherId(undefined);
            setTeacherSearch('');
        } catch (error: any) {
            toast.error('Failed to assign teacher: ' + (error?.data?.message || error.message));
        }
    };

    const handleRemoveTeacher = async (id: string) => {
        console.log('[DEBUG] Deleting Teacher with ClassSubjectTeacher ID:', id);
        try {
            await deleteTeacher(id).unwrap();
            toast.success('Teacher removed successfully');
        } catch (error: any) {
            console.error("Delete Teacher Error:", error);
            toast.error('Failed to remove teacher: ' + (error?.data?.message || error?.message || 'Unknown error'));
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        console.log('[DEBUG] Deleting Student with StudentId:', studentId, 'ClassId:', classData?.id);
        if (!classData?.id) return;
        try {
            await removeStudent({ classId: classData.id, studentId }).unwrap();
            toast.success('Student removed from class');
        } catch (error: any) {
            toast.error('Failed to remove student: ' + (error?.data?.message || 'Unknown error'));
        }
    };

    const handleAutoAssign = () => {
        // Mock functionality
        toast.info('Auto-assigning students... (This is a static demo feature)');
        setTimeout(() => toast.success('30 Students assigned successfully!'), 1000);
    };

    const handleImportExcel = () => {
        toast.info('Import Excel feature coming soon!');
    };

    // Columns
    const teacherColumns = [
        { title: 'Teacher Code', dataIndex: 'teacherCode', key: 'teacherCode' },
        { title: 'Full Name', dataIndex: 'teacherName', key: 'teacherName' },
        {
            title: 'Actions',
            key: 'action',
            render: (_: any, record: any) => (
                <Button 
                    type="text" 
                    danger 
                    icon={<Trash2 size={16} />} 
                    onClick={() => {
                        if (window.confirm('Remove this teacher?')) {
                            handleRemoveTeacher(record.id);
                        }
                    }}
                />
            )
        }
    ];

    const studentColumns = [
        { title: 'Student Code', dataIndex: 'studentCode', key: 'studentCode' },
        { title: 'Student Name', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
        {
            title: 'Actions',
            key: 'action',
            render: (_: any, record: any) => (
                <Button 
                    type="text" 
                    danger 
                    icon={<Trash2 size={16} />} 
                    loading={isRemovingStudent}
                    onClick={() => {
                        if (window.confirm('Remove this student from the class?')) {
                            handleRemoveStudent(record.studentId);
                        }
                    }}
                />
            )
        }
    ];

    return (
        <>
            <Modal
                open={isOpen} // Ant Design uses 'open', confusingly sometimes 'visible' in old versions. 'open' in v5.
                onCancel={onClose}
                width={900}
                title={
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{classData?.classCode}</span>
                        <span className="text-gray-400">/</span>
                        <Tag color="orange" className="text-lg px-3 py-1">{subject?.code}</Tag>
                        <span className="text-sm font-normal text-gray-500">({subject?.name})</span>
                    </div>
                }
                footer={[
                    <Button key="close" onClick={onClose}>Close</Button>
                ]}
            >
                <div className="mt-4">
                    <Tabs defaultActiveKey="overview" items={[
                        {
                            key: 'overview',
                            label: 'Overview & Teachers',
                            children: (
                                <div className="space-y-6">
                                    {/* Only show assignment if no teacher is assigned */}
                                    {(!teachersAssignedData?.items || teachersAssignedData.items.length === 0) ? (
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                                <ShieldCheck size={18} /> Teacher Assignment
                                            </h3>
                                            
                                            <div className="space-y-4">
                                                {/* Custom List UI mimicking Subject Selection */}
                                                <div className="space-y-2">
                                                    {/* Selected Preview */}
                                                    <div className="relative">
                                                         <input
                                                            type="text"
                                                            readOnly
                                                            value={selectedTeacherText}
                                                            placeholder="No teacher selected"
                                                            className="w-full px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 font-medium focus:outline-none"
                                                        />
                                                    </div>

                                                    {/* Search input */}
                                                    <input
                                                        type="text"
                                                        placeholder="Search teachers..."
                                                        value={teacherSearch}
                                                        onChange={(e) => setTeacherSearch(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                                                    />

                                                    {/* Checkbox/Radio List */}
                                                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                                                        <div className="space-y-2">
                                                            {allTeachersData?.items
                                                                ?.filter(t => 
                                                                    (t.teacherCode?.toLowerCase().includes(teacherSearch.toLowerCase()) || '') ||
                                                                    (t.teacherName?.toLowerCase().includes(teacherSearch.toLowerCase()) || '') ||
                                                                    (t.accountFullName?.toLowerCase().includes(teacherSearch.toLowerCase()) || '')
                                                                )
                                                                .map((t) => (
                                                                    <label
                                                                        key={t.id}
                                                                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedTeacherId === t.id}
                                                                            onChange={() => setSelectedTeacherId(t.id)}
                                                                            className="w-5 h-5 cursor-pointer appearance-none border-2 border-gray-300 rounded checked:bg-orange-600 checked:border-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none relative
                                                                            before:content-['✓'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-white before:text-sm before:font-bold before:opacity-0 checked:before:opacity-100"
                                                                        />
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            {t.teacherCode}
                                                                        </span>
                                                                        <span className="text-sm text-gray-500">
                                                                            - {t.accountFullName || t.teacherName}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            {allTeachersData?.items?.filter(t => 
                                                                (t.teacherCode?.toLowerCase().includes(teacherSearch.toLowerCase()) || '') ||
                                                                (t.teacherName?.toLowerCase().includes(teacherSearch.toLowerCase()) || '') ||
                                                                (t.accountFullName?.toLowerCase().includes(teacherSearch.toLowerCase()) || '')
                                                            ).length === 0 && (
                                                                <p className="text-sm text-gray-500">No teachers found</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button type="primary" onClick={handleAddTeacher} loading={isAddingTeacher} disabled={!selectedTeacherId} className="w-full sm:w-auto">
                                                    Assign Teacher
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                                            <p className="text-green-800 font-medium">A professor has been assigned to this class.</p>
                                            <p className="text-xs text-green-600 mt-1">To change, remove the existing teacher below.</p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-medium mb-2">Assigned Teachers</h4>
                                        <Table 
                                            dataSource={teachersAssignedData?.items || []} 
                                            columns={teacherColumns} 
                                            rowKey="id" 
                                            pagination={false}
                                            size="small"
                                        />
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'students',
                            label: `Students (${studentsData?.totalItemCount || 0})`,
                            children: (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex gap-2">
                                            {/* Buttons removed as per request */}
                                        </div>
                                        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setIsAddStudentModalOpen(true)}>
                                            Add Student
                                        </Button>
                                    </div>
                                    <Table
                                        dataSource={studentsData?.items || []}
                                        columns={studentColumns}
                                        rowKey="id"
                                        pagination={{ pageSize: 10 }}
                                        size="small"
                                    />
                                </div>
                            )
                        }
                    ]} />
                </div>
            </Modal>
            
            <AddStudentToClassModal 
                isOpen={isAddStudentModalOpen}
                onClose={() => setIsAddStudentModalOpen(false)}
                classId={classData?.id || ''}
                classCode={classData?.classCode}
            />
        </>
    );
};

export default ClassSubjectDetailModal;
