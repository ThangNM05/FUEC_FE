import { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ChevronRight, Loader2, Check, X, FileText, Users, MessageSquare, Send, Sparkles, Trash2 } from 'lucide-react';
import { message, Select, Input } from 'antd';
import { useGetSlotQuestionContentsBySlotIdQuery } from '@/api/slotQuestionContentsApi';
import { useGetSlotAnswersByQuestionIdQuery } from '@/api/studentSlotAnswersApi';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';
import type { StudentSlotAnswerDto } from '@/api/studentSlotAnswersApi';

type GradingStatus = 'all' | 'passed' | 'not_passed' | 'pending' | 'not_submitted';

interface MergedStudent {
    studentId: string;
    studentCode: string;
    studentName: string;
    answer?: StudentSlotAnswerDto;
    status: GradingStatus;
}

export default function TeacherQuestionAnswers() {
    const navigate = useNavigate();
    const { id: questionId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const slotId = searchParams.get('slotId') || '';
    const classSubjectId = searchParams.get('courseId') || '';

    const [statusFilter, setStatusFilter] = useState<GradingStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: questions = [], isLoading: isLoadingQuestions } = useGetSlotQuestionContentsBySlotIdQuery(slotId, {
        skip: !slotId,
    });
    const currentQuestion = useMemo(() => questions.find(q => q.id === questionId), [questions, questionId]);

    const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentClassesByClassIdQuery(
        { classSubjectId, pageSize: 500 },
        { skip: !classSubjectId }
    );

    const { data: answers = [], isLoading: isLoadingAnswers } = useGetSlotAnswersByQuestionIdQuery(questionId || '', {
        skip: !questionId,
    });

    // Merge class roster with submitted answers
    const mergedList: MergedStudent[] = useMemo(() => {
        const students = studentsData?.items ?? [];

        // Build a lookup map from studentId (normalized to lowercase) -> answer
        const answerMap = new Map<string, StudentSlotAnswerDto>();
        for (const ans of answers) {
            answerMap.set(ans.studentId?.toLowerCase(), ans);
        }

        // If no class roster, still show answered students
        if (students.length === 0 && answers.length > 0) {
            return answers.map(ans => ({
                studentId: ans.studentId,
                studentCode: ans.studentCode ?? '',
                studentName: ans.studentName ?? 'Unknown Student',
                answer: ans,
                status: ans.isPassed === true ? 'passed' : ans.isPassed === false ? 'not_passed' : 'pending',
            }));
        }

        return students.map((sc: any) => {
            const sId: string = (sc.studentId ?? sc.id ?? '').toLowerCase();
            const answer = answerMap.get(sId);

            let status: GradingStatus = 'not_submitted';
            if (answer) {
                if (answer.isPassed === true) status = 'passed';
                else if (answer.isPassed === false) status = 'not_passed';
                else status = 'pending';
            }

            return {
                studentId: sc.studentId ?? sc.id,
                studentCode: sc.studentCode ?? '',
                studentName: sc.studentName ?? 'Unknown Student',
                answer,
                status,
            };
        });
    }, [studentsData, answers]);

    const filteredList = useMemo(() => {
        return mergedList.filter(item => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const searchTerm = searchQuery.toLowerCase();
            const matchesSearch = !searchTerm ||
                item.studentName.toLowerCase().includes(searchTerm) ||
                item.studentCode.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }, [mergedList, statusFilter, searchQuery]);

    const stats = useMemo(() => ({
        total: mergedList.length,
        passed: mergedList.filter(i => i.status === 'passed').length,
        notPassed: mergedList.filter(i => i.status === 'not_passed').length,
        pending: mergedList.filter(i => i.status === 'pending').length,
        notSubmitted: mergedList.filter(i => i.status === 'not_submitted').length,
    }), [mergedList]);

    if (isLoadingQuestions || isLoadingAnswers || isLoadingStudents) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-[#F37022] animate-spin" />
                <p className="text-gray-500 font-medium">Loading answers...</p>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Question Not Found</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="text-[#F37022] font-semibold hover:underline flex items-center gap-2"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 pb-24 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022] transition-colors">Home</button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate(`/teacher/course-details/${classSubjectId}`)} className="hover:text-[#F37022] transition-colors">Course Details</button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Student Answers</span>
            </div>

            {/* Header */}
            <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 text-orange-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg md:text-xl font-bold text-[#0A1B3C] mb-3 leading-snug">{currentQuestion.content}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                <Users className="w-3.5 h-3.5" /> {stats.total} total
                            </div>
                            <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                <Check className="w-3.5 h-3.5" /> {stats.passed} passed
                            </div>
                            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                <X className="w-3.5 h-3.5" /> {stats.notPassed} not passed
                            </div>
                            <div className="flex items-center gap-1.5 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block"></span> {stats.pending} pending
                            </div>
                            {classSubjectId && (
                                <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                    {stats.notSubmitted} not submitted
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Input
                    placeholder="Search by name or student code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-9 border-gray-300"
                    allowClear
                />
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="w-full sm:w-48 h-9"
                    options={[
                        { label: 'All Statuses', value: 'all' },
                        { label: 'Pending Review', value: 'pending' },
                        { label: 'Passed ✓', value: 'passed' },
                        { label: 'Not Passed ✗', value: 'not_passed' },
                        { label: 'Not Submitted', value: 'not_submitted' },
                    ]}
                />
            </div>

            {/* Student List */}
            <div className="space-y-4">
                {filteredList.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3" />
                        <p className="font-medium">No students match your filters</p>
                    </div>
                ) : (
                    filteredList.map((item) => (
                        <div key={item.studentId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {/* Left: Student info */}
                                <div className="w-full md:w-56 flex-shrink-0 p-4 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex md:flex-col items-start gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-[#0A1B3C] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            {item.studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#0A1B3C] text-sm leading-tight">{item.studentName}</div>
                                            <div className="text-xs font-mono text-gray-500 mt-0.5">{item.studentCode}</div>
                                        </div>
                                    </div>

                                    <div className="md:w-full">
                                        {item.status === 'not_submitted' && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">Not Submitted</span>
                                        )}
                                        {item.status === 'pending' && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">Pending Review</span>
                                        )}
                                        {item.status === 'passed' && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">✓ Passed</span>
                                        )}
                                        {item.status === 'not_passed' && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">✗ Not Passed</span>
                                        )}
                                    </div>
                                    {item.answer && (
                                        <div className="text-xs text-gray-400 hidden md:block">
                                            {new Date(item.answer.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Answer + Actions */}
                                <div className="flex-1 min-w-0 p-4 flex flex-col gap-3">
                                    {item.answer ? (
                                        <>
                                            {/* Answer text */}
                                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                {item.answer.answerText}
                                            </div>

                                            {/* Feedback block — different style for AI vs Teacher */}
                                            {item.answer.teacherFeedback && (
                                                item.answer.isAIGraded ? (
                                                    <div className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg p-3 relative group">
                                                        <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 pr-6">
                                                            <div className="text-xs font-semibold text-purple-600 mb-0.5">AI Feedback</div>
                                                            <div className="text-sm text-gray-700">{item.answer.teacherFeedback}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg p-3 relative group">
                                                        <MessageSquare className="w-4 h-4 text-[#F37022] flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 pr-6">
                                                            <div className="text-xs font-semibold text-[#F37022] mb-0.5">Teacher Feedback</div>
                                                            <div className="text-sm text-gray-700">{item.answer.teacherFeedback}</div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            <FileText className="w-8 h-8 text-gray-300 mb-2" />
                                            <p className="text-gray-400 text-sm">No answer submitted yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
