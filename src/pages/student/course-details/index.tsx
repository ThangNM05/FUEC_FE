import { useState, useMemo } from 'react';
import { ArrowLeft, FileText, Calendar, ChevronDown, ChevronUp, Download, BookOpen, Lock, CheckCircle, Clock, Loader2, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/authSlice';
import { useGetClassSubjectSlotsQuery, useGetClassSubjectByIdQuery } from '@/api/classDetailsApi';
import { useGetAssignmentsByClassSubjectIdQuery } from '@/api/assignmentsApi';
import { useGetStudentAssignmentsByStudentIdQuery } from '@/api/studentAssignmentsApi';
import { useGetExamsByClassSubjectIdQuery } from '@/api/examsApi';
import { useGetStudentClassesQuery } from '@/api/studentsApi';
import type { Assignment, StudentAssignment } from '@/types/assignment.types';
import StudentSlotContent from './StudentSlotContent';

interface Question {
  id: number;
  title: string;
  status: 'custom' | 'finished';
}

export type ExtendedAssignment = Assignment & {
  submitted: boolean;
  timeRemaining: string | null;
  isOverdue: boolean;
  studentSubmission?: StudentAssignment;
};

interface Slot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  topics: string[];
  questions: Question[];
  assignments: ExtendedAssignment[];
  expanded: boolean;
  status: 'locked' | 'completed' | 'pending' | 'urgent' | 'overdue';
  remaining?: string;
}

interface ProgressTest {
  id: number;
  title: string;
  questions: number;
  duration: number;
  status: 'completed' | 'available' | 'locked';
  score: number | null;
}

interface Material {
  id: number;
  title: string;
  type: 'Lecture' | 'Lab';
  date: string;
  downloadable: boolean;
}

