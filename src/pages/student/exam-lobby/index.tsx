import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock, Shield, Lock, Loader2, Play, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useGetExamsByClassSubjectIdQuery } from '@/api/examsApi';
import { useStartStudentExamMutation } from '@/api/studentExamsApi';
import { useSearchParams } from 'react-router';

// SecurityMode enum matching BE
const SecurityMode = {
  None: 0,
  StaticCode: 1,
  DynamicCode: 2,
} as const;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getExamStatus(startTime: string, endTime: string): 'upcoming' | 'available' | 'ended' {
  const now = Date.now();
  if (now < new Date(startTime).getTime()) return 'upcoming';
  if (now > new Date(endTime).getTime()) return 'ended';
  return 'available';
}

function getCountdown(targetTime: string): string {
  const diff = new Date(targetTime).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ExamLobby() {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const classSubjectId = searchParams.get('classSubjectId') || '';

  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: examsData, isLoading: isLoadingExams } = useGetExamsByClassSubjectIdQuery(classSubjectId, {
    skip: !classSubjectId,
  });

  const [startStudentExam, { isLoading: isStarting }] = useStartStudentExamMutation();

  // Find the specific exam
  const exam = useMemo(() => {
    if (!examsData?.items || !examId) return null;
    return examsData.items.find(e => e.id === examId) || null;
  }, [examsData, examId]);

  const status = exam ? getExamStatus(exam.startTime, exam.endTime) : 'upcoming';
  const requiresCode = exam ? (exam.securityMode === SecurityMode.StaticCode || exam.securityMode === SecurityMode.DynamicCode) : false;
  const securityLabel = exam?.securityMode === SecurityMode.DynamicCode ? 'Mã động (TOTP)' : exam?.securityMode === SecurityMode.StaticCode ? 'Mã tĩnh' : 'Không yêu cầu';

  // Auto-refresh countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = async () => {
    if (!examId) return;
    setErrorMsg('');

    if (requiresCode && !accessCode.trim()) {
      setErrorMsg('Vui lòng nhập mã truy cập.');
      return;
    }

    try {
      const response = await startStudentExam({
        examId,
        accessCode: requiresCode ? accessCode.trim() : undefined,
      }).unwrap();

      navigate(`/student/quiz?studentExamId=${response.studentExamId}&examId=${response.examId}`);
    } catch (error: any) {
      console.error('Failed to start exam', error);
      const msg = error?.data?.message || error?.data?.result || error?.message || 'Không thể bắt đầu bài thi.';
      setErrorMsg(msg);
    }
  };

  // Loading
  if (isLoadingExams) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#F37022]" />
      </div>
    );
  }

  // Exam not found
  if (!exam) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center bg-white rounded-xl border border-gray-200 p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-2">Không tìm thấy bài thi</h2>
          <p className="text-gray-600 mb-6">Bài thi này không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#F37022] text-white rounded-lg font-semibold hover:bg-[#D96419] transition-colors">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-[#0A1B3C] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {/* Exam Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A1B3C] to-[#1a3a6c] p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{exam.displayName || `${exam.category} ${exam.instanceNumber}`}</h1>
              <p className="text-sm text-white/70">{exam.subjectName} ({exam.subjectCode})</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Bắt đầu</p>
                <p className="text-sm font-semibold text-[#0A1B3C]">{formatDateTime(exam.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Kết thúc</p>
                <p className="text-sm font-semibold text-[#0A1B3C]">{formatDateTime(exam.endTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Bảo mật</p>
                <p className="text-sm font-semibold text-[#0A1B3C]">{securityLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Thể loại</p>
                <p className="text-sm font-semibold text-[#0A1B3C]">{exam.category || '-'} - {exam.tag || ''}</p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {status === 'upcoming' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Bài thi chưa bắt đầu</p>
                  <p className="text-sm text-blue-600 font-mono mt-1">
                    Bắt đầu sau: {getCountdown(exam.startTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'ended' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-600">Bài thi đã kết thúc</p>
              </div>
            </div>
          )}

          {status === 'available' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Bài thi đang mở</p>
                  <p className="text-sm text-green-600 font-mono mt-1">
                    Còn lại: {getCountdown(exam.endTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Access Code Input */}
          {status === 'available' && requiresCode && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0A1B3C] mb-2">
                <Lock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Mã truy cập bài thi
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => { setAccessCode(e.target.value); setErrorMsg(''); }}
                placeholder={exam.securityMode === SecurityMode.DynamicCode ? 'Nhập mã TOTP từ giáo viên...' : 'Nhập mã truy cập...'}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#F37022] focus:outline-none text-lg font-mono tracking-wider text-center transition-colors"
                maxLength={50}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Start Button */}
          {status === 'available' && (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-4 bg-[#F37022] text-white rounded-lg font-bold text-lg hover:bg-[#D96419] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-200"
            >
              {isStarting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Đang mở bài thi...</>
              ) : (
                <><Play className="w-5 h-5" /> Vào làm bài</>
              )}
            </button>
          )}

          {/* Disabled button for non-available states */}
          {status !== 'available' && (
            <button
              disabled
              className="w-full py-4 bg-gray-200 text-gray-500 rounded-lg font-bold text-lg cursor-not-allowed"
            >
              {status === 'upcoming' ? 'Chưa đến giờ thi' : 'Bài thi đã kết thúc'}
            </button>
          )}

          {/* Instructions */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-[#0A1B3C] mb-3">Lưu ý:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                Sau khi bắt đầu, bài thi sẽ được đếm ngược thời gian.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                Đáp án sẽ được lưu tự động mỗi khi bạn chọn.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                Bạn có thể quay lại làm tiếp nếu bị thoát khỏi trang.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                Hệ thống sẽ tự động nộp bài khi hết thời gian.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
