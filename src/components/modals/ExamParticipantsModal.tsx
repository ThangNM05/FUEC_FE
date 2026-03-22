import React from 'react';
import { Modal, Table, Tag } from 'antd';
import { useGetStudentExamsByExamIdQuery } from '@/api/studentExamsApi';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';
import { Users, CheckCircle, Clock } from 'lucide-react';
import type { Exam } from '@/types/exam.types';

interface ExamParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam | null;
    classSubjectId: string;
}

const ExamParticipantsModal: React.FC<ExamParticipantsModalProps> = ({ isOpen, onClose, exam, classSubjectId }) => {
    // We already have all students in the class subject
    const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: classSubjectId, pageSize: 200 },
        { skip: !classSubjectId || !isOpen }
    );

    // Get all student exams (attempts) for this exam
    const { data: studentExamsData, isLoading: isLoadingExams } = useGetStudentExamsByExamIdQuery(
        { examId: exam?.id || '', pageSize: 200 },
        { skip: !exam?.id || !isOpen }
    );

    const allStudents = studentsData?.items || [];
    const studentExams = studentExamsData?.items || [];

    // Create a map of student exam attempts 
    const studentExamMap = new Map<string, any>();
    studentExams.forEach((se: any) => {
        const code = se.studentCode?.toString().toLowerCase().trim();
        if (code) {
            studentExamMap.set(code, se);
        }
    });

    const dataSource = allStudents.map(student => {
        const studentCode = student.studentCode?.toString().toLowerCase().trim();
        const attempt = studentCode ? studentExamMap.get(studentCode) : null;

        // Status logic: 
        // 1. If grade exists -> Done
        // 2. If attempt exists but no grade -> In Progress
        // 3. Otherwise -> Not Started
        let status = 'not_started';
        if (attempt) {
            if (attempt.grade !== null && attempt.grade !== undefined) {
                status = 'done';
            } else {
                status = 'in_progress';
            }
        }
        return {
            key: student.studentId || student.studentCode,
            studentCode: student.studentCode,
            studentName: student.studentName,
            status: status,
            grade: attempt?.grade,
            startTime: attempt?.startTime || attempt?.initTime,
            endTime: attempt?.endTime,
            studentExamId: attempt?.studentExamId,
        };
    });

    const columns = [
        {
            title: 'Student Code',
            dataIndex: 'studentCode',
            key: 'studentCode',
            render: (text: string) => <span className="font-medium text-gray-700">{text}</span>
        },
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName',
            render: (text: string) => <span className="font-semibold text-[#0A1B3C]">{text}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                if (status === 'done') {
                    return (
                        <Tag color="green">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle className="w-3 h-3" /> Done
                            </span>
                        </Tag>
                    );
                }
                if (status === 'in_progress') {
                    return (
                        <Tag color="orange">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                                <Clock className="w-3 h-3" /> In Progress
                            </span>
                        </Tag>
                    );
                }
                return (
                    <Tag color="default">
                        <span className="flex items-center whitespace-nowrap">Not Started</span>
                    </Tag>
                );
            }
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (grade: number | undefined, record: any) =>
                record.status === 'done' && grade !== undefined && grade !== null ? (
                    <span className="font-bold text-[#F37022]">{Number(grade).toFixed(1)} / 10</span>
                ) : (
                    <span className="text-gray-400">-</span>
                )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_: any, record: any) => (
                record.status === 'done' ? (
                    <button
                        onClick={() => {
                            if (record.studentExamId) {
                                window.open(`/teacher/exam-review/${record.studentExamId}`, '_blank');
                            } else {
                                alert(`Không tìm thấy ID bài làm của sinh viên ${record.studentCode}.`);
                            }
                        }}
                        className="px-3 py-1 bg-[#F37022]/10 text-[#F37022] hover:bg-[#F37022] hover:text-white rounded-lg text-xs font-bold transition-all"
                    >
                        Review
                    </button>
                ) : null
            )
        }
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-[#0A1B3C]">
                    <Users className="w-5 h-5 text-[#F37022]" />
                    <span>Exam Participants: {exam?.displayName || 'Progress Test'}</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={850}
        >
            <div className="py-2 mb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-700">Participation Overview</h4>
                    <p className="text-sm text-gray-500">
                        {studentExams.length} out of {allStudents.length} students have participated
                    </p>
                </div>
            </div>
            <div>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    loading={isLoadingStudents || isLoadingExams}
                    pagination={{ pageSize: 10 }}
                    size="small"
                />
            </div>
        </Modal>
    );
};

export default ExamParticipantsModal;