function CourseDetails() {
  const navigate = useNavigate();
  const { classSubjectId } = useParams<{ classSubjectId: string }>();
  const [activeSection, setActiveSection] = useState('assignments');
  const [currentPage, setCurrentPage] = useState(1);
  const [slotContentsExpanded, setSlotContentsExpanded] = useState(false);
  const SLOTS_PER_PAGE = 10;

  const user = useSelector(selectCurrentUser);

  const { data: slotsData, isLoading: isSlotsLoading, isError } = useGetClassSubjectSlotsQuery(classSubjectId || '', {
    skip: !classSubjectId
  });

  const { data: classSubjectData, isLoading: isClassLoading } = useGetClassSubjectByIdQuery(classSubjectId || '', {
    skip: !classSubjectId
  });

  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useGetAssignmentsByClassSubjectIdQuery(classSubjectId || '', {
    skip: !classSubjectId
  });

  const { data: studentAssignmentsData, isLoading: isStudentAssignmentsLoading } = useGetStudentAssignmentsByStudentIdQuery(user?.entityId ?? user?.id ?? '', {
    skip: !user?.id
  });

  const { data: examsData, isLoading: isLoadingExams } = useGetExamsByClassSubjectIdQuery(classSubjectId || '', {
    skip: !classSubjectId
  });

  // Need user's StudentClasses to know their ID for this course
  // We use studentId: user?.entityId ?? user?.id
  const { data: studentClassesData } = useGetStudentClassesQuery({
    studentId: user?.entityId ?? user?.id,
    pageSize: 100
  }, { skip: !user?.id });

  // Find the exact StudentClass object for this classSubject's classId
  const currentStudentClassId = useMemo(() => {
    if (!classSubjectData?.classId || !studentClassesData?.items) return null;
    const match = studentClassesData.items.find((sc: any) => sc.classId === classSubjectData.classId);
    return match?.id || null;
  }, [classSubjectData, studentClassesData]);


  const isLoading = isSlotsLoading || isClassLoading || isAssignmentsLoading || isStudentAssignmentsLoading || isLoadingExams;

  const course = {
    name: classSubjectData?.subjectName || slotsData?.subjectName || 'Loading...',
    code: classSubjectData?.subjectCode || slotsData?.subjectCode || '...',
    instructor: classSubjectData?.teacherName || 'N/A',
    schedule: classSubjectData?.classCode ? `${classSubjectData.classCode}` : 'N/A',
    room: 'N/A',
    credits: classSubjectData?.subjectCredits || 0
  };

  const courseAssignments = useMemo(() => {
    if (!assignmentsData?.items) return [];

    const submissions = studentAssignmentsData?.items || [];

    return assignmentsData.items.map((assignment: Assignment) => {
      const submission = submissions.find((sub: StudentAssignment) => sub.assignmentId === assignment.id);

      let timeRemaining = null;
      let isOverdue = false;

      if (assignment.dueDate) {
        const due = new Date(assignment.dueDate).getTime();
        const now = new Date().getTime();
        const diff = due - now;

        if (diff < 0) {
          timeRemaining = 'Overdue';
          isOverdue = true;
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

          let parts = [];
          if (days > 0) parts.push(`${days}d`);
          if (hours > 0) parts.push(`${hours}h`);
          if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

          timeRemaining = `${parts.join(' ')} left`;
        }
      }

      return {
        ...assignment,
        submitted: !!submission,
        timeRemaining: !submission ? timeRemaining : null,
        isOverdue: !submission && isOverdue,
        studentSubmission: submission
      };
    }).sort((a: ExtendedAssignment, b: ExtendedAssignment) => a.instanceNumber - b.instanceNumber);
  }, [assignmentsData, studentAssignmentsData]);


  const learningMaterials: Material[] = [
    { id: 1, title: 'Week 1: Introduction to Mobile Development', type: 'Lecture', date: '2024-05-01', downloadable: true },
    { id: 2, title: 'Lab 1: Android Studio Setup', type: 'Lab', date: '2024-05-03', downloadable: true },
    { id: 3, title: 'Week 2: UI Components', type: 'Lecture', date: '2024-05-08', downloadable: true },
    { id: 4, title: 'Lab 2: Building First App', type: 'Lab', date: '2024-05-10', downloadable: true }
  ];

  const progressTests = useMemo(() => {
    return (examsData?.items || []).map((exam: any) => {
      const now = new Date();
      const start = new Date(exam.startTime);
      const end = new Date(exam.endTime);

      let status: 'completed' | 'available' | 'locked' = 'locked';
      if (now >= start && now <= end) {
        status = 'available';
      } else if (now > end) {
        status = 'completed';
      }

      return {
        id: exam.id,
        title: exam.displayName || (exam.category ? `${exam.category} ${exam.instanceNumber}` : `Progress Test ${exam.instanceNumber}`),
        startTime: exam.startTime,
        endTime: exam.endTime,
        questions: exam.questions?.length || 0,
        duration: 0, // Duration could be derived from endTime - startTime if needed
        status: status,
        slotId: exam.slotId,
        isSubmitted: exam.isSubmitted,
        score: exam.grade !== null && exam.grade !== undefined ? exam.grade : null
      };
    });
  }, [examsData]);

  const [expandedSlots, setExpandedSlots] = useState<{ [key: string]: boolean }>({});

  const toggleSlot = (slotId: string) => {
    setExpandedSlots(prev => ({
      ...prev,
      [slotId]: !prev[slotId]
    }));
  };

  const slots: Slot[] = slotsData?.slots.map(slot => ({
    id: slot.id,
    title: `Slot ${slot.slotIndex}`,
    startTime: new Date(slot.date).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
    endTime: new Date(slot.endDate).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
    topics: slot.sessions.map((s: any) => s.topic),
    questions: [], // Mocking for now as not in this API
    assignments: [], // Mocking for now as not in this API
    expanded: !!expandedSlots[slot.id],
    status: 'pending' as const, // Defaulting for now
    remaining: undefined
  })) || [];

  const handleSlotClick = (slotId: string) => {
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return;

    const slotPage = Math.ceil((index + 1) / SLOTS_PER_PAGE);
    setCurrentPage(slotPage);

    // Ensure it's expanded
    setExpandedSlots(prev => ({ ...prev, [slotId]: true }));

    // Small timeout to allow state changes to propagate
    setTimeout(() => {
      scrollToSection(`slot-${slotId}`);
    }, 150);
  };

  const slotMap = useMemo(() => {
    const map: Record<string, string> = {};
    slotsData?.slots.forEach(slot => {
      map[slot.id] = `Slot ${slot.slotIndex}`;
    });
    return map;
  }, [slotsData]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 relative p-4 md:p-6 animate-fadeIn">
      {/* Main Content - Left Side */}
      <div className="flex-1 min-w-0">
        {/* Course Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/student/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0A1B3C] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-2">{course.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
            <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">
              {course.code}
            </span>
            <span>•</span>
            <span>{course.instructor}</span>
            <span>•</span>
            <span>{course.schedule}</span>
          </div>
        </div>

        {/* Assignments Section */}
        <div id="assignments" className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 md:pb-8 mb-6 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-4">Assignments</h2>
          <div className="space-y-3">
            {courseAssignments.map(assignment => (
              <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0A1B3C] text-sm">
                      {assignment.displayName || `ASM${assignment.instanceNumber}`}
                      {assignment.slotId && slotMap[assignment.slotId] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotClick(assignment.slotId!);
                          }}
                          className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tight hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer"
                          title={`Go to ${slotMap[assignment.slotId]}`}
                        >
                          {slotMap[assignment.slotId]}
                        </button>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {assignment.timeRemaining && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className={`text-xs font-semibold flex items-center gap-1 ${assignment.isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                            <Clock className="w-3 h-3" />
                            {assignment.timeRemaining}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${assignment.studentSubmission?.grade !== null && assignment.studentSubmission?.grade !== undefined
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : assignment.submitted
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-[#F37022] text-white hover:bg-[#D96419]'
                    }`}
                  onClick={() => navigate(`/student/assignment-submission/${assignment.id}`)}
                >
                  {assignment.submitted || (assignment.studentSubmission?.grade !== null && assignment.studentSubmission?.grade !== undefined)
                    ? 'Review'
                    : 'Submit'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Tests */}
        <div id="progress-tests" className="bg-white rounded-xl border border-gray-200 p-6 pb-8 mb-6 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-4">Progress Tests</h2>
          <div className="space-y-3">
            {progressTests.length === 0 ? (
              <p className="text-gray-500 italic">No progress tests available for this course.</p>
            ) : progressTests.map(test => (
              <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${test.isSubmitted || test.status === 'completed' ? 'bg-green-100' :
                    test.status === 'available' ? 'bg-blue-100' :
                      'bg-gray-200'
                    }`}>
                    {test.isSubmitted || test.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                      test.status === 'available' ? <Play className="w-5 h-5 text-blue-600" /> :
                        <Lock className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0A1B3C] text-sm">
                      {test.title}
                      {test.slotId && slotMap[test.slotId] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotClick(test.slotId!);
                          }}
                          className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tight hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer"
                          title={`Go to ${slotMap[test.slotId]}`}
                        >
                          {slotMap[test.slotId]}
                        </button>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      {/* <span className="text-xs text-gray-500">{test.questions} questions</span> */}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        End: {new Date(test.endTime).toLocaleString('en-GB')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${test.isSubmitted || test.status === 'completed' ? 'bg-green-100 text-green-700' :
                    test.status === 'available' ? 'bg-[#F37022] text-white hover:bg-[#D96419]' :
                      'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  disabled={test.status === 'locked'}
                  onClick={() => {
                    if (test.status === 'available' || test.status === 'completed' || test.isSubmitted) {
                      navigate(`/student/exam-lobby/${test.id}?classSubjectId=${classSubjectId}`);
                    }
                  }}
                >
                  {test.isSubmitted || test.status === 'completed' ? 'Review' :
                    test.status === 'available' ? 'Start Test' :
                      'Locked'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Materials - PDFs/Files */}
        <div id="learning-materials" className="bg-white rounded-xl border border-gray-200 p-6 pb-8 mb-6 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-4">Learning Materials</h2>
          <div className="space-y-3">
            {learningMaterials.map(material => (
              <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#F37022]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0A1B3C] text-sm">{material.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-medium">
                        {material.type}
                      </span>
                      <span className="text-xs text-gray-500">{material.date}</span>
                    </div>
                  </div>
                </div>
                {material.downloadable && (
                  <button className="p-2 hover:bg-white rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slot Contents */}
        <div id="slot-contents" className="bg-white rounded-xl border border-gray-200 p-6 pb-8 mb-6 scroll-mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#0A1B3C]">Slot Contents</h2>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#F37022]" />}
            {!isLoading && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {Math.ceil(slots.length / SLOTS_PER_PAGE) || 1}
              </div>
            )}
          </div>

          {isError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-4">
              Failed to load slots data. Please try again.
            </div>
          )}

          <div className="space-y-4">
            {slots
              .slice((currentPage - 1) * SLOTS_PER_PAGE, currentPage * SLOTS_PER_PAGE)
              .map(slot => (
                <div key={slot.id} id={`slot-${slot.id}`} className={`border rounded-lg overflow-hidden scroll-mt-6 mb-4 ${slot.status === 'locked' ? 'border-gray-300 opacity-60' :
                  slot.status === 'overdue' ? 'border-red-400' :
                    slot.status === 'urgent' ? 'border-orange-300' :
                      slot.status === 'completed' ? 'border-green-300' :
                        'border-gray-200'
                  }`}>
                  {/* Slot Header */}
                  <div className={`p-4 ${slot.status === 'locked' ? 'bg-gray-100' :
                    slot.status === 'overdue' ? 'bg-red-50' :
                      slot.status === 'urgent' ? 'bg-orange-50' :
                        slot.status === 'completed' ? 'bg-green-50' :
                          'bg-gray-50'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${slot.status === 'locked' ? 'bg-gray-200 text-gray-500' :
                          slot.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            slot.status === 'urgent' ? 'bg-orange-100 text-orange-700' :
                              slot.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                          }`}>
                          {slot.title}
                        </span>
                        {slot.status === 'locked' && (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        {slot.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {slot.status === 'urgent' && (
                          <>
                            <Clock className="w-4 h-4 text-orange-500" />
                            {slot.remaining && (
                              <span className="text-xs text-orange-600 font-medium">{slot.remaining} left</span>
                            )}
                          </>
                        )}
                        {slot.status === 'pending' && slot.remaining && (
                          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {slot.remaining} left
                          </span>
                        )}
                        {slot.status === 'overdue' && (
                          <span className="text-xs text-red-600 font-bold uppercase border border-red-200 bg-red-50 px-2 py-0.5 rounded">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleSlot(slot.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        disabled={slot.status === 'locked'}
                      >
                        {slot.expanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>

                    <div className="space-y-1">
                      {slot.topics.map((topic, index) => (
                        <div key={index} className="text-sm font-medium text-[#0A1B3C]">
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slot Content (Expandable) */}
                  {slot.expanded && (
                    <StudentSlotContent
                      slotId={slot.id}
                      slotAssignments={courseAssignments.filter(a => {
                        // Strict filtering: only show assignments that explicitly belong to this slot
                        return a.slotId === slot.id;
                      })}
                      slotExams={(examsData?.items || []).filter(e => e.slotId === slot.id)}
                      studentClassesId={currentStudentClassId}
                    />
                  )}
                </div>
              ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(slots.length / SLOTS_PER_PAGE) || 1 }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                    ? 'bg-[#F37022] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(slots.length / SLOTS_PER_PAGE) || 1, prev + 1))}
              disabled={currentPage === (Math.ceil(slots.length / SLOTS_PER_PAGE) || 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Right Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <h3 className="font-bold text-[#0A1B3C] mb-3">Contents</h3>
            <div className="space-y-1">
              <button
                onClick={() => scrollToSection('assignments')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'assignments'
                  ? 'bg-orange-50 text-[#F37022]'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Assignments
              </button>

              <button
                onClick={() => scrollToSection('progress-tests')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'progress-tests'
                  ? 'bg-orange-50 text-[#F37022]'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Progress Tests
              </button>

              <button
                onClick={() => scrollToSection('learning-materials')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'learning-materials'
                  ? 'bg-orange-50 text-[#F37022]'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Learning Materials
              </button>

              {/* Slot Contents with Dropdown */}
              <div>
                <button
                  onClick={() => {
                    setSlotContentsExpanded(!slotContentsExpanded);
                    scrollToSection('slot-contents');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${activeSection === 'slot-contents' || activeSection.startsWith('slot-')
                    ? 'bg-orange-50 text-[#F37022]'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Slot Contents
                  {slotContentsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {slotContentsExpanded && (
                  <div className="pl-3 space-y-1 mt-1">
                    {slots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => {
                          if (slot.status !== 'locked') {
                            const index = slots.findIndex(s => s.id === slot.id);
                            const slotPage = Math.ceil((index + 1) / SLOTS_PER_PAGE);
                            setCurrentPage(slotPage);
                            setTimeout(() => scrollToSection(`slot-${slot.id}`), 100);
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-start justify-between group ${slot.status === 'locked' ? 'text-gray-400 cursor-not-allowed' :
                          activeSection === `slot-${slot.id}` ? 'bg-orange-50 text-[#F37022]' :
                            'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${slot.status === 'completed' ? 'bg-green-500' :
                            slot.status === 'overdue' ? 'bg-red-500' :
                              slot.status === 'urgent' ? 'bg-orange-500' :
                                slot.status === 'pending' ? 'bg-blue-500' :
                                  'bg-gray-300'
                            }`}></span>
                          <span>{slot.title}</span>
                        </div>

                        {/* Sidebar Remaining/Status Info */}
                        <div className="text-[10px] text-right ml-1">
                          {slot.status === 'overdue' && (
                            <span className="text-red-500 font-bold block">OVERDUE</span>
                          )}
                          {slot.remaining && slot.status !== 'overdue' && (
                            <span className={`${slot.status === 'urgent' ? 'text-orange-500 font-medium' : 'text-blue-500'
                              }`}>
                              {slot.remaining}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
