import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronRight, Search, FileText, Calendar, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { useGetAssignmentByIdQuery } from '@/api/assignmentsApi';
import { useGetStudentAssignmentsByAssignmentIdQuery } from '@/api/studentAssignmentsApi';
import { useGetClassSubjectByIdQuery, useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';

interface StudentSubmission {
    submissionId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    submittedAt?: Date;
    score?: number;
    status: 'submitted' | 'graded' | 'not_submitted';
}

function AssignmentSubmissionsList() {
    const navigate = useNavigate();
    const { assignmentId } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded' | 'not_submitted'>('all');

    // API Queries
    const { data: assignmentData, isLoading: isLoadingAssignment, isFetching: isFetchingAssignment } = useGetAssignmentByIdQuery(assignmentId || '', {
        skip: !assignmentId,
    });

    const { data: submissionsData, isLoading: isLoadingSubmissions, isFetching: isFetchingSubmissions } = useGetStudentAssignmentsByAssignmentIdQuery(assignmentId || '', {
        skip: !assignmentId,
    });

    const { data: classSubjectData } = useGetClassSubjectByIdQuery(assignmentData?.classSubjectId || '', {
        skip: !assignmentData?.classSubjectId,
    });

    const { data: studentsData, isLoading: isLoadingStudents, isFetching: isFetchingStudents } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: assignmentData?.classSubjectId || '', pageSize: 200 },
        { skip: !assignmentData?.classSubjectId }
    );

    // Process and combine data
    const allSubmissions = useMemo(() => {
        if (!studentsData?.items) return [];

        const submissionsMap = new Map();
        submissionsData?.items?.forEach((sub) => {
            submissionsMap.set(sub.studentId, sub);
        });

        return studentsData.items.map((student): StudentSubmission => {
            const submission = submissionsMap.get(student.studentId);
            
            let status: StudentSubmission['status'] = 'not_submitted';
            if (submission) {
                // Status 1: Submitted, 2: Graded
                status = (submission.status === 2 || submission.status === 1) ? (submission.status === 2 ? 'graded' : 'submitted') : 'not_submitted';
            }

            return {
                submissionId: submission?.id || `no-sub-${student.studentId}`,
                studentId: student.studentId,
                studentCode: student.studentCode || '',
                studentName: student.studentName || 'Unknown Student',
                submittedAt: submission?.createdAt ? new Date(submission.createdAt) : undefined,
                score: submission?.grade,
                status,
            };
        });
    }, [studentsData, submissionsData]);

    // Statistics
    const stats = useMemo(() => {
        const total = allSubmissions.length;
        const submitted = allSubmissions.filter(s => s.status !== 'not_submitted').length;
        const graded = allSubmissions.filter(s => s.status === 'graded').length;
        const totalScore = allSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const average = graded > 0 ? (totalScore / graded).toFixed(1) : '0';

        return { total, submitted, graded, average };
    }, [allSubmissions]);

    // Filter submissions
    const filteredSubmissions = allSubmissions.filter((sub) => {
        const matchesSearch = 
            sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
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

    if (isLoadingAssignment || isLoadingSubmissions || isLoadingStudents || isFetchingSubmissions || isFetchingStudents || isFetchingAssignment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-[#F37022] animate-spin" />
                <p className="text-gray-500 font-medium">Loading submissions...</p>
            </div>
        );
    }

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
                <button 
                    onClick={() => navigate(`/teacher/course-details/${assignmentData?.classSubjectId}`)} 
                    className="hover:text-[#F37022] transition-colors"
                >
                    {classSubjectData?.subjectName || 'Course'}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Submissions</span>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-3">
                    {assignmentData?.displayName || `Assignment ${assignmentData?.instanceNumber || ''}`}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Due: {assignmentData?.dueDate ? new Date(assignmentData.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded">
                        {stats.submitted}/{stats.total} submitted
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded">Avg: {stats.average}/10</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or ID..."
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                                                <div className="text-sm text-gray-500">{submission.studentCode}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {submission.submittedAt ? submission.submittedAt.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {submission.score !== undefined ? (
                                            <span className="font-semibold text-blue-600">
                                                {submission.score}/10
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
                    <div className="text-center py-12 bg-gray-50">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">No submissions found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AssignmentSubmissionsList;
