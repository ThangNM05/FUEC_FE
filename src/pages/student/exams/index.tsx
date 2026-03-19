import { useState, useMemo } from 'react';
import { Search, Calendar, Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useGetCurrentUserQuery } from '@/api/authApi';
import { useGetAllExamsQuery } from '@/api/examsApi';

function StudentExams() {
  const navigate = useNavigate();
  const [semester, setSemester] = useState('SPRING2025');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: profile } = useGetCurrentUserQuery();
  const studentId = profile?.result?.id || profile?.id;

  const { data: examsData, isLoading } = useGetAllExamsQuery(
    { studentId },
    { skip: !studentId }
  );

  const exams = examsData?.items || [];

  const { upcomingExams, pastExams } = useMemo(() => {
    const upcoming: any[] = [];
    const past: any[] = [];
    const now = Date.now();

    exams.forEach(exam => {
      const isPast = exam.isSubmitted || (new Date(exam.endTime).getTime() < now);

      const examItem = {
        ...exam,
        course: exam.subjectName || exam.category,
        code: exam.subjectCode || '-',
        type: exam.tag || 'Exam',
        date: exam.startTime,
        time: `${new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        room: 'Online',
        duration: Math.round((new Date(exam.endTime).getTime() - new Date(exam.startTime).getTime()) / 60000) + ' minutes',
        daysLeft: Math.ceil((new Date(exam.startTime).getTime() - now) / (1000 * 60 * 60 * 24)),
        score: exam.grade !== null && exam.grade !== undefined ? exam.grade : null,
        grade: exam.grade !== null && exam.grade !== undefined ? (exam.grade >= 5 ? 'Pass' : 'Fail') : '-',
      };

      if (isPast) {
        past.push(examItem);
      } else {
        upcoming.push(examItem);
      }
    });

    // Sort upcoming by daysLeft ascending, past by date descending
    upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingExams: upcoming, pastExams: past };
  }, [exams]);

  const filteredUpcoming = upcomingExams.filter(e =>
    e.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPast = pastExams.filter(e =>
    e.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nearestExam = filteredUpcoming[0];

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Exam Schedule</h1>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
          >
            <option value="SPRING2025">Spring 2025</option>
            <option value="FALL2024">Fall 2024</option>
            <option value="SUMMER2024">Summer 2024</option>
          </select>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="outline-none text-sm text-[#0A1B3C] bg-transparent w-40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#F37022]" />
        </div>
      ) : (
        <>
          {/* Alert Banner */}
          {nearestExam && nearestExam.daysLeft <= 3 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-xl mb-6 shadow-sm">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-yellow-800">Sắp thi</div>
                <div className="text-sm text-yellow-700">
                  Bạn có bài kiểm tra môn {nearestExam.course} trong {nearestExam.daysLeft} ngày tới. Hãy chuẩn bị kỹ lưỡng!
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0A1B3C]">Bài thi sắp diễn ra</h2>
            </div>

            <div className="space-y-4">
              {filteredUpcoming.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có bài thi nào sắp diễn ra.
                </div>
              ) : (
                filteredUpcoming.map(exam => (
                  <div key={exam.id} className="border border-gray-200 rounded-xl p-5 hover:border-orange-200 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="font-semibold text-[#0A1B3C] text-lg">{exam.course}</h3>
                          <span className="px-2 py-0.5 bg-blue-50 text-[#0066b3] text-xs font-semibold rounded">{exam.code}</span>
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded">{exam.type}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Ngày thi</div>
                              <div className="text-sm font-medium text-[#0A1B3C]">
                                {new Date(exam.date).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Thời gian</div>
                              <div className="text-sm font-medium text-[#0A1B3C]">{exam.time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Phòng thi</div>
                              <div className="text-sm font-medium text-[#0A1B3C]">{exam.room}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${exam.daysLeft <= 0 ? 'bg-green-100 text-green-700' : exam.daysLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          {exam.daysLeft <= 0 ? 'Đang diễn ra' : `Còn ${exam.daysLeft} ngày`}
                        </div>
                        <button
                          onClick={() => navigate(`/student/exam-lobby/${exam.id}?classSubjectId=${exam.classSubjectId}`)}
                          className="px-4 py-2 w-full bg-[#0A1B3C] hover:bg-[#1a3a6c] text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Vào Lobby
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Exams */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0A1B3C]">Lịch sử bài thi</h2>
            </div>

            {filteredPast.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-xl border-dashed border-gray-300">
                Chưa có lịch sử làm bài.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Môn học</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Mã môn</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Loại bài thi</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Thời gian</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Điểm (hệ 10)</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPast.map(exam => (
                      <tr key={exam.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-[#0A1B3C]">{exam.course}</td>
                        <td className="p-4 text-gray-600 font-mono text-sm">{exam.code}</td>
                        <td className="p-4 text-gray-600">{exam.type}</td>
                        <td className="p-4 text-center text-gray-600 text-sm">
                          {new Date(exam.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4 text-center font-bold text-orange-600 text-lg">
                          {exam.score !== null ? Number(exam.score).toFixed(1) : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {exam.isSubmitted ? (
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                              Đã nộp bài
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                              Bỏ lỡ
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/student/exam-lobby/${exam.id}?classSubjectId=${exam.classSubjectId}`)}
                            className="text-orange-500 text-sm font-semibold hover:text-orange-600 hover:underline"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StudentExams;
