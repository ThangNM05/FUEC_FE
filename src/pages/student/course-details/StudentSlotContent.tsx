import { FileText, ClipboardCheck, BookOpen, Loader2, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useGetSlotQuestionContentsBySlotIdQuery } from '@/api/slotQuestionContentsApi';
import type { Exam } from '@/types/exam.types';
import type { ExtendedAssignment } from './index';

interface StudentSlotContentProps {
    slotId: string;
    /** Assignments that belong to this slot (pre-filtered by parent) */
    slotAssignments: ExtendedAssignment[];
    /** Progress tests belonging to this slot (pre-filtered by parent) */
    slotExams: Exam[];
    studentClassesId?: string | null; // Added prop
}

export default function StudentSlotContent({ slotId, slotAssignments, slotExams }: StudentSlotContentProps) {
    const navigate = useNavigate();
    const { classSubjectId } = useParams<{ classSubjectId: string }>();

    const { data: questions = [], isLoading: isLoadingQuestions } = useGetSlotQuestionContentsBySlotIdQuery(slotId, {
        skip: !slotId,
    });

    const hasContent = questions.length > 0 || slotAssignments.length > 0 || slotExams.length > 0;

    return (
        <div className="p-4 bg-white space-y-5">
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
                                onClick={() => navigate(`/student/questions/${q.id}`)}
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
                                                    <span className={`ml-2 font-medium ${assignment.isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                                                        · {assignment.timeRemaining}
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/student/assignment-submission/${assignment.id}`)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${assignment.submitted
                                            ? 'bg-green-100 text-green-700'
                                            : assignment.isOverdue
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-[#F37022] text-white hover:bg-[#D96419]'
                                        }`}
                                >
                                    {assignment.submitted ? 'View Submission' : assignment.isOverdue ? 'Overdue' : 'Submit'}
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
                                    {isAvailable ? (
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
                                            disabled
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isEnded
                                                    ? 'bg-green-100 text-green-700 cursor-default'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isEnded ? 'Ended' : 'Not Started'}
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
