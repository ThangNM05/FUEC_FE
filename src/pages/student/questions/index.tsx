import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Search,
    Filter,
    FileText,
    Sparkles,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface Question {
    id: string;
    slotId: string;
    courseCode: string;
    courseName: string;
    slotNumber: number;
    title: string;
    type: 'discussion' | 'assignment';
    status: 'finished' | 'custom' | 'pending';
    deadline?: Date;
    lastActivity: string;
    commentsCount: number;
    hasAIFeedback: boolean;
    slotTime: string;
}

function StudentQuestions() {
    const navigate = useNavigate();
    const [semester, setSemester] = useState('SPRING2025');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'finished' | 'custom' | 'pending'>('all');

    // Mock questions data from Slot Contents
    const allQuestions: Question[] = [
        {
            id: '1',
            slotId: 'slot-1',
            courseCode: 'PRN212',
            courseName: 'Mobile Programming',
            slotNumber: 1,
            title: 'What is android?',
            type: 'discussion',
            status: 'finished',
            slotTime: '12:30 10/09/2025 - 14:45 10/09/2025',
            lastActivity: '2 hours ago',
            commentsCount: 12,
            hasAIFeedback: true
        },
        {
            id: '2',
            slotId: 'slot-1',
            courseCode: 'PRN212',
            courseName: 'Mobile Programming',
            slotNumber: 1,
            title: 'What is Android Structure?',
            type: 'discussion',
            status: 'finished',
            slotTime: '12:30 10/09/2025 - 14:45 10/09/2025',
            lastActivity: '3 hours ago',
            commentsCount: 8,
            hasAIFeedback: true
        },
        {
            id: '3',
            slotId: 'slot-1',
            courseCode: 'PRN212',
            courseName: 'Mobile Programming',
            slotNumber: 1,
            title: 'Explain android activity life cycle?',
            type: 'discussion',
            status: 'custom',
            slotTime: '12:30 10/09/2025 - 14:45 10/09/2025',
            lastActivity: '5 hours ago',
            commentsCount: 15,
            hasAIFeedback: false
        },
        {
            id: '4',
            slotId: 'slot-2',
            courseCode: 'SWE201',
            courseName: 'Software Engineering',
            slotNumber: 2,
            title: 'Explain the SOLID principles',
            type: 'discussion',
            status: 'finished',
            deadline: new Date('2025-10-15'),
            slotTime: '14:45 10/10/2025 - 17:00 10/10/2025',
            lastActivity: '1 day ago',
            commentsCount: 20,
            hasAIFeedback: true
        },
        {
            id: '5',
            slotId: 'slot-3',
            courseCode: 'DBM301',
            courseName: 'Database Management',
            slotNumber: 3,
            title: 'What is database normalization?',
            type: 'discussion',
            status: 'pending',
            deadline: new Date('2025-10-20'),
            slotTime: '09:00 10/12/2025 - 11:15 10/12/2025',
            lastActivity: '2 days ago',
            commentsCount: 5,
            hasAIFeedback: false
        }
    ];

    const filteredQuestions = allQuestions.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.courseName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'finished':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'custom':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'pending':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'finished':
                return <CheckCircle className="w-4 h-4" />;
            case 'custom':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Questions</h1>
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
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus-within:border-[#F37022] transition-colors">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search questions by title or course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="outline-none text-sm text-[#0A1B3C] bg-transparent w-full"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="finished">Finished</option>
                        <option value="custom">Custom</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 animate-slideUp">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-xl font-bold text-[#0A1B3C]">{allQuestions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 animate-slideUp stagger-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Finished</p>
                            <p className="text-xl font-bold text-[#0A1B3C]">
                                {allQuestions.filter(q => q.status === 'finished').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 animate-slideUp stagger-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Custom</p>
                            <p className="text-xl font-bold text-[#0A1B3C]">
                                {allQuestions.filter(q => q.status === 'custom').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 animate-slideUp stagger-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">AI Reviewed</p>
                            <p className="text-xl font-bold text-[#0A1B3C]">
                                {allQuestions.filter(q => q.hasAIFeedback).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No questions found</p>
                        <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredQuestions.map((question, index) => (
                        <div
                            key={question.id}
                            onClick={() => navigate(`/student/questions/${question.id}`)}
                            className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-[#F37022] hover:-translate-y-1 transition-all duration-300 group animate-slideUp"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Course Info */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-[#0066b3] bg-opacity-10 text-[#0066b3] text-xs font-semibold rounded-full">
                                            {question.courseCode}
                                        </span>
                                        <span className="text-sm text-gray-600">{question.courseName}</span>
                                        <span className="text-sm text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">Slot {question.slotNumber}</span>
                                    </div>

                                    {/* Question Title */}
                                    <h3 className="text-lg font-semibold text-[#0A1B3C] mb-2 group-hover:text-[#F37022] transition-colors">
                                        {question.title}
                                    </h3>

                                    {/* Metadata */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{question.slotTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{question.commentsCount} comments</span>
                                        </div>
                                        <span>Last activity: {question.lastActivity}</span>
                                    </div>
                                </div>

                                {/* Status & Badges */}
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusColor(question.status)}`}>
                                        {getStatusIcon(question.status)}
                                        {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                                    </div>

                                    {question.hasAIFeedback && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700 rounded-lg text-xs font-semibold">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            AI Reviewed
                                        </div>
                                    )}

                                    {question.type === 'assignment' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                                            <FileText className="w-3.5 h-3.5" />
                                            Assignment
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination or Load More could go here */}
            {filteredQuestions.length > 0 && (
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Showing {filteredQuestions.length} of {allQuestions.length} questions
                    </p>
                </div>
            )}
        </div>
    );
}

export default StudentQuestions;
