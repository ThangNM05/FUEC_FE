import React from 'react';
import { Modal, Table, Tag } from 'antd';
import { useGetStudentExamsByExamIdQuery, useUpdateStudentExamMutation, useForceSubmitStudentExamMutation } from '@/api/studentExamsApi';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';
import { useGetExamQuestionsQuery } from '@/api/examsApi';
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { App } from 'antd';
import type { Exam } from '@/types/exam.types';
import { useNotificationHub } from '@/contexts/NotificationContext';

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
    const { data: studentExamsData, isLoading: isLoadingExams, refetch: refetchStudentExams } = useGetStudentExamsByExamIdQuery(
        { examId: exam?.id || '', pageSize: 200 },
        { skip: !exam?.id || !isOpen }
    );

    const [updateStudentExam] = useUpdateStudentExamMutation();
    const [forceSubmitExam] = useForceSubmitStudentExamMutation();
    const { modal } = App.useApp();

    const { data: examQuestionsData } = useGetExamQuestionsQuery(
        { examId: exam?.id || '' },
        { skip: !exam?.id || !isOpen }
    );

    const questionMap = React.useMemo(() => {
        const map = new Map<string, number>();
        examQuestionsData?.items?.forEach((q: any, idx: number) => {
            map.set(q.questionId.toLowerCase(), idx + 1);
        });
        return map;
    }, [examQuestionsData]);

    const [activeStudents, setActiveStudents] = React.useState<Record<string, { lastActive: number, qIdx?: number }>>({});

    const { joinExamMonitoring, leaveExamMonitoring } = useNotificationHub();

    React.useEffect(() => {
        const handleStarted = () => {
            console.log('[ExamParticipantsModal] Student started exam, refetching...');
            refetchStudentExams();
        };
        const handleAnswerUpdate = (e: any) => {
            const dto = e.detail;
            const code = dto.studentCode?.toLowerCase().trim();
            const qId = dto.questionId?.toLowerCase();
            
            if (code) {
                const qIdx = qId ? questionMap.get(qId) : undefined;
                setActiveStudents(prev => ({ 
                    ...prev, 
                    [code]: { 
                        lastActive: Date.now(),
                        qIdx: qIdx || prev[code]?.qIdx 
                    } 
                }));
            }
        };

        if (isOpen) {
            window.addEventListener('signalr:student-exam-started', handleStarted);
            window.addEventListener('signalr:student-answer-updated', handleAnswerUpdate);
        }
        
        return () => {
            window.removeEventListener('signalr:student-exam-started', handleStarted);
            window.removeEventListener('signalr:student-answer-updated', handleAnswerUpdate);
        };
    }, [isOpen, refetchStudentExams, questionMap]);

    React.useEffect(() => {
        if (isOpen && exam?.id) {
            joinExamMonitoring(exam.id);
        }
        return () => {
            if (exam?.id) {
                leaveExamMonitoring(exam.id);
            }
        };
    }, [isOpen, exam?.id, joinExamMonitoring, leaveExamMonitoring]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveStudents(prev => {
                const now = Date.now();
                const updated = { ...prev };
                let changed = false;
                Object.keys(updated).forEach(key => {
                    if (now - updated[key].lastActive > 15000) {
                        delete updated[key];
                        changed = true;
                    }
                });
                return changed ? updated : prev;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
        const activeInfo = studentCode ? activeStudents[studentCode] : null;

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
            currentQ: activeInfo?.qIdx
        };
    });

    const handleTerminate = (record: any) => {
        modal.confirm({
            title: 'Terminate Student Exam',
            icon: <AlertTriangle className="text-red-500 mr-2" />,
            content: `Are you sure you want to terminate the exam for student ${record.studentName} (${record.studentCode}) immediately? Their score will be set to 0.`,
            okText: 'Yes, Terminate',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    await updateStudentExam({
                        id: record.studentExamId,
                        grade: 0
                    }).unwrap();
                    toast.success(`Exam for ${record.studentName} has been terminated with a score of 0.`);
                    refetchStudentExams();
                } catch (error) {
                    console.error('Failed to terminate exam:', error);
                    toast.error('Failed to terminate exam. Please try again.');
                }
            }
        });
    };

    const handleForceSubmit = (record: any) => {
        modal.confirm({
            title: 'Force Submit Exam',
            icon: <AlertTriangle className="text-orange-500 mr-2" />,
            content: `Are you sure you want to force submit the exam for student ${record.studentName} (${record.studentCode})? Their score will be evaluated based on the current answers.`,
            okText: 'Force Submit',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    await forceSubmitExam(record.studentExamId).unwrap();
                    toast.success(`Exam for ${record.studentName} has been force submitted successfully.`);
                    refetchStudentExams();
                } catch (error) {
                    console.error('Failed to force submit exam:', error);
                    toast.error('Failed to force submit exam. They might have already submitted.');
                }
            }
        });
    };

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
            title: 'Progress',
            dataIndex: 'currentQ',
            key: 'currentQ',
            render: (q: number | undefined, record: any) => {
                const activeInfo = record.studentCode && activeStudents[record.studentCode.toLowerCase().trim()];
                const isActive = !!activeInfo;
                if (record.status === 'done') return <Tag color="blue" className="text-[10px]">Finish</Tag>;
                if (isActive) return (
                    <div className="flex items-center justify-center">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                    </div>
                );
                return <span className="text-gray-300 text-[10px]">-</span>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: any) => {
                const activeInfo = record.studentCode && activeStudents[record.studentCode.toLowerCase().trim()];
                const isActive = !!activeInfo;
                
                if (status === 'done') {
                    return (
                        <Tag color="green">
                            <span className="flex items-center gap-1 whitespace-nowrap text-[10px]">
                                <CheckCircle className="w-3 h-3" /> Done
                            </span>
                        </Tag>
                    );
                }
                if (status === 'in_progress') {
                    return (
                        <div className="flex items-center gap-2">
                            <Tag color="orange">
                                <span className="flex items-center gap-1 whitespace-nowrap text-[10px]">
                                    <Clock className="w-3 h-3" /> In Progress
                                </span>
                            </Tag>
                            {isActive && (
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            )}
                        </div>
                    );
                }
                return (
                    <Tag color="default">
                        <span className="flex items-center whitespace-nowrap text-[10px]">Not Started</span>
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
            width: 120,
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    {record.status === 'done' ? (
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
                    ) : record.status === 'in_progress' ? (
                        <>
                            <button
                                onClick={() => handleForceSubmit(record)}
                                className="px-3 py-1 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-orange-100 flex items-center gap-1 whitespace-nowrap"
                            >
                                <CheckCircle className="w-3 h-3" /> Force Submit
                            </button>
                            <button
                                onClick={() => handleTerminate(record)}
                                className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-100 flex items-center gap-1"
                            >
                                <AlertTriangle className="w-3 h-3" /> Terminate
                            </button>
                        </>
                    ) : null}
                </div>
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
