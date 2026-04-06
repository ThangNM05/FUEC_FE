import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Award, BarChart2, CheckCircle, ChevronDown, Loader2 } from 'lucide-react';
import { useGetStudentSubjectsQuery } from '@/api/studentsApi';
import { useGetSemestersQuery } from '@/api/semestersApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/authSlice';

function StudentGrades() {
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const user = useSelector(selectCurrentUser);

  // Fetch real semesters
  const { data: semestersData, isLoading: isLoadingSemesters } = useGetSemestersQuery({
    page: 1,
    pageSize: 100,
  });

  const semesters = semestersData?.items || [];

  // Set default semester
  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      const current = semesters.find(s => s.isDefault) || semesters[0];
      setSelectedSemesterId(current.id);
    }
  }, [semesters, selectedSemesterId]);

  // Fetch the actual courses the student is enrolled in for the selected semester
  const { data: studentSubjects, isLoading, isFetching } = useGetStudentSubjectsQuery(
    { 
      studentId: user?.entityId ?? user?.id ?? '',
      semesterId: selectedSemesterId
    },
    { skip: !user?.entityId || !selectedSemesterId }
  );

  // We map the real grade data provided by our Backend heuristic logic
  const courses = studentSubjects?.map((sub, index) => ({
    id: sub.classSubjectId || index,
    name: sub.subjectName,
    code: sub.subjectCode,
    assignments: sub.assignmentsAverage ?? '-',
    midterm: sub.midterm ?? '-',
    final: sub.final ?? null,
    overall: sub.overall ?? '-',
    grade: sub.gradeLetter ?? 'In Progress',
    credits: sub.credits ?? 0,
  })) || [];

  const completedCoursesCount = studentSubjects?.length || 0;
  
  const earnedCredits = studentSubjects
    ?.filter(sub => sub.overall && sub.overall >= 5 && sub.final)
    .reduce((sum, sub) => sum + (sub.credits || 0), 0) || 0;

  // Simplistic GPA calculation algorithm (scale 4.0) purely for UX
  // A: 4.0 (>= 9), B+: 3.5 (>= 8), B: 3.0 (>= 7), C+: 2.5 (>= 6), C: 2.0 (>= 5), F: 0 (< 5)
  let totalGradePoints = 0;
  let totalCreditsForGpa = 0;
  studentSubjects?.forEach(sub => {
    if (sub.overall && sub.final) {
      let gp = 0;
      if (sub.overall >= 9) gp = 4.0;
      else if (sub.overall >= 8) gp = 3.5;
      else if (sub.overall >= 7) gp = 3.0;
      else if (sub.overall >= 6) gp = 2.5;
      else if (sub.overall >= 5) gp = 2.0;

      totalGradePoints += gp * (sub.credits || 3);
      totalCreditsForGpa += (sub.credits || 3);
    }
  });

  const gpa = totalCreditsForGpa > 0 ? (totalGradePoints / totalCreditsForGpa).toFixed(2) : 'N/A';

  const gradesSummary = [
    { label: 'GPA', value: gpa, icon: TrendingUp, color: 'orange' },
    { label: 'Credits Earned', value: earnedCredits.toString(), icon: Award, color: 'orange-light' },
    { label: 'Courses Enrolled', value: completedCoursesCount.toString(), icon: CheckCircle, color: 'orange' },
    { label: 'Current Semester', value: gpa, icon: BarChart2, color: 'orange-light' }
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
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search courses..." className="outline-none text-sm text-[#0A1B3C] bg-transparent w-40" />
          </div>

          {/* Semester Selector */}
          <div className="relative">
            {isLoadingSemesters ? (
              <div className="w-32 h-10 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-medium text-sm"
                  onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
                >
                  <span>{semesters.find(s => s.id === selectedSemesterId)?.semesterCode || 'Select Term'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showSemesterDropdown && (
                  <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                    {semesters.map(semester => (
                      <div
                        key={semester.id}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedSemesterId === semester.id ? 'bg-orange-50 text-orange-600' : ''}`}
                        onClick={() => {
                          setSelectedSemesterId(semester.id);
                          setShowSemesterDropdown(false);
                        }}
                      >
                        {semester.semesterCode}
                      </div>
                    ))}
                  </div>
                )}
              </>
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
        </div>

        <div className="overflow-x-auto relative min-h-[200px]">
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#F37022] animate-spin" />
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Class / Course</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Assignments (Avg)</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Progress Tests (Avg)</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Credits</th>
              </tr>
            </thead>
            <tbody>
              {studentSubjects?.length === 0 && !isLoading && !isFetching && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    You have not enrolled in any courses for this term.
                  </td>
                </tr>
              )}
              {studentSubjects?.map(course => (
                <React.Fragment key={course.classSubjectId}>
                  <tr 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedCourseId(expandedCourseId === course.classSubjectId ? null : course.classSubjectId)}
                  >
                    <td className="p-4 font-medium text-[#0A1B3C]">
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`w-4 h-4 text-[#F37022] transition-transform ${expandedCourseId === course.classSubjectId ? 'rotate-180' : ''}`} />
                        <div className="flex flex-col">
                           <span className="font-bold text-lg text-[#0A1B3C] leading-tight">{course.classCode}</span>
                           <span className="text-xs text-gray-500 font-normal">{course.subjectName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded inline-block">
                        {course.subjectCode}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium text-gray-500">{course.assignmentsAverage ?? '-'}</td>
                    <td className="p-4 text-center font-medium text-gray-500">{course.midterm ?? '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(course.gradeLetter || 'In Progress')}`}>
                        {course.gradeLetter || 'In Progress'}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-500">{course.credits}</td>
                  </tr>
                  
                  {expandedCourseId === course.classSubjectId && course.detailedGrades && course.detailedGrades.length > 0 && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="p-4 border-b border-gray-200 shadow-inner">
                        <div className="pl-6">
                          <h4 className="text-sm font-bold text-[#F37022] mb-3">
                             Detailed Component Grades
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {course.detailedGrades.map(item => (
                              <div key={item.id} className="bg-white border border-gray-200 rounded p-3 text-center shadow-sm">
                                <div className="text-xs text-gray-500 truncate mb-1" title={item.name}>{item.name}</div>
                                <div className={`font-bold text-lg ${item.grade != null ? 'text-[#0A1B3C]' : 'text-gray-400'}`}>
                                  {item.grade != null ? item.grade : '-'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default StudentGrades;
