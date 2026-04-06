import React, { useState, useMemo } from 'react';
import { Table, Tag, Spin, Select, Collapse, Progress, Tooltip, Input } from 'antd';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';
import { useGetStudentExamsByExamIdQuery, useGetAllStudentExamsQuery, useGetStudentExamByIdQuery } from '@/api/studentExamsApi';
import { useGetExamsByClassSubjectIdQuery } from '@/api/examsApi';
import { CheckCircle, XCircle, Clock, TrendingUp, Users, ChevronRight, BookOpen } from 'lucide-react';
import type { Exam } from '@/types/exam.types';

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

    // Fetch class students
    const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: exam?.classSubjectId || '', pageSize: 200 },
        { skip: !exam?.classSubjectId }
    );

    // Fetch student attempts for THIS exam
    const { data: currentExamAttemptsData, isLoading: isLoadingAttempts } = useGetStudentExamsByExamIdQuery(
        { examId: exam?.id || '', pageSize: 200 },
        { skip: !exam?.id }
    );

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
    const { data: detailedAttempt, isLoading: isLoadingDetailedAttempt } = useGetStudentExamByIdQuery(
        activeStudentAttempt?.studentExamId || '',
        { skip: !activeStudentAttempt?.studentExamId }
    );

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

        // The API returns all student exams for the class, we need to filter by studentCode
        const myExams = studentHistoryData.items.filter((se: any) =>
            se.studentCode?.toLowerCase().trim() === selectedStudentCode.toLowerCase().trim()
            && se.isSubmitted
            && se.grade !== undefined
            && se.grade !== null
        );

        // Map to chronological order based on the master exam list
        const classExams = [...classExamsData.items].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        return classExams.map(classExam => {
            const attempt = myExams.find((se: any) => se.examId === classExam.id);
            return {
                examName: classExam.displayName || classExam.category,
                grade: attempt ? attempt.grade : null,
                date: classExam.startTime,
            };
        }).filter(h => h.grade !== null); // Only show exams they actually completed
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
            };
        }).filter(item => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const searchLower = searchQuery.toLowerCase().trim();
            const matchesSearch = !searchLower ||
                (item.studentName?.toLowerCase().includes(searchLower) ?? false) ||
                (item.studentCode?.toString().toLowerCase().includes(searchLower) ?? false);
            return matchesStatus && matchesSearch;
        });
    }, [allStudents, studentAttemptMap, statusFilter, searchQuery]);

    const columns = [
        {
            title: 'Code',
            dataIndex: 'studentCode',
            key: 'studentCode',
            width: 120,
            sorter: (a: any, b: any) => (a.studentCode || '').localeCompare(b.studentCode || ''),
            render: (text: string) => <span className="font-medium text-gray-700">{text}</span>
        },
        {
            title: 'Name',
            dataIndex: 'studentName',
            key: 'studentName',
            sorter: (a: any, b: any) => (a.studentName || '').localeCompare(b.studentName || ''),
            render: (text: string, record: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#0A1B3C]">{text}</span>
                    {record.status === 'done' && record.submittedAt && (
                        <span className="text-xs text-gray-400 mt-0.5">{formatDateTime(record.submittedAt)}</span>
                    )}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: string) => {
                if (status === 'done') {
                    return <Tag color="green"><span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Score Recorded</span></Tag>;
                }
                if (status === 'in_progress') {
                    return <Tag color="orange"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span></Tag>;
                }
                return <Tag color="default"><span className="flex items-center gap-1">Not Started</span></Tag>;
            }
        },
        {
            title: 'Score',
            dataIndex: 'grade',
            key: 'grade',
            width: 100,
            sorter: (a: any, b: any) => {
                const gradeA = a.grade !== undefined && a.grade !== null ? Number(a.grade) : -1;
                const gradeB = b.grade !== undefined && b.grade !== null ? Number(b.grade) : -1;
                return gradeA - gradeB;
            },
            render: (grade: number | undefined, record: any) =>
                record.status === 'done' && grade !== undefined && grade !== null ? (
                    <span className="font-bold text-[#F37022]">{Number(grade).toFixed(1)} / 10</span>
                ) : (
                    <span className="text-gray-400">-</span>
                )
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, record: any) => (
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedStudentCode === record.studentCode ? 'rotate-90 text-[#F37022]' : ''}`} />
            )
        }
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Left Panel: Student List */}
            <div className={`transition-all duration-300 ${selectedStudentCode ? 'md:w-1/3' : 'w-full'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#0A1B3C] flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#F37022]" />
                        Class Roster ({dataSource.length}{dataSource.length !== allStudents.length ? ` of ${allStudents.length}` : ''})
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <Input
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="flex-1 text-sm h-9"
                        allowClear
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-full sm:w-36 text-sm h-9"
                        options={[
                            { label: 'All Status', value: 'all' },
                            { label: 'Score Recorded', value: 'done' },
                            { label: 'In Progress', value: 'in_progress' },
                            { label: 'Not Started', value: 'not_started' },
                        ]}
                    />
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        loading={isLoadingStudents || isLoadingAttempts}
                        scroll={{ y: 550 }}
                        pagination={{
                            pageSize: pageSize,
                            onShowSizeChange: (_, size) => setPageSize(size),
                            showSizeChanger: true,
                            pageSizeOptions: ['15', '50', '100'],
                            size: 'small',
                            showTotal: (total) => `${total} students`
                        }}
                        size="small"
                        rowClassName={(record) => `cursor-pointer transition-colors ${selectedStudentCode === record.studentCode ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                        onRow={(record) => ({
                            onClick: () => handleStudentRowClick(record),
                        })}
                    />
                </div>
            </div>

            {/* Right Panel: Detailed Progression */}
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
                            {/* Score Progression History */}
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

                            {/* Current Exam Results Summary */}
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
                                        {detailedAttempt?.questions?.filter(q => {
                                            const choiceId = q.choiceId || q.studentAnswerId;
                                            return q.options?.find(o => o.id === choiceId)?.isCorrect;
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
                                    {detailedAttempt?.questions?.map((q, index) => {
                                        const studentChoiceId = q.choiceId || q.studentAnswerId;
                                        const selectedOption = q.options?.find(o => o.id === studentChoiceId);
                                        const isCorrect = selectedOption?.isCorrect === true;
                                        const isUnanswered = !selectedOption;

                                        let bgColor = 'bg-gray-100 border-gray-200 text-gray-500';
                                        if (!isUnanswered) {
                                            bgColor = isCorrect ? 'bg-green-100 border-green-300 text-green-700 font-bold' : 'bg-red-100 border-red-300 text-red-700 font-bold';
                                        }

                                        return (
                                            <Tooltip title={`Q${index + 1}: ${isUnanswered ? 'Unanswered' : (isCorrect ? 'Correct' : 'Incorrect')}`} key={q.id || index}>
                                                <div
                                                    className={`w-10 h-10 rounded text-sm flex items-center justify-center border cursor-default transition-transform hover:scale-105 ${bgColor}`}
                                                >
                                                    {index + 1}
                                                </div>
                                            </Tooltip>
                                        );
                                    })}

                                    {(!detailedAttempt?.questions || detailedAttempt.questions.length === 0) && (
                                        <div className="w-full text-center text-gray-500 py-4">
                                            No question details available.
                                        </div>
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
