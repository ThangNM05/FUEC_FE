import { useState } from 'react';
import { BookOpen, Users, Clock, MapPin, FileText, Plus, Search, Filter, MoreHorizontal, MessageSquare, Send } from 'lucide-react';
import DataTable from '../../../components/shared/DataTable';

interface Class {
    id: number;
    code: string;
    name: string;
    schedule: string;
    room: string;
    studentCount: number;
    semester: string;
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
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'create'>('students');

    const classes: Class[] = [
        {
            id: 1,
            code: 'SE101',
            name: 'Software Engineering',
            schedule: 'Mon, Wed 8:00 - 10:00',
            room: 'Room 301',
            studentCount: 45,
            semester: 'Spring2025'
        },
        {
            id: 2,
            code: 'DBS202',
            name: 'Database Systems',
            schedule: 'Tue, Thu 10:00 - 12:00',
            room: 'Room 205',
            studentCount: 38,
            semester: 'Spring2025'
        },
        {
            id: 3,
            code: 'WEB301',
            name: 'Web Development',
            schedule: 'Wed, Fri 2:00 - 4:00',
            room: 'Room 402',
            studentCount: 42,
            semester: 'Spring2025'
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
                <span className="font-semibold text-gray-900">{item.attendance}</span>
            )
        },
    ];

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search classes..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022]"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Filter:</span>
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button className="px-3 py-1 text-xs font-medium text-gray-600 rounded hover:bg-white hover:shadow-sm">All</button>
                            <button className="px-3 py-1 text-xs font-medium text-[#F37022] bg-white shadow-sm rounded">My Classes</button>
                        </div>
                        <button className="px-3 py-1.5 text-xs text-[#F37022] border border-[#F37022] rounded-full hover:bg-orange-50 font-medium">
                            Active
                        </button>
                        <button className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50">
                            Archived
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Panel - Class List */}
                <div className="w-[320px] flex flex-col border-r border-gray-200 pr-4 overflow-y-auto">
                    <div className="space-y-3 pb-4">
                        {classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className={`w-full text-left p-4 rounded-xl border transition-all relative ${selectedClass?.id === cls.id
                                    ? 'bg-gray-100 border-transparent'
                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="text-[10px] text-gray-500 font-medium mb-1">{cls.schedule.split(' ')[0] + ' ' + cls.schedule.split(' ')[1]}</div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg">{cls.code}</h3>
                                    {selectedClass?.id === cls.id && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                    )}
                                </div>
                                <div className="inline-block px-2 py-0.5 rounded border border-[#F37022] text-[#F37022] text-[10px] font-medium mb-3">
                                    {cls.room}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{cls.name}</span>
                                    <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        Active
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Class Details */}
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {selectedClass ? (
                        <>
                            {/* Class Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#F37022] flex items-center gap-2">
                                            {selectedClass.code} - {selectedClass.name}
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        </h2>
                                        <div className="text-xs text-gray-400 mt-1">{selectedClass.semester}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-1">
                                            Status: <span className="text-blue-600">Ongoing</span>
                                        </div>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-6">
                                    <div>
                                        <div className="mb-4">
                                            <span className="text-xs font-bold text-gray-900 block mb-1">Subject:</span>
                                            <span className="text-sm text-gray-600">{selectedClass.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-900 block mb-1">Schedule:</span>
                                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {selectedClass.schedule}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-4">
                                            <span className="text-xs font-bold text-gray-900 block mb-1">Location:</span>
                                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {selectedClass.room}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-900 block mb-1">Students:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">{selectedClass.studentCount} enrolled</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="text-xs text-blue-600 cursor-pointer hover:underline">View list</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-xs font-bold text-gray-900 mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">
                                        This course covers the fundamentals of {selectedClass.name}, including key concepts, methodologies, and practical applications.
                                    </p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-100 px-6">
                                <div className="flex gap-6">
                                    <button
                                        onClick={() => setActiveTab('students')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'students'
                                            ? 'border-[#F37022] text-[#F37022]'
                                            : 'border-transparent text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        Student List
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('assignments')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assignments'
                                            ? 'border-[#F37022] text-[#F37022]'
                                            : 'border-transparent text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        Assignments
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'create'
                                            ? 'border-[#F37022] text-[#F37022]'
                                            : 'border-transparent text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        Create Assignment
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

                                {activeTab === 'assignments' && (
                                    <div className="space-y-4">
                                        {assignments.map((assignment) => (
                                            <div key={assignment.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 bg-indigo-50 rounded-lg">
                                                                <FileText className="w-5 h-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 text-sm">{assignment.title}</h3>
                                                                <span className={`inline-flex items-center px-2 py-0.5 mt-1 text-[10px] font-medium rounded-full ${assignment.status === 'Active'
                                                                    ? 'bg-green-50 text-green-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {assignment.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pl-11">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span>Due: {assignment.dueDate}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Users className="w-3.5 h-3.5" />
                                                                <span>{assignment.submitted}/{assignment.total} submitted</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'create' && (
                                    <div className="max-w-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-gray-900">New Assignment Details</h3>
                                        </div>
                                        <form className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Assignment Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Lab 3: React Hooks"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Assignment description..."
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Due Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Max Score</label>
                                                    <input
                                                        type="number"
                                                        placeholder="100"
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Assign To</label>
                                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input type="checkbox" checked disabled className="w-5 h-5 text-[#F37022] rounded focus:ring-[#F37022] border-gray-300" />
                                                        <span className="text-sm font-medium text-gray-700">{selectedClass.code} - {selectedClass.name}</span>
                                                    </label>
                                                    {classes.filter(c => c.id !== selectedClass.id).map((cls) => (
                                                        <label key={cls.id} className="flex items-center gap-3 cursor-pointer group">
                                                            <input type="checkbox" className="w-5 h-5 text-[#F37022] rounded focus:ring-[#F37022] border-gray-300" />
                                                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{cls.code} - {cls.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                                <button
                                                    type="submit"
                                                    className="flex items-center gap-2 px-6 py-3 bg-[#F37022] text-white font-bold text-sm rounded-xl hover:bg-[#D96419] transition-all shadow-sm hover:shadow"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    Create Assignment
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                <BookOpen className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No Class Selected</h3>
                            <p className="text-sm text-gray-500">Select a class from the list to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherClassrooms;
