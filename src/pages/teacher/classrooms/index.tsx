import { useState } from 'react';
import { BookOpen, Users, Clock, MapPin, FileText, Plus, Search, Filter, MoreHorizontal, MessageSquare, Send, ChevronDown, ChevronRight } from 'lucide-react';
import DataTable from '../../../components/shared/DataTable';

interface Class {
    id: string;
    name: string;
    schedule: string;
    room: string;
    studentCount: number;
}

interface Course {
    id: number;
    code: string;
    name: string;
    semester: string;
    classes: Class[];
}

interface Student {
    id: number;
    code: string;
    name: string;
    email: string;
    attendance: string;
}

interface Assignment {
    id: number;
    title: string;
    dueDate: string;
    submitted: number;
    total: number;
    status: string;
}

function TeacherClassrooms() {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'create'>('students');
    const [semester, setSemester] = useState('SPRING2025');

    const courses: Course[] = [
        {
            id: 1,
            code: 'SWE101',
            name: 'Software Engineering',
            semester: 'Spring2025',
            classes: [
                { id: 'a', name: 'SE1801', schedule: 'Mon, Wed 8:00 - 10:00', room: 'Room 301', studentCount: 45 },
                { id: 'b', name: 'SE1802', schedule: 'Mon, Wed 2:00 - 4:00', room: 'Room 302', studentCount: 42 },
                { id: 'c', name: 'SE1803', schedule: 'Tue, Thu 8:00 - 10:00', room: 'Room 303', studentCount: 38 },
            ]
        },
        {
            id: 2,
            code: 'DBS202',
            name: 'Database Systems',
            semester: 'Spring2025',
            classes: [
                { id: 'a', name: 'DB1801', schedule: 'Tue, Thu 10:00 - 12:00', room: 'Room 205', studentCount: 40 },
                { id: 'b', name: 'DB1802', schedule: 'Wed, Fri 9:00 - 11:00', room: 'Room 206', studentCount: 38 },
            ]
        },
        {
            id: 3,
            code: 'WEB301',
            name: 'Web Development',
            semester: 'Spring2025',
            classes: [
                { id: 'a', name: 'WE1801', schedule: 'Wed, Fri 2:00 - 4:00', room: 'Room 402', studentCount: 42 },
            ]
        },
    ];

    const students: Student[] = [
        { id: 1, code: 'SE140001', name: 'Nguyen Van A', email: 'vana@fpt.edu.vn', attendance: '95%' },
        { id: 2, code: 'SE140002', name: 'Tran Thi B', email: 'thib@fpt.edu.vn', attendance: '88%' },
        { id: 3, code: 'SE140003', name: 'Le Van C', email: 'vanc@fpt.edu.vn', attendance: '92%' },
    ];

    const assignments: Assignment[] = [
        { id: 1, title: 'Lab 1: Introduction to React', dueDate: '2025-01-15', submitted: 40, total: 45, status: 'Active' },
        { id: 2, title: 'Assignment 2: Database Design', dueDate: '2025-01-20', submitted: 35, total: 45, status: 'Active' },
        { id: 3, title: 'Project Proposal', dueDate: '2025-01-10', submitted: 45, total: 45, status: 'Closed' },
    ];

    const studentColumns = [
        { header: 'Student Code', accessor: 'code' as keyof Student, sortable: true },
        { header: 'Name', accessor: 'name' as keyof Student, sortable: true },
        { header: 'Email', accessor: 'email' as keyof Student, sortable: true },
        {
            header: 'Attendance',
            accessor: 'attendance' as keyof Student,
            sortable: true,
            align: 'center' as const,
            render: (item: Student) => (
                <span className="font-semibold text-[#0A1B3C]">{item.attendance}</span>
            )
        },
    ];

    const handleClassSelect = (course: Course, classItem: Class) => {
        setSelectedCourse(course);
        setSelectedClass(classItem);
    };

    return (
        <div className="flex flex-col p-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Classes</h1>
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
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search classes..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022]"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Left Panel - Course & Class List */}
                <div className="w-[320px] flex flex-col border-r border-gray-200 pr-4">
                    <div className="space-y-2 pb-4">
                        {courses.map((course) => (
                            <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Course Header */}
                                <button
                                    onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">{course.code}</span>
                                                <span className="text-sm font-bold text-[#0A1B3C]">{course.name}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{course.classes.length} {course.classes.length > 1 ? 'classes' : 'class'}</div>
                                        </div>
                                        {expandedCourse === course.id ? (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded Classes */}
                                {expandedCourse === course.id && (
                                    <div className="bg-white">
                                        {course.classes.map((classItem) => (
                                            <button
                                                key={classItem.id}
                                                onClick={() => handleClassSelect(course, classItem)}
                                                className={`w-full text-left p-3 border-t border-gray-100 hover:bg-gray-50 transition-all ${selectedClass?.id === classItem.id && selectedCourse?.id === course.id
                                                    ? 'bg-orange-50 border-l-4 border-l-[#F37022]'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="text-xs text-gray-500 font-semibold mb-1">{classItem.schedule.split(' ')[0] + ' ' + classItem.schedule.split(' ')[1]}</div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold text-[#0A1B3C]">{classItem.name}</h3>
                                                    {selectedClass?.id === classItem.id && selectedCourse?.id === course.id && (
                                                        <div className="w-2 h-2 rounded-full bg-[#F37022]"></div>
                                                    )}
                                                </div>
                                                <div className="inline-block px-2 py-0.5 rounded border border-[#F37022] text-[#F37022] text-[10px] font-medium mb-2">
                                                    {classItem.room}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">{classItem.studentCount} students</span>
                                                    <div className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                        Active
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Class Details */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {selectedClass && selectedCourse ? (
                        <>
                            {/* Class Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#F37022] flex items-center gap-2">
                                            {selectedCourse.code} - {selectedClass.name}
                                            <span className="w-2 h-2 rounded-full bg-[#F37022]"></span>
                                        </h2>
                                        <div className="text-xs text-gray-400 mt-1">{selectedCourse.name} • {selectedCourse.semester}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-1">
                                            Status: <span className="text-green-600">Ongoing</span>
                                        </div>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-6">
                                    <div>
                                        <div className="mb-4">
                                            <span className="text-xs font-bold text-[#0A1B3C] block mb-1">Subject:</span>
                                            <span className="text-sm text-gray-600">{selectedClass.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-[#0A1B3C] block mb-1">Schedule:</span>
                                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {selectedClass.schedule}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-4">
                                            <span className="text-xs font-bold text-[#0A1B3C] block mb-1">Location:</span>
                                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {selectedClass.room}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-[#0A1B3C] block mb-1">Students:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">{selectedClass.studentCount} enrolled</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="text-xs text-[#F37022] cursor-pointer hover:underline">View list</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-xs font-bold text-[#0A1B3C] mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">
                                        This course covers the fundamentals of {selectedClass.name}, including key concepts, methodologies, and practical applications.
                                    </p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-100 px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => setActiveTab('students')}
                                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'students'
                                                ? 'border-[#F37022] text-[#F37022]'
                                                : 'border-transparent text-gray-500 hover:text-[#0A1B3C]'
                                                }`}
                                        >
                                            Student List
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = `/teacher/course-details/${selectedClass.name}`}
                                        className="px-4 py-2 bg-[#F37022] text-white text-sm font-medium rounded-lg hover:bg-[#D96419] transition-colors"
                                    >
                                        Course Management
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                {activeTab === 'students' && (
                                    <div>
                                        <DataTable
                                            title="Class Students"
                                            columns={studentColumns}
                                            data={students}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                <BookOpen className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0A1B3C] mb-1">No Class Selected</h3>
                            <p className="text-sm text-gray-500">Select a class from the list to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

export default TeacherClassrooms;
