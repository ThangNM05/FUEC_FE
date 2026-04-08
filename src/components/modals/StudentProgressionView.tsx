import React, { useState, useMemo } from 'react';
import { Table, Tag, Spin, Select, Tooltip, Input, App } from 'antd';
import { toast } from 'sonner';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';
import { useGetStudentExamsByExamIdQuery, useGetAllStudentExamsQuery, useGetStudentExamByIdQuery, useForceSubmitStudentExamMutation } from '@/api/studentExamsApi';
import { useGetExamsByClassSubjectIdQuery, useGetExamQuestionsQuery } from '@/api/examsApi';
import { CheckCircle, Clock, TrendingUp, Users, ChevronRight, BookOpen, AlertTriangle } from 'lucide-react';
import type { Exam } from '@/types/exam.types';
import { useNotificationHub } from '@/contexts/NotificationContext';

interface StudentProgressionViewProps {
    exam: Exam | null;
}

function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const StudentProgressionView: React.FC<StudentProgressionViewProps> = ({ exam }) => {
    const [selectedStudentCode, setSelectedStudentCode] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [pageSize, setPageSize] = useState(15);
    const [lastActiveQuestions, setLastActiveQuestions] = useState<Record<string, number>>({});

    // Fetch class students
    const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: exam?.classSubjectId || '', pageSize: 200 },
        { skip: !exam?.classSubjectId }
    );

    // Fetch student attempts for THIS exam
    const { data: currentExamAttemptsData, isLoading: isLoadingAttempts, refetch: refetchAttempts } = useGetStudentExamsByExamIdQuery(
        { examId: exam?.id || '', pageSize: 200 },
        { skip: !exam?.id }
    );

    // Fetch EXAM questions to map IDs to indices (Q1, Q2, etc.)
    const { data: examQuestionsData } = useGetExamQuestionsQuery(
        { examId: exam?.id || '' },
        { skip: !exam?.id }
    );

    const questionMap = useMemo(() => {
        const map = new Map<string, number>();
        examQuestionsData?.items?.forEach((q: any, idx: number) => {
            map.set(q.questionId.toLowerCase(), idx + 1);
        });
        return map;
    }, [examQuestionsData]);

    const allStudents = studentsData?.items || [];
    const currentExamAttempts = currentExamAttemptsData?.items || [];

    const studentAttemptMap = useMemo(() => {
        const map = new Map<string, any>();
        currentExamAttempts.forEach((attempt: any) => {
            if (attempt.studentCode) {
                map.set(attempt.studentCode.toLowerCase().trim(), attempt);
            }
        });
        return map;
    }, [currentExamAttempts]);

    // Active student attempt ID for fetching details
    const activeStudentAttempt = selectedStudentCode ? studentAttemptMap.get(selectedStudentCode.toLowerCase().trim()) : null;

    // Fetch details of the selected student's attempt to get questions and answers
    const { data: detailedAttempt, isLoading: isLoadingDetailedAttempt, refetch: refetchDetailedAttempt } = useGetStudentExamByIdQuery(
        activeStudentAttempt?.studentExamId || '',
        { skip: !activeStudentAttempt?.studentExamId }
    );

    const { joinExamMonitoring, leaveExamMonitoring } = useNotificationHub();

    const [lastAnsweringQ, setLastAnsweringQ] = React.useState<string | null>(null);

    const [patchedAnswers, setPatchedAnswers] = useState<Record<string, Record<string, any>>>({});

    // Listen for the global SignalR event dispatched by the hook
    React.useEffect(() => {
        const handleStarted = () => {
            console.log('[StudentProgressionView] Student started exam, refetching...');
            refetchAttempts();
        };
        const handleAnswerUpdate = (e: any) => {
            const dto = e.detail;
            console.log('[StudentProgressionView] SignalR Update received:', dto);

            const studentCode = dto.studentCode?.toLowerCase().trim();
            const questionId = dto.questionId?.toLowerCase();
            const studentExamId = dto.studentExamId?.toLowerCase();
            
            if (studentCode && questionId) {
                const qIdx = questionMap.get(questionId);
                if (qIdx) {
                    setLastActiveQuestions(prev => ({ ...prev, [studentCode]: qIdx }));
                    
                    // If this update belongs to the student currently being viewed
                    if (selectedStudentCode?.toLowerCase().trim() === studentCode) {
                        setLastAnsweringQ(questionId);
                        // PATCH the local state immediately for instant visual feedback
                        if (studentExamId) {
                            setPatchedAnswers(prev => ({
                                ...prev,
                                [studentExamId]: {
                                    ...(prev[studentExamId] || {}),
                                    [questionId]: { 
                                        choiceId: dto.choiceId, 
                                        choiceIds: dto.choiceIds, 
                                        studentAnswerId: 'patched' 
                                    }
                                }
                            }));
                        }
                        // Clear the active highlight after 5 seconds
                        setTimeout(() => setLastAnsweringQ(prev => prev === questionId ? null : prev), 5000);
                    }
                }
            }

            refetchAttempts();

            // If the user being updated is the one currently in detail view, refetch their details
            const isCurrentlyViewed = selectedStudentCode && selectedStudentCode.toLowerCase().trim() === studentCode;
            if (isCurrentlyViewed) {
                // Try refetching multiple times with increasing delays to ensure we catch the DB commit
                refetchDetailedAttempt(); // Immediate
                setTimeout(() => refetchDetailedAttempt(), 500);
                setTimeout(() => refetchDetailedAttempt(), 2000);
            }
        };

        window.addEventListener('signalr:student-exam-started', handleStarted);
        window.addEventListener('signalr:student-answer-updated', handleAnswerUpdate);
        
        return () => {
            window.removeEventListener('signalr:student-exam-started', handleStarted);
            window.removeEventListener('signalr:student-answer-updated', handleAnswerUpdate);
        };
    }, [refetchAttempts, refetchDetailedAttempt, activeStudentAttempt, questionMap, selectedStudentCode]);

    React.useEffect(() => {
        if (exam?.id) {
            joinExamMonitoring(exam.id);
        }
        return () => {
            if (exam?.id) leaveExamMonitoring(exam.id);
        };
    }, [exam?.id, joinExamMonitoring, leaveExamMonitoring]);

    const [forceSubmitExam, { isLoading: isForceSubmitting }] = useForceSubmitStudentExamMutation();
    const { modal } = App.useApp();

    const handleForceSubmit = () => {
        if (!activeStudentAttempt) return;
        modal.confirm({
            title: 'Force Submit Exam',
            icon: <AlertTriangle className="text-orange-500 mr-2" />,
            content: `Are you sure you want to force submit the exam for student ${activeStudentAttempt.studentName} (${activeStudentAttempt.studentCode})? Their score will be evaluated based on the current answers.`,
            okText: 'Force Submit',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    await forceSubmitExam(activeStudentAttempt.studentExamId).unwrap();
                    toast.success(`Exam for ${activeStudentAttempt.studentName} has been force submitted successfully.`);
                    refetchAttempts();
                    refetchDetailedAttempt();
                } catch (error) {
                    console.error('Failed to force submit exam:', error);
                    toast.error('Failed to force submit exam. They might have already submitted.');
                }
            }
        });
    };

    // Fetch student's ENTIRE exam history for this class
    const { data: studentHistoryData, isLoading: isLoadingHistory } = useGetAllStudentExamsQuery(
        { studentClassesId: exam?.classSubjectId || '', pageSize: 100 },
        { skip: !selectedStudentCode || !exam?.classSubjectId }
    );

    // We also need all class exams to map the history properly
    const { data: classExamsData } = useGetExamsByClassSubjectIdQuery(
        exam?.classSubjectId || '',
        { skip: !selectedStudentCode || !exam?.classSubjectId }
    );

    // Filter history for the specifically selected student
    const studentHistory = useMemo(() => {
        if (!studentHistoryData?.items || !classExamsData?.items || !selectedStudentCode) return [];
        const myExams = studentHistoryData.items.filter((se: any) =>
            se.studentCode?.toLowerCase().trim() === selectedStudentCode.toLowerCase().trim()
            && se.isSubmitted
            && se.grade !== undefined
            && se.grade !== null
        );
        const classExams = [...classExamsData.items].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        return classExams.map(classExam => {
            const attempt = myExams.find((se: any) => se.examId === classExam.id);
            return {
                examName: classExam.displayName || classExam.category,
                grade: attempt ? attempt.grade : null,
                date: classExam.startTime,
            };
        }).filter(h => h.grade !== null);
    }, [studentHistoryData, classExamsData, selectedStudentCode]);

    const handleStudentRowClick = (record: any) => {
        if (selectedStudentCode === record.studentCode) {
            setSelectedStudentCode(null);
        } else {
            setSelectedStudentCode(record.studentCode);
        }
    };

    const dataSource = useMemo(() => {
        return allStudents.map(student => {
            const code = student.studentCode?.toString().toLowerCase().trim() || '';
            const attempt = studentAttemptMap.get(code);
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
                status,
                grade: attempt?.grade,
                submittedAt: attempt?.updatedAt || attempt?.createdAt,
                currentQ: lastActiveQuestions[code] || null
            };
        }).filter(item => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const searchLower = searchQuery.toLowerCase().trim();
            const matchesSearch = !searchLower ||
                (item.studentName?.toLowerCase().includes(searchLower) ?? false) ||
                (item.studentCode?.toString().toLowerCase().includes(searchLower) ?? false);
            return matchesStatus && matchesSearch;
        });
    }, [allStudents, studentAttemptMap, statusFilter, searchQuery, lastActiveQuestions]);

    const columns = [
        {
            title: 'Code',
            dataIndex: 'studentCode',
            key: 'studentCode',
            width: 100,
            sorter: (a: any, b: any) => (a.studentCode || '').localeCompare(b.studentCode || ''),
            render: (text: string) => <span className="font-medium text-gray-700">{text}</span>
        },
        {
            title: 'Name',
            dataIndex: 'studentName',
            key: 'studentName',
            width: 150,
            ellipsis: true,
            sorter: (a: any, b: any) => (a.studentName || '').localeCompare(b.studentName || ''),
            render: (text: string, record: any) => (
                <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-[#0A1B3C] truncate">{text}</span>
                    {record.status === 'done' && record.submittedAt && (
                        <span className="text-xs text-gray-400 mt-0.5 truncate">{formatDateTime(record.submittedAt)}</span>
                    )}
                </div>
            )
        },
        {
            title: 'Progress',
            dataIndex: 'currentQ',
            key: 'currentQ',
            width: 90,
            render: (q: number | null, record: any) => {
                if (record.status === 'done') return <Tag color="blue" className="m-0 text-[10px]">Finish</Tag>;
                if (q) return (
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
            width: 130,
            render: (status: string) => {
                if (status === 'done') {
                    return <Tag color="green" className="m-0"><span className="flex items-center gap-1 text-[10px]"><CheckCircle className="w-3 h-3" /> Recorded</span></Tag>;
                }
                if (status === 'in_progress') {
                    return <Tag color="orange" className="m-0"><span className="flex items-center gap-1 text-[10px]"><Clock className="w-3 h-3" /> Progress</span></Tag>;
                }
                return <Tag color="default" className="m-0 text-[10px]">Not Started</Tag>;
            }
        },
        {
            title: 'Score',
            dataIndex: 'grade',
            key: 'grade',
            width: 80,
            sorter: (a: any, b: any) => {
                const gradeA = a.grade !== undefined && a.grade !== null ? Number(a.grade) : -1;
                const gradeB = b.grade !== undefined && b.grade !== null ? Number(b.grade) : -1;
                return gradeA - gradeB;
            },
            render: (grade: number | undefined, record: any) =>
                record.status === 'done' && grade !== undefined && grade !== null ? (
                    <span className="font-bold text-[#F37022]">{Number(grade).toFixed(1)}/10</span>
                ) : (
                    <span className="text-gray-400">-</span>
                )
        },
        {
            title: '',
            key: 'action',
            width: 40,
            render: (_: any, record: any) => (
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedStudentCode === record.studentCode ? 'rotate-90 text-[#F37022]' : ''}`} />
            )
        }
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className={`transition-all duration-300 ${selectedStudentCode ? 'md:w-[350px] shrink-0' : 'w-full'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#0A1B3C] flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#F37022]" />
                        Class Roster ({dataSource.length}{dataSource.length !== allStudents.length ? ` of ${allStudents.length}` : ''})
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="flex-1 text-sm h-9"
                        allowClear
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-full sm:w-28 text-sm h-9"
                        options={[
                            { label: 'All', value: 'all' },
                            { label: 'Done', value: 'done' },
                            { label: 'Started', value: 'in_progress' },
                            { label: 'None', value: 'not_started' },
                        ]}
                    />
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        loading={isLoadingStudents || isLoadingAttempts}
                        scroll={{ x: 450, y: 550 }}
                        pagination={{
                            pageSize: pageSize,
                            onShowSizeChange: (_, size) => setPageSize(size),
                            showSizeChanger: true,
                            pageSizeOptions: ['15', '50', '100'],
                            size: 'small',
                            showTotal: (total) => `${total}`
                        }}
                        size="small"
                        rowClassName={(record) => `cursor-pointer transition-colors ${selectedStudentCode === record.studentCode ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                        onRow={(record) => ({
                            onClick: () => handleStudentRowClick(record),
                        })}
                    />
                </div>
            </div>

            {selectedStudentCode && (
                <div className="md:w-2/3 bg-gray-50 rounded-xl border border-gray-200 p-5 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-xl font-bold text-[#0A1B3C] flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#F37022]" />
                                Student Progression
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Viewing details for <span className="font-semibold text-[#0A1B3C]">{selectedStudentCode}</span>
                            </p>
                        </div>
                        {activeStudentAttempt && activeStudentAttempt.grade === null && (
                            <button
                                onClick={handleForceSubmit}
                                disabled={isForceSubmitting}
                                className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg text-sm font-bold transition-all border border-orange-100 flex items-center gap-2 shadow-sm"
                            >
                                <CheckCircle className="w-4 h-4" /> 
                                {isForceSubmitting ? 'Submitting...' : 'Force Submit'}
                            </button>
                        )}
                    </div>

                    {isLoadingDetailedAttempt || isLoadingHistory ? (
                        <div className="py-20 text-center">
                            <Spin tip="Loading student details..." />
                        </div>
                    ) : !activeStudentAttempt ? (
                        <div className="py-12 text-center text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-lg">No exam attempt recorded</p>
                            <p className="text-sm">This student has not started the exam yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {studentHistory.length > 0 && (
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-blue-500" />
                                        Score Progression Track
                                    </h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {studentHistory.map((hist, idx) => (
                                            <div key={idx} className="flex-shrink-0 w-32 bg-blue-50 rounded-lg p-3 border border-blue-100 flex flex-col items-center justify-center text-center">
                                                <p className="text-xs text-blue-800 font-semibold truncate w-full mb-1" title={hist.examName}>{hist.examName}</p>
                                                <div className="text-xl font-bold text-[#0A1B3C]">{Number(hist.grade).toFixed(1)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm">Exam Score</h4>
                                    <div className="text-3xl font-black text-[#F37022] mt-1">
                                        {activeStudentAttempt.grade !== null ? `${Number(activeStudentAttempt.grade).toFixed(1)}/10` : 'Pending'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h4 className="font-bold text-gray-700 text-sm">Correct Answers</h4>
                                    <div className="text-lg font-bold text-green-600 mt-1">
                                        {detailedAttempt?.questions?.filter((q: any) => {
                                            const patch = patchedAnswers[activeStudentAttempt?.studentExamId?.toLowerCase()]?.[q.questionId?.toLowerCase()];
                                            const choiceId = patch?.choiceId || q.choiceId;
                                            const choiceIds = patch?.choiceIds || q.choiceIds;

                                            if (choiceId) {
                                                const opt = q.options?.find((o: any) => o.id === choiceId);
                                                return opt?.isCorrect === true;
                                            }
                                            if (choiceIds && choiceIds.length > 0) {
                                                return q.options?.some((o: any) => choiceIds.includes(o.id) && o.isCorrect === true);
                                            }
                                            return false;
                                        }).length || 0}
                                        <span className="text-gray-400 text-sm font-normal"> / {detailedAttempt?.questions?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Question Result Grid */}
                            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                                <h4 className="font-bold text-gray-700 p-4 border-b border-gray-100 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-orange-500" />
                                    Question Results
                                </h4>
                                <div className="p-4 flex flex-wrap gap-2">
                                    {detailedAttempt?.questions?.map((q: any, index: number) => {
                                        const patch = patchedAnswers[activeStudentAttempt?.studentExamId?.toLowerCase()]?.[q.questionId?.toLowerCase()];
                                        const currentChoiceId = patch?.choiceId || q.choiceId;
                                        const currentChoiceIds = patch?.choiceIds || q.choiceIds;
                                        const currentStudentAnswerId = patch?.studentAnswerId || q.studentAnswerId;

                                        // A question is answered if it has a studentAnswerId, choiceId, or choiceIds
                                        const isAnswered = !!currentStudentAnswerId || !!currentChoiceId || (currentChoiceIds && currentChoiceIds.length > 0);
                                        
                                        // Detection of correctness (if available)
                                        let isCorrect: boolean | null = null;
                                        if (isAnswered) {
                                            if (currentChoiceId) {
                                                const opt = q.options?.find((o: any) => o.id === currentChoiceId);
                                                if (opt) isCorrect = opt.isCorrect;
                                            } else if (currentChoiceIds && currentChoiceIds.length > 0) {
                                                // Simplified multi-choice correctness check
                                                isCorrect = q.options?.some((o: any) => currentChoiceIds.includes(o.id) && o.isCorrect === true);
                                            }
                                        }

                                        const isAnsweringNow = lastAnsweringQ && q.questionId && q.questionId.toLowerCase() === lastAnsweringQ.toLowerCase();

                                        let bgColor = 'bg-gray-100 border-gray-200 text-gray-500';
                                        let statusText = 'Unanswered';

                                        if (isAnswered) {
                                            if (isCorrect === true) {
                                                bgColor = 'bg-green-100 border-green-300 text-green-700 font-bold';
                                                statusText = 'Correct';
                                            } else if (isCorrect === false) {
                                                bgColor = 'bg-red-100 border-red-300 text-red-700 font-bold';
                                                statusText = 'Incorrect';
                                            } else {
                                                // Answered but result not final/available -> Use Cyan/Blue
                                                bgColor = 'bg-cyan-50 border-cyan-200 text-cyan-600 font-bold';
                                                statusText = 'Answered';
                                            }
                                        }

                                        const answeringEffect = isAnsweringNow ? 'ring-2 ring-orange-400 ring-offset-1 animate-pulse shadow-md z-10' : '';

                                        return (
                                            <Tooltip title={`Q${index + 1}: ${isAnsweringNow ? 'Answering right now...' : statusText}`} key={q.id || index}>
                                                <div className={`w-10 h-10 rounded text-sm flex items-center justify-center border cursor-default transition-all hover:scale-110 ${bgColor} ${answeringEffect}`}>
                                                    {index + 1}
                                                </div>
                                            </Tooltip>
                                        );
                                    })}
                                    {(!detailedAttempt?.questions || detailedAttempt.questions.length === 0) && (
                                        <div className="w-full text-center text-gray-500 py-4">No question details available.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentProgressionView;
