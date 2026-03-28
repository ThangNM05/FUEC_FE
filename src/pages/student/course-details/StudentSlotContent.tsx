import { useEffect } from 'react';
import { FileText, ClipboardCheck, BookOpen, Loader2, EyeOff, Lock as LockIcon, Play, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/authSlice';
import { useGetSlotQuestionContentsBySlotIdQuery } from '@/api/slotQuestionContentsApi';
import { useGetSlotAnswersByStudentAndSlotQuery } from '@/api/studentSlotAnswersApi';
import type { Exam } from '@/types/exam.types';
import type { ExtendedAssignment } from './index';

interface StudentSlotContentProps {
    slotId: string;
    slotAssignments: ExtendedAssignment[];
    slotExams: Exam[];
    studentClassesId?: string | null;
    slotStatus?: string;
    onPassedCountChange?: (passedCount: number) => void;
}

export default function StudentSlotContent({ slotId, slotAssignments, slotExams, slotStatus, onPassedCountChange }: StudentSlotContentProps) {
    const navigate = useNavigate();
    const { classSubjectId } = useParams<{ classSubjectId: string }>();
    const user = useSelector(selectCurrentUser);
    const studentId = user?.entityId ?? user?.id ?? '';

    const isReadOnly = slotStatus === 'Inactive' || slotStatus === 'Expired';
    const readOnlyParam = slotStatus === 'Inactive' ? 'inactive' : slotStatus === 'Expired' ? 'expired' : 'false';

    const { data: questions = [], isLoading: isLoadingQuestions } = useGetSlotQuestionContentsBySlotIdQuery(slotId, {
        skip: !slotId,
    });

    const { data: answers = [] } = useGetSlotAnswersByStudentAndSlotQuery(
        { studentId, slotId },
        { skip: !studentId || !slotId, refetchOnMountOrArgChange: true }
    );

    const questionStatusMap = (questions || []).reduce((acc: Record<string, 'passed' | 'failed' | 'none'>, q: any) => {
        const myAnswers = answers.filter((a: any) => a.slotQuestionContentId === q.id);
        if (myAnswers.length === 0) {
            acc[q.id] = 'none';
        } else {
            const hasPassed = myAnswers.some((a: any) => a.isPassed === true);
            const latest = [...myAnswers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            
            if (hasPassed) acc[q.id] = 'passed';
            else if (latest && latest.isPassed === false) acc[q.id] = 'failed';
            else acc[q.id] = 'none';
        }
        return acc;
    }, {});

    const hasContent = questions.length > 0 || slotAssignments.length > 0 || slotExams.length > 0;

    // Report accurate passed count to parent so the header badge stays in sync
    const passedCount = Object.values(questionStatusMap).filter(s => s === 'passed').length;
    useEffect(() => {
        if (questions.length > 0) {
            onPassedCountChange?.(passedCount);
        }
    }, [passedCount, questions.length]);

    return (
        <div className="p-4 bg-white space-y-5">
            {/* Read-only banner */}
            {isReadOnly && questions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
                    <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>This slot is <strong>{slotStatus?.toLowerCase()}</strong>. You can view questions but cannot submit answers.</span>
                </div>
            )}

            {/* Questions */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-1.5 border-b border-gray-100">
                    Questions
                </h4>
                {isLoadingQuestions ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading questions...
                    </div>
                ) : questions.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-1">No questions for this slot.</p>
                ) : (
                    <div className="space-y-2">
                        {questions.map((q, idx) => (
                            <div
                                key={q.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all cursor-pointer group"
                                onClick={() => navigate(`/student/course-details/questions/${q.id}?slotId=${slotId}&classSubjectId=${classSubjectId}&readOnly=${readOnlyParam}`)}
                            >
                                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                                    <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#0A1B3C] group-hover:text-[#F37022] transition-colors leading-snug">
                                        {idx + 1}. {q.content}
                                    </p>
                                    {q.description && (
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{q.description}</p>
                                    )}
                                </div>
                                {questionStatusMap[q.id] === 'passed' && (
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 self-center ml-auto" />
                                )}
                                {questionStatusMap[q.id] === 'failed' && (
                                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 self-center ml-auto" />
                                )}
                                {isReadOnly && questionStatusMap[q.id] === 'none' && (
                                    <EyeOff className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 self-center ml-auto" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assignments */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-1.5 border-b border-gray-100">
                    Assignment
                </h4>
                {slotAssignments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-1">No assignments for this slot.</p>
                ) : (
                    <div className="space-y-2">
                        {slotAssignments.map(assignment => (
                            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-3.5 h-3.5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#0A1B3C]">
                                            {assignment.displayName || `Assignment ${assignment.instanceNumber}`}
                                        </p>
                                        {assignment.dueDate && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                {assignment.timeRemaining && !assignment.submitted && (
                                                    <span className={`ml-2 font-semibold ${assignment.isOverdue ? 'text-red-500' : 'text-blue-500'}`}>
                                                        · {assignment.timeRemaining}
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/student/assignment-submission/${assignment.id}`)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${assignment.studentSubmission?.grade !== null && assignment.studentSubmission?.grade !== undefined
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : assignment.submitted
                                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            : assignment.isOverdue
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-[#F37022] text-white hover:bg-[#D96419]'
                                        }`}
                                >
                                    {assignment.submitted || (assignment.studentSubmission?.grade !== null && assignment.studentSubmission?.grade !== undefined)
                                        ? 'Review'
                                        : assignment.isOverdue
                                            ? 'Overdue'
                                            : 'Submit'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Progress Tests */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-1.5 border-b border-gray-100">
                    Progress Test
                </h4>
                {slotExams.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-1">No progress tests for this slot.</p>
                ) : (
                    <div className="space-y-2">
                        {slotExams.map(exam => {
                            const now = new Date();
                            const start = new Date(exam.startTime);
                            const end = new Date(exam.endTime);
                            const isAvailable = now >= start && now <= end;
                            const isEnded = now > end;

                            return (
                                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isAvailable ? 'bg-blue-100' : isEnded ? 'bg-green-100' : 'bg-gray-200'
                                            }`}>
                                            {isAvailable ? (
                                                <Play className="w-3.5 h-3.5 text-blue-600" />
                                            ) : (
                                                <ClipboardCheck className={`w-3.5 h-3.5 ${isEnded ? 'text-green-600' : 'text-gray-500'}`} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#0A1B3C]">
                                                {exam.displayName || `${exam.category} ${exam.instanceNumber}`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(exam.startTime).toLocaleString()} → {new Date(exam.endTime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {(isAvailable && !exam.isSubmitted) ? (
                                        <button
                                            className="px-4 py-2 bg-[#F37022] text-white rounded-lg text-sm font-medium hover:bg-[#D96419] flex items-center gap-2"
                                            onClick={() => {
                                                navigate(`/student/exam-lobby/${exam.id}?classSubjectId=${classSubjectId}`);
                                            }}
                                        >
                                            Start Test
                                        </button>
                                    ) : (
                                        <button
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isEnded || exam.isSubmitted
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                            disabled={!isEnded && !exam.isSubmitted}
                                            onClick={() => {
                                                if (isEnded || exam.isSubmitted) {
                                                    navigate(`/student/exam-lobby/${exam.id}?classSubjectId=${classSubjectId}`);
                                                }
                                            }}
                                        >
                                            {(isEnded || exam.isSubmitted) ? 'Review' : 'Not Started'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {!isLoadingQuestions && !hasContent && (
                <div className="py-6 text-center text-gray-400 text-sm">
                    No content available for this slot yet.
                </div>
            )}
        </div>
    );
}
