import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronRight, Search, Download, FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface StudentSubmission {
    submissionId: string;
    studentId: string;
    studentName: string;
    submittedAt?: Date;
    fileCount?: number;
    score?: number;
    status: 'submitted' | 'graded' | 'not_submitted';
}

function AssignmentSubmissionsList() {
    const navigate = useNavigate();
    const { assignmentId } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded' | 'not_submitted'>('all');

    // Mock assignment data
    const assignment = {
        id: assignmentId || '1',
        title: 'Lab 1: Introduction to React',
        courseCode: 'SE1801',
        courseName: 'Software Engineering',
        dueDate: new Date('2025-01-15'),
        maxScore: 100,
        submissionCount: 40,
        totalStudents: 45,
        averageScore: 85,
    };

    // Mock submissions
    const allSubmissions: StudentSubmission[] = [
        {
            submissionId: 's1',
            studentId: 'ST001',
            studentName: 'Trương Nguyễn Tiến Đạt',
            submittedAt: new Date('2025-01-10T14:30:00'),
            fileCount: 12,
            score: 85,
            status: 'graded',
        },
        {
            submissionId: 's2',
            studentId: 'ST002',
            studentName: 'Nguyễn Văn An',
            submittedAt: new Date('2025-01-12T10:00:00'),
            fileCount: 8,
            status: 'submitted',
        },
        {
            submissionId: 's3',
            studentId: 'ST003',
            studentName: 'Lê Thị Bình',
            submittedAt: new Date('2025-01-14T16:45:00'),
            fileCount: 15,
            score: 92,
            status: 'graded',
        },
        {
            submissionId: 's4',
            studentId: 'ST004',
            studentName: 'Phạm Minh Châu',
            status: 'not_submitted',
        },
        {
            submissionId: 's5',
            studentId: 'ST005',
            studentName: 'Hoàng Anh Dũng',
            submittedAt: new Date('2025-01-13T09:20:00'),
            fileCount: 10,
            status: 'submitted',
        },
    ];

    // Filter submissions
    const filteredSubmissions = allSubmissions.filter((sub) => {
        const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'graded':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'submitted':
                return <Clock className="w-5 h-5 text-orange-600" />;
            case 'not_submitted':
                return <XCircle className="w-5 h-5 text-red-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'graded':
                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Graded</span>;
            case 'submitted':
                return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Pending</span>;
            case 'not_submitted':
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Not Submitted</span>;
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate('/teacher/classrooms')} className="hover:text-[#F37022] transition-colors">
                    My Classes
                </button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate(`/teacher/course-details/${assignment.courseCode}`)} className="hover:text-[#F37022] transition-colors">
                    {assignment.courseName}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Submissions</span>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-3">{assignment.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Due: {assignment.dueDate.toLocaleDateString()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded">
                        {assignment.submissionCount}/{assignment.totalStudents} submitted
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded">Avg: {assignment.averageScore}/100</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none"
                        >
                            <option value="all">All</option>
                            <option value="graded">Graded</option>
                            <option value="submitted">Pending</option>
                            <option value="not_submitted">Not Submitted</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Submitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSubmissions.map((submission) => (
                                <tr
                                    key={submission.submissionId}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        if (submission.status !== 'not_submitted') {
                                            navigate(`/teacher/assignment-review/${submission.submissionId}`);
                                        }
                                    }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(submission.status)}
                                            <div>
                                                <div className="font-medium text-gray-900">{submission.studentName}</div>
                                                <div className="text-sm text-gray-500">{submission.studentId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {submission.submittedAt ? submission.submittedAt.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {submission.score !== undefined ? (
                                            <span className="font-semibold text-blue-600">
                                                {submission.score}/{assignment.maxScore}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(submission.status)}</td>
                                    <td className="px-6 py-4">
                                        {submission.status !== 'not_submitted' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/teacher/assignment-review/${submission.submissionId}`);
                                                }}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Review
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSubmissions.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default AssignmentSubmissionsList;
