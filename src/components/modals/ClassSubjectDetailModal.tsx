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
    // useDeleteStudentClassMutation
} from '@/api/classDetailsApi';
import { useGetTeachersQuery } from '@/api/teachersApi';
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
        } catch (error: any) {
            toast.error('Failed to assign teacher: ' + (error?.data?.message || error.message));
        }
    };

    const handleRemoveTeacher = async (id: string) => {
        try {
            await deleteTeacher(id).unwrap();
            toast.success('Teacher removed successfully');
        } catch (error: any) {
            toast.error('Failed to remove teacher');
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
            title: 'Role', 
            key: 'isPrimary',
            render: (_: any, record: any) => (
                record.isPrimary ? <Tag color="gold">Primary</Tag> : <Tag color="blue">Assistant</Tag>
            )
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_: any, record: any) => (
                <Popconfirm title="Remove teacher?" onConfirm={() => handleRemoveTeacher(record.id)}>
                    <Button type="text" danger icon={<Trash2 size={16} />} />
                </Popconfirm>
            )
        }
    ];

    const studentColumns = [
        { title: 'Student Code', dataIndex: 'studentCode', key: 'studentCode' },
        { title: 'Student Name', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
    ];

    return (
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
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                        <ShieldCheck size={18} /> Teacher Assignment
                                    </h3>
                                    <div className="flex gap-2">
                                        <Select
                                            placeholder="Select a teacher to assign"
                                            className="w-full max-w-md"
                                            value={selectedTeacherId}
                                            onChange={setSelectedTeacherId}
                                            options={allTeachersData?.items?.map(t => ({ label: `${t.teacherCode} - ${t.accountFullName || t.teacherName}`, value: t.id }))}

                                            showSearch
                                            optionFilterProp="label"
                                        />
                                        <Button type="primary" onClick={handleAddTeacher} loading={isAddingTeacher} disabled={!selectedTeacherId}>
                                            Assign Teacher
                                        </Button>
                                    </div>
                                </div>

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
                                    <Button type="primary" icon={<UserPlus size={16} />}>
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
    );
};

export default ClassSubjectDetailModal;
