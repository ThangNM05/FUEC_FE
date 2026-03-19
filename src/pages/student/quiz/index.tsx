import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Loader2, Cloud, CloudOff, Send, AlertTriangle, Check, BookOpen, LogOut, ArrowLeft, Star, GraduationCap } from 'lucide-react';
import ExamDetailModal from '@/components/modals/ExamDetailModal';
import ExamReviewList from '@/components/quiz/ExamReviewList';
import { useGetStudentExamByIdQuery, useSubmitStudentExamMutation } from '@/api/studentExamsApi';
import { useCreateStudentAnswerMutation } from '@/api/studentAnswersApi';
import type { QuizQuestion } from '@/api/studentExamsApi';

// ─── Helpers ───────────────────────────────────────────
const STORAGE_KEY = 'fuec_active_exam';

interface SavedExamState {
  studentExamId: string;
  answers: Record<string, string>; // questionId → optionId
  timeLeftSeconds: number;
  savedAt: number;
  starred: Record<string, boolean>; // Added starred to saved state
}

function saveExamState(state: SavedExamState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadExamState(studentExamId: string): SavedExamState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: SavedExamState = JSON.parse(raw);
    if (parsed.studentExamId !== studentExamId) return null;
    // Adjust time by elapsed seconds since last save
    const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000);
    parsed.timeLeftSeconds = Math.max(0, parsed.timeLeftSeconds - elapsed);
    return parsed;
  } catch {
    return null;
  }
}

function clearExamState() {
  localStorage.removeItem(STORAGE_KEY);
}

