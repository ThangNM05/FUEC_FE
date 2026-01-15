import { useState } from 'react';
import { ArrowLeft, FileText, Calendar, ChevronDown, ChevronUp, Download, BookOpen, Play, Lock, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Question {
  id: number;
  title: string;
  status: 'custom' | 'finished';
}

interface Assignment {
  id: number;
  title: string;
}

interface Slot {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  topics: string[];
  questions: Question[];
  assignments: Assignment[];
  expanded: boolean;
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
  const [activeSection, setActiveSection] = useState('assignments');

  const course = {
    name: 'Mobile App Development',
    code: 'MAD401',
    instructor: 'Prof. Nguyen Van A',
    schedule: 'Mon, Wed 8:00 AM - 10:00 AM',
    room: 'Room 301',
    credits: 3
  };

  const courseAssignments = [
    { id: 1, title: 'Assignment 1: Requirements Analysis', due: '2024-05-10', submitted: true, timeRemaining: null },
    { id: 2, title: 'Assignment 2: Design Patterns', due: '2024-05-17', submitted: false, timeRemaining: '3hr remaining' },
    { id: 3, title: 'Final Project: Software Development', due: '2024-06-01', submitted: false, timeRemaining: '5 days remaining' }
  ];

  const learningMaterials: Material[] = [
    { id: 1, title: 'Week 1: Introduction to Mobile Development', type: 'Lecture', date: '2024-05-01', downloadable: true },
    { id: 2, title: 'Lab 1: Android Studio Setup', type: 'Lab', date: '2024-05-03', downloadable: true },
    { id: 3, title: 'Week 2: UI Components', type: 'Lecture', date: '2024-05-08', downloadable: true },
    { id: 4, title: 'Lab 2: Building First App', type: 'Lab', date: '2024-05-10', downloadable: true }
  ];

  const progressTests: ProgressTest[] = [
    { id: 1, title: 'Quiz 1: OOP Fundamentals', questions: 20, duration: 30, status: 'completed', score: 85 },
    { id: 2, title: 'Midterm Exam', questions: 50, duration: 90, status: 'available', score: null },
    { id: 3, title: 'Quiz 2: Design Patterns', questions: 15, duration: 20, status: 'locked', score: null }
  ];

  // Generate 20 slots with realistic data
  const [slots, setSlots] = useState<Slot[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Slot ${i + 1}`,
      startTime: '12:30 10/09/2025',
      endTime: '14:45 10/09/2025',
      topics: i === 0
        ? ['Mobile Development Overview', 'Android Introduction', 'Android Studio', 'Android Application Structure']
        : [`Topic ${i * 3 + 1}`, `Topic ${i * 3 + 2}`, `Topic ${i * 3 + 3}`],
      questions: [
        { id: 1, title: 'What is android?', status: 'finished' as const },
        { id: 2, title: 'What is Android Structure?', status: 'finished' as const },
        { id: 3, title: 'Explain android activity life cycle?', status: 'custom' as const }
      ],
      assignments: [
        { id: 1, title: 'Submit Demo Hello World!' }
      ],
      expanded: i === 0
    }))
  );

  const toggleSlot = (slotId: number) => {
    setSlots(slots.map(slot =>
      slot.id === slotId ? { ...slot, expanded: !slot.expanded } : slot
    ));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex p-6 gap-6">
      {/* Main Content - Left Side */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Course Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            onClick={() => navigate('/student/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0A1B3C] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-[#0A1B3C] mb-2">{course.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">
              {course.code}
            </span>
            <span>•</span>
            <span>{course.instructor}</span>
            <span>•</span>
            <span>{course.schedule}</span>
            <span>•</span>
            <span>{course.room}</span>
          </div>
        </div>

        {/* Assignments Section */}
        <div id="assignments" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-4">Assignments</h2>
          <div className="space-y-3">
            {courseAssignments.map(assignment => (
              <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0A1B3C] text-sm">{assignment.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">Due: {assignment.due}</p>
                      {assignment.timeRemaining && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {assignment.timeRemaining}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${assignment.submitted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#F37022] text-white hover:bg-[#D96419]'
                    }`}
                  onClick={() => navigate('/student/assignment')}
                >
                  {assignment.submitted ? 'Submitted' : 'Submit'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Materials - PDFs/Files */}
        <div id="learning-materials" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-6">
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
        <div id="slot-contents" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-4">Slot Contents</h2>
          <div className="space-y-4">
            {slots.map(slot => (
              <div key={slot.id} id={`slot-${slot.id}`} className="border border-gray-200 rounded-lg overflow-hidden scroll-mt-6">
                {/* Slot Header */}
                <div className="bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {slot.title}
                    </span>
                    <button
                      onClick={() => toggleSlot(slot.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
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
                  <div className="p-4 bg-white">
                    {/* Questions Section */}
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">QUESTION</h4>
                      <div className="space-y-2">
                        {slot.questions.map(question => (
                          <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-sm text-[#0A1B3C]">{question.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded ${question.status === 'custom'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                                }`}>
                                {question.status === 'custom' ? 'Custom' : 'Finished'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assignments Section */}
                    {slot.assignments.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">ASSIGNMENT</h4>
                        <div className="space-y-2">
                          {slot.assignments.map(assignment => (
                            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-pink-600" />
                                </div>
                                <span className="text-sm text-[#0A1B3C]">{assignment.title}</span>
                              </div>
                              <span className="text-sm text-gray-500">N/A</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Tests */}
        <div id="progress-tests" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0A1B3C] mb-4">Progress Tests</h2>
          <div className="space-y-3">
            {progressTests.map(test => (
              <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${test.status === 'completed' ? 'bg-green-100' :
                      test.status === 'available' ? 'bg-blue-100' :
                        'bg-gray-200'
                    }`}>
                    {test.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                      test.status === 'available' ? <Play className="w-5 h-5 text-blue-600" /> :
                        <Lock className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0A1B3C] text-sm">{test.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{test.questions} questions</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.duration} mins
                      </span>
                      {test.score !== null && (
                        <>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs font-semibold text-green-600">Score: {test.score}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${test.status === 'completed' ? 'bg-green-100 text-green-700' :
                      test.status === 'available' ? 'bg-[#F37022] text-white hover:bg-[#D96419]' :
                        'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  disabled={test.status === 'locked'}
                  onClick={() => test.status === 'available' && navigate('/student/quiz')}
                >
                  {test.status === 'completed' ? 'Review' :
                    test.status === 'available' ? 'Start Test' :
                      'Locked'}
                </button>
              </div>
            ))}
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
                onClick={() => scrollToSection('learning-materials')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'learning-materials'
                    ? 'bg-orange-50 text-[#F37022]'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Learning Materials
              </button>

              <button
                onClick={() => scrollToSection('slot-contents')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'slot-contents'
                    ? 'bg-orange-50 text-[#F37022]'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Slot Contents
              </button>

              <div className="pl-3 space-y-1">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => scrollToSection(`slot-${slot.id}`)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeSection === `slot-${slot.id}`
                        ? 'bg-orange-50 text-[#F37022]'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {slot.title}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollToSection('progress-tests')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'progress-tests'
                    ? 'bg-orange-50 text-[#F37022]'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Progress Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
