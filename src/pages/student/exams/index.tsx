import { useState } from 'react';
import { Search, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

function StudentExams() {
  const [semester, setSemester] = useState('SPRING2025');

  const upcomingExams = [
    {
      id: 1,
      course: 'Database Systems',
      code: 'DBS202',
      type: 'Midterm Exam',
      date: '2024-05-15',
      time: '8:00 AM - 10:00 AM',
      room: 'Hall A - Room 301',
      duration: '120 minutes',
      daysLeft: 3
    },
    {
      id: 2,
      course: 'Web Development',
      code: 'WEB301',
      type: 'Final Project Presentation',
      date: '2024-05-18',
      time: '2:00 PM - 4:00 PM',
      room: 'Room 205',
      duration: '120 minutes',
      daysLeft: 6
    },
    {
      id: 3,
      course: 'Software Engineering',
      code: 'SWE101',
      type: 'Final Exam',
      date: '2024-05-22',
      time: '9:00 AM - 11:30 AM',
      room: 'Hall B - Room 402',
      duration: '150 minutes',
      daysLeft: 10
    },
    {
      id: 4,
      course: 'Mobile App Development',
      code: 'MAD401',
      type: 'Final Exam',
      date: '2024-05-25',
      time: '1:00 PM - 3:30 PM',
      room: 'Hall A - Room 108',
      duration: '150 minutes',
      daysLeft: 13
    }
  ];

  const pastExams = [
    { id: 5, course: 'Data Structures', code: 'DSA201', type: 'Final Exam', date: '2024-04-20', score: 94, grade: 'A' },
    { id: 6, course: 'Algorithms', code: 'ALG301', type: 'Midterm Exam', date: '2024-04-10', score: 88, grade: 'B+' }
  ];

  return (
    <div className="p-4 md:p-6">
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
          <input type="text" placeholder="Search exams..." className="outline-none text-sm text-[#0A1B3C] bg-transparent w-40" />
        </div>
      </div>

      {/* Alert Banner */}
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-xl mb-6">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <div>
          <div className="font-semibold text-yellow-800">Upcoming Exam Alert</div>
          <div className="text-sm text-yellow-700">You have a midterm exam in 3 days. Make sure to prepare and arrive 15 minutes early.</div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#0A1B3C]">Upcoming Exams</h2>
          <button className="px-4 py-2 bg-[#F37022] text-white font-medium text-sm rounded-lg hover:bg-[#D96419]">
            Notify me
          </button>
        </div>

        <div className="space-y-4">
          {upcomingExams.map(exam => (
            <div key={exam.id} className="border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="font-semibold text-[#0A1B3C] text-lg">{exam.course}</h3>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">{exam.code}</span>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded">{exam.type}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Date</div>
                        <div className="text-sm font-medium text-[#0A1B3C]">
                          {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="text-sm font-medium text-[#0A1B3C]">{exam.room}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${exam.daysLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    In {exam.daysLeft} days
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Duration: {exam.duration}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Exams */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#0A1B3C]">Past Exams</h2>
          <a href="#" className="text-orange-500 text-sm font-medium hover:underline">View All Results</a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Date</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Score</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Grade</th>
              </tr>
            </thead>
            <tbody>
              {pastExams.map(exam => (
                <tr key={exam.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-[#0A1B3C]">{exam.course}</td>
                  <td className="p-4 text-gray-600">{exam.code}</td>
                  <td className="p-4 text-gray-600">{exam.type}</td>
                  <td className="p-4 text-center text-gray-600">
                    {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-center font-semibold text-orange-600">{exam.score}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-orange-100 text-[#F37022] text-sm font-semibold rounded-full">
                      {exam.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentExams;
