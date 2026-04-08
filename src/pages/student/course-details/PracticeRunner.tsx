import { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Pagination } from 'antd';
import { useGetQuestionsQuery } from '@/api/questionsApi';
import { useExplainAnswerMutation } from '@/api/aiApi';
import {
    Loader2,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Home,
    RotateCcw,
    Trophy,
    CheckCircle,
    Sparkles,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const QUESTIONS_PER_PAGE = 30;

// Sub-component to handle individual AI explanations
function QuestionAIExplanation({ question, correctAnswer, studentAnswer }: {
    question: string;
    correctAnswer: string;
    studentAnswer: string;
}) {
    const [explain, { data, isLoading, error }] = useExplainAnswerMutation();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleExplain = async () => {
        if (!data) {
            await explain({ question, correctAnswer, studentAnswer });
        }
        setIsExpanded(true);
    };

    return (
        <div className="mt-6 border-t border-gray-100 pt-6">
            {!data && !isLoading ? (
                <button
                    onClick={handleExplain}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-[#F37022] rounded-xl text-sm font-bold hover:bg-orange-100 transition-all group"
                >
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                    Explain with AI
                </button>
            ) : (
                <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all duration-500">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-4 bg-white/50 hover:bg-white transition-colors"
                    >
                        <div className="flex items-center gap-2 text-[#0A1B3C] font-bold text-sm">
                            <Sparkles className="w-4 h-4 text-[#F37022]" />
                            AI Explanation
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                        <div className="p-4 pt-2 animate-fadeIn">
                            {isLoading ? (
                                <div className="flex items-center gap-3 py-4 text-gray-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#F37022]" />
                                    AI is analyzing the question...
                                </div>
                            ) : error ? (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Failed to get AI explanation. Please try again.
                                </div>
                            ) : (
                                <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:border prose-pre:border-slate-200">
                                    <ReactMarkdown>
                                        {data?.result || ''}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PracticeRunner() {
    const { classSubjectId } = useParams<{ classSubjectId: string }>();
    const [searchParams] = useSearchParams();
    const partIndex = parseInt(searchParams.get('part') || '1');
    const navigate = useNavigate();

    const subjectId = searchParams.get('subjectId') || '';

    const progressKey = useMemo(() =>
        `practice_progress_${classSubjectId}_part_${partIndex}_${subjectId}`,
        [classSubjectId, partIndex, subjectId]);

    const [currentPage, setCurrentPage] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem(progressKey);
        return saved ? JSON.parse(saved) : {};
    });
    const [isFinished, setIsFinished] = useState(false);

    // Scroll to top when switching to results screen
    useEffect(() => {
        if (isFinished) {
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [isFinished]);

    // Save progress to localStorage whenever answers change
    useEffect(() => {
        if (Object.keys(userAnswers).length > 0) {
            localStorage.setItem(progressKey, JSON.stringify(userAnswers));
        }
    }, [userAnswers, progressKey]);

    const { data: questionsData, isLoading } = useGetQuestionsQuery({
        subjectId,
        pageSize: 200,
    }, { skip: !subjectId });

    const questions = useMemo(() => {
        const all = questionsData?.items || [];
        if (all.length === 0) return [];

        const countPerPart = Math.ceil(all.length / 5);
        const start = (partIndex - 1) * countPerPart;
        const end = Math.min(start + countPerPart, all.length);
        return all.slice(start, end);
    }, [questionsData, partIndex]);

    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
    const currentQuestions = useMemo(() => {
        return questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE);
    }, [questions, currentPage]);

    const handleSelectOption = (questionId: string, optionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const correctOptionsCount = question.options.filter((o: any) => o.isCorrect).length;
        const isMultipleChoice = correctOptionsCount > 1;

        setUserAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            if (currentAnswers.includes(optionId)) {
                return { ...prev, [questionId]: currentAnswers.filter(id => id !== optionId) };
            } else {
                return { ...prev, [questionId]: [...currentAnswers, optionId] };
            }
        });
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach(q => {
            const selected = userAnswers[q.id] || [];
            const correctOptionIds = q.options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
            
            if (selected.length === correctOptionIds.length && 
                selected.every(id => correctOptionIds.includes(id))) {
                correct++;
            }
        });
        return { correct, total: questions.length };
    };

    const answeredCount = Object.keys(userAnswers).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    if (isLoading) {
        return (
            <div className="fixed inset-0 top-14 z-30 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Preparing your practice session...</p>
                </div>
            </div>
        );
    }

    if (!subjectId || questions.length === 0) {
        return (
            <div className="fixed inset-0 top-14 z-30 bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[#0A1B3C] mb-2">No Questions Found</h2>
                    <p className="text-gray-500 mb-6">We couldn't find questions for this practice set. Please try again from the course page.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 bg-[#F37022] text-white rounded-xl font-bold hover:bg-[#D96419] transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        const { correct, total } = calculateScore();
        const percent = Math.round((correct / total) * 100);

        return (
            <div className="fixed inset-0 top-14 z-30 bg-white p-4 md:p-8 flex items-center justify-center overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center animate-fadeIn my-auto">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-12 h-12 text-[#F37022]" />
                    </div>
                    <h1 className="text-4xl font-black text-[#0A1B3C] mb-2">Practice Complete!</h1>
                    <p className="text-gray-500 mb-8 text-lg">You've finished Self-study Part {partIndex}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Score</p>
                            <p className="text-3xl font-black text-[#0A1B3C]">{correct} / {total}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Accuracy</p>
                            <p className="text-3xl font-black text-[#F37022]">{percent}%</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => {
                                setCurrentPage(0);
                                setUserAnswers({});
                                localStorage.removeItem(progressKey);
                                setIsFinished(false);
                            }}
                            className="flex-1 py-4 bg-gray-100 text-[#0A1B3C] rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Retake Part
                        </button>
                        <button
                            onClick={() => navigate(`/student/course-details/${classSubjectId}`)}
                            className="flex-1 py-4 bg-[#F37022] text-white rounded-2xl font-bold hover:bg-[#D96419] shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Back to Course
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 top-14 z-30 bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="font-bold text-[#0A1B3C]">Self-study Part {partIndex}</h1>
                        <p className="text-xs text-gray-500">Page {currentPage + 1} of {totalPages} ({questions.length} questions)</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                        <div className="h-2 w-48 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#F37022] transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-[#F37022]">{answeredCount}/{questions.length}</span>
                    </div>
                    {answeredCount === questions.length && (
                        <button
                            onClick={() => setIsFinished(true)}
                            className="px-6 py-2 bg-[#F37022] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:bg-[#D96419] transition-all animate-pulse"
                        >
                            Finish Practice
                        </button>
                    )}
                </div>
            </header>

            {/* Main content - Scrollable */}
            <main id="practice-main" className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                <div className="max-w-4xl mx-auto space-y-12 pb-24">
                    {currentQuestions.map((question, qIdx) => {
                        const globalIdx = currentPage * QUESTIONS_PER_PAGE + qIdx;
                        const selectedOptionIds = userAnswers[question.id] || [];
                        const isAnswered = selectedOptionIds.length > 0;
                        const correctOptionIds = question.options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
                        const isCorrect = isAnswered && 
                            selectedOptionIds.length === correctOptionIds.length && 
                            selectedOptionIds.every(id => correctOptionIds.includes(id));

                        const studentAnswerText = question.options
                            .filter((o: any) => selectedOptionIds.includes(o.id))
                            .map((o: any) => o.choiceContent)
                            .join(', ');

                        return (
                            <div
                                key={question.id}
                                className={`bg-white rounded-3xl shadow-sm border p-6 md:p-8 transition-all duration-300 ${isAnswered ? (isCorrect ? 'border-green-100 bg-green-50/10' : 'border-red-100 bg-red-50/10') : 'border-gray-100'
                                    }`}
                            >
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shadow-sm bg-[#0A1B3C] text-white">
                                            {globalIdx + 1}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question</span>
                                    </div>
                                    {isAnswered && (
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-lg md:text-xl font-bold text-[#0A1B3C] mb-8 leading-relaxed">
                                    {question.questionContent}
                                </h2>

                                {/* Options Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.options.map((option: any) => {
                                        const isSelected = selectedOptionIds.includes(option.id);
                                        const isThisCorrect = option.isCorrect;

                                        let variantClasses = "border-gray-100 bg-gray-50/50 hover:border-[#F37022] hover:bg-orange-50/30";

                                        if (isAnswered) {
                                            if (isThisCorrect) {
                                                variantClasses = "border-green-500 bg-green-50 ring-2 ring-green-100 text-green-700 font-semibold";
                                            } else if (isSelected) {
                                                variantClasses = "border-red-500 bg-red-50 ring-2 ring-red-100 text-red-700 font-semibold";
                                            } else {
                                                variantClasses = "border-gray-200 bg-gray-50 opacity-60 grayscale-[0.5]";
                                            }
                                        }

                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSelectOption(question.id, option.id)}
                                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${variantClasses}`}
                                            >
                                                <div className="flex items-center gap-3 relative z-10 w-full">
                                                    <div className={`w-5 h-5 flex-shrink-0 border flex items-center justify-center transition-colors rounded-md ${isSelected
                                                            ? isAnswered ? (isThisCorrect ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500') : 'bg-[#F37022] border-[#F37022]'
                                                            : 'border-gray-300 bg-white'
                                                        }`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                    </div>
                                                    <span className="flex-1">{option.choiceContent}</span>
                                                </div>
                                                {isAnswered && isThisCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 relative z-10" />}
                                                {isAnswered && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0 relative z-10" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* AI Explanation Feature */}
                                {isAnswered && (
                                    <QuestionAIExplanation
                                        question={question.questionContent}
                                        correctAnswer={question.options.filter((o: any) => o.isCorrect).map((o: any) => o.choiceContent).join(', ')}
                                        studentAnswer={studentAnswerText}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    <div className="flex flex-col items-center gap-6 mt-12 py-10 border-t border-gray-100">
                        <style>{`
                            .practice-pagination .ant-pagination-item,
                            .practice-pagination .ant-pagination-prev,
                            .practice-pagination .ant-pagination-next {
                                min-width: 44px;
                                height: 44px;
                                line-height: 44px;
                                border-radius: 12px;
                                font-size: 16px;
                                font-weight: 600;
                            }
                            .practice-pagination .ant-pagination-item-active {
                                border-color: #F37022;
                                background-color: #F37022;
                            }
                            .practice-pagination .ant-pagination-item-active a {
                                color: #FFFFFF !important;
                            }
                            .practice-pagination .ant-pagination-item:hover {
                                border-color: #F37022;
                            }
                            .practice-pagination .ant-pagination-item:hover a {
                                color: #F37022;
                            }
                        `}</style>
                        <Pagination
                            current={currentPage + 1}
                            total={questions.length}
                            pageSize={QUESTIONS_PER_PAGE}
                            onChange={(page) => {
                                setCurrentPage(page - 1);
                                document.getElementById('practice-main')?.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            showSizeChanger={false}
                            className="practice-pagination"
                        />
                    </div>

                    {/* Bottom Finish Button */}
                    <div className="flex flex-col items-center gap-4 py-8">
                        {answeredCount < questions.length ? (
                            <p className="text-gray-400 text-sm font-medium italic">
                                You have {questions.length - answeredCount} questions remaining to finish this practice set.
                            </p>
                        ) : (
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-green-600 font-bold mb-4 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                    <CheckCircle className="w-5 h-5" />
                                    All questions answered!
                                </div>
                                <button
                                    onClick={() => setIsFinished(true)}
                                    className="w-full sm:w-64 py-4 bg-[#F37022] text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:bg-[#D96419] transition-all transform hover:-translate-y-1"
                                >
                                    Finish Practice
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
