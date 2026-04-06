import { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useGetCurrentUserQuery } from '@/api/authApi';
import { useGetAllExamsQuery } from '@/api/examsApi';
import { useGetSemestersQuery } from '@/api/semestersApi';

function StudentExams() {
  const navigate = useNavigate();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: profile } = useGetCurrentUserQuery();
  const studentId = profile?.result?.id || profile?.id;

  const { data: semestersData } = useGetSemestersQuery({ pageSize: 100 });
  const semesters = semestersData?.items || [];

  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      const defaultSem = semesters.find(s => s.isDefault) || semesters[0];
      setSelectedSemesterId(defaultSem.id);
    }
  }, [semesters, selectedSemesterId]);

  const { data: examsData, isLoading } = useGetAllExamsQuery(
    { studentId, semesterId: selectedSemesterId },
    { skip: !studentId || !selectedSemesterId }
  );

  const exams = examsData?.items || [];

  const { upcomingExams, pastExams } = useMemo(() => {
    const upcoming: any[] = [];
    const past: any[] = [];
    const now = Date.now();

    exams.forEach(exam => {
      const startTime = new Date(exam.startTime).getTime();
      const endTime = new Date(exam.endTime).getTime();
      const isPast = exam.isSubmitted || (endTime < now);
      const isOngoing = now >= startTime && now <= endTime;
      const daysLeft = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24));

      const examItem = {
        ...exam,
        subjectLabel: exam.subjectName || 'Unknown Subject',
        subjectCode: exam.subjectCode || '-',
        examName: exam.displayName || (exam.category ? `${exam.category} ${exam.instanceNumber}` : `Progress Test ${exam.instanceNumber}`),
        course: exam.subjectName || exam.displayName || exam.category,
        code: exam.subjectCode || '-',
        type: exam.tag || 'Exam',
        dueDate: exam.endTime,
        time: `${new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        duration: Math.round((endTime - startTime) / 60000) + ' minutes',
        daysLeft: daysLeft,
        isOngoing: isOngoing,
        score: exam.grade !== null && exam.grade !== undefined ? exam.grade : null,
        grade: exam.grade !== null && exam.grade !== undefined ? (exam.grade >= 5 ? 'Pass' : 'Fail') : '-',
      };

      if (isPast) {
        past.push(examItem);
      } else {
        upcoming.push(examItem);
      }
    });

    // Sort upcoming by endTime ascending, past by endTime descending
    upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    past.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

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
    <div className="p-4 md:p-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Exam Schedule</h1>
          <select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
          >
            {semesters.map(s => (
              <option key={s.id} value={s.id}>
                {s.semesterCode}
              </option>
            ))}
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
          {nearestExam && (nearestExam.isOngoing || (nearestExam.daysLeft > 0 && nearestExam.daysLeft <= 3)) && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-xl mb-6 shadow-sm">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-yellow-800">
                  {nearestExam.isOngoing ? 'Ongoing Exam' : 'Upcoming Exam'}
                </div>
                <div className="text-sm text-yellow-700">
                  {nearestExam.isOngoing
                    ? `You have an on going exam for ${nearestExam.course}. Please complete it before the deadline!`
                    : `You have an exam for ${nearestExam.course} due in ${nearestExam.daysLeft <= 0 ? 'less than a day' : `${nearestExam.daysLeft} days`}. Get ready!`
                  }
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#F37022]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#F37022]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0A1B3C]">Upcoming Exams</h1>
              <p className="text-gray-500 text-sm mt-0.5">Manage your exam schedules and participation</p>
            </div>
          </div>
          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0A1B3C]">Upcoming Exams</h2>
            </div>

            <div className="space-y-4">
              {filteredUpcoming.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming exams.
                </div>
              ) : (
                filteredUpcoming.map(exam => (
                  <div key={exam.id} className="border border-gray-200 rounded-xl p-5 hover:border-orange-200 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-[#0A1B3C] text-lg">{exam.subjectLabel}</h3>
                          {exam.subjectCode && exam.subjectCode !== '-' && (
                            <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {exam.subjectCode}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded">{exam.type}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{exam.examName}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Due Date</div>
                              <div className="text-sm font-medium text-[#0A1B3C]">
                                {new Date(exam.dueDate).toLocaleDateString('en-GB')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Time</div>
                              <div className="text-sm font-medium text-[#0A1B3C]">{exam.time}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${exam.isOngoing ? 'bg-green-100 text-green-700' : exam.daysLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          {exam.isOngoing ? 'Ongoing' : `${exam.daysLeft} days left`}
                        </div>
                        <button
                          onClick={() => navigate(`/student/exam-lobby/${exam.id}?classSubjectId=${exam.classSubjectId}`)}
                          className="px-4 py-2 w-full bg-[#0A1B3C] hover:bg-[#F37022] text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Enter Exam
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
              <h2 className="text-lg font-bold text-[#0A1B3C]">Exam History</h2>
            </div>

            {filteredPast.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-xl border-dashed border-gray-300">
                No exam history found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Course</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Due Date</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Grade (10-pt)</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPast.map(exam => (
                      <tr key={exam.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#0A1B3C]">{exam.subjectLabel}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{exam.examName}</span>
                            {exam.subjectCode && exam.subjectCode !== '-' && (
                              <span className="text-[10px] font-bold text-[#0066b3] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit mt-1">
                                {exam.subjectCode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{exam.type}</td>
                        <td className="p-4 text-center text-gray-600 text-sm">
                          {new Date(exam.dueDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="p-4 text-center font-bold text-orange-600 text-lg">
                          {exam.score !== null ? Number(exam.score).toFixed(1) : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {exam.isSubmitted ? (
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                              Submitted
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                              Missed
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/student/exam-lobby/${exam.id}?classSubjectId=${exam.classSubjectId}`)}
                            className="text-orange-500 text-sm font-semibold hover:text-orange-600 hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Spacer to prevent overlap with floating navigation bar */}
          <div className="h-20" />
        </>
      )}
    </div>
  );
}

export default StudentExams;
