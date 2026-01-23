import { useState } from 'react';
import { Search, TrendingUp, Award, BarChart2, CheckCircle, ChevronDown } from 'lucide-react';

function StudentGrades() {
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [currentSemester, setCurrentSemester] = useState('Fall 2024');

  const semesters = ['Fall 2024', 'Summer 2024', 'Spring 2024', 'Fall 2023', 'Summer 2023'];

  const gradesSummary = [
    { label: 'GPA', value: '3.65', icon: TrendingUp, color: 'orange' },
    { label: 'Credits Earned', value: '48', icon: Award, color: 'orange-light' },
    { label: 'Courses Completed', value: '12', icon: CheckCircle, color: 'orange' },
    { label: 'Current Semester', value: '4.0', icon: BarChart2, color: 'orange-light' }
  ];

  const courses = [
    { id: 1, name: 'Software Engineering', code: 'SWE101', assignments: 85, midterm: 78, final: 88, overall: 84, grade: 'B+', credits: 4 },
    { id: 2, name: 'Database Systems', code: 'DBS202', assignments: 92, midterm: 85, final: null, overall: 89, grade: 'In Progress', credits: 4 },
    { id: 3, name: 'Web Development', code: 'WEB301', assignments: 88, midterm: 90, final: null, overall: 89, grade: 'In Progress', credits: 3 },
    { id: 4, name: 'Data Structures', code: 'DSA201', assignments: 95, midterm: 92, final: 94, overall: 94, grade: 'A', credits: 4 }
  ];

  const gradeDistribution = [
    { grade: 'A', count: 3, percentage: 25 },
    { grade: 'B+', count: 4, percentage: 33 },
    { grade: 'B', count: 3, percentage: 25 },
    { grade: 'C+', count: 2, percentage: 17 },
    { grade: 'C', count: 0, percentage: 0 }
  ];

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-[#0066b3] bg-blue-50 font-bold';
    if (grade === 'B+' || grade === 'B') return 'text-orange-600 bg-orange-50';
    if (grade === 'In Progress') return 'text-orange-500 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getIconColor = (color: string) => {
    const colors: { [key: string]: string } = {
      orange: 'bg-orange-100 text-[#F37022]',
      'orange-light': 'bg-orange-50 text-orange-500'
    };
    return colors[color] || colors.orange;
  };

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Grades</h1>
          <p className="text-gray-600 mt-1">Track your academic performance and progress.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search courses..." className="outline-none text-sm text-[#0A1B3C] bg-transparent w-40" />
          </div>

          {/* Semester Selector */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-medium text-sm"
              onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
            >
              <span>{currentSemester}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showSemesterDropdown && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                {semesters.map(semester => (
                  <div
                    key={semester}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${currentSemester === semester ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => {
                      setCurrentSemester(semester);
                      setShowSemesterDropdown(false);
                    }}
                  >
                    {semester}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {gradesSummary.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold text-[#0A1B3C]">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
                <div className={`w-12 h-12 ${getIconColor(stat.color)} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Grades Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-[#0A1B3C]">Course Grades</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200">Fall 2024</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200">All Semesters</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Assignments</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Midterm</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Final</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Overall</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Credits</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-[#0A1B3C]">{course.name}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded inline-block">
                      {course.code}
                    </span>
                  </td>
                  <td className="p-4 text-center font-medium text-[#0A1B3C]">{course.assignments}</td>
                  <td className="p-4 text-center font-medium text-[#0A1B3C]">{course.midterm}</td>
                  <td className="p-4 text-center font-medium text-[#0A1B3C]">
                    {course.final || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="p-4 text-center font-semibold text-orange-600">{course.overall}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(course.grade)}`}>
                      {course.grade}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-700">{course.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-[#0A1B3C] mb-5">Grade Distribution</h2>
        <div className="grid grid-cols-5 gap-4">
          {gradeDistribution.map(item => (
            <div key={item.grade} className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{item.count}</div>
              <div className="font-semibold text-gray-700">Grade {item.grade}</div>
              <div className="text-sm text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentGrades;
