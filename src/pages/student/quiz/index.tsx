import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Loader2, Cloud, CloudOff, Send, AlertTriangle, Check } from 'lucide-react';
import { useGetStudentExamByIdQuery, useSubmitStudentExamMutation } from '@/api/studentExamsApi';
import { useCreateStudentAnswerMutation } from '@/api/studentAnswersApi';
import type { QuizQuestion } from '@/api/studentExamsApi';

// ─── Helpers ───────────────────────────────────────────
const STORAGE_KEY = 'fuec_active_exam';

interface SavedExamState {
  studentExamId: string;
  answers: Record<string, string>; // questionId → selectedOptionId
  timeLeftSeconds: number;
  savedAt: number;
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
  // Parse "HH:MM:SS" or ISO duration
  const parts = remaining.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
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
      setTimeLeft(saved.timeLeftSeconds);
    } else {
      // Use remaining time from server or calculate from endTime
      if (examData.remainingTime) {
        setTimeLeft(parseRemainingTime(examData.remainingTime));
      } else if (examData.endTime) {
        const remaining = Math.max(0, Math.floor((new Date(examData.endTime).getTime() - Date.now()) / 1000));
        setTimeLeft(remaining);
      } else {
        setTimeLeft(45 * 60);
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
        timeLeftSeconds: timeLeft,
        savedAt: Date.now(),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [studentExamId, answers, timeLeft, showResults]);

  // ── Save answer to API ──
  const handleAnswer = useCallback(async (questionId: string, optionId: string) => {
    // Optimistic update
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSavingStatus('saving');

    try {
      await createAnswer({
        studentExamId,
        questionId,
        selectedOptionId: optionId,
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
  if (showResults) {
    const grade = examResult?.grade ?? 0;
    const passed = grade >= 5;
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            <CheckCircle className={`w-12 h-12 ${passed ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <h1 className="text-2xl font-bold text-[#0A1B3C] mb-2">Đã nộp bài!</h1>
          <p className="text-gray-600 mb-6">{examData.examDisplayName || 'Bài kiểm tra'}</p>
          <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {grade.toFixed(1)}
          </div>
          <p className="text-gray-500 mb-2 text-sm">điểm</p>
          <p className="text-gray-500 mb-8">
            Bạn đã trả lời {answeredCount} / {questions.length} câu hỏi
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Quay lại khóa học
            </button>
          </div>
        </div>
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

  const currentQ = questions[currentQuestion];

  // ── Quiz UI ──
  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <h3 className="text-lg font-bold text-[#0A1B3C]">Xác nhận nộp bài</h3>
            </div>
            <p className="text-gray-600 mb-2">Bạn có chắc chắn muốn nộp bài?</p>
            {unansweredCount > 0 && (
              <p className="text-red-500 text-sm mb-4 font-medium">
                ⚠ Còn {unansweredCount} câu chưa trả lời!
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-[#F37022] text-white rounded-lg font-medium hover:bg-[#D96419] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0A1B3C]">{examData.examDisplayName || 'Bài kiểm tra'}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-600">{questions.length} câu hỏi</p>
            {/* Save status indicator */}
            <div className={`flex items-center gap-1 text-xs font-medium ${
              savingStatus === 'saving' ? 'text-yellow-600' :
              savingStatus === 'saved' ? 'text-green-600' :
              savingStatus === 'error' ? 'text-red-600' :
              'text-gray-400'
            }`}>
              {savingStatus === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...</>}
              {savingStatus === 'saved' && <><Cloud className="w-3.5 h-3.5" /> Đã lưu</>}
              {savingStatus === 'error' && <><CloudOff className="w-3.5 h-3.5" /> Lưu thất bại</>}
            </div>
          </div>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-colors ${
            timeLeft <= 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-orange-100 text-orange-600'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <span className="text-sm text-orange-600 font-medium">Câu {currentQuestion + 1} / {questions.length}</span>
              <h2 className="text-xl font-bold text-[#0A1B3C] mt-2">{currentQ.questionContent}</h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                const isSelected = answers[currentQ.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentQ.id, option.id)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`inline-block w-8 h-8 rounded-full mr-3 text-center leading-8 font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#F37022] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option.choiceContent}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Câu trước
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg font-medium hover:bg-[#D96419] transition-colors"
                >
                  Câu tiếp <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Question Navigator */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-20">
            <h3 className="font-semibold text-[#0A1B3C] mb-4">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentQuestion === index;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                      isCurrent
                        ? 'bg-[#F37022] text-white shadow-md scale-105'
                        : isAnswered
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Đã trả lời</span>
                <span className="font-semibold text-green-600">{answeredCount}/{questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Submit button in sidebar */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="w-full mt-4 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Nộp bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
