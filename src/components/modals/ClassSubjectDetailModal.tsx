import { useState } from 'react';
import { Modal, Tabs, Button, Table, Tag } from 'antd';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
    useGetClassSubjectsQuery,
    useUpdateClassSubjectMutation,
    useGetStudentClassesByClassIdQuery,
    useAddStudentClassMutation,
    useRemoveStudentClassMutation,
    useGetIneligibleStudentIdsQuery
} from '@/api/classDetailsApi';
import { useGetTeachersQuery } from '@/api/teachersApi';
import AddStudentToClassModal from './AddStudentToClassModal';
import type { Class, Subject } from '@/types/class.types';

interface ClassSubjectDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    classData: Class | null;
    subject: Subject | null;
}

const ClassSubjectDetailModal = ({ isOpen, onClose, classData, subject }: ClassSubjectDetailModalProps) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // Added activeTab state

    // 1. Get ClassSubject data (contains teacher info)
    const { data: classSubjectData } = useGetClassSubjectsQuery(
        { classId: classData?.id, subjectId: subject?.id },
        { skip: !classData || !subject }
    );
    const classSubject = classSubjectData?.items?.[0];
    const hasTeacher = !!classSubject?.teacherId;

    // 2. Get All Teachers (for dropdown - only load when no teacher assigned)
    const { data: allTeachersData } = useGetTeachersQuery(
        { page: 1, pageSize: 100 },
        { skip: hasTeacher }
    );

    // 3. Get Students in Class
    const {
        data: studentsData,
        isLoading: isLoadingEnrollments
    } = useGetStudentClassesByClassIdQuery(
        { classId: classSubject?.classId || '' },
        { skip: !classSubject?.classId }
    );

    // Mutations
    const [updateClassSubject, { isLoading: isAssigningTeacher }] = useUpdateClassSubjectMutation();
    const [removeStudent, { isLoading: isRemovingStudent }] = useRemoveStudentClassMutation();
    const [addStudent] = useAddStudentClassMutation(); // Added addStudent mutation

    // Selected teacher text
    const selectedTeacherText = (() => {
        if (!selectedTeacherId || !allTeachersData?.items) return '';
        const teacher = allTeachersData.items.find(t => t.id === selectedTeacherId);
        return teacher ? `${teacher.teacherCode} - ${teacher.accountFullName || teacher.teacherName}` : '';
    })();

    // Assign teacher via PUT /ClassSubjects/{id}
    const handleAssignTeacher = async () => {
        if (!classSubject?.id || !selectedTeacherId || !subject?.id) return;
        try {
            await updateClassSubject({
                id: classSubject.id,
                subjectId: subject.id,
                teacherId: selectedTeacherId,
            }).unwrap();
            toast.success('Teacher assigned successfully');
            setSelectedTeacherId(undefined);
            setTeacherSearch('');
        } catch (error: any) {
            toast.error('Failed to assign teacher: ' + (error?.data?.message || error.message));
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!classData?.id) return;
        try {
            await removeStudent({ classId: classData.id, studentId }).unwrap();
            toast.success('Student removed from class');
        } catch (error: any) {
            toast.error('Failed to remove student: ' + (error?.data?.message || 'Unknown error'));
        }
    };

    // Teacher table columns (when teacher is assigned)
    const teacherColumns = [
        { title: 'Teacher Code', dataIndex: 'teacherCode', key: 'teacherCode' },
        { title: 'Full Name', dataIndex: 'teacherName', key: 'teacherName' },
    ];

    // Build teacher table data from classSubject response
    const assignedTeacherData = classSubject?.teacherId ? [{
        id: classSubject.id,
        teacherCode: classSubject.teacherCode || 'N/A',
        teacherName: classSubject.teacherName || 'N/A',
    }] : [];

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
                    loading={isRemovingStudent}
                    onClick={() => {
                        if (window.confirm('Remove this student from the class?')) {
                            handleRemoveStudent(record.studentId);
                        }
                    }}
                >
                    Remove
                </Button>
            )
        }
    ];

    // Filter teachers for search
    const filteredTeachers = allTeachersData?.items?.filter(t => {
        const search = teacherSearch.toLowerCase();
        return (
            (t.teacherCode?.toLowerCase().includes(search) || false) ||
            (t.accountFullName?.toLowerCase().includes(search) || false)
        );
    }) || [];

    return (
        <>
            <Modal
                open={isOpen}
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
                                    {/* Teacher Assignment Section */}
                                    {!hasTeacher ? (
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                                <ShieldCheck size={18} /> Teacher Assignment
                                            </h3>

                                            <div className="space-y-4">
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

                                                    {/* Teacher List */}
                                                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                                                        <div className="space-y-2">
                                                            {filteredTeachers.map((t) => (
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
                                                                        - {t.accountFullName}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                            {filteredTeachers.length === 0 && (
                                                                <p className="text-sm text-gray-500">No teachers found</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button type="primary" onClick={handleAssignTeacher} loading={isAssigningTeacher} disabled={!selectedTeacherId} className="w-full sm:w-auto">
                                                    Assign Teacher
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                                            <p className="text-green-800 font-medium">A teacher has been assigned to this class.</p>
                                        </div>
                                    )}

                                    {/* Assigned Teacher Table */}
                                    <div>
                                        <h4 className="font-medium mb-2">Assigned Teacher</h4>
                                        <Table
                                            dataSource={assignedTeacherData}
                                            columns={teacherColumns}
                                            rowKey="id"
                                            pagination={false}
                                            size="small"
                                            locale={{ emptyText: 'No teacher assigned yet' }}
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
                                        <div className="flex gap-2" />
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