function parseRemainingTime(remaining: string): number {
  if (!remaining) return 45 * 60;
  // If it's an ISO timestamp (contains T and Z or +), treat as target end time
  if (remaining.includes('T')) {
    const end = new Date(remaining).getTime();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  }
  // Parse "HH:MM:SS" duration
  const parts = remaining.split(':');
  if (parts.length === 3) {
    return (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
  }
  return 45 * 60; // fallback 45m
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ─────────────────────────────────────────
export default function QuizTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentExamId = searchParams.get('studentExamId') || '';

  // ── API Hooks ──
  const { data: examData, isLoading: isLoadingExam, error: examError } = useGetStudentExamByIdQuery(studentExamId, {
    skip: !studentExamId,
  });
  const [createAnswer] = useCreateStudentAnswerMutation();
  const [submitExam, { isLoading: isSubmitting }] = useSubmitStudentExamMutation();

  // ── State ──
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId → optionId
  const [starred, setStarred] = useState<Record<string, boolean>>({}); // questionId → isStarred
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState<{ grade: number } | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const questions: QuizQuestion[] = useMemo(() => examData?.questions || [], [examData]);

  // ── Initialize timer & restore answers ──
  useEffect(() => {
    if (!examData || initialized) return;

    // Try to restore from localStorage
    const saved = loadExamState(studentExamId);
    if (saved) {
      setAnswers(saved.answers);
      setStarred(saved.starred);
      setTimeLeft(saved.timeLeftSeconds);
    } else {
      // Use remaining time from server
      let initialTime = 45 * 60;
      if (examData.remainingTime) {
        initialTime = parseRemainingTime(examData.remainingTime);
      } else if (examData.endTime) {
        initialTime = Math.max(0, Math.floor((new Date(examData.endTime).getTime() - Date.now()) / 1000));
      }
      setTimeLeft(initialTime);

      // Restore answers from DB if they exist
      const dbAnswers: Record<string, string> = {};
      examData.questions.forEach(q => {
        if (q.choiceId) {
          dbAnswers[q.id] = q.choiceId;
        }
      });
      // Only set if we have actual answers in DB
      if (Object.keys(dbAnswers).length > 0) {
        setAnswers(dbAnswers);
      }
    }

    setInitialized(true);
  }, [examData, studentExamId, initialized]);

  // ── Countdown Timer ──
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          handleSubmit(true); // auto-submit on time up
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  // ── Persist to localStorage every 5 seconds ──
  useEffect(() => {
    if (!studentExamId || timeLeft === null || showResults) return;

    const interval = setInterval(() => {
      saveExamState({
        studentExamId,
        answers,
        starred,
        timeLeftSeconds: timeLeft,
        savedAt: Date.now(),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [studentExamId, answers, starred, timeLeft, showResults]);

  // ── Save answer to API ──
  const handleAnswer = useCallback(async (questionId: string, optionId: string) => {
    // Optimistic update
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSavingStatus('saving');

    try {
      await createAnswer({
        studentExamId,
        questionId,
        choiceId: optionId,
      }).unwrap();
      setSavingStatus('saved');
      // Auto-reset status after 2s
      setTimeout(() => setSavingStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save answer', err);
      setSavingStatus('error');
      setTimeout(() => setSavingStatus('idle'), 3000);
    }
  }, [studentExamId, createAnswer]);

  const toggleStar = useCallback((questionId: string) => {
    setStarred(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  // ── Submit Exam ──
  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!autoSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    try {
      const result = await submitExam(studentExamId).unwrap();
      setExamResult({ grade: result?.result?.grade ?? result?.grade ?? 0 });
      setShowResults(true);
      clearExamState();
    } catch (err) {
      console.error('Failed to submit exam', err);
      alert('Lỗi khi nộp bài. Vui lòng thử lại.');
    }
  }, [studentExamId, submitExam]);

  const confirmSubmit = useCallback(async () => {
    setShowConfirmSubmit(false);
    try {
      const result = await submitExam(studentExamId).unwrap();
      setExamResult({ grade: result?.result?.grade ?? result?.grade ?? 0 });
      setShowResults(true);
      clearExamState();
    } catch (err) {
      console.error('Failed to submit exam', err);
      alert('Lỗi khi nộp bài. Vui lòng thử lại.');
    }
  }, [studentExamId, submitExam]);

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // ── Loading State ──
  if (isLoadingExam) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#F37022] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (examError || !examData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center bg-white rounded-xl border border-red-200 p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-2">Không thể tải bài thi</h2>
          <p className="text-gray-600 mb-6">Có lỗi xảy ra khi tải dữ liệu bài thi. Vui lòng thử lại.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#F37022] text-white rounded-lg font-semibold hover:bg-[#D96419]"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (showResults || examData?.isSubmitted) {
    const grade = examResult?.grade ?? examData?.grade ?? 0;
    const passed = grade >= 5;
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed ? <CheckCircle className="w-12 h-12 text-green-600" /> : <GraduationCap className="w-12 h-12 text-red-600" />}
          </div>
          <h1 className="text-2xl font-bold text-[#0A1B3C] mb-2">
            {examData?.isSubmitted && !showResults ? 'Kết quả bài làm' : 'Đã nộp bài!'}
          </h1>
          <p className="text-gray-600 mb-6">{examData?.examDisplayName || 'Bài kiểm tra'}</p>
          <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {grade.toFixed(1)}
          </div>
          <p className="text-gray-500 mb-2 text-sm">điểm</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 mt-4">
            <p className="text-gray-500 text-sm">
              Bạn đã trả lời {Object.keys(answers).length || (examData?.questions?.filter(q => q.choiceId).length ?? 0)} / {questions.length} câu hỏi
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/student/exams')}
              className="px-6 py-3 bg-[#F37022] text-white rounded-lg font-semibold hover:bg-[#D96419] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại khóa học
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <ExamReviewList questions={questions} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Không có câu hỏi nào trong bài thi này.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#F37022] font-medium hover:underline">Quay lại</button>
        </div>
      </div>
    );
  }


  const scrollToQuestion = (id: string, index: number) => {
    setCurrentQuestion(index);
    const element = document.getElementById(`question-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // ── Quiz UI ──
  return (
    <div className="min-h-screen bg-gray-50/50 animate-fadeIn">
      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1B3C]">Xác nhận nộp bài</h3>
            </div>
            <p className="text-gray-600 mb-2 font-medium">Bạn có chắc chắn muốn nộp bài thi?</p>
            {unansweredCount > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                <p className="text-red-600 text-sm font-semibold flex items-center gap-2">
                  ⚠ Còn {unansweredCount} câu chưa trả lời!
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Tiếp tục
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 bg-[#F37022] text-white rounded-xl font-bold hover:bg-[#D96419] disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout Container ── */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* 1. LEFT SIDEBAR: Info, Timer, Navigator */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F37022]/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-[#F37022]" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-[#0A1B3C] leading-tight line-clamp-2 uppercase">{examData.examDisplayName || 'Bài thi'}</h1>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest mt-0.5 uppercase tracking-widest">THI THỬ / EXAM</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thời gian còn lại</p>
                  {timeLeft !== null && (
                    <div className={`text-3xl font-mono font-black ${timeLeft <= 300 ? 'text-red-500' : 'text-[#F37022]'}`}>
                      {formatTime(timeLeft)}
                    </div>
                  )}
                </div>

                {/* Navigator moved to Left */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-[#0A1B3C] mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#F37022] rounded-full" />
                    Mục lục câu hỏi
                  </h3>

                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => {
                      const isAnswered = answers[q.id] !== undefined;
                      const isStarred = starred[q.id];
                      const isCurrent = currentQuestion === index;
                      return (
                        <button
                          key={q.id}
                          onClick={() => scrollToQuestion(q.id, index)}
                          className={`h-10 rounded-lg font-bold text-xs transition-all relative ${isCurrent
                            ? 'bg-orange-50 text-[#F37022] border-2 border-[#F37022] shadow-md scale-110 z-10'
                            : isAnswered
                              ? 'bg-[#F37022] text-white shadow-sm'
                              : isStarred
                                ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'
                            }`}
                        >
                          {index + 1}
                          {isStarred && (
                            <Star className={`absolute -top-1 -right-1 w-3 h-3 ${isAnswered ? 'text-yellow-400 fill-current' : 'text-yellow-500 fill-current'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const prevIdx = Math.max(0, currentQuestion - 1);
                      scrollToQuestion(questions[prevIdx].id, prevIdx);
                    }}
                    disabled={currentQuestion === 0}
                    className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-100 text-[#0A1B3C] rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-5 h-5" /> Câu trước
                  </button>
                  <button
                    onClick={() => {
                      const nextIdx = Math.min(questions.length - 1, currentQuestion + 1);
                      scrollToQuestion(questions[nextIdx].id, nextIdx);
                    }}
                    disabled={currentQuestion === questions.length - 1}
                    className="flex items-center justify-center gap-2 px-4 py-4 bg-[#F37022] text-white rounded-xl font-bold text-sm hover:bg-[#D96419] transition-all active:scale-95 shadow-lg shadow-orange-100 disabled:opacity-40"
                  >
                    Câu sau <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CENTER CONTENT: Question Scrolling List */}
          <div className="lg:col-span-7 space-y-8 pb-32">
            {questions.map((q, index) => (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className={`bg-white rounded-2xl border transition-all duration-300 ${currentQuestion === index ? 'border-[#F37022] ring-1 ring-[#F37022]/20 shadow-md scale-[1.01]' : 'border-gray-100 shadow-sm'} p-8`}
                onClick={() => setCurrentQuestion(index)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-block px-3 py-1 bg-[#F37022]/10 text-[#F37022] text-xs font-bold rounded-full uppercase tracking-wider">
                        Câu {index + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(q.id);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${starred[q.id] ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50 text-gray-300 hover:text-gray-400'}`}
                      >
                        <Star className={`w-4 h-4 ${starred[q.id] ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1B3C] leading-relaxed">
                      {q.questionContent}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-4 whitespace-nowrap">Một đáp án</span>
                </div>

                <div className="space-y-4">
                  {q.options.map((option, oIdx) => {
                    const isSelected = answers[q.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          handleAnswer(q.id, option.id);
                        }}
                        className={`group w-full flex items-center gap-4 p-5 text-left rounded-xl border-2 transition-all duration-200 ${isSelected
                          ? 'border-[#F37022] bg-[#F37022]/5'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-[#F37022] bg-[#F37022]' : 'border-gray-200 group-hover:border-gray-300'
                          }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                        </div>
                        <span className="text-base font-semibold text-[#0A1B3C] flex items-start gap-3">
                          <span className="text-gray-400 font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                          {option.choiceContent}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 3. RIGHT SIDEBAR: Progress & Status */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Trạng thái bài làm</h3>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-600 uppercase">Tiến độ tổng thể</span>
                    <span className="text-sm font-black text-[#F37022]">{answeredCount}/{questions.length}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div
                      className="h-full bg-[#F37022] transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>


                <div className="pt-6 border-t border-gray-100">
                  {savingStatus !== 'idle' && (
                    <div className={`flex items-center justify-center gap-2 text-[10px] font-bold px-3 py-2 rounded-lg border ${savingStatus === 'saving' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                      savingStatus === 'saved' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      {savingStatus === 'saving' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                        savingStatus === 'saved' ? <Cloud className="w-3.5 h-3.5" /> :
                          <CloudOff className="w-3.5 h-3.5" />}
                      {savingStatus === 'saving' ? 'Đang lưu...' :
                        savingStatus === 'saved' ? 'Đã đồng bộ' : 'Lỗi kết nối'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={confirmSubmit}
              disabled={isSubmitting}
              className="w-full h-16 bg-[#F37022] text-white rounded-2xl font-black text-sm hover:bg-[#D96419] disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>NỘP BÀI THI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
