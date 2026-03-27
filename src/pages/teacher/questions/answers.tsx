import { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ChevronRight, Loader2, Check, X, FileText, Users, MessageSquare, Send, Sparkles, Trash2 } from 'lucide-react';
import { message, Select, Input } from 'antd';
import { useGetSlotQuestionContentsBySlotIdQuery } from '@/api/slotQuestionContentsApi';
import { useGetSlotAnswersByQuestionIdQuery, useGradeSlotAnswerMutation, useAddTeacherFeedbackMutation, useAiGradeAllMutation } from '@/api/studentSlotAnswersApi';
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
    const [gradingAnswerId, setGradingAnswerId] = useState<string | null>(null);
    const [draftGrade, setDraftGrade] = useState<boolean | null>(null);
    const [replyText, setReplyText] = useState('');

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

    const [gradeAnswer, { isLoading: isGrading }] = useGradeSlotAnswerMutation();
    const [addFeedback] = useAddTeacherFeedbackMutation();
    const [aiGradeAll, { isLoading: isAIGrading }] = useAiGradeAllMutation();

    const handleAIGradeAll = async () => {
        if (!questionId) return;
        try {
            const count = await aiGradeAll(questionId).unwrap();
            if (count === 0) {
                message.info('No pending answers to grade');
            } else {
                message.success(`AI graded ${count} answer(s) successfully`);
            }
        } catch {
            message.error('AI grading failed. Please try again.');
        }
    };

    const handleOpenGrading = (answerId: string, initialGrade: boolean | null, initialFeedback: string | null) => {
        setGradingAnswerId(answerId);
        setDraftGrade(initialGrade);
        setReplyText(initialFeedback || '');
    };

    const handleSubmitReview = async (answerId: string) => {
        if (draftGrade === null && !replyText.trim()) {
            message.warning('Please select a grade or write feedback before saving');
            return;
        }
        try {
            await Promise.all([
                gradeAnswer({ id: answerId, isPassed: draftGrade }).unwrap(),
                addFeedback({ answerId, feedbackText: replyText.trim() }).unwrap()
            ]);
            
            message.success('Review saved perfectly!');
            setGradingAnswerId(null);
            setDraftGrade(null);
            setReplyText('');
        } catch {
            message.error('Failed to save review');
        }
    };

    const handleClearReview = async (answerId: string) => {
        try {
            await Promise.all([
                gradeAnswer({ id: answerId, isPassed: null }).unwrap(),
                addFeedback({ answerId, feedbackText: '' }).unwrap()
            ]);
            message.success('Grade & feedback cleared');
            setGradingAnswerId(null);
            setDraftGrade(null);
            setReplyText('');
        } catch {
            message.error('Failed to clear');
        }
    };

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
                    {/* AI Grade ALL button */}
                    <button
                        onClick={handleAIGradeAll}
                        disabled={isAIGrading || stats.pending === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md shadow-purple-100 disabled:opacity-40 shrink-0 self-start"
                        title={stats.pending === 0 ? 'No pending answers to grade' : `AI grade ${stats.pending} pending answer(s)`}
                    >
                        {isAIGrading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Grading...</>
                        ) : (
                            <><Sparkles className="w-4 h-4" /> AI Grade ALL</>
                        )}
                    </button>
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
                                                        <button 
                                                            onClick={() => handleClearReview(item.answer!.id)}
                                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-opacity opacity-0 group-hover:opacity-100"
                                                            title="Delete feedback and reset grade"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg p-3 relative group">
                                                        <MessageSquare className="w-4 h-4 text-[#F37022] flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 pr-6">
                                                            <div className="text-xs font-semibold text-[#F37022] mb-0.5">Teacher Feedback</div>
                                                            <div className="text-sm text-gray-700">{item.answer.teacherFeedback}</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleClearReview(item.answer!.id)}
                                                            className="absolute top-2 right-2 p-1.5 text-orange-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-opacity opacity-0 group-hover:opacity-100"
                                                            title="Delete feedback and reset grade"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )
                                            )}

                                            {gradingAnswerId === item.answer.id ? (
                                                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100 bg-orange-50/50 -mx-4 -mb-4 p-4 rounded-b-xl">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">1. Select Grade:</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setDraftGrade(true)}
                                                                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                                    draftGrade === true
                                                                        ? 'bg-green-600 text-white shadow-sm'
                                                                        : 'bg-white border text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50'
                                                                }`}
                                                            >
                                                                <Check className="w-4 h-4" /> Passed
                                                            </button>
                                                            <button
                                                                onClick={() => setDraftGrade(false)}
                                                                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                                    draftGrade === false
                                                                        ? 'bg-red-600 text-white shadow-sm'
                                                                        : 'bg-white border text-gray-700 hover:border-red-500 hover:text-red-700 hover:bg-red-50'
                                                                }`}
                                                            >
                                                                <X className="w-4 h-4" /> Not Passed
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">2. Add Feedback (Optional):</label>
                                                        <Input.TextArea
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                            placeholder="Type your feedback to the student..."
                                                            rows={3}
                                                            autoFocus
                                                            className="text-sm shadow-sm"
                                                        />
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        <button
                                                            onClick={() => handleSubmitReview(item.answer!.id)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-[#F37022] text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
                                                        >
                                                            <Send className="w-4 h-4" /> Save Review
                                                        </button>
                                                        
                                                        {(item.status !== 'pending' || !!item.answer?.teacherFeedback) && (
                                                            <button
                                                                onClick={() => handleClearReview(item.answer!.id)}
                                                                className="px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 hover:underline rounded-lg transition-colors flex items-center gap-1.5"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete Review
                                                            </button>
                                                        )}
                                                        
                                                        <div className="flex-1" />
                                                        
                                                        <button
                                                            onClick={() => { setGradingAnswerId(null); setDraftGrade(null); setReplyText(''); }}
                                                            className="px-4 py-2 text-sm text-gray-600 font-medium border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                                                    {/* Idle Action row */}
                                                    <button
                                                        onClick={() => handleOpenGrading(item.answer!.id, true, item.answer!.teacherFeedback || null)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                            item.status === 'passed'
                                                                ? 'bg-green-600 text-white shadow-sm'
                                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50'
                                                        }`}
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Passed
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenGrading(item.answer!.id, false, item.answer!.teacherFeedback || null)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                            item.status === 'not_passed'
                                                                ? 'bg-red-600 text-white shadow-sm'
                                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-700 hover:bg-red-50'
                                                        }`}
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Not Passed
                                                    </button>

                                                    <div className="flex-1" />

                                                    {(item.status !== 'pending' || !!item.answer!.teacherFeedback) && (
                                                        <button
                                                            onClick={() => handleClearReview(item.answer!.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all mr-1"
                                                            title="Clear grade and feedback"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleOpenGrading(item.answer!.id, item.answer!.isPassed ?? null, item.answer!.teacherFeedback || null)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:border-[#F37022] hover:text-[#F37022] hover:bg-orange-50 transition-all"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        Reply
                                                    </button>
                                                </div>
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
